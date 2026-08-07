const fs = require('fs');
let code = fs.readFileSync('src/pages/ComputerReadingTest.tsx', 'utf8');

const target = `    explanation.highlights.forEach((highlightStr: string) => {
      if (!highlightStr) return;
      const newElements: any[] = [];
      elements.forEach((el) => {
        if (typeof el === 'string') {
          const parts = el.split(highlightStr);
          parts.forEach((part, i) => {
            newElements.push(part);
            if (i < parts.length - 1) {
              
              let innerElements: any[] = [highlightStr];
              
              if (isInputType && answerParts.length > 0) {
                  answerParts.forEach((ans: string) => {
                      const escapedAns = ans.replace(/[-/\\\\^$*+?.()|[\\]{}]/g, '\\\\$&');
                      const regex = new RegExp(\`\\\\b(\${escapedAns})\\\\b\`, 'gi');
                      
                      const newInner: any[] = [];
                      innerElements.forEach(innerEl => {
                          if (typeof innerEl === 'string') {
                              const splitInner = innerEl.split(regex);
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
    });`;

const replacement = `    explanation.highlights.forEach((highlightStr: string) => {
      if (!highlightStr) return;
      const newElements: any[] = [];
      elements.forEach((el) => {
        if (typeof el === 'string') {
          const escapeRegExp = (string: string) => string.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&');
          const highlightParts = highlightStr.split('...');
          const escapedParts = highlightParts.map(p => escapeRegExp(p.trim())).filter(p => p.length > 0);
          
          let regexString = escapedParts.join('[\\\\s\\\\S]*?');
          // Allow flexible matching for quotes
          regexString = regexString.replace(/['\\'’‘]/g, "['\\'’‘]").replace(/["“”]/g, '["“”]');

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
    });`;

if (code.includes(target)) {
  fs.writeFileSync('src/pages/ComputerReadingTest.tsx', code.replace(target, replacement));
  console.log("Patched highlights successfully");
} else {
  console.log("Target highlights not found");
}
