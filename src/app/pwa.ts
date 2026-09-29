const isPreview = () => {
  const { hostname } = window.location;
  const localOrigin =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname.endsWith(".local");
  const previewHost = hostname.startsWith("id-preview--") || hostname.startsWith("preview--");
  const disabledByQuery = new URLSearchParams(window.location.search).get("sw") === "off";
  return (
    !import.meta.env.PROD ||
    window.self !== window.top ||
    localOrigin ||
    previewHost ||
    disabledByQuery
  );
};
export async function registerOffline() {
  if (!("serviceWorker" in navigator)) return;
  if (isPreview()) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      registrations
        .filter((registration) =>
          [registration.active, registration.waiting, registration.installing].some((worker) =>
            worker?.scriptURL.endsWith("/sw.js"),
          ),
        )
        .map((registration) => registration.unregister()),
    );
    return;
  }
  const { registerSW } = await import("virtual:pwa-register");
  registerSW({ immediate: true });
}
