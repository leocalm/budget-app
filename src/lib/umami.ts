export function initUmami(): void {
  const src = import.meta.env.VITE_UMAMI_SCRIPT_URL;
  const websiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID;
  if (!src || !websiteId) {
    return;
  }
  if (document.querySelector('script[data-umami-loader]')) {
    return;
  }

  const script = document.createElement('script');
  script.src = src;
  script.defer = true;
  script.dataset.websiteId = websiteId;
  script.dataset.umamiLoader = 'true';

  const hostOverride = import.meta.env.VITE_UMAMI_HOST_URL;
  if (hostOverride) {
    script.dataset.hostUrl = hostOverride;
  }

  document.head.appendChild(script);
}
