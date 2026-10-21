// Scroll position of the community list, kept in module scope so it survives
// navigating to a special view and back (client-side routing) without touching
// sessionStorage, which is shared between iframe containers and can leak state.
let savedScrollY = 0;
let hasSaved = false;

export function saveCommunityScroll() {
  savedScrollY = window.scrollY || 0;
  hasSaved = true;
}

export function getCommunityScroll() {
  return hasSaved ? savedScrollY : 0;
}

export function clearCommunityScroll() {
  hasSaved = false;
  savedScrollY = 0;
}