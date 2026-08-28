const fs = require('fs');
let content = fs.readFileSync('src/data/test17ReadingData.ts', 'utf8');

const answersInsert = `export const test17Answers: Record<number, any> = {
  1: "YES",
  2: "NO",
  3: "NO",
  4: "YES",
  5: "construction of roads",
  6: "cycle trailers",
  7: "bus service",
  8: "aerial ropeway",
  9: "shops/libraries",
  10: "cushions",
  11: "family member",
  12: "joining mechanism",
  13: "cover",`;

content = content.replace(/export const test17Answers:\s*Record<number, any>\s*=\s*\{/, answersInsert);

const explanationsInsert = `export const test17Explanations: Record<number, any> = {
  1: {
    passageId: 1,
    highlights: ["the development of all weathered roads", "are very costly for a country with a small and stagnant economy"],
    explanation: "The passage notes that building weather-resistant roads is too expensive for poor economies.",
    detailedExplanation: "Synonyms: slow-developing economy = small and stagnant economy; regardless of weather = all weathered; can not afford = very costly"
  },
  2: {
    passageId: 1,
    highlights: ["lack of adequate technical knowledge", "have led to under-development of this alternative transport sub-sector"],
    explanation: "The passage explicitly states that there is a lack of technical knowledge, contradicting the idea that officials know how to improve it.",
    detailedExplanation: "Synonyms: know how to improve = lack of adequate technical knowledge (contradicts)"
  },
  3: {
    passageId: 1,
    highlights: ["The aim is to use methods that encourage community-driven development."],
    explanation: "The primary aim is broad community-driven development, not strictly increasing trade between villages.",
    detailedExplanation: "Synonyms: primary aim = The aim is. 'Increase trade' is a narrower aspect of the broader 'access to markets, health care, education'."
  },
  4: {
    passageId: 1,
    highlights: ["Practical Action is also an active member of many national and regional networks", "one conspicuous example is the Lanka Organic Agriculture Movement"],
    explanation: "Practical Action actively participates in networks like the Lanka Organic Agriculture Movement.",
    detailedExplanation: "Synonyms: highly involved in = active member of"
  },
  5: {
    passageId: 1,
    highlights: ["the construction of roads is a major priority for many rural communities."],
    explanation: "Building roads is the primary need to overcome extreme restrictions in rural areas.",
    detailedExplanation: "Synonyms: first duty = major priority; unrestricted development = (antonym) extremely restricted"
  },
  6: {
    passageId: 1,
    highlights: ["Cycle trailers have practical business use too, helping people carry their goods, such as vegetables and charcoal"],
    explanation: "Cycle trailers were introduced specifically to help transport goods like vegetables and charcoal.",
    detailedExplanation: "Synonyms: carry their goods = carry their goods"
  },
  7: {
    passageId: 1,
    highlights: ["Sri Lanka communities have been able to start a bus service", "This service has put an end to rural people’s social isolation."],
    explanation: "Establishing a bus service ended the isolation of rural people in Sri Lanka.",
    detailedExplanation: "Synonyms: put an end to = put an end to"
  },
  8: {
    passageId: 1,
    highlights: ["Practical Action has developed an ingenious solution called an aerial ropeway."],
    explanation: "This clever system was built to move food safely down steep hills.",
    detailedExplanation: "Synonyms: solution = solution; applied = developed"
  },
  9: {
    passageId: 1,
    highlights: ["as ambulances, as mobile shops, and even as mobile libraries."],
    explanation: "Trailers are adapted into mobile versions of these services.",
    detailedExplanation: "Synonyms: moveable = mobile"
  },
  10: {
    passageId: 1,
    highlights: ["The “bed” section can be padded with cushions to make the patient comfortable"],
    explanation: "These are added to the metal bed section to ensure patient comfort.",
    detailedExplanation: "Synonyms: put with = padded with"
  },
  11: {
    passageId: 1,
    highlights: ["while the “seat” section allows a family member to attend to the patient"],
    explanation: "The design includes a seat so a relative can travel with and care for the patient.",
    detailedExplanation: "Synonyms: caring for = attend to"
  },
  12: {
    passageId: 1,
    highlights: ["A joining mechanism allows for easy removal and attachment."],
    explanation: "This specific part is created to allow equipment to be easily connected or taken apart.",
    detailedExplanation: "Synonyms: dismantle or attach = removal and attachment"
  },
  13: {
    passageId: 1,
    highlights: ["In response to user comments, a cover has been designed that can be added to give protection"],
    explanation: "Feedback led to the addition of this item to shield the patient from bad weather.",
    detailedExplanation: "Synonyms: users suggest = user comments"
  },`;

content = content.replace(/export const test17Explanations:\s*Record<number, any>\s*=\s*\{/, explanationsInsert);

fs.writeFileSync('src/data/test17ReadingData.ts', content);
console.log('patched answers and explanations');
