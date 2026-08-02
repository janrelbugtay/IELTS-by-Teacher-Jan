const fs = require('fs');
let content = fs.readFileSync('src/pages/ielts/Dashboard.tsx', 'utf8');

const oldFunc = `  const handleEditScore = async (subId: string) => {
    if (!editScoreValue) {
      setEditingScoreId(null);
      return;
    }
    try {
      const score = parseFloat(editScoreValue);
      if (!isNaN(score)) {
        await updateDoc(doc(db, 'submissions', subId), {
          bandScore: score
        });
      }
      setEditingScoreId(null);
    } catch (err: any) {
      console.error("Error updating score:", err);
      alert("Failed to update score.");
    }
  };`;

const newFunc = `  const handleEditScore = async (subId: string) => {
    if (!editScoreValue && !editRawScoreValue) {
      setEditingScoreId(null);
      return;
    }
    try {
      const updates: any = {};
      
      if (editScoreValue) {
        const score = parseFloat(editScoreValue);
        if (!isNaN(score)) updates.bandScore = score;
      }
      if (editRawScoreValue) {
        const rawScore = parseInt(editRawScoreValue, 10);
        if (!isNaN(rawScore)) updates.score = rawScore;
      }

      if (Object.keys(updates).length > 0) {
        await updateDoc(doc(db, 'submissions', subId), updates);
      }
      
      setEditingScoreId(null);
    } catch (err: any) {
      console.error("Error updating score:", err);
      alert("Failed to update score.");
    }
  };`;

content = content.replace(oldFunc, newFunc);
fs.writeFileSync('src/pages/ielts/Dashboard.tsx', content, 'utf8');
console.log('Done');
