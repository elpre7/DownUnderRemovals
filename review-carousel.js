// Google-reviews carousel. Data-driven (see reviews.js) — nothing about a
// specific review is hardcoded here. See the spec this follows for the
// reasoning behind each mechanic; short version: a review is unpredictable-
// length text with a real author and an accessibility/legal footprint, not
// an interchangeable fixed-ratio poster, so this is not a generic slider
// with text dropped in.

const PEEK_PX = 60;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Same hue for the same name every time, so a given reviewer's initial
// avatar is visually consistent if they show up more than once.
function hashColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash << 5) - hash + name.charCodeAt(i);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 58%, 42%)`;
}

function buildInitialAvatar(name) {
  const el = document.createElement("span");
  el.className = "review-avatar";
  el.style.background = hashColor(name);
  el.textContent = (name.trim().charAt(0) || "?").toUpperCase();
  return el;
}

function buildAvatar(review) {
  if (!review.avatarUrl) return buildInitialAvatar(review.author);
  const img = document.createElement("img");
  img.className = "review-avatar review-avatar-img";
  img.src = review.avatarUrl;
  img.alt = "";
  img.width = 40;
  img.height = 40;
  img.loading = "lazy";
  img.addEventListener("error", () => img.replaceWith(buildInitialAvatar(review.author)), { once: true });
  return img;
}

function relativeTime(publishedAt, languageCode) {
  const locale = languageCode || document.documentElement.lang || "en";
  const then = new Date(publishedAt + "T00:00:00Z").getTime();
  const diffDays = Math.round((then - Date.now()) / 86400000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const absDays = Math.abs(diffDays);
  if (absDays < 1) return rtf.format(0, "day");
  if (absDays < 7) return rtf.format(diffDays, "day");
  if (absDays < 30) return rtf.format(Math.round(diffDays / 7), "week");
  if (absDays < 365) return rtf.format(Math.round(diffDays / 30), "month");
  return rtf.format(Math.round(diffDays / 365), "year");
}

// One <svg> per star, each independently clipped to show 0/half/full so we
// can render 1, 2, 3, 4.5 stars etc, not just "all 5 filled".
function buildStars(rating, size) {
  const wrap = document.createElement("div");
  wrap.className = "review-card-stars";
  wrap.setAttribute("aria-hidden", "true");
  const rounded = Math.max(0, Math.min(5, Math.round(rating * 2) / 2));
  for (let i = 1; i <= 5; i++) {
    const fraction = Math.max(0, Math.min(1, rounded - (i - 1)));
    const star = document.createElement("span");
    star.className = "star";
    if (size) { star.style.width = size + "px"; star.style.height = size + "px"; }
    star.innerHTML =
      `<svg class="icon star-bg" fill="currentColor"><use href="#i-star"/></svg>` +
      `<svg class="icon star-fg" fill="currentColor" style="clip-path: inset(0 ${100 - fraction * 100}% 0 0)"><use href="#i-star"/></svg>`;
    wrap.appendChild(star);
  }
  const label = document.createElement("span");
  label.className = "visually-hidden";
  label.textContent = `${rounded} out of 5 stars`;
  wrap.appendChild(label);
  return wrap;
}

function buildCard(review, onOpenDialog) {
  const card = document.createElement("article");
  card.className = "review-card";
  card.tabIndex = 0;
  card.dataset.id = review.id;

  const head = document.createElement("div");
  head.className = "review-card-head";
  const authorWrap = document.createElement("div");
  authorWrap.className = "review-author";
  authorWrap.appendChild(buildAvatar(review));
  const meta = document.createElement("div");
  const strong = document.createElement("strong");
  strong.textContent = review.author;
  const small = document.createElement("small");
  small.textContent = relativeTime(review.publishedAt, review.languageCode);
  meta.append(strong, small);
  authorWrap.appendChild(meta);
  const badge = document.createElement("span");
  badge.className = "google-logo";
  badge.setAttribute("aria-hidden", "true");
  badge.textContent = "G";
  head.append(authorWrap, badge);

  const stars = buildStars(review.rating);

  const blockquote = document.createElement("blockquote");
  blockquote.lang = review.languageCode || document.documentElement.lang || "en";
  blockquote.textContent = review.text;

  card.append(head, stars, blockquote);

  if (review.reviewUrl) {
    const link = document.createElement("a");
    link.className = "review-card-link";
    link.href = review.reviewUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Read on Google";
    link.addEventListener("click", (event) => event.stopPropagation());
    card.appendChild(link);
  }

  // Whether this card is clickable depends on whether its text is currently
  // clamped, which can change across breakpoints (font size, line-clamp vs
  // available width) — so the listeners always re-check the live class
  // instead of being attached only once at build time.
  card.addEventListener("click", (event) => {
    if (!card.classList.contains("is-clamped") || event.target.closest("a")) return;
    onOpenDialog(review);
  });
  card.addEventListener("keydown", (event) => {
    if (event.target !== card || !card.classList.contains("is-clamped")) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpenDialog(review);
    }
  });
  card._blockquote = blockquote;

  return card;
}

// Must run after the card is attached to the document with real layout —
// clamp can't be estimated from character count (breaks on CJK, emoji,
// long names) and needs an actual scrollHeight/clientHeight comparison.
function updateClampState(card) {
  const blockquote = card._blockquote;
  const clamped = blockquote.scrollHeight > blockquote.clientHeight + 1;
  card.classList.toggle("is-clamped", clamped);
  if (clamped) {
    card.setAttribute("role", "button");
    card.setAttribute("aria-haspopup", "dialog");
  } else {
    card.removeAttribute("role");
    card.removeAttribute("aria-haspopup");
  }
}

function buildDialog(root) {
  const dialog = document.createElement("dialog");
  dialog.className = "review-dialog";
  dialog.innerHTML = `
    <button type="button" class="review-dialog-close" aria-label="Close"><svg class="icon"><use href="#i-x"/></svg></button>
    <div class="review-dialog-head">
      <div class="review-author" data-slot="author"></div>
      <span class="google-logo" aria-hidden="true">G</span>
    </div>
    <div data-slot="stars"></div>
    <p data-slot="text"></p>
    <a data-slot="link" class="review-card-link" target="_blank" rel="noopener noreferrer" hidden>Read on Google</a>
  `;
  root.appendChild(dialog);
  const closeBtn = dialog.querySelector(".review-dialog-close");
  closeBtn.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close(); // click on backdrop
  });

  let lastTrigger = null;
  dialog.addEventListener("close", () => {
    if (lastTrigger) lastTrigger.focus();
  });

  return {
    open(review, trigger) {
      lastTrigger = trigger;
      const authorSlot = dialog.querySelector('[data-slot="author"]');
      authorSlot.replaceChildren(buildAvatar(review), (() => {
        const meta = document.createElement("div");
        const strong = document.createElement("strong");
        strong.textContent = review.author;
        const small = document.createElement("small");
        small.textContent = relativeTime(review.publishedAt, review.languageCode);
        meta.append(strong, small);
        return meta;
      })());
      dialog.querySelector('[data-slot="stars"]').replaceChildren(buildStars(review.rating, 17));
      const textSlot = dialog.querySelector('[data-slot="text"]');
      textSlot.textContent = review.text;
      textSlot.lang = review.languageCode || document.documentElement.lang || "en";
      const linkSlot = dialog.querySelector('[data-slot="link"]');
      if (review.reviewUrl) {
        linkSlot.href = review.reviewUrl;
        linkSlot.hidden = false;
      } else {
        linkSlot.hidden = true;
      }
      dialog.showModal();
    },
  };
}

export function mountReviewCarousel(root, reviews) {
  const viewport = root.querySelector(".review-viewport");
  const track = root.querySelector(".review-track");
  const prevBtn = root.querySelector(".carousel-controls [data-dir='prev']");
  const nextBtn = root.querySelector(".carousel-controls [data-dir='next']");
  const ratingNumberEl = root.querySelector("[data-slot='rating-number']");
  const ratingCountEl = root.querySelector("[data-slot='rating-count']");

  const dialogApi = buildDialog(root);
  const openDialog = (review) => {
    const trigger = track.querySelector(`.review-card[data-id="${CSS.escape(review.id)}"]:not([aria-hidden])`) || document.activeElement;
    dialogApi.open(review, trigger);
  };

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  ratingNumberEl.textContent = avgRating.toFixed(1);
  ratingCountEl.textContent = `Based on ${reviews.length} Google review${reviews.length === 1 ? "" : "s"}`;

  const realCards = reviews.map((review) => buildCard(review, openDialog));

  const total = realCards.length;
  let mode = null; // 'native' | 'paged'
  let perPage = 1;
  let looping = false;
  let page = 0; // current REAL page index (0-based), meaningful in 'paged' mode
  let trackPosition = 0; // index of the current page within the (possibly cloned) page list
  let pageGroups = []; // array of arrays of card elements (real, per page)
  let animating = false;
  let resizeRaf = null;

  function computePerPage() {
    // --per-page is declared on .review-track (see styles.css), not on the
    // viewport — custom properties inherit downward only, so reading it off
    // an ancestor always comes back empty regardless of container-query
    // state.
    const raw = getComputedStyle(track).getPropertyValue("--per-page").trim();
    const n = parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? n : 1;
  }

  function chunk(array, size) {
    const out = [];
    for (let i = 0; i < array.length; i += size) out.push(array.slice(i, i + size));
    return out;
  }

  function clearTrack() {
    track.replaceChildren();
  }

  function buildPageEl(cards, hidden) {
    const pageEl = document.createElement("div");
    pageEl.className = "review-page";
    cards.forEach((card) => pageEl.appendChild(card));
    if (hidden) pageEl.setAttribute("aria-hidden", "true");
    return pageEl;
  }

  function setupPaged(n) {
    mode = "paged";
    perPage = n;
    track.classList.remove("review-track-native");
    viewport.style.paddingRight = PEEK_PX + "px";
    pageGroups = chunk(realCards, perPage);
    looping = total > perPage;
    clearTrack();

    // Real pages hold the original card nodes; the loop clones (below) are
    // separate cloneNode copies, so a review's real node never appears
    // twice in the tree and interactive listeners are never duplicated.
    const realPageEls = pageGroups.map((cards) => buildPageEl(cards, false));

    let allPageEls = realPageEls;
    if (looping) {
      const lastPageClone = buildPageEl(pageGroups[pageGroups.length - 1].map((c) => cloneReal(c)), true);
      const firstPageClone = buildPageEl(pageGroups[0].map((c) => cloneReal(c)), true);
      allPageEls = [lastPageClone, ...realPageEls, firstPageClone];
      trackPosition = 1;
    } else {
      trackPosition = 0;
    }
    allPageEls.forEach((el) => track.appendChild(el));
    realCards.forEach(updateClampState);

    page = Math.min(page, pageGroups.length - 1);
    trackPosition = looping ? page + 1 : page;
    positionTrack(false);
    updateArrows();
  }

  function cloneReal(card) {
    const clone = card.cloneNode(true);
    clone.removeAttribute("tabindex");
    clone.removeAttribute("role");
    clone.removeAttribute("aria-haspopup");
    return clone;
  }

  function setupNative() {
    mode = "native";
    perPage = 1;
    looping = false;
    viewport.style.paddingRight = "";
    track.classList.add("review-track-native");
    track.style.transform = "";
    clearTrack();
    realCards.forEach((card) => track.appendChild(card));
    realCards.forEach(updateClampState);
    updateArrows();
  }

  function updateArrows() {
    const showArrows = mode === "paged" && (looping || pageGroups.length > 1);
    prevBtn.hidden = !showArrows;
    nextBtn.hidden = !showArrows;
    if (!showArrows) return;
    prevBtn.disabled = !looping && page === 0;
    nextBtn.disabled = !looping && page === pageGroups.length - 1;
  }

  function positionTrack(animate) {
    const pages = Array.from(track.children);
    const targetPage = pages[trackPosition];
    if (!targetPage) return;
    const offset = targetPage.offsetLeft;
    const useAnimation = animate && !prefersReducedMotion();
    if (!useAnimation) track.classList.add("no-transition");
    track.style.transform = `translate3d(${-offset}px, 0, 0)`;
    if (!useAnimation) {
      track.getBoundingClientRect(); // force reflow before re-enabling transitions
      track.classList.remove("no-transition");
    }
  }

  function goToPage(nextTrackPosition) {
    if (animating || mode !== "paged") return;
    const reduced = prefersReducedMotion();
    if (!reduced) {
      animating = true;
      track.classList.add("is-animating");
    }
    trackPosition = nextTrackPosition;
    page = looping
      ? ((trackPosition - 1) % pageGroups.length + pageGroups.length) % pageGroups.length
      : trackPosition;
    positionTrack(true);
    updateArrows();
    // With no animation there's no transitionend to settle the clone-wrap
    // bookkeeping, so do it synchronously instead.
    if (reduced) settleAfterMove();
  }

  function settleAfterMove() {
    animating = false;
    track.classList.remove("is-animating");
    if (!looping) return;
    const lastIndex = track.children.length - 1;
    if (trackPosition === lastIndex) {
      trackPosition = 1;
      positionTrack(false);
    } else if (trackPosition === 0) {
      trackPosition = pageGroups.length;
      positionTrack(false);
    }
  }

  track.addEventListener("transitionend", (event) => {
    if (event.target !== track || event.propertyName !== "transform") return;
    settleAfterMove();
  });
  track.addEventListener("transitioncancel", (event) => {
    if (event.target !== track || event.propertyName !== "transform") return;
    // The tab may have backgrounded mid-transition; finish the bookkeeping
    // as if it completed, so the carousel never gets stuck.
    settleAfterMove();
  });

  prevBtn.addEventListener("click", () => goToPage(trackPosition - 1));
  nextBtn.addEventListener("click", () => goToPage(trackPosition + 1));

  // Bring a focused card into view: jump to the page it belongs to.
  track.addEventListener("focusin", (event) => {
    if (mode !== "paged") return;
    const card = event.target.closest(".review-card");
    if (!card || card.hasAttribute("aria-hidden")) return;
    const idx = realCards.indexOf(card);
    if (idx === -1) return;
    const targetPage = Math.floor(idx / perPage);
    if (targetPage !== page) goToPage(looping ? targetPage + 1 : targetPage);
  });

  function applyMode() {
    const n = computePerPage();
    if (matchMediaNative()) {
      if (mode !== "native") setupNative();
    } else if (mode !== "paged" || n !== perPage) {
      setupPaged(n);
    } else {
      positionTrack(false); // same n, just re-measure in case sizes shifted
    }
  }

  // Based on the viewport's own width, not window.matchMedia — the whole
  // point of measuring the container (spec 4.2) is that a fixed sidebar can
  // put this element under 640px while the window itself is much wider, and
  // the mode switch needs to agree with computePerPage() about where that
  // line is, or the two can disagree right at the boundary (paged mode
  // rendered with per-page silently falling back to 1, instead of properly
  // switching to native scroll).
  function matchMediaNative() {
    return viewport.clientWidth < 640;
  }

  function scheduleApplyMode() {
    if (resizeRaf) cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(applyMode);
  }

  const resizeObserver = new ResizeObserver(scheduleApplyMode);
  resizeObserver.observe(viewport);

  scheduleApplyMode();
}
