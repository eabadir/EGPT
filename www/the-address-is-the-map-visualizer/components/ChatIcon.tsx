import React from 'react';

interface ChatIconProps {
  onClick: () => void;
}

export const ChatIcon: React.FC<ChatIconProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-full p-4 shadow-2xl transform transition-all hover:scale-110 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 z-30"
      aria-label="Open chat with AI guide"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.91 4.91 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06z" />
        <path d="M12 21.46c-1.25 0-2.5.25-4 .25-3 0-6-7.5-6-11.72a4.91 4.91 0 0 1 5-4.78c2.22 0 4 1.44 5 2 1-.56 2.78-2 5-2a4.91 4.91 0 0 1 5 4.78c0 4.22-3 11.72-6 11.72-1.5 0-2.75-.25-4-.25z" />
      </svg>
    </button>
  );
};
