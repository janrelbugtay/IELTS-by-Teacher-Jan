const fs = require('fs');
const file = 'src/pages/JanuaryListeningTest.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `                    </ul>
                                                            
          </div>
<div className="bg-[#e1e5eb] border-t border-gray-300 p-2 flex justify-between items-center shrink-0 shadow-[0_-2px_5px_rgba(0,0,0,0.05)] z-20 overflow-x-auto">`;

const replace = `                    </ul>
                </div>
              </div>
          </div>
      </div>
<div className="bg-[#e1e5eb] border-t border-gray-300 p-2 flex justify-between items-center shrink-0 shadow-[0_-2px_5px_rgba(0,0,0,0.05)] z-20 overflow-x-auto">`;

// Instead of string match, just replace everything between </ul> and <div className="bg-[#e1e5eb] with the 4 divs
content = content.replace(/<\/ul>[\s\S]*?<div className="bg-\[#e1e5eb\] border-t border-gray-300 p-2 flex justify-between items-center shrink-0 shadow-\[0_-2px_5px_rgba\(0,0,0,0\.05\)\] z-20 overflow-x-auto">/, replace);

fs.writeFileSync(file, content);
