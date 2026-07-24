import re

with open("src/pages/MayListeningTest.tsx", "r") as f:
    content = f.read()

# Replace questions 15-20 (Letters A-I)
for i in range(15, 21):
    old_str = f'<input type="text" placeholder="{i}" className="ielts-input flex-1 max-w-[120px]" value={{answers[{i}] || \'\'}} onChange={{(e) => handleAnswerChange({i}, e.target.value)}} />'
    new_str = f'''<select className="ielts-input flex-1 max-w-[120px] bg-white border border-gray-300 rounded p-1" value={{answers[{i}] || ''}} onChange={{(e) => handleAnswerChange({i}, e.target.value)}}>
                                    <option value=""></option>
                                    {{"ABCDEFGHI".split('').map(letter => <option key={{letter}} value={{letter}}>{{letter}}</option>)}}
                                </select>'''
    content = content.replace(old_str, new_str)

# Replace questions 27-30 (Letters A-F)
for i in range(27, 31):
    old_str = f'<input type="text" placeholder="{i}" className="ielts-input ielts-input-short" value={{answers[{i}] || \'\'}} onChange={{(e) => handleAnswerChange({i}, e.target.value)}} />'
    new_str = f'''<select className="ielts-input ielts-input-short bg-white border border-gray-300 rounded p-1" value={{answers[{i}] || ''}} onChange={{(e) => handleAnswerChange({i}, e.target.value)}}>
                                    <option value=""></option>
                                    {{"ABCDEF".split('').map(letter => <option key={{letter}} value={{letter}}>{{letter}}</option>)}}
                                </select>'''
    content = content.replace(old_str, new_str)

with open("src/pages/MayListeningTest.tsx", "w") as f:
    f.write(content)
