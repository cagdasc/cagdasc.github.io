import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Tag, 
  Calendar, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  Filter, 
  X,
  Code2,
  Terminal,
  ChevronRight
} from 'lucide-react';
import { blogPostsData } from '../data/blogPosts';
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
    <section id="blog-section" className="pt-24 pb-20 md:pt-32 md:pb-28 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Banner */}
        <div className="max-w-3xl mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-mono text-blue-600 font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Technical Engineering Blog</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-slate-900 tracking-tight">
            Articles & Android Engineering Insights
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Deep dives into Jetpack Compose, Kotlin Multiplatform, automated screenshot testing with KSP & Paparazzi, and high-scale mobile architectures.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 mb-10 space-y-4 shadow-xs">
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
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all font-mono"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Posts Counter */}
            <div className="text-xs font-mono text-slate-500 self-end sm:self-center">
              Showing <span className="text-blue-600 font-semibold">{filteredPosts.length}</span> of {blogPostsData.length} articles
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs font-mono text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              <span>Category:</span>
            </span>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-all duration-150 ${
                    isSelected
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Articles Grid */}
        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
            <p className="text-slate-500 text-sm font-mono">No articles found matching your query.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="px-4 py-2 rounded-lg bg-slate-100 text-xs font-mono text-blue-600 hover:bg-blue-50 font-semibold"
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
                className="rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md p-6 sm:p-7 flex flex-col justify-between gap-6 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 group relative overflow-hidden shadow-xs"
              >
                {post.featured && (
                  <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none">
                    <div className="absolute transform rotate-45 bg-blue-600 text-white font-mono text-[9px] font-bold py-0.5 right-[-35px] top-[18px] w-[120px] text-center shadow-xs">
                      FEATURED
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Category & Read Time */}
                  <div className="flex items-center justify-between gap-2 text-xs font-mono">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                      {post.category}
                    </span>
                    <div className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>

                  {/* Title & Summary */}
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold font-heading text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2.5 line-clamp-3">
                      {post.summary}
                    </p>
                  </div>
                </div>

                {/* Bottom metadata */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.slice(0, 3).map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-mono text-slate-600 border border-slate-200"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs font-mono text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {post.publishedAt}
                    </span>
                    <span className="text-blue-600 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
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
