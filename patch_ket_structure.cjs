const fs = require('fs');
let content = fs.readFileSync('src/components/KETCalculator.tsx', 'utf8');

// 1. Initial Scores
content = content.replace(
  "reading: { p1: 0, p2: 0, p3: 0, p4: 0, p5: 0, p6: 0 }",
  "reading: { p1: 0, p2: 0, p3: 0, p4: 0, p5: 0 }"
);
content = content.replace(
  "p1c: 0, p1a: 0, p1o: 0, p1l: 0,\n      p2c: 0, p2a: 0, p2o: 0, p2l: 0,",
  "p1c: 0, p1o: 0, p1l: 0,\n      p2c: 0, p2o: 0, p2l: 0,"
);
content = content.replace(
  "listening: { p1: 0, p2: 0, p3: 0, p4: 0 }",
  "listening: { p1: 0, p2: 0, p3: 0, p4: 0, p5: 0 }"
);

// 2. Totals
content = content.replace(
  "reading: r.p1 + r.p2 + r.p3 + r.p4 + r.p5 + r.p6",
  "reading: r.p1 + r.p2 + r.p3 + r.p4 + r.p5"
);
content = content.replace(
  "writing: w.p1c + w.p1a + w.p1o + w.p1l + w.p2c + w.p2a + w.p2o + w.p2l",
  "writing: w.p1c + w.p1o + w.p1l + w.p2c + w.p2o + w.p2l"
);
content = content.replace(
  "listening: l.p1 + l.p2 + l.p3 + l.p4",
  "listening: l.p1 + l.p2 + l.p3 + l.p4 + l.p5"
);

// 3. Reading section UI
// We have <Select label="Part X">. For A2 Key reading: Part 1(6), Part 2(7), Part 3(5), Part 4(6), Part 5(6).
const oldReadingUI = `<Select label="Part 1 (0-5)" value={scores.reading.p1} max={5} onChange={(v) => handleScoreChange('reading', 'p1', v)} theme={activeTheme} />
        <Select label="Part 2 (0-5)" value={scores.reading.p2} max={5} onChange={(v) => handleScoreChange('reading', 'p2', v)} theme={activeTheme} />
        <Select label="Part 3 (0-5)" value={scores.reading.p3} max={5} onChange={(v) => handleScoreChange('reading', 'p3', v)} theme={activeTheme} />
        <Select label="Part 4 (0-5)" value={scores.reading.p4} max={5} onChange={(v) => handleScoreChange('reading', 'p4', v)} theme={activeTheme} />
        <Select label="Part 5 (0-6)" value={scores.reading.p5} max={6} onChange={(v) => handleScoreChange('reading', 'p5', v)} theme={activeTheme} />
        <Select label="Part 6 (0-6)" value={scores.reading.p6} max={6} onChange={(v) => handleScoreChange('reading', 'p6', v)} theme={activeTheme} />`;

const newReadingUI = `<Select label="Part 1 (0-6)" value={scores.reading.p1} max={6} onChange={(v) => handleScoreChange('reading', 'p1', v)} theme={activeTheme} />
        <Select label="Part 2 (0-7)" value={scores.reading.p2} max={7} onChange={(v) => handleScoreChange('reading', 'p2', v)} theme={activeTheme} />
        <Select label="Part 3 (0-5)" value={scores.reading.p3} max={5} onChange={(v) => handleScoreChange('reading', 'p3', v)} theme={activeTheme} />
        <Select label="Part 4 (0-6)" value={scores.reading.p4} max={6} onChange={(v) => handleScoreChange('reading', 'p4', v)} theme={activeTheme} />
        <Select label="Part 5 (0-6)" value={scores.reading.p5} max={6} onChange={(v) => handleScoreChange('reading', 'p5', v)} theme={activeTheme} />`;

content = content.replace(oldReadingUI, newReadingUI);

// 4. Writing section UI
const oldWritingP1 = `<Select label="Content (0-5)" value={scores.writing.p1c} max={5} onChange={(v) => handleScoreChange('writing', 'p1c', v)} theme={activeTheme} />
             <Select label="Achievement (0-5)" value={scores.writing.p1a} max={5} onChange={(v) => handleScoreChange('writing', 'p1a', v)} theme={activeTheme} />
             <Select label="Organisation (0-5)" value={scores.writing.p1o} max={5} onChange={(v) => handleScoreChange('writing', 'p1o', v)} theme={activeTheme} />
             <Select label="Language (0-5)" value={scores.writing.p1l} max={5} onChange={(v) => handleScoreChange('writing', 'p1l', v)} theme={activeTheme} />`;
             
