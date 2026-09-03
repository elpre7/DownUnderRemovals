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
  // One index drives everything: the active card, the dots, and the track's
  // position — set directly as a CSS transform computed from each card's
  // static offsetLeft/offsetWidth. No native scrolling and no "which card is
  // closest" geometry guessing: those could disagree with each other (stuck
  // re-requesting the same card, the page jumping to drag an off-screen
  // carousel into view, a card lighting up without the track visibly
  // moving). A transform driven by one variable can't desync from itself.
  const viewport = document.getElementById("reviewViewport");
  const track = document.getElementById("reviewTrack");
  const cards = Array.from(document.querySelectorAll(".review-card"));
  const dots = document.querySelectorAll("#reviewDots button");
  const carousel = document.getElementById("reviews");
  // Start on the 2nd card rather than the 1st: the 1st has no card before it
  // to peek, so centering it leaves an empty gap on the left instead of a
  // symmetric peek on both sides.
  let activeIndex = 1;
  let autoplayTimer = null;

  function render() {
    const card = cards[activeIndex];
    const offset = card.offsetLeft + card.offsetWidth / 2 - viewport.clientWidth / 2;
    track.style.transform = `translateX(${-offset}px)`;
    cards.forEach((c, i) => c.classList.toggle("active", i === activeIndex));
    dots.forEach((d, i) => d.classList.toggle("active", i === activeIndex));
  }

  function goTo(index) {
    activeIndex = (index + cards.length) % cards.length;
    render();
  }

  document.getElementById("reviewPrev").addEventListener("click", () => goTo(activeIndex - 1));
  document.getElementById("reviewNext").addEventListener("click", () => goTo(activeIndex + 1));
  dots.forEach((dot, index) => dot.addEventListener("click", () => goTo(index)));
  window.addEventListener("resize", render);

  let touchStartX = 0;
  let touchDeltaX = 0;
  viewport.addEventListener("touchstart", (event) => {
    touchStartX = event.touches[0].clientX;
    touchDeltaX = 0;
    stopAutoplay();
  }, { passive: true });
  viewport.addEventListener("touchmove", (event) => {
    touchDeltaX = event.touches[0].clientX - touchStartX;
  }, { passive: true });
  viewport.addEventListener("touchend", () => {
    if (Math.abs(touchDeltaX) > 40) goTo(activeIndex + (touchDeltaX < 0 ? 1 : -1));
    resumeAutoplayIfVisible();
  });

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = window.setInterval(() => goTo(activeIndex + 1), 4200);
  }
  function stopAutoplay() {
    if (autoplayTimer) window.clearInterval(autoplayTimer);
  }

  // Only autoplay while the carousel is actually on screen — not from page
  // load, and not while it's scrolled out of view. mouseleave/focusout/
  // touchend only resume it if it's still visible, so pausing to hover right
  // as the carousel scrolls off screen can't leave it running invisibly.
  let carouselVisible = false;
  function resumeAutoplayIfVisible() {
    if (carouselVisible) startAutoplay();
  }
  carousel.addEventListener("mouseenter", stopAutoplay);
  carousel.addEventListener("mouseleave", resumeAutoplayIfVisible);
  carousel.addEventListener("focusin", stopAutoplay);
  carousel.addEventListener("focusout", resumeAutoplayIfVisible);

  new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      carouselVisible = entry.isIntersecting;
      if (carouselVisible) startAutoplay();
      else stopAutoplay();
    });
  }, { threshold: 0.35 }).observe(carousel);

  render();
})();
