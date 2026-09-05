import re

filepath = 'src/pages/ComputerWritingTest.tsx'
with open(filepath, 'r') as f:
    content = f.read()

bad_login = """                {isAdmin && typeLabel === 'Homework' && (
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

content = content.replace(bad_login, "")

with open(filepath, 'w') as f:
    f.write(content)

print("LoginScreen patched")
