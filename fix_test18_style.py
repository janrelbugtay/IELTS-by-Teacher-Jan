import re

with open('src/data/test18ReadingData.ts', 'r') as f:
    content = f.read()

# Fix table block for 1-7
old_table_block = """      {
        title: "Questions 1-7",
        instruction: "Complete the table below.\\nChoose ONE WORD ONLY from the passage for each answer.",
        type: "table",
        table: {
          headers: ["Section of website", "Comments"],
          rows: [
            ["Database of tourism services", "• easy for tourism-related businesses to get on the list\\n• allowed businesses to {1} information regularly\\n• provided a country-wide evaluation of businesses, including their impact on the {2}"],
            ["Special features on local topics", "• e.g. an interview with a former sports {3}\\n• and an interactive tour of various locations used in {4}"],
            ["Information on driving routes", "• varied depending on the {5}"],
            ["Travel Planner", "• included a map showing selected places, details of public transport and local {6}"],
            ["'Your Words'", "• travellers could send a link to their {7}"]
          ]
        },
        questions: [
          { id: 1, text: "" },
          { id: 2, text: "" },
          { id: 3, text: "" },
          { id: 4, text: "" },
          { id: 5, text: "" },
          { id: 6, text: "" },
          { id: 7, text: "" }
        ]
      },"""

new_table_block = """      {
        title: "Questions 1-7",
        instruction: "Complete the notes below.\\nChoose ONE WORD ONLY from the passage for each answer.",
        type: "input",
        questions: [
          {
            id: 1,
            text: "Database of tourism services\\n• easy for tourism-related businesses to get on the list\\n• allowed businesses to 1 _____ information regularly"
          },
          {
            id: 2,
            text: "• provided a country-wide evaluation of businesses, including their impact on the 2 _____"
          },
          {
            id: 3,
            text: "Special features on local topics\\n• e.g. an interview with a former sports 3 _____"
          },
          {
            id: 4,
            text: "• and an interactive tour of various locations used in 4 _____"
          },
          {
            id: 5,
            text: "Information on driving routes\\n• varied depending on the 5 _____"
          },
          {
            id: 6,
            text: "Travel Planner\\n• included a map showing selected places, details of public transport and local 6 _____"
          },
          {
            id: 7,
            text: "'Your Words'\\n• travellers could send a link to their 7 _____"
          }
        ]
      },"""

content = content.replace(old_table_block, new_table_block)

# Fix summary block for 24-26
old_summary_block = """      {
        title: "Questions 24-26",
        instruction: "Complete the summary below.\\nChoose ONE WORD ONLY from the passage for each answer.",
        text: "**Responses to boredom**\\nFor John Eastwood, the central feature of boredom is that people cannot {24} due to a failure in what he calls the 'attention system', and as a result they become frustrated and irritable. His team suggests that those for whom {25} is an important aim in life may have problems in coping with boredom, whereas those who have the characteristic of {26} can generally cope with it.",
        type: "summary-input",
        questions: [
          { id: 24, text: "" },
          { id: 25, text: "" },
          { id: 26, text: "" }
        ]
      }"""

new_summary_block = """      {
        title: "Questions 24-26",
        instruction: "Complete the summary below.\\nChoose ONE WORD ONLY from the passage for each answer.",
        type: "input",
        questions: [
          {
            id: 24,
            text: "**Responses to boredom**\\nFor John Eastwood, the central feature of boredom is that people cannot 24 _____ due to a failure in what he calls the 'attention system', and as a result they become frustrated and irritable."
          },
          {
            id: 25,
            text: "His team suggests that those for whom 25 _____ is an important aim in life may have problems in coping with boredom,"
          },
          {
            id: 26,
            text: "whereas those who have the characteristic of 26 _____ can generally cope with it."
          }
        ]
      }"""

content = content.replace(old_summary_block, new_summary_block)

with open('src/data/test18ReadingData.ts', 'w') as f:
    f.write(content)

