const q = { text: "What is the writer doing in the second paragraph?\nA pinpointing some key changes\nB outlining some aspects\nC summarising\nD giving an overview" };
const lines = q.text.split('\n');
let newMain = [];
let extractedOptions = {};
lines.forEach(l => {
   if (/^[A-H][\.\)]?\s+/.test(l.trim())) {
      extractedOptions[l.trim().charAt(0)] = l.trim();
   } else {
      newMain.push(l);
   }
});
console.log("Main:", newMain.join('\n'));
console.log("Options:", extractedOptions);
