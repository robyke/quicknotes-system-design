# QuickNotes System Design

## Description

QuickNotes System Design is a project that shows how a browser-based notes application could grow into a real online service for up to 1 million users.

The project has two main parts:

1. A working API client that uses the JSONPlaceholder practice API to demonstrate GET, POST and DELETE requests.
2. Backend design documents covering the QuickNotes REST API, database model and scalable system architecture.

## Features

The API client can:

- load 10 notes from JSONPlaceholder
- display loading, success, error and empty states
- create a note with a POST request
- validate note titles
- delete notes with a DELETE request
- disable buttons while requests are running
- safely display user text using `textContent`

## Project Structure

```text
quicknotes-system-design
├── index.html
├── style.css
├── api.js
├── README.md
└── docs
    ├── api-design.md
    ├── data-model.md
    └── architecture.md
```

## How to Run the API Client

1. Clone or download this repository.
2. Open the project folder in VS Code.
3. Open `index.html` in a browser.
4. You can also use the VS Code Live Server extension and choose **Open with Live Server**.
5. Click **Load notes** to request 10 notes from JSONPlaceholder.
6. Use the form to create a practice note.
7. Use the **Delete** buttons to remove notes from the page.

An internet connection is required because the project sends requests to:

`https://jsonplaceholder.typicode.com/posts`

## API Client

The API client uses:

- `GET` to load notes
- `POST` to create notes
- `DELETE` to remove notes
- `async` and `await`
- `fetch()`
- `try`, `catch` and `finally`
- input validation
- HTTP status checking with `response.ok`

JSONPlaceholder is a practice API and does not permanently store created or deleted notes. The application therefore updates its local notes array after successful requests so the page behaves like a real notes application.

## Design Documents

### API Design

[Read the API design document](docs/api-design.md)

This document describes the REST API that a real QuickNotes backend could provide, including endpoints, JSON examples, authentication, validation and HTTP error codes.

### Data Model

[Read the data model document](docs/data-model.md)

This document describes the `users`, `notes`, `tags` and `note_tags` tables, their relationships, SQL table definitions, example queries and indexes.

### Architecture

[Read the architecture document](docs/architecture.md)

This document explains how QuickNotes could scale to 1 million users using components such as DNS, a CDN, load balancer, multiple app servers, Redis cache, database replication, a queue and workers.

## What I Learned

Through this project I learned:

- how a front end communicates with an API using GET, POST and DELETE requests
- how to handle loading, success, error and empty states in a web application
- how to validate user input and safely display user text
- how to design REST API endpoints and choose suitable HTTP status codes
- how to model relational data using primary keys, foreign keys and join tables
- how caching, load balancing, read replicas and queues help a system scale
- how system design decisions involve trade-offs between speed, consistency, simplicity, reliability and cost

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Fetch API
- REST
- JSON
- SQL
- Git and GitHub

## Author

Robin Kinyua