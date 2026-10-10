const CONFIG = {
  passwordDigits: "160626",
  defaultSong: "assets/cancion.mp3",
};

const body = document.body;
const gate = document.querySelector("#gate");
const experience = document.querySelector("#experience");
const passwordForm = document.querySelector("#passwordForm");
const passwordInput = document.querySelector("#passwordInput");
const passwordError = document.querySelector("#passwordError");
const togglePassword = document.querySelector("#togglePassword");
const backgroundAudio = document.querySelector("#backgroundAudio");
const musicButton = document.querySelector("#musicButton");
const musicIcon = document.querySelector("#musicIcon");
const settingsButton = document.querySelector("#settingsButton");
const musicDrawer = document.querySelector("#musicDrawer");
const closeSettings = document.querySelector("#closeSettings");
const audioUpload = document.querySelector("#audioUpload");
const audioFileName = document.querySelector("#audioFileName");
const volumeControl = document.querySelector("#volumeControl");
const messageStars = document.querySelectorAll(".message-star");
const starRing = document.querySelector("#starRing");
const starSong = document.querySelector("#starSong");
const starMessage = document.querySelector("#starMessage");
const starProgress = document.querySelector("#starProgress");
const starProgressDots = [...document.querySelectorAll("#starProgressDots i")];
const sevenSecret = document.querySelector("#sevenSecret");
const petalLayer = document.querySelector("#petalLayer");
const petalWish = document.querySelector("#petalWish");
const openLetter = document.querySelector("#openLetter");
const closeBook = document.querySelector("#closeBook");
const bookStage = document.querySelector("#bookStage");
const bookSpreads = [...document.querySelectorAll(".book-spread")];
const previousPage = document.querySelector("#previousPage");
const nextPage = document.querySelector("#nextPage");
const pageIndicator = document.querySelector("#pageIndicator");
const restartButton = document.querySelector("#restartButton");
const toast = document.querySelector("#toast");
const cosmosImage = document.querySelector(".cosmos__image");
const canvas = document.querySelector("#starCanvas");
const context = canvas.getContext("2d");

let uploadedAudioUrl = "";
let toastTimer;
let currentSpread = 0;
let stars = [];
let animationFrame;
let petalsCreated = false;
const discoveredStars = new Set();

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

function updateMusicButton() {
  const playing = !backgroundAudio.paused;
  musicButton.classList.toggle("is-playing", playing);
  musicButton.setAttribute("aria-label", playing ? "Pausar música" : "Reproducir música");
  musicIcon.innerHTML = playing ? "&#10074;&#10074;" : "&#9835;";
}

async function beginMusic() {
  try {
    await backgroundAudio.play();
    updateMusicButton();
  } catch {
    updateMusicButton();
    showToast("Toca la nota musical para escuchar Serendipity.");
  }
}

async function unlockExperience() {
  gate.classList.add("is-open");
  experience.classList.add("is-visible");
  experience.setAttribute("aria-hidden", "false");
  body.classList.remove("is-locked");
  createPetalRain();
  await beginMusic();
}

passwordForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const enteredDate = passwordInput.value.replace(/\D/g, "");

  if (enteredDate === CONFIG.passwordDigits) {
    passwordError.textContent = "";
    unlockExperience();
    return;
  }

  passwordError.textContent = "Esa no es nuestra fecha. Prueba con día, mes y año.";
  passwordForm.classList.remove("shake");
  void passwordForm.offsetWidth;
  passwordForm.classList.add("shake");
  passwordInput.select();
});

togglePassword.addEventListener("click", () => {
  const showing = passwordInput.type === "text";
  passwordInput.type = showing ? "password" : "text";
  togglePassword.setAttribute("aria-label", showing ? "Mostrar contraseña" : "Ocultar contraseña");
});

async function toggleMusic() {
  if (!backgroundAudio.paused) {
    backgroundAudio.pause();
    updateMusicButton();
    return;
  }
  await beginMusic();
}

function openMusicDrawer() {
  musicDrawer.classList.add("is-open");
  musicDrawer.setAttribute("aria-hidden", "false");
}

function closeMusicDrawer() {
  musicDrawer.classList.remove("is-open");
  musicDrawer.setAttribute("aria-hidden", "true");
}

