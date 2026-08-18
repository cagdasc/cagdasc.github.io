import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer 
      className="border-t py-6 text-xs text-center no-print transition-colors duration-200"
      style={{
        backgroundColor: 'var(--app-surface)',
        borderColor: 'var(--app-border)',
        color: 'var(--app-text-muted)',
      }}
    >
      <div className="max-w-4xl mx-auto px-4">
        <p>© {new Date().getFullYear()} Cagdas Caglak. All rights reserved.</p>
      </div>
    </footer>
  );
};

