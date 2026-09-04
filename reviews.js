// Real reviews from the business's Google Business Profile, entered by hand.
// See README.md "Reviews" section for how to add a new one and why the text
// is copied literally.
//
// Note on `publishedAt`: the source screenshots only showed a relative label
// ("1 year ago", "3 months ago") for most of these, not an exact date, and
// one (ElPresiETE) showed no time at all. The dates below are reconstructed
// approximately from those labels relative to the day they were transcribed
// (early September 2026) — verify against the Business Profile and correct
// if you get access to exact dates.

/** @typedef {{
 *   id: string,
 *   author: string,
 *   rating: number,
 *   text: string,
 *   publishedAt: string,
 *   reviewUrl?: string,
 *   avatarUrl?: string,
 *   languageCode?: string,
 * }} Review */

/** @type {Review[]} */
export const reviews = [
  {
    id: "bronwyn-tilbury-2026-06",
    author: "Bronwyn Tilbury",
    rating: 5,
    text: "Excellent friendly and efficient service and great price! Highly recommend!",
    publishedAt: "2026-06-04",
    languageCode: "en",
  },
  {
    id: "maria-frade-2025-09",
    author: "María Frade",
    rating: 5,
    text: "Incredible service from start to finish! Marta and Bruno were professional, efficient, and handled everything with great care. They arrived on time and made the whole moving process stress-free. Highly recommend for anyone looking for reliable removals!",
    publishedAt: "2025-09-04",
    languageCode: "en",
  },
  {
    id: "elpresiete-2025-08",
    author: "ElPresiETE",
    rating: 5,
    text: "Impeccable moving service. Punctual, efficient, and careful with everything. Marta and Bruno made the process quick and stress-free. Great price and excellent service. 100% recommended.",
    publishedAt: "2025-08-25",
    languageCode: "en",
  },
  {
    id: "iloi-nunes-2025-08",
    author: "Iloi Nunes",
    rating: 5,
    text: "Pontualidade e eficiência, eu super recomendo.",
    publishedAt: "2025-08-20",
    languageCode: "pt",
  },
  {
    id: "gabriela-nunes-2025-08",
    author: "Gabriela Nunes",
    rating: 5,
    text: "Ótimos profissionais, recomendo!",
    publishedAt: "2025-08-18",
    languageCode: "pt",
  },
  {
    id: "extra-milestone-2025-08",
    author: "The Extra Milestone",
    rating: 5,
    text: "We had to move some chairs and desks, as we were relocating to a larger office, and Bruno and Marta took care of the transport. We're truly grateful for their work!",
    publishedAt: "2025-08-10",
    languageCode: "en",
  },
];
