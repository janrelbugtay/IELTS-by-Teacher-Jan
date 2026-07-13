const fs = require('fs');
let code = fs.readFileSync('src/pages/JanuaryListeningTest.tsx', 'utf8');

// The end of part 4 has too many divs
const target = `                    </ul>
                </div>
            </div></div>
              </div>
      </div>
<div className="bg-[#e1e5eb] border-t border-gray-300 p-2`;

const replace = `                    </ul>
                </div>
              </div>
          </div>
      </div>
<div className="bg-[#e1e5eb] border-t border-gray-300 p-2`;

code = code.replace(target, replace);
fs.writeFileSync('src/pages/JanuaryListeningTest.tsx', code);
