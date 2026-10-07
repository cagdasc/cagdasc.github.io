export interface ClientMetaOptions {
  title: string;
  description: string;
  url?: string;
  image?: string;
  type?: string;
  jsonLd?: Record<string, any> | null;
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

function setCanonicalUrl(url: string) {
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

function setStructuredData(jsonLd: Record<string, any> | null | undefined) {
  const existingScript = document.getElementById('schema-jsonld');
  if (!jsonLd) {
    if (existingScript) existingScript.remove();
    return;
  }

  let script = existingScript as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = 'schema-jsonld';
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(jsonLd, null, 2);
}

export function updateDocumentMeta(options: ClientMetaOptions) {
  if (typeof document === 'undefined') return;

  // 1. Update Title
  document.title = options.title;

  // 2. Standard Meta Description
  setMetaTag('meta[name="description"]', 'name', 'description', options.description);

  const origin = window.location.origin;
  const currentUrl = options.url || window.location.href;
  const imageUrl = options.image || `${origin}/og/cv.png`;
  const ogType = options.type || 'website';

  // 3. OpenGraph Tags
  setMetaTag('meta[property="og:title"]', 'property', 'og:title', options.title);
  setMetaTag('meta[property="og:description"]', 'property', 'og:description', options.description);
  setMetaTag('meta[property="og:url"]', 'property', 'og:url', currentUrl);
  setMetaTag('meta[property="og:image"]', 'property', 'og:image', imageUrl);
  setMetaTag('meta[property="og:image:secure_url"]', 'property', 'og:image:secure_url', imageUrl);
  setMetaTag('meta[property="og:image:type"]', 'property', 'og:image:type', 'image/png');
  setMetaTag('meta[property="og:image:width"]', 'property', 'og:image:width', '1200');
  setMetaTag('meta[property="og:image:height"]', 'property', 'og:image:height', '630');
  setMetaTag('meta[property="og:type"]', 'property', 'og:type', ogType);
  setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', 'Cagdas Caglak');

  // 4. Twitter Tags
  setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', options.title);
  setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', options.description);
  setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', imageUrl);
  setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
  setMetaTag('meta[name="twitter:creator"]', 'name', 'twitter:creator', '@cagdascaglak');
  setMetaTag('meta[name="twitter:site"]', 'name', 'twitter:site', '@cagdascaglak');

  // 5. Canonical Link
  setCanonicalUrl(currentUrl);

  // 6. Schema.org JSON-LD Structured Data
  if (options.jsonLd !== undefined) {
    setStructuredData(options.jsonLd);
  }
}
