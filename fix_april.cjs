const fs = require('fs');
let code = fs.readFileSync('src/pages/AprilWritingTest.tsx', 'utf8');

const target1 = `                                <div className="space-y-4">
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

const replacement1 = `                                <div style={{ fontFamily: 'Arial, sans-serif', lineHeight: 1.6, color: '#333' }}>
                                    <h2 style={{ color: '#d35400', marginTop: '30px', fontSize: '1.4em', fontWeight: 'bold' }}>WRITING TASK 1</h2>
                                    <p style={{ fontStyle: 'italic', color: '#555', marginBottom: '15px' }}>You should spend about 20 minutes on this task.</p>
                                    
                                    <p style={{ fontWeight: 'bold', background: '#f9f9f9', padding: '15px', borderLeft: '4px solid #3498db', margin: '20px 0' }}>
                                        The graph below gives information about the number of jobs in four sectors of the economy in the US between 1960 and 2020.<br/><br/>
                                        Summarise the information by selecting and reporting the main features, and make comparisons where relevant.
                                    </p>
                                    
                                    <div style={{ width: '100%', minHeight: '350px', backgroundColor: '#e0e0e0', border: '2px dashed #999', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#666', margin: '20px 0', textAlign: 'center', padding: '20px', boxSizing: 'border-box' }}>
                                        <div style={{ width: '100%', height: '300px' }}>
                                            <iframe src="https://drive.google.com/file/d/1u7gMnjbJyrGKJOEXf86e-BfSUTTgh6K_/preview" style={{ width: '100%', height: '100%', border: '0' }} allow="autoplay"></iframe>
                                        </div>
                                        <br/>
                                        Number of jobs in four sectors of the economy in the US, 1960-2020
                                    </div>

                                    <p style={{ fontWeight: 'bold', marginTop: '15px' }}>Write at least 150 words.</p>
                                </div>`;

const target2 = `                                <div className="space-y-4">
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

const replacement2 = `                                <div style={{ fontFamily: 'Arial, sans-serif', lineHeight: 1.6, color: '#333' }}>
                                    <h2 style={{ color: '#d35400', marginTop: '30px', fontSize: '1.4em', fontWeight: 'bold' }}>WRITING TASK 2</h2>
                                    <p style={{ fontStyle: 'italic', color: '#555', marginBottom: '15px' }}>You should spend about 40 minutes on this task.</p>
                                    
                                    <p>Write about the following topic:</p>
                                    
                                    <p style={{ fontWeight: 'bold', background: '#f9f9f9', padding: '15px', borderLeft: '4px solid #3498db', margin: '20px 0' }}>
                                        The best way to provide enough homes in large cities is to build tall apartment blocks.<br/><br/>
                                        To what extent do you agree or disagree with this statement?
                                    </p>
                                    
                                    <p>Give reasons for your answer and include any relevant examples from your own knowledge or experience.</p>
                                    
                                    <p style={{ fontWeight: 'bold', marginTop: '15px' }}>Write at least 250 words.</p>
                                </div>`;

code = code.replace(target1, replacement1);
code = code.replace(target2, replacement2);
fs.writeFileSync('src/pages/AprilWritingTest.tsx', code);
console.log("Updated!");
