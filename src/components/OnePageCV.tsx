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
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-10">
        
        {/* CV Header: Profile & Contact */}
        <header className="border-b border-slate-100 pb-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
                {profileData.name}
              </h1>
              <p className="text-base sm:text-lg font-medium text-slate-700 mt-1">
                Senior Android Developer at <span className="text-blue-600 font-semibold">{profileData.currentCompany}</span> {/* ({profileData.companySubtitle}) */}
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 self-start sm:self-center">
              {/* Download CV button (commented out)
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-xs"
                title="Download or Print CV as PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download CV</span>
              </button>
              */}
            </div>
          </div>

          {/* Contact Details Grid */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs sm:text-sm text-slate-600 font-sans">
            <div className="flex items-center gap-1.5 text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>{profileData.location}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              <a href={`mailto:${profileData.email}`} className="text-slate-900 hover:text-blue-600 font-medium transition-colors">
                {profileData.email}
              </a>
              <button 
                onClick={handleCopyEmail}
                className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                title="Copy email"
              >
                {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <a 
              href={profileData.github} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>github.com/cagdasc</span>
            </a>

            <a 
              href={profileData.linkedin} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-slate-700 hover:text-blue-600 transition-colors"
            >
              <Linkedin className="w-3.5 h-3.5" />
              <span>linkedin.com/in/cagdascaglak</span>
            </a>
          </div>

          {/* Bio / Summary */}
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed pt-2">
            {profileData.fullBio}
          </p>
        </header>

        {/* Section 1: Work Experience */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Briefcase className="w-4 h-4 text-blue-600" />
            <h2 className="text-base sm:text-lg font-bold font-heading text-slate-900 uppercase tracking-wider">
              Work Experience
            </h2>
          </div>

          <div className="space-y-8">
            {experiencesData.map((exp) => (
              <div key={exp.id} className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span>{exp.role}</span>
                      {exp.badge && (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          {exp.badge}
                        </span>
                      )}
                    </h3>
                    <div className="text-sm text-slate-600 font-medium">
                      {exp.company} • <span className="text-slate-500">{exp.companyType}</span>
                    </div>
                  </div>

                  <div className="text-xs font-mono text-slate-500 sm:text-right">
                    <div>{exp.period}</div>
                    <div className="text-slate-400">{exp.location}</div>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {exp.description}
                </p>

                {/* Bullet highlights */}
                <ul className="list-disc list-outside ml-4 space-y-1.5 text-xs sm:text-sm text-slate-700">
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
                      className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-mono border border-slate-200/80"
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
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <h2 className="text-base sm:text-lg font-bold font-heading text-slate-900 uppercase tracking-wider">
              Technical Expertise & Tooling
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {skillCategoriesData.map((cat, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-blue-700">
                  {cat.title}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {cat.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-800 text-xs font-medium shadow-2xs"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Speaking & Selected Projects */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Mic2 className="w-4 h-4 text-blue-600" />
            <h2 className="text-base sm:text-lg font-bold font-heading text-slate-900 uppercase tracking-wider">
              Speaking
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Conference Speaking */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-purple-700 uppercase">
                  Conference Speaker
                </span>
                <span className="text-xs font-mono text-slate-500">October 2025</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Droidcon London 2025
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>"Android Screenshot Testing on Autopilot"</strong> — Automated Paparazzi & KSP code generation for Jetpack Compose previews without writing test boilerplate.
              </p>
            </div>            
          </div>
        </section>

        {/* Section 4: Education */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <h2 className="text-base sm:text-lg font-bold font-heading text-slate-900 uppercase tracking-wider">
              Education
            </h2>
          </div>

          <div className="space-y-2">
            {educationData.map((edu, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm">
                <div>
                  <span className="font-bold text-slate-900">{edu.degree}</span>
                  <span className="text-slate-500"> — {edu.institution}</span>
                </div>
                <span className="font-mono text-slate-500">{edu.period}</span>
              </div>
            ))}
          </div>
        </section>

      </div>

    </div>
  );
};
