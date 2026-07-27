const fs = require('fs');

const explanationsRaw = `Question 1: dust
Question Prompt: has a large bulbous nose with swollen nostrils that keep 1 ..................................... out
Highlighted Passage Text: "The swollen nostrils of the nose serve several purposes: they filter out dust and cool the blood during hot, dry summers..."
Synonym & Paraphrase Mapping:
Locator Keywords: swollen nostrils anchors the exact sentence.
The Paraphrase (The Action): The phrasal verb keep out is expressed in the passage using the synonym filter out.
The Target Word (The Answer): Since the nostrils filter out dust, this is the exact particle being kept out.

Question 2: blood
Question Prompt: lower the temperature of its 2 ..................................... in summer
Highlighted Passage Text: "...they filter out dust and cool the blood during hot, dry summers..."
Synonym & Paraphrase Mapping:
Locator Keywords: in summer aligns with during hot, dry summers.
The Paraphrase (The Action): The prompt's phrase lower the temperature of is a direct synonym for the verb cool.
The Target Word (The Answer): The noun receiving this action is blood.

Question 3: coat
Question Prompt: grows a thick 3 ..................................... in winter, which it loses in spring
Highlighted Passage Text: "Other seasonal adaptations include a heavy winter coat that the saiga sheds when the weather warms up."
Synonym & Paraphrase Mapping:
Locator Keywords: in winter locates the seasonal change.
The Paraphrase (The Action): The adjective thick maps to heavy; the phrase loses in spring is paraphrased as sheds when the weather warms up.
The Target Word (The Answer): The physical adaptation described is the animal's winter coat.

Question 4: horns
Question Prompt: poaching, especially for the 4 ..................................... of male saiga
Highlighted Passage Text: "Male saiga are a particular target, because their horns are highly prized by traditional medicine practitioners."
Synonym & Paraphrase Mapping:
Locator Keywords: male saiga points directly to this sentence.
The Paraphrase (The Action): The concept of poaching, especially for is conveyed by stating they are a particular target, because their [part] are highly prized.
The Target Word (The Answer): The specific body part targeted is the horns.

Question 5: habitat
Question Prompt: expansion of farms and settlements, causing reduction in the size of the saiga's 5 ....................................
Highlighted Passage Text: "Another threat to the survival of the saiga is loss of habitat, as a result of agricultural expansion and human settlement."
Synonym & Paraphrase Mapping:
Locator Keywords: expansion of farms and settlements paraphrases agricultural expansion and human settlement.
The Paraphrase (The Action): The phrase causing reduction in the size of represents the loss of space.
The Target Word (The Answer): The natural environment being lost is their habitat.

Question 6: routes
Question Prompt: loss of access to the 6 ..................................... which they use for migration
Highlighted Passage Text: "Physical barriers such as railways, pipelines and fences can block the seasonal migration routes of this transboundary species."
Synonym & Paraphrase Mapping:
Locator Keywords: use for migration connects to seasonal migration.
The Paraphrase (The Action): The phrase loss of access to is expressed by the verb block (created by physical barriers).
The Target Word (The Answer): The pathways being blocked are the routes.

Question 7: streams
Question Prompt: climate change, causing the disappearance of 7 ..................................... which the saiga relied on
Highlighted Passage Text: "...many of the smaller streams that the species normally depended on have dried up and vanished."
Synonym & Paraphrase Mapping:
Locator Keywords: The phrasal verb relied on is an exact synonym for depended on.
The Paraphrase (The Action): The noun disappearance is described dynamically as dried up and vanished.
The Target Word (The Answer): The water sources that vanished are the streams.

Question 8: FALSE
Question Prompt: Today, numbers of saiga are distributed evenly across four nations in Central Asia: Kazakhstan, Russia, Mongolia and Uzbekistan.
Highlighted Passage Text: "Today, the saiga is largely confined to a single country: Kazakhstan. This country is estimated to be home to well over 90% of the global saiga population..."
Synonym & Paraphrase Mapping:
Locator Keywords: Kazakhstan, Russia, Mongolia and Uzbekistan anchor the geographic distribution.
The Paraphrase (The Action): The prompt claims numbers are distributed evenly, but the text states they are largely confined to a single country (holding well over 90%).
The Target Word (The Answer): Because the passage directly contradicts the claim of even distribution, the answer is FALSE.

Question 9: FALSE
Question Prompt: For most of the 20th century, the population of saiga were falling.
Highlighted Passage Text: "...numbers steadily recovered throughout most of the 20th century."
Synonym & Paraphrase Mapping:
Locator Keywords: most of the 20th century anchors the timeframe.
The Paraphrase (The Action): The prompt states populations were falling, whereas the text explicitly states they steadily recovered (increasing).
The Target Word (The Answer): Because "falling" contradicts "recovered", the answer is FALSE.

Question 10: TRUE
Question Prompt: Efforts to protect rhinos in Africa had a significant effect on saiga populations.
Highlighted Passage Text: "Poaching reached epidemic levels after misguided conservationists tried to relieve the pressure on threatened African rhinos by actively encouraging the use of saiga horns... Male saiga were almost wiped out..."
Synonym & Paraphrase Mapping:
Locator Keywords: rhinos in Africa matches African rhinos.
The Paraphrase (The Action): Efforts to protect is paraphrased as trying to relieve the pressure on threatened species; had a significant effect is shown by the consequence that saiga were almost wiped out.
The Target Word (The Answer): Since the passage confirms this cause-and-effect relationship, the answer is TRUE.

Question 11: NOT GIVEN
Question Prompt: Unpredictable fluctuations in climate are threatening the wildlife of Central Asia more than in other parts of the world.
Highlighted Passage Text: "...saiga struggle to cope with temperature extremes and unpredictable fluctuations in climate."
Synonym & Paraphrase Mapping:
Locator Keywords: Unpredictable fluctuations in climate appears word-for-word.
The Paraphrase (The Action): The text confirms that climate fluctuations threaten the saiga in Central Asia.
The Target Word (The Answer): There is no mention or comparison regarding whether this threat is greater more than in other parts of the world. Therefore, it is NOT GIVEN.

Question 12: TRUE
Question Prompt: The Altyn Dala Conservation Initiative was formed for the benefit of a number of different animals.
Highlighted Passage Text: "Its purpose is to protect and restore Kazakhstan's steppe, semi-desert and desert ecosystems and the many species they support, including the critically endangered saiga."
Synonym & Paraphrase Mapping:
Locator Keywords: Altyn Dala Conservation Initiative locates the project goals.
The Paraphrase (The Action): For the benefit of maps to protect and restore; a number of different animals is expressed as the many species they support.
The Target Word (The Answer): Because the text confirms the initiative supports multiple species beyond just the saiga, the answer is TRUE.

Question 13: NOT GIVEN
Question Prompt: The Altyn Dala Conservation Initiative's recognition as a World Restoration Flagship project attracted additional international funding for the scheme.
Highlighted Passage Text: "In 2022 the United Nations recognised the initiative as a World Restoration Flagship project, an accolade reserved for the ten best examples of large-scale ecosystem restoration around the globe."
Synonym & Paraphrase Mapping:
Locator Keywords: World Restoration Flagship project locates the award.
The Paraphrase (The Action): The passage details the prestige of the accolade.
The Target Word (The Answer): The text never mentions whether this recognition attracted additional international funding. Therefore, it is NOT GIVEN.

Reading Passage 2: The problems of getting around the city of Dar es Salaam
Question 14: NOT GIVEN
Question Prompt: The population of Dar es Salaam is rising more rapidly than was previously predicted.
Highlighted Passage Text: "Its population has increased eightfold since 1980 and swells by half a million people every year. United Nations projections anticipate it will become a megacity within seven years..."
Synonym & Paraphrase Mapping:
Locator Keywords: population of Dar es Salaam and projections/predicted anchor the statistics.
The Paraphrase (The Action): The text confirms rapid population growth and provides future projections.
The Target Word (The Answer): It does not compare current growth rates to what was previously predicted in past forecasts. Therefore, it is NOT GIVEN.

Question 15: FALSE
Question Prompt: Most of the residents of Dares Salaam live in high-rise blocks on the edge of the city.
Highlighted Passage Text: "Today, four out of five of its people live in single-storey informal settlements on the spreading edges of the city..."
Synonym & Paraphrase Mapping:
Locator Keywords: four out of five (most) and on the spreading edges anchor the demographic fact.
The Paraphrase (The Action): The prompt states they live in high-rise blocks (multi-story buildings), but the passage explicitly states they live in single-storey informal settlements.
The Target Word (The Answer): Because "high-rise" contradicts "single-storey", the answer is FALSE.

Question 16: NOT GIVEN
Question Prompt: Residents have been consulted about their views on the suburban rail line in Dares Salaam.
Highlighted Passage Text: "A single suburban rail line serves residents in a few areas to the south but is tiny in the context of the wider city."
Synonym & Paraphrase Mapping:
Locator Keywords: suburban rail line locates the transport type.
The Paraphrase (The Action): The text describes the rail line's limited service area.
The Target Word (The Answer): There is no mention of whether authorities consulted residents about their views regarding it. Therefore, it is NOT GIVEN.

Question 17: TRUE
Question Prompt: The majority of the present residential development in Dar es Salaam is unplanned.
Highlighted Passage Text: "Nearly all the expansion is happening on the periphery, and nearly all takes place informally without any agreed strategy."
Synonym & Paraphrase Mapping:
Locator Keywords: Nearly all matches The majority; expansion equates to development.
The Paraphrase (The Action): The adjective unplanned is paraphrased precisely as informally without any agreed strategy.
The Target Word (The Answer): Because the passage confirms the expansion lacks a formal plan, the answer is TRUE.

Question 18: FALSE
Question Prompt: Dares Salaam's authorities have decided to follow the public transport plan adopted by a large number of African cities.
Highlighted Passage Text: "Unlike many cities on the continent, Dares Salaam isn't trying to build a metro. It has chosen a less exciting but cheaper and more achievable method: the bus."
Synonym & Paraphrase Mapping:
Locator Keywords: many cities on the continent maps to a large number of African cities.
The Paraphrase (The Action): The prompt claims they decided to follow the common plan (metros), but the passage states Unlike other cities, Dar es Salaam isn't trying to build a metro and chose an alternative (buses).
The Target Word (The Answer): Because they chose a different path rather than following the majority, the answer is FALSE.

Question 19: lanes
Question Prompt: the buses use designated 19 ..................................... to cut down on delays
Highlighted Passage Text: "The DART bus rapid transit (BRT) system runs on bus lanes separated from other traffic, mostly in the middle of the road to reduce stoppages."
Synonym & Paraphrase Mapping:
Locator Keywords: buses use/runs on and cut down on delays locate the system features.
The Paraphrase (The Action): The adjective designated is paraphrased as separated from other traffic; to cut down on delays maps directly to to reduce stoppages.
The Target Word (The Answer): The dedicated road sections used are the lanes.

Question 20: boarding
Question Prompt: passengers pay fares before 20 ...................................
Highlighted Passage Text: "Ticket purchase and control takes place at stations prior to boarding..."
Synonym & Paraphrase Mapping:
Locator Keywords: pay fares equates to Ticket purchase.
The Paraphrase (The Action): The preposition before is synonymous with the formal phrase prior to.
The Target Word (The Answer): The action that occurs after ticket purchase is boarding.

Question 21: wheelchairs
Question Prompt: passengers in 21 ..................................... can use every part of the system
Highlighted Passage Text: "...the buses are step-free, which means the entire route is accessible to people using wheelchairs or who are travelling with baby buggies."
Synonym & Paraphrase Mapping:
Locator Keywords: can use every part of the system maps to the entire route is accessible.
The Paraphrase (The Action): The prompt's phrase passengers in refers to people using specific mobility devices.
The Target Word (The Answer): The specific group mentioned alongside baby buggies is people using wheelchairs.

Question 22: fuel
Question Prompt: the temperature control is sometimes not activated in order to reduce 22 ..................................... use
Highlighted Passage Text: "...complaining that drivers often refuse to turn on the air conditioning to save fuel."
Synonym & Paraphrase Mapping:
Locator Keywords: temperature control is sometimes not activated paraphrases drivers refusing to turn on the air conditioning.
The Paraphrase (The Action): The phrase in order to reduce... use is expressed concisely by the infinitive verb to save.
The Target Word (The Answer): The resource being conserved is fuel.

Question 23: flood
Question Prompt: insufficient number of vehicles are available due to the effects of a severe 23 ....................................
Highlighted Passage Text: "A shortage of buses after a serious flood at the main depot during the rainy season means the system is carrying 200,000 people a day..."
Synonym & Paraphrase Mapping:
Locator Keywords: insufficient number of vehicles is a direct synonym for shortage of buses.
The Paraphrase (The Action): The adjective severe maps to serious; due to the effects of translates to happening after an environmental event.
The Target Word (The Answer): The weather event that caused the shortage is a flood.

Question 24: smartcards
Question Prompt: passengers are unable to use 24 ..................................... because some equipment is out of action
Highlighted Passage Text: "Smartcards can't be used as the mechanical readers aren't working either..."
Synonym & Paraphrase Mapping:
Locator Keywords: some equipment is out of action explains that mechanical readers aren't working.
The Paraphrase (The Action): The phrase are unable to use is an exact paraphrase of the passive construction can't be used.
The Target Word (The Answer): The payment method that is currently non-functional is smartcards (or Smartcards).

Question 25: gates
Question Prompt: tickets have to be checked manually at station 25 ....................................
Highlighted Passage Text: "Staff stand by the gates and tear tickets as people enter."
Synonym & Paraphrase Mapping:
Locator Keywords: checked manually describes human staff who tear tickets by hand.
The Paraphrase (The Action): The location phrase at station [gates] is described as standing by the [gates] as people enter.
The Target Word (The Answer): The specific station entry points where staff stand are the gates.

Question 26: queues
Question Prompt: 26 ..................................... frequently build up during rush hours
Highlighted Passage Text: "As a result, queues are considerable at peak times."
Synonym & Paraphrase Mapping:
Locator Keywords: The noun phrase rush hours is synonymous with peak times.
The Paraphrase (The Action): The prompt's verb phrase frequently build up is described statically by stating they are considerable (large/long).
The Target Word (The Answer): The lines of waiting people are queues.

Reading Passage 3: Rethinking the Past
Question 27: A (pinpointing some key changes in our understanding of prehistory)
Question Prompt: What is the writer doing in the second paragraph?
Highlighted Passage Text: "However, I do think it's possible to draw out some overall messages from the blizzard of archaeological finds in recent years. Two things stand out to me. One is the growing evidence that many supposedly 'advanced' behaviours... can be traced much further back in time than we thought... And the other is that we have badly misunderstood gender roles in prehistoric societies..."
Synonym & Paraphrase Mapping:
Locator Keywords: Paragraph 2 explicitly opens with synthesizing recent finds.
The Paraphrase (The Action): Pinpointing some key changes is demonstrated when the author states "Two things stand out to me" and details two major shifts: tracing advanced behaviors further back and correcting misunderstood gender roles.
The Target Word (The Answer): Option A accurately captures this synthesis of shifts in our historical understanding.

Question 28: A (most developments happen in a gradual way)
Question Prompt: In the sixth paragraph, the writer mentions mobile phones to make the point that
Highlighted Passage Text: "Evolution usually works by incremental steps and so does technology. The first birds weren't great at flying, and the first mobile phones weren't great at, well, anything really."
Synonym & Paraphrase Mapping:
Locator Keywords: mobile phones and Paragraph 6 anchor the analogy.
The Paraphrase (The Action): The core argument is stated in the topic sentence: things work by incremental steps (small, progressive changes). This is the exact definition of happening in a gradual way.
The Target Word (The Answer): Mobile phones are used as a modern example to prove Option A.

Question 29: D (reevaluating research influenced by outdated beliefs about society)
Question Prompt: In the seventh paragraph, the phrase 'unpick this stuff' refers to the task of
Highlighted Passage Text: "Archaeology was invented by individuals with now unfashionably patriarchal views about gender, and those notions fed into their research. Today's researchers are trying to unpick this stuff..."
Synonym & Paraphrase Mapping:
Locator Keywords: unpick this stuff in Paragraph 7 refers back to the preceding sentence.
The Paraphrase (The Action): "This stuff" refers to earlier archaeological research that was biased by unfashionably patriarchal views (outdated beliefs about society). To unpick means to dismantle, re-examine, and reevaluate those biased conclusions.
The Target Word (The Answer): This historical course-correction matches Option D.

Question 30: A (Studying past societies could help us create a fairer society today)
Question Prompt: What does the writer suggest in the final paragraph?
Highlighted Passage Text: "Inequality, authoritarianism and patriarchy aren't inevitable. They're choices, and prehistory shows us that we can choose differently."
Synonym & Paraphrase Mapping:
Locator Keywords: Paragraph 8 (final paragraph) focuses on modern lessons from prehistory.
The Paraphrase (The Action): By stating that oppression and inequality are "not inevitable" and that ancient history proves "we can choose differently," the author suggests we can apply these lessons to organize a more egalitarian (fairer) modern world.
The Target Word (The Answer): This forward-looking takeaway corresponds to Option A.

Question 31: E (Homo sapiens was probably not the only species capable of sophisticated workmanship.)
Question Prompt: The findings at Kalambo Falls revealed that
Highlighted Passage Text: "...researchers found buried logs that had been shaped with stone tools so that they interlocked... That's almost 200,000 years before our species, Homo sapiens, evolved."
Synonym & Paraphrase Mapping:
Locator Keywords: Kalambo Falls locates the wooden structure discovery.
The Paraphrase (The Action): Logs shaped to interlock represent sophisticated workmanship. Because this occurred 200,000 years before Homo sapiens existed, it proves that an older, extinct hominin species created them.
The Target Word (The Answer): This evidence directly supports Option E.

Question 32: F (other species managed to survive in harsh environments before the arrival of Homo sapiens.)
Question Prompt: Evidence from high-altitude regions suggests that
Highlighted Passage Text: "...extinct hominins such as the Denisovans lived on the frozen heights of high-altitude regions 200,000 years ago - upending the old notion that such environments were only settled by modern humans..."
Synonym & Paraphrase Mapping:
Locator Keywords: high-altitude regions locates the Denisovan findings.
The Paraphrase (The Action): The frozen heights represents harsh environments; Denisovans living there 200,000 years ago proves that other species managed to survive there before the arrival of Homo sapiens (modern humans).
The Target Word (The Answer): This refutation of old settlement theories matches Option F.

Question 33: D (experts may have been mistaken about who looked for food in early human communities.)
Question Prompt: An academic publication from June 2023 shows that
Highlighted Passage Text: "Perhaps the most dramatic was the demolition of 'Man the Hunter'. ... a meta-analysis published in June 2023 ... found women hunted in 80 per cent of them."
Synonym & Paraphrase Mapping:
Locator Keywords: June 2023 locates the meta-analysis on foraging societies.
The Paraphrase (The Action): Looked for food is a paraphrase of hunted; disproving the "Man the Hunter" myth by showing women hunted in 80% of foraging societies proves that experts may have been mistaken about gender roles in food gathering.
The Target Word (The Answer): This statistical revelation matches Option D.

Question 34: B (previous assumptions about who had power in the prehistoric world were inaccurate.)
Question Prompt: Analysis of a 4000-year-old Iberian leader indicates that
Highlighted Passage Text: "...an Iberian leader from around 4000 years ago turned out to be female, not male as many had assumed..."
Synonym & Paraphrase Mapping:
Locator Keywords: 4000-year-old Iberian leader anchors the specific tooth protein analysis.
The Paraphrase (The Action): A leader is someone who had power. The fact that researchers previously assumed this ruler was male proves that previous assumptions regarding prehistoric governance were inaccurate.
The Target Word (The Answer): This discovery aligns with Option B.

Question 35: NO
Question Prompt: It seems likely that the Neanderthals' cave paintings were the first examples of artwork ever created.
Highlighted Passage Text: "We have had evidence for a long time now that Neanderthals painted on cave walls. Even earlier species, such as Homo erectus, may also have made art..."
Synonym & Paraphrase Mapping:
Locator Keywords: Neanderthals' cave paintings and first examples of artwork locate the artistic timeline.
The Paraphrase (The Action): The prompt asserts Neanderthals created the first artwork, but the text states that Even earlier species (like Homo erectus) likely produced art before them.
The Target Word (The Answer): Because the existence of older artists contradicts the claim that Neanderthals were first, the answer is NO.

Question 36: NOT GIVEN
Question Prompt: It is very rare to find prehistoric artwork carved onto shells.
Highlighted Passage Text: "...for example by engraving patterns on shells."
Synonym & Paraphrase Mapping:
Locator Keywords: engraving patterns on shells maps to artwork carved onto shells.
The Paraphrase (The Action): The passage mentions shell engraving as a potential artistic medium used by Homo erectus.
The Target Word (The Answer): The text never comments on the frequency of these discoveries or whether finding them in the archaeological record is very rare. Therefore, it is NOT GIVEN.

Question 37: NOT GIVEN
Question Prompt: The methods which the researchers used to examine the Rising Star cave system were rather unconventional.
Highlighted Passage Text: "...in the Rising Star cave system in South Africa where the H. naledi remains were found, researchers have found what seem to be etchings..."
Synonym & Paraphrase Mapping:
Locator Keywords: Rising Star cave system locates the H. naledi discussion.
The Paraphrase (The Action): The text notes that researchers discovered potential etchings inside the cave system.
The Target Word (The Answer): There is no information describing the investigative methods used to explore the cave, nor whether those techniques were unconventional. Therefore, it is NOT GIVEN.

Question 38: YES
Question Prompt: It is unclear how old the etchings in the Rising Star cave system are.
Highlighted Passage Text: "...what seem to be etchings... though these have yet to be firmly dated." / "...more evidence is needed: in particular with regard to the dating of the etchings."
Synonym & Paraphrase Mapping:
Locator Keywords: how old maps to dated/dating of the Rising Star etchings.
The Paraphrase (The Action): The phrase It is unclear is paraphrased by stating they have yet to be firmly dated and that more evidence is needed regarding their timeline.
The Target Word (The Answer): Because the passage confirms the age is currently unresolved, the answer is YES.

Question 39: YES
Question Prompt: The means used to publicise the findings from the Rising Star cave system added to the controversy that surrounds them.
Highlighted Passage Text: "The dispute has only been heightened by the way the results were released, in a non-traditional journal that publishes peer reviews publicly..."
Synonym & Paraphrase Mapping:
Locator Keywords: publicise the findings maps to the way the results were released; controversy maps to dispute.
The Paraphrase (The Action): Added to the controversy is expressed identically by the phrase dispute has only been heightened by their publishing strategy.
The Target Word (The Answer): Because the text confirms the release method increased the disagreement, the answer is YES.

Question 40: NO
Question Prompt: The size of H. naledi brains is a key factor in the question of whether these hominins were able to produce art.
Highlighted Passage Text: "...I think the species' small brains are a distraction. ... other properties, such as the brain's internal wiring, are surely equally important..."
Synonym & Paraphrase Mapping:
Locator Keywords: size of H. naledi brains and key factor anchor the cognitive debate.
The Paraphrase (The Action): The prompt claims brain size is a key factor, but the author explicitly rejects this, calling brain size a distraction and arguing that internal wiring is what actually enabled complex behaviors like art.
The Target Word (The Answer): Because the writer dismisses brain size as the determining factor, the answer is NO.`;

