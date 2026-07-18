const answers = { 38: 'BEHAVIOR' };
const LISTENING_ANSWER_KEY = { 38: 'BEHAVIOUR / BEHAVIOR' };
const checkAnswer = (qNum) => {
    let userAns = (answers[qNum] || '').toString().trim().toUpperCase();
    const correctAns = LISTENING_ANSWER_KEY[qNum];
    if (!correctAns) return false;
    const correctAnswers = String(correctAns).toUpperCase().split(/\s*\bOR\b\s*|\s*\/\s*/);
    for (let ans of correctAnswers) {
      ans = ans.trim();
      if (userAns === ans) return true;
      if (userAns.startsWith(ans + " ") || userAns.startsWith(ans + ".")) return true;
      const cleanUser = userAns.replace(/[^A-Z0-9]/g, '');
      const cleanAns = ans.replace(/[^A-Z0-9]/g, '');
      if (cleanUser === cleanAns && cleanAns.length > 0) return true;
    }
    return false;
};
console.log('BEHAVIOR', checkAnswer(38));

