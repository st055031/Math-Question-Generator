
import React, { useMemo } from 'react';

interface LatexRendererProps {
  content: string;
}

// Global reference to katex loaded in index.html
declare const katex: any;

const LatexRenderer: React.FC<LatexRendererProps> = ({ content }) => {
  const renderedContent = useMemo(() => {
    if (typeof katex === 'undefined') {
      return <span>{content}</span>;
    }

    // Regex to match various LaTeX delimiters
    // Group 1: $$...$$ (Display)
    // Group 2: \[...\] (Display)
    // Group 3: $...$ (Inline)
    // Group 4: \(...\) (Inline)
    const latexRegex = /(\$\$.*?\$\$|\\\[.*?\\\]|\$.*?\$|\\\(.*?\\\))/g;

    const parts = content.split(latexRegex);

    return parts.map((part, index) => {
      if (!part) return null;

      try {
        // Display mode (block)
        if ((part.startsWith('$$') && part.endsWith('$$')) || 
            (part.startsWith('\\[') && part.endsWith('\\]'))) {
          const formula = part.startsWith('$$') ? part.slice(2, -2) : part.slice(2, -2);
          const html = katex.renderToString(formula, { displayMode: true, throwOnError: false });
          return (
            <div 
              key={index} 
              className="my-4 overflow-x-auto overflow-y-hidden py-2" 
              dangerouslySetInnerHTML={{ __html: html }} 
            />
          );
        }

        // Inline mode
        if ((part.startsWith('$') && part.endsWith('$')) || 
            (part.startsWith('\\(') && part.endsWith('\\)'))) {
          const formula = part.startsWith('$') ? part.slice(1, -1) : part.slice(2, -2);
          const html = katex.renderToString(formula, { displayMode: false, throwOnError: false });
          return (
            <span 
              key={index} 
              className="inline-block px-1 align-middle"
              dangerouslySetInnerHTML={{ __html: html }} 
            />
          );
        }

        // Smart fallback: If a part looks like LaTeX but isn't delimited (e.g. just "\frac{1}{2}")
        if (part.includes('\\frac') || part.includes('\\sqrt') || part.includes('^') || part.includes('_')) {
           const html = katex.renderToString(part, { displayMode: false, throwOnError: false });
           return (
            <span 
              key={index} 
              className="inline-block px-1 align-middle"
              dangerouslySetInnerHTML={{ __html: html }} 
            />
          );
        }

        // Regular text
        return <span key={index}>{part}</span>;
      } catch (e) {
        console.error("KaTeX error for part:", part, e);
        return <span key={index}>{part}</span>;
      }
    });
  }, [content]);

  return (
    <div className="latex-container leading-relaxed break-words">
      {renderedContent}
    </div>
  );
};

export default LatexRenderer;
