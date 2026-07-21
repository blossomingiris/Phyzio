import { useLocation } from "react-router";

/**
 * Whether there's a previous entry in this browser tab's history that the SPA
 * itself pushed (as opposed to the entry the user landed on directly, e.g. via
 * a bookmark, typed URL, or link opened in a new tab).
 *
 * React Router's history stamps every entry with an `idx` in `history.state`,
 * starting at 0 for the entry the app was first loaded on. `idx > 0` means at
 * least one in-app navigation happened before the current page, so navigating
 * back lands on a real previous page (restoring its query string, scroll
 * position, etc.) instead of leaving the app or 404-ing.
 */
export function useCanGoBack() {
  // Subscribes this component to location changes so the check is re-read on
  // every navigation, not just on mount.
  useLocation();

  return (window.history.state?.idx ?? 0) > 0;
}