const newWritingP1 = `<Select label="Content (0-5)" value={scores.writing.p1c} max={5} onChange={(v) => handleScoreChange('writing', 'p1c', v)} theme={activeTheme} />
             <Select label="Organisation (0-5)" value={scores.writing.p1o} max={5} onChange={(v) => handleScoreChange('writing', 'p1o', v)} theme={activeTheme} />
             <Select label="Language (0-5)" value={scores.writing.p1l} max={5} onChange={(v) => handleScoreChange('writing', 'p1l', v)} theme={activeTheme} />`;

const oldWritingP2 = `<Select label="Content (0-5)" value={scores.writing.p2c} max={5} onChange={(v) => handleScoreChange('writing', 'p2c', v)} theme={activeTheme} />
             <Select label="Achievement (0-5)" value={scores.writing.p2a} max={5} onChange={(v) => handleScoreChange('writing', 'p2a', v)} theme={activeTheme} />
             <Select label="Organisation (0-5)" value={scores.writing.p2o} max={5} onChange={(v) => handleScoreChange('writing', 'p2o', v)} theme={activeTheme} />
             <Select label="Language (0-5)" value={scores.writing.p2l} max={5} onChange={(v) => handleScoreChange('writing', 'p2l', v)} theme={activeTheme} />`;

const newWritingP2 = `<Select label="Content (0-5)" value={scores.writing.p2c} max={5} onChange={(v) => handleScoreChange('writing', 'p2c', v)} theme={activeTheme} />
             <Select label="Organisation (0-5)" value={scores.writing.p2o} max={5} onChange={(v) => handleScoreChange('writing', 'p2o', v)} theme={activeTheme} />
             <Select label="Language (0-5)" value={scores.writing.p2l} max={5} onChange={(v) => handleScoreChange('writing', 'p2l', v)} theme={activeTheme} />`;

content = content.replace(oldWritingP1, newWritingP1);
content = content.replace(oldWritingP2, newWritingP2);

// Make grid for writing 3 cols instead of 4
content = content.replace(/className="grid grid-cols-2 md:grid-cols-4 gap-4"/g, 'className="grid grid-cols-1 md:grid-cols-3 gap-4"');

// 5. Listening section UI
const oldListeningUI = `<Select label="Part 1 (0-7)" value={scores.listening.p1} max={7} onChange={(v) => handleScoreChange('listening', 'p1', v)} theme={activeTheme} />
        <Select label="Part 2 (0-6)" value={scores.listening.p2} max={6} onChange={(v) => handleScoreChange('listening', 'p2', v)} theme={activeTheme} />
        <Select label="Part 3 (0-6)" value={scores.listening.p3} max={6} onChange={(v) => handleScoreChange('listening', 'p3', v)} theme={activeTheme} />
        <Select label="Part 4 (0-6)" value={scores.listening.p4} max={6} onChange={(v) => handleScoreChange('listening', 'p4', v)} theme={activeTheme} />`;

const newListeningUI = `<Select label="Part 1 (0-5)" value={scores.listening.p1} max={5} onChange={(v) => handleScoreChange('listening', 'p1', v)} theme={activeTheme} />
        <Select label="Part 2 (0-5)" value={scores.listening.p2} max={5} onChange={(v) => handleScoreChange('listening', 'p2', v)} theme={activeTheme} />
        <Select label="Part 3 (0-5)" value={scores.listening.p3} max={5} onChange={(v) => handleScoreChange('listening', 'p3', v)} theme={activeTheme} />
        <Select label="Part 4 (0-5)" value={scores.listening.p4} max={5} onChange={(v) => handleScoreChange('listening', 'p4', v)} theme={activeTheme} />
        <Select label="Part 5 (0-5)" value={scores.listening.p5} max={5} onChange={(v) => handleScoreChange('listening', 'p5', v)} theme={activeTheme} />`;

content = content.replace(oldListeningUI, newListeningUI);
// Change listening grid 4 -> 5 cols? Or just 3-4? Let's leave grid-cols-2 md:grid-cols-5.
content = content.replace(/className="grid grid-cols-2 md:grid-cols-4 gap-6"(?!.*Part 1)/, 'className="grid grid-cols-2 md:grid-cols-5 gap-6"');

fs.writeFileSync('src/components/KETCalculator.tsx', content);
console.log("Patched structure");
