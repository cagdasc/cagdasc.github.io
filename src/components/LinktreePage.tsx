import React, { useState, useId, useMemo } from 'react';
import {
  Github,
  Linkedin,
  Mail,
  Globe,
  BookOpen,
  FileText,
  Presentation,
  Smartphone,
  Terminal,
  ExternalLink,
  Share2,
  QrCode,
  Check,
  Copy,
  X,
  MapPin,
  Sparkles,
  ArrowUpRight,
  Sun,
  Moon
} from 'lucide-react';
import { generateFancyQrSvg } from '../utils/fancyQr';
import { linksProfileData, SocialLinkItem } from '../data/linksData';
import { useTheme } from '../context/ThemeContext';

interface LinktreePageProps {
  onNavigateHome?: () => void;
  onNavigateBlog?: () => void;
}

export const LinktreePage: React.FC<LinktreePageProps> = ({ onNavigateHome, onNavigateBlog }) => {
  const { isDark, toggleTheme } = useTheme();
  const [copied, setCopied] = useState<boolean>(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Generate verified Emerald Dots QR Code (no monogram)
  const qrSvg = useMemo(() => {
    try {
      const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://cagdas.caglak.cc/links';
      return generateFancyQrSvg(currentUrl, {
        theme: 'emerald-matrix',
        dotShape: 'dots',
        showCenterLogo: false,
        size: 280,
      });
    } catch (err) {
      console.error('Failed to generate fancy QR code', err);
      return '';
    }
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleCopyLink = async () => {
    const currentUrl = window.location.href;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(currentUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = currentUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      showToast('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Could not copy link');
    }
  };

  const handleShare = async () => {
    const currentUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${linksProfileData.name} | Links`,
          text: `${linksProfileData.name} - ${linksProfileData.title}`,
          url: currentUrl,
        });
      } catch (err) {
        // User cancelled or share failed, fallback to copy
        if ((err as Error).name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const renderIcon = (iconName: SocialLinkItem['iconName'], className: string = 'w-5 h-5') => {
    switch (iconName) {
      case 'Github':
        return <Github className={className} />;
      case 'Linkedin':
        return <Linkedin className={className} />;
      case 'Mail':
        return <Mail className={className} />;
      case 'Globe':
        return <Globe className={className} />;
      case 'BookOpen':
        return <BookOpen className={className} />;
      case 'FileText':
        return <FileText className={className} />;
      case 'Presentation':
        return <Presentation className={className} />;
      case 'Smartphone':
        return <Smartphone className={className} />;
      case 'Terminal':
        return <Terminal className={className} />;
      default:
        return <ExternalLink className={className} />;
    }
  };

  const handleItemClick = (e: React.MouseEvent<HTMLAnchorElement>, link: SocialLinkItem) => {
    // If the link is for home page or blog within this site, enable seamless SPA transition
    if (link.id === 'home-portfolio' && onNavigateHome) {
      e.preventDefault();
      onNavigateHome();
      window.location.hash = 'cv';
      return;
    }
    if (link.id === 'blog' && onNavigateBlog) {
      e.preventDefault();
      onNavigateBlog();
      window.location.hash = 'blog';
      return;
    }
  };

  return (
    <div 
      className="min-h-screen min-h-[100dvh] w-full flex flex-col items-center justify-between py-10 px-4 sm:px-6 relative selection:bg-blue-500/20"
      style={{
        backgroundColor: 'var(--app-bg)',
        color: 'var(--app-text)',
      }}
    >
      {/* Background subtle radial glow / pattern */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-40 [background-size:24px_24px]"
        style={{
          backgroundImage: 'radial-gradient(var(--app-border) 1px, transparent 1px)',
        }}
      />

      {/* Floating Action Bar at top-right (Share, QR, Theme) */}
      <header className="w-full max-w-xl flex items-center justify-between mb-8 z-10">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide border shadow-xs"
            style={{
              backgroundColor: 'var(--app-surface)',
              borderColor: 'var(--app-border)',
              color: 'var(--app-text-secondary)',
            }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Bio & Links</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* QR Code button */}
          <button
            onClick={() => setIsQrModalOpen(true)}
            className="p-2.5 rounded-full border transition-all duration-200 shadow-xs hover:scale-105 active:scale-95"
            style={{
              backgroundColor: 'var(--app-surface)',
              borderColor: 'var(--app-border)',
              color: 'var(--app-text)',
            }}
            title="Show QR Code"
            aria-label="Show QR Code"
          >
            <QrCode className="w-4 h-4" />
          </button>

          {/* Share / Copy button */}
          <button
            onClick={handleShare}
            className="p-2.5 rounded-full border transition-all duration-200 shadow-xs hover:scale-105 active:scale-95"
            style={{
              backgroundColor: 'var(--app-surface)',
              borderColor: 'var(--app-border)',
              color: 'var(--app-text)',
            }}
            title="Share Profile Link"
            aria-label="Share Profile Link"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full border transition-all duration-200 shadow-xs hover:scale-105 active:scale-95"
            style={{
              backgroundColor: 'var(--app-surface)',
              borderColor: 'var(--app-border)',
              color: 'var(--app-text)',
            }}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </header>

      {/* Main Linktree Card Container */}
      <main className="w-full max-w-xl z-10 flex flex-col items-center">
        {/* Profile Card Header */}
        <div className="flex flex-col items-center text-center space-y-4 mb-8">
          {/* Avatar / Monogram */}
          <div className="relative group">
            <div 
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 p-1 shadow-lg transition-transform duration-300 group-hover:scale-105 flex items-center justify-center relative overflow-hidden"
              style={{
                borderColor: 'var(--app-accent)',
                backgroundColor: 'var(--app-surface)',
              }}
            >
              <div 
                className="w-full h-full rounded-full flex flex-col items-center justify-center font-heading font-extrabold text-2xl sm:text-3xl text-white shadow-inner"
                style={{
                  background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 50%, #0F172A 100%)',
                }}
              >
                <span>ÇÇ</span>
              </div>
            </div>

            {/* Verified badge */}
            {/*
            <div 
              className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border shadow-xs flex items-center gap-1"
              style={{
                backgroundColor: 'var(--app-surface)',
                borderColor: 'var(--app-border)',
                color: 'var(--app-accent)',
              }}
            >
              <Sparkles className="w-2.5 h-2.5 text-blue-500" />
              <span>Lead</span>
            </div>
             */}
          </div>

          {/* Name & Handle */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight" style={{ color: 'var(--app-text)' }}>
              {linksProfileData.name}
            </h1>
          </div>

          {/* Headline & Badges */}
          <div className="space-y-2 max-w-md">
            <p className="text-sm sm:text-base font-medium" style={{ color: 'var(--app-text-secondary)' }}>
              {linksProfileData.title} · <span className="font-semibold text-blue-500">{linksProfileData.company}</span>
            </p>
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--app-text-muted)' }}>
              {linksProfileData.shortBio}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
              <span 
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border shadow-2xs font-medium"
                style={{
                  backgroundColor: 'var(--app-surface)',
                  borderColor: 'var(--app-border)',
                  color: 'var(--app-text-muted)',
                }}
              >
                <MapPin className="w-3 h-3 text-rose-500" />
                <span>{linksProfileData.location}</span>
              </span>
              {/*
              <span 
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border shadow-2xs font-medium"
                style={{
                  backgroundColor: 'var(--app-surface)',
                  borderColor: 'var(--app-border)',
                  color: 'var(--app-text-muted)',
                }}
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>{linksProfileData.verifiedBadge}</span>
              </span>
               */}
            </div>
          </div>

          {/* Quick Social Icon Row */}
          <div className="flex items-center justify-center gap-3 pt-2">
            {linksProfileData.socials.github && (
              <a
                href={linksProfileData.socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full border transition-all duration-200 hover:-translate-y-0.5 shadow-xs"
                style={{
                  backgroundColor: 'var(--app-surface)',
                  borderColor: 'var(--app-border)',
                  color: 'var(--app-text)',
                }}
                title="GitHub Profile"
                aria-label="GitHub Profile"
              >
                <Github className="w-4 h-4" />
              </a>
            )}

            {linksProfileData.socials.linkedin && (
              <a
                href={linksProfileData.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full border transition-all duration-200 hover:-translate-y-0.5 shadow-xs"
                style={{
                  backgroundColor: 'var(--app-surface)',
                  borderColor: 'var(--app-border)',
                  color: 'var(--app-text)',
                }}
                title="LinkedIn Profile"
                aria-label="LinkedIn Profile"
              >
                <Linkedin className="w-4 h-4 text-blue-500" />
              </a>
            )}

            {linksProfileData.socials.email && (
              <a
                href={`mailto:${linksProfileData.socials.email}`}
                className="p-2.5 rounded-full border transition-all duration-200 hover:-translate-y-0.5 shadow-xs"
                style={{
                  backgroundColor: 'var(--app-surface)',
                  borderColor: 'var(--app-border)',
                  color: 'var(--app-text)',
                }}
                title="Send Email"
                aria-label="Send Email"
              >
                <Mail className="w-4 h-4 text-rose-500" />
              </a>
            )}
          </div>
        </div>

        {/* Links List */}
        <div className="w-full space-y-3.5">
          {linksProfileData.links.map((link) => {
            const isExternal = link.url.startsWith('http') || link.url.startsWith('mailto:');
            
            return (
              <a
                key={link.id}
                href={link.url}
                onClick={(e) => handleItemClick(e, link)}
                target={isExternal && !link.url.startsWith('mailto:') ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className={`group relative flex items-center justify-between p-4 sm:p-4.5 rounded-2xl border transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 overflow-hidden ${
                  link.highlighted
                    ? 'border-[var(--app-accent)] shadow-xs'
                    : 'border-[var(--app-border)] hover:border-[var(--app-accent)]'
                }`}
                style={{
                  backgroundColor: 'var(--app-surface)',
                }}
              >
                {/* Subtle highlight gradient on hover */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                  style={{
                    background: 'linear-gradient(90deg, var(--app-accent-bg) 0%, transparent 100%)',
                  }}
                />

                <div className="flex items-center gap-3.5 sm:gap-4 relative z-10 min-w-0 pr-3">
                  {/* Icon with hover highlight */}
                  <div 
                    className={`p-2.5 rounded-xl border flex-shrink-0 transition-all duration-200 group-hover:scale-105 ${
                      link.highlighted
                        ? 'border-[var(--app-accent-border)] bg-[var(--app-accent-bg)] text-[var(--app-accent)]'
                        : 'border-[var(--app-border)] bg-[var(--app-surface-subtle)] text-[var(--app-text)] group-hover:border-[var(--app-accent-border)] group-hover:bg-[var(--app-accent-bg)] group-hover:text-[var(--app-accent)]'
                    }`}
                  >
                    {renderIcon(link.iconName)}
                  </div>

                  {/* Title & Subtitle */}
                  <div className="min-w-0 text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm sm:text-base group-hover:text-[var(--app-accent)] transition-colors truncate" style={{ color: 'var(--app-text)' }}>
                        {link.title}
                      </span>
                      {link.badge && (
                        <span 
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide border uppercase transition-colors"
                          style={{
                            backgroundColor: link.highlighted ? 'var(--app-accent-bg)' : 'var(--app-surface-subtle)',
                            borderColor: link.highlighted ? 'var(--app-accent-border)' : 'var(--app-border)',
                            color: link.highlighted ? 'var(--app-accent)' : 'var(--app-text-muted)',
                          }}
                        >
                          {link.badge}
                        </span>
                      )}
                    </div>
                    {link.subtitle && (
                      <p className="text-xs sm:text-sm truncate mt-0.5" style={{ color: 'var(--app-text-muted)' }}>
                        {link.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Arrow / Action indicator with hover highlight & micro-lift */}
                <div 
                  className="relative z-10 p-1.5 rounded-lg transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  style={{ color: 'var(--app-text-muted)' }}
                >
                  <ArrowUpRight className="w-4 h-4 group-hover:text-[var(--app-accent)] transition-colors" />
                </div>
              </a>
            );
          })}
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="w-full max-w-xl text-center mt-12 pt-6 border-t z-10"
        style={{
          borderColor: 'var(--app-border)',
          color: 'var(--app-text-muted)',
        }}
      >
        <p className="text-xs font-mono">
          {linksProfileData.name} · Senior Android Developer
        </p>
        <p className="text-[11px] mt-1 opacity-70">
          Personal Links & Hub · London, UK
        </p>
      </footer>

      {/* Fancy QR Code Modal */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
          <div 
            className="w-full max-w-md rounded-3xl p-6 sm:p-7 border shadow-2xl relative flex flex-col items-center animate-in zoom-in-95 duration-200 my-auto"
            style={{
              backgroundColor: 'var(--app-surface)',
              borderColor: 'var(--app-border)',
              color: 'var(--app-text)',
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsQrModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full border transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              style={{
                borderColor: 'var(--app-border)',
                color: 'var(--app-text-muted)',
              }}
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Title */}
            <div className="text-center mb-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase border mb-2"
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  borderColor: 'rgba(16, 185, 129, 0.28)',
                  color: '#10B981',
                }}
              >
                <Sparkles className="w-3 h-3" />
                <span>QR Code</span>
              </div>
              <h3 className="font-heading font-extrabold text-xl tracking-tight" style={{ color: 'var(--app-text)' }}>
                Scan to Open Profile
              </h3>
            </div>

            {/* Clean Emerald Dots QR Vector Container */}
            <div className="p-3.5 sm:p-4 rounded-3xl bg-white border border-slate-200/80 shadow-lg mb-6 flex items-center justify-center transition-transform hover:scale-[1.02]">
              {qrSvg ? (
                <div 
                  className="w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center rounded-2xl overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-slate-400 font-mono text-xs">
                  Generating QR...
                </div>
              )}
            </div>

            {/* Bottom Row: Copy URL / Done */}
            <div className="w-full flex gap-2">
              <button
                onClick={handleCopyLink}
                className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-xs border flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{
                  backgroundColor: 'var(--app-surface-subtle)',
                  borderColor: 'var(--app-border)',
                  color: 'var(--app-text)',
                }}
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied URL!' : 'Copy Profile URL'}</span>
              </button>

              <button
                onClick={() => setIsQrModalOpen(false)}
                className="py-2.5 px-5 rounded-xl font-semibold text-xs transition-all text-white hover:opacity-90 active:scale-95 shadow-sm"
                style={{
                  backgroundColor: 'var(--app-accent)',
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 z-50 px-4 py-2.5 rounded-full bg-slate-900 text-white text-xs font-semibold shadow-xl border border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-200 flex items-center gap-2">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
