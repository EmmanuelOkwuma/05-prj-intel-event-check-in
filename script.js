// ==========================================
// INTEL SUSTAINABILITY SUMMIT CHECK-IN
// ==========================================

// ==========================================
// CONFIGURATION
// ==========================================

// Set to 3 when testing the celebration.
// Change back to 50 for the final submission.

const attendanceGoal = 50;

// Local storage key

const STORAGE_KEY = "intelSummitAttendees";

// Team names

const teamNames = {
  water: "Team Water Wise",
  zero: "Team Net Zero",
  power: "Team Renewables",
};

// Short team labels

const teamLabels = {
  water: "Water Wise",
  zero: "Net Zero",
  power: "Renewables",
};

// ==========================================
// HTML ELEMENTS
// ==========================================

const $ = (id) => document.getElementById(id);

const checkInForm = $("checkInForm");

const attendeeNameInput = $("attendeeName");

const teamSelect = $("teamSelect");

const greeting = $("greeting");

const overlay = $("celebrationOverlay");

const closeButton = $("closeCelebration");

// ==========================================
// APPLICATION STATE
// ==========================================

let attendees = [];

let celebrationShown = false;

// ==========================================
// LOAD SAVED ATTENDANCE
// ==========================================

try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

  if (Array.isArray(saved)) {
    attendees = saved.filter((person) => {
      return (
        person &&
        typeof person.name === "string" &&
        person.name.trim().length > 0 &&
        Object.prototype.hasOwnProperty.call(teamNames, person.team)
      );
    });
  }
} catch (error) {
  console.warn("Saved attendance could not be loaded:", error);
}

// ==========================================
// COUNT TEAM ATTENDANCE
// ==========================================

function countTeams() {
  const counts = {
    water: 0,
    zero: 0,
    power: 0,
  };

  for (const person of attendees) {
    counts[person.team]++;
  }

  return counts;
}

// ==========================================
// SINGULAR / PLURAL GRAMMAR
// ==========================================

function plural(number, word) {
  return `${number} ${word}${number === 1 ? "" : "s"}`;
}

// ==========================================
// FORMAT TEAM NAMES
// ==========================================

function joinTeamNames(names) {
  if (names.length === 1) {
    return names[0];
  }

  if (names.length === 2) {
    return `${names[0]} and ${names[1]}`;
  }

  return (
    `${names.slice(0, -1).join(", ")}, ` + `and ${names[names.length - 1]}`
  );
}

// ==========================================
// DETERMINE LEADING TEAM
// ==========================================

function getLeaderMessage(counts) {
  const highest = Math.max(...Object.values(counts));

  if (highest === 0) {
    return "The competition starts with the first check-in.";
  }

  const leaders = Object.keys(counts).filter(
    (team) => counts[team] === highest,
  );

  // Three-way tie

  if (leaders.length === 3) {
    return (
      `All three teams are tied with ` + `${plural(highest, "check-in")} each.`
    );
  }

  // One leading team

  if (leaders.length === 1) {
    return (
      `${teamNames[leaders[0]]} leads with ` + `${plural(highest, "check-in")}.`
    );
  }

  // Two-way tie

  return (
    `${joinTeamNames(leaders.map((team) => teamNames[team]))} are tied with ` +
    `${plural(highest, "check-in")} each.`
  );
}

// ==========================================
// UPDATE ATTENDEE LIST
// ==========================================

function updateAttendeeList() {
  const list = $("attendeeList");

  list.replaceChildren();

  $("listCount").textContent = `${attendees.length} registered`;

  // Empty state

  if (attendees.length === 0) {
    const empty = document.createElement("li");

    empty.className = "empty-state";

    empty.textContent = "No attendees yet. Be the first to check in.";

    list.append(empty);

    return;
  }

  // Create attendee rows

  attendees.forEach((person, index) => {
    const row = document.createElement("li");

    row.className = "attendee-row";

    // Attendee number

    const number = document.createElement("span");

    number.className = "attendee-index";

    number.textContent = index + 1;

    // Attendee name

    const name = document.createElement("strong");

    name.textContent = person.name;

    // Team badge

    const badge = document.createElement("span");

    badge.className = `team-badge ${person.team}`;

    badge.textContent = teamLabels[person.team];

    // Add row contents

    row.append(number, name, badge);

    // Add row to list

    list.append(row);
  });
}

// ==========================================
// UPDATE DASHBOARD
// ==========================================

function updateAttendance() {
  const total = attendees.length;

  const counts = countTeams();

  // Total attendance

  $("attendeeCount").textContent = total;

  $("goalDisplay").textContent = attendanceGoal;

  // Team attendance

  $("waterCount").textContent = counts.water;

  $("zeroCount").textContent = counts.zero;

  $("powerCount").textContent = counts.power;

  // Calculate progress percentage

  const percentage = Math.min((total / attendanceGoal) * 100, 100);

  // Update progress bar

  $("progressBar").style.width = `${percentage}%`;

  // Accessibility attributes

  $("progressBar").setAttribute("aria-valuemax", String(attendanceGoal));

  $("progressBar").setAttribute(
    "aria-valuenow",
    String(Math.min(total, attendanceGoal)),
  );

  // Display percentage

  $("progressPercent").textContent = `${Math.round(percentage)}%`;

  // Remaining attendance

  const remaining = Math.max(attendanceGoal - total, 0);

  if (remaining === 0) {
    $("remainingText").textContent = "Goal achieved!";
  } else {
    $("remainingText").textContent = `${plural(remaining, "check-in")} to go`;
  }

  // Leaderboard message

  $("leaderNote").textContent = getLeaderMessage(counts);

  // Update attendee list

  updateAttendeeList();
}

