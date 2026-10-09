import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

if (!fs.existsSync(distDir)) {
  console.error('dist directory does not exist. Run vite build first.');
  process.exit(1);
}

const templatePath = path.join(distDir, 'index.html');
if (!fs.existsSync(templatePath)) {
  console.error('dist/index.html not found.');
  process.exit(1);
}

let baseTemplate = fs.readFileSync(templatePath, 'utf8');

// Update dist/index.html home page image to use valid PNG
const updatedIndexHtml = baseTemplate
  .replace(/content="https:\/\/cagdas\.caglak\.cc\/api\/og\?type=cv"/g, 'content="https://cagdas.caglak.cc/og/cv.png"')
  .replace(/content="image\/svg\+xml"/g, 'content="image/png"');

fs.writeFileSync(templatePath, updatedIndexHtml, 'utf8');
console.log('Updated dist/index.html with real PNG OpenGraph image');

function replaceMeta(html, { title, description, url, image, type = 'article', jsonLd = null, assetPrefix = './' }) {
  let result = html;

  // Fix relative asset paths for subdirectories
  if (assetPrefix !== './') {
    result = result.replace(/src="\.\/assets\//g, `src="${assetPrefix}assets/`);
    result = result.replace(/href="\.\/assets\//g, `href="${assetPrefix}assets/`);
  }

  // Title
  result = result.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
  
  // Description
  result = result.replace(/<meta\s+name="description"\s+content=".*?"\s*\/?>/, `<meta name="description" content="${description}" />`);

  // OpenGraph
  result = result.replace(/<meta\s+property="og:title"\s+content=".*?"\s*\/?>/, `<meta property="og:title" content="${title}" />`);
  result = result.replace(/<meta\s+property="og:description"\s+content=".*?"\s*\/?>/, `<meta property="og:description" content="${description}" />`);
  result = result.replace(/<meta\s+property="og:type"\s+content=".*?"\s*\/?>/, `<meta property="og:type" content="${type}" />`);
  result = result.replace(/<meta\s+property="og:url"\s+content=".*?"\s*\/?>/, `<meta property="og:url" content="${url}" />`);
  result = result.replace(/<meta\s+property="og:image"\s+content=".*?"\s*\/?>/, `<meta property="og:image" content="${image}" />`);
  result = result.replace(/<meta\s+property="og:image:secure_url"\s+content=".*?"\s*\/?>/, `<meta property="og:image:secure_url" content="${image}" />`);
  result = result.replace(/<meta\s+property="og:image:type"\s+content=".*?"\s*\/?>/, `<meta property="og:image:type" content="image/png" />`);

  // Twitter
  result = result.replace(/<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/, `<meta name="twitter:title" content="${title}" />`);
  result = result.replace(/<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/, `<meta name="twitter:description" content="${description}" />`);
  result = result.replace(/<meta\s+name="twitter:image"\s+content=".*?"\s*\/?>/, `<meta name="twitter:image" content="${image}" />`);

  // Canonical link
  const canonicalTag = `<link rel="canonical" href="${url}" />`;
  if (!result.includes('rel="canonical"')) {
    result = result.replace('</head>', `  ${canonicalTag}\n</head>`);
  } else {
    result = result.replace(/<link\s+rel="canonical"\s+href=".*?"\s*\/?>/, canonicalTag);
  }

  // Schema.org JSON-LD
  if (jsonLd) {
    const jsonLdTag = `  <script id="schema-jsonld" type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n  </script>\n`;
    if (result.includes('<script id="schema-jsonld"')) {
      result = result.replace(/<script id="schema-jsonld"[\s\S]*?<\/script>/, jsonLdTag.trim());
    } else {
      result = result.replace('</head>', `${jsonLdTag}</head>`);
    }
  }

  return result;
}

// 1. Generate /blog/index.html
const blogDir = path.join(distDir, 'blog');
if (!fs.existsSync(blogDir)) {
  fs.mkdirSync(blogDir, { recursive: true });
}

const blogIndexHtml = replaceMeta(baseTemplate, {
  title: 'Blog & Technical Articles | Cagdas Caglak',
  description: 'A collection of deep-dive articles on Android architecture, Kotlin Multiplatform, Paparazzi screenshot testing, and LLM AI agents.',
  url: 'https://cagdas.caglak.cc/blog',
  image: 'https://cagdas.caglak.cc/og/blog.png',
  type: 'website',
  assetPrefix: '../'
});

fs.writeFileSync(path.join(blogDir, 'index.html'), blogIndexHtml, 'utf8');
console.log('Generated: dist/blog/index.html');

// 2. Generate /blog/agent-behind-the-emulator/index.html
const posts = [
  {
    slug: 'agent-behind-the-emulator',
    title: 'The Agent Behind the Emulator | Cagdas Caglak',
    summary: 'A journey from giving an LLM tools to control an emulator to understanding the architecture needed to make an agent reliably interact with and test real applications.',
    publishedAt: '2026-08-19',
    tags: ['AI Agent', 'LLM', 'Emulator', 'Testing', 'Automation']
  }
];

posts.forEach((post) => {
  const postDir = path.join(blogDir, post.slug);
  if (!fs.existsSync(postDir)) {
    fs.mkdirSync(postDir, { recursive: true });
  }

  const postUrl = `https://cagdas.caglak.cc/blog/${post.slug}`;
  const imageUrl = `https://cagdas.caglak.cc/og/${post.slug}.png`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': post.title.replace(' | Cagdas Caglak', ''),
    'description': post.summary,
    'image': imageUrl,
    'datePublished': post.publishedAt,
    'author': {
      '@type': 'Person',
      'name': 'Cagdas Caglak',
      'url': 'https://cagdas.caglak.cc/'
    },
    'publisher': {
      '@type': 'Person',
      'name': 'Cagdas Caglak'
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': postUrl
    }
  };

  const postHtml = replaceMeta(baseTemplate, {
    title: post.title,
    description: post.summary,
    url: postUrl,
    image: imageUrl,
    type: 'article',
    jsonLd,
    assetPrefix: '../../'
  });

  fs.writeFileSync(path.join(postDir, 'index.html'), postHtml, 'utf8');
  console.log(`Generated: dist/blog/${post.slug}/index.html`);
});

// 3. Generate /links/index.html
const linksDir = path.join(distDir, 'links');
if (!fs.existsSync(linksDir)) {
  fs.mkdirSync(linksDir, { recursive: true });
}

const linksIndexHtml = replaceMeta(baseTemplate, {
  title: 'Cagdas Caglak | Links & Bio',
  description: 'Quick links to Cagdas Caglak\'s GitHub, LinkedIn, Personal Portfolio, Engineering Articles, and Droidcon London 2025 presentation.',
  url: 'https://cagdas.caglak.cc/links',
  image: 'https://cagdas.caglak.cc/og/cv.png',
  type: 'profile',
  assetPrefix: '../',
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    'name': 'Cagdas Caglak | Quick Links & Bio',
    'url': 'https://cagdas.caglak.cc/links',
    'mainEntity': {
      '@type': 'Person',
      'name': 'Cagdas Caglak',
      'jobTitle': 'Senior Android Developer',
      'url': 'https://cagdas.caglak.cc/'
    }
  }
});

fs.writeFileSync(path.join(linksDir, 'index.html'), linksIndexHtml, 'utf8');
console.log('Generated: dist/links/index.html');

console.log('All static blog and links pages pre-rendered successfully!');
