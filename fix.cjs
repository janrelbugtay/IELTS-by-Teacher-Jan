const fs = require('fs');
let file = fs.readFileSync('src/pages/ComputerWritingTest.tsx', 'utf8');

const dictCode = `const TEST_DURATION = 3600; // 60 minutes
const STORAGE_KEY = 'ielts_sim_data';

const getCustomPrompt = (id: string | undefined) => {
    const defaultPrompt = {
        t1Title: "The chart below gives information about global energy consumption by source from 2000 to 2020.",
        t1Desc: "Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
        t1Content: (
            <>
                <h3 className="text-center font-bold mb-4 mt-10 text-gray-700">Global Energy Consumption (Exajoules)</h3>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full border-collapse mt-0" style={{ fontSize: 'inherit' }}>
                        <thead>
                            <tr>
                                <th className="bg-slate-50 text-left p-3 border border-slate-300 font-bold">Energy Source</th>
                                <th className="bg-slate-50 text-left p-3 border border-slate-300 font-bold">2000</th>
                                <th className="bg-slate-50 text-left p-3 border border-slate-300 font-bold">2010</th>
                                <th className="bg-slate-50 text-left p-3 border border-slate-300 font-bold">2020</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="hover:bg-gray-50"><td className="p-3 border border-slate-300">Fossil Fuels</td><td className="p-3 border border-slate-300">350</td><td className="p-3 border border-slate-300">420</td><td className="p-3 border border-slate-300">400</td></tr>
                            <tr className="hover:bg-gray-50"><td className="p-3 border border-slate-300">Nuclear</td><td className="p-3 border border-slate-300">25</td><td className="p-3 border border-slate-300">28</td><td className="p-3 border border-slate-300">26</td></tr>
                            <tr className="hover:bg-gray-50"><td className="p-3 border border-slate-300">Renewables</td><td className="p-3 border border-slate-300">30</td><td className="p-3 border border-slate-300">45</td><td className="p-3 border border-slate-300">85</td></tr>
                            <tr className="hover:bg-gray-50 font-bold bg-gray-50"><td className="p-3 border border-slate-300">Total</td><td className="p-3 border border-slate-300">405</td><td className="p-3 border border-slate-300">493</td><td className="p-3 border border-slate-300">511</td></tr>
                        </tbody>
                    </table>
                </div>
            </>
        ),
        t1Raw: "The chart below gives information about global energy consumption by source from 2000 to 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. (Assume the chart shows global energy consumption increasing from 2000 to 2020, with Oil being the highest but relatively stable, Coal rising sharply until 2010 then plateauing, Natural Gas rising steadily, and Renewables starting low but growing rapidly).",
        t2Prompt: (
            <>
                <p className="font-bold mb-4">Some people think that universities should provide graduates with the knowledge and skills needed in the workplace.</p>
                <p className="font-bold mb-4">Others think that the true function of a university should be to give access to knowledge for its own sake, regardless of whether the course is useful to an employer.</p>
            </>
        ),
        t2Desc: "Discuss both these views and give your own opinion.",
        t2Raw: "Some people think that universities should provide graduates with the knowledge and skills needed in the workplace. Others think that the true function of a university should be to give access to knowledge for its own sake, regardless of whether the course is useful to an employer. Discuss both these views and give your own opinion."
    };

    if (!id) return defaultPrompt;

    switch (id) {
        case '31': // August
            return {
                t1Title: "The table below shows the percentage of the population in four different countries who lived in cities in 1990 and 2010, with projections for 2030.",
                t1Desc: "Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
                t1Content: (
                    <div className="overflow-x-auto rounded-lg border border-gray-200 mt-10">
                        <table className="w-full border-collapse mt-0" style={{ fontSize: 'inherit' }}>
                            <thead>
                                <tr>
                                    <th className="bg-slate-50 text-left p-3 border border-slate-300 font-bold">Country</th>
                                    <th className="bg-slate-50 text-left p-3 border border-slate-300 font-bold">1990</th>
                                    <th className="bg-slate-50 text-left p-3 border border-slate-300 font-bold">2010</th>
                                    <th className="bg-slate-50 text-left p-3 border border-slate-300 font-bold">2030 (proj)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="hover:bg-gray-50"><td className="p-3 border border-slate-300">USA</td><td className="p-3 border border-slate-300">75%</td><td className="p-3 border border-slate-300">82%</td><td className="p-3 border border-slate-300">87%</td></tr>
                                <tr className="hover:bg-gray-50"><td className="p-3 border border-slate-300">China</td><td className="p-3 border border-slate-300">26%</td><td className="p-3 border border-slate-300">49%</td><td className="p-3 border border-slate-300">68%</td></tr>
                                <tr className="hover:bg-gray-50"><td className="p-3 border border-slate-300">India</td><td className="p-3 border border-slate-300">25%</td><td className="p-3 border border-slate-300">30%</td><td className="p-3 border border-slate-300">40%</td></tr>
                                <tr className="hover:bg-gray-50"><td className="p-3 border border-slate-300">UK</td><td className="p-3 border border-slate-300">89%</td><td className="p-3 border border-slate-300">90%</td><td className="p-3 border border-slate-300">92%</td></tr>
                            </tbody>
                        </table>
                    </div>
                ),
                t1Raw: "The table below shows the percentage of the population in four different countries (USA, China, India, UK) who lived in cities in 1990, 2010, and projected for 2030. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
                t2Prompt: (
                    <>
                        <p className="font-bold mb-4">In many countries, an increasing number of people are using the internet to diagnose their own medical conditions rather than seeing a doctor.</p>
                        <p className="font-bold mb-4">Do you think this is a positive or negative development?</p>
                    </>
                ),
                t2Desc: "Give reasons for your answer and include any relevant examples from your own knowledge or experience.",
                t2Raw: "In many countries, an increasing number of people are using the internet to diagnose their own medical conditions rather than seeing a doctor. Do you think this is a positive or negative development? Give reasons for your answer and include any relevant examples from your own knowledge or experience."
            };
        case '35': // September
            return {
                t1Title: "The pie charts below show the main reasons for migration to and from the UK in 2007.",
                t1Desc: "Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
                t1Content: (
                    <div className="mt-10 p-6 border border-gray-200 rounded-lg bg-gray-50 text-center italic text-sm text-gray-700 leading-relaxed">
                        [Pie Chart 1: Immigration to UK (2007): Formal study 26%, Definite job 30%, Looking for work 12%, Accompany/join 15%, Other 11%, No reason stated 6%.]<br/><br/>
                        [Pie Chart 2: Emigration from UK (2007): Formal study 4%, Definite job 29%, Looking for work 22%, Accompany/join 13%, Other 14%, No reason stated 18%]
                    </div>
                ),
                t1Raw: "The pie charts below show the main reasons for migration to and from the UK in 2007. Immigration reasons: Formal study 26%, Definite job 30%, Looking for work 12%, Accompany/join 15%, Other 11%, No reason stated 6%. Emigration reasons: Formal study 4%, Definite job 29%, Looking for work 22%, Accompany/join 13%, Other 14%, No reason stated 18%. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
                t2Prompt: (
                    <>
                        <p className="font-bold mb-4">Some people think that all teenagers should be required to do unpaid work in their free time to help the local community. They believe this would benefit both the individual teenager and society as a whole.</p>
                        <p className="font-bold mb-4">Do you agree or disagree?</p>
                    </>
                ),
                t2Desc: "Give reasons for your answer and include any relevant examples from your own knowledge or experience.",
                t2Raw: "Some people think that all teenagers should be required to do unpaid work in their free time to help the local community. They believe this would benefit both the individual teenager and society as a whole. Do you agree or disagree? Give reasons for your answer and include any relevant examples from your own knowledge or experience."
            };
        case '39': // October
            return {
                t1Title: "The bar chart below shows the percentage of Australian men and women in different age groups who did regular physical activity in 2010.",
                t1Desc: "Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
                t1Content: (
                    <div className="mt-10 p-6 border border-gray-200 rounded-lg bg-gray-50 text-center italic text-sm text-gray-700 leading-relaxed">
                        [Bar Chart Data (2010): Age 15-24: Men 52.8%, Women 47.7% | Age 25-34: Men 42.2%, Women 48.9% | Age 35-44: Men 39.5%, Women 52.5% | Age 45-54: Men 43.1%, Women 53.3% | Age 55-64: Men 45.1%, Women 53.0% | Age 65 and over: Men 46.7%, Women 47.1%]
                    </div>
                ),
                t1Raw: "The bar chart below shows the percentage of Australian men and women in different age groups who did regular physical activity in 2010. Data: Age 15-24: Men 52.8%, Women 47.7% | Age 25-34: Men 42.2%, Women 48.9% | Age 35-44: Men 39.5%, Women 52.5% | Age 45-54: Men 43.1%, Women 53.3% | Age 55-64: Men 45.1%, Women 53.0% | Age 65+: Men 46.7%, Women 47.1%. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
                t2Prompt: (
                    <>
                        <p className="font-bold mb-4">Nowadays, many families have both parents working full time, leaving little time for children.</p>
                        <p className="font-bold mb-4">What problems does this cause, and how can they be solved?</p>
                    </>
                ),
                t2Desc: "Give reasons for your answer and include any relevant examples from your own knowledge or experience.",
                t2Raw: "Nowadays, many families have both parents working full time, leaving little time for children. What problems does this cause, and how can they be solved? Give reasons for your answer and include any relevant examples from your own knowledge or experience."
            };
        case '43': // November
            return {
                t1Title: "The diagram below shows the life cycle of a salmon, from egg to adult fish.",
                t1Desc: "Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
                t1Content: (
                    <div className="mt-10 p-6 border border-gray-200 rounded-lg bg-gray-50 text-center italic text-sm text-gray-700 leading-relaxed">
                        [Process Diagram: Eggs in river reeds (upper river) -&gt; Fry (3-8 cm) living in lower river (5-6 months) -&gt; Smolts (12-15 cm) moving to the open ocean (4-5 years) -&gt; Adult Salmon (70-76 cm) returning to the upper river to spawn.]
                    </div>
                ),
                t1Raw: "The diagram below shows the life cycle of a salmon, from egg to adult fish. Stages: 1) Eggs in river reeds (upper river). 2) Fry (3-8 cm) living in lower river for 5-6 months. 3) Smolts (12-15 cm) moving to the open ocean for 4-5 years. 4) Adult Salmon (70-76 cm) returning to the upper river to spawn. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
                t2Prompt: (
                    <>
                        <p className="font-bold mb-4">Some people think that environmental problems are too big for individuals to solve, and that only governments and large companies can make a difference.</p>
                        <p className="font-bold mb-4">To what extent do you agree or disagree?</p>
                    </>
                ),
                t2Desc: "Give reasons for your answer and include any relevant examples from your own knowledge or experience.",
                t2Raw: "Some people think that environmental problems are too big for individuals to solve, and that only governments and large companies can make a difference. To what extent do you agree or disagree? Give reasons for your answer and include any relevant examples from your own knowledge or experience."
            };
        case '47': // December
            return {
                t1Title: "The plans below show a student accommodation building in 2010 and as it is now.",
                t1Desc: "Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
                t1Content: (
                    <div className="mt-10 p-6 border border-gray-200 rounded-lg bg-gray-50 text-center italic text-sm text-gray-700 leading-relaxed">
                        [Map 1: 2010. Long central corridor. Left side: Student bedrooms, large shared bathroom. Right side: Kitchen, living room, gardens outside.]<br/><br/>
                        [Map 2: Now. Long central corridor. Left side: En-suite bedrooms (each with small private bathroom). Right side: Enlarged kitchen area, living room removed to add more bedrooms, gardens converted to a car park.]
                    </div>
                ),
                t1Raw: "The plans below show a student accommodation building in 2010 and as it is now. 2010 layout: Long central corridor. Left side has student bedrooms and a large shared bathroom. Right side has a kitchen, living room, and gardens outside. Present layout: Long central corridor. Left side has en-suite bedrooms (with private bathrooms). Right side has an enlarged kitchen area, living room replaced with more bedrooms, and gardens converted to a car park. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
                t2Prompt: (
                    <>
                        <p className="font-bold mb-4">In many modern societies, the gap between the richest and poorest people is increasing.</p>
                        <p className="font-bold mb-4">What problems can this situation cause? What can be done to reduce this gap?</p>
                    </>
                ),
                t2Desc: "Give reasons for your answer and include any relevant examples from your own knowledge or experience.",
                t2Raw: "In many modern societies, the gap between the richest and poorest people is increasing. What problems can this situation cause? What can be done to reduce this gap? Give reasons for your answer and include any relevant examples from your own knowledge or experience."
            };
        default:
            return defaultPrompt;
    }
};`;

