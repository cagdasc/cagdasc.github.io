import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { OnePageCV } from './components/OnePageCV';
import { BlogSection } from './components/BlogSection';
import { ArticleReader } from './components/ArticleReader';
import { GitHubWorkflowModal } from './components/GitHubWorkflowModal';
import { Footer } from './components/Footer';
import { PrintCVView } from './components/PrintCVView';
import { blogPostsData } from './data/posts';
import { ThemeProvider } from './context/ThemeContext';
import { initGA, trackPageView, trackTabSwitch } from './utils/analytics';
import { updateDocumentMeta } from './utils/meta';

function AppContent() {
  const [activeTab, setActiveTab] = useState<'cv' | 'blog'>('cv');
  const [selectedArticleSlug, setSelectedArticleSlug] = useState<string | null>(null);
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState<boolean>(false);

  // Initialize GA4 on mount
  useEffect(() => {
    initGA();
  }, []);

  // Universal Route Synchronizer (Handles /blog/:slug, query ?post=..., and hash #blog/:slug)
  useEffect(() => {
    const parseCurrentRoute = () => {
      const pathname = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      const rawHash = window.location.hash.replace(/^#\/?/, '');

      // 1. Check path e.g. /blog/agent-behind-the-emulator or /posts/agent-behind-the-emulator
      const pathMatch = pathname.match(/^\/(?:blog|posts)\/([a-zA-Z0-9_-]+)/);
      if (pathMatch) {
        const slug = pathMatch[1];
        const post = blogPostsData.find((p) => p.slug === slug);
        if (post) {
          setActiveTab('blog');
          setSelectedArticleSlug(slug);
          return;
        }
      }

      // 2. Check query param ?post=agent-behind-the-emulator
      const querySlug = searchParams.get('post');
      if (querySlug) {
        const post = blogPostsData.find((p) => p.slug === querySlug);
        if (post) {
          setActiveTab('blog');
          setSelectedArticleSlug(querySlug);
          return;
        }
      }

      // 3. Check hash e.g. #blog/agent-behind-the-emulator or #blog/agent-behind-the-emulator#section-heading
      if (rawHash.startsWith('blog/')) {
        const withoutBlog = rawHash.slice(5);
        const slug = withoutBlog.split(/[#?]/)[0];
        const post = blogPostsData.find((p) => p.slug === slug);
        if (post) {
          setActiveTab('blog');
          setSelectedArticleSlug(slug);
          return;
        }
      }

      if (rawHash === 'blog' || pathname === '/blog' || pathname === '/blog/') {
        setActiveTab('blog');
        setSelectedArticleSlug(null);
        return;
      }

      if (rawHash === 'cv' || rawHash === 'resume' || pathname === '/cv' || pathname === '/resume') {
        setActiveTab('cv');
        setSelectedArticleSlug(null);
        return;
      }

      // Root path with no hash or empty hash -> CV default
      if (!rawHash && (pathname === '/' || pathname === '' || pathname === '/index.html')) {
        setActiveTab('cv');
        setSelectedArticleSlug(null);
        return;
      }

      // If rawHash matches a post slug directly:
      const directPost = blogPostsData.find((p) => p.slug === rawHash);
      if (directPost) {
        setActiveTab('blog');
        setSelectedArticleSlug(directPost.slug);
        return;
      }

      // If rawHash is an in-page anchor (e.g. #giving-an-llm-hands), do NOT switch to CV!
      // Keep current active view.
    };

    parseCurrentRoute();
    window.addEventListener('hashchange', parseCurrentRoute);
    window.addEventListener('popstate', parseCurrentRoute);
    return () => {
      window.removeEventListener('hashchange', parseCurrentRoute);
      window.removeEventListener('popstate', parseCurrentRoute);
    };
  }, []);

  const activeArticle = selectedArticleSlug
    ? blogPostsData.find((p) => p.slug === selectedArticleSlug) || null
    : null;

  // Track page view and synchronize document metadata
  useEffect(() => {
    let path = '#cv';
    let title = 'Cagdas Caglak | Senior Android Developer';
    let description = 'Senior Android Developer at Nutmeg (J.P. Morgan) specializing in Jetpack Compose, Kotlin Multiplatform, clean architecture, and developer tooling.';
    let url = `${window.location.origin}/`;
    let image = `${window.location.origin}/og/cv.png`;
    let type = 'website';
    let jsonLd: Record<string, any> | null = null;

    if (activeTab === 'blog') {
      if (selectedArticleSlug && activeArticle) {
        path = `#blog/${selectedArticleSlug}`;
        title = `${activeArticle.title} | Cagdas Caglak`;
        description = activeArticle.summary;
        url = `${window.location.origin}/blog/${selectedArticleSlug}`;
        image = `${window.location.origin}/og/${selectedArticleSlug}.png`;
        type = 'article';
        jsonLd = {
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          'headline': activeArticle.title,
          'description': activeArticle.summary,
          'image': image,
          'datePublished': activeArticle.publishedAt,
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
            '@id': url
          },
          'keywords': activeArticle.tags.join(', ')
        };
      } else {
        path = '#blog';
        title = 'Blog & Technical Articles | Cagdas Caglak';
        description = 'A collection of experiments, technical findings, and lessons learned from building software.';
        url = `${window.location.origin}/blog`;
        image = `${window.location.origin}/og/blog.png`;
        jsonLd = {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          'name': 'Blog & Technical Articles | Cagdas Caglak',
          'description': description,
          'url': url,
          'author': {
            '@type': 'Person',
            'name': 'Cagdas Caglak',
            'url': 'https://cagdas.caglak.cc/'
          }
        };
      }
    } else {
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        'mainEntity': {
          '@type': 'Person',
          'name': 'Cagdas Caglak',
          'jobTitle': 'Senior Android Developer',
          'worksFor': {
            '@type': 'Organization',
            'name': 'J.P. Morgan (Nutmeg)',
            'url': 'https://www.nutmeg.com'
          },
          'url': 'https://cagdas.caglak.cc/',
          'sameAs': [
            'https://github.com/cagdasc',
            'https://linkedin.com/in/cagdascaglak',
            'https://twitter.com/cagdascaglak',
            'https://medium.com/@cagdascaglak'
          ],
          'knowsAbout': [
            'Android Development',
            'Kotlin',
            'Jetpack Compose',
            'Kotlin Multiplatform',
            'KSP',
            'Paparazzi',
            'Coroutines & Flow',
            'Clean Architecture',
            'AI Tooling',
            'Developer Experience'
          ]
        }
      };
    }

    // Update document title & OpenGraph tags in live DOM
    updateDocumentMeta({
      title,
      description,
      url,
      image,
      type,
      jsonLd,
    });

    trackPageView(path, title);
  }, [activeTab, selectedArticleSlug, activeArticle]);

  const handleSelectArticle = (slug: string) => {
    setSelectedArticleSlug(slug);
    setActiveTab('blog');
    window.location.hash = `blog/${slug}`;
  };

  const handleBackToBlogList = () => {
    setSelectedArticleSlug(null);
    window.location.hash = 'blog';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (tab: 'cv' | 'blog') => {
    trackTabSwitch(tab);
    setActiveTab(tab);
    if (tab === 'cv') {
      setSelectedArticleSlug(null);
      window.location.hash = 'cv';
    } else {
      setSelectedArticleSlug(null);
      window.location.hash = 'blog';
    }
  };

  return (
    <div 
      className="min-h-screen min-h-[100dvh] w-full overflow-x-hidden transition-colors duration-200"
      style={{
        backgroundColor: 'var(--app-bg)',
        color: 'var(--app-text)',
      }}
    >
      {/* Top Fixed Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onOpenWorkflowModal={() => setIsWorkflowModalOpen(true)}
        activeArticleSlug={selectedArticleSlug}
      />

      {/* Main View Content */}
      <main className="no-print">
        {activeTab === 'cv' ? (
          <div className="animate-in fade-in duration-200">
            <OnePageCV onGoToBlog={() => handleTabChange('blog')} />
          </div>
        ) : (
          <div className="animate-in fade-in duration-200">
            {activeArticle ? (
              <ArticleReader
                post={activeArticle}
                onBack={handleBackToBlogList}
                onSelectArticle={handleSelectArticle}
              />
            ) : (
              <BlogSection onSelectArticle={handleSelectArticle} />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* GitHub Workflow Modal */}
      <GitHubWorkflowModal
        isOpen={isWorkflowModalOpen}
        onClose={() => setIsWorkflowModalOpen(false)}
      />

      {/* High-Resolution Clean Print / PDF Resume View */}
      <PrintCVView />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

