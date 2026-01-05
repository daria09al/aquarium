// ------- First  -------

const state = {
  temperature: 24,
  heaterOn: false,
  cleanliness: 100,
  filterOn: false,
  feedingTimes: ["09:00", "10:00"],
  lastFedLabel: "—",
  lastFedMinute: null,
  isLightOn: true,
  dayNightMode: "day",
  gameMinutes: 9 * 60
};

// ------- DOM element-------

const aquariumEl = document.getElementById("aquarium");
const waterDirtEl = document.getElementById("water-dirt");

const tempValueEl = document.getElementById("temp-value");
const heaterStatusEl = document.getElementById("heater-status");
const heaterIconEl = document.getElementById("heater-icon");

const cleanlinessValueEl = document.getElementById("cleanliness-value");
const filterStatusEl = document.getElementById("filter-status");
const filterIconEl = document.getElementById("filter-icon");

const timeDisplayEl = document.getElementById("time-display");
const dayNightLabelEl = document.getElementById("day-night-label");
const lightStatusEl = document.getElementById("light-status");
const toggleLightBtnEl = document.getElementById("toggle-light-btn");

const feedButtonEl = document.getElementById("feed-button");
const lastFedLabelEl = document.getElementById("last-fed-label");

const feedingFormEl = document.getElementById("feeding-form");
const feedingTimeInputEl = document.getElementById("feeding-time-input");
const feedingTimesListEl = document.getElementById("feeding-times-list");

const fishContainerEl = document.getElementById("fish-container");
const bubblesContainerEl = document.getElementById("bubbles-container");

const menuToggleEl = document.getElementById("menu-toggle");
const sidePanelEl = document.getElementById("side-panel");
const sidePanelBackdropEl = document.getElementById("side-panel-backdrop");
const closePanelBtnEl = document.getElementById("close-panel-btn");

// ------- dop.. -------

function init() {
  startBubbles();
  renderFeedingTimes();
  applyLightColor(state.lightColor);
  applyDayNightMode();
  updateLightStatusText();
  updateTimeLabel();

  // eat
  feedButtonEl.addEventListener("click", () => feedFish("manual"));

  // auto time eat
  feedingFormEl.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = feedingTimeInputEl.value;
    if (!value || !/^\d{2}:\d{2}$/.test(value)) return;
    if (!state.feedingTimes.includes(value)) {
      state.feedingTimes.push(value);
      state.feedingTimes.sort();
      renderFeedingTimes();
    }
    feedingTimeInputEl.value = "";
  });


  // Day/Night
  document.querySelectorAll(".mode-dn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const mode = btn.getAttribute("data-mode"); // day | night
      state.dayNightMode = mode;
      applyDayNightMode();
    });
  });

  // On/Off light
  toggleLightBtnEl.addEventListener("click", () => {
    state.isLightOn = !state.isLightOn;
    applyDayNightMode();
    updateLightStatusText();
  });

  // menu 🪸
  menuToggleEl.addEventListener("click", openSidePanel);
  sidePanelBackdropEl.addEventListener("click", closeSidePanel);
  closePanelBtnEl.addEventListener("click", closeSidePanel);

  // main cycle
  setInterval(() => {
    tickGameTime();
    updateTimeLabel();
    updateTemperature();
    updateCleanliness();
    updateWaterOverlay();
    checkAutoFeeding();
  }, 1000);
}

// ------- 🪸 -------

function openSidePanel() {
  sidePanelEl.classList.add("open");
  sidePanelBackdropEl.classList.add("open");
}

function closeSidePanel() {
  sidePanelEl.classList.remove("open");
  sidePanelBackdropEl.classList.remove("open");
}

// ------- panel -------
function createFish(count) {
  for (let i = 0; i < count; i++) {
    const fish = document.createElement("div");
    fish.className = "fish";

    const eye = document.createElement("div");
    eye.className = "eye";
    fish.appendChild(eye);

    const tail = document.createElement("div");
    tail.className = "tail";
    fish.appendChild(tail);
  }
}

// ------- Bubbles -------

function startBubbles() {
  setInterval(() => {
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.style.left = `${10 + Math.random() * 80}%`;
    bubble.style.animationDuration = `${4 + Math.random() * 10}s`;
    bubblesContainerEl.appendChild(bubble);

    setTimeout(() => bubble.remove(), 7000);
  }, 900);
}

// ------- Time in play-------

function tickGameTime() {
  // 1 sek=1min
  state.gameMinutes = (state.gameMinutes + 1) % (24 * 60);
}

function updateTimeLabel() {
  const total = state.gameMinutes;
  const hh = String(Math.floor(total / 60)).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  timeDisplayEl.textContent = `${hh}:${mm}`;
}

// ------- Temperatur-------
const tempSlider = document.getElementById("temp1");

tempSlider.addEventListener("input", () => {
  // The user manually changes the temperature
  state.temperature = Number(tempSlider.value);
  tempValueEl.textContent = state.temperature.toFixed(1);
});


