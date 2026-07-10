import re

with open("src/pages/pet/Dashboard.tsx", "r") as f:
    content = f.read()

old_edit_profile = """                {isEditingProfile && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-0">
                        <div className="bg-white rounded-2xl w-full h-full max-w-none max-h-none rounded-none p-4 md:p-8 flex flex-col shadow-xl relative animate-[slideUp_0.3s_ease-out_forwards]">"""

new_edit_profile = """                {isEditingProfile && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative animate-[slideUp_0.3s_ease-out_forwards]">"""

content = content.replace(old_edit_profile, new_edit_profile)

with open("src/pages/pet/Dashboard.tsx", "w") as f:
    f.write(content)
