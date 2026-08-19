import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  ArrowLeft, 
  Calendar, 
  Tag, 
  Share2, 
  Copy, 
  Check, 
  BookOpen, 
  Twitter, 
  Linkedin, 
  ChevronRight, 
  List 
} from 'lucide-react';
import { BlogPost } from '../types';
import { blogPostsData } from '../data/posts';
import { trackEvent } from '../utils/analytics';

interface ArticleReaderProps {
  post: BlogPost;
  onBack: () => void;
  onSelectArticle: (slug: string) => void;
}

// Custom Code block renderer for fenced code blocks
const PreBlock: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [copied, setCopied] = useState(false);

  // Extract code text and language from inner <code> child
  let codeText = '';
  let language = '';

  if (React.isValidElement(children)) {
    const codeProps = children.props as { className?: string; children?: React.ReactNode };
    if (codeProps) {
      const match = /language-(\w+)/.exec(codeProps.className || '');
      language = match ? match[1] : '';
      codeText = String(codeProps.children || '').replace(/\n$/, '');
    }
  } else {
    codeText = String(children || '').replace(/\n$/, '');
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
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
      <div className="p-4 overflow-x-auto text-xs sm:text-sm font-mono text-emerald-300/90 leading-relaxed">
        <pre className="!m-0 !p-0 bg-transparent font-mono">
          {children}
        </pre>
      </div>
    </div>
  );
};

