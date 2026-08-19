export interface ClientMetaOptions {
  title: string;
  description: string;
  url?: string;
  image?: string;
  type?: string;
}

function setMetaTag(selector: string, attributeName: string, attributeValue: string, content: string) {
  let element = document.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

export function updateDocumentMeta(options: ClientMetaOptions) {
  if (typeof document === 'undefined') return;

  // 1. Update Title
  document.title = options.title;

  // 2. Standard Meta Description
  setMetaTag('meta[name="description"]', 'name', 'description', options.description);

  const origin = window.location.origin;
  const currentUrl = options.url || window.location.href;
  const imageUrl = options.image || `${origin}/api/og?type=cv`;
  const ogType = options.type || 'website';

  // 3. OpenGraph Tags
  setMetaTag('meta[property="og:title"]', 'property', 'og:title', options.title);
  setMetaTag('meta[property="og:description"]', 'property', 'og:description', options.description);
  setMetaTag('meta[property="og:url"]', 'property', 'og:url', currentUrl);
  setMetaTag('meta[property="og:image"]', 'property', 'og:image', imageUrl);
  setMetaTag('meta[property="og:type"]', 'property', 'og:type', ogType);
  setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', 'Cagdas Caglak');

  // 4. Twitter Tags
  setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', options.title);
  setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', options.description);
  setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', imageUrl);
  setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
}
