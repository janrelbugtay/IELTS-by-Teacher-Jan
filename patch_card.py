import re

filepath = 'src/pages/CourseDetails.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Add publishConfig import to CourseDetails
if "import { doc, getDoc, setDoc } from 'firebase/firestore'" not in content:
    content = content.replace("import { doc, setDoc } from 'firebase/firestore';", "import { doc, getDoc, setDoc } from 'firebase/firestore';")

# Add a component for the Homework Card to handle fetching/setting publish config locally
card_component = """const HomeworkCard = ({ test, isAdmin }: { test: any, isAdmin: boolean }) => {
  const [publishConfig, setPublishConfig] = useState({ part1: true, part2: true });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const docRef = doc(db, 'homeworkConfig', test.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPublishConfig(docSnap.data() as any);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchConfig();
  }, [test.id]);

  const handleTogglePublish = async (part: 'part1' | 'part2') => {
    const newConfig = { ...publishConfig, [part]: !publishConfig[part] };
    setPublishConfig(newConfig);
    try {
      const docRef = doc(db, 'homeworkConfig', test.id);
      await setDoc(docRef, newConfig, { merge: true });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-colors z-10"></div>
        <img 
          src={test.image} 
          alt={test.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        <div className="absolute top-4 left-4 z-20">
          <span className="bg-white/90 backdrop-blur-sm text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
            {test.skill}
          </span>
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2">{test.title}</h3>
        
        {isAdmin && (
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-xl mb-4">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-yellow-800">
              <span className="bg-yellow-500 text-white px-1.5 py-0.5 rounded text-[10px]">ADMIN</span>
              Publish Parts
            </div>
            <div className="flex flex-col gap-2">
              <label className="flex items-center justify-between cursor-pointer group bg-white p-1.5 rounded border border-yellow-100 shadow-sm">
                <span className="text-xs font-semibold text-gray-700">Part 1</span>
                <div className="relative inline-block w-8 h-4 align-middle select-none">
                  <input type="checkbox" checked={publishConfig?.part1} onChange={() => handleTogglePublish('part1')} className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out z-10 peer" style={{ transform: publishConfig?.part1 ? 'translateX(1rem)' : 'translateX(0)', borderColor: publishConfig?.part1 ? '#3b82f6' : '#e5e7eb' }} />
                  <label className="toggle-label block overflow-hidden h-4 rounded-full bg-gray-200 cursor-pointer peer-checked:bg-blue-500 transition-colors duration-200 ease-in-out"></label>
                </div>
              </label>
              <label className="flex items-center justify-between cursor-pointer group bg-white p-1.5 rounded border border-yellow-100 shadow-sm">
                <span className="text-xs font-semibold text-gray-700">Part 2</span>
                <div className="relative inline-block w-8 h-4 align-middle select-none">
                  <input type="checkbox" checked={publishConfig?.part2} onChange={() => handleTogglePublish('part2')} className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out z-10 peer" style={{ transform: publishConfig?.part2 ? 'translateX(1rem)' : 'translateX(0)', borderColor: publishConfig?.part2 ? '#3b82f6' : '#e5e7eb' }} />
                  <label className="toggle-label block overflow-hidden h-4 rounded-full bg-gray-200 cursor-pointer peer-checked:bg-blue-500 transition-colors duration-200 ease-in-out"></label>
                </div>
              </label>
            </div>
          </div>
        )}

        <div className="mb-6"></div>
        
        <div className="mt-auto">
          <Link 
            to={`/test/writing/${test.id}`}
            className="w-full py-3 bg-[#1E4DB7] text-white font-bold rounded-xl hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
          >
            Start <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};"""

# Insert the component before the CourseDetails component
if "const HomeworkCard = " not in content:
    content = content.replace("export function CourseDetails() {", card_component + "\n\nexport function CourseDetails() {")

# Replace the map block with the HomeworkCard
bad_map = """          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map(test => (
              <div key={test.id} className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col">
                <div className="relative h-48 overflow-hidden">
                  <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-colors z-10"></div>
                  <img 
                    src={test.image} 
                    alt={test.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-4 left-4 z-20">
                    <span className="bg-white/90 backdrop-blur-sm text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                      {test.skill}
                    </span>
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2">{test.title}</h3>
                  <div className="mb-6"></div>
                  
                  <div className="mt-auto">
                    <Link 
                      to={`/test/writing/${test.id}`}
                      className="w-full py-3 bg-[#1E4DB7] text-white font-bold rounded-xl hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
                    >
                      Start <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>"""

good_map = """          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map(test => (
              <HomeworkCard key={test.id} test={test} isAdmin={isAdmin} />
            ))}
          </div>"""

content = content.replace(bad_map, good_map)

with open(filepath, 'w') as f:
    f.write(content)

print("CourseDetails patched")
