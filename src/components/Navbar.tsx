import React, { useState, useEffect } from 'react';
import {
  // Archive,
  BookOpen,
  FileText
} from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher';

export type NavbarTab = 'cv' | 'blog' | 'graveyard';

interface NavbarProps {
  activeTab: NavbarTab;
  setActiveTab: (tab: NavbarTab) => void;
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

  const navItems: Array<{ id: NavbarTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'cv', label: 'Resume', icon: FileText },
    { id: 'blog', label: 'Blog', icon: BookOpen },
    // { id: 'graveyard', label: 'Graveyard', icon: Archive },
  ];

  return (
    <header
      id="main-navbar"
      data-scrolled={scrolled ? 'true' : 'false'}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-200 no-print backdrop-blur-md border-b"
      style={{
        backgroundColor: 'var(--app-nav-bg)',
        borderColor: 'var(--app-border)',
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Left placeholder for symmetric layout */}
          <div className="w-10 hidden sm:block shrink-0" />

          {/* Centered Navigation Tabs: Resume and Blog */}
          <nav
            aria-label="Main navigation"
            className="flex items-center p-1 rounded-xl border shadow-xs"
            style={{
              backgroundColor: 'var(--app-surface-subtle)',
              borderColor: 'var(--app-border)',
            }}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id === 'cv' ? 'resume' : item.id}`}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 flex items-center gap-2 whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'shadow-xs font-semibold'
                      : 'hover:opacity-80'
                  }`}
                  style={{
                    backgroundColor: isActive ? 'var(--app-surface)' : 'transparent',
                    color: isActive ? 'var(--app-accent)' : 'var(--app-text-muted)',
                  }}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Side: Theme Selector */}
          <div className="flex items-center shrink-0">
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
};
