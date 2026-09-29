const isPublishedOrigin = () => {
  const { hostname } = window.location;
  const localOrigin =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname.endsWith(".local");
  const previewHost = hostname.startsWith("id-preview--") || hostname.startsWith("preview--");
  const disabledByQuery = new URLSearchParams(window.location.search).get("sw") === "off";
  const publishedUrl = import.meta.env.VITE_PUBLISHED_URL;
  let matchesPublishedOrigin = false;
  if (publishedUrl) {
    try {
      const published = new URL(publishedUrl);
      matchesPublishedOrigin =
        window.location.origin === published.origin &&
        window.location.pathname.startsWith(published.pathname);
    } catch {
      matchesPublishedOrigin = false;
    }
  }
  return (
    !import.meta.env.PROD ||
    !matchesPublishedOrigin ||
    window.self !== window.top ||
    localOrigin ||
    previewHost ||
    disabledByQuery
  );
};
export async function registerOffline() {
  if (!("serviceWorker" in navigator)) return;
  if (!isPublishedOrigin()) {
    const scriptPath = `${import.meta.env.BASE_URL}sw.js`;
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      registrations
        .filter((registration) =>
          [registration.active, registration.waiting, registration.installing].some((worker) =>
            worker?.scriptURL.endsWith(scriptPath),
          ),
        )
        .map((registration) => registration.unregister()),
    );
    return;
  }
  const { registerSW } = await import("virtual:pwa-register");
  registerSW({ immediate: true });
}
