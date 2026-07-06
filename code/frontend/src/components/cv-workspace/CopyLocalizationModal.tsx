import React from 'react';
import { Button } from '../ui/Button';
import { X, Copy } from 'lucide-react';

interface CopyLocalizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (langCode: string) => void;
  isCopying: boolean;
  currentLanguage: string;
}

export function CopyLocalizationModal({ isOpen, onClose, onConfirm, isCopying, currentLanguage }: CopyLocalizationModalProps) {
  if (!isOpen) return null;

  const languages = [
    { code: 'vi', label: 'Tiếng Việt' },
    { code: 'en', label: 'English' },
    { code: 'jp', label: 'Japanese' },
  ].filter(l => l.code !== currentLanguage);

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">Dịch / Nhân bản CV</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-sm text-slate-600 mb-4">
            Tính năng này sẽ copy toàn bộ nội dung CV hiện tại sang một ngôn ngữ khác để bạn tiện dịch thuật.
          </p>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Lưu ý:</strong> Nếu bản nháp của ngôn ngữ đích đã tồn tại, nó sẽ bị <strong>ghi đè hoàn toàn</strong> bằng nội dung mới này. Bạn có chắc chắn không?
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700">Chọn ngôn ngữ đích:</label>
            <div className="grid grid-cols-2 gap-3">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => onConfirm(lang.code)}
                  disabled={isCopying}
                  className="flex items-center justify-center space-x-2 border border-slate-300 rounded-lg p-3 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors disabled:opacity-50"
                >
                  <Copy size={16} />
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {isCopying && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-sm flex items-center justify-center space-x-2 text-slate-500">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
            <span>Đang tạo bản CV...</span>
          </div>
        )}
      </div>
    </div>
  );
}
