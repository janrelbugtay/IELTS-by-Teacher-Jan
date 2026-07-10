import re

# 1. Update PETCalculator.tsx
with open("src/components/PETCalculator.tsx", "r") as f:
    pet_content = f.read()

# Remove the button from PETCalculator
button_old = """        {/* Export Button */}
        <div className="print:hidden pb-12 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <button
            onClick={() => window.print()}
            className="w-full group bg-gray-900 hover:bg-gray-800 text-white font-extrabold text-lg py-5 rounded-[2rem] shadow-xl shadow-gray-900/20 hover:shadow-2xl hover:shadow-gray-900/40 transition-all duration-300 flex justify-center items-center gap-3 transform active:scale-[0.98]"
          >
            <span className="group-hover:-translate-y-1 transition-transform duration-300"><DownloadIcon /></span>
            Generate Official Results Report (PDF)
          </button>
        </div>"""

pet_content = pet_content.replace(button_old, "")

with open("src/components/PETCalculator.tsx", "w") as f:
    f.write(pet_content)

# 2. Update Dashboard.tsx
with open("src/pages/pet/Dashboard.tsx", "r") as f:
    dash_content = f.read()

dash_import_old = "import { BookOpen, PenTool, Headphones, Mic, PlayCircle, Upload, Trash2 } from 'lucide-react';"
dash_import_new = "import { BookOpen, PenTool, Headphones, Mic, PlayCircle, Upload, Trash2, Download } from 'lucide-react';"
dash_content = dash_content.replace(dash_import_old, dash_import_new)

dashboard_profile = """                                <CambridgeClassicProfile 
                    scores={studentData.scores} 
                    overallScore={overallScore} 
                    gradeInfo={getGradeDetails(overallScore)} 
                />"""

dashboard_profile_new = """                                <CambridgeClassicProfile 
                    scores={studentData.scores} 
                    overallScore={overallScore} 
                    gradeInfo={getGradeDetails(overallScore)} 
                />
                
                <div className="mt-8 print:hidden">
                    <button
                        onClick={() => window.print()}
                        className="w-full max-w-xl mx-auto group bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg py-4 px-8 rounded-2xl shadow-lg shadow-slate-900/20 hover:shadow-xl transition-all duration-300 flex justify-center items-center gap-3 active:scale-[0.98]"
                    >
                        <span className="group-hover:-translate-y-1 transition-transform duration-300">
                            <Download className="w-5 h-5" />
                        </span>
                        Generate Official Results Report (PDF)
                    </button>
                </div>"""

dash_content = dash_content.replace(dashboard_profile, dashboard_profile_new)

with open("src/pages/pet/Dashboard.tsx", "w") as f:
    f.write(dash_content)
