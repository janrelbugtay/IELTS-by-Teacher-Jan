import re
import sys

def replace_in_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # We want to replace the title-based routing with ID-based routing where possible.
    # We can use the assignmentId directly since they map to the specific tests.
    
    # Let's insert logic for assignmentId matching.
    
    # We can redefine the routing for 'writing', 'reading', 'listening', 'speaking'
    # Actually, the user asked for Writing, let's fix writing.
    
    writing_routing = """  if (type === 'writing') {
      const aId = submission.assignmentId;
      if (aId === '3' || submission.assignmentTitle?.toLowerCase().includes('january')) return <JanuaryWritingTest submissionId={id} />;
      if (aId === '7' || submission.assignmentTitle?.toLowerCase().includes('february')) return <FebruaryWritingTest submissionId={id} />;
      if (aId === '11' || submission.assignmentTitle?.toLowerCase().includes('march')) return <MarchWritingTest submissionId={id} />;
      if (aId === '15' || submission.assignmentTitle?.toLowerCase().includes('april')) return <AprilWritingTest submissionId={id} />;
      if (aId === '19' || submission.assignmentTitle?.toLowerCase().includes('may')) return <MayWritingTest submissionId={id} />;
      if (aId === '23' || submission.assignmentTitle?.toLowerCase().includes('june')) return <JuneWritingTest submissionId={id} />;
      if (aId === '27' || submission.assignmentTitle?.toLowerCase().includes('july')) return <JulyWritingTest submissionId={id} />;
      return <ComputerWritingTest submissionId={id} />;
  }"""

    # We also need to be careful that if assignmentId exists, we should prefer it over title
    writing_routing = """  if (type === 'writing') {
      const aId = submission.assignmentId;
      if (aId === '3') return <JanuaryWritingTest submissionId={id} />;
      if (aId === '7') return <FebruaryWritingTest submissionId={id} />;
      if (aId === '11') return <MarchWritingTest submissionId={id} />;
      if (aId === '15') return <AprilWritingTest submissionId={id} />;
      if (aId === '19') return <MayWritingTest submissionId={id} />;
      if (aId === '23') return <JuneWritingTest submissionId={id} />;
      if (aId === '27') return <JulyWritingTest submissionId={id} />;
      
      // Fallback to title
      if (submission.assignmentTitle?.toLowerCase().includes('january')) return <JanuaryWritingTest submissionId={id} />;
      if (submission.assignmentTitle?.toLowerCase().includes('february')) return <FebruaryWritingTest submissionId={id} />;
      if (submission.assignmentTitle?.toLowerCase().includes('march')) return <MarchWritingTest submissionId={id} />;
      if (submission.assignmentTitle?.toLowerCase().includes('april')) return <AprilWritingTest submissionId={id} />;
      if (submission.assignmentTitle?.toLowerCase().includes('may')) return <MayWritingTest submissionId={id} />;
      if (submission.assignmentTitle?.toLowerCase().includes('june')) return <JuneWritingTest submissionId={id} />;
      if (submission.assignmentTitle?.toLowerCase().includes('july')) return <JulyWritingTest submissionId={id} />;
      
      return <ComputerWritingTest submissionId={id} />;
  }"""
  
    content = re.sub(r'  if \(type === \'writing\'\) \{.*?return <ComputerWritingTest submissionId=\{id\} />;.*?\}', writing_routing, content, flags=re.DOTALL)

    # Do the same for listening and reading?
    # For listening:
    listening_routing = """  if (type === 'listening') {
      const aId = submission.assignmentId;
      if (aId === '2') return <JanuaryListeningTest submissionId={id} />;
      if (aId === '6') return <FebruaryListeningTest submissionId={id} />;
      if (aId === '10') return <MarchListeningTest submissionId={id} />;
      if (aId === '14') return <AprilListeningTest submissionId={id} />;
      if (aId === '18') return <MayListeningTest submissionId={id} />;
      if (aId === '22') return <JuneListeningTest submissionId={id} />;
      if (aId === '26') return <JulyListeningTest submissionId={id} />;
      
      if (submission.assignmentTitle?.toLowerCase().includes('january')) return <JanuaryListeningTest submissionId={id} />;
      if (submission.assignmentTitle?.toLowerCase().includes('february')) return <FebruaryListeningTest submissionId={id} />;
      if (submission.assignmentTitle?.toLowerCase().includes('march')) return <MarchListeningTest submissionId={id} />;
      if (submission.assignmentTitle?.toLowerCase().includes('april')) return <AprilListeningTest submissionId={id} />;
      if (submission.assignmentTitle?.toLowerCase().includes('may')) return <MayListeningTest submissionId={id} />;
      if (submission.assignmentTitle?.toLowerCase().includes('june')) return <JuneListeningTest submissionId={id} />;
      if (submission.assignmentTitle?.toLowerCase().includes('july')) return <JulyListeningTest submissionId={id} />;
      
      return <ComputerListeningTest submissionId={id} />;
  }"""
  
    # Wait, my logic: id / 4. 
    # January: reading: 1, listening: 2, writing: 3, speaking: 4
    # February: reading: 5, listening: 6, writing: 7, speaking: 8
    # March: reading: 9, listening: 10, writing: 11, speaking: 12
    # April: reading: 13, listening: 14, writing: 15, speaking: 16
    # May: reading: 17, listening: 18, writing: 19, speaking: 20
    # June: reading: 21, listening: 22, writing: 23, speaking: 24
    # July: reading: 25, listening: 26, writing: 27, speaking: 28
    
    content = re.sub(r'  if \(type === \'listening\'\) \{.*?return <ComputerListeningTest submissionId=\{id\} />;.*?\}', listening_routing, content, flags=re.DOTALL)

    with open(filepath, 'w') as f:
        f.write(content)

replace_in_file('src/pages/TestResult.tsx')
