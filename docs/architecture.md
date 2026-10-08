# QuickNotes Architecture

## Functional Requirements

QuickNotes should allow users to:

- create an account and sign in
- create notes
- view their notes
- edit notes
- delete notes
- search notes
- organize notes with tags
- access their notes from different devices

## Non-Functional Requirements

The system should:

- respond quickly to user requests
- remain available if one app server fails
- protect user data
- scale to 1 million registered users
- support many more reads than writes
- avoid losing notes
- allow monitoring through logs, metrics and alerts

## Load Estimate for 1 Million Users

Assumptions:

- 1,000,000 registered users
- 20% active each day
- 200,000 daily active users
- each active user creates 5 notes per day
- each active user loads notes 20 times per day
- each note uses about 500 bytes
- one day is rounded to 100,000 seconds
- peak traffic is about 5 times the average

### Writes

200,000 active users × 5 notes per day = 1,000,000 writes per day.

1,000,000 ÷ 100,000 seconds = about 10 writes per second on average.

Peak writes:

10 × 5 = about 50 writes per second.

### Reads

200,000 active users × 20 note loads per day = 4,000,000 reads per day.

4,000,000 ÷ 100,000 seconds = about 40 reads per second on average.

Peak reads:

40 × 5 = about 200 reads per second.

### Storage

1,000,000 new notes per day × 500 bytes = about 500 MB per day.

500 MB × 365 = about 182,500 MB per year.

That is about 182.5 GB per year, which can be rounded to about 180 GB per year.

## Read-Heavy or Write-Heavy

QuickNotes is read-heavy because users load notes about four times more often than they create notes.

The design should therefore use caching and database read replicas to reduce the number of reads handled by the primary database.

## Architecture Diagram

```text
                         +---------+
Users / Clients -------> |   DNS   |
                         +---------+
                              |
               static files   |
                              v
                    +------------------+
                    |       CDN        |
                    | HTML, CSS and JS |
                    +------------------+

Users / Clients
      |
      | HTTPS API requests
      v
+----------------------+
|    Load Balancer     |
+----------------------+
      |           |
      v           v
+-----------+ +-----------+
| App       | | App       |
| Server 1  | | Server 2  |
+-----------+ +-----------+
      |           |
      +-----+-----+
            |
            v
      +-----------+
      |   Cache   |
      |   Redis   |
      +-----------+
            |
      +-----+------+
      |            |
      v            v
+-----------+  +-------------+
| Primary   |  | Read Replica|
| Database  |->| Database    |
+-----------+  +-------------+
      |
      | background jobs
      v
+-----------+
|   Queue   |
+-----------+
      |
      v
+-----------+
|  Worker   |
+-----------+
```

## Component Explanations

### Client

The client is the user's browser or app and provides the interface for creating, reading, editing and deleting notes.

### DNS

DNS translates the QuickNotes domain name into the network address needed to reach the service.

### CDN

The CDN stores copies of static files such as HTML, CSS and JavaScript close to users so pages load faster and the main servers receive less traffic.

### Load Balancer

The load balancer spreads API requests across healthy app servers so no single server handles all traffic.

### App Servers

The app servers run the QuickNotes application logic, validate requests, authenticate users and communicate with the cache and database.

### Cache

Redis stores frequently requested note data in memory so repeated reads can be answered faster without querying the database every time.

### Primary Database

The primary database stores the main copy of the data and handles writes such as creating, editing and deleting notes.

### Read Replica

The read replica copies data from the primary database and handles read requests so the primary database has less work.

### Queue

The queue stores slow background jobs so app servers can respond to users without waiting for those jobs to finish.

### Worker

The worker takes jobs from the queue and performs background work such as sending emails or creating exports.

## GET /notes Flow

1. The client sends `GET /notes` over HTTPS.

2. The request reaches the load balancer.

3. The load balancer forwards the request to a healthy app server.

4. The app server checks the authentication token and identifies the user.

5. The app server checks Redis for a cache entry such as `notes:user:1`.

6. If the cache contains the notes, the app server returns them immediately.

7. If the cache does not contain the notes, the app server queries the read replica.

8. The read replica returns the user's notes.

9. The app server stores the result in Redis with a time to live.

10. The app server returns the notes to the client.

## POST /notes Flow

1. The client sends `POST /notes` with the note title and body.

2. The request reaches the load balancer.

3. The load balancer forwards the request to a healthy app server.

4. The app server checks authentication and validates the input.

5. The app server writes the new note to the primary database.

6. The primary database returns the new note record.

7. The app server invalidates the user's cached note list in Redis so stale data is not returned.

8. If background work is required, the app server adds a job to the queue.

9. The app server returns `201 Created` and the new note to the client.

10. The primary database copies the change to the read replica.

## Trade-Offs

### Speed versus Freshness

Caching makes note reads much faster and reduces database load, but cached information may become stale.

QuickNotes reduces this problem by deleting the user's cached note list whenever a note is created, edited or deleted.

### Simplicity versus Scalability

Running QuickNotes on one server would be simpler and cheaper.

Using multiple app servers, a load balancer, cache, replica and queue makes the system more scalable and reliable, but also makes it more complex to build and maintain.

### Consistency versus Availability

Read replicas may briefly contain slightly older data because replication takes time.

QuickNotes can accept a small delay for note-list reads because a short period of slightly stale data is less serious than the whole service becoming unavailable.

### Cost versus Reliability

Extra servers and database replicas cost more money, but they reduce the chance that one hardware or software failure takes the entire service offline.

## Avoiding Single Points of Failure

QuickNotes avoids relying on only one application server by placing multiple stateless app servers behind a load balancer.

If one app server fails, the load balancer can stop sending traffic to it and send requests to another healthy server.

The database uses a primary database with a read replica. If the primary fails, a replica can be promoted to become the new primary as part of a failover process.

Static files are distributed through a CDN instead of relying on one application server.

Background jobs are placed in a queue so temporary worker failures do not cause the jobs to disappear.

The system should also use backups, monitoring, health checks and alerts so failures can be detected and recovered from quickly.

## Monitoring

The system should collect logs, metrics and alerts.

Useful metrics include:

- requests per second
- error rate
- request latency
- CPU and memory usage
- cache hit rate
- database response time
- queue length

Alerts should notify engineers when important thresholds are exceeded, such as a high error rate or unusually slow responses.