file = file.replace(/const TEST_DURATION = 3600; \/\/ 60 minutes\nconst STORAGE_KEY = 'ielts_sim_data';/, dictCode);

// Replace PromptPanel
const oldPromptPanel = `const PromptPanel = ({ activePart, textSize }: any) => (
    <div className="flex-1 bg-white border border-gray-200 p-8 overflow-y-auto shadow-inner md:rounded-l-md" style={{ fontSize: \`\${textSize}px\` }}>
        {activePart === 1 ? (
            <div className="text-gray-800 leading-relaxed animate-in fade-in">
                <p className="font-bold mb-5">The chart below gives information about global energy consumption by source from 2000 to 2020.</p>
                <p className="font-bold mb-8">Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>
                
                <h3 className="text-center font-bold mb-4 mt-10 text-gray-700">Global Energy Consumption (Exajoules)</h3>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full border-collapse mt-0" style={{ fontSize: \`\${Math.max(12, textSize - 2)}px\` }}>
                        <thead>
                            <tr>
                                <th className="bg-slate-50 text-left p-3 border border-slate-300 font-bold">Energy Source</th>
                                <th className="bg-slate-50 text-left p-3 border border-slate-300 font-bold">2000</th>
                                <th className="bg-slate-50 text-left p-3 border border-slate-300 font-bold">2010</th>
                                <th className="bg-slate-50 text-left p-3 border border-slate-300 font-bold">2020</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="hover:bg-gray-50"><td className="p-3 border border-slate-300">Fossil Fuels</td><td className="p-3 border border-slate-300">350</td><td className="p-3 border border-slate-300">420</td><td className="p-3 border border-slate-300">400</td></tr>
                            <tr className="hover:bg-gray-50"><td className="p-3 border border-slate-300">Nuclear</td><td className="p-3 border border-slate-300">25</td><td className="p-3 border border-slate-300">28</td><td className="p-3 border border-slate-300">26</td></tr>
                            <tr className="hover:bg-gray-50"><td className="p-3 border border-slate-300">Renewables</td><td className="p-3 border border-slate-300">30</td><td className="p-3 border border-slate-300">45</td><td className="p-3 border border-slate-300">85</td></tr>
                            <tr className="hover:bg-gray-50 font-bold bg-gray-50"><td className="p-3 border border-slate-300">Total</td><td className="p-3 border border-slate-300">405</td><td className="p-3 border border-slate-300">493</td><td className="p-3 border border-slate-300">511</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        ) : (
            <div className="text-gray-800 leading-relaxed animate-in fade-in">
                <p className="mb-5 italic text-gray-600">Write about the following topic:</p>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-6 rounded-r-lg">
                    <p className="font-bold mb-4">
                        Some people think that universities should provide graduates with the knowledge and skills needed in the workplace. <br/><br/>
                        Others think that the true function of a university should be to give access to knowledge for its own sake, regardless of whether the course is useful to an employer.
                    </p>
                </div>
                <p className="font-bold mb-8">
                    Discuss both these views and give your own opinion.
                </p>
                <p className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-lg border border-gray-100">
                    Give reasons for your answer and include any relevant examples from your own knowledge or experience.
                </p>
            </div>
        )}
    </div>
);`;

