const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/pages/JanuaryListeningTest.tsx');
let content = fs.readFileSync(file, 'utf8');

const target = `                    </ul>
                </div>
              </div>
              </div>
          </div>
      </div>
<div className="bg-[#e1e5eb] border-t border-gray-300 p-2 flex justify-between items-center shrink-0 shadow-[0_-2px_5px_rgba(0,0,0,0.05)] z-20 overflow-x-auto">`;

const replace = `                    </ul>
                </div>
              </div>
          </div>
      </div>
<div className="bg-[#e1e5eb] border-t border-gray-300 p-2 flex justify-between items-center shrink-0 shadow-[0_-2px_5px_rgba(0,0,0,0.05)] z-20 overflow-x-auto">`;

content = content.replace(target, replace);
fs.writeFileSync(file, content);
