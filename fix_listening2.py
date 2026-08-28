import os
import glob

files = glob.glob("src/pages/*ListeningTest.tsx")

bad = """  const hasSubmittedOnUnmount = useRef(false);
  useEffect(() => {
    return () => {
      if (hasStarted && !isSubmitted && !hasSubmittedOnUnmount.current) {
        hasSubmittedOnUnmount.current = true;
        submitTest().catch(console.error);
      }
    };
  }, [hasStarted, isSubmitted, submitTest]);"""

good = """  const unmountStateRef = useRef({ hasStarted, isSubmitted, submitTest });
  useEffect(() => {
    unmountStateRef.current = { hasStarted, isSubmitted, submitTest };
  }, [hasStarted, isSubmitted, submitTest]);

  useEffect(() => {
    return () => {
      const state = unmountStateRef.current;
      if (state.hasStarted && !state.isSubmitted) {
        state.submitTest().catch(console.error);
      }
    };
  }, []);"""

for file in files:
    with open(file, 'r') as f:
        content = f.read()
    if bad in content:
        content = content.replace(bad, good)
        with open(file, 'w') as f:
            f.write(content)
        print(f"Fixed {file}")
