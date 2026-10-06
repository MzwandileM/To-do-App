const taskForm = document.querySelector(".todo_form");
const taskTitle = document.getElementById("task_title");
const addTaskBtn = document.getElementById("add_task");
const taskList = document.getElementById("taskList");
const statusButtons = document.querySelectorAll(".status_btn button");
const notesBtn = document.getElementById("notesBtn");
const notesContainer = document.getElementById("notesContainer");

let tasks = [];
let notes = [];
let editingId = null;
let editingType = null;
let currentFilter = "todo";
let currentView = "tasks";

// ======================================================
// GET DESCRIPTION / NOTE FIELD
// ======================================================

function getTaskDesc() {
  return document.getElementById("task_desc");
}

// ======================================================
// ESCAPE USER CONTENT
// ======================================================

function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ======================================================
// LOAD TASKS
// ======================================================

function loadTasks() {
  const savedTasks = localStorage.getItem("tasks");
  if (savedTasks) {
    tasks = JSON.parse(savedTasks);
  }
  displayTask();
}

// ======================================================
// SAVE TASKS
// ======================================================

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// ======================================================
// LOAD NOTES
// ======================================================

function loadNotes() {
  const savedNotes = localStorage.getItem("notes");
  if (savedNotes) {
    notes = JSON.parse(savedNotes);
    let updated = false;
    notes.forEach((note) => {
      if (!note.createdAt) {
        note.createdAt = new Date().toISOString();
        updated = true;
      }
    });
    if (updated) {
      saveNotes();
    }
  }
  displayNotes();
}

// ======================================================
// SAVE NOTES
// ======================================================

function saveNotes() {
  localStorage.setItem("notes", JSON.stringify(notes));
}

// ======================================================
// DISPLAY TASKS
// ======================================================

function displayTask() {
  updateTaskCounts();
  const filteredTasks = tasks.filter((task) => {
    return task.status === currentFilter;
  });
  if (filteredTasks.length === 0) {
    const label =
      currentFilter === "todo"
        ? "to do"
        : currentFilter === "active"
          ? "in progress"
          : "completed";
    taskList.innerHTML = `
            <li class="empty_state">
                No ${label} tasks.
            </li>
        `;
    return;
  }
  let taskDisplay = "";
  filteredTasks.forEach((task) => {
    let completedDate = "";
    if (task.completedAt) {
      completedDate = new Date(task.completedAt).toLocaleString();
    }
    taskDisplay += `
            <li
                data-id="${task.id}"
                class="${task.status === "completed" ? "completed" : ""}"
            >
                <div class="task_title">
                    ${escapeHTML(task.taskTitle)}
                </div>
                <div class="task_desc">
                    ${escapeHTML(task.taskDesc)}
                </div>
                ${
                  task.status === "completed"
                    ? `
                            <div class="completion_date">
                                Completed: ${completedDate}
                            </div>
                        `
                    : ""
                }
                <div class="task_actions">
                    ${
                      task.status === "todo"
                        ? `
                                <button
                                    class="action-btn"
                                    data-action="active"
                                    title="Move to in progress"
                                >
                                    ✓
                                </button>
                            `
                        : ""
                    }
                    ${
                      task.status === "active"
                        ? `
                                <button
                                    class="action-btn"
                                    data-action="complete"
                                    title="Complete task"
                                >
                                    ✓
                                </button>
                            `
                        : ""
                    }
                    ${
                      task.status === "completed"
                        ? `
                                <button
                                    class="action-btn"
                                    data-action="active"
                                    title="Move back to in progress"
                                >
                                    ↩
                                </button>
                            `
                        : ""
                    }
                    <button
                        class="action-btn edit-btn"
                        data-action="edit"
                        title="Edit task"
                    >
                        ✎
                    </button>
                    <button
                        class="action-btn delete-btn"
                        data-action="delete"
                        title="Delete task"
                    >
                        🗑
                    </button>
                </div>
            </li>
        `;
  });
  taskList.innerHTML = taskDisplay;
}

// ======================================================
// UPDATE TASK COUNTS
// ======================================================

