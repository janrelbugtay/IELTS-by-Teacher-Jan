const fs = require('fs');
let code = fs.readFileSync('src/pages/ComputerReadingTest.tsx', 'utf8');

const beforeStr = `      window.getSelection()?.removeAllRanges();
    }, 1000);
  };`;

const afterStr = `  const renderQuestionBox = (passageIdx: number) => (qNum: number) => {`;

const startIndex = code.indexOf(beforeStr) + beforeStr.length;
const endIndex = code.lastIndexOf(afterStr);

const cleanCode = code.substring(0, startIndex) + `

  const renderParagraphWithReviewHighlight = (text: string, passageId: any) => {
    if (!reviewMode || !activeReviewQuestion) return text;
    const explanation = (currentExplanations as any)[activeReviewQuestion];
    if (!explanation || explanation.passageId !== passageId || !explanation.highlights) return text;

    const correctAnsRaw = (currentAnswerKey as any)[activeReviewQuestion];
    const answerParts = correctAnsRaw ? correctAnsRaw.split('/').map((a: string) => a.trim()) : [];
    
    const isInputType = answerParts.length > 0 && !['TRUE', 'FALSE', 'NOT GIVEN', 'YES', 'NO'].includes(answerParts[0].toUpperCase()) && answerParts[0].length > 1;
    
    let elements: any[] = [text];
    
    explanation.highlights.forEach((highlightStr: string) => {
      if (!highlightStr) return;
      const newElements: any[] = [];
      elements.forEach((el) => {
        if (typeof el === 'string') {
          const escapeRegExp = (string: string) => string.replace(/[.*+?^\\$\\{}()|[\\]\\\\\\/]/g, '\\\\$&');
          const highlightParts = highlightStr.split('...');
          const escapedParts = highlightParts.map(p => escapeRegExp(p.trim())).filter(p => p.length > 0);
          
          let regexString = escapedParts.join('[\\\\s\\\\S]*?');
          regexString = regexString.replace(/['’‘]/g, "['’‘]").replace(/["“”]/g, '["“”]');

          if (!regexString) {
             newElements.push(el);
             return;
          }

          const regex = new RegExp(\`(\${regexString})\`, 'i');
          const parts = el.split(regex);
          
          parts.forEach((part, i) => {
            if (i % 2 === 0) {
              if (part) newElements.push(part);
            } else {
              let innerElements: any[] = [part];
              
              if (isInputType && answerParts.length > 0) {
                  answerParts.forEach((ans: string) => {
                      const escapedAns = ans.replace(/[-/\\\\^$*+?.()|[\\]{}]/g, '\\\\$&');
                      const regexAns = new RegExp(\`\\\\b(\${escapedAns})\\\\b\`, 'gi');
                      
                      const newInner: any[] = [];
                      innerElements.forEach(innerEl => {
                          if (typeof innerEl === 'string') {
                              const splitInner = innerEl.split(regexAns);
                              splitInner.forEach((si, keyIdx) => {
                                  if (si.toLowerCase() === ans.toLowerCase()) {
                                      newInner.push(<span key={\`ans-\${keyIdx}\`} className="bg-green-600 text-white px-1.5 py-[1px] rounded shadow-sm font-black mx-[2px] uppercase tracking-wider">{si}</span>);
                                  } else if (si) {
                                      newInner.push(si);
                                  }
                              });
                          } else {
                              newInner.push(innerEl);
                          }
                      });
                      innerElements = newInner;
                  });
              }

              newElements.push(
                <mark key={\`\${highlightStr}-\${i}\`} className="review-highlight bg-yellow-300 text-black px-1.5 py-0.5 rounded shadow-sm font-semibold transition-colors duration-300">
                  {innerElements.map((item, idx) => <React.Fragment key={idx}>{item}</React.Fragment>)}
                </mark>
              );
            }
          });
        } else {
          newElements.push(el);
        }
      });
      elements = newElements;
    });
    
    return elements.map((el, i) => <React.Fragment key={i}>{el}</React.Fragment>);
  };

  const renderParagraphWithHighlights = (text: string, paragraphIdx: number, passageId: any) => {
    if (reviewMode) {
      return renderParagraphWithReviewHighlight(text, passageId);
    }

    const passageHLs = highlights[passageId] || {};
    const paraHLs = passageHLs[paragraphIdx] || [];

    if (paraHLs.length === 0) return text;

    let result = [];
    let lastIndex = 0;

    paraHLs.forEach((hl: any) => {
      if (hl.start > lastIndex) {
        result.push(<span key={\`text-\${lastIndex}\`}>{text.substring(lastIndex, hl.start)}</span>);
      }
      result.push(
        <mark
          key={\`hl-\${hl.id}\`}
          className={\`bg-yellow-200 cursor-pointer relative group rounded-sm transition-colors hover:bg-yellow-300 \${hl.note ? 'border-b-2 border-yellow-500' : ''}\`}
          onClick={(e) => handleExistingHighlightClick(e, hl, passageId, paragraphIdx)}
        >
          {text.substring(hl.start, hl.end)}
          {hl.note && (
             <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-800 text-white text-xs p-2 rounded shadow-lg whitespace-nowrap z-40 max-w-xs truncate pointer-events-none">
               {hl.note}
             </span>
          )}
          {hl.note && <MessageSquare size={12} className="inline ml-1 text-yellow-600 opacity-70" />}
        </mark>
      );
      lastIndex = hl.end;
    });

    if (lastIndex < text.length) {
      result.push(<span key={\`text-\${lastIndex}\`}>{text.substring(lastIndex)}</span>);
    }

    return result;
  };

` + code.substring(endIndex);

fs.writeFileSync('src/pages/ComputerReadingTest.tsx', cleanCode);
console.log("File fixed!");
