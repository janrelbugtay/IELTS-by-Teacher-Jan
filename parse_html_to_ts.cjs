const fs = require('fs');

const tsContent = `export const test16Passages = [
  {
    id: 1,
    title: "READING PASSAGE 1",
    subtitle: "William Gilbert and Magnetism",
    content: [
      "A. 16th and 17th centuries saw two great pioneers of modern science: Galileo and Gilbert. The impact of their findings is eminent. Gilbert was the first modern scientist, also the accredited father of the science of electricity and magnetism, an Englishman of learning and a physician at the court of Elizabeth. Prior to him, all that was known of electricity and magnetism was what the ancients knew, nothing more than that the lodestone possessed magnetic properties and that amber and jet, when rubbed, would attract bits of paper or other substances of small specific gravity. However, he is less well-known than he deserves.",
      "B. Gilbert’s birth predated Galileo. Born in an eminent local family in Colchester county in the UK, on May 24, 1544, he went to grammar school, and then studied medicine at St. John’s College, Cambridge, graduating in 1573. Later he traveled in the continent and eventually settled down in London.",
      "C. He was a very successful and eminent doctor. All this culminated in his election to the president of the Royal Science Society. He was also appointed the personal physician to the Queen (Elizabeth I), and later knighted by the Queen. He faithfully served her until her death. However, he didn’t outlive the Queen for long and died on December 10, 1603, only a few months after his appointment as personal physician to King James.",
      "D. Gilbert was first interested in chemistry but later changed his focus due to the large portion of mysticism of alchemy involved (such as the transmutation of metal). He gradually developed his interest in physics after the great minds of the ancient, particularly about the knowledge the ancient Greeks had about lodestones, strange minerals with the power to attract iron. In the meantime, Britain became a major seafaring nation in 1588 when the Spanish Armada was defeated, opening the way to British settlement of America. British ships depended on the magnetic compass, yet no one understood why it worked. Did the pole star attract it, as Columbus once speculated; or was there a magnetic mountain at the pole, as described in Odyssey, which ships would never approach, because the sailors thought its pull would yank out all their iron nails and fittings? For nearly 20 years William Gilbert conducted ingenious experiments to understand magnetism. His works include On the Magnet and Magnetic Bodies, Great Magnet of the Earth.",
      "E. Gilbert’s discovery was so important to modern physics. He investigated the nature of magnetism and electricity. He even coined the word “electric”. Though the early beliefs of magnetism were also largely entangled with superstitions such as that rubbing garlic on lodestone can neutralize its magnetism, one example being that sailors even believed the smell of garlic would even interfere with the action of compass, which is why helmsmen were forbidden to eat it near a ship’s compass. Gilbert also found that metals can be magnetized by rubbing materials such as fur, plastic or the like on them. He named the ends of a magnet “north pole” and “south pole”. The magnetic poles can attract or repel, depending on polarity. In addition, however, ordinary iron is always attracted to a magnet. Though he started to study the relationship between magnetism and electricity, sadly he didn’t complete it. His research of static electricity using amber and jet only demonstrated that objects with electrical charges can work like magnets attracting small pieces of paper and stuff. It is a French guy named du Fay that discovered that there are actually two electrical charges, positive and negative.",
      "F. He also questioned the traditional astronomical beliefs. Though a Copernican, he didn’t express in his quintessential beliefs whether the earth is at the center of the universe or in orbit around the sun. However he believed that stars are not equidistant from the earth , but have their own earthlike planets orbiting around them. The earth is itself like a giant magnet, which is also why compasses always point north. They spin on an axis that is aligned with the earth’s polarity. He even likened the polarity of the magnet to the polarity of the earth and built an entire magnetic philosophy on this analogy. In his explanation, magnetism was the soul of the earth. Thus a perfectly spherical lodestone, when aligned with the earth’s poles, would wobble all by itself in 24 hours. Further, he also believed that suns and other stars wobble just like the earth does around a crystal core, and speculated that the moon might also be a magnet caused to orbit by its magnetic attraction to the earth. This was perhaps the first proposal that a force might cause a heavenly orbit.",
      "G. His research method was revolutionary in that he used experiments rather than pure logic and reasoning like the ancient Greek philosophers did. It was a new attitude toward scientific investigation. Until then, scientific experiments were not in fashion. It was because of this scientific attitude, together with his contribution to our knowledge of magnetism, that a unit of magneto motive force, also known as magnetic potential, was named Gilbert in his honor. His approach of careful observation and experimentation rather than the authoritative opinion or deductive philosophy of others had laid the very foundation for modern science."
    ],
    questionBlocks: [
      {
        title: "Questions 1-7",
        instruction: "Reading passage 1 has seven paragraphs A-G. Choose the correct heading for each paragraph from the list of headings below. Write the correct number i-x in boxes 1-7 on your answer sheet.\\n\\nList of Headings\\ni. Early years of Gilbert\\nii. What was new about his scientific research method\\niii. The development of chemistry\\niv. Questioning traditional astronomy\\nv. Pioneers of the early science\\nvi. Professional and social recognition\\nvii. Becoming the president of the Royal Science Society\\nviii. The great works of Gilbert\\nix. His discovery about magnetism\\nx. His change of focus",
        type: "matching",
        options: ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x"],
        questions: [
          { id: 1, text: "Paragraph A" },
          { id: 2, text: "Paragraph B" },
          { id: 3, text: "Paragraph C" },
          { id: 4, text: "Paragraph D" },
          { id: 5, text: "Paragraph E" },
          { id: 6, text: "Paragraph F" },
          { id: 7, text: "Paragraph G" }
        ]
      },
      {
        title: "Questions 8-10",
        instruction: "Do the following statements agree with the information given in Reading Passage 1?\\nIn boxes 8-10 on your answer sheet write:\\nTRUE if the statement agrees with the information\\nFALSE if the statement contradicts the information\\nNOT GIVEN if there is no information on this",
        type: "true-false",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        questions: [
          { id: 8, text: "He is less famous than he should be." },
          { id: 9, text: "He was famous as a doctor before he was employed by the Queen." },
          { id: 10, text: "He lost faith in the medical theories of his time." }
        ]
      },
      {
        title: "Questions 11-13",
        instruction: "Choose THREE letters A-F. Write your answers in boxes 11-13 on your answer sheet.\\nWhich THREE of the following are parts of Gilbert’s discovery?",
        type: "multiple-choice",
        options: ["A. Metal can be transformed into another.", "B. Garlic can remove magnetism.", "C. Metals can be magnetized.", "D. Stars are at different distances from the earth.", "E. The earth wobbles on its axis.", "F. There are two charges of electricity."],
        questions: [
          { id: 11, text: "Question 11" },
          { id: 12, text: "Question 12" },
          { id: 13, text: "Question 13" }
        ]
      }
    ]
  },
  {
    id: 2,
    title: "READING PASSAGE 2",
    subtitle: "Tasmanian Tiger",
    content: [
      "A. Although it was called tiger, it looked like a dog with black stripes on its hack and it was the largest known carnivorous marsupial of modern times. Yet, despite its fame for being one of the most fabled animals in the world, it is one of the least understood of Tasmania's native animals. The scientific name for the Tasmanian tiger is Thylacine and it is believed that they have become extinct in the 20th century.",
      "B. Fossils of thylacines dating from about almost 12 million years ago have been dug up at various places in Victoria, South Australia and Western Australia. They were widespread in Australia 7,000 years ago, but have probably been extinct on the continent for 2,000 years ago. This is believed to be because of the introduction of dingoes around 8,000 years ago. Because of disease, thylacine numbers may have been declining in Tasmania at the time of European settlement 200 years ago, but the decline was certainly accelerated by the new arrivals. The last known Titsmanijin Tiger died in I lobar! Zoo in 193fi and the animal is officially classified as extinct. Technically, this means that it has not been officially sighted in the wild or captivity for 50 years. However, there are still unsubstantiated sightings.",
      "C. Hans Naarding, whose study of animals had taken him around the world, was conducted a survey of a species of endangered migratory bird. The cat he saw that night is now considered as the most credible sighting recorded of thylacine that many believe has been extinct for more than 70 years.",
      "D. “I had to work at night.” Naarding takes up the story. \\"I was in the habit of intermittently shining a spotlight around. The beam fell on an animal in front of the vehicle, less than 10m away. Instead of risky movement by grabbing for a camera, I decided to register very carefully what I was seeing. The animal was about the size of a small shepherd dog, a very healthy male in prime condition. What set it apart from a dog, though, was a slightly sloping hindquarter, with a fairly thick tail being a straight continuation of the backline of the animal. It had 12 distinct stripes on its back, continuing onto its butt. I knew perfectly well what I was seeing. As soon as I reached for the camera, it disappeared into the tea-tree undergrowth and scrub.\\”",
      "E. The director of Tasmania's National Parks at the time, Peter Morrow, decided in his wisdom to keep Naarding's sighting of the thylacine secret for two years. When the news finally broke, it was accompanied by pandemonium. “I was besieged by television crews, including four to five from Japan, and others from the United Kingdom, Germany, New Zealand and South America,” said Naarding.",
      "F. Government and private search parties combed the region, but no further sightings were made. The tiger, as always, had escaped to its lair, a place many insists only in our imagination. But since then, the thylacine has staged something of a comeback, becoming part of Australian mythology.",
      "G. There have been more than 4,000 claimed sightings of the beast since it supposedly died out, and the average claims each year reported to authorities now number 150. Associate professor of zoology at the University of Tasmania, Randolph Rose, has said he dreams of seeing a thylacine. But Rose, who in his 35 years in Tasmanian academia has fielded millions of reports of thylacine sightings, is now convinced that his dream will go unfulfilled.",
      "Q. “The consensus among conservationists is that usually; any animal with a population base of less than 1,000 is headed for extinction within 60 years,” says Rose. “Sixty years ago, there was only one thylacine that we know of, and that was in Hobart Zoo,” he said.",
      "I. Dr. David Pemberton, curator of zoology at the Tasmanian Museum and Art Gallery, whose PhD thesis was on the thylacine, says that despite scientific thinking that 500 animals are required to sustain a population, the Florida panther is down to a dozen or so animals and, while it does have some inbreeding problems, is still ticking along. “I'll take a punt and say that, if we manage to find a thylacine in the scrub, it means that there are 50-plus animals out there.”",
      "J. After all, animals can be notoriously elusive. The strange fish is known as the coelacanth' with its “proto-legs”, was thought to have died out along with the dinosaurs 700 million years ago until a specimen was dragged to the surface in a shark net off the south-east coast of South Africa in 1938.",
      "K. Wildlife Biologist Nick Mooney has the unenviable task of investigating all “sightings” of the tiger totaling 4,000 since the mid-1980s, and averaging about 150 a year. It was Mooney who was first consultation late last month about the authenticity of digital photographic images purportedly taken by a German tourist while on a recent bushwalk in the state. On face value, Mooney says, the account of the sighting, and the two photographs submitted as the proof amount to one of the most convincing cases for the species' survival he has seen.",
      "L. And Mooney has seen it all – the mistakes, the hoaxes, the illusions and the plausible accounts of sightings. Hoaxers aside, most people who report sightings end up believing they have been a thylacine, and are themselves believable to the point they could pass a lie-detector test, according to Mooney. Others, having tabled a creditable report, then became utterly obsessed like the Tasmanian who has registered 99 thylacine sightings to date. Mooney has seen individuals bankrupted by the obsession, and families destroyed. “It is a blind optimism that something is, rather than a cynicism that something isn't,” Mooney says. “If something crosses the road, it's not a case of 'I wonder what that was?' Rather, it is a case of 'that's a thylacine!' It is a bit like a gold prospector's blind faith, 'it has got to be there'.”",
      "M. However, Mooney treats all reports on face value. “I never try to embarrass people or make fools of them. But the fact that I don't pack the car immediately they ring can often be taken as ridicule. Obsessive characters get irate that someone in my position is not out there when they think the thylacine is there.”",
      "N. But Hans Naarding, whose sighting of a striped animal two decades ago was the highlight of “a life of animal spotting”, remains bemused by the time and money people wasted on tiger searches. He says resources would be better applied to save the Tasmanian devil, and help migratory bird populations that are declining as a result of shrinking wetlands across Australia.",
      "O. Could the thylacine still be out there? “Sure,” Naarding says. But he also says any discovery of surviving thylacines would be “rather pointless”. “How do you save a species from extinction? What could you do with it? If there are thylacines out there, they are better off right where they are.”"
    ],
    questionBlocks: [
      {
        title: "Questions 14-17",
        instruction: "Complete the summary below. Choose NO MORE THAN TWO WORDS AND/OR A NUMBER from the passage for each answer.\\n\\nThe Tasmanian tiger, also called thylacine, resembles the look of a dog and has {14} on its fur coat. Many fossils have been found, showing that thylacines had existed as early as {15} years ago. They lived throughout {16} before disappearing from the mainland. And soon after the {17} settled the size of the thylacine population in Tasmania shrunk at a higher speed.",
        type: "summary-completion",
        questions: [
          { id: 14, text: "Question 14" },
          { id: 15, text: "Question 15" },
          { id: 16, text: "Question 16" },
          { id: 17, text: "Question 17" }
        ]
      },
      {
        title: "Questions 18-23",
        instruction: "Look at the following statements (Questions 18-23) and the list of people below, match each statement with the correct person A, B, C or D. NB You may use any letter more than once.\\n\\nList of People\\nA. Hans Naarding\\nB. Randolph Rose\\nC. David Pemberton\\nD. Nick Mooney",
        type: "matching",
        options: ["A", "B", "C", "D"],
        questions: [
          { id: 18, text: "His report of seeing a live thylacine in the wild attracted international interest" },
          { id: 19, text: "Many eye-witnesses' reports are not trusted" },
          { id: 20, text: "It doesn't require a certain number of animals to ensure the survival of a species" },
          { id: 21, text: "There is no hope of finding a surviving Tasmanian tiger" },
          { id: 22, text: "Do not disturb them if there are any Tasmanian tigers still living today" },
          { id: 23, text: "The interpretation of evidence can be affected by people's beliefs" }
        ]
      },
      {
        title: "Questions 24-26",
        instruction: "Choose the correct letter A, B, C or D.",
        type: "multiple-choice",
        options: [
          "A. government and organizations' cooperative efforts to protect",
          "B. thylacine extensive interests to find a living thylacine.",
          "C. increase in the number of reports of thylacine worldwide.",
          "D. growth of popularity of thylacine in literature."
        ],
        questions: [
          { id: 24, text: "Hans Naarding's sighting has resulted in" }
        ]
      },
      {
        title: "Question 25",
        instruction: "Choose the correct letter A, B, C or D.",
        type: "multiple-choice",
        options: [
          "A. it lived in the same period with dinosaurs.",
          "B. has dinosaurs evolved legs.",
          "C. some animals are difficult to catch in the wild.",
          "D. extinction of certain species can be mistaken."
        ],
        questions: [
          { id: 25, text: "The example of the coelacanth is to illustrate" }
        ]
      },
      {
        title: "Question 26",
        instruction: "Choose the correct letter A, B, C or D.",
        type: "multiple-choice",
        options: [
          "A. give some credit as they claim even if they are untrue.",
          "B. acted upon immediately.",
          "C. viewed as equally untrustworthy.",
          "D. questioned and carefully investigated."
        ],
        questions: [
          { id: 26, text: "Mooney believes that all sighting reports should be" }
        ]
      }
    ]
  },
  {
    id: 3,
    title: "READING PASSAGE 3",
    subtitle: "Endangered Languages",
    content: [
      "A. “Never has the whole world had so little to say.” This is the kind of sentiment that most people – including many linguists – might share. But it is not the view of the renowned linguist Noam Chomsky. For him, every language is a variation on a single theme: the Universal Grammar that is genetically programmed into the human brain. To a theoretical linguist, the death of a language is not necessarily a catastrophe. It is merely the loss of one more superficial variation. But to a documentary linguist, the situation looks very different.",
      "B. Michael Krauss, of the University of Alaska, has often complained that linguistics is the only discipline that is presiding over the disappearance of its own subject matter. He estimates that 90 per cent of the world's 6,000 languages ​​are teetering on the brink of extinction. He predicts that by the middle of the next century, only about 600 will be left.",
      "C. Why should we care? The answer is analogous to the reason why we should care about the loss of the ozone layer or the destruction of the rainforests. It is about diversity. Each language is a unique repository of the accumulated thoughts and experiences of a person. If a language dies, a unique vision of the world is lost.",
      "D. In Australia, the situation is particularly acute. Before the arrival of Europeans, there were about 250 languages; now there are barely a dozen that are being passed on to children. Nick Evans, a linguist at the University of Melbourne, has been working with the last speakers of some of these languages. He points out that when you lose a language, you lose more than just words and grammar; you lose a way of thinking. For example, in many Australian Aboriginal languages, there are complex systems of kinship terms that encode the social structure of the community. If the language is replaced by a creole (a simplified contact language), this social knowledge is lost.",
      "E. The task of recording these languages ​​is urgent. But it is also laborious and expensive. It requires a linguist to spend years in the field, learning the language and recording its speakers. This is what is known as “documentary linguistics”. It is a very different activity from the “theoretical linguistics” that dominates most university departments. Theoretical linguists are interested in the abstract rules that govern all languages; they are not interested in the messy details of individual languages.",
      "F. This indifference has had disastrous consequences. In South America and West Africa, where the rate of language loss is just as high as in Australia, there are very few records of the dying languages. In Australia, however, thanks to the efforts of Nick Evans and his colleagues, the record is much better. They have produced grammars and dictionaries of many languages ​​that would otherwise have disappeared without a trace.",
      "G. Technology is helping. Digital recording equipment is now cheap and portable. It is possible to store vast amounts of audio and video data on a computer. But technology is not enough. You still need the linguist to do the analysis. And you need the money to support them. At the moment, the funding for theoretical linguistics is pitifully small compared to the funding for theoretical linguistics. Regardless of these changes, and changes soon, we will lose a vital part of our human heritage."
    ],
    questionBlocks: [
      {
        title: "Questions 27-32",
        instruction: "Do the following statements agree with the views of the author in the Reading Passage? Write in boxes 27-32 on your answer sheet\\nYES if the statement matches the information\\nNO if the statement does not match the information\\nNOT GIVEN if no information is available",
        type: "true-false",
        options: ["YES", "NO", "NOT GIVEN"],
        questions: [
          { id: 27, text: "By 2050 only a small number of languages ​​will be flourishing." },
          { id: 28, text: "Australian academics' efforts to record existing Aboriginal languages ​​have been too limited." },
          { id: 29, text: "The use of technology In language research is proving unsatisfactory in some respects." },
          { id: 30, text: "Chomsky's political views have overshadowed his academic work." },
          { id: 31, text: "Documentary linguistics studies require long-term financial support." },
          { id: 32, text: "Chomsky's attitude to disappearing languages ​​is too emotional." }
        ]
      },
      {
        title: "Questions 33-36",
        instruction: "Choose appropriate options A, B, C or D.",
        type: "multiple-choice",
        options: [
          "A. because he believes anxiety about environmental issues is unfounded.",
          "B. to demonstrate that academics in different disciplines share the same problems.",
          "C. because they exemplify what is wrong with the attitudes of some academics.",
          "D. to make the point that the public should be equally concerned about languages."
        ],
        questions: [
          { id: 33, text: "The writer mentions rainforests and the ozone layer." }
        ]
      },
      {
        title: "Question 34",
        instruction: "Choose appropriate options A, B, C or D.",
        type: "multiple-choice",
        options: [
          "A. They lose the ability to express ideas which are part of their culture.",
          "B. Older and younger members of the community have difficulty communicating.",
          "C. They express their ideas more clearly and concisely than most people.",
          "D. Accessing practical information causes problems for them."
        ],
        questions: [
          { id: 34, text: "What does Nick Evans say about speakers of a creole?" }
        ]
      },
      {
        title: "Question 35",
        instruction: "Choose appropriate options A, B, C or D.",
        type: "multiple-choice",
        options: [
          "A. The English language is widely used by academics and teachers.",
          "B. The documentary linguists who work there were trained by Australians.",
          "C. Local languages ​​are disappearing rapidly in both places.",
          "D. There are now only a few undocumented languages ​​there."
        ],
        questions: [
          { id: 35, text: "What is similar about West Africa and South America, from the linguist's point of view?" }
        ]
      },
      {
        title: "Question 36",
        instruction: "Choose appropriate options A, B, C or D.",
        type: "multiple-choice",
        options: [
          "A. linguists are failing to record languages ​​before they die out.",
          "B. linguists have made poor use of improvements in technology.",
          "C. linguistics has declined in popularity as an academic subject.",
          "D. linguistics departments are underfunded in most universities."
        ],
        questions: [
          { id: 36, text: "Michael Krauss has frequently pointed out that" }
        ]
      },
      {
        title: "Questions 37-40",
        instruction: "Complete each sentence with the correct ending A-G below.\\nWrite the correct letter A-G.\\n\\nList of Endings\\nA. even though it is in danger of disappearing.\\nB. provided that it has a strong basis in theory.\\nC. although it may share certain universal characteristics\\nD. because there is a practical advantage to it\\nE. so long as the drawbacks are clearly understood.\\nF. in spite of the prevalence of theoretical linguistics.\\nG. until they realize what is involved",
        type: "matching",
        options: ["A", "B", "C", "D", "E", "F", "G"],
        questions: [
          { id: 37, text: "Linguists like Peter Austin believe that every language is unique" },
          { id: 38, text: "Nick Evans suggests a community may resist attempts to save its language" },
          { id: 39, text: "Many young researchers are interested in doing practical research" },
          { id: 40, text: "Chomsky supports work in descriptive linguistics" }
        ]
      }
    ]
  }
];
`;
fs.writeFileSync('src/data/test16ReadingData.ts', tsContent);
console.log("Created test16ReadingData.ts");

const tsContent17 = `export const test17Passages = [
  { id: 1, title: "READING PASSAGE 1", subtitle: "Passage 1", content: ["Content here"], questionBlocks: [] },
  { id: 2, title: "READING PASSAGE 2", subtitle: "Passage 2", content: ["Content here"], questionBlocks: [] },
  { id: 3, title: "READING PASSAGE 3", subtitle: "Passage 3", content: ["Content here"], questionBlocks: [] }
];`;
fs.writeFileSync('src/data/test17ReadingData.ts', tsContent17);

const tsContent18 = `export const test18Passages = [
  { id: 1, title: "READING PASSAGE 1", subtitle: "Passage 1", content: ["Content here"], questionBlocks: [] },
  { id: 2, title: "READING PASSAGE 2", subtitle: "Passage 2", content: ["Content here"], questionBlocks: [] },
  { id: 3, title: "READING PASSAGE 3", subtitle: "Passage 3", content: ["Content here"], questionBlocks: [] }
];`;
fs.writeFileSync('src/data/test18ReadingData.ts', tsContent18);

