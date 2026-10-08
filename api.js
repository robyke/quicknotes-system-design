const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadBtn = document.getElementById("load-btn");
const noteForm = document.getElementById("note-form");
const titleInput = document.getElementById("title-input");
const bodyInput = document.getElementById("body-input");
const submitBtn = document.getElementById("submit-btn");
const statusMessage = document.getElementById("status");
const notesList = document.getElementById("notes-list");

let notes = [];

async function request(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const data = response.status === 204 ? null : await response.json();

  return {
    data,
    status: response.status
  };
}

function showStatus(message, type = "") {
  statusMessage.textContent = message;
  statusMessage.className = type;
}

function renderNotes() {
  notesList.textContent = "";

  if (notes.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.textContent = "No notes to display.";
    emptyMessage.className = "empty-message";
    notesList.appendChild(emptyMessage);
    return;
  }

  notes.forEach((note) => {
    const item = document.createElement("li");
    item.className = "note-item";

    const title = document.createElement("h3");
    title.textContent = note.title;

    const body = document.createElement("p");
    body.textContent = note.body || "No body text.";

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteNote(note.id, deleteBtn));

    item.appendChild(title);
    item.appendChild(body);
    item.appendChild(deleteBtn);

    notesList.appendChild(item);
  });
}

async function loadNotes() {
  loadBtn.disabled = true;
  showStatus("Loading notes...", "loading");

  try {
    const result = await request(`${API_URL}?_limit=10`);

    notes = result.data;
    renderNotes();

    if (notes.length === 0) {
      showStatus("No notes were returned from the server.");
    } else {
      showStatus(
        `Loaded ${notes.length} notes from the server.`,
        "success"
      );
    }
  } catch (error) {
    notes = [];
    renderNotes();
    showStatus(
      "Sorry, the notes could not be loaded. Please try again.",
      "error"
    );
  } finally {
    loadBtn.disabled = false;
  }
}

async function createNote(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (title === "") {
    showStatus("A title is required.", "error");
    titleInput.focus();
    return;
  }

  if (title.length > 100) {
    showStatus("The title must be 100 characters or fewer.", "error");
    titleInput.focus();
    return;
  }

  submitBtn.disabled = true;
  showStatus("Creating note...", "loading");

  try {
    const result = await request(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        body,
        userId: 1
      })
    });

    const newNote = result.data;

    notes.unshift(newNote);
    renderNotes();

    noteForm.reset();

    showStatus(
      `Note created (status ${result.status}, id ${newNote.id}).`,
      "success"
    );
  } catch (error) {
    showStatus(
      "Sorry, the note could not be created. Please try again.",
      "error"
    );
  } finally {
    submitBtn.disabled = false;
  }
}

async function deleteNote(id, button) {
  button.disabled = true;
  showStatus("Deleting note...", "loading");

  try {
    await request(`${API_URL}/${id}`, {
      method: "DELETE"
    });

    /*
      JSONPlaceholder is a practice API and does not permanently store
      notes created with POST. We therefore remove the note from our
      local notes array after a successful DELETE response so the page
      behaves like a real application.
    */
    notes = notes.filter((note) => note.id !== id);
    renderNotes();

    showStatus("Note deleted successfully.", "success");
  } catch (error) {
    button.disabled = false;
    showStatus(
      "Sorry, the note could not be deleted. Please try again.",
      "error"
    );
  }
}

loadBtn.addEventListener("click", loadNotes);
noteForm.addEventListener("submit", createNote);

renderNotes();