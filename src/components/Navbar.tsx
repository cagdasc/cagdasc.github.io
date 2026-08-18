import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  FileText
} from 'lucide-react';

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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 no-print ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs' 
          : 'bg-white/80 backdrop-blur-sm border-b border-slate-200/80'
      }`}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-center h-16">
          {/* Navigation Tabs: Resume and Blog */}
          <nav className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 shadow-xs">
            <button
              id="nav-tab-resume"
              onClick={() => {
                setActiveTab('cv');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 flex items-center gap-2 ${
                activeTab === 'cv'
                  ? 'bg-white text-blue-600 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
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
                  ? 'bg-white text-blue-600 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Blog</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                
              </span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
