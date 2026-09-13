with open('src/pages/Homework1WritingTest.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '{renderSheet(1, text1, report1, loadingReport1, error1)}',
    '{(!publishConfig || publishConfig.part1) && renderSheet(1, text1, report1, loadingReport1, error1)}'
).replace(
    '{renderSheet(2, text2, report2, loadingReport2, error2)}',
    '{(!publishConfig || publishConfig.part2) && renderSheet(2, text2, report2, loadingReport2, error2)}'
)

with open('src/pages/Homework1WritingTest.tsx', 'w') as f:
    f.write(content)