// Custom Code renderer for inline and block code elements
const CodeComponent: React.FC<{
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}> = ({ className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || '');
  const isBlock = Boolean(match);

  if (isBlock) {
    return (
      <code className={`${className || ''} font-mono`} {...props}>
        {children}
      </code>
    );
  }

  return (
    <code 
      className="px-1.5 py-0.5 rounded text-xs font-mono font-medium border"
      style={{
        backgroundColor: 'var(--app-surface-subtle)',
        borderColor: 'var(--app-border)',
        color: 'var(--app-accent)',
      }}
      {...props}
    >
      {children}
    </code>
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
    trackEvent('copy_article_link', { article_slug: post.slug, article_title: post.title });
  };

  const handleShareTwitter = () => {
    const text = `"${post.title}" by @cagdascaglak`;
    const url = `${window.location.origin}${window.location.pathname}#blog/${post.slug}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    trackEvent('share_article', { platform: 'twitter', article_slug: post.slug });
  };

  const handleShareLinkedIn = () => {
    const url = `${window.location.origin}${window.location.pathname}#blog/${post.slug}`;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
    trackEvent('share_article', { platform: 'linkedin', article_slug: post.slug });
  };

  // Find related posts
  const otherPosts = blogPostsData.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <article 
      id="article-reader-view" 
      className="pt-24 pb-20 relative transition-colors duration-200"
      style={{
        backgroundColor: 'var(--app-bg)',
        color: 'var(--app-text)',
      }}
    >
      
      {/* Top Reading Progress Bar */}
      <div 
        className="fixed top-0 left-0 right-0 h-1 z-50 pointer-events-none"
        style={{ 
          top: '64px',
          backgroundColor: 'var(--app-border)' 
        }}
      >
        <div 
          className="h-full transition-all duration-75"
          style={{ 
            width: `${scrollProgress}%`,
            backgroundColor: 'var(--app-accent)'
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation back bar */}
        <div className="flex items-center justify-between gap-4 mb-8 pt-2">
          <button
            id="article-back-btn"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-mono transition-all group shadow-xs hover:opacity-80"
            style={{
              backgroundColor: 'var(--app-surface-card)',
              borderColor: 'var(--app-border)',
              color: 'var(--app-text)',
            }}
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to All Articles</span>
          </button>

          {/* Share Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="p-2 rounded-lg border transition-colors shadow-xs hover:opacity-80"
              style={{
                backgroundColor: 'var(--app-surface-card)',
                borderColor: 'var(--app-border)',
                color: 'var(--app-text-muted)',
              }}
              title="Copy Article Link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handleShareTwitter}
              className="p-2 rounded-lg border transition-colors shadow-xs hover:opacity-80"
              style={{
                backgroundColor: 'var(--app-surface-card)',
                borderColor: 'var(--app-border)',
                color: 'var(--app-text-muted)',
              }}
              title="Share on X / Twitter"
            >
              <Twitter className="w-4 h-4" />
            </button>
            <button
              onClick={handleShareLinkedIn}
              className="p-2 rounded-lg border transition-colors shadow-xs hover:opacity-80"
              style={{
                backgroundColor: 'var(--app-surface-card)',
                borderColor: 'var(--app-border)',
                color: 'var(--app-text-muted)',
              }}
              title="Share on LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Article Header Card */}
        <header 
          className="space-y-4 pb-8 mb-8 border-b"
          style={{ borderColor: 'var(--app-border)' }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span 
              className="px-3 py-1 rounded-full text-xs font-mono font-medium border"
              style={{
                backgroundColor: 'var(--app-accent-bg)',
                borderColor: 'var(--app-accent-border)',
                color: 'var(--app-accent)',
              }}
            >
              {post.category}
            </span>
            <div className="flex items-center gap-1.5 text-xs font-mono" style={{ color: 'var(--app-text-muted)' }}>
              <Calendar className="w-3.5 h-3.5 opacity-70" />
              <span>{post.publishedAt}</span>
            </div>
          </div>

          <h1 
            className="text-2xl sm:text-4xl lg:text-5xl font-extrabold font-heading tracking-tight leading-tight"
            style={{ color: 'var(--app-text)' }}
          >
            {post.title}
          </h1>

          <p 
            className="text-base sm:text-lg font-normal leading-relaxed"
            style={{ color: 'var(--app-text-secondary)' }}
          >
            {post.summary}
          </p>
        </header>

        {/* Quick Table of Contents if multiple sections exist */}
        {tableOfContents.length > 1 && (
          <div 
            className="mb-10 p-5 rounded-2xl border shadow-xs"
            style={{
              backgroundColor: 'var(--app-surface-card)',
              borderColor: 'var(--app-border)',
            }}
          >
            <div 
              className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider mb-3 font-semibold"
              style={{ color: 'var(--app-accent)' }}
            >
              <List className="w-4 h-4" />
              <span>Table of Contents</span>
            </div>
            <div className="space-y-1.5">
              {tableOfContents.map((item, idx) => (
                <a
                  key={idx}
                  href={`#${item.id}`}
                  className="block text-xs sm:text-sm transition-colors py-0.5 hover:underline"
                  style={{ color: 'var(--app-text-secondary)' }}
                >
                  <span className="font-mono mr-2 opacity-60">0{idx + 1}.</span>
                  {item.text}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Markdown Content Body */}
        <div 
          className="prose-custom text-sm sm:text-base leading-relaxed space-y-4"
          style={{ color: 'var(--app-text-secondary)' }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              pre: PreBlock,
              code: CodeComponent,
              h2: ({ children }) => {
                const text = String(children);
                const id = text.toLowerCase().replace(/[^\w]+/g, '-');
                return (
                  <h2 
                    id={id} 
                    className="text-xl sm:text-2xl font-bold font-heading pt-6 pb-2 border-b"
                    style={{ 
                      color: 'var(--app-text)',
                      borderColor: 'var(--app-border)',
                    }}
                  >
                    {children}
                  </h2>
                );
              },
              h3: ({ children }) => (
                <h3 
                  className="text-lg sm:text-xl font-bold font-heading pt-4 pb-1"
                  style={{ color: 'var(--app-text)' }}
                >
                  {children}
                </h3>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 font-medium transition-all"
                  style={{ 
                    color: 'var(--app-accent)',
                  }}
                >
                  {children}
                </a>
              ),
              table: ({ children }) => (
                <div 
                  className="overflow-x-auto my-6 rounded-xl border"
                  style={{
                    backgroundColor: 'var(--app-surface-card)',
                    borderColor: 'var(--app-border)',
                  }}
                >
                  <table className="w-full text-left text-xs sm:text-sm font-mono">{children}</table>
                </div>
              ),
              thead: ({ children }) => (
                <thead 
                  className="border-b font-semibold"
                  style={{
                    backgroundColor: 'var(--app-surface-subtle)',
                    color: 'var(--app-text)',
                    borderColor: 'var(--app-border)',
                  }}
                >
                  {children}
                </thead>
              ),
              th: ({ children }) => (
                <th className="px-4 py-3 font-semibold">{children}</th>
              ),
              td: ({ children }) => (
                <td 
                  className="px-4 py-2.5 border-b"
                  style={{
                    borderColor: 'var(--app-border)',
                    color: 'var(--app-text-secondary)',
                  }}
                >
                  {children}
                </td>
              )
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Tags Footer */}
        <div 
          className="mt-12 pt-6 border-t flex flex-wrap items-center justify-between gap-4"
          style={{ borderColor: 'var(--app-border)' }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono" style={{ color: 'var(--app-text-muted)' }}>Tags:</span>
            {post.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-md border text-xs font-mono shadow-xs"
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

          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors shadow-xs hover:opacity-80"
            style={{
              backgroundColor: 'var(--app-surface-card)',
              borderColor: 'var(--app-border)',
              color: 'var(--app-text)',
            }}
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500 font-semibold">Link Copied!</span>
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
          <div 
            className="mt-16 pt-10 border-t space-y-6"
            style={{ borderColor: 'var(--app-border)' }}
          >
            <h3 
              className="text-xl font-bold font-heading flex items-center gap-2"
              style={{ color: 'var(--app-text)' }}
            >
              <BookOpen className="w-5 h-5" style={{ color: 'var(--app-accent)' }} />
              <span>More Technical Articles</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {otherPosts.map((other) => (
                <div
                  key={other.slug}
                  onClick={() => onSelectArticle(other.slug)}
                  className="p-5 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between group shadow-xs hover:opacity-90"
                  style={{
                    backgroundColor: 'var(--app-surface-card)',
                    borderColor: 'var(--app-border)',
                  }}
                >
                  <div className="space-y-2">
                    <span 
                      className="text-[11px] font-mono uppercase font-semibold"
                      style={{ color: 'var(--app-accent)' }}
                    >
                      {other.category}
                    </span>
                    <h4 
                      className="text-base font-bold font-heading group-hover:opacity-80 transition-colors line-clamp-2"
                      style={{ color: 'var(--app-text)' }}
                    >
                      {other.title}
                    </h4>
                    <p className="text-xs line-clamp-2" style={{ color: 'var(--app-text-secondary)' }}>
                      {other.summary}
                    </p>
                  </div>

                  <div 
                    className="pt-4 flex items-center justify-between text-xs font-mono"
                    style={{ color: 'var(--app-text-muted)' }}
                  >
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 opacity-70" />
                      {other.publishedAt}
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
              ))}
            </div>
          </div>
        )}

      </div>
    </article>
  );
};