// ==========================================
// SAVE ATTENDANCE
// ==========================================

function saveAttendance() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attendees));
  } catch (error) {
    console.warn("Attendance could not be saved:", error);
  }
}

// ==========================================
// CONFETTI ANIMATION
// ==========================================

function launchConfetti() {
  const layer = $("confettiLayer");

  layer.replaceChildren();

  // Respect reduced-motion preferences

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  // Confetti colors

  const colors = [
    "#00aeef",
    "#0071c5",
    "#f9b728",
    "#29c89b",
    "#ffffff",
    "#82d8ff",
  ];

  // Generate confetti pieces

  for (let i = 0; i < 110; i++) {
    const piece = document.createElement("span");

    piece.className = "confetti-piece";

    // Random horizontal position

    piece.style.left = `${Math.random() * 100}%`;

    // Confetti color

    piece.style.setProperty("--color", colors[i % colors.length]);

    // Random animation delay

    piece.style.setProperty("--delay", `${Math.random() * 1.5}s`);

    // Random falling duration

    piece.style.setProperty("--duration", `${2.7 + Math.random() * 2.5}s`);

    // Random horizontal movement

    piece.style.setProperty("--drift", `${(Math.random() - 0.5) * 240}px`);

    // Add confetti to screen

    layer.append(piece);
  }
}

// ==========================================
// SHOW CELEBRATION
// ==========================================

function showCelebration() {
  const counts = countTeams();

  const highest = Math.max(...Object.values(counts));

  // Determine winning teams

  const leaders = Object.keys(counts).filter(
    (team) => counts[team] === highest,
  );

  let outcome = "";

  // One winner

  if (leaders.length === 1) {
    outcome =
      `${teamNames[leaders[0]]} takes the lead ` +
      `with ${plural(highest, "check-in")}!`;
  }

  // Three-way tie
  else if (leaders.length === 3) {
    outcome =
      `All three teams are tied with ` + `${plural(highest, "check-in")} each!`;
  }

  // Two-way tie
  else {
    outcome =
      `${joinTeamNames(
        leaders.map((team) => teamNames[team]),
      )} are tied for first with ` + `${plural(highest, "check-in")} each!`;
  }

  // Celebration message

  $("celebrationDescription").textContent =
    `We've reached our goal of ` +
    `${plural(attendanceGoal, "attendee")}. ` +
    outcome;

  // Final attendance count

  $("celebrationTotal").textContent = attendees.length;

  // Show overlay

  overlay.hidden = false;

  document.body.classList.add("modal-open");

  // Launch confetti

  launchConfetti();

  // Focus close button

  closeButton.focus();
}

// ==========================================
// CLOSE CELEBRATION
// ==========================================

function hideCelebration() {
  overlay.hidden = true;

  document.body.classList.remove("modal-open");

  $("confettiLayer").replaceChildren();

  attendeeNameInput.focus();
}

// Close button

closeButton.addEventListener("click", hideCelebration);

// Escape key

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !overlay.hidden) {
    hideCelebration();
  }

  // Keep keyboard focus inside modal

  if (event.key === "Tab" && !overlay.hidden) {
    event.preventDefault();

    closeButton.focus();
  }
});

// ==========================================
// HANDLE CHECK-IN
// ==========================================

checkInForm.addEventListener("submit", (event) => {
  // Prevent page reload

  event.preventDefault();

  // Get form values

  const name = attendeeNameInput.value.trim();

  const team = teamSelect.value;

  // Validate form

  if (!name || !Object.prototype.hasOwnProperty.call(teamNames, team)) {
    greeting.hidden = false;

    greeting.className = "greeting error";

    greeting.textContent = "Please enter your name and choose a valid team.";

    return;
  }

  // Previous attendance

  const previousTotal = attendees.length;

  // Add attendee

  attendees.push({
    name,
    team,
  });

  // Save progress

  saveAttendance();

  // Update dashboard

  updateAttendance();

  // Personalized greeting

  greeting.hidden = false;

  greeting.className = "greeting";

  greeting.textContent =
    `Welcome to the Intel Sustainability Summit, ${name}! ` +
    `You're checked in with ${teamNames[team]}.`;

  // Reset form

  checkInForm.reset();

  // Celebrate only when crossing the goal

  if (
    !celebrationShown &&
    previousTotal < attendanceGoal &&
    attendees.length >= attendanceGoal
  ) {
    celebrationShown = true;

    showCelebration();
  } else {
    attendeeNameInput.focus();
  }
});

// ==========================================
// INITIALIZE APPLICATION
// ==========================================

// Restore saved data when page loads

updateAttendance();
