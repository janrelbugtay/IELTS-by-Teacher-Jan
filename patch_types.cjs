const fs = require('fs');
let code = fs.readFileSync('src/components/SpeakingPerformanceReport.tsx', 'utf8');

code = code.replace(
  "const GrammarCorrectionCard = ({ correction, isEditing, onChange, onRemove }: { correction: GrammarCorrection, isEditing: boolean, onChange: (c: GrammarCorrection) => void, onRemove: () => void }) => {",
  "const GrammarCorrectionCard = ({ correction, isEditing, onChange, onRemove }: { key?: string | number, correction: GrammarCorrection, isEditing: boolean, onChange: (c: GrammarCorrection) => void, onRemove: () => void }) => {"
);

code = code.replace(
  "const VocabUpgradeCard = ({ item, isEditing, onChange, onRemove }: { item: VocabUpgrade, isEditing: boolean, onChange: (u: VocabUpgrade) => void, onRemove: () => void }) => {",
  "const VocabUpgradeCard = ({ item, isEditing, onChange, onRemove }: { key?: string | number, item: VocabUpgrade, isEditing: boolean, onChange: (u: VocabUpgrade) => void, onRemove: () => void }) => {"
);

fs.writeFileSync('src/components/SpeakingPerformanceReport.tsx', code);
