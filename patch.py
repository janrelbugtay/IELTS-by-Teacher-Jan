import re

with open('src/pages/ComputerWritingTest.tsx', 'r') as f:
    content = f.read()

# Add a style block for printing if it doesn't exist
style_block = """
            <style>{`
                .ielts-table th, .ielts-table td { border: 1px solid #a0aec0; padding: 8px 12px; text-align: center; }
                .ielts-table th { background-color: #f1f5f9; font-weight: bold; }
                
                .pdf-generating .print-hidden { display: none !important; }
                .pdf-generating #result-overlay { background: white !important; padding: 0 !important; overflow: visible !important; position: static !important; }
                .pdf-generating #result-sheets-container { display: block !important; width: 190mm !important; max-width: 190mm !important; padding: 0 !important; margin: 0 auto !important; }
                .pdf-generating .answer-sheet { width: 190mm !important; max-width: 190mm !important; min-height: 277mm !important; margin: 0 auto !important; box-shadow: none !important; border: 1px solid #cbd5e1 !important; page-break-after: always; }
                .pdf-generating .ai-report { width: 190mm !important; max-width: 190mm !important; margin: 0 auto !important; box-shadow: none !important; border: 1px solid #cbd5e1 !important; page-break-after: always; }
            `}</style>
"""

# Find return ( and insert style
if "pdf-generating" not in content:
    content = content.replace('    return (\n        <div className="flex flex-col h-screen bg-[#c1c5cc] font-sans">', 
                              '    return (\n        <div className="flex flex-col h-screen bg-[#c1c5cc] font-sans">' + style_block)

with open('src/pages/ComputerWritingTest.tsx', 'w') as f:
    f.write(content)
