const fs = require('fs');
let code = fs.readFileSync('src/pages/ComputerSpeakingTest.tsx', 'utf8');

const target = `                            }
                          } catch (fbErr) {
                             console.warn("Firestore save failed, falling back to IndexedDB", fbErr);
                             await saveAudioToIndexedDB(localId, blob);
                             return { qId, url: \`idb:\${localId}\` };
                          }
                        }
                      } catch (err) {`;

const repl = `                            }
                          } catch (fbErr) {
                             console.warn("Firestore save failed, falling back to IndexedDB", fbErr);
                             await saveAudioToIndexedDB(localId, blob);
                             return { qId, url: \`idb:\${localId}\` };
                          }
                        }
                      }
                      } catch (err) {`;

if (code.includes(target)) {
    code = code.replace(target, repl);
    fs.writeFileSync('src/pages/ComputerSpeakingTest.tsx', code);
    console.log("Fixed syntax error");
} else {
    console.log("Target not found");
}
