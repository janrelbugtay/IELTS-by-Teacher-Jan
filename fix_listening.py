import os
import glob
import re

files = glob.glob("src/pages/*ListeningTest.tsx")

bad = "  const formatTime = (seconds: number) => {"
good = """  const hasSubmittedOnUnmount = useRef(false);
  useEffect(() => {
    return () => {
      if (hasStarted && !isSubmitted && !hasSubmittedOnUnmount.current) {
        hasSubmittedOnUnmount.current = true;
        submitTest().catch(console.error);
      }
    };
  }, [hasStarted, isSubmitted, submitTest]);

  const formatTime = (seconds: number) => {"""

for file in files:
    with open(file, 'r') as f:
        content = f.read()
    if "hasSubmittedOnUnmount" not in content and bad in content:
        content = content.replace(bad, good)
        with open(file, 'w') as f:
            f.write(content)
        print(f"Patched {file}")
