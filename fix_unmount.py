import re
import glob

files = glob.glob("src/pages/*WritingTest.tsx")
for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()

    # ComputerWritingTest has state encapsulated in state object
    if "ComputerWritingTest" in filepath:
        bad = "  const unmountStateRef = useRef({ examStarted, isSubmitted, handleConfirmSubmit });"
        if bad in content:
            good = "  const unmountStateRef = useRef({ examStarted: state.examStarted, isSubmitted: state.isSubmitted, handleConfirmSubmit });"
            content = content.replace(bad, good)
            
            bad2 = "    unmountStateRef.current = { examStarted, isSubmitted, handleConfirmSubmit };"
            good2 = "    unmountStateRef.current = { examStarted: state.examStarted, isSubmitted: state.isSubmitted, handleConfirmSubmit };"
            content = content.replace(bad2, good2)
            
            bad3 = "  }, [examStarted, isSubmitted, handleConfirmSubmit]);"
            good3 = "  }, [state.examStarted, state.isSubmitted, handleConfirmSubmit]);"
            content = content.replace(bad3, good3)
            
            with open(filepath, 'w') as f:
                f.write(content)
            print(f"Fixed {filepath}")
