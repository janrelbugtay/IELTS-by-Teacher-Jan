const answers = { 38: '' };
const LISTENING_ANSWER_KEY = { 38: 'BEHAVIOUR / BEHAVIOR' };
const checkAnswer = (qNum) => {
    let userAns = (answers[qNum] || '').toString().trim().toUpperCase();
    const correctAns = LISTENING_ANSWER_KEY[qNum];
    if (!correctAns) return false;
    
    if (userAns === 'T') userAns = 'TRUE';
    if (userAns === 'F') userAns = 'FALSE';
    if (userAns === 'NG' || userAns === 'N') userAns = 'NOT GIVEN';
    if (userAns === 'Y') userAns = 'YES';
    if (userAns === 'N' && String(correctAns).includes('NO')) userAns = 'NO';
    
    const correctAnswers = String(correctAns).toUpperCase().split(/\s*OR\s*|\s*\/\s*/);
    for (let ans of correctAnswers) {
      ans = ans.trim();
      console.log('check', { userAns, ans });
      if (userAns === ans) { console.log('match 1'); return true; }
      if (userAns.startsWith(ans + " ") || userAns.startsWith(ans + ".")) { console.log('match 2'); return true; }
      const cleanUser = userAns.replace(/[^A-Z0-9]/g, '');
      const cleanAns = ans.replace(/[^A-Z0-9]/g, '');
      if (cleanUser === cleanAns && cleanAns.length > 0) { console.log('match 3'); return true; }
    }
    return false;
};
checkAnswer(38);
