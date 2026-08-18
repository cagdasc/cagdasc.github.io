import React, { useState } from 'react';
import { 
  Code2, 
  Smartphone, 
  Cpu, 
  Layers, 
  Check, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Terminal 
} from 'lucide-react';
import { skillCategoriesData } from '../data/cvData';

export const SkillsSection: React.FC = () => {
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState<number>(0);

  const iconsMap: Record<string, React.ReactNode> = {
    Smartphone: <Smartphone className="w-5 h-5 text-blue-600" />,
    Cpu: <Cpu className="w-5 h-5 text-slate-700" />,
    Layers: <Layers className="w-5 h-5 text-blue-600" />
  };

  return (
    <section id="skills" className="py-16 md:py-24 border-t border-slate-200 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-blue-600 uppercase tracking-widest mb-2 font-semibold">
              <Code2 className="w-3.5 h-3.5" />
              <span>Technical Capabilities</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
              Skills & Tech Stack
            </h2>
          </div>
          <p className="text-sm text-slate-600 max-w-md">
            Specialized in building resilient declarative Android applications, automated testing pipelines, and cross-platform multiplatform foundations.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {skillCategoriesData.map((cat, idx) => {
            const isSelected = selectedCategoryIndex === idx;
            return (
              <button
                key={idx}
                id={`skill-category-tab-${idx}`}
                onClick={() => setSelectedCategoryIndex(idx)}
                className={`p-4 rounded-xl text-left border transition-all duration-200 flex items-center gap-3.5 bg-white ${
                  isSelected
                    ? 'border-blue-500 ring-1 ring-blue-500/20 text-slate-900 shadow-sm'
                    : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className={`p-2.5 rounded-lg border ${
                  isSelected 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-slate-100 border-slate-200'
                }`}>
                  {iconsMap[cat.iconName] || <Code2 className="w-5 h-5 text-blue-600" />}
                </div>
                <div>
                  <div className="font-semibold text-sm font-heading text-slate-900">{cat.title}</div>
                  <div className="text-xs text-slate-500 line-clamp-1">{cat.skills.length} core technologies</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Category Skills Grid */}
        <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="mb-6">
            <h3 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
              {skillCategoriesData[selectedCategoryIndex].title}
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              {skillCategoriesData[selectedCategoryIndex].description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skillCategoriesData[selectedCategoryIndex].skills.map((skill, sIdx) => (
              <div
                key={sIdx}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 hover:bg-white hover:border-blue-300 hover:shadow-xs transition-all flex flex-col justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                      {skill.name}
                    </span>
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                      skill.level === 'Expert'
                        ? 'bg-blue-50 text-blue-700 border-blue-200 font-semibold'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {skill.level}
                    </span>
                  </div>
                  {skill.highlight && (
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {skill.highlight}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Production Verified</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Developer Experience Spotlight Pill */}
        <div className="mt-8 p-5 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">
                Screenshot Testing on Autopilot Framework
              </div>
              <div className="text-xs text-slate-600">
                Created automated KSP & Paparazzi pipeline connecting Jetpack Compose previews directly to headless CI verification.
              </div>
            </div>
          </div>
          <a
            href="https://github.com/cagdasc"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1.5 shrink-0 px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-blue-50 hover:border-blue-200 transition-colors"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>View on GitHub</span>
          </a>
        </div>

      </div>
    </section>
  );
};
