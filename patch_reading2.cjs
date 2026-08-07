const fs = require('fs');
let code = fs.readFileSync('src/pages/ComputerReadingTest.tsx', 'utf8');

const target2 = `                                      <div key={idx} className="mt-1 font-normal">
                                        <span className="uppercase text-[1.1em] underline decoration-2 font-bold">{keyword}</span>
                                        <span>{rest}</span>
                                      </div>`;

const replacement2 = `                                      <div key={idx} className="mt-1 font-normal">
                                        <span className="uppercase text-[1.1em] underline decoration-2">{keyword}</span>
                                        <span>{rest}</span>
                                      </div>`;

if (code.includes(target2)) {
  fs.writeFileSync('src/pages/ComputerReadingTest.tsx', code.replace(target2, replacement2));
  console.log("Patched 2 successfully");
} else {
  console.log("Target 2 not found");
}
