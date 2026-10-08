# QuickNotes API Design

## Overview

This document describes the REST API for the real QuickNotes online service.

The API allows users to create accounts, manage notes, search notes and work with tags.

All API requests and responses use JSON.

## REST Endpoints

| Method | Path | Description | Success Status |
|---|---|---|---|
| POST | `/users` | Create a new user account | 201 Created |
| GET | `/notes` | List notes belonging to the logged-in user | 200 OK |
| GET | `/notes/{id}` | Get one note by its id | 200 OK |
| POST | `/notes` | Create a new note | 201 Created |
| PATCH | `/notes/{id}` | Update an existing note | 200 OK |
| DELETE | `/notes/{id}` | Delete a note | 204 No Content |
| GET | `/notes?search=word` | Search the user's notes | 200 OK |
| GET | `/tags` | List the user's tags | 200 OK |
| POST | `/tags` | Create a new tag | 201 Created |
| POST | `/notes/{id}/tags` | Add a tag to a note | 200 OK |

## Create a Note

### Request

**POST `/notes`**

Example request body:

```json
{
  "title": "Shopping list",
  "body": "Milk, bread and eggs"
}
```

### Response

Success status:

`201 Created`

Example response body:

```json
{
  "id": 42,
  "user_id": 7,
  "title": "Shopping list",
  "body": "Milk, bread and eggs",
  "created_at": "2026-10-08T12:00:00Z",
  "updated_at": "2026-10-08T12:00:00Z"
}
```

## List Notes

### Request

**GET `/notes`**

### Response

Success status:

`200 OK`

Example response body:

```json
{
  "notes": [
    {
      "id": 42,
      "title": "Shopping list",
      "body": "Milk, bread and eggs",
      "created_at": "2026-10-08T12:00:00Z",
      "updated_at": "2026-10-08T12:00:00Z"
    },
    {
      "id": 43,
      "title": "Study plan",
      "body": "Review databases and system design",
      "created_at": "2026-10-08T13:00:00Z",
      "updated_at": "2026-10-08T13:00:00Z"
    }
  ]
}
```

If the user has no notes, the API can return:

```json
{
  "notes": []
}
```

## Update a Note

**PATCH `/notes/{id}`**

Example request:

```json
{
  "title": "Updated shopping list",
  "body": "Milk, bread, eggs and fruit"
}
```

Success status:

`200 OK`

The server only allows the owner of the note to update it.

## Delete a Note

**DELETE `/notes/{id}`**

Success status:

`204 No Content`

The server only allows the owner of the note to delete it.

## Authentication

Protected endpoints require the user to be logged in.

The client sends an authentication token with the request.

Example:

```text
Authorization: Bearer <token>
```

The server uses the token to identify the user and ensures users can only access their own private notes.

## Error Status Codes

The API may return the following errors:

| Status | Meaning | Example |
|---|---|---|
| 400 Bad Request | The request contains invalid or missing data | Missing title |
| 401 Unauthorized | The user is not logged in or the token is invalid | Invalid token |
| 403 Forbidden | The user is authenticated but is not allowed to perform the action | Trying to edit another user's note |
| 404 Not Found | The requested resource does not exist | Note id does not exist |
| 500 Internal Server Error | An unexpected server error occurred | Database or server failure |

## Example Error Response

```json
{
  "error": {
    "status": 400,
    "message": "A title is required."
  }
}
```

Another example for a missing note:

```json
{
  "error": {
    "status": 404,
    "message": "Note not found."
  }
}
```

## Validation Rules

When creating or updating a note:

- The title is required.
- The title must be no more than 100 characters.
- The body is optional.
- User input must be validated before it is stored.
- Users may only read, change or delete their own notes.

## REST Design

The API uses nouns such as `/notes`, `/users` and `/tags` in its paths.

HTTP methods describe the action:

- `GET` reads data.
- `POST` creates data.
- `PATCH` updates data.
- `DELETE` removes data.

The API returns standard HTTP status codes so clients can clearly understand whether each request succeeded or failed.