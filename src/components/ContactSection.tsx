import React, { useState } from 'react';
import { 
  Mail, 
  Linkedin, 
  Github, 
  Send, 
  Check, 
  Copy, 
  MapPin, 
  MessageSquare, 
  Clock, 
  Sparkles, 
  ExternalLink 
} from 'lucide-react';
import { profileData } from '../data/cvData';

export const ContactSection: React.FC = () => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [subjectType, setSubjectType] = useState<'job' | 'talk' | 'general'>('job');
  const [senderName, setSenderName] = useState('');
  const [senderMessage, setSenderMessage] = useState('');

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(profileData.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleSendMail = (e: React.FormEvent) => {
    e.preventDefault();
    const subjects = {
      job: 'Senior Android / Mobile Platform Opportunity',
      talk: 'Conference Talk / Podcast Invitation for Çağdaş',
      general: 'Engineering Exchange / Collaboration'
    };
    const body = encodeURIComponent(
      `Hi Çağdaş,\n\n${senderMessage || 'I came across your CV and technical articles...'}\n\nBest regards,\n${senderName || 'A Tech Enthusiast'}`
    );
    window.location.href = `mailto:${profileData.email}?subject=${encodeURIComponent(subjects[subjectType])}&body=${body}`;
  };

  return (
    <section id="contact" className="py-16 md:py-24 border-t border-slate-200 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-2xl mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-blue-600 uppercase tracking-widest font-semibold">
            <Mail className="w-3.5 h-3.5" />
            <span>Direct Channels</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
            Get In Touch
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Interested in discussing Android architectures, developer tooling, conference speaking, or engineering opportunities? Reach out directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Contact Info Cards */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Direct Email Card */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <Mail className="w-5 h-5" />
                </div>
                <button
                  id="copy-email-btn"
                  onClick={handleCopyEmail}
                  className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 text-xs font-mono text-slate-700 hover:text-blue-700 flex items-center gap-1.5 transition-colors font-medium"
                >
                  {copiedEmail ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Email</span>
                    </>
                  )}
                </button>
              </div>

              <div>
                <div className="text-xs font-mono text-slate-400">Direct Email</div>
                <a 
                  href={`mailto:${profileData.email}`}
                  className="text-base sm:text-lg font-bold font-mono text-slate-900 hover:text-blue-600 transition-colors"
                >
                  {profileData.email}
                </a>
              </div>
            </div>

            {/* Social Channels */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href={profileData.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-xs transition-all flex items-center gap-3 group shadow-xs"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-100">
                  <Linkedin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">LinkedIn</div>
                  <div className="text-[11px] font-mono text-slate-500">cagdascaglak</div>
                </div>
              </a>

              <a
                href={profileData.github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all flex items-center gap-3 group shadow-xs"
              >
                <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 group-hover:bg-slate-200">
                  <Github className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">GitHub</div>
                  <div className="text-[11px] font-mono text-slate-500">@cagdasc</div>
                </div>
              </a>
            </div>

            {/* Timezone & Location */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs font-mono text-slate-600 shadow-xs">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>London (GMT / BST)</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Active timezone</span>
              </div>
            </div>

          </div>

          {/* Right: Quick Direct Message Template Composer */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleSendMail}
              className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 font-heading">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>Compose Quick Inquiry</span>
              </div>

              {/* Inquiry Type Radio Pills */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  { id: 'job', label: 'Tech Role' },
                  { id: 'talk', label: 'Speaking / Talk' },
                  { id: 'general', label: 'Collaboration' }
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSubjectType(type.id as any)}
                    className={`py-2 px-3 rounded-lg text-xs font-mono transition-colors text-center border ${
                      subjectType === type.id
                        ? 'bg-blue-50 text-blue-700 border-blue-200 font-semibold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              {/* Name field */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-500">Your Name / Organization</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. Alex (Engineering Lead @ TechCorp)"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              {/* Message field */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-500">Message Note</label>
                <textarea
                  rows={3}
                  value={senderMessage}
                  onChange={(e) => setSenderMessage(e.target.value)}
                  placeholder="Write a brief note or topic..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 font-mono resize-none"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                id="send-email-mailto-btn"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Send className="w-4 h-4" />
                <span>Open Email Client</span>
              </button>
            </form>
          </div>

        </div>

      </div>
    </section>
  );
};
