import React, { useState } from 'react';
import { 
  X, 
  GitBranch, 
  CheckCircle2, 
  Copy, 
  Check, 
  Terminal, 
  ExternalLink, 
  Zap, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

interface GitHubWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const deployYamlContent = `name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
      - master
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build static site
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4`;

export const GitHubWorkflowModal: React.FC<GitHubWorkflowModalProps> = ({
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(deployYamlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-heading text-slate-900">
                GitHub Actions & GitHub Pages Setup
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Automated continuous deployment workflow (.github/workflows/deploy.yml)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center border border-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-600">
          
          {/* Quick Steps Checklist */}
          <div className="space-y-2.5">
            <div className="text-xs font-mono uppercase tracking-wider text-blue-600 font-semibold">
              3-Step Setup for https://cagdas.caglak.cc/
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-mono text-[11px] font-bold">1</span>
                  <span>Push to GitHub</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Commit and push code to your repository (<code className="text-blue-700 font-semibold">cagdasc/cagdasc.github.io</code> or custom repo).
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-mono text-[11px] font-bold">2</span>
                  <span>Enable Pages</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Go to Repo <strong>Settings &gt; Pages</strong> and set <strong>Source</strong> to <strong>GitHub Actions</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-mono text-[11px] font-bold">3</span>
                  <span>Auto Deploy</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  On every git push, the workflow builds Vite & publishes optimized static assets to your custom domain.
                </p>
              </div>
            </div>
          </div>

          {/* Workflow Code snippet */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-500">
                File: <code className="text-blue-700 font-semibold">.github/workflows/deploy.yml</code> (Included in project)
              </span>
              <button
                onClick={handleCopy}
                className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-mono text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-colors font-medium"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy YAML</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 text-xs font-mono text-blue-300/90 max-h-56 overflow-y-auto leading-relaxed shadow-xs">
              <pre className="!m-0">{deployYamlContent}</pre>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
