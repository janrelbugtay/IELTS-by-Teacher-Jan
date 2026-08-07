const fs = require('fs');

const passage1 = [
  "A. 16th and 17th centuries saw two great pioneers of modern science: Galileo and Gilbert. The impact of their findings is eminent. Gilbert was the first modern scientist, also the accredited father of the science of electricity and magnetism, an Englishman of learning and a physician at the court of Elizabeth. Prior to him, all that was known of electricity and magnetism was what the ancients knew, nothing more than that the lodestone possessed magnetic properties and that amber and jet, when rubbed, would attract bits of paper or other substances of small specific gravity. However, he is less well-known than he deserves.",
  "B. Gilbert’s birth predated Galileo. Born in an eminent local family in Colchester county in the UK, on May 24, 1544, he went to grammar school, and then studied medicine at St. John’s College, Cambridge, graduating in 1573. Later he traveled in the continent and eventually settled down in London.",
  "C. He was a very successful and eminent doctor. All this culminated in his election to the president of the Royal Science Society. He was also appointed the personal physician to the Queen (Elizabeth I), and later knighted by the Queen. He faithfully served her until her death. However, he didn’t outlive the Queen for long and died on December 10, 1603, only a few months after his appointment as personal physician to King James.",
  "D. Gilbert was first interested in chemistry but later changed his focus due to the large portion of mysticism of alchemy involved (such as the transmutation of metal). He gradually developed his interest in physics after the great minds of the ancient, particularly about the knowledge the ancient Greeks had about lodestones, strange minerals with the power to attract iron. In the meantime, Britain became a major seafaring nation in 1588 when the Spanish Armada was defeated, opening the way to British settlement of America. British ships depended on the magnetic compass, yet no one understood why it worked. Did the pole star attract it, as Columbus once speculated; or was there a magnetic mountain at the pole, as described in Odyssey, which ships would never approach, because the sailors thought its pull would yank out all their iron nails and fittings? For nearly 20 years William Gilbert conducted ingenious experiments to understand magnetism. His works include On the Magnet and Magnetic Bodies, Great Magnet of the Earth.",
  "E. Gilbert’s discovery was so important to modern physics. He investigated the nature of magnetism and electricity. He even coined the word “electric”. Though the early beliefs of magnetism were also largely entangled with superstitions such as that rubbing garlic on lodestone can neutralize its magnetism, one example being that sailors even believed the smell of garlic would even interfere with the action of compass, which is why helmsmen were forbidden to eat it near a ship’s compass. Gilbert also found that metals can be magnetized by rubbing materials such as fur, plastic or the like on them. He named the ends of a magnet “north pole” and “south pole”. The magnetic poles can attract or repel, depending on polarity. In addition, however, ordinary iron is always attracted to a magnet. Though he started to study the relationship between magnetism and electricity, sadly he didn’t complete it. His research of static electricity using amber and jet only demonstrated that objects with electrical charges can work like magnets attracting small pieces of paper and stuff. It is a French guy named du Fay that discovered that there are actually two electrical charges, positive and negative.",
  "F. He also questioned the traditional astronomical beliefs. Though a Copernican, he didn’t express in his quintessential beliefs whether the earth is at the center of the universe or in orbit around the sun. However he believed that stars are not equidistant from the earth , but have their own earthlike planets orbiting around them. The earth is itself like a giant magnet, which is also why compasses always point north. They spin on an axis that is aligned with the earth’s polarity. He even likened the polarity of the magnet to the polarity of the earth and built an entire magnetic philosophy on this analogy. In his explanation, magnetism was the soul of the earth. Thus a perfectly spherical lodestone, when aligned with the earth’s poles, would wobble all by itself in 24 hours. Further, he also believed that suns and other stars wobble just like the earth does around a crystal core, and speculated that the moon might also be a magnet caused to orbit by its magnetic attraction to the earth. This was perhaps the first proposal that a force might cause a heavenly orbit.",
  "G. His research method was revolutionary in that he used experiments rather than pure logic and reasoning like the ancient Greek philosophers did. It was a new attitude toward scientific investigation. Until then, scientific experiments were not in fashion. It was because of this scientific attitude, together with his contribution to our knowledge of magnetism, that a unit of magneto motive force, also known as magnetic potential, was named Gilbert in his honor. His approach of careful observation and experimentation rather than the authoritative opinion or deductive philosophy of others had laid the very foundation for modern science."
];

const highlights = [
  "16th and 17th centuries saw two great pioneers of modern science...",
  "Born in an eminent local family... went to grammar school, and then studied medicine...",
  "culminated in his election to the president... appointed the personal physician to the Queen... and later knighted",
  "Gilbert was first interested in chemistry but later changed his focus...",
  "He investigated the nature of magnetism... found that metals can be magnetized...",
  "He also questioned the traditional astronomical beliefs.",
  "His research method was revolutionary in that he used experiments rather than pure logic...",
  "...he is less well-known than he deserves.",
  "He was a very successful and eminent doctor. All this culminated in... He was also appointed the personal physician to the Queen",
  "Gilbert also found that metals can be magnetized...",
  "he believed that stars are not equidistant from the earth",
  "would wobble all by itself in 24 hours.",
];

highlights.forEach(highlightStr => {
  console.log("----------------------");
  console.log("Highlight:", highlightStr);
  const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const highlightParts = highlightStr.split('...');
  const escapedParts = highlightParts.map(p => escapeRegExp(p.trim())).filter(p => p.length > 0);
  
  let regexString = escapedParts.join('[\\s\\S]*?');
  regexString = regexString.replace(/['\\'’‘]/g, "['\\'’‘]").replace(/["“”]/g, '["“”]');

  const regex = new RegExp(`(${regexString})`, 'i');
  console.log("Regex string:", regexString);
  let matched = false;
  passage1.forEach(p => {
    if (regex.test(p)) {
      matched = true;
      console.log("Matched in passage!");
    }
  });
  if (!matched) {
    console.log("FAILED TO MATCH");
  }
});

