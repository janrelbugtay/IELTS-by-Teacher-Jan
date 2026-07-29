const fs = require('fs');
let code = fs.readFileSync('src/pages/ielts/Dashboard.tsx', 'utf8');

const listTitleSearch = `
                                </div>
                              )}
                              <p className="text-sm font-bold text-slate-900">{title}</p>
                              {isAdmin && (
                                <button onClick={(e) => { e.stopPropagation(); setEditingTitleId(sub.id); setEditTitleValue(title); }} className="text-slate-400 hover:text-blue-600 p-1">
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </td>`;

const listTitleReplace = `
                                </div>
                              )}
                              <p className="text-sm font-bold text-slate-900">{title}</p>
                              {isAdmin && (
                                <button onClick={(e) => { e.stopPropagation(); setEditingTitleId(sub.id); setEditTitleValue(title); }} className="text-slate-400 hover:text-blue-600 p-1">
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </td>`;

// Wait, the "Test Name" column doesn't have a full edit for the offline test. The inline edit exists in ALL tables!
// It's probably better to just put the new full Edit button next to the Trash2 icon in the action column.
