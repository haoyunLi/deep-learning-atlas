export function hashParts(hash: string) {
  const value = hash.replace(/^#/, "") || "/";
  const split = value.indexOf("?");
  return {
    path: split < 0 ? value : value.slice(0, split),
    params: new URLSearchParams(split < 0 ? "" : value.slice(split + 1)),
  };
}
export function replaceHash(path: string, params: URLSearchParams) {
  const next = `#${path}${params.size ? `?${params.toString()}` : ""}`;
  if (window.location.hash === next) return;
  window.history.replaceState(null, "", next);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}
