import os

filepath = 'src/pages/ComputerReadingTest.tsx'
with open(filepath, 'r') as f:
    content = f.read()

bad = "  const formatTime = (seconds: number) => {"
good = """  const unmountStateRef = useRef({ hasStarted, isSubmitted, handleSubmit });
  useEffect(() => {
    unmountStateRef.current = { hasStarted, isSubmitted, handleSubmit };
  }, [hasStarted, isSubmitted, handleSubmit]);

  useEffect(() => {
    return () => {
      const state = unmountStateRef.current;
      if (state.hasStarted && !state.isSubmitted) {
        state.handleSubmit().catch(console.error);
      }
    };
  }, []);

  const formatTime = (seconds: number) => {"""

if bad in content:
    content = content.replace(bad, good)
    with open(filepath, 'w') as f:
        f.write(content)
    print(f"Fixed {filepath}")
