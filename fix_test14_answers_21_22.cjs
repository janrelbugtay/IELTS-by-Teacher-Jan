const fs = require('fs');

let content = fs.readFileSync('src/data/test14ReadingData.ts', 'utf8');

// The answers were already B and E, but let's make sure they are set correctly and update the explanations.
const explanations = `In the first paragraph (Paragraph A), Professor Brian Little explains that "free-traits" are behaviors we selectively choose to use (meaning they aren't used constantly) to go against our biological, natural inclinations.\\n\\n**Highlighted Text (for Option B):** "According to Little, we adopt these free-traits only when we need them..."\\n\\n**Synonyms (for Option B):**\\nnot used by people all the time = only when we need them\\n\\n**Highlighted Text (for Option E):** "...adoption of what he calls 'free-traits', which allow us to behave in a manner which contrasts with our natural selves."\\n\\n**Synonyms (for Option E):**\\nenable people to act = allow us to behave\\nways which are not typical for them = in a manner which contrasts with our natural selves`;

// Find and replace the explanations for 21 and 22
// Because we previously stringified the object, we can just replace the values inside the stringified object
// Or we can parse the JS code inside the file (which might be hard) so let's do a replace on the file text.

const jsAnswers = content.match(/export const test14Answers: Record<number, string> = (\{[\s\S]*?\});/);
const jsExplanations = content.match(/export const test14Explanations: Record<number, string> = (\{[\s\S]*?\});/);

if (jsAnswers && jsExplanations) {
  const answersObj = JSON.parse(jsAnswers[1]);
  const explanationsObj = JSON.parse(jsExplanations[1]);

  answersObj["21"] = "B";
  answersObj["22"] = "E";
  
  explanationsObj["21"] = explanations;
  explanationsObj["22"] = explanations;

  content = content.replace(jsAnswers[1], JSON.stringify(answersObj, null, 2));
  content = content.replace(jsExplanations[1], JSON.stringify(explanationsObj, null, 2));

  fs.writeFileSync('src/data/test14ReadingData.ts', content);
  console.log("Updated answers and explanations for 21 and 22");
} else {
  console.log("Could not find the objects");
}

