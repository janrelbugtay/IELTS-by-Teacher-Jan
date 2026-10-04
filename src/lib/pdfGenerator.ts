import html2pdf from 'html2pdf.js';

interface ReadingPdfOptions {
  testTitle: string;
  candidateName: string;
  score: number;
  bandScore: string;
  dateStr?: string;
  passages: any[];
  userAnswers: Record<number, string>;
  answerKey: Record<number, string>;
  explanations: Record<number, any>;
}

export async function generateReadingExplanationPDF({
  testTitle,
  candidateName,
  score,
  bandScore,
  dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
  passages,
  userAnswers,
  answerKey,
  explanations,
  openInGoogleDocs = true,
}: ReadingPdfOptions & { openInGoogleDocs?: boolean }) {
  // Check answer correctness helper
  const isAnswerCorrect = (qNum: number) => {
    const userAns = (userAnswers[qNum] || '').toString().trim().toUpperCase();
    const correctAnsRaw = (answerKey as any)[qNum];
    if (!correctAnsRaw) return false;
    const validAnswers = correctAnsRaw.split('/').map((s: string) => s.trim().toUpperCase());
    for (let correctAns of validAnswers) {
      if (userAns === correctAns) return true;
      if (userAns.startsWith(correctAns + " ") || userAns.startsWith(correctAns + ".")) return true;
    }
    return false;
  };

  // Helper to get questions for each passage
  const getQuestionsForPassage = (pIdx: number) => {
    if (pIdx === 0) return Array.from({ length: 13 }, (_, i) => i + 1);
    if (pIdx === 1) return Array.from({ length: 13 }, (_, i) => i + 14);
    return Array.from({ length: 14 }, (_, i) => i + 27);
  };

  // Helper to find question object by ID across passage questionBlocks
  const findQuestionObj = (p: any, qId: number) => {
    if (!p || !p.questionBlocks) return null;
    for (const block of p.questionBlocks) {
      if (block.questions) {
        const found = block.questions.find((q: any) => q.id === qId);
        if (found) return { ...found, blockTitle: block.title, blockType: block.type, instruction: block.instruction };
      }
    }
    return null;
  };

  // Clean prompt text for display (remove bullet points or leading markers if duplicated)
  const formatQuestionPrompt = (qObj: any, qNum: number, userAns: string) => {
    if (!qObj || !qObj.text) return `Question ${qNum}`;
    let text = qObj.text;
    
    // Replace fill-in-the-blank line (e.g. 1 _____ or _____) with the user's answer in a box
    const blankRegex = new RegExp(`(?:\\b${qNum}\\s*)?_{2,}`, 'g');
    if (blankRegex.test(text)) {
      return text.replace(blankRegex, `<span class="answer-inline-box">${userAns || 'No Answer'}</span>`);
    }
    return text;
  };

  // Parse explanation into main explanation and synonyms
  const parseExplanationContent = (rawExp: string) => {
    if (!rawExp) return { explanationText: '', synonymsList: [] };
    
    let explanationText = rawExp;
    let synonymsList: string[] = [];

    const synonymsIdx = rawExp.indexOf('Synonyms:');
    if (synonymsIdx !== -1) {
      explanationText = rawExp.substring(0, synonymsIdx).trim();
      const synonymsPart = rawExp.substring(synonymsIdx + 9).trim();
      synonymsList = synonymsPart.split('\n').map(s => s.trim()).filter(s => s.length > 0);
    }

    // Clean up "Explanation:" prefix if repeated
    explanationText = explanationText.replace(/^Explanation:\s*/i, '').trim();

    return { explanationText, synonymsList };
  };

  // Create temporary export container
  const container = document.createElement('div');
  container.className = 'reading-pdf-export-root';
  container.style.width = '1200px';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#1e293b';
  container.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  container.style.boxSizing = 'border-box';

  let htmlContent = `
    <style>
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      @page {
        size: A4 landscape;
        margin: 6mm 8mm;
      }
      .reading-pdf-export-root {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        color: #1e293b;
        background: #ffffff;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .page-landscape {
        page-break-after: always;
        break-after: page;
        padding: 12px 18px;
        box-sizing: border-box;
        background: #ffffff;
        page-break-inside: avoid;
        break-inside: avoid;
      }
      .page-landscape:last-child {
        page-break-after: auto;
        break-after: auto;
      }
      .header-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid #2563eb;
        padding-bottom: 8px;
        margin-bottom: 12px;
      }
      .two-col-grid {
        display: flex;
        gap: 16px;
        align-items: flex-start;
      }
      .col-passage {
        flex: 1;
        width: 50%;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 12px 14px;
        box-sizing: border-box;
      }
      .col-questions {
        flex: 1;
        width: 50%;
        background: #ffffff;
        box-sizing: border-box;
      }
      .passage-para {
        font-size: 11px;
        line-height: 1.55;
        color: #334155;
        margin-bottom: 8px;
        text-align: justify;
      }
      
      /* Accurate tight in-line highlights */
      mark.clue-highlight {
        background-color: #facc15 !important; /* Rich amber-yellow */
        color: #000000 !important;
        font-weight: 700;
        padding: 1px 4px;
        border-radius: 3px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.06);
        display: inline;
        line-height: inherit;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      mark.clue-highlight .ans-key-tag {
        background-color: #16a34a !important;
        color: #ffffff !important;
        font-size: 9.5px;
        font-weight: 900;
        padding: 1px 4px;
        border-radius: 3px;
        margin: 0 2px;
        text-transform: uppercase;
        display: inline-block;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      /* Review card style exact to UI mockup */
      .review-card {
        border-radius: 12px;
        border: 1.5px solid #fed7aa;
        background: #ffffff;
        padding: 11px 13px;
        margin-bottom: 10px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.03);
        page-break-inside: avoid;
        break-inside: avoid;
        position: relative;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .review-card:last-child {
        margin-bottom: 0;
      }
      .review-card.is-correct {
        border-color: #86efac;
      }
      .review-card.is-incorrect {
        border-color: #fca5a5;
      }

      .card-top-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }
      .q-number-pill {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        border: 1.5px solid #ef4444;
        color: #dc2626;
        font-weight: 900;
        font-size: 10.5px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #ffffff;
      }
      .is-correct .q-number-pill {
        border-color: #16a34a;
        color: #16a34a;
      }

      .q-prompt-text {
        font-size: 11.5px;
        color: #1e293b;
        line-height: 1.45;
        font-weight: 500;
        margin-bottom: 8px;
        white-space: pre-wrap;
      }
      .answer-inline-box {
        display: inline-block;
        border: 1px solid #ef4444;
        background: #fef2f2 !important;
        color: #dc2626 !important;
        font-weight: 800;
        padding: 1px 6px;
        border-radius: 4px;
        font-size: 11px;
        margin: 0 2px;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .is-correct .answer-inline-box {
        border-color: #16a34a;
        background: #f0fdf4 !important;
        color: #16a34a !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      /* Exact side-by-side Answer Comparison Box */
      .answer-compare-grid {
        display: flex;
        gap: 8px;
        margin-bottom: 8px;
      }
      .compare-cell {
        flex: 1;
        border: 1.5px solid #cbd5e1;
        border-radius: 8px;
        padding: 5px 8px;
        background: #ffffff;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .compare-cell.cell-your {
        border-color: #fca5a5;
        background: #ffffff;
      }
      .compare-cell.cell-correct {
        border-color: #86efac;
        background: #f0fdf4 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .cell-label {
        font-size: 8.5px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #64748b;
        margin-bottom: 2px;
      }
      .cell-label.label-your {
        color: #dc2626;
      }
      .cell-label.label-correct {
        color: #15803d;
      }
      .cell-val {
        font-size: 12px;
        font-weight: 900;
        color: #0f172a;
      }
      .cell-val.val-your {
        color: #dc2626;
      }
      .cell-val.val-correct {
        color: #15803d;
      }

      /* Yellow Explanation callout box */
      .explanation-callout {
        background: #fefce8 !important;
        border: 1px solid #fef08a;
        border-radius: 8px;
        padding: 8px 10px;
        color: #334155;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .exp-title-row {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 10px;
        font-weight: 700;
        color: #2563eb;
        margin-bottom: 3px;
      }
      .exp-body-text {
        font-size: 10.5px;
        line-height: 1.45;
        color: #475569;
        margin-bottom: 5px;
      }
      .synonyms-container {
        border-top: 1px dashed #fde047;
        padding-top: 4px;
        margin-top: 4px;
      }
      .synonyms-title {
        font-size: 9.5px;
        font-weight: 700;
        color: #713f12;
        margin-bottom: 2px;
      }
      .synonym-item {
        font-size: 9.5px;
        color: #854d0e;
        line-height: 1.35;
      }
    </style>
  `;

  // Render Passages
  passages.forEach((p: any, pIdx: number) => {
    const qNums = getQuestionsForPassage(pIdx);

    // Build map of exact highlights for this passage
    // E.g. highlight -> { keyWord: 'UPDATE', clue: 'businesses were able to update...' }
    const passageClues: { text: string; qId: number; answerWord?: string }[] = [];
    qNums.forEach(q => {
      const exp = explanations[q];
      const ansKey = (answerKey[q] || '').toString();
      if (exp && exp.highlights) {
        exp.highlights.forEach((h: string) => {
          if (h && h.trim()) {
            passageClues.push({
              text: h.trim(),
              qId: q,
              answerWord: ansKey
            });
          }
        });
      }
    });

    // Helper to highlight passage paragraphs accurately without breaking text formatting
    const renderParagraphWithHighlights = (rawText: string) => {
      let result = rawText;
      // Sort clues by length descending so longer phrases match first
      const sortedClues = [...passageClues].sort((a, b) => b.text.length - a.text.length);

      sortedClues.forEach(clue => {
        if (!clue.text) return;
        const safeSnippet = clue.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${safeSnippet})`, 'gi');

        result = result.replace(regex, (match) => {
          // If clue contains the exact answer word, highlight that keyword in green pill inside the amber highlight
          if (clue.answerWord && !['TRUE', 'FALSE', 'NOT GIVEN', 'YES', 'NO'].includes(clue.answerWord.toUpperCase())) {
            const ansParts = clue.answerWord.split('/').map(w => w.trim());
            let innerHighlight = match;
            ansParts.forEach(aw => {
              if (aw && aw.length > 1) {
                const safeWord = aw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const wordRegex = new RegExp(`\\b(${safeWord})\\b`, 'gi');
                innerHighlight = innerHighlight.replace(wordRegex, `<span class="ans-key-tag">$1</span>`);
              }
            });
            return `<mark class="clue-highlight">${innerHighlight}</mark>`;
          }
          return `<mark class="clue-highlight">${match}</mark>`;
        });
      });
      return result;
    };

    // Helper to render a question card
    const renderCardHtml = (qNum: number) => {
      const isCorrect = isAnswerCorrect(qNum);
      const userAns = userAnswers[qNum] || 'No Answer';
      const correctAns = ((answerKey as any)[qNum] || '').toString();
      const expObj = explanations[qNum];
      const rawExp = expObj?.explanation || 'Answer directly verified in the highlighted text.';
      const { explanationText, synonymsList } = parseExplanationContent(rawExp);

      const qObj = findQuestionObj(p, qNum);
      const promptHtml = formatQuestionPrompt(qObj, qNum, userAns);

      return `
        <div class="review-card ${isCorrect ? 'is-correct' : 'is-incorrect'}">
          <!-- Header Row: Question number & Status -->
          <div class="card-top-row">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div class="q-number-pill">${qNum}</div>
              <span style="font-size: 9.5px; font-weight: 800; padding: 2px 6px; border-radius: 4px; background: ${isCorrect ? '#dcfce7' : '#fee2e2'}; color: ${isCorrect ? '#15803d' : '#b91c1c'};">
                ${isCorrect ? 'CORRECT ✓' : 'INCORRECT ✗'}
              </span>
            </div>
            <div style="font-size: 10.5px; color: #64748b; font-weight: 600;">
              Question ${qNum}
            </div>
          </div>

          <!-- Question Prompt Text -->
          <div class="q-prompt-text">${promptHtml}</div>

          <!-- Side-by-Side Comparison Box -->
          <div class="answer-compare-grid">
            <div class="compare-cell cell-your">
              <div class="cell-label label-your">Your Answer</div>
              <div class="cell-val val-your">${userAns}</div>
            </div>
            <div class="compare-cell cell-correct">
              <div class="cell-label label-correct">Correct Answer</div>
              <div class="cell-val val-correct">${correctAns}</div>
            </div>
          </div>

          <!-- Explanation & Synonyms Callout -->
          <div class="explanation-callout">
            <div class="exp-title-row">
              <span>ℹ</span> Explanation (Click clue in passage)
            </div>
            <div class="exp-body-text">
              ${explanationText}
            </div>

            ${synonymsList.length > 0 ? `
              <div class="synonyms-container">
                <div class="synonyms-title">Synonyms:</div>
                ${synonymsList.map(s => `<div class="synonym-item">• ${s}</div>`).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      `;
    };

    // Pre-render the highlighted passage HTML once for this passage
    const renderedPassageHtml = p.content.map((para: string) => `
      <p class="passage-para">${renderParagraphWithHighlights(para)}</p>
    `).join('');

    // Calculate optimal allocation to eliminate blank space:
    // Page 1: Left column has the highlighted passage.
    // Right column fits 2-3 questions nicely.
    // Remaining questions go onto subsequent pages where BOTH left & right columns are filled.
    // A subsequent page has 2 columns: each column comfortably fits 2 questions (4 questions per full page).
    // Let's determine how many questions on page 1 vs subsequent pages to balance evenly with NO blank gaps or trailing 1-question pages.
    const totalQ = qNums.length;
    let page1Count = 3;
    let remainingQ = totalQ - page1Count;

    // If remaining questions leave an awkward split (like 1 question on a page), adjust page 1 count:
    if (remainingQ <= 4) {
      // e.g. remaining 4 questions fit nicely onto 1 subsequent page (2 on left, 2 on right)
    } else if (remainingQ % 4 === 1 && page1Count < 4) {
      page1Count = 4;
      remainingQ = totalQ - page1Count;
    }

    const page1QNums = qNums.slice(0, page1Count);
    const remainingQNums = qNums.slice(page1Count);

    // Group remaining questions into pages of up to 4 questions (2 left, 2 right)
    // so questions expand nicely and fill the vertical space without overflow or huge blanks!
    const questionsPerFullPage = 4;
    const additionalPages = Math.ceil(remainingQNums.length / questionsPerFullPage);
    const totalPassagePages = remainingQNums.length > 0 ? 1 + additionalPages : 1;

    // Render Page 1 (Passage on Left, Questions on Right)
    htmlContent += `
      <div class="page-landscape">
        <!-- Header -->
        <div class="header-bar">
          <div>
            <div style="font-size: 17px; font-weight: 900; color: #1e3a8a; letter-spacing: -0.5px;">
              ${testTitle} • ${p.title || `PASSAGE ${pIdx + 1}`}
            </div>
            <div style="font-size: 11px; font-weight: 700; color: #64748b; margin-top: 2px;">
              ${p.subtitle || ''} (Page 1 of ${totalPassagePages})
            </div>
          </div>
          <div style="display: flex; gap: 10px; align-items: center;">
            <div style="background: #f1f5f9; padding: 4px 10px; border-radius: 6px; font-size: 10.5px;">
              <span style="color: #64748b; font-weight: 600;">Candidate:</span>
              <strong style="color: #0f172a; margin-left: 4px;">${candidateName.toUpperCase() || 'STUDENT'}</strong>
            </div>
            <div style="background: #eff6ff; padding: 4px 10px; border-radius: 6px; font-size: 10.5px; border: 1px solid #bfdbfe;">
              <span style="color: #2563eb; font-weight: 700;">Score: ${score}/40</span>
              <strong style="color: #1d4ed8; margin-left: 6px;">Band ${bandScore}</strong>
            </div>
            <div style="font-size: 10.5px; color: #94a3b8; font-weight: 600;">
              ${dateStr}
            </div>
          </div>
        </div>

        <!-- 2-Column Grid: Page 1 with Passage on Left & Questions on Right -->
        <div class="two-col-grid">
          <!-- Column 1: Reading Passage with Yellow Highlights -->
          <div class="col-passage">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">
              <span style="font-size: 10.5px; font-weight: 800; text-transform: uppercase; color: #1e3a8a; letter-spacing: 0.5px;">
                Reading Passage Text (Passage ${pIdx + 1})
              </span>
              <span style="font-size: 9px; font-weight: 700; color: #854d0e; background: #fef08a; padding: 2px 6px; border-radius: 4px;">
                ★ Yellow = Key Clues • Green = Answer
              </span>
            </div>
            ${renderedPassageHtml}
          </div>

          <!-- Column 2: Initial Questions -->
          <div class="col-questions">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">
              <span style="font-size: 10.5px; font-weight: 800; text-transform: uppercase; color: #0f172a; letter-spacing: 0.5px;">
                Questions & Explanations (Q${page1QNums[0]} – Q${page1QNums[page1QNums.length - 1]})
              </span>
              <span style="font-size: 9.5px; color: #64748b; font-weight: 600;">
                Page 1 of ${totalPassagePages}
              </span>
            </div>
            ${page1QNums.map(qNum => renderCardHtml(qNum)).join('')}
          </div>
        </div>
      </div>
    `;

    // Render Subsequent Pages (Passage is finished; BOTH left and right columns are filled with questions!)
    for (let addIdx = 0; addIdx < additionalPages; addIdx++) {
      const pageBatch = remainingQNums.slice(addIdx * questionsPerFullPage, (addIdx + 1) * questionsPerFullPage);
      if (pageBatch.length === 0) continue;

      // Distribute evenly between left column and right column:
      // If 4 questions -> 2 left, 2 right
      // If 3 questions -> 2 left, 1 right
      // If 2 questions -> 1 left, 1 right
      const half = Math.ceil(pageBatch.length / 2);
      const leftColQuestions = pageBatch.slice(0, half);
      const rightColQuestions = pageBatch.slice(half);

      const pageNumber = 2 + addIdx;

      htmlContent += `
        <div class="page-landscape">
          <!-- Header -->
          <div class="header-bar">
            <div>
              <div style="font-size: 17px; font-weight: 900; color: #1e3a8a; letter-spacing: -0.5px;">
                ${testTitle} • ${p.title || `PASSAGE ${pIdx + 1}`} (Questions Continued)
              </div>
              <div style="font-size: 11px; font-weight: 700; color: #64748b; margin-top: 2px;">
                ${p.subtitle || ''} (Page ${pageNumber} of ${totalPassagePages})
              </div>
            </div>
            <div style="display: flex; gap: 10px; align-items: center;">
              <div style="background: #f1f5f9; padding: 4px 10px; border-radius: 6px; font-size: 10.5px;">
                <span style="color: #64748b; font-weight: 600;">Candidate:</span>
                <strong style="color: #0f172a; margin-left: 4px;">${candidateName.toUpperCase() || 'STUDENT'}</strong>
              </div>
              <div style="background: #eff6ff; padding: 4px 10px; border-radius: 6px; font-size: 10.5px; border: 1px solid #bfdbfe;">
                <span style="color: #2563eb; font-weight: 700;">Score: ${score}/40</span>
                <strong style="color: #1d4ed8; margin-left: 6px;">Band ${bandScore}</strong>
              </div>
              <div style="font-size: 10.5px; color: #94a3b8; font-weight: 600;">
                ${dateStr}
              </div>
            </div>
          </div>

          <!-- 2-Column Grid: Both columns filled with questions! -->
          <div class="two-col-grid">
            <!-- Left Column: Questions -->
            <div class="col-questions">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">
                <span style="font-size: 10.5px; font-weight: 800; text-transform: uppercase; color: #0f172a; letter-spacing: 0.5px;">
                  Questions & Explanations (Q${leftColQuestions[0]} – Q${leftColQuestions[leftColQuestions.length - 1]})
                </span>
                <span style="font-size: 9.5px; color: #64748b; font-weight: 600;">
                  Page ${pageNumber} • Left Column
                </span>
              </div>
              ${leftColQuestions.map(qNum => renderCardHtml(qNum)).join('')}
            </div>

            <!-- Right Column: Questions -->
            <div class="col-questions">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">
                <span style="font-size: 10.5px; font-weight: 800; text-transform: uppercase; color: #0f172a; letter-spacing: 0.5px;">
                  ${rightColQuestions.length > 0 ? `Questions & Explanations (Q${rightColQuestions[0]} – Q${rightColQuestions[rightColQuestions.length - 1]})` : 'Questions & Explanations'}
                </span>
                <span style="font-size: 9.5px; color: #64748b; font-weight: 600;">
                  Page ${pageNumber} • Right Column
                </span>
              </div>
              ${rightColQuestions.map(qNum => renderCardHtml(qNum)).join('')}
            </div>
          </div>
        </div>
      `;
    }
  });

  container.innerHTML = htmlContent;
  document.body.appendChild(container);

  const cleanName = candidateName ? candidateName.replace(/[^a-zA-Z0-9_-]/g, '_') : 'Candidate';
  const opt: any = {
    margin: [6, 6, 6, 6] as [number, number, number, number],
    filename: `${testTitle.replace(/\s+/g, '_')}_${cleanName}_Explanations.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
    pagebreak: { mode: ['css', 'legacy'] }
  };

  try {
    return { htmlContent, filename: opt.filename, opt, container };
  } finally {
    // Keep container for download action if needed, or remove after processing
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}

export async function downloadExplanationPDF(htmlContent: string, filename: string) {
  const container = document.createElement('div');
  container.className = 'reading-pdf-export-root';
  container.style.width = '1200px';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#1e293b';
  container.innerHTML = htmlContent;
  document.body.appendChild(container);

  const opt: any = {
    margin: [6, 6, 6, 6] as [number, number, number, number],
    filename: filename || 'IELTS_Reading_Explanations.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
    pagebreak: { mode: ['css', 'legacy'] }
  };

  try {
    await html2pdf().set(opt).from(container).save();
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}

