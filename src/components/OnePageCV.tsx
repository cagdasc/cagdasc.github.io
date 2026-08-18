import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Mail, 
  Github, 
  Linkedin, 
  Download, 
  BookOpen, 
  ExternalLink, 
  Check, 
  Copy, 
  Mic2, 
  FileCode2, 
  Sparkles,
  ArrowRight,
  GraduationCap,
  Briefcase,
  Layers,
  Terminal,
  Calendar
} from 'lucide-react';
import { profileData, experiencesData, skillCategoriesData, projectsData, talksData, educationData } from '../data/cvData';

interface OnePageCVProps {
  onGoToBlog: () => void;
}

export const OnePageCV: React.FC<OnePageCVProps> = ({ onGoToBlog }) => {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(profileData.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="pt-24 pb-20 max-w-4xl mx-auto px-4 sm:px-6">
      
      {/* Resume Card Container */}
      <div 
        className="rounded-3xl p-6 sm:p-10 shadow-xs space-y-10 border transition-colors duration-200"
        style={{
          backgroundColor: 'var(--app-surface-card)',
          borderColor: 'var(--app-border)',
        }}
      >
        
        {/* CV Header: Profile & Contact */}
        <header 
          className="pb-8 space-y-5 border-b"
          style={{ borderColor: 'var(--app-border)' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 
                className="text-3xl sm:text-4xl font-extrabold font-heading tracking-tight"
                style={{ color: 'var(--app-text)' }}
              >
                {profileData.name}
              </h1>
              <p 
                className="text-base sm:text-lg font-medium mt-1"
                style={{ color: 'var(--app-text-secondary)' }}
              >
                Senior Android Developer at <span className="font-semibold" style={{ color: 'var(--app-accent)' }}>{profileData.currentCompany}</span>
              </p>
            </div>
          </div>

          {/* Contact Details Grid */}
          <div 
            className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs sm:text-sm font-sans"
            style={{ color: 'var(--app-text-muted)' }}
          >
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span style={{ color: 'var(--app-text-secondary)' }}>{profileData.location}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" style={{ color: 'var(--app-accent)' }} />
              <a 
                href={`mailto:${profileData.email}`} 
                className="font-medium transition-colors hover:underline"
                style={{ color: 'var(--app-text)' }}
              >
                {profileData.email}
              </a>
              <button 
                onClick={handleCopyEmail}
                className="p-1 rounded transition-colors opacity-70 hover:opacity-100"
                style={{ color: 'var(--app-text-muted)' }}
                title="Copy email"
              >
                {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <a 
              href={profileData.github} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 transition-colors hover:opacity-80"
              style={{ color: 'var(--app-text-secondary)' }}
            >
              <Github className="w-3.5 h-3.5" />
              <span>github.com/cagdasc</span>
            </a>

            <a 
              href={profileData.linkedin} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 transition-colors hover:opacity-80"
              style={{ color: 'var(--app-text-secondary)' }}
            >
              <Linkedin className="w-3.5 h-3.5" />
              <span>linkedin.com/in/cagdascaglak</span>
            </a>
          </div>

          {/* Bio / Summary */}
          <p 
            className="text-sm sm:text-base leading-relaxed pt-2"
            style={{ color: 'var(--app-text-secondary)' }}
          >
            {profileData.fullBio}
          </p>
        </header>

        {/* Section 1: Work Experience */}
        <section className="space-y-6">
          <div 
            className="flex items-center gap-2 pb-2 border-b"
            style={{ borderColor: 'var(--app-border)' }}
          >
            <Briefcase className="w-4 h-4" style={{ color: 'var(--app-accent)' }} />
            <h2 
              className="text-base sm:text-lg font-bold font-heading uppercase tracking-wider"
              style={{ color: 'var(--app-text)' }}
            >
              Work Experience
            </h2>
          </div>

          <div className="space-y-8">
            {experiencesData.map((exp) => (
              <div key={exp.id} className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                  <div>
                    <h3 
                      className="text-base font-bold flex items-center gap-2"
                      style={{ color: 'var(--app-text)' }}
                    >
                      <span>{exp.role}</span>
                      {exp.badge && (
                        <span 
                          className="text-[11px] font-mono px-2 py-0.5 rounded-full border font-semibold"
                          style={{
                            backgroundColor: 'var(--app-accent-bg)',
                            borderColor: 'var(--app-accent-border)',
                            color: 'var(--app-accent)',
                          }}
                        >
                          {exp.badge}
                        </span>
                      )}
                    </h3>
                    <div className="text-sm font-medium mt-0.5" style={{ color: 'var(--app-text-secondary)' }}>
                      {exp.company} • <span style={{ color: 'var(--app-text-muted)' }}>{exp.companyType}</span>
                    </div>
                  </div>

                  <div className="text-xs font-mono sm:text-right" style={{ color: 'var(--app-text-muted)' }}>
                    <div>{exp.period}</div>
                    <div className="opacity-80">{exp.location}</div>
                  </div>
                </div>

                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--app-text-secondary)' }}>
                  {exp.description}
                </p>

                {/* Bullet highlights */}
                <ul className="list-disc list-outside ml-4 space-y-1.5 text-xs sm:text-sm" style={{ color: 'var(--app-text-secondary)' }}>
                  {exp.highlights.map((item, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>

                {/* Tech chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {exp.skills.map((skill, idx) => (
                    <span 
                      key={idx} 
                      className="px-2 py-0.5 rounded text-[11px] font-mono border"
                      style={{
                        backgroundColor: 'var(--app-chip-bg)',
                        borderColor: 'var(--app-chip-border)',
                        color: 'var(--app-chip-text)',
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Technical Skills */}
        <section className="space-y-4">
          <div 
            className="flex items-center gap-2 pb-2 border-b"
            style={{ borderColor: 'var(--app-border)' }}
          >
            <Layers className="w-4 h-4" style={{ color: 'var(--app-accent)' }} />
            <h2 
              className="text-base sm:text-lg font-bold font-heading uppercase tracking-wider"
              style={{ color: 'var(--app-text)' }}
            >
              Technical Expertise & Tooling
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {skillCategoriesData.map((cat, idx) => (
              <div 
                key={idx} 
                className="p-4 rounded-2xl border space-y-2.5"
                style={{
                  backgroundColor: 'var(--app-surface-subtle)',
                  borderColor: 'var(--app-border)',
                }}
              >
                <h3 
                  className="text-xs font-bold font-mono uppercase tracking-wider"
                  style={{ color: 'var(--app-accent)' }}
                >
                  {cat.title}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {cat.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2 py-1 rounded-md border text-xs font-medium shadow-2xs"
                      style={{
                        backgroundColor: 'var(--app-surface-card)',
                        borderColor: 'var(--app-border)',
                        color: 'var(--app-text)',
                      }}
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Speaking */}
        <section className="space-y-4">
          <div 
            className="flex items-center gap-2 pb-2 border-b"
            style={{ borderColor: 'var(--app-border)' }}
          >
            <Mic2 className="w-4 h-4" style={{ color: 'var(--app-accent)' }} />
            <h2 
              className="text-base sm:text-lg font-bold font-heading uppercase tracking-wider"
              style={{ color: 'var(--app-text)' }}
            >
              Speaking
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Conference Speaking */}
            <div 
              className="p-4 rounded-2xl border space-y-2"
              style={{
                backgroundColor: 'var(--app-surface-subtle)',
                borderColor: 'var(--app-border)',
              }}
            >
              <div className="flex items-center justify-between">
                <span 
                  className="text-[11px] font-mono font-bold uppercase"
                  style={{ color: 'var(--app-accent)' }}
                >
                  Conference Speaker
                </span>
                <span className="text-xs font-mono" style={{ color: 'var(--app-text-muted)' }}>
                  October 2025
                </span>
              </div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--app-text)' }}>
                Droidcon London 2025
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--app-text-secondary)' }}>
                <strong>"Android Screenshot Testing on Autopilot"</strong> — Automated Paparazzi & KSP code generation for Jetpack Compose previews without writing test boilerplate.
              </p>
            </div>            
          </div>
        </section>

        {/* Section 4: Education */}
        <section className="space-y-4">
          <div 
            className="flex items-center gap-2 pb-2 border-b"
            style={{ borderColor: 'var(--app-border)' }}
          >
            <GraduationCap className="w-4 h-4" style={{ color: 'var(--app-accent)' }} />
            <h2 
              className="text-base sm:text-lg font-bold font-heading uppercase tracking-wider"
              style={{ color: 'var(--app-text)' }}
            >
              Education
            </h2>
          </div>

          <div className="space-y-2">
            {educationData.map((edu, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm">
                <div>
                  <span className="font-bold" style={{ color: 'var(--app-text)' }}>{edu.degree}</span>
                  <span style={{ color: 'var(--app-text-muted)' }}> — {edu.institution}</span>
                </div>
                <span className="font-mono" style={{ color: 'var(--app-text-muted)' }}>{edu.period}</span>
              </div>
            ))}
          </div>
        </section>

      </div>

    </div>
  );
};
