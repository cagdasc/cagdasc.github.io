import React, { useState } from 'react';
import { 
  Briefcase, 
  Calendar, 
  MapPin, 
  ChevronRight, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  Building 
} from 'lucide-react';
import { experiencesData } from '../data/cvData';

export const ExperienceSection: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string>('nutmeg');

  return (
    <section id="experience" className="py-16 md:py-24 border-t border-slate-200 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-blue-600 uppercase tracking-widest mb-2 font-semibold">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Professional Track Record</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
              Work Experience
            </h2>
          </div>
          <p className="text-sm text-slate-600 max-w-md">
            Over a decade of hands-on mobile platform leadership in regulated financial services, high-scale global consumer products, and developer tooling.
          </p>
        </div>

        {/* Experience Timeline */}
        <div className="space-y-6">
          {experiencesData.map((exp) => {
            const isExpanded = expandedId === exp.id;
            return (
              <div
                key={exp.id}
                id={`exp-card-${exp.id}`}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden bg-white ${
                  isExpanded
                    ? 'border-blue-500 ring-1 ring-blue-500/20 shadow-md'
                    : 'border-slate-200 shadow-xs hover:border-slate-300 hover:shadow'
                }`}
              >
                {/* Header click row */}
                <div
                  onClick={() => setExpandedId(isExpanded ? '' : exp.id)}
                  className="p-6 sm:p-7 cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-4 select-none"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-heading font-bold text-lg border transition-colors shrink-0 ${
                      isExpanded 
                        ? 'bg-blue-50 text-blue-600 border-blue-200' 
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {exp.company.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-bold font-heading text-slate-900">
                          {exp.role}
                        </h3>
                        {exp.badge && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {exp.badge}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-sm text-slate-500 mt-1">
                        <span className="font-semibold text-slate-800 flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-blue-600" />
                          {exp.company}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-600">{exp.companyType}</span>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-1 text-slate-500 font-mono text-xs">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {exp.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:justify-end gap-4 text-xs font-mono text-slate-600">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>{exp.period}</span>
                    </div>
                    <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                      isExpanded ? 'rotate-90 text-blue-600' : ''
                    }`} />
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-6 pb-7 sm:px-7 pt-4 border-t border-slate-100 space-y-6">
                    <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                      {exp.description}
                    </p>

                    {/* Key Contributions & Highlights */}
                    <div className="space-y-3">
                      <div className="text-xs font-mono text-slate-500 uppercase tracking-wider font-semibold">
                        Key Responsibilities & Deliverables:
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {exp.highlights.map((highlight, hIdx) => (
                          <div 
                            key={hIdx}
                            className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3"
                          >
                            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                            <span className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                              {highlight}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Metrics Banner if available */}
                    {exp.metrics && (
                      <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center gap-3 text-xs sm:text-sm text-blue-900">
                        <TrendingUp className="w-4 h-4 text-blue-600 shrink-0" />
                        <span><strong>Impact & Stability:</strong> {exp.metrics}</span>
                      </div>
                    )}

                    {/* Technology Badges */}
                    <div>
                      <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2.5 font-semibold">
                        Technologies & Methodologies Used:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {exp.skills.map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