const newPromptPanel = `const PromptPanel = ({ activePart, textSize, testId }: any) => {
    const prompt = getCustomPrompt(testId);
    return (
        <div className="flex-1 bg-white border border-gray-200 p-8 overflow-y-auto shadow-inner md:rounded-l-md" style={{ fontSize: \`\${textSize}px\` }}>
            {activePart === 1 ? (
                <div className="text-gray-800 leading-relaxed animate-in fade-in">
                    <p className="font-bold mb-5">{prompt.t1Title}</p>
                    <p className="font-bold mb-8">{prompt.t1Desc}</p>
                    {prompt.t1Content}
                </div>
            ) : (
                <div className="text-gray-800 leading-relaxed animate-in fade-in">
                    <p className="mb-5 italic text-gray-600">Write about the following topic:</p>
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-6 rounded-r-lg">
                        {prompt.t2Prompt}
                    </div>
                    <p className="font-bold mb-8">{prompt.t2Desc}</p>
                    <p className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-lg border border-gray-100">
                        Give reasons for your answer and include any relevant examples from your own knowledge or experience.
                    </p>
                </div>
            )}
        </div>
    );
};`;

file = file.replace(oldPromptPanel, newPromptPanel);

// Replace PromptPanel usages
file = file.replace(/<PromptPanel \n                        activePart={state\.activePart} \n                        textSize={state\.textSize} \n                    \/>/g, 
`<PromptPanel 
                        activePart={state.activePart} 
                        textSize={state.textSize} 
                        testId={id}
                    />`);

