const fs = require('fs');
let data = fs.readFileSync('src/data/septemberReadingData.ts', 'utf8');

data = data.replace(
  /instruction: "Complete the summary using the list of words, A–I, below.\\n\\n\*\*The television series is based on Ekman's work\*\*\\nA new TV series based on Ekman's work features a hero named Lightman, who detects lies. Initially, Ekman was unenthusiastic about the TV project because he feared the possibility of encouraging viewers' \{19\}. For example, he was worried that one day the program could result in \{20\} not being carried out. Ultimately though, he has given the show his blessing because he is not aware of any other comparable program based on a single person's \{21\}. The \{22\} of the show's producer has been another pleasant surprise and, considering the genre of the program, Ekman is happy with the show's overall \{23\}.",/,
  'instruction: "Complete the summary using the list of words, A–I, below.",\n        text: "**The television series is based on Ekman\'s work**\\n\\nA new TV series based on Ekman\'s work features a hero named Lightman, who detects lies. Initially, Ekman was unenthusiastic about the TV project because he feared the possibility of encouraging viewers\' {19}. For example, he was worried that one day the program could result in {20} not being carried out. Ultimately though, he has given the show his blessing because he is not aware of any other comparable program based on a single person\'s {21}. The {22} of the show\'s producer has been another pleasant surprise and, considering the genre of the program, Ekman is happy with the show\'s overall {23}.",\n'
);

fs.writeFileSync('src/data/septemberReadingData.ts', data);
