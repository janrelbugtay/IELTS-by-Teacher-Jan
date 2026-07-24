import json

october_passages = [
  {
    "id": 1,
    "title": "Keeping the water away – New approaches to flood control",
    "content": [],
    "questionBlocks": []
  },
  {
    "id": 2,
    "title": "Whale Culture",
    "content": [],
    "questionBlocks": []
  },
  {
    "id": 3,
    "title": "A closer examination of a study on verbal and non-verbal messages",
    "content": [],
    "questionBlocks": []
  }
]

october_answers = {}
october_explanations = {}

with open('src/data/octoberReadingData.ts', 'w') as f:
    f.write(f"export const octoberPassages = {json.dumps(october_passages, indent=2)};\n\n")
    f.write(f"export const octoberAnswers = {json.dumps(october_answers, indent=2)};\n\n")
    f.write("export const octoberExplanations = {};\n")

print("Done")
