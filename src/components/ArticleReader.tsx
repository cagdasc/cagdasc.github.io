import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Tag, 
  Share2, 
  Copy, 
  Check, 
  BookOpen, 
  Twitter, 
  Linkedin, 
  Bookmark,
  ChevronRight,
  Terminal,
  User,
  Sparkles,
  List
} from 'lucide-react';
import { BlogPost } from '../types';
import { blogPostsData } from '../data/blogPosts';
import { profileData } from '../data/cvData';

interface ArticleReaderProps {
  post: BlogPost;
  onBack: () => void;
  onSelectArticle: (slug: string) => void;
}

// Custom Code block renderer with copy button
const CodeBlock: React.FC<{
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}> = ({ inline, className, children }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const codeText = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (inline) {
    return (
      <code className="px-1.5 py-0.5 rounded bg-slate-100 text-blue-700 font-mono text-xs border border-slate-200">
        {children}
      </code>
    );
  }

  return (
    <div className="relative my-6 rounded-xl border border-slate-800 bg-[#0F172A] overflow-hidden group shadow-md text-slate-200">
      {/* Code header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
          </div>
          <span className="text-slate-300 font-semibold uppercase">{language || 'code'}</span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          title="Copy Code to Clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="text-[11px]">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code body */}
      <div className="p-4 overflow-x-auto text-xs sm:text-sm font-mono text-blue-300/90 leading-relaxed">
        <pre className="!m-0 !p-0 bg-transparent">
          <code>{children}</code>
        </pre>
      </div>
    </div>
  );
};

