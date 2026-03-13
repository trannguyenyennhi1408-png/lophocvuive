
import React, { useState, useCallback, useRef } from 'react';
import { CHARACTER_STYLES, LOADING_MESSAGES } from './constants';
import type { LoadingState, Message, VideoResult } from './types';
import { generateVideo } from './services/geminiService';
import Spinner from './components/Spinner';
import { UploadIcon, SparklesIcon, XCircleIcon } from './components/Icons';

const App: React.FC = () => {
  const [characterStyle, setCharacterStyle] = useState<string>(CHARACTER_STYLES[0]);
  const [prompt, setPrompt] = useState<string>('');
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [numVideos, setNumVideos] = useState<number>(1);

  const [loadingState, setLoadingState] = useState<LoadingState>({ active: false, message: '' });
  const [message, setMessage] = useState<Message | null>(null);
  const [generatedVideos, setGeneratedVideos] = useState<VideoResult[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadingMessageInterval = useRef<number | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReferenceImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setMessage(null);
    }
  };
  
  const clearImage = () => {
    setReferenceImage(null);
    setImagePreview(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  const startLoadingMessages = () => {
    setLoadingState({ active: true, message: LOADING_MESSAGES[0] });
    let messageIndex = 1;
    loadingMessageInterval.current = window.setInterval(() => {
        setLoadingState(prevState => ({ ...prevState, message: LOADING_MESSAGES[messageIndex % LOADING_MESSAGES.length] }));
        messageIndex++;
    }, 5000); // Change message every 5 seconds
  };
  
  const stopLoadingMessages = () => {
    if (loadingMessageInterval.current) {
        clearInterval(loadingMessageInterval.current);
        loadingMessageInterval.current = null;
    }
  };

  const handleCreate = useCallback(async () => {
    if (!prompt.trim()) {
      setMessage({ type: 'error', text: 'Vui lòng nhập prompt để mô tả video.' });
      return;
    }
    
    setMessage(null);
    startLoadingMessages();

    const fullPrompt = `Video theo phong cách ${characterStyle}. ${prompt}`;
    
    try {
      const updateProgress = (progressMessage: string) => {
        setLoadingState(prevState => ({ ...prevState, message: progressMessage }));
      };
      
      stopLoadingMessages(); // Stop random messages and show actual progress
      const videoUrls = await generateVideo(fullPrompt, referenceImage, numVideos, updateProgress);
      
      const newVideos: VideoResult[] = videoUrls.map(url => ({
        id: new Date().toISOString() + Math.random(),
        url,
        prompt: prompt,
        style: characterStyle,
      }));

      setGeneratedVideos(prev => [...newVideos, ...prev]);
      setMessage({ type: 'success', text: `Tạo thành công ${videoUrls.length} video!` });
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: `Tạo video thất bại: ${err.message}` });
    } finally {
      stopLoadingMessages();
      setLoadingState({ active: false, message: '' });
    }
  }, [prompt, characterStyle, referenceImage, numVideos]);

  const resetForm = () => {
    setPrompt('');
    clearImage();
    setMessage(null);
    setCharacterStyle(CHARACTER_STYLES[0]);
    setNumVideos(1);
  };
  

  return (
    <div className="min-h-screen bg-slate-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 tracking-tight">
            Trình Tạo Video <span className="text-indigo-600">AI</span>
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            Biến ý tưởng của bạn thành video sống động với sức mạnh của Google Gemini.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 space-y-6 self-start">
             <div className="space-y-2">
              <label htmlFor="char-style" className="font-medium text-slate-700">1. Chọn phong cách</label>
              <select
                id="char-style"
                value={characterStyle}
                onChange={(e) => setCharacterStyle(e.target.value)}
                className="w-full rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 transition"
              >
                {CHARACTER_STYLES.map(style => <option key={style}>{style}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="prompt" className="font-medium text-slate-700">2. Mô tả video của bạn</label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={5}
                placeholder={`Ví dụ: "Một chú mèo con đang chơi đùa với cuộn len trong một căn phòng ngập nắng"`}
                className="w-full rounded-lg border-slate-300 resize-y focus:border-indigo-500 focus:ring-indigo-500 transition"
              />
            </div>
            
            <div className="space-y-2">
              <label className="font-medium text-slate-700">3. (Tùy chọn) Tải ảnh tham chiếu</label>
              <div className="mt-1 flex justify-center items-center w-full px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
                {imagePreview ? (
                   <div className="relative group w-full h-48">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded-md" />
                      <button onClick={clearImage} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <XCircleIcon className="w-6 h-6"/>
                      </button>
                   </div>
                ) : (
                  <div className="space-y-1 text-center">
                     <UploadIcon className="mx-auto h-12 w-12 text-slate-400" />
                     <div className="flex text-sm text-slate-600">
                       <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                         <span>Tải lên một file</span>
                         <input ref={fileInputRef} id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                       </label>
                       <p className="pl-1">hoặc kéo và thả</p>
                     </div>
                     <p className="text-xs text-slate-500">PNG, JPG, GIF tối đa 10MB</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="num-videos" className="font-medium text-slate-700">4. Số lượng video</label>
              <input
                id="num-videos"
                type="number"
                min={1} max={4}
                value={numVideos}
                onChange={(e) => setNumVideos(Number(e.target.value))}
                className="w-full mt-2 rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 transition"
              />
            </div>
            
            <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
              <button
                onClick={handleCreate}
                disabled={loadingState.active}
                className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
              >
                {loadingState.active ? <Spinner /> : <SparklesIcon className="w-5 h-5 mr-2" />}
                {loadingState.active ? 'Đang tạo...' : 'Tạo Video'}
              </button>
              <button onClick={resetForm} className="px-4 py-3 border border-slate-300 text-base font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50" disabled={loadingState.active}>
                Xóa
              </button>
            </div>
            
            {loadingState.active && (
              <div className="text-center text-sm text-indigo-600 p-2 bg-indigo-50 rounded-lg">
                {loadingState.message}
              </div>
            )}

            {message && (
              <div className={`p-3 rounded-lg text-sm text-center ${message.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                {message.text}
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="lg:col-span-3">
             <div className="bg-white rounded-xl shadow-lg p-6 min-h-[50vh]">
               <h2 className="text-2xl font-bold text-slate-800 mb-4">Kết quả</h2>
               {generatedVideos.length === 0 && !loadingState.active ? (
                   <div className="flex flex-col items-center justify-center text-center text-slate-500 h-full py-16">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                       <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                     </svg>
                     <p className="mt-4 text-lg">Video bạn tạo sẽ xuất hiện ở đây.</p>
                     <p className="text-sm">Hãy điền thông tin và nhấn "Tạo Video" để bắt đầu.</p>
                   </div>
               ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {generatedVideos.map(video => (
                    <div key={video.id} className="bg-slate-50 rounded-lg overflow-hidden border border-slate-200">
                      <div className="aspect-video">
                        <video controls src={video.url} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-4 text-sm">
                        <p className="font-semibold text-slate-700 truncate" title={video.prompt}>{video.prompt}</p>
                        <p className="text-slate-500">{video.style}</p>
                      </div>
                    </div>
                  ))}
                </div>
               )}
             </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
