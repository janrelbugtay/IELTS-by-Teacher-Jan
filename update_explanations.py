import re

with open("src/data/juneReadingData.ts", "r") as f:
    content = f.read()

def add_detailed_explanation(match):
    line = match.group(0)
    q_id = int(match.group(1))
    
    detailed_exp = ""
    if q_id == 1:
        detailed_exp = "TRUE is wrong because the text says they misused the word 'batata', not 'Chuchu'. NOT GIVEN is wrong because the text explicitly states what they called it."
    elif q_id == 2:
        detailed_exp = "TRUE is wrong because their primary purpose was searching for gold, not potatoes. NOT GIVEN is wrong because their purpose is explicitly stated."
    elif q_id == 3:
        detailed_exp = "TRUE and FALSE are wrong because the text makes no comparison between the nutritional value of potatoes and other vegetables according to Spanish beliefs. Therefore, it is NOT GIVEN."
    elif q_id == 4:
        detailed_exp = "FALSE is wrong because the text states they found them 'ugly, misshapen tubes'. NOT GIVEN is wrong because their reason for refusal is clearly stated."
    elif q_id == 5:
        detailed_exp = "FALSE is wrong because the text explicitly links the popularity to food shortages. NOT GIVEN is wrong because the reason is provided."
    elif q_id == 14:
        detailed_exp = "FALSE is wrong because the text states it charges no fee. NOT GIVEN is wrong because the cost is explicitly mentioned."
    elif q_id == 15:
        detailed_exp = "TRUE is wrong because most are tax-supported, and only a 'few' are from donations. NOT GIVEN is wrong because the funding source is explicitly stated."
    elif q_id == 16:
        detailed_exp = "TRUE and FALSE are wrong because while the text mentions the size of the LA library, it does not state whether it is the 'largest' in the US. Therefore, it is NOT GIVEN."
    elif q_id == 17:
        detailed_exp = "FALSE is wrong because the text states they divide into children and adults. NOT GIVEN is wrong because the age division is mentioned."
    elif q_id == 18:
        detailed_exp = "TRUE is wrong because the text explicitly states they are 'never to be taken out'. NOT GIVEN is wrong because the borrowing rules are stated."
    elif q_id == 19:
        detailed_exp = "FALSE is wrong because the text says it depends on what people found useful. NOT GIVEN is wrong because the reasoning is provided."
    elif q_id == 20:
        detailed_exp = "TRUE is wrong because the text says they might have 'only a small amount' on Mustangs. NOT GIVEN is wrong because the amount is discussed."
    elif q_id == 28:
        detailed_exp = "Other options are incorrect because Dennett specifically focuses on the limitation of short-term memory and cognitive resources, not on eye movements (A), self-deception (B), or physical presence (G)."
    elif q_id == 29:
        detailed_exp = "Other options are incorrect because Grimes's experiment specifically involved making changes while eyes were scanning or blinking (eye movements), not about retaining every image (C) or imagination (E)."
    elif q_id == 30:
        detailed_exp = "Other options are incorrect because Kosslyn demonstrated that imagining a scene activates the visual cortex similarly to actually seeing it, which matches G. It does not relate to eye movements (A) or cognitive resources (C)."
    elif q_id == 31:
        detailed_exp = "Other options are incorrect because O’Regan (and Blackmore) argue that our attention is automatically dragged to stimuli, meaning we lack complete control (F), rather than it being about self-deception (B) or imagination (E)."
    elif q_id == 32:
        detailed_exp = "FALSE is wrong because Dennett explicitly says he wished he had been bolder. NOT GIVEN is wrong because his regret is directly quoted."
    elif q_id == 33:
        detailed_exp = "FALSE is wrong because experiments show we tend to ignore unimportant elements. NOT GIVEN is wrong because this tendency is explicitly stated."
    elif q_id == 34:
        detailed_exp = "FALSE is wrong because the text connects cognitive errors to fatal accidents, implying research could prevent them. NOT GIVEN is wrong because the connection is made."
    elif q_id == 35:
        detailed_exp = "TRUE and FALSE are wrong because the text discusses filling in gaps, but never mentions the aging process. Therefore, it is NOT GIVEN."
    elif q_id == 36:
        detailed_exp = "TRUE is wrong because the text states eyes 'don’t even need to be moving to be deceived'. NOT GIVEN is wrong because the condition is explicitly stated."
    elif q_id == 37:
        detailed_exp = "Other options are incorrect because the text gives the gorilla example where concentrating on counting passes caused people to miss the gorilla (other details). It doesn't help us see the overall picture (G)."
    elif q_id == 38:
        detailed_exp = "Other options are incorrect because the text explicitly calls this 'disconcerting', which means challenging to accept (F), not that it lacks scientific evidence (A) or is fruitful (C)."
    elif q_id == 39:
        detailed_exp = "Other options are incorrect because Kosslyn states the illusion is partly due to filling in gaps with memory (B). It is not provided by imagination alone (E) or lacking evidence (A)."
    elif q_id == 40:
        detailed_exp = "Other options are incorrect because the text refers to this as an 'illusion' based on selectively extracting details, meaning it is not backed by evidence that we actually see everything (A)."

    if detailed_exp:
        # replace the closing brace with detailedExplanation
        return line.replace(" }", f", detailedExplanation: \"{detailed_exp}\" }}")
    return line

# Regular expression to match each explanation line
new_content = re.sub(r"^\s*(\d+):\s*\{.*explanation:.*?\}", add_detailed_explanation, content, flags=re.MULTILINE)

with open("src/data/juneReadingData.ts", "w") as f:
    f.write(new_content)

