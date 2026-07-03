const fs = require('fs');
const html = fs.readFileSync('January Reading Practice.html', 'utf8');

const passagesMatch = html.match(/const passagesData = (\[[\s\S]*?\]);\s*const ANSWER_KEY/);
if (passagesMatch) {
  console.log("Found passagesData");
} else {
  console.log("Could not find passagesData in HTML");
}