musicButton.addEventListener("click", toggleMusic);
settingsButton.addEventListener("click", openMusicDrawer);
closeSettings.addEventListener("click", closeMusicDrawer);

audioUpload.addEventListener("change", async (event) => {
  const [file] = event.target.files;
  if (!file) return;

  if (uploadedAudioUrl) URL.revokeObjectURL(uploadedAudioUrl);
  uploadedAudioUrl = URL.createObjectURL(file);
  backgroundAudio.src = uploadedAudioUrl;
  audioFileName.textContent = file.name;

  try {
    await backgroundAudio.play();
    updateMusicButton();
    closeMusicDrawer();
    showToast("La nueva canción ya acompaña nuestro universo.");
  } catch {
    showToast("La canción está lista. Toca la nota musical.");
  }
});

volumeControl.addEventListener("input", () => {
  backgroundAudio.volume = Number(volumeControl.value);
});

backgroundAudio.volume = Number(volumeControl.value);
backgroundAudio.addEventListener("play", updateMusicButton);
backgroundAudio.addEventListener("pause", updateMusicButton);
backgroundAudio.addEventListener("error", () => {
  if (backgroundAudio.currentSrc.includes(CONFIG.defaultSong)) {
    showToast("No pude cargar la canción. Revisa assets/cancion.mp3.");
  }
  updateMusicButton();
});

function activateStar(button) {
  const starIndex = Number(button.dataset.number) - 1;
  messageStars.forEach((star) => star.classList.remove("is-active"));
  button.classList.add("is-active", "is-discovered");
  button.setAttribute("aria-pressed", "true");
  discoveredStars.add(starIndex);
  starMessage.classList.add("is-changing");
  createPetalBurst(button.getBoundingClientRect(), 24);

  window.setTimeout(() => {
    starSong.textContent = button.dataset.song;
    starMessage.textContent = button.dataset.message;
    starMessage.classList.remove("is-changing");
  }, 180);

  starProgress.textContent = `${discoveredStars.size} de 7 estrellas encendidas`;
  starProgressDots.forEach((dot, index) => dot.classList.toggle("is-lit", discoveredStars.has(index)));

  if (discoveredStars.size === messageStars.length && !sevenSecret.classList.contains("is-visible")) {
    sevenSecret.classList.add("is-visible");
    sevenSecret.setAttribute("aria-hidden", "false");
    createPetalBurst(document.querySelector(".bts-moon-wrap").getBoundingClientRect(), 88);
    showToast("Las siete estrellas ya guardan tu amor.");
  }
}

starRing.addEventListener("click", (event) => {
  const button = event.target.closest(".message-star");
  if (button) activateStar(button);
});

function createPetalRain() {
  if (petalsCreated) return;
  petalsCreated = true;

  for (let index = 0; index < 48; index += 1) {
    const petal = document.createElement("span");
    petal.className = "petal";
    petal.style.setProperty("--left", `${Math.random() * 100}%`);
    petal.style.setProperty("--size", `${7 + Math.random() * 12}px`);
    petal.style.setProperty("--duration", `${8 + Math.random() * 12}s`);
    petal.style.setProperty("--delay", `${Math.random() * -18}s`);
    petal.style.setProperty("--opacity", `${0.28 + Math.random() * 0.62}`);
    petal.style.setProperty("--sway", `${-80 + Math.random() * 160}px`);
    petal.style.setProperty("--drift", `${-120 + Math.random() * 240}px`);
    petalLayer.append(petal);
  }
}

function createPetalBurst(rect, amount = 30) {
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  createPetalBurstAt(centerX, centerY, amount);
}

function createPetalBurstAt(centerX, centerY, amount = 30) {
  for (let index = 0; index < amount; index += 1) {
    const angle = (Math.PI * 2 * index) / amount + Math.random() * 0.35;
    const distance = 70 + Math.random() * 170;
    const petal = document.createElement("span");
    petal.className = "burst-petal";
    petal.style.setProperty("--x", `${centerX}px`);
    petal.style.setProperty("--y", `${centerY}px`);
    petal.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
    petal.style.setProperty("--dy", `${Math.sin(angle) * distance + 70}px`);
    petal.style.setProperty("--rotation", `${Math.random() * 720 - 360}deg`);
    document.body.append(petal);
    setTimeout(() => petal.remove(), 2000);
  }

  const bloom = document.createElement("span");
  bloom.className = "touch-bloom";
  bloom.style.left = `${centerX}px`;
  bloom.style.top = `${centerY}px`;
  document.body.append(bloom);
  setTimeout(() => bloom.remove(), 900);
}

