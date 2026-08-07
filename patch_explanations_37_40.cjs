const fs = require('fs');

let fileContent = fs.readFileSync('src/data/test16ReadingData.ts', 'utf8');

const replacement = `"37": {
    "passageId": 3,
    "highlights": [
      "Austin and Co. are in no doubt that because languages are unique, even if they do tend to have common underlying features..."
    ],
    "explanation": "Peter Austin believes that although languages share underlying features, they are unique. This matches ending C.\\n\\n**Synonyms:**\\n• common underlying features = share certain universal characteristics"
  },
  "38": {
    "passageId": 3,
    "highlights": [
      "a community who speak an endangered language may have reasons to doubt or even oppose efforts to preserve it."
    ],
    "explanation": "Nick Evans states that communities with endangered languages might still oppose preservation efforts. This matches ending A.\\n\\n**Synonyms:**\\n• oppose efforts to preserve it = resist attempts to save its language\\n• endangered language = in danger of disappearing"
  },
  "39": {
    "passageId": 3,
    "highlights": [
      "Plenty of students continue to be drawn to the intellectual thrill of linguistics fieldwork...",
      "The highest barrier, they agree, is that the linguistics profession's emphasis on theory gradually wears down the enthusiasm..."
    ],
    "explanation": "Young researchers (students) want to do fieldwork despite the profession's heavy emphasis on theory. This matches ending F.\\n\\n**Synonyms:**\\n• students = young researchers\\n• emphasis on theory = prevalence of theoretical linguistics"
  },
  "40": {
    "passageId": 3,
    "highlights": [
      "Chomsky, they note, does not despise descriptive linguistics—he believes that good descriptive work requires thorough theoretical understanding..."
    ],
    "explanation": "Chomsky supports descriptive linguistics as long as it has a strong theoretical basis. This matches ending B.\\n\\n**Synonyms:**\\n• requires thorough theoretical understanding = provided that it has a strong basis in theory"
  }
};`;

// Note: I will replace from "37": { to the end of the explanations object.
const regex = /"37":\s*\{[\s\S]*?\};\n/;

if (regex.test(fileContent)) {
  fileContent = fileContent.replace(regex, replacement + "\n");
  fs.writeFileSync('src/data/test16ReadingData.ts', fileContent);
  console.log("Updated 37-40 in test16ReadingData.ts");
} else {
  console.log("Regex not found in test16ReadingData.ts");
}

