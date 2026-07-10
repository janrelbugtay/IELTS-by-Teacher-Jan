import sys
import re

def update_file(filename):
    with open(filename, "r") as f:
        content = f.read()

    # The current lobby form block
    old_lobby_regex = r'<form onSubmit=\{handleStart\} className="mb-6">.*?</form>'
    
    new_lobby = """<form onSubmit={handleStart} className="flex flex-col gap-6">
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-800">Full Name</label>
                  <input 
                      type="text" 
                      required
                      className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-gray-50 focus:bg-white" 
                      placeholder="Enter your full name" 
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold mb-3 text-gray-800">Select Test Mode</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      type="button"
                      onClick={() => setTestMode('practice')}
                      className={`p-4 border rounded-xl text-left transition-all relative overflow-hidden ${testMode === 'practice' ? 'border-blue-600 bg-blue-50/50 shadow-[0_0_0_2px_rgba(37,99,235,0.2)]' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50/50 bg-white'}`}
                    >
                      {testMode === 'practice' && <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>}
                      <div className="flex justify-between items-start mb-2">
                        <div className={`font-bold text-[15px] ${testMode === 'practice' ? 'text-blue-700' : 'text-gray-800'}`}>Practice Mode</div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${testMode === 'practice' ? 'border-blue-600' : 'border-gray-300'}`}>
                            {testMode === 'practice' && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 leading-relaxed pr-2">
                        Audio and timer can be paused. Ideal for learning and reviewing.
                      </div>
                    </button>

                    <button 
                      type="button"
                      onClick={() => setTestMode('mock')}
                      className={`p-4 border rounded-xl text-left transition-all relative overflow-hidden ${testMode === 'mock' ? 'border-blue-600 bg-blue-50/50 shadow-[0_0_0_2px_rgba(37,99,235,0.2)]' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50/50 bg-white'}`}
                    >
                      {testMode === 'mock' && <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>}
                      <div className="flex justify-between items-start mb-2">
                        <div className={`font-bold text-[15px] ${testMode === 'mock' ? 'text-blue-700' : 'text-gray-800'}`}>Mock Test Mode</div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${testMode === 'mock' ? 'border-blue-600' : 'border-gray-300'}`}>
                            {testMode === 'mock' && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 leading-relaxed pr-2">
                        Strict timed conditions. Audio cannot be paused. Simulates real exam.
                      </div>
                    </button>
                  </div>
                </div>
                
                <button type="submit" disabled={!studentName.trim()} className="mt-4 w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all text-[15px] disabled:opacity-50 disabled:hover:shadow-none disabled:hover:translate-y-0 disabled:cursor-not-allowed">
                    Start Test Now
                </button>
            </form>"""

    content = re.sub(old_lobby_regex, new_lobby, content, flags=re.DOTALL)
    
    # Let's also update the lobby container to make it a bit wider and look more immersive
    container_old_regex = r'<div className="bg-white p-10 rounded shadow-lg w-\[450px\] border border-gray-300">'
    container_new = '<div className="bg-white p-10 rounded-2xl shadow-2xl w-[560px] border border-gray-100 relative overflow-hidden">'
    content = re.sub(container_old_regex, container_new, content)
    
    # Add a decorative background element to the lobby
    bg_old_regex = r'<div className="fixed inset-0 bg-\[#e1e5eb\] z-50 flex flex-col items-center justify-center">'
    bg_new = '<div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">'
    content = re.sub(bg_old_regex, bg_new, content)
    
    # Title styling in the lobby
    title_old_regex = r'<h1 className="text-2xl font-bold mb-2 text-center text-black">IELTS Listening Test</h1>'
    title_new = '<h1 className="text-3xl font-extrabold mb-2 text-center text-gray-900 tracking-tight">IELTS Listening Test</h1>'
    content = re.sub(title_old_regex, title_new, content)
    
    subtitle_old_regex = r'<p className="text-sm text-gray-600 text-center mb-8">Please enter your details to begin the test\.</p>'
    subtitle_new = '<p className="text-[15px] text-gray-500 text-center mb-10">Configure your session and enter your details to begin.</p>'
    content = re.sub(subtitle_old_regex, subtitle_new, content)

    with open(filename, "w") as f:
        f.write(content)

update_file("src/pages/ComputerListeningTest.tsx")
update_file("src/pages/FebruaryListeningTest.tsx")
update_file("src/pages/MarchListeningTest.tsx")
update_file("src/pages/AprilListeningTest.tsx")
