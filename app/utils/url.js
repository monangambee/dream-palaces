/**
 * Cinema Deep-Link URLs
 *
 * Lets a specific cinema be shared and reopened via a query string
 * (?view=constellation&cinema=<slug>), using the Slug field already
 * present on every Airtable record.
 */

/**
 * Read the `cinema` slug off the current URL, if present.
 * @returns {string|null}
 */
export function parseCinemaSlugFromUrl() {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("cinema");
}

/**
 * Build a shareable URL that reopens the given cinema's popup.
 * @param {string} slug
 * @returns {string}
 */
export function buildCinemaShareUrl(slug) {
  const url = new URL(window.location.href);
  url.search = new URLSearchParams({
    view: "constellation",
    cinema: slug,
  }).toString();
  url.hash = "";
  return url.toString();
}
