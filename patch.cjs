const fs = require('fs');
let content = fs.readFileSync('src/pages/SeptemberListeningTest.tsx', 'utf8');

// Add Icons
const icons = `
const SettingsIcon = (p: any) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width={p.size||24} height={p.size||24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
const Highlighter = (p: any) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width={p.size||24} height={p.size||24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/></svg>;
const Edit3 = (p: any) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width={p.size||24} height={p.size||24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>;
const Copy = (p: any) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width={p.size||24} height={p.size||24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
const CheckCircle2 = (p: any) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width={p.size||24} height={p.size||24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>;
`;

content = content.replace('export default function SeptemberListeningTest() {', icons + '\nexport default function SeptemberListeningTest() {');

// Add states
const states = `
  // --- SETTINGS STATE ---
  const [textSize, setTextSize] = useState('standard'); 
  const [colorTheme, setColorTheme] = useState('standard');
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  // --- HIGHLIGHT & NOTES STATE ---
  const [popover, setPopover] = useState<any>(null);
  const [noteInput, setNoteInput] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const [highlightRanges, setHighlightRanges] = useState<Range[]>([]);
  const [notesList, setNotesList] = useState<any[]>([]);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopover(null);
      }
      if (showSettings && settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [showSettings]);

  useEffect(() => {
    if ('highlights' in (CSS as any)) {
      try {
        const highlight = new (window as any).Highlight(...highlightRanges);
        (CSS as any).highlights.set('test-highlight', highlight);
      } catch(e) {}
    }
  }, [highlightRanges]);

  const handleTextSelect = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    // Only show popover if selecting inside main container
    if (mainContainerRef.current && mainContainerRef.current.contains(range.startContainer)) {
      setIsCopied(false);
      setPopover({
        type: 'new',
        x: rect.left + (rect.width / 2),
        y: rect.top,
        range: range.cloneRange(),
        text: selection.toString()
      });
    }
  };

  const addHighlight = (noteText = '') => {
    if (!popover) return;
    const newRanges = [...highlightRanges, popover.range];
    setHighlightRanges(newRanges);
    if (noteText) {
       setNotesList(prev => [...prev, { text: noteText, y: popover.y }]);
    }
    setPopover(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleCopyText = () => {
    if (popover && popover.text) {
      navigator.clipboard.writeText(popover.text);
      setIsCopied(true);
      setTimeout(() => setPopover(null), 1500);
    }
  };

  const theme = {
    bg: colorTheme === 'standard' ? 'bg-[#e6eaf2]' : colorTheme === 'white-on-black' ? 'bg-[#121212]' : 'bg-[#111111]',
    text: colorTheme === 'standard' ? 'text-[#333]' : colorTheme === 'white-on-black' ? 'text-white' : 'text-[#f0f000]',
    container: colorTheme === 'standard' ? 'bg-white shadow-xl border-gray-200' : 'bg-[#1e1e1e] border-gray-700',
    muted: colorTheme === 'standard' ? 'text-gray-500' : 'text-gray-400',
    border: colorTheme === 'standard' ? 'border-gray-200' : 'border-gray-700',
    inputBg: colorTheme === 'standard' ? 'bg-white text-black' : 'bg-[#333] text-white border-gray-600',
    headerBg: colorTheme === 'standard' ? 'bg-[#f4f7f8] border-gray-300' : 'bg-[#2a2a2a] border-gray-700',
  };

  const textSizeClass = textSize === 'standard' ? 'text-[15px]' : textSize === 'large' ? 'text-[18px]' : 'text-[22px]';
`;

content = content.replace('const [currentPartIndex, setCurrentPartIndex] = useState(1);', 'const [currentPartIndex, setCurrentPartIndex] = useState(1);' + states);

fs.writeFileSync('src/pages/SeptemberListeningTest.tsx', content);
