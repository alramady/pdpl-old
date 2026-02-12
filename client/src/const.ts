export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Local login URL - no OAuth dependency
export const getLoginUrl = (returnPath?: string) => {
  const path = returnPath || window.location.pathname;
  if (path === "/login") return "/login";
  return `/login?redirect=${encodeURIComponent(path)}`;
};
