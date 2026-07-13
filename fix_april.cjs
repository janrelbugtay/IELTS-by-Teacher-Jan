const fs = require('fs');
let code = fs.readFileSync('src/pages/MarchWritingTest.tsx', 'utf8');

// Name and Title
code = code.replace(/MarchWritingTest/g, 'AprilWritingTest');
code = code.replace(/March Writing Practice/g, 'April Writing Practice');

// Update Raw prompts
code = code.replace(
    'const prompt1Raw = "The table below presents the food consumption per a person weekly in European country in 1992, 2002 and 2012. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.";',
    'const prompt1Raw = "The graph below gives information about the number of jobs in four sectors of the economy in the US between 1960 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.";'
);

code = code.replace(
    'const prompt2Raw = "Some people think that hosting an international sports event is good for the country, while some people think it is bad. Discuss both views and give your opinion.";',
    'const prompt2Raw = "The best way to provide enough homes in large cities is to build tall apartment blocks. To what extent do you agree or disagree with this statement?";'
);

// Update JSX prompts
const task1JSXSearch = `<span className="font-bold">Task 1:</span> The graph below shows a typical American and a Japanese office. Summarise the information by selecting and reporting the main features and comparison where relevant. Write at least 150 words.
                                    </p>
                                    <div className="mt-8 flex flex-col items-center">
    <div className="w-full max-w-lg aspect-video bg-gray-100 flex items-center justify-center text-gray-500 font-medium rounded-lg overflow-hidden">
        <img src="https://lh3.googleusercontent.com/d/18bxiQiZ0BTNx1xnv3S8RvMbA1v-16PwS" alt="American and Japanese office layout" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
    </div>
</div>`;

const task1JSXReplace = `<span className="font-bold">Task 1:</span> The graph below gives information about the number of jobs in four sectors of the economy in the US between 1960 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.
                                    </p>
                                    <p className="text-sm font-bold text-gray-900 mt-4 text-center">Number of jobs in four sectors of the economy in the US, 1960-2020</p>
                                    <div className="mt-4 flex flex-col items-center">
                                        <div className="w-full max-w-lg aspect-video bg-gray-100 flex items-center justify-center text-gray-400 font-medium rounded-lg border-2 border-dashed border-gray-300">
                                            [Graph placeholder]
                                        </div>
                                    </div>`;

code = code.replace(task1JSXSearch, task1JSXReplace);

const task2JSXSearch = `<p className="text-sm font-bold text-gray-900 mb-4">
                                        Some people think that hosting an international sports event is good for the country, while some people think it is bad.
                                    </p>
                                    <p className="text-sm font-bold text-gray-900 mb-6">
                                        Discuss both views and give your opinion.
                                    </p>`;

const task2JSXReplace = `<p className="text-sm font-bold text-gray-900 mb-6">
                                        The best way to provide enough homes in large cities is to build tall apartment blocks.
                                    </p>
                                    <p className="text-sm font-bold text-gray-900 mb-6">
                                        To what extent do you agree or disagree with this statement?
                                    </p>`;

code = code.replace(task2JSXSearch, task2JSXReplace);

fs.writeFileSync('src/pages/AprilWritingTest.tsx', code);
console.log("April regenerated.");
