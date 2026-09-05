import { mountReviewCarousel } from "./review-carousel.js";
import { reviews } from "./reviews.js";

document.getElementById("year").textContent = new Date().getFullYear();

// --- Mobile menu ---
const menuButton = document.getElementById("menuButton");
const mainNav = document.getElementById("mainNav");
const menuIconUse = document.getElementById("menuIcon").querySelector("use");

function setMenu(open) {
  mainNav.classList.toggle("open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuIconUse.setAttribute("href", open ? "#i-x" : "#i-menu");
}

menuButton.addEventListener("click", () => setMenu(!mainNav.classList.contains("open")));
mainNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));

// --- Animated stat counters ---
const stats = document.querySelectorAll(".stat strong[data-count]");
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const duration = 2000;
    const delay = 180;
    const start = performance.now() + delay;

    function tick(now) {
      if (now < start) {
        requestAnimationFrame(tick);
        return;
      }
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    statObserver.unobserve(el);
  });
}, { threshold: 0.35 });
stats.forEach((el) => statObserver.observe(el));

// --- Quote form (2 steps) ---
const quoteForm = document.getElementById("quoteForm");
const quoteSuccess = document.getElementById("quoteSuccess");
const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");
const stepDots = document.querySelectorAll("#stepCount [data-step-dot]");

// No same-day bookings via the form — earliest selectable date is tomorrow.
const dateInput = document.getElementById("dateInput");
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
dateInput.min = tomorrow.toISOString().slice(0, 10);

// Checked via JS, not the `pattern` attribute: Chromium doesn't apply a
// pattern containing a lookahead (confirmed — a plain quantified pattern
// works fine, this specific pattern always reports valid regardless of
// content), so counting digits by hand is the reliable option here.
const phoneInput = document.getElementById("phoneInput");
function validatePhone() {
  if (phoneInput.value.trim() === "") {
    phoneInput.setCustomValidity(""); // let `required` own the empty case
    return;
  }
  const digitCount = phoneInput.value.replace(/\D/g, "").length;
  phoneInput.setCustomValidity(digitCount >= 8 ? "" : "Enter a valid phone number (at least 8 digits).");
}
phoneInput.addEventListener("input", validatePhone);

function goToStep(step) {
  step1.hidden = step !== 1;
  step2.hidden = step !== 2;
  stepDots.forEach((dot) => dot.classList.toggle("active", Number(dot.dataset.stepDot) <= step));
  document.getElementById("stepCount").setAttribute("aria-label", `Step ${step} of 2`);
}

document.getElementById("toStep2").addEventListener("click", () => {
  for (const field of step1.querySelectorAll("input, select")) {
    if (!field.reportValidity()) return;
  }
  goToStep(2);
});
document.getElementById("toStep1").addEventListener("click", () => goToStep(1));

function resetForm() {
  quoteForm.reset();
  goToStep(1);
  quoteForm.hidden = false;
  quoteSuccess.hidden = true;
  quoteError.hidden = true;
}

const quoteError = document.getElementById("quoteError");
const submitButton = quoteForm.querySelector("button[type=submit]");

quoteForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  // The form carries novalidate (so step 1's fields don't get checked while
  // hidden on step 2) — so step 2's own fields need the same manual check
  // step 1 already does before its "Continue" button advances.
  validatePhone();
  for (const field of step2.querySelectorAll("input, textarea")) {
    if (!field.reportValidity()) return;
  }
  quoteError.hidden = true;
  submitButton.disabled = true;
  try {
    const response = await fetch("https://formsubmit.co/ajax/info@downunderremovals.com", {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new FormData(quoteForm),
    });
    if (!response.ok) throw new Error(`FormSubmit responded ${response.status}`);
    quoteForm.hidden = true;
    quoteSuccess.hidden = false;
  } catch (err) {
    quoteError.hidden = false;
  } finally {
    submitButton.disabled = false;
  }
});

document.getElementById("sendAnother").addEventListener("click", resetForm);

// --- Service cards: jump to the quote form, pre-selecting its move size ---
const sizeSelect = step1.querySelector("select[name='size']");
document.querySelectorAll(".service-card[data-prefill-size]").forEach((card) => {
  card.addEventListener("click", () => {
    const size = card.dataset.prefillSize;
    if (size) sizeSelect.value = size;
  });
});

// --- Google review carousel ---
mountReviewCarousel(document.getElementById("reviews"), reviews);
