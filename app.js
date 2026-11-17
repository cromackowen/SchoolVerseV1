/* SchoolVerse front-end preview. Cloud services and AI are intentionally not connected yet. */
(() => {
  "use strict";
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const toast = $("#toast");
  let toastTimer;
  const notify = message => {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
  };

  const pageNames = {
    overview:"Overview", schoolhub:"SchoolHub", social:"Student Social",
    world:"Virtual World", ai:"SchoolVerse AI", locker:"Digital Locker",
    quizzes:"Quiz Battle", calendar:"Calendar"
  };

  function navigate(page) {
    if (!pageNames[page]) return;
    $$(".page").forEach(el => el.classList.toggle("active", el.id === `page-${page}`));
    $$(".nav").forEach(el => el.classList.toggle("active", el.dataset.page === page));
    $("#crumbName").textContent = pageNames[page];
    $("#sidebar").classList.remove("open");
    history.replaceState(null, "", `#${page}`);
    window.scrollTo({top:0, behavior:"smooth"});
  }

  document.addEventListener("click", event => {
    const page = event.target.closest("[data-page]");
    if (page) { event.preventDefault(); navigate(page.dataset.page); }
    if (event.target.closest("[data-open-assignment]")) $("#assignmentDialog").showModal();
    if (event.target.closest("[data-scroll-tasks]")) $("#assignmentPanel").scrollIntoView({behavior:"smooth"});
    const close = event.target.closest("[data-close]");
    if (close) $("#" + close.dataset.close).close();
  });

  $$(".nav").forEach(button => button.addEventListener("click", () => navigate(button.dataset.page)));
  $("#menuButton").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
  $("#themeButton").addEventListener("click", () => {
    document.body.classList.toggle("light");
    localStorage.setItem("schoolverse-theme", document.body.classList.contains("light") ? "light" : "dark");
  });
  if (localStorage.getItem("schoolverse-theme") === "light") document.body.classList.add("light");

  let assignments = [
    {title:"Review biology notes", category:"Study session", due:"Today", done:false},
    {title:"Finish history reading", category:"Coursework", due:"Tomorrow", done:false},
    {title:"Prepare group project outline", category:"Project", due:"Friday", done:false}
  ];
  try {
    const saved = JSON.parse(localStorage.getItem("schoolverse-assignments"));
    if (Array.isArray(saved)) assignments = saved;
  } catch {}
  function saveAssignments() {
    localStorage.setItem("schoolverse-assignments", JSON.stringify(assignments));
    renderAssignments();
  }
  function renderAssignments() {
    const makeRow = (task, index) => {
      const row = document.createElement("div");
      row.className = "task-row" + (task.done ? " done" : "");
      const check = document.createElement("input");
      check.type = "checkbox"; check.checked = !!task.done; check.setAttribute("aria-label", "Mark " + task.title + " complete");
      check.addEventListener("change", () => { assignments[index].done = check.checked; saveAssignments(); });
      const label = document.createElement("label"); label.textContent = task.title;
      const due = document.createElement("small"); due.className = "due"; due.textContent = task.due || task.category;
      row.append(check, label, due);
      return row;
    };
    $("#dashboardTasks").replaceChildren(...assignments.slice(0,4).map(makeRow));
    $("#assignmentList").replaceChildren(...assignments.map(makeRow));
    $("#taskCount").textContent = String(assignments.filter(a => !a.done).length).padStart(2,"0");
  }
  renderAssignments();

  $("#assignmentForm").addEventListener("submit", event => {
    event.preventDefault();
    const title = $("#assignmentName").value.trim();
    if (!title) return;
    const rawDate = $("#assignmentDate").value;
    let due = rawDate ? new Date(rawDate + "T12:00:00").toLocaleDateString(undefined,{month:"short",day:"numeric"}) : $("#assignmentCategory").value;
    assignments.unshift({title, category:$("#assignmentCategory").value, due, done:false});
    saveAssignments();
    $("#assignmentDialog").close();
    event.target.reset();
    notify("Assignment added to this browser.");
  });

  let notes = [
    {title:"Project ideas", body:"Collect early thoughts, links, and things to explore next.", type:"NOTE"},
    {title:"Study session plan", body:"Break a big topic into smaller sessions and review key ideas.", type:"STUDY"},
    {title:"Useful resources", body:"Keep helpful websites and references together for later.", type:"SAVED"}
  ];
  try {
    const saved = JSON.parse(localStorage.getItem("schoolverse-notes"));
    if (Array.isArray(saved)) notes = saved;
  } catch {}
  function renderNotes(filter = "") {
    const grid = $("#notesGrid");
    const filtered = notes.filter(note => (note.title + " " + note.body).toLowerCase().includes(filter.toLowerCase()));
    grid.replaceChildren();
    filtered.forEach(note => {
      const card = document.createElement("article"); card.className = "note-card";
      const type = document.createElement("small"); type.textContent = note.type;
      const title = document.createElement("h3"); title.textContent = note.title;
      const body = document.createElement("p"); body.textContent = note.body;
      const footer = document.createElement("footer"); footer.textContent = "Saved in this browser";
      card.append(type,title,body,footer); grid.append(card);
    });
    $("#noteCount").textContent = String(notes.length).padStart(2,"0");
  }
  renderNotes();
  $("#noteSearch").addEventListener("input", event => renderNotes(event.target.value));
  $("#newNoteButton").addEventListener("click", () => $("#noteDialog").showModal());
  $("#noteForm").addEventListener("submit", event => {
    event.preventDefault();
    const title = $("#noteTitle").value.trim(), body = $("#noteBody").value.trim();
    if (!title || !body) return;
    notes.unshift({title,body,type:"NOTE"});
    localStorage.setItem("schoolverse-notes", JSON.stringify(notes));
    renderNotes($("#noteSearch").value);
    $("#noteDialog").close(); event.target.reset();
    notify("Note saved in this browser.");
  });

  $("#createQuizButton").addEventListener("click", () => notify("Quiz creation will be added in a later version."));
  if (location.hash && pageNames[location.hash.slice(1)]) navigate(location.hash.slice(1));
})();
