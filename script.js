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
  // True infinite loop: a hidden clone of the last card sits before the
  // first, and a clone of the first sits after the last. "Next" past the
  // real last card animates onto the first-clone — visually identical to
  // the real first card — then, the instant that animation finishes, jumps
  // (with the transition briefly disabled, so it's imperceptible) back to
  // the real first card in the same on-screen position. Same trick in
  // reverse for "prev" past the first card. That's what makes it wrap
  // like an actual carousel instead of snapping back to the start.
  const viewport = document.getElementById("reviewViewport");
  const track = document.getElementById("reviewTrack");
  const realCards = Array.from(document.querySelectorAll(".review-card"));
  const carousel = document.getElementById("reviews");
  const count = realCards.length;

  const firstClone = realCards[0].cloneNode(true);
  const lastClone = realCards[count - 1].cloneNode(true);
  firstClone.setAttribute("aria-hidden", "true");
  lastClone.setAttribute("aria-hidden", "true");
  track.appendChild(firstClone);
  track.insertBefore(lastClone, realCards[0]);

  // slides[0] = clone of the last real card, slides[1..count] = the real
  // cards in order, slides[count+1] = clone of the first real card.
  const slides = Array.from(track.children);
  let position = 1; // index into `slides`; starts on the 1st real card
  let autoplayTimer = null;
  let animating = false;

  function moveTrack(animate) {
    // Align the active card flush with the viewport's left edge (not
    // centred) — with several equal cards visible at once, centring would
    // show real cards peeking on the left too, not just the fixed intro
    // panel, which reads as misaligned rather than as a carousel "row".
    const offset = slides[position].offsetLeft;
    if (!animate) track.classList.add("no-transition");
    track.style.transform = `translateX(${-offset}px)`;
    if (!animate) {
      track.getBoundingClientRect(); // flush the jump before re-enabling transitions
      track.classList.remove("no-transition");
    }
  }

  function goTo(nextPosition) {
    if (animating) return;
    position = nextPosition;
    animating = true;
    moveTrack(true);
  }

  // When a slide-to-clone animation finishes, silently re-anchor to the
  // matching real card so the next move has real neighbours to slide to.
  track.addEventListener("transitionend", (event) => {
    if (event.target !== track || event.propertyName !== "transform") return;
    animating = false;
    if (position === slides.length - 1) {
      position = 1;
      moveTrack(false);
    } else if (position === 0) {
      position = count;
      moveTrack(false);
    }
  });

  document.getElementById("reviewPrev").addEventListener("click", () => goTo(position - 1));
  document.getElementById("reviewNext").addEventListener("click", () => goTo(position + 1));
  window.addEventListener("resize", () => moveTrack(false));

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
    if (Math.abs(touchDeltaX) > 40) goTo(position + (touchDeltaX < 0 ? 1 : -1));
    resumeAutoplayIfVisible();
  });

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = window.setInterval(() => goTo(position + 1), 4200);
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

  moveTrack(false);
})();
