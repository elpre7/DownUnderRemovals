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
  // Start on the 2nd card rather than the 1st: the 1st has no card before it
  // to peek, so centering it leaves an empty gap on the left instead of a
  // symmetric peek on both sides.
  let activeReview = 1;
  let autoplayTimer = null;

  function setActiveCard(index) {
    activeReview = index;
    cards.forEach((card, i) => card.classList.toggle("active", i === index));
    dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
  }

  // Navigating via button/dot/autoplay applies the new state immediately and
  // suppresses the live scroll-driven detector below for the duration of the
  // smooth-scroll animation. Without this, a 'scroll' event fired in the
  // animation's first frame (when the position has barely moved) would read
  // the *previous* card as still closest and stomp activeReview right back —
  // so the next autoplay tick kept re-requesting the same card it had just
  // left, instead of ever reaching the one after it.
  let suppressSyncUntil = 0;
  function scrollToReview(index, instant) {
    const target = (index + cards.length) % cards.length;
    setActiveCard(target);
    suppressSyncUntil = Date.now() + 600;
    // Scroll only the carousel's own horizontal track — never
    // card.scrollIntoView(), which also drags the whole *page* down to
    // bring the card into vertical view (e.g. mid-autoplay while someone
    // is filling in the quote form higher up the page).
    const cardRect = cards[target].getBoundingClientRect();
    const viewportRect = viewport.getBoundingClientRect();
    const delta = (cardRect.left + cardRect.width / 2) - (viewportRect.left + viewportRect.width / 2);
    viewport.scrollTo({ left: viewport.scrollLeft + delta, behavior: instant ? "auto" : "smooth" });
  }

  // Keep the active/dot state in sync with whichever single card sits closest
  // to the viewport's centre when the user drags or swipes the track
  // directly. (An intersection-ratio threshold isn't enough here: on a wide
  // screen the carousel spans the full viewport, so more than one card can be
  // >60% visible at once and several would end up "active" together.)
  let rafId = null;
  function updateActiveCard() {
    rafId = null;
    if (Date.now() < suppressSyncUntil) return;
    const viewportCenter = viewport.getBoundingClientRect().left + viewport.clientWidth / 2;
    let closest = 0;
    let closestDistance = Infinity;
    cards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const distance = Math.abs(rect.left + rect.width / 2 - viewportCenter);
      if (distance < closestDistance) { closestDistance = distance; closest = index; }
    });
    setActiveCard(closest);
  }
  function scheduleActiveCardUpdate() {
    if (rafId === null) rafId = requestAnimationFrame(updateActiveCard);
  }
  viewport.addEventListener("scroll", scheduleActiveCardUpdate, { passive: true });
  window.addEventListener("resize", scheduleActiveCardUpdate);
  scrollToReview(activeReview, true);

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
  viewport.addEventListener("touchstart", stopAutoplay, { passive: true });
  viewport.addEventListener("touchend", resumeAutoplayIfVisible);

  new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      carouselVisible = entry.isIntersecting;
      if (carouselVisible) startAutoplay();
      else stopAutoplay();
    });
  }, { threshold: 0.35 }).observe(carousel);
})();
