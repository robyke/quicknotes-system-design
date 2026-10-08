# QuickNotes Data Model

## Overview

QuickNotes uses four main entities:

- users
- notes
- tags
- note_tags

The database is relational because the data has clear relationships between users, notes and tags.

## Users Table

The `users` table stores account information.

Columns:

| Column | Type | Rules |
|---|---|---|
| id | INTEGER | Primary key |
| name | TEXT | NOT NULL |
| email | TEXT | NOT NULL, UNIQUE |
| password_hash | TEXT | NOT NULL |
| created_at | TEXT | NOT NULL |

## Notes Table

The `notes` table stores notes created by users.

Columns:

| Column | Type | Rules |
|---|---|---|
| id | INTEGER | Primary key |
| user_id | INTEGER | NOT NULL, foreign key |
| title | TEXT | NOT NULL |
| body | TEXT | Optional |
| created_at | TEXT | NOT NULL |
| updated_at | TEXT | NOT NULL |

`user_id` references `users(id)`.

## Tags Table

The `tags` table stores tag names.

Columns:

| Column | Type | Rules |
|---|---|---|
| id | INTEGER | Primary key |
| user_id | INTEGER | NOT NULL, foreign key |
| name | TEXT | NOT NULL |
| created_at | TEXT | NOT NULL |

`user_id` references `users(id)`.

## Note Tags Table

The `note_tags` table connects notes and tags.

Columns:

| Column | Type | Rules |
|---|---|---|
| note_id | INTEGER | Foreign key |
| tag_id | INTEGER | Foreign key |

The combination of `note_id` and `tag_id` is the primary key so the same tag cannot be attached to the same note twice.

## Relationships

One user can have many notes, so the relationship between `users` and `notes` is one-to-many.

One user can also have many tags, so the relationship between `users` and `tags` is one-to-many.

A note can have many tags, and a tag can belong to many notes. This means notes and tags have a many-to-many relationship.

The `note_tags` table is needed as a join table to connect notes and tags.

## CREATE TABLE Statements

```sql
PRAGMA foreign_keys = ON;

CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE tags (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (user_id, name)
);

CREATE TABLE note_tags (
  note_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (note_id, tag_id),
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

## Example SQL Queries

### 1. Get all notes for one user

```sql
SELECT id, title, body, created_at, updated_at
FROM notes
WHERE user_id = 1
ORDER BY created_at DESC;
```

### 2. Get all tags attached to a note using JOIN

```sql
SELECT tags.id, tags.name
FROM tags
JOIN note_tags ON tags.id = note_tags.tag_id
WHERE note_tags.note_id = 42;
```

### 3. Get all notes with a specific tag

```sql
SELECT notes.id, notes.title, notes.body
FROM notes
JOIN note_tags ON notes.id = note_tags.note_id
JOIN tags ON tags.id = note_tags.tag_id
WHERE tags.name = 'work'
  AND notes.user_id = 1;
```

### 4. Count notes for each user

```sql
SELECT users.id, users.name, COUNT(notes.id) AS note_count
FROM users
LEFT JOIN notes ON users.id = notes.user_id
GROUP BY users.id, users.name;
```

## Indexes

I would add an index on `notes.user_id`:

```sql
CREATE INDEX idx_notes_user_id
ON notes(user_id);
```

This makes it faster to find all notes belonging to one user, which is one of the most common QuickNotes queries.

I would also add an index on `note_tags.tag_id`:

```sql
CREATE INDEX idx_note_tags_tag_id
ON note_tags(tag_id);
```

This helps the database find all notes connected to a particular tag.

## SQL or NoSQL

I would choose SQL for QuickNotes because the data is structured and has clear relationships between users, notes and tags. SQL supports primary keys, foreign keys, joins, unique rules and transactions, which help keep the data correct and consistent. QuickNotes also needs queries that connect notes to users and tags, so a relational SQL database is a good fit.