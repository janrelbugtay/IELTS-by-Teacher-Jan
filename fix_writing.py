import os
import glob
import re

files = glob.glob("src/pages/*WritingTest.tsx")

for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    # We want to add an unmount hook that automatically submits.
    # What state variables exist?
    
    # Some might use 'hasStarted', some might use 'examStarted'.
    started_var = "hasStarted" if "hasStarted" in content else "examStarted"
    
    # Is it handleSubmit or submitTest?
    submit_func = "handleSubmit" if "handleSubmit =" in content else "submitTest"
    if submit_func not in content:
        if "handleConfirmSubmit" in content:
            submit_func = "handleConfirmSubmit"

    hook_code = f"""  const unmountStateRef = useRef({{ {started_var}, isSubmitted, {submit_func} }});
  useEffect(() => {{
    unmountStateRef.current = {{ {started_var}, isSubmitted, {submit_func} }};
  }}, [{started_var}, isSubmitted, {submit_func}]);

  useEffect(() => {{
    return () => {{
      const state = unmountStateRef.current;
      if (state.{started_var} && !state.isSubmitted) {{
        state.{submit_func}();
      }}
    }};
  }}, []);"""
    
    if "unmountStateRef" not in content:
        # Let's insert it before the formatTime function or handleGenerateReport or whatever.
        # Find a good place to insert. E.g. right before "const handleSubmit =" or "const formatTime ="
        if "const formatTime =" in content:
            content = content.replace("const formatTime =", hook_code + "\n\n  const formatTime =")
        elif "const handleSubmit =" in content:
            content = content.replace("const handleSubmit =", hook_code + "\n\n  const handleSubmit =")
        elif "const handleConfirmSubmit =" in content:
             content = content.replace("const handleConfirmSubmit =", hook_code + "\n\n  const handleConfirmSubmit =")
             
        with open(file, 'w') as f:
            f.write(content)
        print(f"Patched {file}")
