import React, { useState, useRef } from 'react';
import { Upload, X, ArrowRight, Download, Wand2, Image as ImageIcon, Sparkles } from 'lucide-react';
import { Header } from './components/Header';
import { Button } from './components/Button';
import { transformImageWithGemini } from './services/geminiService';
import { fileToDataUri, parseDataUri, downloadImage } from './utils/imageUtils';
import { TransformState } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<TransformState>({
    originalImage: null,
    transformedImage: null,
    isLoading: false,
    error: null,
    prompt: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setState(prev => ({ ...prev, error: "الرجاء اختيار ملف صورة صالح (JPG, PNG, WebP)" }));
      return;
    }

    // Limit size mostly for UX (client side check), though API has higher limits
    if (file.size > 5 * 1024 * 1024) {
       setState(prev => ({ ...prev, error: "حجم الصورة كبير جداً. الرجاء اختيار صورة أقل من 5 ميجابايت." }));
       return;
    }

    try {
      const dataUri = await fileToDataUri(file);
      setState({
        originalImage: dataUri,
        transformedImage: null, // Reset previous result
        isLoading: false,
        error: null,
        prompt: '',
      });
    } catch (err) {
      setState(prev => ({ ...prev, error: "فشل في قراءة ملف الصورة." }));
    }
  };

  const handleTransform = async () => {
    if (!state.originalImage) return;
    if (!state.prompt.trim()) {
      setState(prev => ({ ...prev, error: "الرجاء إدخال وصف للتعديل المطلوب." }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { base64, mimeType } = parseDataUri(state.originalImage);
      const transformedUri = await transformImageWithGemini(base64, mimeType, state.prompt);
      
      setState(prev => ({
        ...prev,
        transformedImage: transformedUri,
        isLoading: false,
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || "حدث خطأ أثناء الاتصال بخدمة الذكاء الاصطناعي.",
      }));
    }
  };

  const resetApp = () => {
    setState({
      originalImage: null,
      transformedImage: null,
      isLoading: false,
      error: null,
      prompt: '',
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen pb-12 font-sans selection:bg-blue-500/30">
      <Header />

      <main className="max-w-6xl mx-auto px-4">
        
        {/* Error Notification */}
        {state.error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl mb-6 flex items-center justify-between animate-fade-in">
            <p>{state.error}</p>
            <button onClick={() => setState(s => ({...s, error: null}))} className="p-1 hover:bg-red-500/20 rounded-full">
              <X size={20} />
            </button>
          </div>
        )}

        {/* Upload Section (Visible only if no image selected) */}
        {!state.originalImage && (
          <div className="max-w-2xl mx-auto">
            <div 
              className="border-2 border-dashed border-slate-600 hover:border-blue-500 bg-slate-800/50 hover:bg-slate-800 transition-colors rounded-2xl p-12 text-center cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Upload className="w-10 h-10 text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">اضغط لرفع صورة</h2>
              <p className="text-slate-400">أو قم بسحب وإفلات الملف هنا</p>
              <p className="text-sm text-slate-500 mt-4">JPG, PNG, WebP (Max 5MB)</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          </div>
        )}

        {/* Editor Section (Visible if image selected) */}
        {state.originalImage && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up">
            
            {/* Input Column */}
            <div className="space-y-6">
              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-200 flex items-center gap-2">
                    <ImageIcon size={18} /> الصورة الأصلية
                  </h3>
                  <button 
                    onClick={resetApp} 
                    className="text-xs text-red-400 hover:text-red-300 hover:underline"
                    disabled={state.isLoading}
                  >
                    حذف واختيار أخرى
                  </button>
                </div>
                <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-slate-700/50">
                   <img 
                    src={state.originalImage} 
                    alt="Original" 
                    className="max-h-full max-w-full object-contain" 
                  />
                </div>
              </div>

              <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 shadow-xl">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  كيف تريد تعديل الصورة؟
                </label>
                <textarea
                  value={state.prompt}
                  onChange={(e) => setState(prev => ({ ...prev, prompt: e.target.value }))}
                  placeholder="مثال: اجعل السماء تمطر، أضف نظارات شمسية للقطة، حول الصورة إلى نمط كرتوني..."
                  className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-shadow placeholder:text-slate-600"
                  disabled={state.isLoading}
                />
                <div className="mt-4 flex justify-end">
                   <Button 
                    onClick={handleTransform} 
                    isLoading={state.isLoading}
                    disabled={!state.prompt.trim()}
                    className="w-full md:w-auto"
                   >
                     <Wand2 size={18} />
                     تحويل الصورة
                   </Button>
                </div>
              </div>
            </div>

            {/* Output Column */}
            <div className="space-y-6">
              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 shadow-xl h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 flex items-center gap-2">
                    <Sparkles size={18} className="text-blue-400" /> النتيجة
                  </h3>
                  {state.transformedImage && (
                    <button 
                      onClick={() => state.transformedImage && downloadImage(state.transformedImage, 'transformed-image.png')}
                      className="text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300 hover:underline"
                    >
                      <Download size={14} /> حفظ الصورة
                    </button>
                  )}
                </div>

                <div className="flex-1 min-h-[300px] relative bg-slate-900 rounded-xl border border-slate-700/50 flex items-center justify-center overflow-hidden">
                  {state.isLoading ? (
                    <div className="text-center p-8">
                       <div className="relative w-20 h-20 mx-auto mb-4">
                          <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                          <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
                       </div>
                       <p className="text-slate-300 animate-pulse">جاري الرسم بالذكاء الاصطناعي...</p>
                       <p className="text-slate-500 text-sm mt-2">قد يستغرق هذا بضع ثوانٍ</p>
                    </div>
                  ) : state.transformedImage ? (
                    <img 
                      src={state.transformedImage} 
                      alt="Transformed" 
                      className="max-h-full max-w-full object-contain animate-fade-in" 
                    />
                  ) : (
                    <div className="text-center text-slate-600 p-8">
                      <div className="mb-3 flex justify-center opacity-50">
                        <ArrowRight size={40} className="rotate-90 lg:rotate-180" />
                      </div>
                      <p>النتيجة ستظهر هنا</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}
      </main>

      <footer className="fixed bottom-0 w-full p-4 text-center text-slate-600 text-sm pointer-events-none">
        <p>Powered by Google Gemini 2.5 Flash</p>
      </footer>
    </div>
  );
};

export default App;