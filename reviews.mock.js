// Dev-only edge-case fixtures for manually exercising the review carousel.
// NEVER imported by index.html or shipped to production — see README.md.
// Open dev-review-mocks.html locally to render the carousel against these.

/** @type {import("./reviews.js").Review[]} */
export const mockReviews = [
  {
    id: "mock-very-long",
    author: "Longwinded Larry",
    rating: 5,
    text: "This review is intentionally extremely long to make sure the card's 4-line clamp, fixed card height and the 'read more' dialog all work correctly when the text is far longer than a typical review, including what happens when someone writes an entire essay about how their sofa was wrapped. ".repeat(4),
    publishedAt: "2026-01-01",
    languageCode: "en",
  },
  {
    id: "mock-very-short",
    author: "Q",
    rating: 5,
    text: "Great!",
    publishedAt: "2026-02-01",
    languageCode: "en",
  },
  {
    id: "mock-one-star",
    author: "Unhappy Customer",
    rating: 1,
    text: "Not what I expected, would not use again.",
    publishedAt: "2026-03-01",
    languageCode: "en",
  },
  {
    id: "mock-half-star",
    author: "Middling Mary",
    rating: 3.5,
    text: "It was fine, nothing special but nothing wrong either.",
    publishedAt: "2026-03-15",
    languageCode: "en",
  },
  {
    id: "mock-long-name",
    author: "Thisisonereallyquiteunusuallylongsinglewordsurnamewithnobreaks",
    rating: 4,
    text: "Testing overflow-wrap with an unbroken long name in the header.",
    publishedAt: "2026-04-01",
    languageCode: "en",
  },
  {
    id: "mock-non-latin",
    author: "田中太郎",
    rating: 5,
    text: "とても丁寧な対応で、荷物も傷つけずに運んでいただきました。ありがとうございました。",
    publishedAt: "2026-04-10",
    languageCode: "ja",
  },
  {
    id: "mock-emoji",
    author: "Emoji Fan",
    rating: 5,
    text: "Best move ever! \u{1F4E6}\u{1F69A}\u{1F4A8} So happy \u{1F604}\u{1F44D}",
    publishedAt: "2026-05-01",
    languageCode: "en",
  },
  {
    id: "mock-with-link",
    author: "Linked Review",
    rating: 5,
    text: "This one has a reviewUrl to test the 'Read on Google' footer link rendering and target/rel attributes.",
    publishedAt: "2026-05-10",
    reviewUrl: "https://www.google.com/maps",
    languageCode: "en",
  },
  {
    id: "mock-bad-avatar",
    author: "Broken Avatar",
    rating: 5,
    text: "This one has an invalid avatarUrl to test the onerror fallback to the initial avatar.",
    publishedAt: "2026-05-15",
    avatarUrl: "https://example.invalid/does-not-exist.jpg",
    languageCode: "en",
  },
];