function updateTaskCounts() {
  const todoCount = tasks.filter((task) => {
    return task.status === "todo";
  }).length;
  const activeCount = tasks.filter((task) => {
    return task.status === "active";
  }).length;
  const completedCount = tasks.filter((task) => {
    return task.status === "completed";
  }).length;
  document.querySelector('[data-status="todo"] .task_count').textContent =
    todoCount;
  document.querySelector('[data-status="active"] .task_count').textContent =
    activeCount;
  document.querySelector('[data-status="completed"] .task_count').textContent =
    completedCount;
}
// ======================================================
// UPDATE NOTES COUNTS
// ======================================================
function updateNoteCount() {
  document.querySelector("#notesBtn .task_count").textContent = notes.length;
}

// ======================================================
// DISPLAY NOTES
// ======================================================

function displayNotes() {
  updateNoteCount();

  if (notes.length === 0) {
    notesContainer.innerHTML = `
            <div class="empty_state">
                No notes yet.
            </div>
        `;
    return;
  }

  let notesDisplay = "";

  notes.forEach((note) => {
    const noteDate = note.createdAt
      ? new Date(note.createdAt).toLocaleDateString()
      : "No date";
    notesDisplay += `
            <div
                class="note_card"
                data-id="${note.id}"
            >
                <div class="note_header">
                    <h3>
                        ${escapeHTML(note.title)}
                    </h3>
                </div>
                <div class="note_content">
                    ${note.content
                      .split("\n")
                      .map((line) => {
                        return `<div>${escapeHTML(line)}</div>`;
                      })
                      .join("")}
                </div>
                <div class="note_actions">
                    <span class="note_date">
                        Created: ${noteDate}
                    </span>
                    <div class="note_buttons">
                        <button
                            data-note-action="edit"
                            title="Edit note"
                        >
                            ✎
                        </button>
                        <button
                            data-note-action="delete"
                            title="Delete note"
                        >
                            🗑
                        </button>
                    </div>
                </div>
            </div>
        `;
  });
  notesContainer.innerHTML = notesDisplay;
}

// ======================================================
// SWITCH INPUT / TEXTAREA
// ======================================================

function updateDescriptionField() {
  const currentField = document.getElementById("task_desc");
  if (currentView === "notes") {
    if (currentField.tagName === "TEXTAREA") {
      return;
    }
    const textarea = document.createElement("textarea");
    textarea.id = "task_desc";
    textarea.placeholder = "Write your note...";
    textarea.rows = 4;
    currentField.replaceWith(textarea);
  } else {
    if (currentField.tagName === "INPUT") {
      return;
    }
    const input = document.createElement("input");
    input.type = "text";
    input.id = "task_desc";
    input.placeholder = "Add details....";
    currentField.replaceWith(input);
  }
}

// ======================================================
// UPDATE FORM
// ======================================================

function updateFormForCurrentView() {
  const descriptionLabel = document.querySelector('label[for="task_desc"]');
  if (currentView === "notes") {
    descriptionLabel.textContent = "Note";
    taskTitle.placeholder = "Note title";
    addTaskBtn.textContent =
      editingType === "note" ? "Update Note" : "Add Note";
  } else {
    descriptionLabel.textContent = "Description";
    taskTitle.placeholder = "What's needs to be done";
    addTaskBtn.textContent =
      editingType === "task" ? "Update Task" : "Add Task";
  }
  updateDescriptionField();
}

// ======================================================
// HANDLE FORM SUBMIT
// ======================================================

function handleFormSubmit(event) {
  event.preventDefault();
  const title = taskTitle.value.trim();
  const description = getTaskDesc().value.trim();
  if (title === "" || description === "") {
    return;
  }
  // UPDATE EXISTING ITEM
  if (editingId !== null) {
    if (editingType === "task") {
      const task = tasks.find((task) => {
        return task.id === editingId;
      });
      if (task) {
        task.taskTitle = title;
        task.taskDesc = description;
      }
      saveTasks();
      displayTask();
    }
    if (editingType === "note") {
      const note = notes.find((note) => {
        return note.id === editingId;
      });
      if (note) {
        note.title = title;
        note.content = description;
      }
      saveNotes();
      displayNotes();
    }
    editingId = null;
    editingType = null;
  }

  // CREATE NEW ITEM
  else {
    if (currentView === "tasks") {
      const newTask = {
        id: crypto.randomUUID(),
        taskTitle: title,
        taskDesc: description,
        status: "todo",
        completedAt: null,
      };
      tasks.push(newTask);
      saveTasks();
      displayTask();
    }
    if (currentView === "notes") {
      const newNote = {
        id: crypto.randomUUID(),
        title: title,
        content: description,
        createdAt: new Date().toISOString(),
      };
      notes.push(newNote);
      saveNotes();
      displayNotes();
    }
  }
  clearForm();
  updateFormForCurrentView();
}

