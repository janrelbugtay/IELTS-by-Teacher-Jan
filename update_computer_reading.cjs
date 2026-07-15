const fs = require('fs');
let content = fs.readFileSync('src/pages/ComputerReadingTest.tsx', 'utf8');

// Replace the <p> with <div>
content = content.replace(
  '<p className={`leading-loose whitespace-pre-wrap ${theme.text}`}>',
  '<div className={`leading-loose whitespace-pre-wrap ${theme.text}`}>'
);

// Replace the ending </p> for renderSummaryText (we need to be careful)
content = content.replace(
  '            </span>          );\n        })}\n      </p>\n    );\n  };',
  '            </span>          );\n        })}\n      </div>\n    );\n  };'
);
// Let's do a fallback for </p> in case formatting differs:
content = content.replace(/<\/p>\s*\);\s*};\s*const/g, '</div>\n    );\n  };\n\n  const');

// Replace the span wrapper with React.Fragment and inline explanation
const targetSpanStart = `            return (
              <span 
                 key={i} 
                 id={\`question-\${qId}\`} 
                 className={spanClass}
                onClick={(e) => {
                  if (reviewMode) {
                    e.stopPropagation();
                    setActiveReviewQuestion(isActiveReview ? null : qId);
                  }
                }}
              >`;

const replacementSpanStart = `            return (
              <React.Fragment key={i}>
              <span 
                 id={\`question-\${qId}\`} 
                 className={spanClass}
                onClick={(e) => {
                  if (reviewMode) {
                    e.stopPropagation();
                    setActiveReviewQuestion(isActiveReview ? null : qId);
                  }
                }}
              >`;

const targetSpanEnd = `                  </button>
                )}
              </span>
            );`;

const replacementSpanEnd = `                  </button>
                )}
              </span>
              {reviewMode && isActiveReview && (
                <div className="block w-full my-4 cursor-default whitespace-normal leading-normal" onClick={(e) => e.stopPropagation()}>
                  {renderExplanationBox(qId)}
                </div>
              )}
              </React.Fragment>
            );`;

content = content.replace(targetSpanStart, replacementSpanStart);
content = content.replace(targetSpanEnd, replacementSpanEnd);

const bottomExpTarget = `                        {renderSummaryText(block.text, block.type, block.options)}
                        {reviewMode && activeReviewQuestion && summaryIds.includes(activeReviewQuestion) && (
                          <div className="mt-6 border-t pt-4 border-gray-200">
                            {renderExplanationBox(activeReviewQuestion)}
                          </div>
                        )}
                      </div>`;

const bottomExpReplacement = `                        {renderSummaryText(block.text, block.type, block.options)}
                      </div>`;

content = content.replace(bottomExpTarget, bottomExpReplacement);

fs.writeFileSync('src/pages/ComputerReadingTest.tsx', content);
console.log("Success");
