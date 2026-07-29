const fs = require('fs');
let code = fs.readFileSync('src/data/decemberReadingData.ts', 'utf8');

const p3 = `
  {
    title: "The Globemakers: The Curious Story of an Ancient Craft",
    subtitle: "A review of Peter Bellerby's book The Globemakers",
    content: [
      "In 2008, Peter Bellerby, who lived in London, wanted to give his father a model globe for his eightieth birthday. What seemed simple enough to start with triggered an almost obsessive, decade-long journey, marked by a series of obstacles that would have deterred anyone less determined. It ended with his establishing the world’s only bespoke globemaking company.",
      "The first surprise in The Globemakers, Bellerby's account of this impulsive enterprise, is that obtaining such a globe was not simply a matter of a quick online order and a repressed sigh at the shipping costs. After all, contrary to stubbornly held popular views of our ancestors' geographical ignorance, we have known that the world is spherical since at least the 6th century BCE. The ancient Greek philosopher Plato in his work Phaedo likened it to a leather ball, while the accolade of producing the first recorded globe goes to the ancient Greek philosopher Crates of Mallus, who is said to have made one in around 150 BCE. Surely, Bellerby reasoned, a good-quality globe wouldn't be difficult to find.",
      "Nearly two millennia later, however, it seemed that the art of globemaking had been largely forgotten. Bellerby came across shoddy commercial versions designed for school classrooms and genuine antiques in auction houses that would have bust his budget. Even his trips to Morocco and India, where surely the knowledge of artisan cartographers* had been preserved, drew a blank.",
      "Not one to be easily thwarted, Bellerby decided to make his own good-quality globe. In the process, almost everything that could possibly go wrong did so. Even the shape of the Earth posed a problem, as it is not quite a perfect sphere, but oblate (slightly flattened at the poles). Having decided to compromise and opt for two half-spherical pieces that could be fitted together, he was unable to discover anyone capable of casting moulds with sufficient accuracy to ensure that he would not be left with two half-spheres that were not quite the same circumference. Even after he eventually resolved this issue, extracting these from the moulds resulted in piles of cracked plaster of Paris** and clouds of choking dust in the workshop he had set up at the rear of his house.",
      "This series of abortive experiments taught Bellerby a lot about the challenges of making globes, which he communicates here to the reader. Finding just the right way to prise the globes from the mould – a high-end air compressor finally did the trick – and locating the right paper and inks with which to make the gores (the sections of flat sheet mapping that are pasted onto the spherical globe) without the ink seeping out to create a mushy, unreadable mess took months and an alarming chunk out of his bank balance. Bellerby’s frustration at the painstaking process of attaching the gores to the globe surface – after having found a glue with precisely the right adhesive qualities – is palpable. Right at the end of the process, he learnt that the paper had stretched slightly and so the final one overlapped the first by a centimetre (which may not seem a great deal, but when that represents 2 per cent of the Earth’s diameter, it’s equivalent to obliterating the Himalayas or wiping out Chile).",
      "Bellerby's account of the technical challenges of globe production is interspersed with a series of interludes on great globemakers of the past and cartographic history in general. Purists might wish for more map-making details, but Bellerby clearly found a kindred spirit in Martin Behaim. He was the Nuremberg entrepreneur who in 1492 created the Erdapfel, the world's oldest surviving globe, beautifully finished by a workshop of painters and other craftsmen, only to find that the explorer Christopher Columbus had stumbled upon the Americas the very same year, rendering his masterpiece instantly out of date. Something of Bellerby's unflinching ambition is reflected in the even more heroic efforts of the Italian cartographer Vincenzo Coronelli, who, in the seventeenth century, created two globes for Louis XIV of France. It took him twenty years to complete the monstrous pair, whose vast bulk – each with a diameter of around four metres – can still be admired in the National Library of France in Paris.",
      "Although a celebration of the revival of an ancient craft, Bellerby's book is also a lament for the fading away of centuries-old traditions. When he embarked on his globemaking odyssey, he struggled to find artisans with the skills to make the right moulds for the globes or foundries that could shape the meridians (the metal frames which girdle globes) in just the right way. Although he finally located the right craftsmen, some simply dropping in, serendipitously, to his workshop (by now in more suitable premises than his back room), many of these have now retired or passed away.",
      "Bellerby's father finally did receive his eightieth birthday present, albeit two years late. Bellerby went on to found a company which now turns out over six hundred globes a year for customers who can have their own tiny village marked or more unusual requests fulfilled. His book, beautifully illustrated with photographs of the various stages of his venture and a few illustrations of historic globes and maps, is hardly a blueprint for commercial success. But it is more than enough to stir up admiration for the craftsmanship of the great mapmakers of the past and the obsessive determination of a modern successor who revived their almost moribund art."
    ],
    questionBlocks: [
      {
        type: "summary-options",
        instruction: "Complete the summary using the list of words, A-J, below.",
        title: "Questions 27-32\nA birthday gift",
        startQuestion: 27,
        endQuestion: 32,
        options: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
        optionsList: [
          { letter: 'A', text: 'educational use' },
          { letter: 'B', text: 'rare materials' },
          { letter: 'C', text: 'inferior makes' },
          { letter: 'D', text: 'product exchange markets' },
          { letter: 'E', text: 'necessary skills' },
          { letter: 'F', text: 'international' },
          { letter: 'G', text: 'challenging task' },
          { letter: 'H', text: 'memorable object' },
          { letter: 'I', text: 'internet purchase' },
          { letter: 'J', text: 'numerous problems' }
        ],
        text: "Peter Bellerby's plan to give his father a globe for his birthday was an unexpectedly {27} for which he had to overcome {28} .\n\nHe soon learnt that a straightforward {29} would not be possible. Some {30} that had been intended for {31} were available, as were some expensive antique globes, but these were beyond his budget. He even travelled to places where people might still have the {32} , but Bellerby could not find what he wanted."
      },
      {
        type: "choice",
        options: ["YES", "NO", "NOT GIVEN"],
        instruction: "Do the following statements agree with the claims of the writer in Reading Passage 3?",
        title: "Questions 33-36",
        startQuestion: 33,
        endQuestion: 36,
        questions: [
          { id: 33, text: "The assumption today that people in the past knew very little about geography is correct." },
          { id: 34, text: "Plato was criticised for saying the world was shaped like a leather ball." },
          { id: 35, text: "The globe made by Crates of Mallus was an accurate representation of the known world." },
          { id: 36, text: "Bellerby assumed he would have few problems locating a well-made globe." }
        ]
      },
      {
        type: "mcq",
        instruction: "Choose the correct letter, A, B, C or D.",
        title: "Questions 37-40",
        startQuestion: 37,
        endQuestion: 40,
        questions: [
          {
            id: 37,
            text: "When Bellerby had to attach the gores to the globe surface,",
            options: [
              "A he decided it was best to work quickly.",
              "B he became aware of an unexpected issue.",
              "C he was worried about the quality of his materials.",
              "D he nearly gave up the whole project."
            ]
          },
          {
            id: 38,
            text: "The reviewer mentions other globe makers of the past because",
            options: [
              "A Bellerby was particularly inspired by them.",
              "B their achievements are not widely known.",
              "C Bellerby had something in common with each of them.",
              "D their difficulties could have been avoided."
            ]
          },
          {
            id: 39,
            text: "What point is made about Bellerby in the seventh paragraph?",
            options: [
              "A He had long working relationships with numerous craftsmen.",
              "B He understands the lack of interest in traditional crafts.",
              "C He appreciates the importance of careful planning.",
              "D He regrets the loss of many globe-making skills."
            ]
          },
          {
            id: 40,
            text: "What does the reviewer say about Bellerby's book in the final paragraph?",
            options: [
              "A It does not tell you how to create a profitable business.",
              "B It overlooks some important mapmakers.",
              "C It fails to discuss the future of globe-making.",
              "D It does not give enough details about individual customers."
            ]
          }
        ]
      }
    ]
  }
`;

const regex = /\{\s*title:\s*"December Reading Passage 3"[\s\S]*?\}\s*\]\s*\}/;
code = code.replace(regex, p3.trim());

const p3Ans = `
  "27": "G",
  "28": "J",
  "29": "I",
  "30": "C",
  "31": "A",
  "32": "E",
  "33": "NO",
  "34": "NOT GIVEN",
  "35": "NOT GIVEN",
  "36": "YES",
  "37": "B",
  "38": "C",
  "39": "D",
  "40": "A"
`;

code = code.replace(
  /export const decemberAnswers: Record<string, string> = {[\s\S]*?};/,
  (match) => match.replace(/};/, p3Ans + "\n};")
);

fs.writeFileSync('src/data/decemberReadingData.ts', code);
