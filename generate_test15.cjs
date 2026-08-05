const fs = require('fs');

const test15Passages = [
  {
    id: 1,
    title: "Reading Passage 1",
    subtitle: "Katherine Mansfield",
    content: [
      "Katherine Mansfield was a modernist writer of short fiction who was born and brought up in New Zealand.",
      "Katherine Mansfield Beauchamp Murry was born in 1888, into a prominent family in Wellington, New Zealand. She became one of New Zealand's best-known writers, using the pen name of Katherine Mansfield. The daughter of a banker, and born into a middle-class family, she was also a first cousin of Countess Elizabeth von Arnim, a distinguished novelist in her time. Mansfield had two older sisters and a younger brother. Her father, Harold Beauchamp, went on to become the chairman of the Bank of New Zealand. In 1893, the Mansfield family moved to Karori, a suburb of Wellington, where Mansfield would spend the happiest years of her childhood; she later used her memories of this time as an inspiration for her Prelude story.",
      "Her first published stories appeared in the High School Reporter and the Wellington Girls' High School magazine in 1898 and 1899. In 1902, she developed strong feelings for a musician who played the cello, Arnold Trowell, although her feelings were not, for the most part, returned. Mansfield herself was an accomplished cellist, having received lessons from Trowell's father. Mansfield wrote in her journals of feeling isolated to some extent in New Zealand, and, in general terms, of her interest in the Maori people (New Zealand's native people), who were often portrayed in a sympathetic light in her later stories, such as How Pearl Button Was Kidnapped.",
      "She moved to London in 1903, where she participated in Queen's College, along with her two sisters. Mansfield recommenced playing the cello, an occupation that she believed, during her time at Queen's, she would take up professionally. She also began contributing to the college newspaper, with such a dedication to it that she eventually became its editor. She was particularly interested in the works of the French writers of this period and the 19th-century British writer, Oscar Wilde, and she was appreciated amongst fellow students at Queen's for her lively and charismatic approach to life and work. She met fellow writer Ida Baker, a South African, at the college, and the pair became lifelong friends. Mansfield did not actively support the suffragette movement in the UK. Women in New Zealand had gained the right to vote in 1893.",
      "Mansfield first began journeying into other parts of Europe in the period 1903-1906, mainly to Belgium and Germany. After finishing her schooling in England, she returned to her New Zealand home in 1906, only then began to write short stories in a serious way. She had several works published in Australia in a magazine called Native Comparison, which was her first paid writing work, and by this time, she had her mind set on becoming a professional writer. It was also the first occasion on which she used the pseudonym 'K. Mansfield.'",
      "Mansfield rapidly grew discontented with the provincial New Zealand lifestyle, and with her family. Two years later, she headed again to London. Her father sent her an annual subsidy of £100 for the rest of her life. In later years, she will express both admiration and disdain for New Zealand in her journals.",
      "In 1911, Mansfield met John Middleton Murry, the Oxford scholar and editor of the literary magazine Rhythm. They were later to marry in 1918. Mansfield became a co-editor of Rhythm, which was subsequently called The Blue Review, in which more of her works were published. She and Murry lived in various houses in England and briefly in Paris. The Blue Review failed to gain enough readers and was no longer published. Their attempt to set up as writers in Paris was cut short by Murry's bankruptcy, which resulted from the failure of this and other journals. Life back in England meant frequently changed addresses and very limited funds.",
      "Between 1915 and 1918, Mansfield moved between England and Bandol, France. She and Murry developed close contact with other well-known writers of the time such as DH Lawrence, Bertrand Russell, and Aldous Huxley. By October 1918, Mansfield had become seriously ill; she had been diagnosed with tuberculosis and was advised to enter a sanatorium. She could no longer spend time with writers in London. In the autumn of 1918, she was so ill that she decided to go to Ospedale in Italy. It was the publication of Bliss and Other Stories in 1920 that was to solidify Mansfield's reputation as a writer.",
      "Mansfield also spent time in Menton, France, as the tenant of her father's cousin at 'The Villa Isola Bella.' There she wrote what she pronounced to be '…the only story that satisfies me to any extent.'",
      "Mansfield produced a great deal of work in the final years of her life, and much of her prose and poetry remained unpublished at her death in 1923. After her death, her husband, Murry, took on the task of editing and publishing her works. His efforts resulted in two additional volumes of short stories, The Doves' Nest and Something Childish, published in 1923 and 1924 respectively, the publication of her Poems as well as a collection of critical writings (Novels and Novelist) and a number of editions of Mansfield's previously unpublished letters and journals."
    ],
    questionBlocks: [
      {
        title: "Questions 1-6",
        instruction: "Do the following statements agree with the information given in Reading Passage 1?\nIn boxes 1 - 6 on your answer sheet, write:\nTRUE if the statement agrees with the information\nFALSE if the statement contradicts the information\nNOT GIVEN if there is no information on this",
        type: "choice",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        questions: [
          { id: 1, text: "The name Katherine Mansfield, that appears on the writer's book, was exactly the same as her origin name." },
          { id: 2, text: "Mansfield won a prize for a story she wrote for the High School Reporter." },
          { id: 3, text: "How Pearl Button Was Kidnapped portrayed Maori people in a favorable way." },
          { id: 4, text: "When Mansfield was at Queen's college, she planned to be a professional writer." },
          { id: 5, text: "Mansfield was unpopular with the other students at Queen's college." },
          { id: 6, text: "In London, Mansfield showed little interest in politics." }
        ]
      },
      {
        title: "Questions 7-13",
        instruction: "Complete the notes below.\nChoose ONE WORD AND/OR A NUMBER from the passage for each answer.",
        type: "summary-input",
        text: "**Katherine Mansfield's adult years**\n\n**{7}**\n- Moved from England back to New Zealand.\n- First paid writing work was in a publication based in **{8}**\n- Her **{9}** and the New Zealand way of life made her feel dissatisfied.\n\n**1911-1919:**\n- Met John Middleton Murry in 1911\n- **{10}** prevents Mansfield and Murry from staying together in Paris\n- Spent time with distinguished **{11}**\n- From 1916, tuberculosis restricted the time she spent in London.\n\n**1920:**\n- Her **{12}** was consolidated when Bliss and Other Stories was published.\n- Wrote several stories at “Villa Isola Bella.”\n\n**1923-1924:**\n- Mansfield's **{13}** published more of her works after her death."
      }
    ]
  },
  {
    id: 2,
    title: "Reading Passage 2",
    subtitle: "Click more for less: Satellite technology is helping farmers boost crop yields.",
    content: [
      "A. For farmers, working out the optimal amount of seed, fertiliser, pesticide and water to scatter on a field can be a matter of luck, despite several harvests. Regular laboratory analyzes of soil and plant samples from various sections of a field can help — but such expertise is costly, and often unavailable. However, a new and cheaper method of doing this analysis is now on offer. Precise prescriptions for growing crops can be obtained quickly, and less expensively, by calculating the amount of electromagnetic radiation reflected from agricultural land. The data is collected by orbiting satellites.",
      "B. Examining the wavelength of radiation that is reflected can reveal, with surprising precision, the properties of the soil, the quality of crop being grown, and the levels in those crops of chlorophyll, various minerals, moisture and other indicators of their quality. If recent and forecast weather data is added, detailed maps can be produced indicating exactly how, where and when crops should be grown. The service usually less than US $15 per hectare for a handful of costs of readings a year, and can increase yields by as much as 10%.",
      "C. Such precision farming using satellite-based intelligence is a relatively new technique. Even so, it is catching on quickly. Five years ago, for example, a French cereal-growers' co-operative called Sevepi purchased a satellite and makes it available to its members in the form of maps of their fields, divided into three or four color-coded zones per hectare. For each zone, the exact and best fertiliser formula is recommended. On top of this, if the amount of rain in the field has already grown quite high early in the season, and heavy showers are expected, an appropriate dose of growth regulator is recommended for each zone (as fragile stems break more easily in downpours). Then, farm vehicles equipped with global-positioning system locators automatically mix and apply the prescribed dose to each area.",
      "D. France is the pioneer in this sort of surveillance. More farmland is analyzed by satellite there than in any other country, according to Infoterra (a subsidiary of EADS Astrium), the firm that is France's largest provider of such information, providing data to companies such as Sevepi. Moreover, Henri Douche, head of Infoterra's agriculture sales in Toulouse, reckons the amount of monitored farmland will increase as weather patterns change and farmers can no longer rely on the past as a guide to the future. When founded by the yield variations that these new weather patterns will bring, even farmers who are afraid of new technology will sign up, he says.",
      "E. Inexpensive data on the productivity of land is advantageous to governments too. Areas where fertilisers and pesticides are being applied excessively can be pinpointed, enabling a reduction in environmental and land-use damage. Says Guy Lafond, an agronomist with Agriculture and Agri-Food Canada, a government agency, says the satellite data it purchases is proving useful for the study of fields with declining productivity in the province of Saskatchewan. Over-application of nitrate fertilisers (which are also a source of greenhouse gases) appears partly responsible. And according to RapidEye, a German satellite operator, some companies are also studying satellite data with a view to selling insurance policies to governments of famine-prone countries that might be threatened by crop failure.",
      "F. In March, RapidEye began selling data that helps forecast harvests. “Too often, farmers limit productivity by managing fields wrongly,” says Fredrick Jung-Rothenhäuser, head of product development at the firm's headquarters in Brandenburg an der Havel. “Our satellites are the first commercial satellites to include the Red-Edge band of the light spectrum, which is sensitive to changes in chlorophyll content. More research will be necessary to realize the full benefits of the Red-Edge band. However, this band can assist in monitoring vegetation health, improving species separation and also help in measuring protein and nitrogen content in biomass.” The company's data, which comes from both Europe and the Americas, breaks field productivity down into patches just five meters square.",
      "G. The advantages that satellite technology provides in terms of precision farming do not have to be restricted to rich countries. In Africa, where many areas have become badly depleted of nutrients, better fertiliser management would help reverse this situation. As a result, the charitable trust World Agroforestry Center, in the city of Nairobi, in Kenya, has begun to build up a collection of radiation patterns derived from around 100,000 samples of African soils. The aim of this work is to help by understanding the potential of these soils to be more agriculturally productive. Once passed on to the International Center for Tropical Agriculture, based in Colombia, South America, it is intended that the information be used to build a database called the 'Digital Soil Map'. When complete, this will provide farmers with free forecasts, developed with regularly updated satellite imagery, across farmland in the poorest countries in Africa. This is information which will almost certainly assist in improving crop yields. For a hunger-ravaged continent, that is good news indeed."
    ],
    questionBlocks: [
      {
        title: "Questions 14–20",
        instruction: "Reading Passage 2 has seven paragraphs, A–G.\nWhich paragraph contains the following information?\nWrite the correct letter, A–G, in boxes 14–20 on your answer sheet.\nYou may use any letter more than once.",
        type: "matching",
        options: ["A", "B", "C", "D", "E", "F", "G"],
        questions: [
          { id: 14, text: "an example of how farmers in one country are now using satellite data to determine fertiliser use" },
          { id: 15, text: "a reference to climate change and its effects" },
          { id: 16, text: "a reference to the effect on the soil of using too much fertiliser" },
          { id: 17, text: "an example of information that will be shared between different countries" },
          { id: 18, text: "mention of the country which is the leader in agricultural technology" },
          { id: 19, text: "a description of an innovation in satellite imaging which requires further study" },
          { id: 20, text: "evidence of the cost-effectiveness of using satellite technology in agriculture" }
        ]
      },
      {
        title: "Questions 21 and 22",
        instruction: "Choose two letters, A–E. Which TWO companies obtain information directly from satellites?",
        type: "mcq",
        options: ["A", "B", "C", "D", "E"],
        questions: [
          { 
            id: 21, 
            text: "A. Sevepi\nB. Infoterra\nC. Agriculture and AgriFood Canada\nD. RapidEye\nE. World Agroforestry Centre\n\nWhich TWO companies obtain information directly from satellites? (First choice)"
          },
          { 
            id: 22, 
            text: "A. Sevepi\nB. Infoterra\nC. Agriculture and AgriFood Canada\nD. RapidEye\nE. World Agroforestry Centre\n\nWhich TWO companies obtain information directly from satellites? (Second choice)"
          }
        ]
      },
      {
        title: "Questions 23–26",
        instruction: "Complete the sentences below.\nChoose NO MORE THAN TWO WORDS from the passage for each answer.",
        type: "summary-input",
        text: "Initially, orbiting satellites are used to measure **{23}** coming from farmland.\n\nFredrick Jung-Rothenhäuser says that additional irregular weather will raise the **{24}** of satellite technology.\n\nAs a result of satellite technology, it may become possible to insure against the threat of **{25}** in some countries.\n\nIn Africa, much of the soil suffers from the loss of **{26}**."
      }
    ]
  },
  {
    id: 3,
    title: "Reading Passage 3",
    subtitle: "Information Theory- the Big Idea",
    content: [
      "Information theory lies at the heart of everything – from DVD players and the genetic code of DNA to the physics of the universe at its most fundamental. It has been central to the development of the science of communication, which enables data to be sent electronically and has therefore had a major impact on our lives.",
      "A. In April 2002 an event took place which demonstrated one of the many applications of information theory. The space probe, Voyager I, launched in 1977, had sent back spectacular images of Jupiter and Saturn and then soared out of the Solar System on a one-way mission to the stars. After 25 years of exposure to the freezing temperatures of deep space, the probe was beginning to show its age. Sensors and circuits were on the brink of failing and NASA experts realized that they had to do something or lose contact with their probe forever. The solution was to get a message to Voyager I to instruct it to use spares to change the failing parts. With the probe 12 billion kilometers from Earth, this was not an easy task. By means of a radio dish belonging to NASA's Deep Space Network, the message was sent out into the depths of space. Even traveling at the speed of light, it took over 11 hours to reach its target, far beyond the orbit of Pluto. Yet, incredibly, the little probe managed to hear the faint call from its home planet, and successfully made the switchover.",
      "B. It was the longest-distance repair job in history, and a triumph for the NASA engineers. But it also highlights the astonishing power of the techniques developed by American communications engineer Claude Shannon, who had died just a year earlier. Born in 1916 in Petoskey, Michigan, Shannon showed an early talent for maths and for building gadgets, and made breakthroughs in the foundations of computer technology while still a student. While at Bell Laboratories, Shannon developed information theory, but shunned the resulting acknowledgment. In the 1940s, he single-handedly created an entire science of communication which has since inveigled its way into a host of applications, from DVDs to satellite communications to bar codes – any area, in short, where data has to be conveyed rapidly yet accurately.",
      "C. This all seems light years away from the down-to-earth uses Shannon originally had for his work, which began when he was a 22-year-old graduate engineering student at the prestigious Massachusetts Institute of Technology in 1939. He set out with an apparently simple aim: to pin down the precise meaning of the concept of 'information'. The most basic form of information, Shannon argued, is whether something is true or false – which can be captured in the binary unit, or 'bit', of the form 1 or 0. Having identified this fundamental unit, Shannon set about defining otherwise vague ideas about information and how to transmit it from place to place. In the process he discovered something surprising: it is always possible to guarantee information will get through random interference – 'noise' – intact.",
      "D. Noise usually means unwanted sounds which interfere with genuine information. Information theory generalizes this idea via theorems that capture the effects of noise with mathematical precision. In particular, Shannon shows that noise sets a limit on the rate at which information can pass along communication channels while remaining error-free. This rate depends on the relative strengths of the signal and noise traveling down the communication channel, and on its capacity (its 'bandwidth'). The resulting limit, given in units of bits per second, is the absolute maximum rate of error-free communication given signal strength and noise level. The trick, Shannon shown, is to find ways of packaging up – 'coding' – information to cope with the ravages of noise, while staying within the information-carrying capacity – 'bandwidth' – of the communication system being used.",
      "E. Over the years scientists have devised many such coding methods, and they have proved crucial in many technological feats. The Voyager spacecraft transmit data using codes which added one extra bit for every single bit of information; the result was an error rate of just one bit in 10,000 – and stunningly clear pictures of the planets. Other codes have become part of everyday life – such as the Universal Product Code, or bar code, which uses a simple error-detecting system that ensures supermarket check-out lasers can read the price even on, say, a crumpled bag of crisps. As recently as 1993, engineers made a major breakthrough by discovering so-called turbo codes – which come very close to Shannon's ultimate limit for the maximum rate that data can be transmitted reliably, and now play a key role in the mobile videophone revolution.",
      "F. Shannon also laid the foundations of more efficient ways of storing information, by stripping out superfluous ('redundant') bits from data which contributed little real information. As mobile phone text messages like 'I CN C U' show, it is often possible to leave out a lot of data without losing much meaning. As with error correction, however, there's a limit beyond which messages become too ambiguous. Shannon showed how to calculate this limit, opening the way to the design of compression methods that cram maximum information into the minimum space."
    ],
    questionBlocks: [
      {
        title: "Questions 27-32",
        instruction: "Reading Passage 3 has six paragraphs, A–F.\nWhich paragraph contains the following information?\nWrite the correct letter A–F in boxes 27-32 on your answer sheet.",
        type: "matching",
        options: ["A", "B", "C", "D", "E", "F"],
        questions: [
          { id: 27, text: "an explanation of the factors affecting the transmission of information" },
          { id: 28, text: "an example of how unnecessary information can be omitted" },
          { id: 29, text: "a reference to Shannon's attitude to fame" },
          { id: 30, text: "details of a machine capable of interpreting incomplete information" },
          { id: 31, text: "a detailed account of an incident involving information theory" },
          { id: 32, text: "a reference to what Shannon initially intended to achieve in his research" }
        ]
      },
      {
        title: "Questions 33-37",
        instruction: "Complete the notes below.\nChoose NO MORE THAN TWO WORDS from the passage for each answer.",
        type: "summary-input",
        text: "**The Voyager I Space Probe**\n\nThe probe transmitted pictures of both **{33}** , then left the **{34}** .\n\nThe freezing temperatures were found to have a negative effect on parts of the space probe. Scientists feared that both the **{35}** were about to stop working.\n\nThe only hope was to tell the probe to replace them with **{36}** – but distance made communication with the probe difficult.\n\nA **{37}** was used to transmit messages at the speed of light.\n\nThe message was picked up by the probe and the switchover took place."
      },
      {
        title: "Questions 38-40",
        instruction: "Do the following statements agree with the information given in Reading Passage 3?\nIn boxes 38-40 on your answer sheet, write:\nTRUE if the statement agrees with the information\nFALSE if the statement contradicts the information\nNOT GIVEN if there is no information on this",
        type: "choice",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        questions: [
          { id: 38, text: "The concept of describing something as true or false was the starting point for Shannon in his attempts to send messages over distances." },
          { id: 39, text: "The amount of information that can be sent in a given time period is determined with reference to the signal strength and noise level." },
          { id: 40, text: "Products have now been developed which can convey more information than Shannon had anticipated as possible." }
        ]
      }
    ]
  }
];

