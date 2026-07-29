const fs = require('fs');
let code = fs.readFileSync('src/data/decemberReadingData.ts', 'utf8');

const newExplanations = `  "27": {
    passageId: 3,
    highlights: ["What seemed simple enough to start with triggered an almost obsessive, decade-long journey..."],
    explanation: "What started as a simple idea became an intense, decade-long process."
  },
  "28": {
    passageId: 3,
    highlights: ["...marked by a series of obstacles that would have deterred anyone less determined."],
    explanation: "The journey was filled with many barriers that required great determination to pass."
  },
  "29": {
    passageId: 3,
    highlights: ["...obtaining such a globe was not simply a matter of a quick online order..."],
    explanation: "Buying a globe online quickly was not an option for the quality he wanted."
  },
  "30": {
    passageId: 3,
    highlights: ["Bellerby came across shoddy commercial versions..."],
    explanation: "The products he found available commercially were of poor quality."
  },
  "31": {
    passageId: 3,
    highlights: ["...designed for school classrooms..."],
    explanation: "These lower-quality globes were primarily meant for teaching environments."
  },
  "32": {
    passageId: 3,
    highlights: ["...trips to Morocco and India, where surely the knowledge of artisan cartographers had been preserved..."],
    explanation: "He traveled hoping to find traditional cartographers who still retained the abilities to make globes."
  },
  "33": {
    passageId: 3,
    highlights: ["...contrary to stubbornly held popular views of our ancestors' geographical ignorance, we have known that the world is spherical since at least the 6th century BCE."],
    explanation: "The text points out that the popular belief that our ancestors were ignorant about geography is incorrect. We have known the world is spherical for a very long time."
  },
  "34": {
    passageId: 3,
    highlights: [],
    explanation: "The passage states Plato likened the world to a leather ball, but there is no mention of him facing criticism for this comparison."
  },
  "35": {
    passageId: 3,
    highlights: [],
    explanation: "While Crates of Mallus is credited with making the first recorded globe, there is no discussion regarding how scientifically accurate his representation was."
  },
  "36": {
    passageId: 3,
    highlights: ["Surely, Bellerby reasoned, a good-quality globe wouldn't be difficult to find."],
    explanation: "Bellerby initially thought that because humans have known the Earth's shape for so long, finding a quality globe would be easy."
  },
  "37": {
    passageId: 3,
    highlights: ["Right at the end of the process, he learnt that the paper had stretched slightly and so the final one overlapped the first..."],
    explanation: "After all the painstaking work of gluing the paper sections, he discovered an unforeseen problem: the paper stretched."
  },
  "38": {
    passageId: 3,
    highlights: ["...Bellerby clearly found a kindred spirit in Martin Behaim... Something of Bellerby's unflinching ambition is reflected in the even more heroic efforts of the Italian cartographer Vincenzo Coronelli..."],
    explanation: "The reviewer brings up historical globemakers to show that Bellerby shares their ambitious and obsessive traits."
  },
  "39": {
    passageId: 3,
    highlights: ["...Bellerby's book is also a lament for the fading away of centuries-old traditions."],
    explanation: "The passage notes that the book acts as an expression of sorrow (lament) over traditional skills disappearing as craftsmen retire or die."
  },
  "40": {
    passageId: 3,
    highlights: ["His book... is hardly a blueprint for commercial success."],
    explanation: "The reviewer notes that while the book is beautiful and inspiring, it is not a manual on how to achieve financial or business success."
  }
};`

code = code.replace(/  "26": \{[\s\S]*?\}[\s]*\};/, '  "26": {\n    passageId: 2,\n    highlights: ["an unanticipated finding has been that children from slum backgrounds do not seem to lag behind children from other urban poor backgrounds – and in some cases outperform them (e.g. in numeracy and literacy tasks)."],\n    explanation: "The \'unanticipated\' (surprising) finding is that literacy and numeracy skills of slum children are not lower than (do not lag behind) those of other urban poor backgrounds (D)."\n  },\n' + newExplanations);

fs.writeFileSync('src/data/decemberReadingData.ts', code);
