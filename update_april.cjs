const fs = require('fs');
let code = fs.readFileSync('src/pages/AprilWritingTest.tsx', 'utf8');

const target1 = `                                <div>
                                    <p className="text-sm text-gray-900 mb-6 leading-relaxed">
                                        <span className="font-bold">Task 1:</span> The graph below gives information about the number of jobs in four sectors of the economy in the US between 1960 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.
                                    </p>
                                    <p className="text-sm font-bold text-gray-900 mt-4 text-center">Number of jobs in four sectors of the economy in the US, 1960-2020</p>
                                    <div className="mt-4 flex flex-col items-center">
                                        <div className="w-full max-w-lg aspect-video bg-gray-100 flex items-center justify-center text-gray-400 font-medium rounded-lg overflow-hidden">
                                            <img src="https://lh3.googleusercontent.com/d/1u7gMnjbJyrGKJOEXf86e-BfSUTTgh6K_" alt="Number of jobs in four sectors of the economy in the US, 1960-2020" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                                        </div>
                                    </div>
                                </div>`;

const replacement1 = `                                <div className="space-y-4">
                                    <h2 className="text-[#d35400] text-xl font-bold mt-2">WRITING TASK 1</h2>
                                    <p className="italic text-gray-600 text-sm">You should spend about 20 minutes on this task.</p>
                                    
                                    <div className="font-bold bg-[#f9f9f9] p-4 border-l-4 border-[#3498db] text-sm text-gray-800">
                                        The graph below gives information about the number of jobs in four sectors of the economy in the US between 1960 and 2020.<br/><br/>
                                        Summarise the information by selecting and reporting the main features, and make comparisons where relevant.
                                    </div>
                                    
                                    <div className="w-full h-[300px] bg-[#e0e0e0] border-2 border-dashed border-[#999] flex flex-col items-center justify-center text-[#666] my-6 p-4">
                                        <iframe src="https://drive.google.com/file/d/1u7gMnjbJyrGKJOEXf86e-BfSUTTgh6K_/preview" className="w-full h-full border-0" allow="autoplay"></iframe>
                                    </div>

                                    <p className="font-bold text-sm text-gray-900">Write at least 150 words.</p>
                                </div>`;

code = code.replace(target1, replacement1);

const target2 = `                                <div>
                                    <p className="text-sm text-gray-700 mb-4">Write about the following topic:</p>
                                    <p className="text-sm font-bold text-gray-900 mb-6">
                                        The best way to provide enough homes in large cities is to build tall apartment blocks.
                                    </p>
                                    <p className="text-sm font-bold text-gray-900 mb-6">
                                        To what extent do you agree or disagree with this statement?
                                    </p>
                                    <p className="text-sm text-gray-700">
                                        Give reasons for your answer and include any relevant examples from your own knowledge or experience.
                                    </p>
                                </div>`;

const replacement2 = `                                <div className="space-y-4">
                                    <h2 className="text-[#d35400] text-xl font-bold mt-2">WRITING TASK 2</h2>
                                    <p className="italic text-gray-600 text-sm">You should spend about 40 minutes on this task.</p>
                                    
                                    <p className="text-sm text-gray-800">Write about the following topic:</p>
                                    
                                    <div className="font-bold bg-[#f9f9f9] p-4 border-l-4 border-[#3498db] text-sm text-gray-800">
                                        The best way to provide enough homes in large cities is to build tall apartment blocks.<br/><br/>
                                        To what extent do you agree or disagree with this statement?
                                    </div>
                                    
                                    <p className="text-sm text-gray-800">Give reasons for your answer and include any relevant examples from your own knowledge or experience.</p>
                                    
                                    <p className="font-bold text-sm text-gray-900 mt-4">Write at least 250 words.</p>
                                </div>`;
                                
code = code.replace(target2, replacement2);
fs.writeFileSync('src/pages/AprilWritingTest.tsx', code);
console.log("Updated AprilWritingTest.tsx");
