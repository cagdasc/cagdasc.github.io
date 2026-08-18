import React from 'react';
import { profileData, experiencesData, skillCategoriesData, projectsData, educationData, talksData } from '../data/cvData';

export const PrintCVView: React.FC = () => {
  return (
    <div className="hidden print-only text-black bg-white p-8 max-w-4xl mx-auto space-y-6 text-sm font-sans leading-normal">
      
      {/* Header */}
      <div className="border-b-2 border-black pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight uppercase">{profileData.name}</h1>
          <p className="text-base font-semibold text-gray-800 mt-0.5">
            {profileData.title} • {profileData.currentCompany} ({profileData.companySubtitle})
          </p>
        </div>
        <div className="text-right text-xs text-gray-700 space-y-0.5 font-mono">
          <div>{profileData.location}</div>
          <div>{profileData.email}</div>
          <div>{profileData.website} • github.com/cagdasc</div>
        </div>
      </div>

      {/* Summary */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider border-b border-gray-400 pb-1 mb-2 text-black">
          Professional Summary
        </h2>
        <p className="text-xs text-gray-800 leading-relaxed">
          {profileData.fullBio}
        </p>
      </div>

      {/* Experience */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider border-b border-gray-400 pb-1 mb-3 text-black">
          Work Experience
        </h2>
        <div className="space-y-4">
          {experiencesData.map((exp) => (
            <div key={exp.id} className="space-y-1.5 print-card">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-sm text-black">{exp.role}</span>
                <span className="font-mono text-xs text-gray-600 font-medium">{exp.period}</span>
              </div>
              <div className="flex justify-between items-baseline text-xs text-gray-700 font-medium">
                <span>{exp.company} ({exp.companyType})</span>
                <span>{exp.location}</span>
              </div>
              <ul className="list-disc list-inside text-xs text-gray-800 space-y-1 pl-1">
                {exp.highlights.map((h, i) => (
                  <li key={i} className="leading-snug">{h}</li>
                ))}
              </ul>
              <div className="text-[11px] text-gray-600 font-mono pt-1">
                <strong>Tech:</strong> {exp.skills.join(', ')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Core Skills Matrix */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider border-b border-gray-400 pb-1 mb-2 text-black">
          Technical Skills & Tooling
        </h2>
        <div className="grid grid-cols-2 gap-3 text-xs">
          {skillCategoriesData.map((cat, i) => (
            <div key={i}>
              <div className="font-bold text-gray-900">{cat.title}:</div>
              <div className="text-gray-800 text-[11px]">
                {cat.skills.map((s) => s.name).join(', ')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Speaking & Projects */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider border-b border-gray-400 pb-1 mb-2 text-black">
          Conferences & Open Source
        </h2>
        <div className="space-y-2 text-xs text-gray-800">
          <div>
            <strong>Droidcon London 2025 Speaker:</strong> "Android Screenshot Testing on Autopilot" — Automated Paparazzi & KSP code generation for Jetpack Compose.
          </div>
          <div>
            <strong>kmp-platform-foundation & kmp-ui-foundation:</strong> Modular Kotlin Multiplatform libraries for cross-platform Android, iOS, and Desktop apps.
          </div>
        </div>
      </div>

      {/* Education */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider border-b border-gray-400 pb-1 mb-1 text-black">
          Education
        </h2>
        {educationData.map((edu, i) => (
          <div key={i} className="flex justify-between text-xs text-gray-800">
            <span><strong>{edu.degree}</strong> — {edu.institution}</span>
            <span className="font-mono text-gray-600">{edu.period}</span>
          </div>
        ))}
      </div>

    </div>
  );
};
