const fs = require('fs');

const p2Content = [
  "A. For much of the twentieth century, documentary films were overshadowed by their more successful Hollywood counterparts. For a number of reasons, documentaries were frequently ignored by critics and film studies courses at universities. Firstly, the very idea of a documentary film made some people suspicious. As the critic Dr Helmut Fischer put it, 'Documentary makers might have ambitions to tell the \"truth\" and show only \"facts\" but there is no such thing as a non-fiction film. That\\'s because, as soon as you record an incident on camera, you are altering its reality in a fundamental way'. Secondly, even supporters of documentaries could not agree on a precise definition, which did little to improve the reputation of the genre. Lastly, there were also concerns about the ethics of filming subjects without their consent, which is a necessity in many documentary films.",
  "B. None of this prevented documentaries from being produced, though exactly when the process started is open to question. It is often claimed that Nanook of the North was the first documentary. Made by the American filmmaker Robert J. Flaherty in 1922, the film depicts the hard, sometimes heroic lives of native American peoples in the Canadian Arctic. Nanook of the North is said to have set off a trend that continued through the 1920s with the films of Dziga Vertov in the Soviet Union and works by other filmmakers around the world. However, that 1922 starting point has been disputed by supporters of an earlier date. Among this group is film historian Anthony Berwick, who argues that the genre can be traced back as early as 1895, when similar films started to appear, including newsreels, scientific films and accounts of journeys of exploration.",
  "C. In the years following 1922, one particular style of documentary started to appear. These films adopted a serious tone while depicting the lives of actual people. Cameras were mounted on tripods and subjects rehearsed and repeated activities for the purposes of the film. British filmmaker John Grierson was an important member of this group. Grierson\\'s career lasted nearly 40 years, beginning with Drifters (1929) and culminating with I Remember, I Remember (1968). However, by the 1960s Grierson\\'s style of film was being rejected by the Direct Cinema movement, which wanted to produce more natural and authentic films: cameras were hand-held; no additional lighting or sound was used; and the subjects did not rehearse. According to film writer Paula Murphy, the principles and methods of Direct Cinema brought documentaries to the attention of universities and film historians as never before. Documentaries started to be recognised as a distinct genre worthy of serious scholarly analysis.",
  "D. Starting in the 1980s, the widespread availability of first video and then digital cameras transformed filmmaking. The flexibility and low cost of these devices meant that anyone could now be a filmmaker. Amateurs working from home could compete with professionals in ways never possible before. The appearance of online film-sharing platforms in the early 2000s only increased the new possibilities for amateur filmmakers. Nonetheless, while countless amateur documentaries were being made, perhaps the most popular documentary of 2006 was still the professionally made An Inconvenient Truth. New cameras and digital platforms revolutionised the making of films. But as critic Maria Fiala has pointed out, 'The argument sometimes put forward that these innovations immediately transformed what the public expected to see in a documentary isn\\'t entirely accurate.'",
  "E. However, a new generation of documentary filmmakers then emerged, and with them came a new philosophy of the genre. These filmmakers moved away from highlighting political themes or urgent social issues. Instead the focus moved inwards, exploring personal lives, relationships and emotions. It could be argued that Catfish (2010) was a perfect example of this new trend. The film chronicles the everyday lives and interactions of the social media generation and was both a commercial and critical success. Filmmaker Josh Camberwell maintains that Catfish embodies a new realisation that documentaries are inherently subjective and that this should be celebrated. Says Camberwell, 'It is a requirement for documentary makers to express a particular viewpoint and give personal responses to the material they are recording.'",
  "F. The popularity and variety of documentaries today is illustrated by the large number of film festivals focusing on the genre around the world. The biggest of all must be the Hot Docs Festival in Canada, which over the years has showcased hundreds of documentaries from more than 50 different countries. Even older is the Hamburg International Short Film Festival. As its name suggests, Hamburg specialises in short films, but one category takes this to its limits – entries may not exceed three minutes in duration. The Short and Sweet Festival is a slightly smaller event held in Utah, USA. The small size of the festival means that for first timers this is the ideal venue to try to get some recognition for their films. Then there is the Atlanta Shortsfest, which is a great event for a wide variety of filmmakers. Atlanta welcomes all established types of documentaries and recognises the growing popularity of animations, with a category specifically for films of this type. These are just a few of the scores of film festivals on offer, and there are more being established every year. All in all, it has never been easier for documentary makers to get their films in front of an audience."
];

