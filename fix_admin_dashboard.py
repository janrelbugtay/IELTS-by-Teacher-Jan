import re

with open("src/pages/AdminDashboard.tsx", "r") as f:
    content = f.read()

candidate_numbers_ui = """
      {/* Listening Test Candidate Numbers */}
      <section>
        <h2 className="text-2xl font-bold text-natural-900 mb-6 flex items-center gap-2">
          <Key className="w-6 h-6 text-[#F4A340]" /> Listening Test Candidate Numbers (Admin Only)
        </h2>
        <div className="bg-white rounded-2xl border border-natural-200 shadow-sm p-6 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-natural-200">
                <th className="py-3 px-4 text-natural-500 font-bold text-sm uppercase tracking-wider">Test Month</th>
                <th className="py-3 px-4 text-natural-500 font-bold text-sm uppercase tracking-wider">Candidate Number</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries({
                'January': 'JAN2026',
                'February': 'FEB2026',
                'March': 'MAR2026',
                'April': 'APR2026',
                'May': 'MAY2026',
                'June': 'JUN2026',
                'July': 'JUL2026',
              }).map(([month, code]) => (
                <tr key={month} className="border-b border-natural-100 hover:bg-natural-50/50">
                  <td className="py-3 px-4 font-bold text-natural-900">{month} Listening Test</td>
                  <td className="py-3 px-4"><span className="bg-natural-100 text-natural-800 font-mono font-bold px-3 py-1 rounded-lg">{code}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
"""

# Find where to insert it, maybe after "User Tracking System" section
# Actually, let's insert it before {/* User Tracking System */}
content = content.replace("{/* User Tracking System */}", candidate_numbers_ui + "\n      {/* User Tracking System */}")

# Need to import Key from lucide-react if not already there
if "Key" not in content[:content.find("from 'lucide-react'")]:
    content = content.replace("from 'lucide-react';", ", Key } from 'lucide-react';")

with open("src/pages/AdminDashboard.tsx", "w") as f:
    f.write(content)
print("Updated AdminDashboard.tsx")