// Update fetch
const oldFetch = `body: JSON.stringify({ inputText: textToEvaluate, taskType: state.textPart2.trim() ? 'task2' : 'task1', rawPrompt: state.textPart2.trim() ? "Some people think that universities should provide graduates with the knowledge and skills needed in the workplace. Others think that the true function of a university should be to give access to knowledge for its own sake, regardless of whether the course is useful to an employer. Discuss both these views and give your own opinion." : "The chart below gives information about global energy consumption by source from 2000 to 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. (Assume the chart shows global energy consumption increasing from 2000 to 2020, with Oil being the highest but relatively stable, Coal rising sharply until 2010 then plateauing, Natural Gas rising steadily, and Renewables starting low but growing rapidly)." })`;
const newFetch = `body: JSON.stringify({ inputText: textToEvaluate, taskType: state.textPart2.trim() ? 'task2' : 'task1', rawPrompt: state.textPart2.trim() ? getCustomPrompt(id).t2Raw : getCustomPrompt(id).t1Raw })`;
file = file.replace(oldFetch, newFetch);

// Update title logic
const oldTitleLogic = `                let title = 'Writing Test';
                if (id) {
                    title = id.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
                }`;
const newTitleLogic = `                let title = 'Writing Test';
                if (id) {
                    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                    const numId = parseInt(id, 10);
                    if (!isNaN(numId) && numId >= 1 && numId <= 48) {
                        const month = months[Math.ceil(numId / 4) - 1];
                        title = \`\${month} Writing Practice\`;
                    } else {
                        title = id.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
                    }
                }`;
file = file.replace(oldTitleLogic, newTitleLogic);

fs.writeFileSync('src/pages/ComputerWritingTest.tsx', file);
