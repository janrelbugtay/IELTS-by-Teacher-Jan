const fs = require('fs');
let data = fs.readFileSync('src/data/septemberReadingData.ts', 'utf8');

const answers = {
  1: "ii",
  2: "viii",
  3: "v",
  4: "i",
  5: "iii",
  6: "ix",
  7: "New Zealand carrageens",
  8: "agar",
  9: "seameal / canning / paint / leather",
  10: "cough mixtures / cosmetics / confectionery / toothpastes",
  11: "B",
  12: "C",
  13: "A",
  14: "C",
  15: "B",
  16: "A",
  17: "B",
  18: "B",
  19: "C",
  20: "E",
  21: "H",
  22: "D",
  23: "F",
  24: "FALSE",
  25: "NOT GIVEN",
  26: "TRUE",
  27: "NO",
  28: "YES",
  29: "NOT GIVEN",
  30: "YES",
  31: "NO",
  32: "YES",
  33: "C",
  34: "B",
  35: "D",
  36: "A",
  37: "A",
  38: "D",
  39: "F",
  40: "B",
};

const explanations = {
  1: {
    passageId: 1,
    highlights: ["wholesome food, which absorbs and concentrates traces of a wide variety of minerals", "Seaweeds are also rich in vitamins"],
    explanation: "The paragraph exclusively focuses on dietary benefits, specific minerals (iron, iodine, calcium), and vitamins that maintain human health.\n\nSynonym Match: wholesome food / rich in vitamins / minerals = nutritional value",
    detailedExplanation: "Why Other Headings Are Wrong:\nvii (Recipes for how to cook): While jellies and eating customs are mentioned, they serve as historical evidence of iodine intake, not instructional cooking recipes.\nvi (At risk of extinction): There is no mention of seaweed dying out here."
  },
  2: {
    passageId: 1,
    highlights: ["commercial application in the production of seameal", "and in the canning, paint and leather industries", "manufacture of cough mixtures, cosmetics, confectionery and toothpastes"],
    explanation: "The paragraph lists diverse commercial items manufactured using seaweed extracts (agar).\n\nSynonym Match: canning, paint, leather industries / cough mixtures, cosmetics, toothpastes = range of seaweed products",
    detailedExplanation: "Why Other Headings Are Wrong:\niv (How to make agar): It mentions that agar is extracted, but it does not explain the technical process or manufacturing steps of making agar itself."
  },
  3: {
    passageId: 1,
    highlights: ["Despite this, these seaweeds were not much utilized until several decades ago", "New Zealand used to import the Northern Hemisphere Irish moss"],
    explanation: "The text contrasts New Zealand’s abundant natural seaweed supply with its historical failure to exploit it, relying on imports from England and Japan instead.\n\nSynonym Match: not much utilized = under-use | New Zealand has many... = native seaweeds",
    detailedExplanation: "Why Other Headings Are Wrong:\nvi (At risk of extinction): It describes species being ignored or rare in certain localized areas (east coast), not biologically endangered or dying out globally."
  },
  4: {
    passageId: 1,
    highlights: ["divided into three classes determined by color – red, brown and green", "tend therefore to occur in very well-defined zones", "green seaweeds are mainly shallow-water", "browns belong to the medium depths", "reds are plants of the deeper water"],
    explanation: "The paragraph maps out how seaweeds look (color changes) and precisely where they grow based on tide lines and depth.\n\nSynonym Match: color (red, brown, green) = appearance | well-defined zones / shallow-water / medium depths = location",
    detailedExplanation: "Why Other Headings Are Wrong:\nix (Why seaweeds don't sink or dry out): While physical survival is touched upon briefly, the core organizing principle of the paragraph is habitat zoning and physical categorization."
  },
  5: {
    passageId: 1,
    highlights: ["Propagation of seaweeds occurs by seed-like spores, or by fertilization of egg cells", "plants absorb their nourishment through their leafy fronds"],
    explanation: "It explains the biological mechanics of breeding (spores/egg cells) and feeding (absorbing nourishment via fronds rather than roots).\n\nSynonym Match: propagation / fertilization = reproduce | absorb their nourishment = grow",
    detailedExplanation: "Why Other Headings Are Wrong:\ni (Appearance and location): It describes anatomy (holdfasts, fronds) only to explain growth function, not where to find them on the beach."
  },
  6: {
    passageId: 1,
    highlights: ["stay on the surface of the water by means of air-filled floats", "exposed to the air, often reduce dehydration either by having swollen stems that contain water"],
    explanation: "The paragraph details two specific survival adaptations: buoyancy mechanisms (air floats) and moisture retention (swollen stems, mucilage coatings).\n\nSynonym Match: stay on the surface = don't sink | reduce dehydration / keep the plant moist = don't dry out",
    detailedExplanation: "Why Other Headings Are Wrong:\niii (Reproduce and grow): This section deals purely with physical environmental survival, not breeding or feeding."
  },
  7: {
    passageId: 1,
    highlights: ["often referred to as the New Zealand carrageens"],
    explanation: "Synonym Match: close relative of carrageen = New Zealand carrageens",
    detailedExplanation: "Why Others Fail: Writing just 'carrageens' lacks the geographical distinction explicitly emphasized in the text ('often referred to as the New Zealand carrageens')."
  },
  8: {
    passageId: 1,
    highlights: ["The substance called agar which can be extracted"],
    explanation: "Synonym Match: substance called agar... can be extracted = agar",
    detailedExplanation: "Why Others Fail: No other chemical substance or extract is named as the primary raw material harvested from the Gigartina species."
  },
  9: {
    passageId: 1,
    highlights: ["gives them great commercial application in the production of seameal"],
    explanation: "Synonym Match: commercial application in the production of... = industrial products",
    detailedExplanation: "Why Others Fail: Terms like 'custard' are secondary byproducts made from seameal, rather than direct commercial applications of agar itself."
  },
  10: {
    passageId: 1,
    highlights: ["used in the manufacture of cough mixtures, cosmetics, confectionery and toothpastes"],
    explanation: "Synonym Match: used in the manufacture of = everyday products",
    detailedExplanation: "Why Others Fail: Selecting wartime Australia is a location/historical event, not a manufactured product category."
  },
  11: {
    passageId: 1,
    highlights: ["Those shallow-water species able to resist long periods of exposure to sun and air are usually found on the upper shore", "green seaweeds are mainly shallow-water algae"],
    explanation: "Synonym Match: resist long periods of exposure to sun and air = can survive the heat and dryness | upper shore = high-water mark",
    detailedExplanation: "Why A and C Are Wrong: Brown seaweeds live in midlevel tides (A), and red seaweeds require deep, submerged water (C) where they are not exposed to the drying air."
  },
  12: {
    passageId: 1,
    highlights: ["the reds are plants of the deeper water, furthest from the shore."],
    explanation: "Synonym Match: deeper water / furthest from the shore = far out in the open sea",
    detailedExplanation: "Why A and B Are Wrong: Green seaweeds stick to shallow coastal water (B), and browns inhabit medium depths (A), neither of which are furthest from the shore."
  },
  13: {
    passageId: 1,
    highlights: ["Flat rock surfaces near midlevel tides are the most usual habitat of", "most brown seaweeds. This is also the home of the purple laver or Maori karengo"],
    explanation: "Synonym Match: also the home of = share their site with",
    detailedExplanation: "Why B and C Are Wrong: Karengo is explicitly mapped to midlevel tidal rocks—the exclusive domain of brown seaweeds—not the upper shore (green) or deep ocean (red)."
  },
  14: {
    passageId: 2,
    highlights: ["Dr. Paul Ekman was addressing a group of young psychiatrists in training when he was asked a question"],
    explanation: "Synonym Match: young psychiatrists in training = students",
    detailedExplanation: "Why Other Options Are Wrong:\nA (peers): They were trainees, not equal colleagues or fellow established scientists.\nB (patients): The patients were on the video recordings; they were not in the audience asking him questions.\nD (teachers): Ekman was the one lecturing; the audience consisted of people learning from him."
  },
  15: {
    passageId: 2,
    highlights: ["As part of his research, he had already filmed a series of 12-minute interviews", "And suddenly, there, across just two frames of the film, he saw it", "He termed his discovery “micro-expression”"],
    explanation: "Synonym Match: he was asked a question, the answer to which has kept him busy ever since... He termed his discovery = origins of Ekman's theories",
    detailedExplanation: "Why Other Options Are Wrong:\nA (illustrate how frequently patients lie): The text only mentions one patient lying in this specific context; it does not provide statistical frequency.\nC (compare Ekman's research to previous studies): No earlier or rival studies are mentioned in this paragraph.\nD (show how patients' behavior is affected by filming): There is no discussion of whether cameras altered the patients' natural behavior."
  },
  16: {
    passageId: 2,
    highlights: ["the ways in which we express disgust, disdain, fear", "are universal. The facial muscles", "are essentially standard, regardless of language and culture"],
    explanation: "Synonym Match: universal / standard, regardless of language and culture = common to everyone",
    detailedExplanation: "Why Other Options Are Wrong:\nB (recent research has refuted an old idea): Ekman supported and proved Charles Darwin’s old proposition; he did not refute (disprove) it.\nC (with practice we can learn to control our micro-expressions): The text explicitly states these expressions are 'impossible to suppress', meaning control cannot be learned.\nD (human society is too complex to allow for generalizations): The paragraph proves the exact opposite—that basic emotional expressions are biological generalizations shared across all human societies."
  },
  17: {
    passageId: 2,
    highlights: ["most people will fail to spot these fleeting signals of inner torment. Of the 15,000 Ekman has tested, only 50 people, whom he calls “naturals,” have been able to do it."],
    explanation: "Synonym Match: only 50 people out of 15,000 = few untrained people",
    detailedExplanation: "Why Other Options Are Wrong:\nA (It's natural for people to lie): The term 'naturals' refers to people who naturally spot lies, not a claim that lying itself is a biological default.\nC (most liars suffer from periods of depression): The phrase 'inner torment' refers to the temporary stress of hiding a lie during an interview, not clinical depression.\nD (all of his subjects were trained to identify micro-expressions): The 15,000 people tested were evaluated on their innate ability before any training was administered."
  },
  18: {
    passageId: 2,
    highlights: ["he has been called in by the FBI and CIA (among millions more law enforcement and other agencies around the world)", "He has held workshops for defense and prosecution lawyers, health professionals, even jealous spouses"],
    explanation: "Synonym Match: called in by millions... workshops for lawyers, professionals, spouses = in great demand",
    detailedExplanation: "Why Other Options Are Wrong:\nA (They take decades to teach): He spent decades developing the theory, but teaches it in short 'workshops.'\nC (They have aroused the suspicions of some agencies): Agencies hire and consult him; they are not suspicious of his validity.\nD (they can be used by a limited range of occupations): The list of clients (police, lawyers, doctors, everyday citizens) proves the application is vast, not limited."
  },
  19: {
    passageId: 2,
    highlights: ["afraid that the show would exaggerate the effectiveness of his techniques and create the quite inaccurate impression among audiences"],
    explanation: "Synonym Match: inaccurate impression = false beliefs",
    detailedExplanation: "Why Others Fail: B (crimes) and D (motives) do not fit grammatically or logically; Ekman feared the public would hold incorrect assumptions about foolproof lie detection."
  },
  20: {
    passageId: 2,
    highlights: ["concerned about unfair convictions, that one day someone not properly trained", "might sit on a jury and wrongly find someone guilty"],
    explanation: "Synonym Match: unfair convictions / wrongly find someone guilty = justice not being carried out",
    detailedExplanation: "Why Others Fail: A (consequences) is too broad. The specific nightmare scenario Ekman feared was a breakdown of the legal court system (wrongful imprisonment)."
  },
  21: {
    passageId: 2,
    highlights: ["first time, as far as Ekman is aware, that a commercial TV drama has been based on the work of just one scientist."],
    explanation: "Synonym Match: work of just one scientist = a single person's research",
    detailedExplanation: "Why Others Fail: Ekman is a scientific researcher, not an actor (G) or a TV executive driven by ratings (I)."
  },
  22: {
    passageId: 2,
    highlights: ["He was also impressed with the producer's manifestly serious and well-intentioned reasons for making the program."],
    explanation: "Synonym Match: reasons for making the program = motives",
    detailedExplanation: "Why Others Fail: F (accuracy) applies to the script content, whereas the producer's internal driving forces are their motives."
  },
  23: {
    passageId: 2,
    highlights: ["he believes probably 80-90 per cent of the show is based on fact and that's good enough"],
    explanation: "Synonym Match: 80-90 per cent based on fact = accuracy",
    detailedExplanation: "Why Others Fail: Ekman is evaluating the scientific truth of the show, not its broadcast popularity or television ratings (I)."
  },
  24: {
    passageId: 2,
    highlights: ["observes that the ability to detect a lie and the ability to lie successfully are completely unrelated."],
    explanation: "Synonym Match: completely unrelated = NOT tending to co-occur",
    detailedExplanation: "Why It’s False: The text explicitly rejects any correlation between being a skilled liar and being a skilled lie detector.\nWhy Not True/Not Given: It cannot be Not Given because the relationship between the two traits is directly analyzed and dismissed by Ekman."
  },
  25: {
    passageId: 2,
    highlights: ["This means that an actor or a poker player isn't a true liar. They are supposed to deceive you, it's part of the game"],
    explanation: "Why It’s Not Given: The passage mentions poker players solely as a conceptual example to define what constitutes a 'true lie' (bluffing in a game isn't a true lie). There is zero mention of Ekman ever meeting, coaching, or analyzing poker players in his professional consulting work.",
    detailedExplanation: "Why Not True/False: Any assumption that he trained them is pure outside speculation not found in the text."
  },
  26: {
    passageId: 2,
    highlights: ["He prefers to focus on the kinds of lies where the liar would be on grave trouble if they were found out and where the target would feel properly aggrieved"],
    explanation: "Synonym Match: prefers to focus on = more interested in | grave trouble / properly aggrieved = serious consequences",
    detailedExplanation: "Why It’s True: Ekman explicitly states his scientific preference is to investigate high-stakes deception rather than social flattery or white lies."
  },
  27: {
    passageId: 3,
    highlights: ["We are visual creatures and rely on sight to serve as a judge of what is real and what is not."],
    explanation: "Synonym Match: rely on sight = dependent on what we can see",
    detailedExplanation: "Why It’s No: If we rely on sight to judge reality, our perception of reality is entirely dependent on our vision. This directly contradicts the word 'independent.'\nWhy Not Yes/Not Given: The text explicitly links visual confirmation to human belief in reality."
  },
  28: {
    passageId: 3,
    highlights: ["I must have one [an ego] because it can be hurt or appeased by how others treat me."],
    explanation: "Synonym Match: hurt or appeased = reactions that can be felt | must have one = must exist",
    detailedExplanation: "Why It’s Yes: The writer uses the tangible emotional sensitivity of the ego (feeling hurt or flattered) as logical proof of its psychological existence.\nWhy Not No/Not Given: This is a direct, affirmative restatement of the writer's personal thought experiment in paragraph one."
  },
  29: {
    passageId: 3,
    highlights: ["Mapping the Mind uses beautifully rendered three-dimensional computer images", "beautifully accented with brain-oriented artwork of both pure aesthetic and illustrative value"],
    explanation: "Why It’s Not Given: The text praises the artistic quality, 3D rendering, and aesthetic value of the images, but it never describes the color palette. We do not know if the illustrations are brightly neon, muted pastel, or grayscale.",
    detailedExplanation: "Why Not Yes/No: Guessing that 'beautiful' automatically means 'vibrant colors' is an unwarranted inference."
  },
  30: {
    passageId: 3,
    highlights: ["The presentation style acknowledges our natural bias towards perceiving and learning information visually."],
    explanation: "Synonym Match: natural bias towards = prefer to learn",
    detailedExplanation: "Why It’s Yes: A 'natural bias towards' taking in visual data confirms that humans inherently prefer visual presentations over dense text."
  },
  31: {
    passageId: 3,
    highlights: ["walks a pleasing line between college textbook and coffee table art book, describing the subtle nuances of vision, language, thought, and feeling with science and art."],
    explanation: "Synonym Match: walks a pleasing line between textbook and art book = both educational and decorative (NOT mainly decorative)",
    detailedExplanation: "Why It’s No: A 'coffee table book' is decorative, but the text states the book functions equally as an academic college textbook packed with serious science. Therefore, claiming it is mainly decorative is false."
  },
  32: {
    passageId: 3,
    highlights: ["allowing people to draw their own conclusions and connect the dots between scientific discovery and what it means in our everyday lives."],
    explanation: "Synonym Match: allowing people to draw their own conclusions = leaves the readers to interpret the facts",
    detailedExplanation: "Why It’s Yes: This is an exact conceptual paraphrase. Carter presents the scientific evidence without preaching, trusting the reader to synthesize the meaning."
  },
  33: {
    passageId: 3,
    highlights: ["Carter uses her background as a journalist to keep the reader engaged in the science."],
    explanation: "Synonym Match: keep the reader engaged = maintains the reader's interest",
    detailedExplanation: "Why Other Options Are Wrong:\nA (she has easy access to relevant sources): While she includes researchers, her journalistic skill is specifically cited as the tool that maintains reader engagement.\nB (she cannot explain complex medical ideas): She can and does explain complex ideas brilliantly; that is the core praise of the review.\nD (her presentation of information is more suited to newspapers): The text compares the book to a college textbook and art book, not newspaper columns."
  },
  34: {
    passageId: 3,
    highlights: ["For example", "Carter uses familiar situations, like suppressing anger when we feel we have been insulted, to illustrate the neuroscience involved."],
    explanation: "Synonym Match: familiar situations... we can all relate to = uses examples readers can relate to",
    detailedExplanation: "Why Other Options Are Wrong:\nA (gives guidance to parents of young children): She explains why a six-year-old throws tantrums (underdeveloped inhibition circuitry), but she does not offer child-rearing tips or parenting advice.\nC (admires the control shown by adults): She describes adult brain circuitry objectively without expressing moral admiration.\nD (criticizes the behavior of children): She provides a biological justification for tantrums, removing any behavioral criticism."
  },
  35: {
    passageId: 3,
    highlights: ["Mapping the Mind seems to aim itself at an audience that is often forgotten: the general reader who wants to know more about a specific area of scientific study."],
    explanation: "Synonym Match: the general reader who wants to know more = readers with no prior knowledge of the topic",
    detailedExplanation: "Why Other Options Are Wrong:\nA (will not give readers any new information): The entire book is dedicated to delivering cutting-edge neuroimaging discoveries to the public.\nB (could make readers doubt scientific claims): The author notes that pop-science can sometimes lose credibility, but emphasizes that Carter circumvents (avoids) this problem entirely.\nC (will encourage more people to study neuroscience): While inspiring, the text never claims readers will formally enroll in university neuroscience degree programs."
  },
  36: {
    passageId: 3,
    highlights: ["As a teacher, I am always searching for ways to make information relevant to the reader. Mapping the Mind does this by peppering appropriate chapters with optical illusions"],
    explanation: "Synonym Match: make information relevant to the reader = help people relate to the topic",
    detailedExplanation: "Why Other Options Are Wrong:\nB (are a long-standing scientific mystery): The book provides immediate textual explanations for the illusions; they are not presented as unsolved scientific enigmas.\nC (can teach us about the function of the eye): The illusions are used to explain how the brain processes information, not the physical optics of the eyeball.\nD (show something people have never seen before): Optical illusions are described as 'familiar' teaching tools, not brand-new visual inventions."
  },
  37: {
    passageId: 3,
    highlights: ["Mapping the Mind serves as a sort of kiosk map saying 'you are here' with a big red dot. Mapping the Mind shows us where we are by giving us a snapshot of how we work."],
    explanation: "Synonym Match: saying 'you are here'... shows us where we are = reveals our current position in terms of our knowledge",
    detailedExplanation: "Why Other Options Are Wrong:\nB (the reader can become lost in other textbooks): The metaphor is about orientation in scientific self-discovery, not about navigating confusing rival textbooks.\nC (it describes specific areas of the brain such as the neo-cortex): While anatomy is discussed, the 'kiosk map' analogy specifically illustrates humanity's philosophical and scientific orientation ('who we are').\nD (its illustrations are particularly clear and accurate): The quote refers to the conceptual journey of self-awareness, not just graphic design clarity."
  },
  38: {
    passageId: 3,
    highlights: ["Presenting the concept", "by calling it the 'anterior cingulate cortex' would probably put most readers to sleep while their brains struggled to use that area to focus on what the name meant."],
    explanation: "Synonym Match: put most readers to sleep = bores people | struggled to use that area to focus = confuses people",
    detailedExplanation: "Why Other Endings Fail:\nA (makes a science background essential): Using heavy jargon creates an obstacle, whereas Carter's goal is to make the science accessible without requiring medical school.\nF (solves the difficulty...): Unexplained Latin terms cause negative reactions; they do not solve them."
  },
  39: {
    passageId: 3,
    highlights: ["Showing the reader a three-dimensionally-oriented area that easily translates to a place we can point to on our skulls grounds the anatomical vocabulary in something we can all understand"],
    explanation: "Synonym Match: grounds anatomical vocabulary in something we can all understand = solves the difficulty of technical language",
    detailedExplanation: "Why Other Endings Fail:\nC (not helpful for checking particular data): This applies to the book being read front-to-back rather than as a reference dictionary, not to its 3D illustrations.\nG (has no clear purpose): The 3D illustrations have an explicit educational purpose: spatial grounding."
  },
  40: {
    passageId: 3,
    highlights: ["scientific credibility can be sacrificed in order to keep readers engaged. Carter circumvents this problem by including the participation of research scientists", "The book is littered with short directed essays written by specialists"],
    explanation: "Synonym Match: circumvents sacrificing scientific credibility by including specialists = adds academic integrity to a popular approach",
    detailedExplanation: "Why Other Endings Fail:\nE (generates more interest in the field of research): While specialists wrote the essays, their inclusion was designed to bulletproof the book's factual accuracy, not act as a recruitment tool for researchers.\nC (not helpful for checking data): Direct essays by top scientists actually provide authoritative data rather than hindering it."
  }
};

data = data.replace(
  /export const septemberAnswers: Record<number, string> = [\s\S]*?;/,
  'export const septemberAnswers: Record<number, string> = ' + JSON.stringify(answers, null, 2) + ';'
);

data = data.replace(
  /export const septemberExplanations: Record<number, any> = [\s\S]*?;/,
  'export const septemberExplanations: Record<number, any> = ' + JSON.stringify(explanations, null, 2) + ';'
);

fs.writeFileSync('src/data/septemberReadingData.ts', data);
