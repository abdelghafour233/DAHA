import React from 'react';
import { Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full py-6 px-4 mb-8">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-blue-600/20 rounded-full">
            <Sparkles className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            محول الصور الذكي
          </h1>
        </div>
        <p className="text-slate-400 max-w-lg text-lg">
          حوّل أفكارك إلى واقع. ارفع صورتك واطلب من الذكاء الاصطناعي تعديلها أو تحسينها بلمسة واحدة.
        </p>
      </div>
    </header>
  );
};