const p2QuestionBlocks = [
  {
    title: "Questions 14-19",
    instruction: "Reading Passage 2 has six paragraphs, A-F. Choose the correct heading for each paragraph from the list of headings below. Write the correct number, i-viii, in boxes 14-19 on your answer sheet.",
    type: "matching",
    options: ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii"],
    list: [
      "i. A contrast between two historic approaches to documentary filmmaking",
      "ii. Disagreement between two individual documentary makers",
      "iii. A wide range of opportunities to promote documentary films",
      "iv. A number of criticisms about all documentary filmmaking in the past",
      "v. One film that represented a fresh approach to documentary filmmaking",
      "vi. Some probable future trends in documentary filmmaking",
      "vii. The debate about the origins of documentary filmmaking",
      "viii. The ability of ordinary people to create documentary films for the first time"
    ],
    questions: [
      { id: 14, text: "Paragraph A" },
      { id: 15, text: "Paragraph B" },
      { id: 16, text: "Paragraph C" },
      { id: 17, text: "Paragraph D" },
      { id: 18, text: "Paragraph E" },
      { id: 19, text: "Paragraph F" }
    ]
  },
  {
    title: "Questions 20-23",
    instruction: "Look at the statements (Questions 20-23) and the list of people below. Match each statement with the correct person, A-E. Write the correct letter, A-E, in boxes 20-23 on your answer sheet.",
    type: "matching",
    options: ["A", "B", "C", "D", "E"],
    list: [
      "A. Dr Helmut Fischer",
      "B. Anthony Berwick",
      "C. Paula Murphy",
      "D. Maria Fiala",
      "E. Josh Camberwell"
    ],
    questions: [
      { id: 20, text: "The creation of some new technologies did not change viewers' attitudes towards documentaries as quickly as is sometimes proposed." },
      { id: 21, text: "One set of beliefs and techniques helped to make documentary films academically respectable." },
      { id: 22, text: "The action of putting material on film essentially changes the nature of the original material." },
      { id: 23, text: "Documentary filmmakers have an obligation to include their own opinions about and analysis of the real events that they show in their films." }
    ]
  },
  {
    title: "Questions 24-26",
    instruction: "Complete the summary below. Choose NO MORE THAN TWO WORDS AND A NUMBER from the passage for each answer. Write your answers in boxes 24-26 on your answer sheet.",
    type: "summary",
    text: "There are many festivals for documentary makers. For example, Canada's Hot Docs festival has screened documentaries from more than 50 countries. Meanwhile, the Hamburg Short Film Festival lives up to its name by accepting films no more than [24] long in one of its categories. The Short and Sweet Film Festival is especially good for documentary makers who are [25]. And the Atlanta Shortsfest accepts numerous forms of documentaries including [26], which are becoming more common.",
    questions: [
      { id: 24, text: "Hamburg Short Film Festival lives up to its name by accepting films no more than..." },
      { id: 25, text: "The Short and Sweet Film Festival is especially good for documentary makers who are..." },
      { id: 26, text: "Atlanta Shortsfest accepts numerous forms of documentaries including..." }
    ]
  }
];

