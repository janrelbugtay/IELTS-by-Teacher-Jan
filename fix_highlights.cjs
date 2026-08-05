const fs = require('fs');

const test15Explanations = {
  1: {
    passageId: 1,
    highlights: ["Katherine Mansfield Beauchamp Murry was born in 1888", "using the pen name of Katherine Mansfield."],
    explanation: "The passage states she was born with a longer name and used \"Katherine Mansfield\" as a pen name, meaning it was not exactly the same as her origin (birth) name.\n\n**Synonyms:**\n• origin name = was born\n• name that appears on the writer's book = pen name"
  },
  2: {
    passageId: 1,
    highlights: ["Her first published stories appeared in the High School Reporter and the Wellington Girls' High School magazine in 1898 and 1899."],
    explanation: "The text mentions that her stories were published in the High School Reporter, but there is no mention of her winning a prize for them."
  },
  3: {
    passageId: 1,
    highlights: ["interest in the Maori people (New Zealand's native people), who were often portrayed in a sympathetic light in her later stories, such as How Pearl Button Was Kidnapped."],
    explanation: "The passage explicitly states that she portrayed the native Maori people sympathetically in this specific story.\n\n**Synonyms:**\n• favorable way = sympathetic light"
  },
  4: {
    passageId: 1,
    highlights: ["Mansfield recommenced playing the cello, an occupation that she believed, during her time at Queen's, she would take up professionally."],
    explanation: "During her time at Queen's College, she intended to take up playing the cello professionally, not writing.\n\n**Synonyms:**\n• planned to be a professional [writer] = would take up professionally"
  },
  5: {
    passageId: 1,
    highlights: ["she was appreciated amongst fellow students at Queen's for her lively and charismatic approach to life and work."],
    explanation: "The text says her fellow students appreciated her, which directly contradicts the claim that she was unpopular.\n\n**Synonyms:**\n• unpopular (contradicted by) = appreciated amongst fellow students"
  },
  6: {
    passageId: 1,
    highlights: ["Mansfield did not actively support the suffragette movement in the UK."],
    explanation: "The passage points out she did not actively support the suffragette movement (the primary women's political movement of the era in the UK).\n\n**Synonyms:**\n• showed little interest in politics = did not actively support the suffragette movement"
  },
  7: {
    passageId: 1,
    highlights: ["she returned to her New Zealand home in 1906"],
    explanation: "The text mentions the year she returned home to New Zealand after schooling in England."
  },
  8: {
    passageId: 1,
    highlights: ["She had several works published in Australia in a magazine called Native Comparison, which was her first paid writing work"],
    explanation: "Her first paid writing job was for a magazine in Australia."
  },
  9: {
    passageId: 1,
    highlights: ["Mansfield rapidly grew discontented with the provincial New Zealand lifestyle, and with her family."],
    explanation: "She became unhappy with two things: the provincial lifestyle of New Zealand and her family.\n\n**Synonyms:**\n• dissatisfied = discontented"
  },
  10: {
    passageId: 1,
    highlights: ["Their attempt to set up as writers in Paris was cut short by Murry's bankruptcy"],
    explanation: "Murry went bankrupt, which cut short their time trying to be writers in Paris.\n\n**Synonyms:**\n• prevents... from staying together = cut short by"
  },
  11: {
    passageId: 1,
    highlights: ["She and Murry developed close contact with other well-known writers of the time such as DH Lawrence"],
    explanation: "She and Murry developed close contacts with famous writers like DH Lawrence.\n\n**Synonyms:**\n• spent time with = developed close contact with\n• distinguished = well-known"
  },
  12: {
    passageId: 1,
    highlights: ["It was the publication of Bliss and Other Stories in 1920 that was to solidify Mansfield's reputation as a writer."],
    explanation: "The publication of this book solidified her standing as an author.\n\n**Synonyms:**\n• consolidated = solidify"
  },
  13: {
    passageId: 1,
    highlights: ["After her death, her husband, Murry, took on the task of editing and publishing her works."],
    explanation: "John Middleton Murry, her husband, took on the responsibility of publishing her remaining works."
  },
  14: {
    passageId: 2,
    highlights: ["Five years ago, for example, a French cereal-growers' co-operative called Sevepi purchased a satellite", "For each zone, the exact and best fertiliser formula is recommended."],
    explanation: "Paragraph C describes a French cooperative (Sevepi) that uses color-coded satellite maps to recommend the exact fertilizer formula for different zones."
  },
  15: {
    passageId: 2,
    highlights: ["as weather patterns change and farmers can no longer rely on the past as a guide to the future. When founded by the yield variations that these new weather patterns will bring"],
    explanation: "Paragraph D discusses changing weather patterns and the resulting variations in crop yields.\n\n**Synonyms:**\n• climate change = weather patterns change"
  },
  16: {
    passageId: 2,
    highlights: ["useful for the study of fields with declining productivity in the province of Saskatchewan. Over-application of nitrate fertilisers", "appears partly responsible."],
    explanation: "Paragraph E details how over-application of nitrate fertilizers leads to declining productivity in fields (Saskatchewan).\n\n**Synonyms:**\n• using too much = Over-application"
  },
  17: {
    passageId: 2,
    highlights: ["Once passed on to the International Center for Tropical Agriculture, based in Colombia, South America, it is intended that the information be used to build a database", "across farmland in the poorest countries in Africa."],
    explanation: "Paragraph G discusses a database (Digital Soil Map) originating in Kenya, passed to an organization in Colombia, to be used across the poorest countries in Africa."
  },
  18: {
    passageId: 2,
    highlights: ["France is the pioneer in this sort of surveillance. More farmland is analyzed by satellite there than in any other country"],
    explanation: "Paragraph D explicitly states that France analyzes more farmland by satellite than any other country.\n\n**Synonyms:**\n• leader = pioneer"
  },
  19: {
    passageId: 2,
    highlights: ["satellites to include the Red-Edge band of the light spectrum", "More research will be necessary to realize the full benefits of the Red-Edge band."],
    explanation: "Paragraph F talks about the \"Red-Edge band\" on satellites and notes that more research is needed to realize its full potential.\n\n**Synonyms:**\n• further study = More research"
  },
  20: {
    passageId: 2,
    highlights: ["The service usually less than US $15 per hectare", "and can increase yields by as much as 10%."],
    explanation: "Paragraph B gives the exact price of the service versus the potential return on investment (increased yields)."
  },
  21: {
    passageId: 2,
    highlights: ["Infoterra (a subsidiary of EADS Astrium), the firm that is France's largest provider of such information"],
    explanation: "Infoterra is described as a provider of satellite data (meaning they get it directly), and RapidEye is explicitly called a \"satellite operator.\" Organizations like Sevepi and Agriculture Canada purchase the data from these operators."
  },
  22: {
    passageId: 2,
    highlights: ["according to RapidEye, a German satellite operator"],
    explanation: "RapidEye is explicitly called a \"satellite operator.\" Organizations like Sevepi and Agriculture Canada purchase the data from these operators."
  },
  23: {
    passageId: 2,
    highlights: ["by calculating the amount of electromagnetic radiation reflected from agricultural land. The data is collected by orbiting satellites."],
    explanation: "Satellites calculate this type of energy reflecting off the land to analyze crops."
  },
  24: {
    passageId: 2,
    highlights: ["reckons the amount of monitored farmland will increase as weather patterns change"],
    explanation: "(Note: The actual text regarding weather is from Henri Douche in Paragraph D, but the prompt says Fredrick Jung-Rothenhäuser which is an error in the mock test) Henri Douche notes that changing weather will cause the amount of monitored farmland to rise.\n\n**Synonyms:**\n• raise = increase"
  },
  25: {
    passageId: 2,
    highlights: ["selling insurance policies to governments of famine-prone countries that might be threatened by crop failure."],
    explanation: "The data helps insurance companies sell policies to famine-prone countries at risk of failing crops."
  },
  26: {
    passageId: 2,
    highlights: ["In Africa, where many areas have become badly depleted of nutrients"],
    explanation: "The text states that many areas in Africa are badly depleted of nutrients.\n\n**Synonyms:**\n• suffers from the loss of = badly depleted of"
  },
  27: {
    passageId: 3,
    highlights: ["This rate depends on the relative strengths of the signal and noise traveling down the communication channel, and on its capacity (its 'bandwidth')."],
    explanation: "This paragraph explains that the rate of transmission is dependent on signal strength, noise level, and bandwidth capacity."
  },
  28: {
    passageId: 3,
    highlights: ["As mobile phone text messages like 'I CN C U' show, it is often possible to leave out a lot of data without losing much meaning."],
    explanation: "Paragraph F uses the example of a text message ('I CN C U') to show how redundant bits of data can be stripped out.\n\n**Synonyms:**\n• unnecessary information = redundant bits / a lot of data\n• omitted = leave out"
  },
  29: {
    passageId: 3,
    highlights: ["While at Bell Laboratories, Shannon developed information theory, but shunned the resulting acknowledgment."],
    explanation: "Paragraph B states that Shannon avoided the public recognition that came with his discoveries.\n\n**Synonyms:**\n• attitude to fame = shunned the resulting acknowledgment"
  },
  30: {
    passageId: 3,
    highlights: ["supermarket check-out lasers can read the price even on, say, a crumpled bag of crisps."],
    explanation: "Paragraph E describes supermarket checkout lasers (machines) that can read a bar code even if the packaging is damaged or crumpled."
  },
  31: {
    passageId: 3,
    highlights: ["In April 2002 an event took place which demonstrated one of the many applications of information theory. The space probe, Voyager I"],
    explanation: "Paragraph A tells the specific, detailed story of the Voyager I space probe repair, which utilized information theory."
  },
  32: {
    passageId: 3,
    highlights: ["He set out with an apparently simple aim: to pin down the precise meaning of the concept of 'information'."],
    explanation: "Paragraph C explains his original, fundamental goal when he began his work as a young student.\n\n**Synonyms:**\n• initially intended to achieve = set out with an apparently simple aim"
  },
  33: {
    passageId: 3,
    highlights: ["had sent back spectacular images of Jupiter and Saturn and then soared out of the Solar System"],
    explanation: "The probe sent images of the two planets before exiting our solar system."
  },
  34: {
    passageId: 3,
    highlights: ["had sent back spectacular images of Jupiter and Saturn and then soared out of the Solar System"],
    explanation: "The probe sent images of the two planets before exiting our solar system.\n\n**Synonyms:**\n• leave = soared out of"
  },
  35: {
    passageId: 3,
    highlights: ["Sensors and circuits were on the brink of failing"],
    explanation: "The deep freeze of space was causing these two vital components to fail.\n\n**Synonyms:**\n• stop working = failing"
  },
  36: {
    passageId: 3,
    highlights: ["The solution was to get a message to Voyager I to instruct it to use spares to change the failing parts."],
    explanation: "NASA sent a message instructing the probe to switch to its backup parts.\n\n**Synonyms:**\n• replace them with = use [spares] to change"
  },
  37: {
    passageId: 3,
    highlights: ["By means of a radio dish belonging to NASA's Deep Space Network, the message was sent out into the depths of space."],
    explanation: "NASA used this equipment to beam the instructions across space."
  },
  38: {
    passageId: 3,
    highlights: ["The most basic form of information, Shannon argued, is whether something is true or false", "Having identified this fundamental unit, Shannon set about defining otherwise vague ideas about information and how to transmit it from place to place."],
    explanation: "The text confirms that his most basic building block (his starting point) was defining information as true or false (1 or 0) before he figured out how to transmit it.\n\n**Synonyms:**\n• starting point = most basic form / fundamental unit"
  },
  39: {
    passageId: 3,
    highlights: ["This rate depends on the relative strengths of the signal and noise traveling down the communication channel"],
    explanation: "The passage states exactly this: the transmission rate depends on the signal strength versus the noise.\n\n**Synonyms:**\n• amount of information that can be sent in a given time period = rate"
  },
  40: {
    passageId: 3,
    highlights: ["discovering so-called turbo codes – which come very close to Shannon's ultimate limit for the maximum rate that data can be transmitted reliably"],
    explanation: "The text says modern technologies (like turbo codes) come very close to Shannon's ultimate limit, meaning they have not exceeded what he calculated was possible.\n\n**Synonyms:**\n• convey more information than Shannon had anticipated (contradicted by) = come very close to Shannon's ultimate limit"
  }
};

let content = fs.readFileSync('src/data/test15ReadingData.ts', 'utf8');

// Replace the old test15Explanations mapping
const replacementRegex = /export const test15Explanations: Record<number, any> = \{[\s\S]*?\};/;
content = content.replace(replacementRegex, `export const test15Explanations: Record<number, any> = ${JSON.stringify(test15Explanations, null, 2)};`);

fs.writeFileSync('src/data/test15ReadingData.ts', content);
console.log('done fixing highlights');
