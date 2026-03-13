import React, { useState, useEffect } from 'react';
import { XCircleIcon } from './Icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  setApiKey: (key: string, model: string) => void;
  selectedModel: string;
}

const MODELS = ['gemini-3-flash-preview', 'gemini-3-pro-preview', 'gemini-2.5-flash'];

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen, onClose, apiKey, setApiKey, selectedModel
}) => {
  const [tempKey, setTempKey] = useState(apiKey);
  const [tempModel, setTempModel] = useState(selectedModel);

  useEffect(() => {
    if (isOpen) {
      setTempKey(apiKey);
      setTempModel(selectedModel);
    }
  }, [isOpen, apiKey, selectedModel]);

  if (!isOpen) return null;

  const handleSave = () => {
    setApiKey(tempKey, tempModel);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">Cài đặt</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">API Key Gemini</label>
            <input 
              type="password" 
              value={tempKey} 
              onChange={e => setTempKey(e.target.value)}
              placeholder="Nhập Google Gemini API Key"
              className="w-full rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 transition px-3 py-2 border"
            />
            <p className="text-xs text-slate-500 pt-1">
              Chưa có key? <a href="https://aistudio.google.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-medium">Lấy API key tại đây</a>
            </p>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">Model AI Truy Vấn</label>
            <div className="space-y-2">
              {MODELS.map(model => (
                <div 
                  key={model}
                  onClick={() => setTempModel(model)}
                  className={`cursor-pointer p-3 rounded-lg border-2 transition-all ${tempModel === model ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <p className={`font-medium ${tempModel === model ? 'text-indigo-700' : 'text-slate-700'}`}>
                    {model} {model === 'gemini-3-flash-preview' && '(Mặc định)'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Hủy</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 transition-colors">Lưu cài đặt</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
