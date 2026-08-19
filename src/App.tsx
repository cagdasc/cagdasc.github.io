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

function AppContent() {
  const [activeTab, setActiveTab] = useState<'cv' | 'blog'>('cv');
  const [selectedArticleSlug, setSelectedArticleSlug] = useState<string | null>(null);
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState<boolean>(false);

  // Hash route synchronizer for GitHub Pages deep linking
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (hash.startsWith('blog/')) {
        const slug = hash.replace('blog/', '');
        const post = blogPostsData.find((p) => p.slug === slug);
        if (post) {
          setActiveTab('blog');
          setSelectedArticleSlug(slug);
          return;
        }
      }
      if (hash === 'blog') {
        setActiveTab('blog');
        setSelectedArticleSlug(null);
        return;
      }
      if (hash === 'cv' || hash === '' || hash === 'resume') {
        setActiveTab('cv');
        setSelectedArticleSlug(null);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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

  const activeArticle = selectedArticleSlug
    ? blogPostsData.find((p) => p.slug === selectedArticleSlug) || null
    : null;

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

