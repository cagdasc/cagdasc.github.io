import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500 text-center no-print">
      <div className="max-w-4xl mx-auto px-4">
        <p>© {new Date().getFullYear()} Çağdaş Çağlak. All rights reserved.</p>
      </div>
    </footer>
  );
};
