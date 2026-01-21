
import React, { useState, useRef } from 'react';
import { analyzeMathProblems, generateProblemImage } from './services/geminiService';
import { AnalysisResult, MathProblemSet } from './types';
import ProblemCard from './components/ProblemCard';
import AnswerSheet from './components/AnswerSheet';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setLoading(true);
      setError(null);
      setResults(null);
      setLoadingStep('深度識別原題與檢查代數邏輯...');

      try {
        // 第一步：AI 分析與變體生成
        const data = await analyzeMathProblems(base64);
        
        // 更新 UI 狀態，告知正在生成圖形
        setLoadingStep('正在為變體題目繪製專屬圖形...');

        // 第二步：並行生成所有變體的圖片，確保與題目數值一一對應
        const updatedProblems = await Promise.all(data.problems.map(async (problemSet) => {
          if (problemSet.hasFigure) {
            const variationsWithImages = await Promise.all(problemSet.variations.map(async (v) => {
              if (v.imagePrompt) {
                // 每個變體根據其專屬的 Prompt 生成獨立圖片
                const imgUrl = await generateProblemImage(v.imagePrompt);
                return { ...v, imageUrl: imgUrl };
              }
              return v;
            }));
            return { ...problemSet, variations: variationsWithImages };
          }
          return problemSet;
        }));

        setResults({ problems: updatedProblems });
      } catch (err: any) {
        console.error("處理流程出錯:", err);
        setError(err.message || "分析過程中發生數學邏輯或連線錯誤。");
      } finally {
        setLoading(false);
        setLoadingStep('');
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen pb-20 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="py-10 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-800 mb-4">
          數學題目變體生成器 <span className="text-sm font-normal text-gray-400 bg-gray-100 px-2 py-1 rounded-full align-middle">v2.0 Logic Pro</span>
        </h1>
        <p className="text-gray-600 text-lg max-w-3xl mx-auto">
          專業 AI 引擎會分析題目邏輯與代數結構，生成具備正確幾何性質與數值多樣性的變體題目。
        </p>
      </header>

      {/* Upload Section */}
      <section className="mb-12">
        <div 
          onClick={triggerFileInput}
          className={`
            relative overflow-hidden cursor-pointer
            border-2 border-dashed rounded-2xl p-8 md:p-12
            flex flex-col items-center justify-center transition-all duration-300
            ${imagePreview ? 'border-indigo-400 bg-indigo-50/30' : 'border-gray-300 bg-white hover:border-indigo-500 hover:bg-gray-50'}
          `}
        >
          {imagePreview ? (
            <div className="flex flex-col items-center">
              <img src={imagePreview} alt="原題預覽" className="max-h-72 rounded-lg shadow-xl mb-4 object-contain bg-white p-2" />
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-full shadow-md">已選取圖片</span>
                <span className="px-3 py-1 bg-white text-gray-500 text-sm rounded-full border border-gray-200">點擊更換</span>
              </div>
            </div>
          ) : (
            <>
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-gray-800 mb-2">上傳題目照片</p>
              <p className="text-gray-500 text-center max-w-sm">支援幾何圖形、代數運算或統計圖表。<br/>AI 將確保變體題目的數值邏輯正確。</p>
            </>
          )}
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            accept="image/*"
            onChange={handleFileUpload}
          />
        </div>

        {loading && (
          <div className="mt-12 flex flex-col items-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-200 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
            </div>
            <div className="text-center mt-6">
              <p className="text-indigo-700 font-bold text-xl mb-1">{loadingStep}</p>
              <p className="text-gray-400 text-sm">正在執行數學建模與並行圖像渲染...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-8 p-5 bg-red-50 border-l-8 border-red-500 text-red-800 rounded-r-xl shadow-sm flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-bold">分析失敗</p>
              <p className="text-sm opacity-90">{error}</p>
            </div>
          </div>
        )}
      </section>

      {/* Results Display */}
      {results && (
        <main className="space-y-16 animate-in slide-in-from-bottom-6 duration-700">
          {results.problems.map((problemSet, index) => (
            <div key={problemSet.id} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <span className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-lg shadow-lg shadow-indigo-200">
                    {index + 1}
                  </span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">題目單元分析</h2>
                    {problemSet.hasFigure && <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded uppercase tracking-tighter">幾何/圖表邏輯已同步</span>}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Original Problem */}
                <div className="relative group">
                  <div className="absolute -top-3 left-4 px-2 py-0.5 bg-gray-900 text-white text-[10px] font-bold rounded z-10">REFERENCE</div>
                  <ProblemCard 
                    problem={problemSet.original} 
                    label="原始題目" 
                    index={index} 
                  />
                </div>
                
                {/* Variations */}
                {problemSet.variations.map((v, vIndex) => (
                  <div key={vIndex} className="relative">
                    <div className="absolute -top-3 left-4 px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded z-10 shadow-sm">VARIATION {vIndex + 1}</div>
                    <ProblemCard 
                      problem={v} 
                      label="變體題目" 
                      index={vIndex} 
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Answers Area */}
          <AnswerSheet problems={results.problems} />
        </main>
      )}

      {/* Floating Action Button */}
      {results && (
        <button 
          onClick={() => {
            setResults(null);
            setImagePreview(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="fixed bottom-8 right-8 p-5 bg-white text-indigo-600 rounded-full shadow-2xl border border-indigo-100 hover:scale-110 active:scale-95 transition-all z-20 group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default App;
