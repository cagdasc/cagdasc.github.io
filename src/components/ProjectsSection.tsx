import React, { useState } from 'react';
import { 
  FolderGit2, 
  Github, 
  ExternalLink, 
  Star, 
  Terminal, 
  Copy, 
  Check, 
  Sparkles, 
  Layers, 
  Cpu 
} from 'lucide-react';
import { projectsData } from '../data/cvData';

export const ProjectsSection: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyClone = (githubUrl: string, id: string) => {
    const cloneCmd = `git clone ${githubUrl}.git`;
    navigator.clipboard.writeText(cloneCmd);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section id="projects" className="py-16 md:py-24 border-t border-slate-200 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-blue-600 uppercase tracking-widest mb-2 font-semibold">
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>Open Source & Architecture</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
              Featured Projects & Libraries
            </h2>
          </div>
          <p className="text-sm text-slate-600 max-w-md">
            Production-grade open source tooling, Kotlin Multiplatform foundations, and developer automation libraries.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projectsData.map((project) => (
            <div
              key={project.id}
              id={`project-card-${project.id}`}
              className="rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 p-6 sm:p-7 flex flex-col justify-between gap-6 relative overflow-hidden group shadow-xs"
            >
              {/* Category Pill */}
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    {project.category}
                  </span>
                  {project.featured && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-600 font-semibold">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>Featured</span>
                    </span>
                  )}
                </div>

                {/* Title and description */}
                <div>
                  <h3 className="text-xl font-bold font-heading text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                    {project.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mt-2.5">
                    {project.description}
                  </p>
                </div>

                {/* Key Highlights */}
                <div className="space-y-1.5 pt-2">
                  {project.highlights.map((highlight, hIdx) => (
                    <div key={hIdx} className="text-xs text-slate-600 flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technologies & Actions */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex flex-wrap gap-1.5">
                  {project.technologies.map((tech, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-mono text-slate-700 border border-slate-200"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1">
                  {project.githubUrl && (
                    <div className="flex items-center gap-2">
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 hover:text-blue-600 transition-colors"
                      >
                        <Github className="w-4 h-4" />
                        <span>View Repository</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      <button
                        onClick={() => handleCopyClone(project.githubUrl!, project.id)}
                        className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                        title="Copy Git Clone Command"
                      >
                        {copiedId === project.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}

                  <span className="text-[11px] font-mono text-slate-400">
                    Apache 2.0 / MIT
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
