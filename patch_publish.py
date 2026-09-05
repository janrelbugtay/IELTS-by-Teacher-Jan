import re

filepath = 'src/pages/ComputerWritingTest.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Remove the publish controls from the top of the test workspace
bad_top = """                {isAdmin && typeLabel === 'Homework' && (
                    <div className="bg-yellow-100 border-b border-yellow-300 p-3 px-8 flex justify-between items-center text-sm font-semibold text-yellow-800">
                        <div className="flex items-center gap-2">
                            <span className="bg-yellow-500 text-white px-2 py-0.5 rounded text-xs">ADMIN</span>
                            Publish/Unpublish Parts for Homework
                        </div>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer hover:opacity-80">
                                <input 
                                    type="checkbox" 
                                    checked={publishConfig.part1} 
                                    onChange={() => handleTogglePublish('part1')}
                                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" 
                                />
                                Part 1 Published
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer hover:opacity-80">
                                <input 
                                    type="checkbox" 
                                    checked={publishConfig.part2} 
                                    onChange={() => handleTogglePublish('part2')}
                                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" 
                                />
                                Part 2 Published
                            </label>
                        </div>
                    </div>
                )}
                <div className="px-8 py-5 bg-[#f8fafc] border-b border-gray-200 flex-none">"""

good_top = """                <div className="px-8 py-5 bg-[#f8fafc] border-b border-gray-200 flex-none">"""
content = content.replace(bad_top, good_top)

# Update the LoginScreen component to include publishConfig state and UI
login_def = """const LoginScreen = ({ onStart, initialName, testTitle, typeLabel }: { onStart: (name: string, number: string, testMode: 'practice' | 'mock') => void, initialName: string, testTitle?: string, typeLabel: string }) => {"""

bad_login = """const LoginScreen = ({ onStart, initialName, testTitle, typeLabel }: { onStart: (name: string, number: string, testMode: 'practice' | 'mock') => void, initialName: string, testTitle?: string, typeLabel?: string }) => {
    const [name, setName] = useState(initialName || "");
    const [number, setNumber] = useState("");
    const [testMode, setTestMode] = useState<'practice' | 'mock'>('practice');

    return ("""

good_login = """const LoginScreen = ({ onStart, initialName, testTitle, typeLabel, isAdmin, publishConfig, onTogglePublish }: { onStart: (name: string, number: string, testMode: 'practice' | 'mock') => void, initialName: string, testTitle?: string, typeLabel?: string, isAdmin?: boolean, publishConfig?: {part1: boolean, part2: boolean}, onTogglePublish?: (part: 'part1' | 'part2') => void }) => {
    const [name, setName] = useState(initialName || "");
    const [number, setNumber] = useState("");
    const [testMode, setTestMode] = useState<'practice' | 'mock'>('practice');

    return ("""

# Replace LoginScreen signature (handling multiple possible signatures)
content = re.sub(r'const LoginScreen = \(\{.*?\) => \{', good_login.split(' => {')[0] + ' => {', content, count=1)


login_title = """                <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-purple-700 mb-2 text-center">{testTitle || "IELTS Writing Test"}</h1>
                <p className="text-gray-500 text-center mb-8 text-sm font-medium">{typeLabel === 'Homework' ? "Please enter your details to begin." : "Please select your mode and enter your details to begin."}</p>"""

good_login_title = """                <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-purple-700 mb-2 text-center">{testTitle || "IELTS Writing Test"}</h1>
                <p className="text-gray-500 text-center mb-8 text-sm font-medium">{typeLabel === 'Homework' ? "Please enter your details to begin." : "Please select your mode and enter your details to begin."}</p>
                
                {isAdmin && typeLabel === 'Homework' && (
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-6">
                        <div className="flex items-center gap-2 mb-3 text-sm font-bold text-yellow-800">
                            <span className="bg-yellow-500 text-white px-2 py-0.5 rounded text-xs">ADMIN</span>
                            Publish Parts
                        </div>
                        <div className="flex flex-col gap-3">
                            <label className="flex items-center justify-between cursor-pointer group bg-white p-2 rounded-lg border border-yellow-100 shadow-sm hover:border-yellow-300 transition-colors">
                                <span className="text-sm font-semibold text-gray-700">Part 1</span>
                                <div className="relative inline-block w-10 h-5 align-middle select-none transition duration-200 ease-in">
                                    <input type="checkbox" checked={publishConfig?.part1} onChange={() => onTogglePublish?.('part1')} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out z-10 peer" style={{ transform: publishConfig?.part1 ? 'translateX(1.25rem)' : 'translateX(0)', borderColor: publishConfig?.part1 ? '#3b82f6' : '#e5e7eb' }} />
                                    <label className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-200 cursor-pointer peer-checked:bg-blue-500 transition-colors duration-200 ease-in-out"></label>
                                </div>
                            </label>
                            <label className="flex items-center justify-between cursor-pointer group bg-white p-2 rounded-lg border border-yellow-100 shadow-sm hover:border-yellow-300 transition-colors">
                                <span className="text-sm font-semibold text-gray-700">Part 2</span>
                                <div className="relative inline-block w-10 h-5 align-middle select-none transition duration-200 ease-in">
                                    <input type="checkbox" checked={publishConfig?.part2} onChange={() => onTogglePublish?.('part2')} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out z-10 peer" style={{ transform: publishConfig?.part2 ? 'translateX(1.25rem)' : 'translateX(0)', borderColor: publishConfig?.part2 ? '#3b82f6' : '#e5e7eb' }} />
                                    <label className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-200 cursor-pointer peer-checked:bg-blue-500 transition-colors duration-200 ease-in-out"></label>
                                </div>
                            </label>
                        </div>
                    </div>
                )}"""

content = content.replace(login_title, good_login_title)

# Pass props down to LoginScreen
bad_login_call = """        return <LoginScreen onStart={handleStartTest} initialName={state.studentName} testTitle={testTitle} typeLabel={typeLabel} />;"""
good_login_call = """        return <LoginScreen onStart={handleStartTest} initialName={state.studentName} testTitle={testTitle} typeLabel={typeLabel} isAdmin={isAdmin} publishConfig={publishConfig} onTogglePublish={handleTogglePublish} />;"""

content = content.replace(bad_login_call, good_login_call)

with open(filepath, 'w') as f:
    f.write(content)

print("Updated patch_publish.py")