function updateTemperature() {
  // temperatur +/-
  const drift = (Math.random() - 0.5) * 0.2;
  state.temperature += drift;

  // automatic heating
  if (state.temperature < 23) {
    state.heaterOn = true;
    state.temperature += 0.25;
  } else if (state.temperature > 25) {
    state.heaterOn = false;
    state.temperature -= 0.1;
  }

  // temperatur min. - max.
  if (state.temperature < 10) state.temperature = 10;
  if (state.temperature > 28) state.temperature = 28;

  // display update
  tempValueEl.textContent = state.temperature.toFixed(1);
  heaterStatusEl.textContent = state.heaterOn ? "On" : "Off";
  heaterIconEl.classList.toggle("active", state.heaterOn);

  // update the slider (if the automatic system has changed the temperature)
  tempSlider.value = state.temperature;
}


// ------- clear -------

function updateCleanliness() {
  // water is gradually becoming polluteed
  state.cleanliness -= 0.08;
  if (state.cleanliness < 0) state.cleanliness = 0;

  // turn on the filter when the air quality is low
  if (state.cleanliness < 95) {
    state.filterOn = true;
  }

  // the filter purifies water
  if (state.filterOn) {
    state.cleanliness += 0.2;
    if (state.cleanliness >= 100) {
      state.cleanliness = 100;
      state.filterOn = false;
    }
  }

  cleanlinessValueEl.textContent = state.cleanliness.toFixed(0);
  filterStatusEl.textContent = state.filterOn ? "On" : "Off";
  filterIconEl.classList.toggle("active", state.filterOn);
}

// dirt buildup

function updateWaterOverlay() {
  const dirtFactor = (100 - state.cleanliness) / 100;
  const alpha = dirtFactor * 0.6;
  waterDirtEl.style.backgroundColor = `rgba(60, 30, 0, ${alpha.toFixed(2)})`;
}

// ------- Кормление -------

let feedingInProgress = false;

function feedFish(reason) {
  if (feedingInProgress) return;
  feedingInProgress = true;

  feedButtonEl.disabled = true;
  const oldText = feedButtonEl.textContent;
  feedButtonEl.textContent =
    reason === "auto" ? "Automatic feeding" : "Feeding the fish";

  spawnFoodParticles();

  // время из внутриигровых минут
  const total = state.gameMinutes;
  const hh = String(Math.floor(total / 60)).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");

  state.lastFedLabel =
    reason === "auto" ? `Auto in ${hh}:${mm}` : ` manual In ${hh}:${mm}`;
  state.lastFedMinute = `${hh}:${mm}`;
  lastFedLabelEl.textContent = state.lastFedLabel;

  // корм немного загрязняет воду
  state.cleanliness -= 20;
  if (state.cleanliness < 0) state.cleanliness = 0;

  setTimeout(() => {
    feedingInProgress = false;
    feedButtonEl.disabled = false;
    feedButtonEl.textContent = oldText;
  }, 2300);
}

function spawnFoodParticles() {
  const count = 50;
  const aquariumRect = aquariumEl.getBoundingClientRect();

  for (let i = 0; i < count; i++) {
    const food = document.createElement("div");
    food.className = "food";

    const xPercent = 10 + Math.random() * 80;
    food.style.left = `${xPercent}%`;
    food.style.top = "15px";

    aquariumEl.appendChild(food);
    setTimeout(() => food.remove(), 2600);
  }
}

// автокормление по расписанию

function checkAutoFeeding() {
  const total = state.gameMinutes;
  const hh = String(Math.floor(total / 60)).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  const current = `${hh}:${mm}`;

  if (
    state.feedingTimes.includes(current) &&
    state.lastFedMinute !== current &&
    !feedingInProgress
  ) {
    feedFish("auto");
  }
}

// ------- Расписание кормлений -------

function renderFeedingTimes() {
  feedingTimesListEl.innerHTML = "";

  state.feedingTimes.forEach((time) => {
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.textContent = time;

    const btn = document.createElement("button");
    btn.textContent = "Dalete";
    btn.className = "remove-time-btn";
    btn.addEventListener("click", () => {
      state.feedingTimes = state.feedingTimes.filter((t) => t !== time);
      renderFeedingTimes();
    });

    li.appendChild(span);
    li.appendChild(btn);
    feedingTimesListEl.appendChild(li);
  });
}

// ------- Подсветка и режим дня -------

function applyLightColor(color) {
  state.lightColor = color;
  let cssValue;

  document.documentElement.style.setProperty("--light-color", cssValue);
}

function applyDayNightMode() {
  // стираем классы
  document.body.classList.remove("night", "lights-off");

  if (!state.isLightOn) {
    document.body.classList.add("lights-off");
  } else {
    if (state.dayNightMode === "night") {
      document.body.classList.add("night");
    }
  }

  dayNightLabelEl.textContent =
    state.dayNightMode === "day" ? "Day" : "Night";
}

function updateLightStatusText() {
  lightStatusEl.textContent = state.isLightOn ? "Off" : "On";
  toggleLightBtnEl.textContent = state.isLightOn
    ? "Turn off the light"
    : "Turn on the light";
}

function randomSeaweedMotion() {
  document.querySelectorAll('.seaweed').forEach(seaweed => {
    const speed = 4 + Math.random() * 3;
    seaweed.style.animationDuration = speed + "s";
  });
}

setInterval(randomSeaweedMotion, 6000);


// ------- Старт -------


document.addEventListener("DOMContentLoaded", init);
