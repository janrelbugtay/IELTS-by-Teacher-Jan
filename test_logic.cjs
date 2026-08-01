const instruction = `The reading passage has seven paragraphs, A-G. Choose the correct heading for paragraphs A-G from the list below. Write the correct number, i-ix, in boxes 1-5 on your answer sheet.

i. Western countries provide essential assistance
ii. Unbalanced development for an essential space technology
iii. Innovative application compelled by competition
iv. An ancient invention which is related to the future
v. Military purpose of the satellite
vi. Rockets for application in ancient China
vii. Space development in Asia in the past
viii. Non-technology factors count
ix. competitive edge gained by more economic terrain satellite

Paragraph D Example: Current space technology development in Asia`;

const lines = instruction.split('\n');
const normalLines = [];
const optionLines = [];

lines.forEach((line) => {
  if (/^(?:[A-K][.)]?\s+|(?:i{1,3}|iv|v|vi{1,3}|ix|x)[.)]\s+)/i.test(line.trim())) {
    optionLines.push(line);
  } else {
    if (optionLines.length === 0) {
      normalLines.push(line);
    } else {
      optionLines.push(line); 
    }
  }
});

console.log('normalLines:', normalLines);
console.log('optionLines:', optionLines);
