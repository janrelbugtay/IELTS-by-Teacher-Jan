import os
import glob

files = glob.glob("src/pages/*WritingTest.tsx")

for filepath in files:
    with open(filepath, 'r') as f:
        lines = f.readlines()
        
    start_idx = -1
    func_name = ""
    for i, line in enumerate(lines):
        if "const handleSubmit = async () => {" in line:
            start_idx = i
            func_name = "handleSubmit"
            break
        elif "const handleConfirmSubmit = async () => {" in line:
            start_idx = i
            func_name = "handleConfirmSubmit"
            break
            
    if start_idx == -1:
        print(f"Could not find submit function in {filepath}")
        continue
        
    # Find the matching closing bracket
    open_brackets = 0
    end_idx = -1
    for i in range(start_idx, len(lines)):
        open_brackets += lines[i].count('{')
        open_brackets -= lines[i].count('}')
        if open_brackets == 0:
            end_idx = i
            break
            
    if end_idx == -1:
        print(f"Could not find end of submit function in {filepath}")
        continue
        
    started_var = "examStarted"
    content = "".join(lines)
    if "hasStarted" in content:
        started_var = "hasStarted"
        
    hook_code = f"""
  const unmountStateRef = useRef({{ {started_var}, isSubmitted, {func_name} }});
  useEffect(() => {{
    unmountStateRef.current = {{ {started_var}, isSubmitted, {func_name} }};
  }}, [{started_var}, isSubmitted, {func_name}]);

  useEffect(() => {{
    return () => {{
      const state = unmountStateRef.current;
      if (state.{started_var} && !state.isSubmitted) {{
        state.{func_name}().catch(console.error);
      }}
    }};
  }}, []);
"""
    
    if "unmountStateRef" not in content:
        lines.insert(end_idx + 1, hook_code)
        with open(filepath, 'w') as f:
            f.writelines(lines)
        print(f"Successfully patched {filepath}")
    else:
        print(f"Already patched {filepath}")