petalWish.addEventListener("click", () => {
  createPetalBurst(petalWish.getBoundingClientRect(), 64);
  showToast("Sesenta y cuatro pétalos para mi wawita hermosa.");
});

experience.addEventListener("pointerdown", (event) => {
  if (body.classList.contains("book-open") || event.button > 0) return;
  if (event.target.closest("button, a, input, label, .music-drawer")) return;
  createPetalBurstAt(event.clientX, event.clientY, 12);
});

function renderBook() {
  bookSpreads.forEach((spread, index) => {
    const active = index === currentSpread;
    spread.classList.toggle("is-active", active);
    spread.setAttribute("aria-hidden", String(!active));
  });
  pageIndicator.textContent = `${currentSpread + 1} / ${bookSpreads.length}`;
  previousPage.disabled = currentSpread === 0;
  nextPage.disabled = currentSpread === bookSpreads.length - 1;
}

function openBook() {
  currentSpread = 0;
  renderBook();
  bookStage.classList.add("is-open");
  bookStage.setAttribute("aria-hidden", "false");
  body.classList.add("is-locked", "book-open");
  if (window.location.hash !== "#bookStage") history.replaceState(null, "", "#bookStage");
  closeBook.focus();
}

function closeBookStage() {
  bookStage.classList.remove("is-open");
  bookStage.setAttribute("aria-hidden", "true");
  body.classList.remove("is-locked", "book-open");
  if (window.location.hash === "#bookStage") history.replaceState(null, "", "#carta");
  openLetter.focus();
}

openLetter.addEventListener("click", (event) => {
  event.preventDefault();
  openBook();
});
closeBook.addEventListener("click", (event) => {
  event.preventDefault();
  closeBookStage();
});
bookStage.addEventListener("click", (event) => {
  if (event.target === bookStage) closeBookStage();
});
previousPage.addEventListener("click", () => {
  if (currentSpread > 0) currentSpread -= 1;
  renderBook();
});
nextPage.addEventListener("click", () => {
  if (currentSpread < bookSpreads.length - 1) currentSpread += 1;
  renderBook();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (bookStage.classList.contains("is-open")) closeBookStage();
    if (musicDrawer.classList.contains("is-open")) closeMusicDrawer();
  }
  if (!bookStage.classList.contains("is-open")) return;
  if (event.key === "ArrowRight" && currentSpread < bookSpreads.length - 1) {
    currentSpread += 1;
    renderBook();
  }
  if (event.key === "ArrowLeft" && currentSpread > 0) {
    currentSpread -= 1;
    renderBook();
  }
});

restartButton.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("is-visible");
    });
  },
  { threshold: 0.14 },
);

document.querySelectorAll("[data-reveal]").forEach((element) => revealObserver.observe(element));

function createStars() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * ratio;
  canvas.height = window.innerHeight * ratio;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);

  const count = Math.min(170, Math.floor(window.innerWidth / 6));
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    size: Math.random() * 1.6 + 0.25,
    speed: Math.random() * 0.12 + 0.025,
    alpha: Math.random() * 0.68 + 0.16,
  }));
}

function drawStars() {
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  stars.forEach((star) => {
    star.y += star.speed;
    if (star.y > window.innerHeight + 3) star.y = -3;
    context.beginPath();
    context.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    context.fillStyle = `rgba(236, 216, 255, ${star.alpha})`;
    context.fill();
  });
  animationFrame = requestAnimationFrame(drawStars);
}

function handleParallax() {
  const progress = window.scrollY / Math.max(document.body.scrollHeight - window.innerHeight, 1);
  cosmosImage.style.transform = `scale(1.05) translate3d(0, ${progress * -3.5}%, 0)`;
}

window.addEventListener("resize", createStars);
window.addEventListener("scroll", handleParallax, { passive: true });
window.addEventListener("beforeunload", () => {
  cancelAnimationFrame(animationFrame);
  if (uploadedAudioUrl) URL.revokeObjectURL(uploadedAudioUrl);
});

renderBook();
document.body.append(bookStage);
if (window.location.hash === "#bookStage") openBook();
createStars();
drawStars();
