const q = { options: ["A", "B", "C", "D"], text: "Question 27\nA some text\nB other text\nC third text\nD fourth text" };
const lines = q.text ? q.text.split('\n') : [];
let extractedOptions = {};
lines.forEach(l => {
  if (/^[A-H][\.\)]?\s+/.test(l.trim())) {
    extractedOptions[l.trim().charAt(0)] = l.trim();
  }
});
console.log(extractedOptions);
