import re

filepath = 'src/components/LiveSpeakingTestScreen.tsx'
with open(filepath, 'r') as f:
    content = f.read()

bad = "  const getCurrentQId = () => {"
good = """  // Auto-save on unmount (e.g. clicking back)
  useEffect(() => {
    return () => {
      if (!hasSubmittedRef.current && Object.keys(responsesRef.current).length > 0) {
        hasSubmittedRef.current = true;
        onComplete(responsesRef.current).catch(err => {
            console.error("Auto-save on back failed", err);
        });
      }
    };
  }, [onComplete]);

  const getCurrentQId = () => {"""

if bad in content:
    content = content.replace(bad, good)
    with open(filepath, 'w') as f:
        f.write(content)
    print("done")
else:
    print("pattern not found")
