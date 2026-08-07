const fs = require('fs');

const passage3Content = [
  "A. “Never has the whole world had so little to say.” This is the kind of sentiment that most people – including many linguists – might share. But it is not the view of the renowned linguist Noam Chomsky. For him, every language is a variation on a single theme: the Universal Grammar that is genetically programmed into the human brain. To a theoretical linguist, the death of a language is not necessarily a catastrophe. It is merely the loss of one more superficial variation. But to a documentary linguist, the situation looks very different.",
  "B. Michael Krauss, of the University of Alaska, has often complained that linguistics is the only discipline that is presiding over the disappearance of its own subject matter. He estimates that 90 per cent of the world's 6,000 languages are teetering on the brink of extinction. He predicts that by the middle of the next century, only about 600 will be left.",
  "C. Why should we care? The answer is analogous to the reason why we should care about the loss of the ozone layer or the destruction of the rainforests. It is about diversity. Each language is a unique repository of the accumulated thoughts and experiences of a people. If a language dies, a unique vision of the world is lost.",
  "D. In Australia, the situation is particularly acute. Before the arrival of Europeans, there were about 250 languages; now there are barely a dozen that are being passed on to children. Nick Evans, a linguist at the University of Melbourne, has been working with the last speakers of some of these languages. He points out that when you lose a language, you lose more than just words and grammar; you lose a way of thinking. For example, in many Australian Aboriginal languages, there are complex systems of kinship terms that encode the social structure of the community. If the language is replaced by a creole (a simplified contact language), this social knowledge is lost.",
  "E. The task of recording these languages is urgent. But it is also laborious and expensive. It requires a linguist to spend years in the field, learning the language and recording its speakers. This is what is known as “documentary linguistics”. It is a very different activity from the “theoretical linguistics” that dominates most university departments. Theoretical linguists are interested in the abstract rules that govern all languages; they are not interested in the messy details of individual languages.",
  "F. This indifference has had disastrous consequences. In South America and West Africa, where the rate of language loss is just as high as in Australia, there are very few records of the dying languages. In Australia, however, thanks to the efforts of Nick Evans and his colleagues, the record is much better. They have produced grammars and dictionaries of many languages that would otherwise have disappeared without a trace.",
  "G. Technology is helping. Digital recording equipment is now cheap and portable. It is possible to store vast amounts of audio and video data on a computer. But technology is not enough. You still need the linguist to do the analysis. And you need the money to support them. At the moment, the funding for documentary linguistics is pitifully small compared to the funding for theoretical linguistics. Regardless of these changes, and changes soon, we will lose a vital part of our human heritage.",
  "H. In England, another Australian, Peter Austin, has directed one of the world's most active efforts to limit language loss, at the University of London. Austin heads a programme that has trained many documentary linguists in England as well as in language-loss hotspots such as West Africa and South America. Austin and Co. are in no doubt that because languages are unique, even if they do tend to have common underlying features, creating dictionaries and grammars requires prolonged and dedicated work.",
  "I. At linguistics meetings in the US, where the endangered-language issue has of late been something of a flavour of the month, there is growing evidence that not all approaches to the preservation of languages will be particularly helpful. Some linguistic researchers are exploiting the use of new, cheap digital recording equipment. But these are encouraging the 'quick dash' style of recording trips: fly-in, switch on a digital recorder, fly home, download to the hard drive, and store gathered material for future research. That's not quite what some linguists have in mind.",
  "J. Once there, they may face difficulties such as community suspicion. As Nick Evans says, a community who speak an endangered language may have reasons to doubt or even oppose efforts to preserve it. They may have seen support and funding for such work come and go. They may have given up using the language with their children, believing they will benefit from speaking a more widely understood one.",
  "K. Plenty of students continue to be drawn to the intellectual thrill of linguistics fieldwork. That's all the more reason to clear away barriers, contend Evans, Austin, and others. The highest barrier, they agree, is that the linguistics profession's emphasis on theory gradually wears down the enthusiasm of linguists who want to do practical field research. Chomsky, they note, does not despise descriptive linguistics—he believes that good descriptive work requires thorough theoretical understanding and should also contribute to building new theory."
];

let fileContent = fs.readFileSync('src/data/test16ReadingData.ts', 'utf8');

// Replace the content array of passage 3
const regex = /subtitle: "Endangered Languages",\s*content: \[\s*[\s\S]*?\s*\],\s*questionBlocks:/;
const replacement = `subtitle: "Endangered Languages",
    content: ${JSON.stringify(passage3Content, null, 6)},
    questionBlocks:`;

if (regex.test(fileContent)) {
  fileContent = fileContent.replace(regex, replacement);
  fs.writeFileSync('src/data/test16ReadingData.ts', fileContent);
  console.log("Updated passage 3 content in test16ReadingData.ts");
} else {
  console.log("Regex not found in test16ReadingData.ts");
}

