import re
import json

explanations = {
  1: {
    "passageId": 1,
    "highlights": ["Tough new rules for new developments mean that drains will be prevented from becoming overloaded", "Architects of new urban buildings are diverting rainwater from the roof for use in toilets"],
    "explanation": "legislation = tough new rules\nbuilding designers = architects of new urban buildings\nimprove water use = diverting rainwater from the roof for use in toilets / irrigation"
  },
  2: {
    "passageId": 1,
    "highlights": ["The Rhine", "is a good example. For a long time engineers have erased its backwaters and cut it off from its plain. The aim was partly to improve navigation, and partly to speed floodwaters out"],
    "explanation": "one river = The Rhine\nisolated from its flood plain = cut it off from its plain\ntwo reasons = partly to improve navigation, and partly to speed floodwaters out"
  },
  3: {
    "passageId": 1,
    "highlights": ["Back in the days when rivers took a winding path to the sea, floodwaters lost force and volume while meandering across flood plains"],
    "explanation": "in the past = Back in the days\nnatural water courses = winding path / meandering across flood plains\nassisted flood control = floodwaters lost force and volume"
  },
  4: {
    "passageId": 1,
    "highlights": ["restored flood plain of the Drava River can now store up to 10 million cubic meters of floodwater", "protecting towns not only in Austria, but as far downstream as Slovenia and Croatia."],
    "explanation": "flood control = store up to 10 million cubic meters of floodwater / protecting towns\none river = Drava River\naffecting three countries = Austria, Slovenia, and Croatia"
  },
  5: {
    "passageId": 1,
    "highlights": ["The Dutch", "have broken one of their most enduring national stereotypes by allowing engineers to punch holes in dykes", "in order to better protect the rest."],
    "explanation": "a country = The Dutch (The Netherlands)\nmost typical features = most enduring national stereotypes (dykes/sea walls)\npartly destroyed = punch holes in\ncontrol water = better protect the rest / prevent floods"
  },
  6: {
    "passageId": 1,
    "highlights": ["It may sound expensive, until we realize how much is spent trying to drain cities and protect areas from flooding, and how little this method achieves."],
    "explanation": "comparative cost effectiveness = It may sound expensive until we realize how much is spent... and how little this method achieves\ntraditional flood control = trying to drain cities and protect areas\nnewer methods = utilizing floodwater (the Sun Valley scheme)"
  },
  7: {
    "passageId": 1,
    "highlights": ["reviving river bends and marshes to curb the flow", "slow down storm surges", "by more than an hour."],
    "explanation": "Paragraph B states engineers are \"reviving river bends and marshes to curb the flow\" and Paragraph D notes the restored Drava River can \"slow down storm surges... by more than an hour.\"\nSynonym: slow the movement of water = curb the flow / slow down storm surges"
  },
  8: {
    "passageId": 1,
    "highlights": ["reflooding 10 square kilometers of the ancient flood plain", "return up to a sixth of the country to its former waterlogged state."],
    "explanation": "Paragraph D mentions \"reflooding 10 square kilometers of the ancient flood plain\" and Paragraph E states the Dutch plan to \"return up to a sixth of the country to its former waterlogged state.\"\nSynonym: loss of some areas of land = reflooding land / returning country to a waterlogged state"
  },
  9: {
    "passageId": 1,
    "highlights": ["winter floods on the rivers of central Europe have been among the worst for 600 to 700 years"],
    "explanation": "Synonym Breakdown: most severe floods for many centuries = worst for 600 to 700 years; occurred in parts of = on the rivers of."
  },
  10: {
    "passageId": 1,
    "highlights": ["The same thing has happened in the US on the Mississippi river"],
    "explanation": "Synonym Breakdown: experienced similar problems = The same thing has happened."
  },
  11: {
    "passageId": 1,
    "highlights": ["To help keep London's feet dry, the UK Environment Agency is reflooding", "outside Oxford."],
    "explanation": "Synonym Breakdown: protect the city of = keep London's feet dry."
  },
  12: {
    "passageId": 1,
    "highlights": ["A new breed of 'soft engineers' wants cities to", "porous"],
    "explanation": "Synonym Breakdown: allow water to pass more freely through city surfaces = wants cities to be porous."
  },
  13: {
    "passageId": 1,
    "highlights": ["Could this be expanded to protect a whole city? The test case could be Los Angeles."],
    "explanation": "Synonym Breakdown: proposal... could show whether small-scale water projects could apply on a large scale = Could this be expanded to protect a whole city? The test case could be..."
  },
  14: {
    "passageId": 2,
    "highlights": ["Calves stay with their mothers throughout adulthood, and in many years of observation no one has ever seen a whale switch pods."],
    "explanation": "Synonym Breakdown:\nremain with = stay with / never switch pods\nmaternal group = mothers\nfor life = throughout adulthood"
  },
  15: {
    "passageId": 2,
    "highlights": ["Transients have only a few such calls", "Residents have a much more extensive repertoire"],
    "explanation": "Synonym Breakdown:\nmore restricted range (claim in question) vs. much more extensive repertoire (text reality). The statement contradicts the passage."
  },
  16: {
    "passageId": 2,
    "highlights": ["Transients have only a few such calls, and all transient societies share the same ones."],
    "explanation": "Synonym Breakdown:\nvocabulary of sounds = calls\ncommon to all = all share the same ones"
  },
  17: {
    "passageId": 2,
    "highlights": ["each family group has its own unique and distinctive set of calls. Despite regular interaction between them, each resident pod sticks firmly to its own dialect."],
    "explanation": "Synonym Breakdown:\nshare the dialects of other communities (claim in question) vs. unique and distinctive / sticks firmly to its own dialect (text reality)."
  },
  18: {
    "passageId": 2,
    "highlights": ["Research shows these dialects are maintained for at least 40 years."],
    "explanation": "Paragraph D states that \"Research shows these dialects are maintained for at least 40 years.\" However, grammatically and contextually, \"these dialects\" refers to resident killer whale dialects discussed in the preceding sentences. There is no information mentioning whether transient killer whale calls remain constant over time or change."
  },
  19: {
    "passageId": 2,
    "highlights": ["Residents live in stable groups, or 'pods', made up of two or three mothers and their offspring"],
    "explanation": "Synonym Breakdown: fixed family groups = stable groups."
  },
  20: {
    "passageId": 2,
    "highlights": ["Animals with different dialects share the same waters, so the variations can’t be a product of the physical environment."],
    "explanation": "Synonym Breakdown: could not have emerged as a result of = can't be a product of."
  },
  21: {
    "passageId": 2,
    "highlights": ["A calf uses the calls of its maternal pod very precisely. There’s no input from the father"],
    "explanation": "The question asks for the noun after \"its\" (\"the group to which its ________ belongs\"). In the text, \"maternal pod\" means the pod belonging to the mother."
  },
  22: {
    "passageId": 2,
    "highlights": ["advanced mental abilities.", "adept at recognising sounds", "detect prey with a range of echo locating clicks.", "live up to a quarter of a century after they had their last offspring."],
    "explanation": "Intelligence = advanced mental abilities. Sensitivity to sound = adept at recognising sounds / detect prey with a range of echo locating clicks. Prolonged life span = live up to a quarter of a century after they had their last offspring. Option E (lengthy period of fertility) is incorrect because living 25 years after their last offspring means their fertility ends relatively early in life."
  },
  23: {
    "passageId": 2,
    "highlights": ["advanced mental abilities.", "adept at recognising sounds", "detect prey with a range of echo locating clicks.", "live up to a quarter of a century after they had their last offspring."],
    "explanation": "Intelligence = advanced mental abilities. Sensitivity to sound = adept at recognising sounds / detect prey with a range of echo locating clicks. Prolonged life span = live up to a quarter of a century after they had their last offspring. Option E (lengthy period of fertility) is incorrect because living 25 years after their last offspring means their fertility ends relatively early in life."
  },
  24: {
    "passageId": 2,
    "highlights": ["advanced mental abilities.", "adept at recognising sounds", "detect prey with a range of echo locating clicks.", "live up to a quarter of a century after they had their last offspring."],
    "explanation": "Intelligence = advanced mental abilities. Sensitivity to sound = adept at recognising sounds / detect prey with a range of echo locating clicks. Prolonged life span = live up to a quarter of a century after they had their last offspring. Option E (lengthy period of fertility) is incorrect because living 25 years after their last offspring means their fertility ends relatively early in life."
  },
  25: {
    "passageId": 2,
    "highlights": ["enabling them to share information about food hot spots."],
    "explanation": "Synonym Breakdown:\nan example of the kind of information = food hot spots\npassed by whales to each other = share information"
  },
  26: {
    "passageId": 2,
    "highlights": ["One of the most obvious distinctions between the transient and resident societies is the way they impart information", "Transients have only a few such calls", "Residents have a much more extensive repertoire"],
    "explanation": "Synonym Breakdown:\nvariations in communication styles = distinctions in the way they impart information / vocabulary / repertoire\ndifferent cultures within one species = transient and resident societies"
  },
  27: {
    "passageId": 3,
    "highlights": ["it was impossible for the effects of changes in verbal input to be assessed."],
    "explanation": "The study attempted to measure and compare the effects (impact) of verbal vs. non-verbal channels on listener perception."
  },
  28: {
    "passageId": 3,
    "highlights": ["The subjects were then", "asked to guess the emotions in the recorded voice and the photos."],
    "explanation": "Synonym Breakdown: emotions = feelings."
  },
  29: {
    "passageId": 3,
    "highlights": ["The subjects were then shown photos of female faces expressing the same three emotions"],
    "explanation": "Synonym Breakdown: photos of female faces expressing emotions = facial expressions."
  },
  30: {
    "passageId": 3,
    "highlights": ["Three words had positive meanings (eg, honey), three were neutral", "and three were negative", "It was found that the tone of voice carries more meaning than the individual words."],
    "explanation": "Synonym Breakdown: positive/neutral/negative meanings of individual words = word meanings."
  },
  31: {
    "passageId": 3,
    "highlights": ["The first is that the entire study involved only 62 subjects", "determined by only the 37 remaining subjects."],
    "explanation": "Synonym Breakdown:\nOne limitation = The first [limitation] is...\ntoo few subjects = only 62 subjects / only 37 remaining subjects"
  },
  32: {
    "passageId": 3,
    "highlights": ["their ages and academic qualifications seemed remarkably uniform. Thus, the findings may simply be a product of the nature of the sample."],
    "explanation": "Synonym Breakdown:\nsimilar background = ages and academic qualifications seemed remarkably uniform\nwas an advantage (claim in question) vs. a limitation/flaw (the author cites this uniformity as a weakness that undermines the validity of the findings)."
  },
  33: {
    "passageId": 3,
    "highlights": ["7-38-55 formula was pieced together from two different experiments"],
    "explanation": "The author criticizes the fact that the famous 7-38-55 formula was pieced together from two different experiments, neither of which tested all three communication channels simultaneously. However, the author never suggests that the experiments should have been carried out in a different order."
  },
  34: {
    "passageId": 3,
    "highlights": ["The researchers intentionally used a \"neutral\" word so naturally, the subjects found little meaning there. Clearly, such a methodology lacks validity."],
    "explanation": "Synonym Breakdown:\nhelpful in the context of the study (claim in question) vs. lacks validity / impossible to assess effects (text reality)."
  },
  35: {
    "passageId": 3,
    "highlights": ["phrases and full-blown sentences, making extensive use of the multi-faceted vehicle of language."],
    "explanation": "In Paragraph 3 of Methodological Issues, the writer states that in the real world, people speak in \"phrases and full-blown sentences, making extensive use of the multi-faceted vehicle of language.\" However, there is no mention that testing a range of different languages (e.g., Spanish, French, Japanese) would have made the study more valid."
  },
  36: {
    "passageId": 3,
    "highlights": ["Clearly, one appealing aspect of the Mehrabian study is its numerical precision", "And the popular appeal of the study has given the 7-38-55 formula enormous credibility."],
    "explanation": "Synonym Breakdown:\nnumerical accuracy = numerical precision / exactness\nmakes the claims more attractive = appealing aspect / popular appeal / enormous credibility"
  },
  37: {
    "passageId": 3,
    "highlights": ["encouraging people to believe in the overwhelming importance of the non-verbal message compared with the verbal one", "devalue the role of language in communication"],
    "explanation": "Synonym Breakdown:\npopularity = continued references / prominence / popular appeal\nundervaluing of language = overwhelming importance of non-verbal compared with verbal / devalue the role of language"
  },
  38: {
    "passageId": 3,
    "highlights": ["Bradley (1991)", "makes the same point when he observes, 'If we could communicate 93% of information and attitudes with vocal and facial cues, it would be wasteful to spend time learning a language.'"],
    "explanation": "Bradley uses a logical argument (reductio ad absurdum): if non-verbal communication really accounted for 93% of meaning, learning language would be a waste of time. Because learning language is clearly not a waste of time, words must be deeply important."
  },
  39: {
    "passageId": 3,
    "highlights": ["Please remember that all my findings deal with communications of feelings and attitudes. It is absurd to imply or suggest that the verbal portion of all communication constitutes only 7% of the message"],
    "explanation": "Synonym Breakdown:\nrelevant to only one area = deal [exclusively] with communications of feelings and attitudes / absurd to apply to all communication."
  },
  40: {
    "passageId": 3,
    "highlights": ["To be fair, many textbook writers attempt to be faithful to the context", "Others try to play down the specific percentages", "Still, other textbook authors simply use the numbers without placing any limits on their meaning."],
    "explanation": "By listing how different textbook authors present the findings—some accurately, some cautiously, and some recklessly—the writer is outlining the varying ways the study has been interpreted in educational literature."
  }
}

with open('src/data/octoberReadingData.ts', 'r') as f:
    content = f.read()

# Replace the empty export const octoberExplanations = {}; with the real JSON
export_str = "export const octoberExplanations = " + json.dumps(explanations, indent=2) + ";"

content = re.sub(r'export const octoberExplanations\s*=\s*\{\s*\};', export_str, content)

with open('src/data/octoberReadingData.ts', 'w') as f:
    f.write(content)

print("Done")
