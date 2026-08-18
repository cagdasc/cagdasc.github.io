import React from 'react';
import { 
  Terminal, 
  MapPin, 
  Building2, 
  ArrowRight, 
  Download, 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  Cpu, 
  Layers, 
  Smartphone, 
  Github, 
  Linkedin, 
  Mail 
} from 'lucide-react';
import { profileData } from '../data/cvData';

interface HeroProps {
  onExploreBlog: () => void;
  onExploreExperience: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreBlog, onExploreExperience }) => {
  return (
    <section id="hero-section" className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden bg-[#F8FAFC] border-b border-slate-200">
      {/* Background subtle grid pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Top availability pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-700 mb-8 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-700 font-semibold">Available</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-600">London & Global Remote</span>
          <span className="text-slate-300">|</span>
          <span className="text-blue-600 font-semibold">Droidcon London 2025 Speaker</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Main Info */}
          <div className="lg:col-span-8 space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-slate-900 tracking-tight leading-[1.15]">
                Crafting high-scale <br className="hidden sm:inline" />
                <span className="text-blue-600">
                  Android Architectures
                </span> <br className="hidden sm:inline" />
                & Developer Tooling.
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed pt-2 max-w-2xl">
                Hi, I'm <strong className="text-slate-900 font-semibold">{profileData.name}</strong> — Senior Android Developer at <span className="text-blue-600 font-medium">Nutmeg ({profileData.companySubtitle})</span>. Specializing in Jetpack Compose, Kotlin Multiplatform, Clean Architecture, and automated screenshot testing pipelines.
              </p>
            </div>

            {/* Meta Tags */}
            <div className="flex flex-wrap gap-2 pt-1 text-xs sm:text-sm font-sans text-slate-600">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white border border-slate-200 shadow-xs">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Nutmeg (J.P. Morgan)</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white border border-slate-200 shadow-xs">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>London, United Kingdom</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white border border-slate-200 shadow-xs">
                <Cpu className="w-3.5 h-3.5 text-slate-600" />
                <span>KSP / Paparazzi Tooling</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white border border-slate-200 shadow-xs">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Kotlin Multiplatform</span>
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-4">
              <button
                id="hero-read-blog-btn"
                onClick={onExploreBlog}
                className="px-5 py-3 rounded-xl text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-all duration-200 flex items-center gap-2 shadow-xs hover:shadow hover:-translate-y-0.5"
              >
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span>Read Articles (5)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="hero-view-experience-btn"
                onClick={onExploreExperience}
                className="px-5 py-3 rounded-xl text-sm font-semibold bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 hover:border-slate-300 transition-all duration-200 flex items-center gap-2 shadow-xs"
              >
                <Smartphone className="w-4 h-4 text-blue-600" />
                <span>View Career History</span>
              </button>

              <button
                id="hero-print-cv-btn"
                onClick={() => window.print()}
                className="px-4 py-3 rounded-xl text-sm font-medium bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 transition-all flex items-center gap-2 shadow-xs"
                title="Print or Save CV as PDF"
              >
                <Download className="w-4 h-4 text-slate-400" />
                <span>Download CV</span>
              </button>
            </div>

            {/* Direct contact links */}
            <div className="pt-2 flex items-center gap-4 text-sm text-slate-500">
              <span className="text-xs uppercase tracking-wider font-mono text-slate-400">Connect:</span>
              <a 
                href={profileData.github} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-slate-900 flex items-center gap-1.5 transition-colors"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>
              <a 
                href={profileData.linkedin} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-600 flex items-center gap-1.5 transition-colors"
              >
                <Linkedin className="w-4 h-4" />
                <span>LinkedIn</span>
              </a>
              <a 
                href={`mailto:${profileData.email}`}
                className="hover:text-blue-600 flex items-center gap-1.5 transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>{profileData.email}</span>
              </a>
            </div>
          </div>

          {/* Right Card / Interactive Terminal Spec Card */}
          <div className="lg:col-span-4">
            <div className="rounded-2xl bg-white border border-slate-200 shadow-lg relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-slate-300">
              
              {/* Window Bar */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 text-slate-300">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <div className="text-xs font-mono text-slate-400 flex items-center gap-1">
                  <Terminal className="w-3.5 h-3.5 text-blue-400" />
                  <span>cagdasc.profile.kts</span>
                </div>
              </div>

              {/* Code-style info */}
              <div className="p-5 font-mono text-xs sm:text-[13px] space-y-2.5 text-slate-700 leading-relaxed bg-white">
                <div>
                  <span className="text-blue-600 font-bold">val</span> engineer = <span className="text-amber-700 font-bold">SeniorAndroidDeveloper</span>(
                </div>
                <div className="pl-4 space-y-1 text-slate-600">
                  <div>name = <span className="text-emerald-700">"Çağdaş Çağlak"</span>,</div>
                  <div>company = <span className="text-emerald-700">"Nutmeg (J.P. Morgan)"</span>,</div>
                  <div>focus = listOf(</div>
                  <div className="pl-4 text-blue-700">
                    "Jetpack Compose",<br />
                    "Kotlin Multiplatform",<br />
                    "Screenshot Autopilot (KSP)",<br />
                    "Clean Architecture"
                  </div>
                  <div>),</div>
                  <div>tests = <span className="text-emerald-700">"Paparazzi + Compose Previews"</span>,</div>
                  <div>speakerAt = <span className="text-amber-700">"Droidcon London 2025"</span></div>
                </div>
                <div>)</div>
              </div>

              {/* Verified Badge */}
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>GitHub Pages + Actions CI</span>
                </div>
                <span className="font-mono text-[11px] text-slate-400">v2026.1</span>
              </div>
            </div>
          </div>

        </div>

        {/* 4 Core Stat Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-12 sm:mt-16">
          {profileData.stats.map((stat, idx) => (
            <div 
              key={idx}
              className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-md transition-all duration-200 space-y-1.5"
            >
              <div className="text-2xl sm:text-3xl font-extrabold font-heading text-blue-600 flex items-baseline gap-1">
                <span>{stat.value}</span>
              </div>
              <div className="text-sm font-bold text-slate-900">
                {stat.label}
              </div>
              <div className="text-xs text-slate-500 leading-relaxed">
                {stat.subtext}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
