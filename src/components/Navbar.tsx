import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  FileText
} from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher';

interface NavbarProps {
  activeTab: 'cv' | 'blog';
  setActiveTab: (tab: 'cv' | 'blog') => void;
  onOpenWorkflowModal?: () => void;
  activeArticleSlug?: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      id="main-navbar"
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-200 no-print backdrop-blur-md border-b"
      style={{
        backgroundColor: 'var(--app-nav-bg)',
        borderColor: 'var(--app-border)',
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Left placeholder for symmetric layout */}
          <div className="w-10 hidden sm:block" />

          {/* Centered Navigation Tabs: Resume and Blog */}
          <nav 
            className="flex items-center p-1 rounded-xl border shadow-xs"
            style={{
              backgroundColor: 'var(--app-surface-subtle)',
              borderColor: 'var(--app-border)',
            }}
          >
            <button
              id="nav-tab-resume"
              onClick={() => {
                setActiveTab('cv');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 flex items-center gap-2 ${
                activeTab === 'cv'
                  ? 'shadow-xs font-semibold'
                  : 'hover:opacity-80'
              }`}
              style={{
                backgroundColor: activeTab === 'cv' ? 'var(--app-surface)' : 'transparent',
                color: activeTab === 'cv' ? 'var(--app-accent)' : 'var(--app-text-muted)',
              }}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Resume</span>
            </button>

            <button
              id="nav-tab-blog"
              onClick={() => {
                setActiveTab('blog');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 flex items-center gap-2 ${
                activeTab === 'blog'
                  ? 'shadow-xs font-semibold'
                  : 'hover:opacity-80'
              }`}
              style={{
                backgroundColor: activeTab === 'blog' ? 'var(--app-surface)' : 'transparent',
                color: activeTab === 'blog' ? 'var(--app-accent)' : 'var(--app-text-muted)',
              }}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Blog</span>
            </button>
          </nav>

          {/* Right Side: Theme & Dark Blue Alternatives Selector */}
          <div className="flex items-center">
            <ThemeSwitcher />
          </div>

        </div>
      </div>
    </header>
  );
};