const test15Answers = {
  1: "FALSE",
  2: "NOT GIVEN",
  3: "TRUE",
  4: "FALSE",
  5: "FALSE",
  6: "NOT GIVEN",
  7: "1906",
  8: "Australia",
  9: "family",
  10: "bankruptcy",
  11: "writers",
  12: "reputation",
  13: "husband",
  14: "C",
  15: "D",
  16: "E",
  17: "G",
  18: "D",
  19: "F",
  20: "B",
  21: "B", // Assuming Infoterra and RapidEye are B and D based on options
  22: "D", 
  23: "electromagnetic radiation",
  24: "benefits",
  25: "crop failure",
  26: "nutrients",
  27: "D",
  28: "F",
  29: "B",
  30: "E",
  31: "A",
  32: "C",
  33: "Jupiter, Saturn", 
  34: "Solar System",
  35: "Sensors, circuits",
  36: "spares",
  37: "radio dish",
  38: "TRUE",
  39: "TRUE",
  40: "FALSE"
};

const test15Explanations = {};

const content = `export const test15Passages = ${JSON.stringify(test15Passages, null, 2)};\nexport const test15Answers: Record<number, string> = ${JSON.stringify(test15Answers, null, 2)};\nexport const test15Explanations: Record<number, string> = {};\n`;
fs.writeFileSync('src/data/test15ReadingData.ts', content);
console.log('Done');
