const fs = require('fs');

const code = `
export const decemberExplanations: Record<string, any> = {
  "1": {
    passageId: 1,
    highlights: ["In east Africa the plant arrived with Belgian colonists in Rwanda, who liked the look of its glossy leaves and delicate purple flowers floating in their ponds."],
    explanation: "The text confirms that Belgian colonists brought the plant to Rwanda because they found it attractive for their ponds.\n\nSynonym example: decorative = liked the look of"
  },
  "2": {
    passageId: 1,
    highlights: ["But by the 1980s, it had 'escaped' out of the country via the Kagera river and made its way downstream to Lake Victoria."],
    explanation: "The plant reached Lake Victoria naturally via a river, not by being carried there by fishermen.\n\nSynonym example: took = escaped via the river (contradicts)"
  },
  "3": {
    passageId: 1,
    highlights: ["...the boats that once brought the fish to shore by the hundreds struggle to navigate through the mass of plants."],
    explanation: "The dense spread of the plant is causing major difficulties for fishing boats trying to reach the shore.\n\nSynonym example: difficult to force boats through = struggle to navigate"
  },
  "4": {
    passageId: 1,
    highlights: [],
    explanation: "The passage mentions the plant blocking routes and harboring mosquitoes, but it never mentions the plant producing chemicals that affect fish populations."
  },
  "5": {
    passageId: 1,
    highlights: [],
    explanation: "The passage states that relying on solid fuels like wood and charcoal causes indoor pollution, but it does not compare the two to say which one is worse for health."
  },
  "6": {
    passageId: 1,
    highlights: ["...huge piles of water hyacinth that villagers had taken out of the water in an attempt to clear it were a common sight."],
    explanation: "Villagers successfully removed large amounts of the plant, meaning it was not impossible to remove it.\n\nSynonym example: impossible to remove much = had taken out huge piles (contradicts)"
  },
  "7": {
    passageId: 1,
    highlights: ["...researchers' imaginations since as early as the 1980s when, across the world, they began to explore its potential as a biofuel."],
    explanation: "Research into the plant's potential for fuel began in the 1980s, which falls in the last century.\n\nSynonym example: the last century = the 1980s"
  },
  "8": {
    passageId: 1,
    highlights: ["...transform a mix of water hyacinth and cow dung into biogas for cooking."],
    explanation: "The machines transform a specific mixture into biogas.\n\nSynonym example: together with = a mix of"
  },
  "9": {
    passageId: 1,
    highlights: ["...over the next 20 to 30 days, it goes through a fermentation process and breaks down..."],
    explanation: "The mixture undergoes this specific biological process over 20 to 30 days to produce gas.\n\nSynonym example: is completed = goes through... and breaks down"
  },
  "10": {
    passageId: 1,
    highlights: ["From there, the clean-burning gas is passed through pipes to the point of use..."],
    explanation: "The produced gas needs a delivery method to reach households.\n\nSynonym example: transport = passed through"
  },
  "11": {
    passageId: 1,
    highlights: ["Besides, they don't have to devote a lot of time every day to gathering firewood..."],
    explanation: "Women no longer have to dedicate hours to collecting firewood.\n\nSynonym example: spend so much = devote a lot of"
  },
  "12": {
    passageId: 1,
    highlights: ["As a result, they're able to make more money for their families from other enterprises."],
    explanation: "Because they save time on fuel collection, they can engage in other activities that generate income.\n\nSynonym example: bring in = make"
  },
  "13": {
    passageId: 1,
    highlights: ["But unless the price of the machines drops, it's pretty clear that most communities will never be able to afford any..."],
    explanation: "The main disadvantage is the cost of the biogas machines, making them unaffordable for many.\n\nSynonym example: beyond the reach of = never be able to afford"
  },
  "14": {
    passageId: 2,
    highlights: ["The crowded and bustling streets of Delhi teem with life."],
    explanation: "Delhi's streets are filled with many people.\n\nSynonym example: dense population = crowded and bustling... teem with life"
  },
  "15": {
    passageId: 2,
    highlights: ["...many millions more have recently made India's capital their home..."],
    explanation: "Many people have recently moved to the city, distinguishing them from those born there.\n\nSynonym example: new immigrants = recently made... their home"
  },
  "16": {
    passageId: 2,
    highlights: ["...having moved from surrounding neighbourhoods, cities and states..."],
    explanation: "Some people migrated from local surrounding areas.\n\nSynonym example: nearby district = surrounding neighbourhoods"
  },
  "17": {
    passageId: 2,
    highlights: ["...often in the hope of gaining better jobs and a better life."],
    explanation: "A primary reason for this migration is the search for improved work prospects.\n\nSynonym example: employment opportunities = better jobs"
  },
  "18": {
    passageId: 2,
    highlights: ["The overriding aim of the four-year project..."],
    explanation: "The main goal of the Cambridge University study is described.\n\nSynonym example: primary objective = overriding aim"
  },
  "19": {
    passageId: 2,
    highlights: ["...the many benefits of speaking more than one language, observed in schools in Europe for instance, do not apply to many of India's schoolchildren."],
    explanation: "The project looks into why Indian children don't get the same benefits from multilingualism as European children do.\n\nSynonym example: similar advantages = many benefits"
  },
  "20": {
    passageId: 2,
    highlights: ["...over 50% of children in Standard 5 [ten-year-olds] cannot read a Standard 2 [seven-year-olds] task fluently, and just under 50% of them cannot solve a Standard 2 subtraction task..."],
    explanation: "The text states over 50% cannot read fluently, while just under 50% cannot solve a subtraction task. This means they perform slightly better in numeracy than in literacy.\n\nSynonym example: perform better = fewer fail (contradicts)"
  },
  "21": {
    passageId: 2,
    highlights: [],
    explanation: "The text mentions that low achievement leads to dropouts, which disproportionately affect females, but it does not mention Tsimpli having any issues convincing female students to participate."
  },
  "22": {
    passageId: 2,
    highlights: ["Tsimpli and her colleagues are investigating whether these low learning outcomes could be caused by an Indian school system where the language that children are taught in often differs from the language used at home."],
    explanation: "The research team is directly exploring the link between low academic achievement and the difference between school instruction language and home language.\n\nSynonym example: poor academic performance = low learning outcomes"
  },
  "23": {
    passageId: 2,
    highlights: ["They intend to look not only at test results, but also at variables such as the standard of schooling, the environment and the teaching practices themselves."],
    explanation: "The researchers actively plan to look at teaching practices as part of their study.\n\nSynonym example: decided against investigating = intend to look at (contradicts)"
  },
  "24": {
    passageId: 2,
    highlights: ["...the medium of instruction used in schools, especially English, may hold back those children who have little familiarity with, or exposure to, the language before starting school..."],
    explanation: "The writer highlights that teaching in English might restrict the progress of poor children who have no background in the language.\n\nSynonym example: disadvantaged further = hold back"
  },
  "25": {
    passageId: 2,
    highlights: ["We are not suggesting that English be withdrawn - that ship has sailed..."],
    explanation: "The idiom 'that ship has sailed' means an opportunity has passed or a situation is too far gone to reverse. Here, it implies English is permanently part of the system.\n\nSynonym example: too late to remove = that ship has sailed"
  },
  "26": {
    passageId: 2,
    highlights: ["...an unanticipated finding has been that children from slum backgrounds do not seem to lag behind children from other urban poor backgrounds..."],
    explanation: "The researchers found an unexpected result where children living in slums performed just as well, if not better, than other urban poor children.\n\nSynonym example: not lower than = do not seem to lag behind"
  },
  "27": {
    passageId: 3,
    highlights: ["What seemed simple enough to start with triggered an almost obsessive, decade-long journey..."],
    explanation: "What started as a simple idea became an intense, decade-long process.\n\nSynonym example: challenging task = obsessive, decade-long journey"
  },
  "28": {
    passageId: 3,
    highlights: ["...marked by a series of obstacles that would have deterred anyone less determined."],
    explanation: "The journey was filled with many barriers that required great determination to pass.\n\nSynonym example: numerous problems = a series of obstacles"
  },
  "29": {
    passageId: 3,
    highlights: ["...obtaining such a globe was not simply a matter of a quick online order..."],
    explanation: "Buying a globe online quickly was not an option for the quality he wanted.\n\nSynonym example: internet purchase = online order"
  },
  "30": {
    passageId: 3,
    highlights: ["Bellerby came across shoddy commercial versions..."],
    explanation: "The products he found available commercially were of poor quality.\n\nSynonym example: inferior makes = shoddy commercial versions"
  },
  "31": {
    passageId: 3,
    highlights: ["...designed for school classrooms..."],
    explanation: "These lower-quality globes were primarily meant for teaching environments.\n\nSynonym example: educational use = school classrooms"
  },
  "32": {
    passageId: 3,
    highlights: ["...trips to Morocco and India, where surely the knowledge of artisan cartographers had been preserved..."],
    explanation: "He traveled hoping to find traditional cartographers who still retained the abilities to make globes.\n\nSynonym example: necessary skills = knowledge of artisan cartographers"
  },
  "33": {
    passageId: 3,
    highlights: ["...contrary to stubbornly held popular views of our ancestors' geographical ignorance, we have known that the world is spherical since at least the 6th century BCE."],
    explanation: "The text points out that the popular belief that our ancestors were ignorant about geography is incorrect. We have known the world is spherical for a very long time.\n\nSynonym example: is correct = contrary to (contradicts)"
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
    explanation: "Bellerby initially thought that because humans have known the Earth's shape for so long, finding a quality globe would be easy.\n\nSynonym example: assumed he would have few problems = reasoned... wouldn't be difficult to find"
  },
  "37": {
    passageId: 3,
    highlights: ["Right at the end of the process, he learnt that the paper had stretched slightly and so the final one overlapped the first..."],
    explanation: "After all the painstaking work of gluing the paper sections, he discovered an unforeseen problem: the paper stretched.\n\nSynonym example: unexpected issue = learnt that the paper had stretched"
  },
  "38": {
    passageId: 3,
    highlights: ["...Bellerby clearly found a kindred spirit in Martin Behaim... Something of Bellerby's unflinching ambition is reflected in the even more heroic efforts of the Italian cartographer Vincenzo Coronelli..."],
    explanation: "The reviewer brings up historical globemakers to show that Bellerby shares their ambitious and obsessive traits.\n\nSynonym example: had something in common = found a kindred spirit / is reflected in"
  },
  "39": {
    passageId: 3,
    highlights: ["...Bellerby's book is also a lament for the fading away of centuries-old traditions."],
    explanation: "The passage notes that the book acts as an expression of sorrow (lament) over traditional skills disappearing as craftsmen retire or die.\n\nSynonym example: regrets the loss = lament for the fading away"
  },
  "40": {
    passageId: 3,
    highlights: ["His book... is hardly a blueprint for commercial success."],
    explanation: "The reviewer notes that while the book is beautiful and inspiring, it is not a manual on how to achieve financial or business success.\n\nSynonym example: does not tell you how to create a profitable business = hardly a blueprint for commercial success"
  }
};
`;

let orig = fs.readFileSync('src/data/decemberReadingData.ts', 'utf8');
orig = orig.replace(/export const decemberExplanations: Record<string, any> = \{[\s\S]*?\};/, code.trim());
fs.writeFileSync('src/data/decemberReadingData.ts', orig);
