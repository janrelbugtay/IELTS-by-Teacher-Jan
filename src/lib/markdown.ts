export const renderMarkdown = (text: string) => {
    if (!text) return { __html: '' };
    
    let html = text;
    const tables: string[] = [];
    
    html = html.replace(/((?:\|[^\n]+\|\n?)+)/g, (match) => {
      if (!match.includes('|---')) return match;
      const rows = match.trim().split('\n');
      let tableHtml = '';
      rows.forEach((row, i) => {
        if (row.includes('|---')) return;
        let cells = row.split('|');
        if (cells[0].trim() === '') cells.shift();
        if (cells[cells.length - 1].trim() === '') cells.pop();
        
        const cellTag = i === 0 ? 'th' : 'td';
        const cellClass = i === 0 
          ? 'bg-blue-50 font-bold p-3 border border-blue-200 text-blue-900' 
          : 'p-3 border border-slate-200 text-slate-700 bg-white';
        
        tableHtml += `<tr>${cells.map(c => `<${cellTag} class="${cellClass}">${c.trim()}</${cellTag}>`).join('')}</tr>`;
      });
      const tableWrapper = `<div class="overflow-x-auto my-6 rounded-xl shadow-sm"><table class="w-full text-left border-collapse">${tableHtml}</table></div>`;
      tables.push(tableWrapper);
      return `__TABLE_PLACEHOLDER_${tables.length - 1}__`;
    });

    html = html.replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold mt-8 mb-3 text-blue-800 flex items-center">$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2 class="text-xl font-extrabold mt-10 mb-4 text-slate-800 border-b-2 border-blue-100 pb-2 flex items-center"><span class="bg-blue-100 text-blue-800 p-1 rounded mr-3 text-sm">ERA</span> $1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-black mt-4 mb-4 text-blue-900">$1</h1>');
    
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em class="italic text-slate-700">$1</em>');
    html = html.replace(/~~(.*?)~~/g, '<del class="text-red-600 bg-red-50 px-1.5 py-0.5 rounded font-medium line-through decoration-2">$1</del>');
    
    html = html.replace(/❌/g, '<span class="text-red-500 mr-1 text-lg">❌</span>');
    html = html.replace(/✅/g, '<span class="text-green-600 mr-1 text-lg">✅</span>');
    html = html.replace(/🟢/g, '<span class="text-green-500 mr-1 text-lg">🟢</span>');

    html = html.replace(/^- \*\*(.*?)\*\*:/gm, '<li class="ml-4 mt-2 mb-1 list-none"><span class="font-bold text-slate-800 text-lg mr-2">•</span><strong class="font-bold text-slate-900">$1:</strong>');
    html = html.replace(/^- (.*$)/gm, '<li class="ml-6 mb-2 list-disc text-slate-700 marker:text-blue-400">$1</li>');

    html = html.replace(/\n\n/g, '</p><p class="mt-4">');
    html = html.replace(/\n/g, '<br/>');
    
    html = `<p>${html}</p>`;
    
    tables.forEach((table, i) => {
      html = html.replace(`__TABLE_PLACEHOLDER_${i}__`, `</p>${table}<p>`);
    });

    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p><br\/>/g, '<p>');

    return { __html: html };
  };