// ======================================================
// CLEAR FORM
// ======================================================

function clearForm() {
  taskTitle.value = "";
  getTaskDesc().value = "";
  taskTitle.focus();
}

// ======================================================
// EDIT TASK
// ======================================================

function editTask(id) {
  const task = tasks.find((task) => {
    return task.id === id;
  });
  if (!task) {
    return;
  }
  currentView = "tasks";
  editingId = id;
  editingType = "task";
  updateDescriptionField();
  taskTitle.value = task.taskTitle;
  getTaskDesc().value = task.taskDesc;
  addTaskBtn.textContent = "Update Task";
  taskTitle.focus();
}

// ======================================================
// DELETE TASK
// ======================================================

function removeTask(id) {
  tasks = tasks.filter((task) => {
    return task.id !== id;
  });
  saveTasks();
  displayTask();
}

// ======================================================
// CHANGE TASK STATUS
// ======================================================

function changeTaskStatus(id, newStatus) {
  const task = tasks.find((task) => {
    return task.id === id;
  });
  if (!task) {
    return;
  }
  task.status = newStatus;
  if (newStatus === "completed") {
    task.completedAt = new Date().toISOString();
  }
  if (newStatus !== "completed") {
    task.completedAt = null;
  }
  saveTasks();
  displayTask();
}

// ======================================================
// EDIT NOTE
// ======================================================

function editNote(id) {
  const note = notes.find((note) => {
    return note.id === id;
  });
  if (!note) {
    return;
  }
  currentView = "notes";
  editingId = id;
  editingType = "note";
  updateDescriptionField();
  taskTitle.value = note.title;
  getTaskDesc().value = note.content;
  addTaskBtn.textContent = "Update Note";
  taskTitle.focus();
}

// ======================================================
// DELETE NOTE
// ======================================================

function deleteNote(id) {
  notes = notes.filter((note) => {
    return note.id !== id;
  });
  saveNotes();
  displayNotes();
}

// ======================================================
// TASK ACTIONS
// ======================================================

taskList.addEventListener("click", function (event) {
  const button = event.target.closest("[data-action]");
  if (!button) {
    return;
  }
  const taskElement = button.closest("li");
  if (!taskElement) {
    return;
  }
  const taskId = taskElement.dataset.id;
  const action = button.dataset.action;
  if (action === "active") {
    changeTaskStatus(taskId, "active");
  }
  if (action === "complete") {
    changeTaskStatus(taskId, "completed");
  }
  if (action === "edit") {
    editTask(taskId);
  }
  if (action === "delete") {
    removeTask(taskId);
  }
});

// ======================================================
// NOTE ACTIONS
// ======================================================

notesContainer.addEventListener("click", function (event) {
  const button = event.target.closest("[data-note-action]");
  if (!button) {
    return;
  }
  const noteElement = button.closest(".note_card");
  if (!noteElement) {
    return;
  }
  const noteId = noteElement.dataset.id;
  const action = button.dataset.noteAction;
  if (action === "edit") {
    editNote(noteId);
  }
  if (action === "delete") {
    deleteNote(noteId);
  }
});

// ======================================================
// STATUS FILTER
// ======================================================

statusButtons.forEach((button) => {
  button.addEventListener("click", function () {
    currentView = "tasks";
    currentFilter = this.dataset.status;
    statusButtons.forEach((btn) => {
      btn.classList.remove("selected");
    });
    this.classList.add("selected");
    notesBtn.classList.remove("selected");
    taskList.style.display = "flex";
    notesContainer.style.display = "none";
    editingId = null;
    editingType = null;
    updateFormForCurrentView();
    clearForm();
    displayTask();
  });
});

// ======================================================
// NOTES BUTTON
// ======================================================

notesBtn.addEventListener("click", function () {
  currentView = "notes";
  taskList.style.display = "none";
  notesContainer.style.display = "flex";
  statusButtons.forEach((button) => {
    button.classList.remove("selected");
  });
  notesBtn.classList.add("selected");
  editingId = null;
  editingType = null;
  updateFormForCurrentView();
  clearForm();
  displayNotes();
});

// ======================================================
// FORM SUBMISSION
// ======================================================

taskForm.addEventListener("submit", handleFormSubmit);

// ======================================================
// INITIALIZE
// ======================================================

loadTasks();
loadNotes();
updateFormForCurrentView();
