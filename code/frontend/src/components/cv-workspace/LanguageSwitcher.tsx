import React from 'react';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  currentLanguage: string;
  onLanguageChange: (lang: string) => void;
}

export function LanguageSwitcher({ currentLanguage, onLanguageChange }: LanguageSwitcherProps) {
  const languages = [
    { code: 'vi', label: 'Tiếng Việt' },
    { code: 'en', label: 'English' },
    { code: 'jp', label: 'Japanese' },
  ];

  return (
    <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg w-fit">
      <Globe size={16} className="mx-2 text-slate-500" />
      {languages.map(lang => (
        <button
          key={lang.code}
          onClick={() => onLanguageChange(lang.code)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            currentLanguage === lang.code 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
