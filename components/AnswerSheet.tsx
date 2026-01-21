
import React from 'react';
import { MathProblemSet } from '../types';
import LatexRenderer from './LatexRenderer';

interface AnswerSheetProps {
  problems: MathProblemSet[];
}

const AnswerSheet: React.FC<AnswerSheetProps> = ({ problems }) => {
  if (problems.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-xl shadow-gray-200/50">
      <div className="flex flex-col items-center mb-12">
        <div className="w-12 h-1.5 bg-indigo-600/20 rounded-full mb-6"></div>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">解答參考集</h2>
        <div className="mt-2 flex items-center gap-2">
          <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
          <p className="text-gray-500 text-sm font-medium">已根據變體題目的邏輯生成對應答案</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {problems.map((set, setIdx) => (
          <div key={set.id} className="flex flex-col h-full bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-sm shadow-md shadow-indigo-100">
                {setIdx + 1}
              </span>
              <h3 className="font-bold text-gray-800">單元解答</h3>
            </div>
            
            <div className="space-y-6 flex-grow">
              {/* Original Answer */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Original</span>
                  <span className="h-px flex-grow ml-3 bg-gray-200"></span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-gray-200 text-indigo-700 font-bold text-center shadow-sm">
                  <LatexRenderer content={set.original.answer} />
                </div>
              </div>

              {/* Variation Answers */}
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Variations</span>
                  <span className="h-px flex-grow ml-3 bg-indigo-100"></span>
                </div>
                {set.variations.map((v, vIdx) => (
                  <div key={vIdx} className="group flex items-center gap-3 p-3 bg-white/60 rounded-xl border border-indigo-50 hover:border-indigo-200 transition-colors">
                    <span className="text-[10px] font-bold text-indigo-300 group-hover:text-indigo-500 transition-colors">#{vIdx + 1}</span>
                    <div className="flex-grow text-center font-bold text-gray-700">
                      <LatexRenderer content={v.answer} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 pt-8 border-t border-gray-50 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full border border-amber-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p className="text-xs text-amber-800 font-medium italic">
            提醒：所有解答由 AI 自動演算，建議使用前進行二次核對。
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnswerSheet;
