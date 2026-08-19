import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Tag, 
  Calendar, 
  ArrowRight, 
  Sparkles, 
  Filter, 
  X,
  Code2,
  Terminal,
  ChevronRight
} from 'lucide-react';
import { blogPostsData } from '../data/posts';
import { BlogPost } from '../types';

interface BlogSectionProps {
  onSelectArticle: (slug: string) => void;
}

export const BlogSection: React.FC<BlogSectionProps> = ({ onSelectArticle }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = useMemo(() => {
    const cats = new Set<string>();
    blogPostsData.forEach((post) => cats.add(post.category));
    return ['All', ...Array.from(cats)];
  }, []);

  const filteredPosts = useMemo(() => {
    return blogPostsData.filter((post) => {
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.summary.toLowerCase().includes(query) ||
        post.tags.some((t) => t.toLowerCase().includes(query)) ||
        post.category.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <section 
      id="blog-section" 
      className="pt-24 pb-20 md:pt-32 md:pb-28 transition-colors duration-200"
      style={{
        backgroundColor: 'var(--app-bg)',
        color: 'var(--app-text)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Banner */}
        <div className="max-w-3xl mb-12 space-y-4">
          <div 
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold border"
            style={{
              backgroundColor: 'var(--app-accent-bg)',
              borderColor: 'var(--app-accent-border)',
              color: 'var(--app-accent)',
            }}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Technical Engineering Blog</span>
          </div>
          <h1 
            className="text-3xl sm:text-5xl font-extrabold font-heading tracking-tight"
            style={{ color: 'var(--app-text)' }}
          >
            Articles
          </h1>
          <p 
            className="text-base sm:text-lg leading-relaxed"
            style={{ color: 'var(--app-text-secondary)' }}
          >
            A collection of experiments, technical findings, and lessons learned from building things.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div 
          className="p-4 sm:p-5 rounded-2xl border mb-10 space-y-4 shadow-xs"
          style={{
            backgroundColor: 'var(--app-surface-card)',
            borderColor: 'var(--app-border)',
          }}
        >
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            
            {/* Search Input */}
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="blog-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles by keyword, tag (e.g. Compose, KSP)..."
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm font-mono transition-all"
                style={{
                  backgroundColor: 'var(--app-surface-subtle)',
                  borderColor: 'var(--app-border)',
                  color: 'var(--app-text)',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Posts Counter */}
            <div className="text-xs font-mono self-end sm:self-center" style={{ color: 'var(--app-text-muted)' }}>
              Showing <span className="font-semibold" style={{ color: 'var(--app-accent)' }}>{filteredPosts.length}</span> of {blogPostsData.length} articles
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs font-mono mr-1 flex items-center gap-1" style={{ color: 'var(--app-text-muted)' }}>
              <Filter className="w-3 h-3" />
              <span>Category:</span>
            </span>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="px-3 py-1 rounded-lg text-xs font-mono transition-all duration-150 border"
                  style={{
                    backgroundColor: isSelected ? 'var(--app-accent)' : 'var(--app-surface-subtle)',
                    color: isSelected ? '#FFFFFF' : 'var(--app-text-secondary)',
                    borderColor: isSelected ? 'var(--app-accent)' : 'var(--app-border)',
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Articles Grid */}
        {filteredPosts.length === 0 ? (
          <div 
            className="p-12 text-center rounded-2xl border space-y-3 shadow-xs"
            style={{
              backgroundColor: 'var(--app-surface-card)',
              borderColor: 'var(--app-border)',
            }}
          >
            <p className="text-sm font-mono" style={{ color: 'var(--app-text-muted)' }}>No articles found matching your query.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="px-4 py-2 rounded-lg text-xs font-mono font-semibold border"
              style={{
                backgroundColor: 'var(--app-accent-bg)',
                borderColor: 'var(--app-accent-border)',
                color: 'var(--app-accent)',
              }}
            >
              Reset Search & Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                id={`article-card-${post.slug}`}
                onClick={() => onSelectArticle(post.slug)}
                className="rounded-2xl border p-6 sm:p-7 flex flex-col justify-between gap-6 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 group relative overflow-hidden shadow-xs"
                style={{
                  backgroundColor: 'var(--app-surface-card)',
                  borderColor: 'var(--app-border)',
                }}
              >
                {post.featured && (
                  <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none">
                    <div 
                      className="absolute transform rotate-45 text-white font-mono text-[9px] font-bold py-0.5 right-[-35px] top-[18px] w-[120px] text-center shadow-xs"
                      style={{ backgroundColor: 'var(--app-accent)' }}
                    >
                      FEATURED
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Category & Published Date */}
                  <div className="flex items-center justify-between gap-2 text-xs font-mono">
                    <span 
                      className="px-2.5 py-0.5 rounded-full border font-medium"
                      style={{
                        backgroundColor: 'var(--app-accent-bg)',
                        borderColor: 'var(--app-accent-border)',
                        color: 'var(--app-accent)',
                      }}
                    >
                      {post.category}
                    </span>
                  </div>

                  {/* Title & Summary */}
                  <div>
                    <h3 
                      className="text-lg sm:text-xl font-bold font-heading group-hover:opacity-80 transition-colors line-clamp-2 leading-snug"
                      style={{ color: 'var(--app-text)' }}
                    >
                      {post.title}
                    </h3>
                    <p 
                      className="text-xs sm:text-sm leading-relaxed mt-2.5 line-clamp-3"
                      style={{ color: 'var(--app-text-secondary)' }}
                    >
                      {post.summary}
                    </p>
                  </div>
                </div>

                {/* Bottom metadata */}
                <div 
                  className="space-y-3 pt-3 border-t"
                  style={{ borderColor: 'var(--app-border)' }}
                >
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.slice(0, 3).map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 rounded text-[10px] font-mono border"
                        style={{
                          backgroundColor: 'var(--app-chip-bg)',
                          borderColor: 'var(--app-chip-border)',
                          color: 'var(--app-chip-text)',
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div 
                    className="flex items-center justify-between pt-1 text-xs font-mono"
                    style={{ color: 'var(--app-text-muted)' }}
                  >
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 opacity-70" />
                      {post.publishedAt}
                    </span>
                    <span 
                      className="font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                      style={{ color: 'var(--app-accent)' }}
                    >
                      <span>Read</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

              </article>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