let newContent = `export const test17Passages = [
  { id: 1, title: "READING PASSAGE 1", subtitle: "Passage 1", content: ["Content here"], questionBlocks: [] },
  { 
    id: 2, 
    title: "READING PASSAGE 2", 
    subtitle: "Making Documentary Films", 
    content: ${JSON.stringify(p2Content, null, 4)}, 
    questionBlocks: ${JSON.stringify(p2QuestionBlocks, null, 4)} 
  },
  { id: 3, title: "READING PASSAGE 3", subtitle: "Passage 3", content: ["Content here"], questionBlocks: [] }
];

export const test17Answers: Record<number, any> = {
  14: "iv",
  15: "vii",
  16: "i",
  17: "viii",
  18: "v",
  19: "iii",
  20: "D",
  21: "C",
  22: "A",
  23: "E",
  24: "three minutes",
  25: "first timers",
  26: "animations"
};

export const test17Explanations: Record<number, any> = {
  14: { 
    passageId: 2, 
    highlights: ["documentaries were frequently ignored by critics", "made some people suspicious.", "even supporters", "could not agree on a precise definition", "concerns about the ethics"], 
    explanation: "The paragraph discusses how documentaries were historically ignored, viewed with suspicion, lacked a precise definition, and raised ethical concerns.", 
    detailedExplanation: "Synonyms: criticisms = ignored by critics / suspicious / concerns. in the past = for much of the twentieth century."
  },
  15: { 
    passageId: 2, 
    highlights: ["exactly when the process started is open to question.", "that 1922 starting point has been disputed", "argues that the genre can be traced back as early as 1895"], 
    explanation: "The text discusses the disagreement over when the first documentary was made, contrasting the 1922 claim for Nanook of the North with the 1895 claim.", 
    detailedExplanation: "Synonyms: debate = open to question / disputed / argues. origins = when the process started / starting point / traced back."
  },
  16: { 
    passageId: 2, 
    highlights: ["Cameras were mounted on tripods and subjects rehearsed", "cameras were hand-held; no additional lighting", "and the subjects did not rehearse."], 
    explanation: "The paragraph compares John Grierson's early style (tripods, rehearsed subjects) with the later Direct Cinema movement (hand-held, no rehearsals).", 
    detailedExplanation: "Synonyms: contrast = rejected by / wanted to produce more natural... approaches = style / movement / methods."
  },
  17: { 
    passageId: 2, 
    highlights: ["anyone could now be a filmmaker. Amateurs working from home could compete with professionals in ways never possible before."], 
    explanation: "This paragraph focuses on how cheap digital cameras and platforms allowed non-professionals to start making films.", 
    detailedExplanation: "Synonyms: ordinary people = anyone / amateurs. create = be a filmmaker. for the first time = never possible before."
  },
  18: { 
    passageId: 2, 
    highlights: ["new philosophy of the genre.", "It could be argued that Catfish (2010) was a perfect example of this new trend."], 
    explanation: "The text introduces a new philosophy focused on personal lives and highlights a single film, Catfish, as the prime example of this change.", 
    detailedExplanation: "Synonyms: one film = Catfish. fresh approach = new philosophy / new trend. represented = perfect example."
  },
  19: { 
    passageId: 2, 
    highlights: ["large number of film festivals", "These are just a few of the scores of film festivals on offer", "never been easier for documentary makers to get their films in front of an audience."], 
    explanation: "This paragraph lists various film festivals around the world that give filmmakers a chance to show their work to audiences.", 
    detailedExplanation: "Synonyms: wide range = large number / scores of. opportunities to promote = film festivals / get their films in front of an audience."
  },
  20: { 
    passageId: 2, 
    highlights: ["innovations immediately transformed what the public expected to see in a documentary isn\\'t entirely accurate."], 
    explanation: "In Paragraph D, Maria Fiala points out that innovations didn't immediately transform public expectations.", 
    detailedExplanation: "Synonyms: new technologies = innovations. viewers' attitudes = what the public expected to see. quickly = immediately. did not change... isn't entirely accurate."
  },
  21: { 
    passageId: 2, 
    highlights: ["the principles and methods of Direct Cinema brought documentaries to the attention of universities and film historians"], 
    explanation: "In Paragraph C, Paula Murphy states that Direct Cinema's methods brought documentaries serious scholarly attention.", 
    detailedExplanation: "Synonyms: set of beliefs and techniques = principles and methods. academically respectable = attention of universities and film historians / serious scholarly analysis."
  },
  22: { 
    passageId: 2, 
    highlights: ["as soon as you record an incident on camera, you are altering its reality in a fundamental way."], 
    explanation: "In Paragraph A, Dr Helmut Fischer says recording an incident essentially alters its reality.", 
    detailedExplanation: "Synonyms: putting material on film = record an incident on camera. essentially changes = altering... in a fundamental way. nature of the original material = its reality."
  },
  23: { 
    passageId: 2, 
    highlights: ["It is a requirement for documentary makers to express a particular viewpoint and give personal responses to the material"], 
    explanation: "In Paragraph E, Josh Camberwell argues documentary makers must express personal viewpoints and responses.", 
    detailedExplanation: "Synonyms: obligation = requirement. own opinions = particular viewpoint / personal responses."
  },
  24: { 
    passageId: 2, 
    highlights: ["entries may not exceed three minutes in duration."], 
    explanation: "Paragraph F mentions Hamburg accepts entries that 'may not exceed three minutes in duration'.", 
    detailedExplanation: "Synonyms: no more than = may not exceed. long = in duration."
  },
  25: { 
    passageId: 2, 
    highlights: ["for first timers this is the ideal venue"], 
    explanation: "Paragraph F states the Short and Sweet Festival is the ideal venue for 'first timers'.", 
    detailedExplanation: "Synonyms: especially good for = ideal venue."
  },
  26: { 
    passageId: 2, 
    highlights: ["Atlanta welcomes all established types", "and recognises the growing popularity of animations"], 
    explanation: "Paragraph F notes the Atlanta Shortsfest recognises the growing popularity of 'animations'.", 
    detailedExplanation: "Synonyms: numerous forms = all established types. becoming more common = growing popularity."
  }
};
`;

fs.writeFileSync('src/data/test17ReadingData.ts', newContent);
console.log("Updated test17ReadingData.ts");
