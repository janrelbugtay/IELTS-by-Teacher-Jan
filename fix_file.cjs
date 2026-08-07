const fs = require('fs');
let code = fs.readFileSync('src/pages/ComputerReadingTest.tsx', 'utf8');

// The file has several corrupted copies of renderParagraphWithReviewHighlight
// Let's find the FIRST occurrence of something that looks like the start of the corruption
// The previous code had: `const renderParagraphWithReviewHighlight = (text: string, passageId: any) => {`

const startStr = `  const renderParagraphWithReviewHighlight = (`;
const endStr = `  const renderParagraphWithHighlights = (`;

let startIndex = code.indexOf("  const renderParagraphWithReviewHighlight = (");
// There might be some corrupted stuff before this if it was inside useEffect, wait, let's look at line 856:

const beforeStr = `      window.getSelection()?.removeAllRanges();
    }, 1000);
  };`;

startIndex = code.indexOf(beforeStr) + beforeStr.length;
const endIndex = code.indexOf("  const renderQuestionBox = (");
const endIndexToKeep = code.indexOf("  const renderParagraphWithHighlights = (", startIndex);

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

` + code.substring(endIndexToKeep);

fs.writeFileSync('src/pages/ComputerReadingTest.tsx', cleanCode);
console.log("File fixed!");
