import React from 'react';
import { 
  Mic2, 
  Calendar, 
  MapPin, 
  GraduationCap, 
  Sparkles, 
  Video, 
  FileText, 
  Presentation 
} from 'lucide-react';
import { talksData, educationData } from '../data/cvData';

export const TalksSection: React.FC = () => {
  return (
    <section id="talks" className="py-16 md:py-24 border-t border-slate-200 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-blue-600 uppercase tracking-widest mb-2 font-semibold">
              <Presentation className="w-3.5 h-3.5" />
              <span>Public Speaking & Education</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
              Conference Talks & Background
            </h2>
          </div>
          <p className="text-sm text-slate-600 max-w-md">
            Sharing technical insights at international developer conferences and mentoring engineering communities.
          </p>
        </div>

        {/* Talks Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {talksData.map((talk) => (
            <div
              key={talk.id}
              id={`talk-card-${talk.id}`}
              className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-7 flex flex-col justify-between gap-6 hover:border-blue-300 hover:shadow-md transition-all duration-200 shadow-xs"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    {talk.conference}
                  </span>
                  {talk.badge && (
                    <span className="text-xs font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {talk.badge}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-bold font-heading text-slate-900">
                    {talk.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs font-mono text-slate-500 mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      {talk.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {talk.location}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {talk.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {talk.topics.map((topic, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-mono text-slate-700 border border-slate-200"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Links */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100 text-xs font-medium">
                {talk.videoUrl && (
                  <a
                    href={talk.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-slate-700 hover:text-blue-600 transition-colors"
                  >
                    <Video className="w-3.5 h-3.5 text-blue-600" />
                    <span>Watch Recording</span>
                  </a>
                )}
                {talk.slidesUrl && (
                  <a
                    href={talk.slidesUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-slate-700 hover:text-emerald-700 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Slides & Notes</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Education Section */}
        <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-7 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-heading text-slate-900">
                Education & Foundations
              </h3>
              <div className="text-xs text-slate-500">Formal Computer Science Background</div>
            </div>
          </div>

          <div className="space-y-4">
            {educationData.map((edu, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <span className="font-bold text-sm text-slate-900">{edu.degree}</span>
                  <span className="text-xs font-mono text-emerald-700 font-semibold">{edu.period}</span>
                </div>
                <div className="text-xs font-mono text-slate-500 mb-2">{edu.institution} • {edu.location}</div>
                <p className="text-xs text-slate-600 leading-relaxed">{edu.description}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
