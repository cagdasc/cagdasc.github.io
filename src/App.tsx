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
import { initGA, trackPageView } from './utils/analytics';
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
      const hash = window.location.hash.replace(/^#\/?/, '');

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

      // 3. Check hash e.g. #blog/agent-behind-the-emulator
      if (hash.startsWith('blog/')) {
        const slug = hash.replace('blog/', '');
        const post = blogPostsData.find((p) => p.slug === slug);
        if (post) {
          setActiveTab('blog');
          setSelectedArticleSlug(slug);
          return;
        }
      }

      if (hash === 'blog' || pathname === '/blog') {
        setActiveTab('blog');
        setSelectedArticleSlug(null);
        return;
      }

      if (hash === 'cv' || hash === '' || hash === 'resume' || pathname === '/' || pathname === '/cv') {
        setActiveTab('cv');
        setSelectedArticleSlug(null);
      }
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
    let image = `${window.location.origin}/api/og?type=cv`;
    let type = 'website';

    if (activeTab === 'blog') {
      if (selectedArticleSlug && activeArticle) {
        path = `#blog/${selectedArticleSlug}`;
        title = `${activeArticle.title} | Cagdas Caglak`;
        description = activeArticle.summary;
        url = `${window.location.origin}/blog/${selectedArticleSlug}`;
        image = `${window.location.origin}/api/og?slug=${selectedArticleSlug}`;
        type = 'article';
      } else {
        path = '#blog';
        title = 'Blog & Technical Articles | Cagdas Caglak';
        description = 'A collection of experiments, technical findings, and lessons learned from building software.';
        url = `${window.location.origin}/blog`;
      }
    }

    // Update document title & OpenGraph tags in live DOM
    updateDocumentMeta({
      title,
      description,
      url,
      image,
      type,
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

