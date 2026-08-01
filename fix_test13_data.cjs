const fs = require('fs');

const answers = {
  1: "iv",
  2: "vii",
  3: "iii",
  4: "ii",
  5: "ix",
  6: "F",
  7: "B",
  8: "D",
  9: "A",
  10: "FALSE",
  11: "NOT GIVEN",
  12: "TRUE",
  13: "TRUE",
  14: "FALSE",
  15: "TRUE",
  16: "TRUE",
  17: "NOT GIVEN",
  18: "FALSE",
  19: "populations",
  20: "records",
  21: "fermentation",
  22: "texture",
  23: "resistant",
  24: "chisel",
  25: "meat",
  26: "damage",
  27: "NO",
  28: "YES",
  29: "NOT GIVEN",
  30: "NO",
  31: "NOT GIVEN",
  32: "YES",
  33: "B",
  34: "A",
  35: "C",
  36: "B",
  37: "C",
  38: "E",
  39: "A",
  40: "D"
};

const explanations = {
  1: {
    passageId: 1,
    highlights: ["'fire arrows' (bamboo poles filled with gunpowder) first used in China around 500 BC", "intended to place a Chinese astronaut in space by 2005"],
    text: "The paragraph contrasts the early creation of rockets in ancient China with their modern and upcoming plans for space exploration.\n\nSynonyms: 500 BC / AD 1232 = ancient; 2005 / end of the decade = the future; rockets = invention."
  },
  2: {
    passageId: 1,
    highlights: ["In the last decade, there has been a dramatic growth in space activities in Asia both in the utilization of space-based services and the production of satellites and launchers."],
    text: "The paragraph looks back over recent history (the previous ten years) to describe how space activities have expanded in Asia.\n\nSynonyms: in the last decade = in the past; dramatic growth = development."
  },
  3: {
    passageId: 1,
    highlights: ["New and innovative uses for satellites are constantly being explored", "Space in Asia is very much influenced by the competitive commercial space sector"],
    text: "This section details the new ways satellites are being used and explicitly states that this is driven by the competitive commercial sector.\n\nSynonyms: constantly being explored = compelled by; competitive commercial space sector = competition; new and innovative uses = innovative application."
  },
  4: {
    passageId: 1,
    highlights: ["ASEAN members, unlike Japan, China, and India, do not have their own remote sensing satellites, however, most of its member nations have facilities to receive, process, and interpret"],
    text: "The paragraph shows a disparity (imbalance) between Asian nations; some have complete satellite systems, while others only have processing facilities.\n\nSynonyms: unlike / do not have their own = unbalanced development; remote sensing = essential space technology."
  },
  5: {
    passageId: 1,
    highlights: ["The emergence of 'small satellites'", "as a way to develop low-cost satellite technology", "may very well result in a highly competitive Asian satellite manufacturing industry."],
    text: "The use of cheaper, smaller satellites is allowing Asian countries to manufacture competitively. (Note: \"terrain\" in the prompt's options is a common typo for \"small\" or \"mini\" in this specific IELTS test version).\n\nSynonyms: highly competitive = competitive edge; drastically reduce costs / low-cost = economic; small satellites = economic satellite."
  },
  6: {
    passageId: 1,
    highlights: ["Asia and Southeast Asia, in particular, suffers from a long list of recurrent large-scale environmental problems including storms and flooding, forest fires"],
    text: "Remote sensing is highly valued in this region specifically to monitor and manage these recurring natural disasters.\n\nSynonyms: forest fires = bush fires; environmental problems = disasters."
  },
  7: {
    passageId: 1,
    highlights: ["such as in the field of health and telemedicine, distance education"],
    text: "The use of the prefixes \"tele-\" (at a distance) and \"distance\" implies that the services are reaching people in remote or hard-to-reach locations.\n\nSynonyms: distance / tele- = unapproachable / remote areas; health = medicine area."
  },
  8: {
    passageId: 1,
    highlights: ["In the development of this technology, many non-technical factors, such as economics, politics, culture, and history, interact and play important roles"],
    text: "The text states that non-technical (social) aspects heavily dictate how space technology develops in these regions.\n\nSynonyms: non-technical factors (economics, politics, culture) = social factors; play important roles = influenced."
  },
  9: {
    passageId: 1,
    highlights: ["food and agricultural planning and production (rice crop monitoring)."],
    text: "Satellites are used to plan, produce, and monitor rice yields.\n\nSynonyms: planning and production / monitoring = administrate; rice crop = the crops."
  },
  10: {
    passageId: 1,
    highlights: ["first used in China around 500 BC, and, during the Sung Dynasty, to repel Mongol invaders at the battle of Kaifeng (Kai-fung fu) in AD 1232."],
    text: "The text says 500 BC (which is over 2,500 years ago) and AD 1232 (which is about 800 years ago). The math in the statement is incorrect.\n\nSynonyms: repel Mongol invaders = military purpose."
  },
  11: {
    passageId: 1,
    highlights: [],
    text: "While paragraph C mentions \"distance education,\" the text does not provide any information or confirmation on whether this has actually improved literacy rates in Asia."
  },
  12: {
    passageId: 1,
    highlights: ["Remote sensing satellites equipped with instruments to take photographs of the ground", "provide essential information for", "disaster prevention and monitoring"],
    text: "The sentence explicitly states that satellite photography aids in preventing and keeping an eye on natural disasters.\n\nSynonyms: natural catastrophes = disaster; surveillance = monitoring."
  },
  13: {
    passageId: 1,
    highlights: ["Space in Asia is very much influenced by the competitive commercial space sector", "use of readily available commercial technology", "result in a highly competitive Asian satellite manufacturing industry."],
    text: "The commercial space sector is actively driving and shortening the learning curve for Asian technology.\n\nSynonyms: influenced / shorten learning curve = boosting factor; commercial space sector = commercial competition."
  },
  14: {
    passageId: 2,
    highlights: ["The 19th-century scientist Charles Darwin thought that cooking, after language, was the greatest discovery made by man."],
    text: "Darwin considered language to be the first greatest discovery, making cooking the second, not the most significant.\n\nSynonyms: greatest discovery = most significant development."
  },
  15: {
    passageId: 2,
    highlights: ["Cooking can turn plants that are inedible into edible food by destroying toxic chemicals"],
    text: "Cooking breaks down the defense mechanisms (toxins) that plants create.\n\nSynonyms: gets rid of = destroying; plant poisons = toxic chemicals."
  },
  16: {
    passageId: 2,
    highlights: ["the ratio of energy gained to energy expended by the body is greater when food is cooked."],
    text: "The body uses less energy trying to chew and break down cooked food compared to raw food.\n\nSynonyms: more energy efficient = ratio of energy gained to energy expended is greater."
  },
  17: {
    passageId: 2,
    highlights: [],
    text: "The text mentions that frozen fish was shipped from Australia to England, and later introduces Clarence Birdseye as an American. It never connects Birdseye to the Australian food industry."
  },
  18: {
    passageId: 2,
    highlights: ["While on a fishing trip with the Inuit in the Canadian Arctic, Birdseye observed that rapid freezing creates smaller ice crystals", "a discovery he had not expected."],
    text: "He did not already believe it; the text explicitly states it was an unexpected discovery.\n\nSynonyms: confirmed what he already believed (False) = a discovery he had not expected."
  },
  19: {
    passageId: 2,
    highlights: ["People began to create a variety of new tools to aid survival, and in turn, populations increased in size."],
    text: "Synonyms: larger = increased in size; equipment = tools."
  },
  20: {
    passageId: 2,
    highlights: ["writing became more sophisticated and allowed people to maintain records of the harvest and taxes."],
    text: "Synonyms: keep = maintain."
  },
  21: {
    passageId: 2,
    highlights: ["adding acid by fermentation, or adding salt."],
    text: ""
  },
  22: {
    passageId: 2,
    highlights: ["the flavor and texture were similar to freshly cooked products."],
    text: "Synonyms: taste = flavor; same = similar to."
  },
  23: {
    passageId: 2,
    highlights: ["Until this point, containers had been too heavy", "but Durand produced the first ones which were lightweight and resistant to damage."],
    text: ""
  },
  24: {
    passageId: 2,
    highlights: ["Until then, cans were opened with a chisel and hammer."],
    text: "Synonyms: replaced = until then."
  },
  25: {
    passageId: 2,
    highlights: ["one can containing meat, dating back to 1824, was opened in 1939, and the contents were still in good condition."],
    text: "Synonyms: still edible = in good condition; more than 100 years = 1824 to 1939 (115 years)."
  },
  26: {
    passageId: 2,
    highlights: ["Birdseye observed that rapid freezing creates smaller ice crystals and therefore causes less damage to food"],
    text: "Synonyms: prevents the formation of = creates smaller."
  },
  27: {
    passageId: 3,
    highlights: ["so it is inevitable that jellyfish are often considered ugly and possibly dangerous."],
    text: "The author states that because people mostly encounter them dead on a beach or getting stung, it is entirely expected (inevitable), not surprising.\n\nSynonyms: inevitable = not surprising; considered ugly and possibly dangerous = negative views."
  },
  28: {
    passageId: 3,
    highlights: ["As a result, disappointingly little research was carried out into jellyfish, as marine biologists took the easy option"],
    text: "By using the judgmental words \"disappointingly\" and \"took the easy option,\" the writer clearly expresses the view that scientists failed to do enough research.\n\nSynonyms: disappointingly little research = should have conducted more studies."
  },
  29: {
    passageId: 3,
    highlights: [],
    text: "The passage states that jellyfish inhabit both shallow and deep water (\"these creatures inhabit every type of marine habitat, including deep water\"), but it does not mention anything about them moving from one depth to another."
  },
  30: {
    passageId: 3,
    highlights: ["This proposition has subsequently been conclusively proven by independent studies."],
    text: "Her views do not need to be confirmed because they have already been \"conclusively proven.\"\n\nSynonyms: conclusively proven = do not need to be confirmed."
  },
  31: {
    passageId: 3,
    highlights: [],
    text: "The text discusses the link between climate change and massive growths in jellyfish populations, but mentions nothing regarding whether climate change can be reversed."
  },
  32: {
    passageId: 3,
    highlights: ["observations made by Paul Dewar and his team showed that this was incorrect. As a result, the scientific community now recognizes that species", "prey on jellyfish."],
    text: "The \"scientific community now recognizes\" his findings, indicating broad acceptance among his peers.\n\nSynonyms: other academics = the scientific community; accepted = recognizes."
  },
  33: {
    passageId: 3,
    highlights: ["It is still widely assumed that jellyfish are among the simplest lifeforms", "While this is true, we now know", "What is more", "far from 'floating'", "scientific progress in recent years has shown that many of our established beliefs about jellyfish were inaccurate."],
    text: "The writer lists common beliefs (they have no senses, they don't sleep, they just float) and presents new evidence to disprove all of them."
  },
  34: {
    passageId: 3,
    highlights: ["Jellyfish, though, are not harmless. Their sting can cause a serious allergic reaction", "damage tourist businesses", "On the other hand, jellyfish are a source of medical collagen"],
    text: "The paragraph contrasts the physical and economic harm they cause (disadvantages) with their medical and scientific benefits (advantages)."
  },
  35: {
    passageId: 3,
    highlights: ["Jellyfish has existed more or less unchanged for at least 500 million years", "destroyed 99% of all life, but jellyfish lived through all three."],
    text: "The core focus of this section is the incredible endurance and adaptability of jellyfish through major extinction events and changing ocean acidity."
  },
  36: {
    passageId: 3,
    highlights: ["Studies of jellyfish in class known as scyphozoa have shown a life cycle of three distinct phases", "This is further evidence of just how sophisticated and unusual these lifeforms are."],
    text: "The complex life cycle of scyphozoa is used as an example to prove the overarching point that jellyfish are sophisticated biological organisms."
  },
  37: {
    passageId: 3,
    highlights: ["scientists have discovered that sound bounces harmlessly off jellyfish, so in the Arctic and Norway researchers are using sonar to monitor jellyfish"],
    text: "Synonyms: do not injure = harmlessly; observed and tracked = monitor."
  },
  38: {
    passageId: 3,
    highlights: ["DNA sequencing and isotope analysis have provided further insights, including the identification of numerous additional species of jellyfish unknown to science"],
    text: "Synonyms: more types = additional species; previously realized = unknown to science."
  },
  39: {
    passageId: 3,
    highlights: ["analysis of so-called 'upside-down jellyfish' shows that they shut down their bodies and rest in much the same way that humans do at night, something once widely believed to be impossible"],
    text: "Synonyms: do not sleep = impossible to rest; wrong to assume = widely believed to be impossible."
  },
  40: {
    passageId: 3,
    highlights: ["Research in the Mediterranean Sea has now shown", "certain jellyfish are able to revert to an earlier physical state, leading to the assertion that they are immortal."],
    text: "Synonyms: live forever = immortal; one particular type = certain jellyfish; claimed = assertion."
  }
};

let content = fs.readFileSync('src/data/test13ReadingData.ts', 'utf8');

const answersStr = "export const test13Answers: Record<number, string> = " + JSON.stringify(answers, null, 2) + ";";
const explanationsStr = "export const test13Explanations: Record<number, any> = " + JSON.stringify(explanations, null, 2) + ";";

content = content.replace(/export const test13Answers: Record<number, string> = \{[^}]*\};/, answersStr);
content = content.replace(/export const test13Explanations: Record<number, string> = \{\};/, explanationsStr);

fs.writeFileSync('src/data/test13ReadingData.ts', content);