const extract = () => {
  const blocks = explanationsRaw.split(/Question \d+:/).filter(b => b.trim());
  const parsed = {};
  
  let qNum = 1;
  let currentPassage = 1;
  
  blocks.forEach(block => {
    if (block.includes('Reading Passage 2')) currentPassage = 2;
    if (block.includes('Reading Passage 3')) currentPassage = 3;
    
    // clean up block
    const cleaned = block.replace(/Reading Passage \d+:[^\n]+/, '').trim();
    
    const highlightMatch = cleaned.match(/Highlighted Passage Text: "(.*?)"/);
    const highlight = highlightMatch ? highlightMatch[1].replace(/^\.\.\.|\.\.\.$/g, '').trim() : '';
    
    const explanationText = cleaned.split('Synonym & Paraphrase Mapping:')[1]?.trim() || '';
    
    if (highlight || explanationText) {
      parsed[qNum.toString()] = {
        passageId: currentPassage,
        highlights: highlight ? [highlight] : [],
        explanation: explanationText
      };
    }
    
    qNum++;
  });
  
  return parsed;
};

const obj = extract();
const jsonStr = JSON.stringify(obj, null, 2);

const targetFile = 'src/data/novemberReadingData.ts';
let content = fs.readFileSync(targetFile, 'utf8');

const regex = /export const novemberExplanations = \{[\s\S]*?\};/;
if (regex.test(content)) {
  content = content.replace(regex, `export const novemberExplanations = ${jsonStr};`);
  fs.writeFileSync(targetFile, content, 'utf8');
  console.log('Updated', targetFile);
} else {
  console.log('Could not find novemberExplanations in', targetFile);
}
