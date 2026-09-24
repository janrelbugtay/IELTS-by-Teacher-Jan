import re

new_explanations = """export const test18Explanations: Record<number, any> = {
  1: {
    passageId: 1,
    highlights: ["businesses were able to update the details they gave on a regular basis"],
    explanation: `Explanation: The website allowed businesses to change their information regularly.\\n\\nSynonyms:\\nchange information → update the details\\nregularly → on a regular basis`
  },
  2: {
    passageId: 1,
    highlights: ["the effect of each business on the environment was considered"],
    explanation: `Explanation: The evaluation considered the effect each business had on the environment.\\n\\nSynonyms:\\nimpact → effect\\nnatural surroundings → environment`
  },
  3: {
    passageId: 1,
    highlights: ["former New Zealand All Blacks rugby captain Tana Umaga"],
    explanation: `Explanation: Tana Umaga is described as a former All Blacks rugby captain.\\n\\nSynonyms:\\nsports leader → captain`
  },
  4: {
    passageId: 1,
    highlights: ["locations chosen for blockbuster films"],
    explanation: `Explanation: The interactive journey showed locations used as settings for blockbuster films.\\n\\nSynonyms:\\nmovies → films\\nvery successful movies → blockbuster films`
  },
  5: {
    passageId: 1,
    highlights: ["highlighting different routes according to the season"],
    explanation: `Explanation: Different driving routes were highlighted according to the time of year.\\n\\nSynonyms:\\ntime of year → season`
  },
  6: {
    passageId: 1,
    highlights: ["There were also links to accommodation in the area."],
    explanation: `Explanation: The Travel Planner included links to places to stay in the area.\\n\\nSynonyms:\\nplaces to stay → accommodation\\nlodging → accommodation`
  },
  7: {
    passageId: 1,
    highlights: ["anyone could submit a blog of their New Zealand travels"],
    explanation: `Explanation: Visitors could submit a blog about their New Zealand travels.\\n\\nSynonyms:\\ntravel article → blog\\ntravel journal → blog`
  },
  8: {
    passageId: 1,
    highlights: ["allow both individuals and travel organisations to create itineraries and travel packages"],
    explanation: `Explanation: The website allowed both individuals and travel organisations to create itineraries and travel packages. This directly agrees with the statement.\\n\\nSynonyms:\\nindividual tourists → individuals\\ntravel companies → travel organisations\\nready-made travel plans → itineraries and travel packages`
  },
  9: {
    passageId: 1,
    highlights: ["search for activities not solely by geographical location, but also by the particular nature of the activity"],
    explanation: `Explanation: The statement says visitors mainly searched by geographical location. However, the passage says they could search not solely by location, but also by the type of activity.\\n\\nSynonyms:\\ngeographical location → place/location\\ntype of activity → particular nature of the activity\\nnot only → not solely`
  },
  10: {
    passageId: 1,
    highlights: ["activities ... 74% ... while transport and accommodation account for the remaining 26%"],
    explanation: `Explanation: The 26% refers to transport and accommodation together, not accommodation alone.\\n\\nSynonyms:\\naccommodation → place to stay\\naccount for → make up/contribute to\\nremaining → rest`
  },
  11: {
    passageId: 1,
    highlights: ["visitors enjoy cultural activities most when they are interactive", "learn about traditional Maori life"],
    explanation: `Explanation: Visitors particularly enjoyed interactive cultural activities involving traditional Maori life.\\n\\nSynonyms:\\nbecome involved → interactive\\nlocal culture → traditional Maori life\\ncultural participation → interactive cultural activities`
  },
  12: {
    passageId: 1,
    highlights: ["activities that involve only a few people more special and meaningful"],
    explanation: `Explanation: The passage says visitors prefer activities involving only a few people because these activities are more special and meaningful. It says nothing about small hotels versus large hotels.\\n\\nSynonyms:\\nsmall groups → only a few people\\nmore valuable → more special and meaningful\\nNo information about hotels`
  },
  13: {
    passageId: 1,
    highlights: ["what is often seen as a once-in-a-lifetime visit"],
    explanation: `Explanation: The passage says the visit is often considered a once-in-a-lifetime visit. This supports the idea that many visitors do not expect to return.\\n\\nSynonyms:\\nunlikely to return → once-in-a-lifetime\\nvisit only once → once-in-a-lifetime visit`
  },
  14: {
    passageId: 2,
    highlights: ["defining boredom so that it can be studied in the lab has proved difficult", "frustration, apathy, depression and indifference"],
    explanation: `Explanation: Paragraph A explains why boredom is difficult to define and study scientifically.\\n\\nSynonyms:\\nscientific approach → studied in the lab\\ndifficult to define → defining ... has proved difficult\\ndifferent mental states → frustration, apathy, depression and indifference`
  },
  15: {
    passageId: 2,
    highlights: ["identified five distinct types: indifferent, calibrating, searching, reactant and apathetic", "plotted on two axes"],
    explanation: `Explanation: Goetz identified five different types of boredom and organised them according to two dimensions.\\n\\nSynonyms:\\ncategories → types\\nclassification → five distinct types\\norganise → plotted on two axes`
  },
  16: {
    passageId: 2,
    highlights: ["being bored makes us more creative", "it can lead to all kinds of amazing things"],
    explanation: `Explanation: Mann's research found that boredom can make people more creative.\\n\\nSynonyms:\\nproductive outcomes → creative ideas\\ncreativity → more creative\\npositive results → amazing things`
  },
  17: {
    passageId: 2,
    highlights: ["it can still be toxic if allowed to fester", "we don’t know what to do any more, and no longer care"],
    explanation: `Explanation: Eastwood explains that prolonged boredom can become harmful and cause people to stop caring.\\n\\nSynonyms:\\ndanger → toxic\\nharmful → toxic\\ncontinue for too long → allowed to fester`
  },
  18: {
    passageId: 2,
    highlights: ["People who are motivated by pleasure seem to suffer particularly badly.", "Boredom proneness has been linked with a variety of traits."],
    explanation: `Explanation: Paragraph E discusses people who are particularly prone to boredom and personality traits connected to it.\\n\\nSynonyms:\\nmost affected → suffer particularly badly\\nprone to boredom → boredom proneness\\npersonality characteristics → traits`
  },
  19: {
    passageId: 2,
    highlights: ["our over-connected lifestyles might even be a new source of boredom", "use boredom to motivate us to engage with the world in a more meaningful way"],
    explanation: `Explanation: Wemelsfelder suggests modern over-connected lifestyles may cause boredom and proposes using boredom to engage with the world more meaningfully.\\n\\nSynonyms:\\nnew cause → new source\\nsolution → motivate us to engage\\nmodern lifestyle → over-connected lifestyles`
  },
  20: {
    passageId: 2,
    highlights: ["disgust ... motivates us to stay away from certain situations", "boredom may protect them from ‘infectious’ social situations"],
    explanation: `Explanation: Toohey compares boredom with disgust. Disgust protects humans by motivating them to stay away from unpleasant situations, and he suggests boredom may do something similar with social situations.\\n\\nSynonyms:\\navoid → stay away from\\nunpleasant situation → infectious social situations\\nencourage avoidance → protect ... from`
  },
  21: {
    passageId: 2,
    highlights: ["Of the five types, the most damaging is ‘reactant’ boredom"],
    explanation: `Explanation: Goetz identifies reactant boredom as the most damaging of the five types.\\n\\nSynonyms:\\nworse → most damaging\\ntype → reactant\\nnegative → damaging`
  },
  22: {
    passageId: 2,
    highlights: ["your efforts to improve the situation can end up making you feel worse"],
    explanation: `Explanation: Eastwood says attempts to improve the situation can actually make people feel worse.\\n\\nSynonyms:\\ntrying to cope → efforts to improve the situation\\nincrease negative effects → make you feel worse`
  },
  23: {
    passageId: 2,
    highlights: ["our over-connected lifestyles might even be a new source of boredom"],
    explanation: `Explanation: She suggests that modern, highly connected lifestyles can actually be a source of boredom.\\n\\nSynonyms:\\nway we live today → modern human society\\nencourage boredom → source of boredom\\nmodern lifestyle → over-connected lifestyles`
  },
  24: {
    passageId: 2,
    highlights: ["This causes an inability to focus on anything"],
    explanation: `Explanation: Eastwood says boredom involves a failure of the attention system, causing an inability to focus.\\n\\nSynonyms:\\nconcentrate → focus\\nattention → focus\\ninability to concentrate → inability to focus`
  },
  25: {
    passageId: 2,
    highlights: ["People who are motivated by pleasure seem to suffer particularly badly."],
    explanation: `Explanation: People who are motivated by pleasure are particularly likely to suffer from boredom.\\n\\nSynonyms:\\nenjoyment → pleasure\\nan important aim → motivated by\\nseeking enjoyment → motivated by pleasure`
  },
  26: {
    passageId: 2,
    highlights: ["curiosity ... [is] associated with a high boredom threshold"],
    explanation: `Explanation: Curiosity is associated with having a high boredom threshold, meaning such people cope better with boredom.\\n\\nSynonyms:\\ninquisitiveness → curiosity\\nability to cope with boredom → high boredom threshold`
  },
  27: {
    passageId: 3,
    highlights: ["one of a growing number of computer programs", "audiences enraptured, and even tricked them", "paintings ... sold for thousands of dollars", "hung in prestigious galleries"],
    explanation: `Explanation: The first paragraph provides several examples of successful computer-generated art: music that fooled audiences, robot paintings sold for thousands of dollars, and software creating art beyond what the programmer imagined.\\n\\nSynonyms:\\nprogress → growing number / achievements\\nsuccess → enraptured / sold for thousands / prestigious galleries\\nadvanced → could not have been imagined by the programmer`
  },
  28: {
    passageId: 3,
    highlights: ["This is a question at the very core of humanity", "taking something special away from what it means to be human"],
    explanation: `Explanation: Wiggins believes computer creativity threatens something fundamental about being human.\\n\\nSynonyms:\\nfundamental human quality → core of humanity\\nundermine → take something special away\\nhuman identity → what it means to be human`
  },
  29: {
    passageId: 3,
    highlights: ["realise the programmer’s own creative ideas", "going online for material", "come up with its own concepts"],
    explanation: `Explanation: Aaron mainly carries out the programmer's creative ideas, whereas the Painting Fool searches online and generates its own concepts.\\n\\nSynonyms:\\nsource of subject matter → source of material\\nprogrammer's ideas → programmer’s own creative ideas\\nonline information → online material`
  },
  30: {
    passageId: 3,
    highlights: ["people’s double standards towards software-produced and human-produced art"],
    explanation: `Explanation: Colton explicitly says people have different standards for computer-produced and human-produced art.\\n\\nSynonyms:\\ncriteria → standards\\ndifferent judgement → double standards\\ncomputer-produced → software-produced\\nhuman art → human-produced art`
  },
  31: {
    passageId: 3,
    highlights: ["This gives the work an eerie, ghostlike quality."],
    explanation: `Explanation: A technical glitch made the chair paintings black and white, giving them an eerie, ghostlike quality.\\n\\nSynonyms:\\nstriking effect → eerie, ghostlike quality\\nunusual appearance → ghostlike quality\\ntechnical error → technical glitch`
  },
  32: {
    passageId: 3,
    highlights: ["don’t believe it is right to measure machine creativity directly to that of humans", "have had millennia to develop our skills"],
    explanation: `Explanation: Colton says machine creativity should not be directly compared with human creativity because humans have had thousands of years to develop their skills.\\n\\nSynonyms:\\ncompare → measure ... directly to\\nartistic achievements → creativity\\nhumans and computers → machine ... humans`
  },
  33: {
    passageId: 3,
    highlights: ["EMI even fooled classical music experts", "thinking they were hearing genuine Bach"],
    explanation: `Explanation: EMI was so convincing that classical music experts believed they were listening to genuine Bach.\\n\\nSynonyms:\\nindistinguishable → fooled experts\\nhuman-produced music → genuine Bach\\nconvincing → fooled`
  },
  34: {
    passageId: 3,
    highlights: ["condemned him for his deliberately vague explanation of how the software worked"],
    explanation: `Explanation: Wiggins criticised Cope because he gave a deliberately vague explanation of how EMI worked.\\n\\nSynonyms:\\ntechnical details → how the software worked\\nnot revealing → vague explanation\\nexplain clearly → reveal technical details`
  },
  35: {
    passageId: 3,
    highlights: ["EMI created replicas which still rely completely on the original artist’s creative impulses"],
    explanation: `Explanation: Hofstadter argued that EMI's replicas still relied completely on the original artist's creative impulses.\\n\\nSynonyms:\\nentirely dependent → rely completely\\nimagination → creative impulses\\ncreator → original artist`
  },
  36: {
    passageId: 3,
    highlights: ["When audiences found out the truth they were often outraged"],
    explanation: `Explanation: Audiences became angry when they discovered the music was composed by a computer.\\n\\nSynonyms:\\ndiscovering → found out\\ncomputer program → EMI\\nbecame angry → were outraged`
  },
  37: {
    passageId: 3,
    highlights: ["weren’t told beforehand whether the tunes were composed by humans or computers"],
    explanation: `Explanation: The participants were not told whether the music was composed by humans or computers before assessing it.\\n\\nSynonyms:\\nknowing → being told beforehand\\nsoftware → computers\\nwork of humans → composed by humans`
  },
  38: {
    passageId: 3,
    highlights: ["A study ... provides a clue.", "People who thought the composer was a computer tended to dislike the piece more"],
    explanation: `Explanation: Moffat's research provides a clue about why people reacted negatively to computer-generated music.\\n\\nSynonyms:\\nhelp explain → provides a clue\\nreactions → dislike the piece more\\ncomputer-produced → composer was a computer`
  },
  39: {
    passageId: 3,
    highlights: ["People who thought the composer was a computer tended to dislike the piece more"],
    explanation: `Explanation: The statement says all non-experts responded predictably. The passage does not say all of them did. It says people who thought the composer was a computer tended to dislike the piece more.\\nKey IELTS trap: all = 100%, tended to = generally/often, but not everyone. Therefore, the statement is too strong and contradicts the passage.\\n\\nSynonyms:\\nall → every participant\\ntended to → generally/often\\ndislike → dislike the piece more`
  },
  40: {
    passageId: 3,
    highlights: ["pleasure we get from art stems from the creative process", "enjoyment ... increases if they think more time and effort was needed"],
    explanation: `Explanation: Kruger's findings support Bloom's theory rather than casting doubt on it. Bloom says enjoyment comes partly from the creative process, while Kruger found that enjoyment increases when people believe more time and effort were used.\\n\\nSynonyms:\\ncast doubt on → challenge/disprove\\ntheory → explanation\\ncreative process → time and effort needed to create it\\nenjoyment → pleasure`
  }
};
"""

with open('src/data/test18ReadingData.ts', 'r') as f:
    lines = f.readlines()

out_lines = []
for line in lines:
    if line.startswith('export const test18Explanations:'):
        break
    out_lines.append(line)

with open('src/data/test18ReadingData.ts', 'w') as f:
    f.writelines(out_lines)
    f.write(new_explanations)

