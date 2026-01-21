
import React, { useState } from 'react';
import { ProblemContent } from '../types';
import LatexRenderer from './LatexRenderer';

interface ProblemCardProps {
  problem: ProblemContent;
  label: string;
  index: number;
}

const ProblemCard: React.FC<ProblemCardProps> = ({ problem, label, index }) => {
  const [isEnlarged, setIsEnlarged] = useState(false);

  return (
    <>
      <div 
        onClick={() => setIsEnlarged(true)}
        className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full"
      >
        <span className="text-xs font-bold text-blue-600 mb-2 uppercase tracking-wider">{label} {index + 1}</span>
        
        {/* 如果有生成的圖片，顯示出來 */}
        {problem.imageUrl && (
          <div className="mb-4 bg-gray-50 rounded border border-gray-100 flex justify-center p-2 overflow-hidden">
            <img src={problem.imageUrl} alt="題目圖形" className="max-h-32 object-contain mix-blend-multiply" />
          </div>
        )}

        <div className="text-gray-800 leading-relaxed text-sm md:text-base flex-grow">
          <LatexRenderer content={problem.text} />
        </div>
      </div>

      {isEnlarged && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-in fade-in duration-300"
          onClick={() => setIsEnlarged(false)}
        >
          <div 
            className="bg-white p-8 rounded-xl max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => setIsEnlarged(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <span className="text-sm font-bold text-blue-600 mb-4 block uppercase tracking-wider">{label} {index + 1}</span>
            
            {problem.imageUrl && (
              <div className="mb-6 bg-white rounded-lg border border-gray-200 flex justify-center p-4">
                <img src={problem.imageUrl} alt="題目圖形" className="max-h-64 md:max-h-80 object-contain" />
              </div>
            )}

            <div className="text-xl md:text-2xl text-gray-900 leading-loose">
              <LatexRenderer content={problem.text} />
            </div>
            
            <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setIsEnlarged(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProblemCard;
