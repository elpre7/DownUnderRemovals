(() => {
  "use strict";

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
  }

  quoteForm.addEventListener("submit", (event) => {
    event.preventDefault();
    quoteForm.hidden = true;
    quoteSuccess.hidden = false;
  });

  document.getElementById("sendAnother").addEventListener("click", resetForm);

  // --- Google review carousel ---
  // Native horizontal scroll + snap: neighbouring cards peek at both edges,
  // dragging/swiping just works, and autoplay/buttons scroll to a target card.
  const viewport = document.getElementById("reviewViewport");
  const cards = Array.from(document.querySelectorAll(".review-card"));
  const dots = document.querySelectorAll("#reviewDots button");
  const carousel = document.getElementById("reviews");
  let activeReview = 0;
  let autoplayTimer = null;

  function scrollToReview(index) {
    activeReview = (index + cards.length) % cards.length;
    cards[activeReview].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }

  // Keep the active/dot state in sync with whichever card is centred,
  // including when the user drags or swipes the track directly.
  const centerObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const index = cards.indexOf(entry.target);
      entry.target.classList.toggle("active", entry.isIntersecting);
      if (entry.isIntersecting) {
        activeReview = index;
        dots.forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === index));
      }
    });
  }, { root: viewport, threshold: 0.6 });
  cards.forEach((card) => centerObserver.observe(card));

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = window.setInterval(() => scrollToReview(activeReview + 1), 4200);
  }
  function stopAutoplay() {
    if (autoplayTimer) window.clearInterval(autoplayTimer);
  }

  document.getElementById("reviewPrev").addEventListener("click", () => scrollToReview(activeReview - 1));
  document.getElementById("reviewNext").addEventListener("click", () => scrollToReview(activeReview + 1));
  dots.forEach((dot, index) => dot.addEventListener("click", () => scrollToReview(index)));

  carousel.addEventListener("mouseenter", stopAutoplay);
  carousel.addEventListener("mouseleave", startAutoplay);
  carousel.addEventListener("focusin", stopAutoplay);
  carousel.addEventListener("focusout", startAutoplay);
  viewport.addEventListener("touchstart", stopAutoplay, { passive: true });
  viewport.addEventListener("touchend", startAutoplay);

  startAutoplay();
})();