export const ArticleReader: React.FC<ArticleReaderProps> = ({
  post,
  onBack,
  onSelectArticle
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [tableOfContents, setTableOfContents] = useState<{ id: string; text: string }[]>([]);

  useEffect(() => {
    // Scroll to top upon opening article
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Extract H2 headings for Table of Contents
    const headings: { id: string; text: string }[] = [];
    const lines = post.content.split('\n');
    lines.forEach((line) => {
      if (line.startsWith('## ')) {
        const text = line.replace('## ', '').trim();
        const id = text.toLowerCase().replace(/[^\w]+/g, '-');
        headings.push({ id, text });
      }
    });
    setTableOfContents(headings);

    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight > 0) {
        const scrollPercent = (totalScroll / windowHeight) * 100;
        setScrollProgress(scrollPercent);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [post]);

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}#blog/${post.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareTwitter = () => {
    const text = `"${post.title}" by @cagdascaglak`;
    const url = `${window.location.origin}${window.location.pathname}#blog/${post.slug}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const handleShareLinkedIn = () => {
    const url = `${window.location.origin}${window.location.pathname}#blog/${post.slug}`;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
  };

  // Find related posts
  const otherPosts = blogPostsData.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <article id="article-reader-view" className="pt-24 pb-20 relative bg-[#F8FAFC]">
      
      {/* Top Reading Progress Bar */}
      <div 
        className="fixed top-0 left-0 right-0 h-1 bg-slate-200 z-50 pointer-events-none"
        style={{ top: '64px' }}
      >
        <div 
          className="h-full bg-blue-600 transition-all duration-75"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation back bar */}
        <div className="flex items-center justify-between gap-4 mb-8 pt-2">
          <button
            id="article-back-btn"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 border border-slate-200 text-xs font-mono transition-all group shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to All Articles</span>
          </button>

          {/* Share Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="p-2 rounded-lg bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-900 border border-slate-200 transition-colors shadow-xs"
              title="Copy Article Link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handleShareTwitter}
              className="p-2 rounded-lg bg-white hover:bg-slate-50 text-slate-500 hover:text-blue-500 border border-slate-200 transition-colors shadow-xs"
              title="Share on X / Twitter"
            >
              <Twitter className="w-4 h-4" />
            </button>
            <button
              onClick={handleShareLinkedIn}
              className="p-2 rounded-lg bg-white hover:bg-slate-50 text-slate-500 hover:text-blue-600 border border-slate-200 transition-colors shadow-xs"
              title="Share on LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Article Header Card */}
        <header className="space-y-4 pb-8 mb-8 border-b border-slate-200">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-blue-50 text-blue-700 border border-blue-200">
              {post.category}
            </span>
            <div className="flex items-center gap-3 text-xs font-mono text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {post.publishedAt}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {post.readTime}
              </span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-slate-900 tracking-tight leading-tight">
            {post.title}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            {post.summary}
          </p>

          {/* Author Badge */}
          <div className="flex items-center gap-3 pt-4">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold font-heading text-sm shadow-xs">
              ÇÇ
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">{profileData.name}</div>
              <div className="text-xs text-slate-500 font-mono">Senior Android Developer @ Nutmeg (J.P. Morgan)</div>
            </div>
          </div>
        </header>

        {/* Quick Table of Contents if multiple sections exist */}
        {tableOfContents.length > 1 && (
          <div className="mb-10 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-blue-600 mb-3 font-semibold">
              <List className="w-4 h-4" />
              <span>Table of Contents</span>
            </div>
            <div className="space-y-1.5">
              {tableOfContents.map((item, idx) => (
                <a
                  key={idx}
                  href={`#${item.id}`}
                  className="block text-xs sm:text-sm text-slate-600 hover:text-blue-600 transition-colors py-0.5"
                >
                  <span className="text-slate-400 font-mono mr-2">0{idx + 1}.</span>
                  {item.text}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Markdown Content Body */}
        <div className="prose-custom text-slate-700 text-sm sm:text-base leading-relaxed space-y-4">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code: CodeBlock,
              h2: ({ children }) => {
                const text = String(children);
                const id = text.toLowerCase().replace(/[^\w]+/g, '-');
                return (
                  <h2 id={id} className="text-xl sm:text-2xl font-bold font-heading text-slate-900 pt-6 pb-2 border-b border-slate-200">
                    {children}
                  </h2>
                );
              },
              h3: ({ children }) => (
                <h3 className="text-lg sm:text-xl font-bold font-heading text-slate-900 pt-4 pb-1">
                  {children}
                </h3>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline underline-offset-4 decoration-blue-300 hover:decoration-blue-600 transition-all font-medium"
                >
                  {children}
                </a>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto my-6 rounded-xl border border-slate-200 bg-white">
                  <table className="w-full text-left text-xs sm:text-sm font-mono">{children}</table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-slate-50 text-slate-800 border-b border-slate-200">{children}</thead>
              ),
              th: ({ children }) => (
                <th className="px-4 py-3 font-semibold">{children}</th>
              ),
              td: ({ children }) => (
                <td className="px-4 py-2.5 border-b border-slate-100 text-slate-700">{children}</td>
              )
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Tags Footer */}
        <div className="mt-12 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Tags:</span>
            {post.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs font-mono text-slate-600 shadow-xs"
              >
                #{tag}
              </span>
            ))}
          </div>

          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-xs font-mono text-slate-700 border border-slate-200 transition-colors shadow-xs"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-semibold">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Article</span>
              </>
            )}
          </button>
        </div>

        {/* Related Articles Section */}
        {otherPosts.length > 0 && (
          <div className="mt-16 pt-10 border-t border-slate-200 space-y-6">
            <h3 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>More Technical Articles</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {otherPosts.map((other) => (
                <div
                  key={other.slug}
                  onClick={() => onSelectArticle(other.slug)}
                  className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 cursor-pointer transition-all duration-200 flex flex-col justify-between group shadow-xs hover:shadow-md"
                >
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono text-blue-600 uppercase font-semibold">
                      {other.category}
                    </span>
                    <h4 className="text-base font-bold font-heading text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {other.title}
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {other.summary}
                    </p>
                  </div>

                  <div className="pt-4 flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>{other.readTime}</span>
                    <span className="text-blue-600 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Read</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </article>
  );
};
