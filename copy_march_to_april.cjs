const fs = require('fs');

let marchCode = fs.readFileSync('src/pages/MarchWritingTest.tsx', 'utf8');

let aprilCode = marchCode.replace(/MarchWritingTest/g, 'AprilWritingTest');
aprilCode = aprilCode.replace(/March Writing Practice/g, 'April Writing Practice');

// Replace Task 1 prompt
const t1Regex = /<span className="font-bold">Task 1:<\/span>.*?<\/p>[\s\S]*?<div className="mt-8 flex flex-col items-center">[\s\S]*?<\/div><\/div>/;
const newT1 = `<span className="font-bold">Task 1:</span> The graph below gives information about the number of jobs in four sectors of the economy in the US between 1960 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.
                                    </p>
                                    <p className="text-sm font-bold text-gray-900 mt-4 text-center">Number of jobs in four sectors of the economy in the US, 1960-2020</p>
                                    <div className="mt-4 flex flex-col items-center">
                                        <div className="w-full max-w-lg aspect-video bg-gray-100 flex items-center justify-center text-gray-400 font-medium rounded-lg border-2 border-dashed border-gray-300">
                                            [Graph placeholder]
                                        </div>
                                    </div>`;
aprilCode = aprilCode.replace(t1Regex, newT1);

// Replace Task 2 prompt
const t2Regex = /Some people think that hosting an international sports event is good for the country, while some people think it is bad.[\s\S]*?<\/p>\s*<p className="text-sm font-bold text-gray-900 mb-6">\s*Discuss both views and give your opinion./;
const newT2 = `The best way to provide enough homes in large cities is to build tall apartment blocks.</p><p className="text-sm font-bold text-gray-900 mb-6">To what extent do you agree or disagree with this statement?`;
aprilCode = aprilCode.replace(t2Regex, newT2);

fs.writeFileSync('src/pages/AprilWritingTest.tsx', aprilCode);
console.log("AprilWritingTest.tsx generated");
