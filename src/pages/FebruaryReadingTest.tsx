import React, { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useParams, useNavigate } from 'react-router';

// --- CUSTOM STYLES ---
const CustomStyles = () => (
  <style>{`
    .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
    .animate-zoom-in { animation: zoomIn 0.2s ease-out forwards; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.5); border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(107, 114, 128, 0.8); }
  `}</style>
);

// --- ICONS (Inline SVGs to prevent import issues) ---
const Icon = ({ children, size = 24, className = '', fill = 'none', stroke = 'currentColor', strokeWidth = 2, title }: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        {title && <title>{title}</title>}
        {children}
    </svg>
);

const ChevronRight = (p: any) => <Icon {...p}><path d="m9 18 6-6-6-6"/></Icon>;
const ChevronLeft = (p: any) => <Icon {...p}><path d="m15 18-6-6 6-6"/></Icon>;
const Clock = (p: any) => <Icon {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Icon>;
const Menu = (p: any) => <Icon {...p}><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></Icon>;
const CheckCircle2 = (p: any) => <Icon {...p}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></Icon>;
const AlertCircle = (p: any) => <Icon {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></Icon>;
const User = (p: any) => <Icon {...p}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></Icon>;
const Play = (p: any) => <Icon {...p}><polygon points="5 3 19 12 5 21 5 3"/></Icon>;
const Trash2 = (p: any) => <Icon {...p}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></Icon>;
const Edit3 = (p: any) => <Icon {...p}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></Icon>;
const MessageSquare = (p: any) => <Icon {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></Icon>;
const Highlighter = (p: any) => <Icon {...p}><path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/></Icon>;
const SettingsIcon = (p: any) => <Icon {...p}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></Icon>;
const Flag = (p: any) => <Icon {...p}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></Icon>;
const Eraser = (p: any) => <Icon {...p}><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/></Icon>;
const ArrowLeft = (p: any) => <Icon {...p}><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></Icon>;
const Info = (p: any) => <Icon {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="16"/><line x1="12" y1="8" x2="12.01" y2="8"/></Icon>;
const Copy = (p: any) => <Icon {...p}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></Icon>;

// --- APPLICATION DATA ---
const passagesData = [
  {
    id: 1,
    title: "READING PASSAGE 1",
    subtitle: "Why good ideas fail",
    content: [
      "As part of a marketing course, two marketing experts comment on a hypothetical case study involving TF, a fictional retail giant specializing home furnishing. The experts give concrete solutions and advice to assist students.",
      "Hypothetical case study:",
      "TF became a retail success in the 1970s when it succeeded in spotting homeware trends and meeting the needs of its then trendy young customers. However, by 2004, the TF stores were failing and a rethink was clearly necessary. Tibal Fisher, TF's founder and CEO, decided to change its focus under the new brand name of TF's NextStage. His aim was to recapture the now ageing customers that had given him his early success and target consumers aged 60+ with devices and gadgets specifically designed to assist them with the problems associated with ageing: mobile phones with screens that were easy to read; kitchen gadgets with comfortable grips; electronic devices that were easy to use.",
      "(Content continues...) Good ideas can fail if they don't align with the demographic's actual desires. Often, older customers do not want to be reminded of their age, and marketing specifically to their age-related difficulties can alienate them."
    ],
    questionBlocks: [
      {
        title: "Questions 1-5",
        instruction: "Do the following statements agree with the information given in Reading Passage 1?\nTRUE if the statement agrees with the information\nFALSE if the statement contradicts the information\nNOT GIVEN if there is no information on this",
        type: "choice",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        questions: [
          { id: 1, text: "Donald Johanson was uncertain about the nature of the elbow bone he found in Afar." },
          { id: 2, text: "Several bones were found by Donald Johanson at the same site in Afar." },
          { id: 3, text: "The experts realised the importance of the discovery at Afar." },
          { id: 4, text: "It was the upper part of the skeleton that had suffered the least damage." },
          { id: 5, text: "The skeleton's measurements helped Johanson's team to decide if it was male or female." }
        ]
      },
      {
        title: "Questions 6-13",
        instruction: "Complete the notes below.\nChoose ONE WORD ONLY from the passage for each answer.",
        type: "input",
        questions: [
          { id: 6, text: "Movement: upright movement possibly started among the ... of trees" },
          { id: 7, text: "Movement: probably moved to the ... in search of food" },
          { id: 8, text: "Diet and eating habits: analysis of food in the ... of the skeletons of early humans shows changes in their diet" },
          { id: 9, text: "Diet and eating habits: it is likely that meat and grasses were substituted for ..." },
          { id: 10, text: "Diet and eating habits: ... that were located close to Lucy suggest these were also part of her diet" },
          { id: 11, text: "Diet and eating habits: ... that were found had marks on them, possibly made by tools used for eating" },
          { id: 12, text: "Comparisons with modern-day humans: modern-day humans have a longer ... than Lucy did" },
          { id: 13, text: "Comparisons with modern-day humans: the ... of modern-day humans appear to develop later than Lucy's did" }
        ]
      }
    ]
  },
  {
    id: 2,
    title: "READING PASSAGE 2",
    subtitle: "The history of coffee (Placeholder)",
    content: [
      "The story of coffee begins in Ethiopia. According to legend, in 2737 BC, the Chinese emperor Shen Nung was sitting beneath a tree while his servant boiled drinking water, when some leaves from the tree blew into the water. Shen Nung, a renowned herbalist, decided to try the infusion that his servant had accidentally created. The tree was a Camellia sinensis, and the resulting drink was what we now call tea. It is impossible to know whether there is any truth in this story. But tea drinking certainly became established in China many centuries before it had even been heard of in the West. Containers for tea have been found in tombs dating from the Han Dynasty (206 BC—220 AD) but it was under the Tang Dynasty (618—906 AD), that tea became firmly established as the national drink of China. It became such a favourite that during the late eighth century a writer called Lu Yu wrote the first book entirely about tea, the Ch’a Ching, or Tea Classic. It was shortly after this that tea was first introduced to Japan, by Japanese Buddhist monks who had travelled to China to study. Tea received almost instant imperial sponsorship and spread rapidly from the royal court and monasteries to the other sections of Japanese society.",
      "So at this stage in the history of tea, Europe was rather lagging behind. In the latter half of the sixteenth century there are the first brief mentions of tea as a drink among Europeans. These are mostly from Portuguese who were living in the East as traders and missionaries. But although some of these individuals may have brought back samples of tea to their native country, it was not the Portuguese who were the first to ship back tea as a commercial import. This was done by the Dutch, who in the last years of the sixteenth century began to encroach on Portuguese trading routes in the East. By the turn of the century, they had established a trading post on the island of Java, and it was via Java that in 1606 the first consignment of tea was shipped from China to Holland. Tea soon became a fashionable drink among the Dutch, and from there spread to other countries in continental western Europe, but because of its high price it remained a drink for the wealthy.",
      "Britain, always a little suspicious of continental trends, had yet to become the nation of tea drinkers that it is today. Starting in 1600, the British East India Company had a monopoly on importing goods from outside Europe, and it is likely that sailors on these ships brought tea home as gifts. The first coffee house had been established in London in 1652, and tea was still somewhat unfamiliar to most readers, so it is fair to assume that the drink was still something of a curiosity. Gradually, it became a popular drink in coffee houses, which were as many locations for the transaction of business as they were for relaxation or pleasure. They were though the preserve of middle- and upper-class men; women drank tea in their own homes, and as yet tea was still too expensive to be widespread among the working classes. In part, its high price was due to a punitive system of taxation.",
      "One unforeseen consequence of the taxation of tea was the growth of methods to avoid taxation—smuggling and adulteration. By the eighteenth century many Britons wanted to drink tea but could not afford the high prices, and their enthusiasm for the drink was matched by the enthusiasm of criminal gangs to smuggle it in. What began as a small time illegal trade, selling a few pounds of tea to personal contacts, developed by die late eighteenth century into an astonishing organised crime network, perhaps importing as much as 7 million lbs annually, compared to a legal import of 5 million lbs! Worse for die drinkers was that taxation also encouraged the adulteration of tea, particularly of smuggled tea which was not quality controlled through customs and excise. Leaves from other plants, or leaves which had already been brewed and then dried, were added to tea leaves. By 1784, the government realised that enough was enough, and that heavy taxation was creating more problems than it was words. The new Prime Minister, William Pitt the Younger, slashed the tax from 119 per cent to 12.5 per cent. Suddenly legal tea was affordable, and smuggling stopped virtually overnight.",
      "Another great impetus to tea drinking resulted from the end of the East India Company’s monopoly on trade with China, in 1834. Before that date, China was the country of origin of the vast majority of the tea imported to Britain, but the end of its monopoly stimulated the East India Company to consider growing tea outside China. India had always been the centre of the Company’s operations, which led to the increased cultivation of tea in India, beginning in Assam. There were a few false starts, including the destruction by cattle of one of the earliest tea nurseries, but by 1888 British tea imports from India were for the first time greater than those from China.",
      "The end of the East India Company’s monopoly on trade with China also had another result, which was more dramatic though less important in the long term: it ushered in the era of the tea clippers. While the Company had had the monopoly on trade, there was no rush to bring the tea from China to Britain, but after 1834 the tea trade became a virtual free for all. Individual merchants and sea captains with their own ships raced to bring home the tea and make the most money, using fast new clippers which had sleek lines, tall masts and huge sails. In particular there was a competition between British and American merchants, leading to the famous clipper races of the 1860s. But these races soon came to an end with the opening of the Suez Canal, which made the trade routes to China viable for steamships for the first time."
    ],
    questionBlocks: [
      {
        title: "Questions 14-20",
        instruction: "Complete the sentences below with words taken from Reading Passage 2. Use ONE WORD for each answer.",
        type: "input",
        questions: [
          { id: 14, text: "Researchers believed the tea containers detected in ... from the Han Dynasty was the first evidence of the use of tea." },
          { id: 15, text: "Lu Yu wrote a ... about tea before anyone else in the eighth century." },
          { id: 16, text: "It was ... from Japan who brought tea to their native country from China." },
          { id: 17, text: "Tea was carried from China to Europe actually by the ..." },
          { id: 18, text: "The British government had to cut down the taxation on tea due to the serious crime of ..." },
          { id: 19, text: "Tea was planted in ... besides China in the 19th century." },
          { id: 20, text: "In order to compete in shipping speed, traders used ... for the race." }
        ]
      },
      {
        title: "Questions 21-26",
        instruction: "Do the following statements agree with the information given in Reading Passage 2?\nTRUE if the statement agrees with the information\nFALSE if the statement contradicts the information\nNOT GIVEN if there is no information on this",
        type: "choice",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        questions: [
          { id: 21, text: "Tea was popular in Britain in the 16th century." },
          { id: 22, text: "Tea was more fashionable than coffee in Europe in the late 16th century." },
          { id: 23, text: "Tea was enjoyed by all classes in Britain in the seventeenth century." },
          { id: 24, text: "The adulteration of tea also prompted William Pitt the Younger to reduce the tax." },
          { id: 25, text: "Initial problems occurred when tea was planted outside China by the East India Company." },
          { id: 26, text: "The fastest vessels were owned by America during the 19th century clipper races." }
        ]
      }
    ]
  },
  {
    id: 3,
    title: "READING PASSAGE 3",
    subtitle: "Knowledge in medicine",
    content: [
      "A. What counts as knowledge? What do we mean when we say that we know something? What is the status of different kinds of knowledge? In order to explore these questions, we are going to focus on one particular area of knowledge – medicine.",
      "B. How do you know when you are ill? This may seem to be an absurd question. You know you are ill because you feel ill; your body tells you that you are ill. You may know that you feel pain or discomfort but knowing you are ill is a bit more complex. At times, people experience the symptoms of illness, but in fact, they are simply tired or over-worked or they may just have a hangover. At other times, people may be suffering from a disease and fail to be aware of the illness until it has reached a late stage in its development. So how do we know we are ill, and what counts as knowledge?",
      "C. Think about this example. You feel unwell. You have a bad cough and always seem to be tired. Perhaps it could be stress at work, or maybe you should give up smoking. You feel worse. You visit the doctor who listens to your chest and heart, takes your temperature and blood pressure, and then finally prescribes antibiotics for your cough.",
      "D. Things do not improve but you struggle on thinking you should pull yourself together, perhaps things will ease off at work soon. A return visit to your doctor shocks you. This time the doctor, drawing on years of training and experience, diagnoses pneumonia. This means that you will need bed rest and a considerable time off work. The scenario is transformed. Although you still have the same symptoms, you no longer think that these are caused by pressure at work. You know have proof that you are ill. This is the result of the combination of your own subjective experience and the diagnosis of someone who has the status of a medical expert. You have a medically authenticated diagnosis and it appears that you are seriously ill; you know you are ill and have the evidence upon which to base this knowledge.",
      "E. This scenario shows many different sources of knowledge. For example, you decide to consult the doctor in the first place because you feel unwell – this is personal knowledge about your own body. However, the doctor’s expert diagnosis is based on experience and training, with sources of knowledge as diverse as other experts, laboratory reports, medical textbooks and years of experience.",
      "F. One source of knowledge is the experience of our own bodies; the personal knowledge we have of changes that might be significant, as well as the subjective experiences are mediated by other forms of knowledge such as the words we have available to describe our experience, and the common sense of our families and friends as well as that drawn from popular culture. Over the past decade, for example, Western culture has seen a significant emphasis on stress-related illness in the media. Reference to being ‘stressed out’ has become a common response in daily exchanges in the workplace and has become part of popular common-sense knowledge. It is thus not surprising that we might seek such an explanation of physical symptoms of discomfort.",
      "G. We might also rely on the observations of others who know us. Comments from friends and family such as ‘you do look ill’ or ‘that’s a bad cough’ might be another source of knowledge. Complementary health practices, such as holistic medicine, produce their own sets of knowledge upon which we might also draw in deciding the nature and degree of our ill health and about possible treatments.",
      "H. Perhaps the most influential and authoritative source of knowledge is the medical knowledge provided by the general practitioner. We expect the doctor to have access to expert knowledge. This is socially sanctioned. It would not be acceptable to notify our employer that we simply felt too unwell to turn up for work or that our faith healer, astrologer, therapist or even our priest thought it was not a good idea. We need an expert medical diagnosis in order to obtain the necessary certificate if we need to be off work for more than the statutory self-certification period. The knowledge of the medical sciences is privileged in this respect in contemporary Western culture. Medical practitioners are also seen as having the required expert knowledge that permits them legally to prescribe drugs and treatment to which patients would not otherwise have access. However, there is a range of different knowledge upon which we draw when making decisions about our own state of health.",
      "I. However, there is more than existing knowledge in this little story; new knowledge is constructed within it. Given the doctor’s medical training and background, she may hypothesize ‘is this now pneumonia?’ and then proceed to look for evidence about it. She will use observations and instruments to assess the evidence and – critically – interpret it in light of her training and experience. This results in new knowledge and new experience both for you and for the doctor. This will then be added to the doctor’s medical knowledge and may help in the future diagnosis of pneumonia."
    ],
    questionBlocks: [
      {
        title: "Questions 27-32",
        instruction: "Complete the table.\nChoose NO MORE THAN THREE WORDS from the passage for each answer.",
        type: "input",
        questions: [
          { id: 27, text: "Personal experience: Symptoms of ... and tiredness" },
          { id: 28, text: "Scientific evidence: Doctor's measurement by taking ... and temperature" },
          { id: 29, text: "Non-specialized sources: Common judgment from ... around you" },
          { id: 30, text: "Authoritative source: Medical knowledge from the general ..." },
          { id: 31, text: "New knowledge: e.g. doctor's medical ..." },
          { id: 32, text: "New knowledge: Examine the medical hypothesis with the previous drill and ..." }
        ]
      },
      {
        title: "Questions 33-40",
        instruction: "The Reading Passage has nine paragraphs A-I.\nWhich paragraph contains the following information? Write the correct letter A-I.",
        type: "input",
        questions: [
          { id: 33, text: "the contrast between the nature of personal judgment and the nature of doctor’s diagnosis" },
          { id: 34, text: "a reference of culture about pressure" },
          { id: 35, text: "sick leave will not be permitted without the professional diagnosis" },
          { id: 36, text: "how doctors’ opinions are regarded in society" },
          { id: 37, text: "the illness of patients can become part of new knowledge" },
          { id: 38, text: "a description of knowledge drawn from non-specialized sources other than personal knowledge" },
          { id: 39, text: "an example of collective judgment from personal experience and professional doctor" },
          { id: 40, text: "a reference that some people do not realize they are ill" }
        ]
      }
    ]
  }
];

export const ANSWER_KEY: Record<number, string> = {
  1: "FALSE", 2: "TRUE", 3: "TRUE", 4: "NOT GIVEN", 5: "TRUE",
  6: "BRANCHES", 7: "GROUND", 8: "TEETH", 9: "FRUIT", 10: "EGGS",
  11: "BONES", 12: "CHILDHOOD", 13: "BRAINS",
  14: "TOMBS", 15: "BOOK", 16: "MONKS", 17: "DUTCH", 18: "SMUGGLING", 19: "INDIA", 20: "CLIPPERS",
  21: "FALSE", 22: "NOT GIVEN", 23: "FALSE", 24: "TRUE", 25: "TRUE", 26: "NOT GIVEN",
  27: "COUGH", 28: "BLOOD PRESSURE", 29: "FRIENDS AND FAMILY", 30: "PRACTITIONER", 31: "DIAGNOSIS", 32: "BACKGROUND",
  33: "E", 34: "F", 35: "H", 36: "H", 37: "I", 38: "G", 39: "D", 40: "B"
};

const EXPLANATIONS: Record<number, any> = {
  1: { passageId: 1, highlights: ["Straight away, he recognised it as coming from the elbow"], explanation: "The passage states that Donald Johanson 'Straight away, he recognised it'. Therefore, he was not uncertain about the nature of the bone." },
  2: { passageId: 1, highlights: ["I saw bits of the skull, a chunk of jaw, a couple of vertebrae"], explanation: "The text says 'And there were plenty more' and describes various other bones he found at the same site, making this true." },
  3: { passageId: 1, highlights: ["It was immediately obvious that the skeleton was a significant find"], explanation: "The passage explicitly states that it was obvious the skeleton was a significant find." },
  4: { passageId: 1, highlights: ["40% of the skeleton had been preserved"], explanation: "The passage mentions that 40% of the skeleton was preserved, but it does not specify whether the upper or lower part suffered the least damage." },
  5: { passageId: 1, highlights: ["the feeling was that the skeleton was female due to its size"], explanation: "The passage confirms that they believed the skeleton was female because of its size (measurements)." },
  6: { passageId: 1, highlights: ["upright walking evolved in the trees, as a way to walk along branches"], explanation: "The text suggests that upright walking evolved as a way to walk along branches." },
  7: { passageId: 1, highlights: ["hunting for food may have been the real reason for heading to the ground"], explanation: "According to Chris Stringer, hunting for food may have caused early humans to head to the ground." },
  8: { passageId: 1, highlights: ["remains of food trapped on preserved human teeth"], explanation: "Studies of the food preserved on their teeth indicated a change in their diets." },
  9: { passageId: 1, highlights: ["Instead of mostly eating fruit from trees, they began to include grasses and possibly meat"], explanation: "The passage notes they began eating meat and grasses instead of mostly eating fruit." },
  10: { passageId: 1, highlights: ["Fossilised crocodile and turtle eggs were found near her skeleton"], explanation: "Fossilised eggs found nearby suggest they were a part of Lucy's diet." },
  11: { passageId: 1, highlights: ["uncovered animal bones with scratches that seem to have been made by stone tools"], explanation: "Archaeologists found animal bones with scratches that indicate tools were used to eat meat." },
  12: { passageId: 1, highlights: ["Lucy's childhood was much briefer than ours"], explanation: "The passage states that Lucy's childhood was much briefer (shorter) than ours, meaning modern-day humans have a longer childhood." },
  13: { passageId: 1, highlights: ["their brains matured much earlier than ours do"], explanation: "A study suggested early humans' brains matured much earlier, meaning modern human brains develop later." },
  
  14: { passageId: 2, highlights: ["Containers for tea have been found in tombs dating from the Han Dynasty"], explanation: "The first evidence of tea usage is linked to containers found in ancient tombs." },
  15: { passageId: 2, highlights: ["Lu Yu wrote the first book entirely about tea"], explanation: "Lu Yu is credited with writing the first entire book about tea in the late eighth century." },
  16: { passageId: 2, highlights: ["introduced to Japan, by Japanese Buddhist monks"], explanation: "Buddhist monks from Japan brought tea back to their home country after studying in China." },
  17: { passageId: 2, highlights: ["not the Portuguese who were the first to ship back tea as a commercial import. This was done by the Dutch"], explanation: "The Dutch, not the Portuguese, were the first to commercially ship tea from China to Europe." },
  18: { passageId: 2, highlights: ["One unforeseen consequence of the taxation of tea was the growth of methods to avoid taxation—smuggling", "William Pitt the Younger, slashed the tax"], explanation: "High taxation led to criminal smuggling, which prompted the government to slash (cut down) the taxes." },
  19: { passageId: 2, highlights: ["increased cultivation of tea in India"], explanation: "The end of the monopoly led to the cultivation of tea in India." },
  20: { passageId: 2, highlights: ["using fast new clippers which had sleek lines"], explanation: "Traders used fast new ships known as 'clippers' for the tea races." },
  21: { passageId: 2, highlights: ["Starting in 1600, the British East India Company", "tea was still somewhat unfamiliar"], explanation: "In 1600 (the start of the 17th century, not 16th), tea was still unfamiliar and viewed as a curiosity in Britain, so it was not popular in the 16th century." },
  22: { passageId: 2, highlights: ["first coffee house had been established in London in 1652"], explanation: "The passage mentions the first coffee house in 1652 but does not compare whether tea was more fashionable than coffee across Europe in the late 16th century." },
  23: { passageId: 2, highlights: ["tea was still too expensive to be widespread among the working classes"], explanation: "Tea was popular among middle- and upper-class men, but it was too expensive for the working classes." },
  24: { passageId: 2, highlights: ["taxation also encouraged the adulteration of tea", "government realised that enough was enough... slashed the tax"], explanation: "The text explains that taxation encouraged both smuggling and the adulteration of tea, causing the government to slash the tax." },
  25: { passageId: 2, highlights: ["few false starts, including the destruction by cattle of one of the earliest tea nurseries"], explanation: "There were early failures ('false starts') when tea was planted in India, such as cattle destroying nurseries." },
  26: { passageId: 2, highlights: ["competition between British and American merchants, leading to the famous clipper races"], explanation: "There was a competition between British and American merchants, but the text never states that America owned the 'fastest' vessels." },

  27: { passageId: 3, highlights: ["bad cough and always seem to be tired"], explanation: "Under personal experience, knowing you are ill involves symptoms like a bad cough and tiredness." },
  28: { passageId: 3, highlights: ["takes your temperature and blood pressure"], explanation: "A doctor gathers scientific evidence by measuring things like your temperature and blood pressure." },
  29: { passageId: 3, highlights: ["Comments from friends and family such as ‘you do look ill’"], explanation: "Non-specialized sources of knowledge can come from the observations and common judgment of your friends and family." },
  30: { passageId: 3, highlights: ["medical knowledge provided by the general practitioner"], explanation: "An authoritative source of knowledge is the medical knowledge provided by a general practitioner." },
  31: { passageId: 3, highlights: ["future diagnosis of pneumonia"], explanation: "New knowledge is constructed and added to the doctor's medical knowledge, helping in the future diagnosis." },
  32: { passageId: 3, highlights: ["medical training and background"], explanation: "A doctor examines the hypothesis and interprets it using their previous training (drill) and background." },
  33: { passageId: 3, highlights: ["you decide to consult the doctor in the first place because you feel unwell – this is personal knowledge", "However, the doctor’s expert diagnosis is based on experience and training"], explanation: "Paragraph E contrasts personal knowledge (feeling unwell) with the doctor's expert diagnosis based on training." },
  34: { passageId: 3, highlights: ["Western culture has seen a significant emphasis on stress-related illness in the media"], explanation: "Paragraph F discusses how reference to being 'stressed out' has become part of popular culture." },
  35: { passageId: 3, highlights: ["We need an expert medical diagnosis in order to obtain the necessary certificate if we need to be off work"], explanation: "Paragraph H explains that to take time off work, a socially sanctioned expert medical diagnosis is legally required." },
  36: { passageId: 3, highlights: ["The knowledge of the medical sciences is privileged in this respect in contemporary Western culture"], explanation: "Paragraph H discusses how medical practitioners and their knowledge are viewed as privileged and authoritative in society." },
  37: { passageId: 3, highlights: ["This results in new knowledge and new experience both for you and for the doctor. This will then be added to the doctor’s medical knowledge"], explanation: "Paragraph I outlines how analyzing an illness results in new knowledge that is added to the doctor's existing knowledge." },
  38: { passageId: 3, highlights: ["rely on the observations of others who know us", "Complementary health practices, such as holistic medicine, produce their own sets of knowledge"], explanation: "Paragraph G describes sources of knowledge drawn from non-medical observations by family/friends and holistic medicine." },
  39: { passageId: 3, highlights: ["This is the result of the combination of your own subjective experience and the diagnosis of someone who has the status of a medical expert"], explanation: "Paragraph D gives an example of how knowledge of being ill comes from combining personal subjective experience and a professional diagnosis." },
  40: { passageId: 3, highlights: ["fail to be aware of the illness until it has reached a late stage"], explanation: "Paragraph B references the fact that people can sometimes suffer from a disease without realizing they are ill." }
};

import { getReadingTestData } from '../data/readingTestData';

const getQuestionTextForReview = (qId: number, currentPassagesData: any) => {
  for (let p of currentPassagesData) {
    for (let block of p.questionBlocks) {
      if (block.questions) {
        const q = block.questions.find((q: any) => q.id === qId);
        if (q) return q.text;
      }
      if (block.type.startsWith('summary') && (block as any).text.includes(`{${qId}}`)) {
        const parts = (block as any).text.split('\n');
        for (let part of parts) {
          if (part.includes(`{${qId}}`)) return part.trim();
        }
      }
    }
  }
  return `Question ${qId}`;
};

export function FebruaryReadingTest({ submissionId, assignmentId }: { submissionId?: string, assignmentId?: string }) {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  
  const testId = assignmentId || id;
  const testData = getReadingTestData(testId);
  const currentPassagesData = testData ? testData.passages : passagesData;
  const currentAnswerKey = testData ? testData.answers : ANSWER_KEY;
  const currentExplanations = testData ? testData.explanations : EXPLANATIONS;

  const [currentPassageIdx, setCurrentPassageIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [reviewFlags, setReviewFlags] = useState<Record<number, boolean>>({});
  const [studentName, setStudentName] = useState(user?.displayName || '');
  const [hasStarted, setHasStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionIdState, setSubmissionIdState] = useState<string | null>(null);

  // Safely clamp the index in case data changed length
  const safePassageIdx = Math.max(0, Math.min(currentPassageIdx, currentPassagesData.length - 1));
  const passage = currentPassagesData[safePassageIdx];

  if (!passage) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-500 font-medium">Loading test content...</div>
      </div>
    );
  }

  // Reset state when navigating to a different test ID
  useEffect(() => {
    setCurrentPassageIdx(0);
    setAnswers({});
    setReviewFlags({});
    setHasStarted(false);
    setTimeLeft(3600);
    setIsSubmitted(false);
    setReviewMode(false);
    setActiveReviewQuestion(null);
  }, [id]);
  
  // --- REVIEW MODE STATE ---
  const [reviewMode, setReviewMode] = useState(false);
  const [activeReviewQuestion, setActiveReviewQuestion] = useState<number | null>(null);

  // --- SETTINGS STATE ---
  const [textSize, setTextSize] = useState('standard'); 
  const [colorTheme, setColorTheme] = useState('standard');
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  // --- SPLIT-PANE RESIZING STATE ---
  const [leftWidth, setLeftWidth] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const mainContainerRef = useRef<HTMLElement>(null);

  // --- CUSTOM DIALOG CONFIRMATION STATE ---
  const [modalConfig, setModalConfig] = useState<any>(null);

  useEffect(() => {
    async function loadSubmission() {
      if (submissionId) {
        try {
          const docRef = doc(db, 'submissions', submissionId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            let parsedAnswers: Record<number, string> = {};
            if (typeof data.answers === 'string') {
              try { parsedAnswers = JSON.parse(data.answers); } catch (e) {}
            } else {
              parsedAnswers = data.answers || {};
            }
            setAnswers(parsedAnswers);
            setHasStarted(true);
            setIsSubmitted(true);
            setReviewMode(false);
            setTimeLeft(0);
          }
        } catch (error) {
          console.error("Error loading submission:", error);
        }
      }
    }
    loadSubmission();
  }, [submissionId]);

  const checkAnswer = (qNum: number) => {
    let userAns = (answers[qNum] || '').toString().trim().replace(/\s+/g, ' ').toUpperCase();
    const correctAns = currentAnswerKey[qNum];
    
    if (!correctAns) return false;

    if (userAns === 'T') userAns = 'TRUE';
    if (userAns === 'F') userAns = 'FALSE';
    if (userAns === 'NG' || userAns === 'N') userAns = 'NOT GIVEN';
    if (userAns === 'Y') userAns = 'YES';
    if (userAns === 'N' && String(correctAns).includes('NO')) userAns = 'NO';

    // Convert to string and handle possible 'OR' / '/' cases if the answer key has them
    const correctAnswers = String(correctAns).toUpperCase().split(/\s*OR\s*|\s*\/\s*/);
    
    for (let ans of correctAnswers) {
      ans = ans.trim();
      if (userAns === ans) return true;
      if (userAns.startsWith(ans + " ") || userAns.startsWith(ans + ".")) return true;
      
      const cleanUser = userAns.replace(/[^A-Z0-9]/g, '');
      const cleanAns = ans.replace(/[^A-Z0-9]/g, '');
      if (cleanUser === cleanAns && cleanAns.length > 0) return true;
    }
    
    return false;
  };

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: any) => {
      if (!isResizing || !mainContainerRef.current) return;
      const containerRect = mainContainerRef.current.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const relativeX = clientX - containerRect.left;
      const percentage = (relativeX / containerRect.width) * 100;
      setLeftWidth(Math.max(20, Math.min(80, percentage)));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
    } else {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isResizing]);

  // --- HIGHLIGHT & NOTES STATE ---
  const [highlights, setHighlights] = useState<Record<number, Record<number, any[]>>>({});
  const [popover, setPopover] = useState<any>(null);
  const [noteInput, setNoteInput] = useState('');
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseDown = (e: any) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setPopover(null);
      }
      if (showSettings && settingsRef.current && !settingsRef.current.contains(e.target)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [showSettings]);

  // Auto-scroll to highlight in review mode
  useEffect(() => {
    if (reviewMode && activeReviewQuestion) {
      setTimeout(() => {
         const highlightEl = leftPanelRef.current?.querySelector('mark.review-highlight');
         if (highlightEl) {
            highlightEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
         } else if (leftPanelRef.current) {
            leftPanelRef.current.scrollTop = 0; 
         }
      }, 100);
    }
  }, [activeReviewQuestion, reviewMode, currentPassageIdx]);

  useEffect(() => {
    let timer: any;
    if (hasStarted && timeLeft > 0 && !isSubmitted) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [hasStarted, timeLeft, isSubmitted]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleStart = (e: any) => {
    e.preventDefault();
    if (studentName.trim()) {
      setHasStarted(true);
    }
  };

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const toggleReviewFlag = (questionId: number) => {
    setReviewFlags(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleQuestionNavClick = (qId: number, passageIdx: number) => {
    if (currentPassageIdx !== passageIdx) {
      setCurrentPassageIdx(passageIdx);
    }
    setTimeout(() => {
      const el = document.getElementById(`question-${qId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-4', 'ring-blue-300', 'bg-blue-50', 'rounded-lg');
        setTimeout(() => el.classList.remove('ring-4', 'ring-blue-300', 'bg-blue-50', 'rounded-lg'), 1200);
      }
    }, currentPassageIdx !== passageIdx ? 300 : 50);
  };

  const startReview = (qNum: number) => {
    setActiveReviewQuestion(qNum);
    setReviewMode(true);
    if (qNum > 0) {
      let pIdx = 0;
      if (qNum >= 14 && qNum <= 26) pIdx = 1;
      if (qNum >= 27 && qNum <= 40) pIdx = 2;
      setCurrentPassageIdx(pIdx);
    }
  };

  const getTheme = (themeName: string) => {
    const themes: any = {
      'standard': {
        mainBg: 'bg-gradient-to-br from-indigo-50 via-blue-50 to-white',
        panelLeft: 'bg-white shadow-[0_0_40px_rgba(0,0,0,0.05)] rounded-r-[2rem]',
        panelRight: 'bg-transparent',
        text: 'text-slate-800',
        heading: 'text-slate-900',
        muted: 'text-slate-500',
        border: 'border-slate-200',
        box: 'bg-white/80 backdrop-blur-md',
        boxHeader: 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100',
        boxTitle: 'text-blue-900',
        boxSub: 'text-indigo-700',
        input: 'bg-white border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm',
        optionBg: 'bg-white shadow-sm hover:shadow-md transition-shadow',
        highlight: 'bg-yellow-200 hover:bg-yellow-300 text-black',
        iconBg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
        iconText: 'text-blue-700',
        radioChecked: 'border-blue-500 bg-blue-50 text-blue-800 shadow-md transform scale-[1.02]',
        radioUnchecked: 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-blue-300 hover:shadow-sm',
        resizerBg: 'bg-transparent hover:bg-blue-400/20 border-transparent',
        resizerLines: 'bg-blue-300'
      },
      'white-on-black': {
        mainBg: 'bg-black',
        panelLeft: 'bg-[#111]',
        panelRight: 'bg-[#1a1a1a]',
        text: 'text-white',
        heading: 'text-gray-100',
        muted: 'text-gray-500',
        border: 'border-gray-700',
        box: 'bg-[#222]',
        boxHeader: 'bg-[#333] border-gray-600',
        boxTitle: 'text-white',
        boxSub: 'text-gray-300',
        input: 'bg-[#333] border-gray-600 text-white',
        optionBg: 'bg-[#333]',
        highlight: 'bg-gray-600 hover:bg-gray-500 text-white',
        iconBg: 'bg-[#333]',
        iconText: 'text-gray-300',
        radioChecked: 'border-blue-500 bg-[#333] text-blue-400',
        radioUnchecked: 'border-gray-600 text-gray-300 hover:bg-[#333] hover:border-gray-500',
        resizerBg: 'bg-[#2a2a2a] hover:bg-blue-600 border-gray-700',
        resizerLines: 'bg-gray-400'
      },
      'yellow-on-black': {
        mainBg: 'bg-black',
        panelLeft: 'bg-[#111]',
        panelRight: 'bg-[#1a1a1a]',
        text: 'text-yellow-400',
        heading: 'text-yellow-500',
        muted: 'text-yellow-700',
        border: 'border-yellow-900',
        box: 'bg-[#222]',
        boxHeader: 'bg-[#333] border-yellow-800',
        boxTitle: 'text-yellow-500',
        boxSub: 'text-yellow-600',
        input: 'bg-[#333] border-yellow-800 text-yellow-400',
        optionBg: 'bg-[#333]',
        highlight: 'bg-yellow-700 hover:bg-yellow-600 text-black',
        iconBg: 'bg-[#333]',
        iconText: 'text-yellow-500',
        radioChecked: 'border-yellow-500 bg-[#333] text-yellow-300',
        radioUnchecked: 'border-yellow-900 text-yellow-600 hover:bg-[#333] hover:border-yellow-700',
        resizerBg: 'bg-[#2a2a2a] hover:bg-yellow-600 border-yellow-900',
        resizerLines: 'bg-yellow-500'
      }
    };
    return themes[themeName] || themes['standard'];
  };

  const theme = getTheme(colorTheme);
  const textClass = ({
    'standard': 'text-[13pt] md:text-[14pt] leading-relaxed',
    'large': 'text-[16pt] md:text-[18pt] leading-relaxed',
    'xlarge': 'text-[20pt] md:text-[22pt] leading-relaxed'
  } as any)[textSize];

  // --- HIGHLIGHT LOGIC ---
  const getAbsoluteOffset = (parent: any, targetNode: any, targetOffset: number) => {
    let offset = 0;
    const walker = document.createTreeWalker(parent, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node === targetNode) return offset + targetOffset;
      offset += node.nodeValue?.length || 0;
    }
    return offset;
  };

  const handleTextSelect = () => {
    if (isResizing || reviewMode) return; 
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const startContainer = range.startContainer;
    const endContainer = range.endContainer;
    
    // safe property access wrapper
    const getEl = (node: Node) => (node.nodeType === 3 ? node.parentNode as HTMLElement : node as HTMLElement)?.closest('[data-paragraph-idx]');
    const startPara = getEl(startContainer);
    const endPara = getEl(endContainer);

    if (startPara && endPara && startPara === endPara) {
      const paragraphIdx = parseInt(startPara.getAttribute('data-paragraph-idx') || '0', 10);
      const startOffset = getAbsoluteOffset(startPara, range.startContainer, range.startOffset);
      const endOffset = getAbsoluteOffset(startPara, range.endContainer, range.endOffset);
      
      const actualStart = Math.min(startOffset, endOffset);
      const actualEnd = Math.max(startOffset, endOffset);

      if (actualStart !== actualEnd && leftPanelRef.current) {
        const rect = range.getBoundingClientRect();
        const containerRect = leftPanelRef.current.getBoundingClientRect();
        
        setPopover({
          type: 'new',
          x: rect.left - containerRect.left + leftPanelRef.current.scrollLeft + (rect.width / 2),
          y: rect.top - containerRect.top + leftPanelRef.current.scrollTop,
          passageId: currentPassagesData[safePassageIdx].id,
          paragraphIdx,
          start: actualStart,
          end: actualEnd,
          text: selection.toString()
        });
      }
    }
  };

  const addHighlight = (note = '') => {
    if (!popover) return;
    const { passageId, paragraphIdx, start, end, text } = popover;
    const id = Date.now().toString();
    
    setHighlights(prev => {
      const passageHLs = prev[passageId] || {};
      const paraHLs = passageHLs[paragraphIdx] || [];
      const filteredHLs = paraHLs.filter(hl => hl.end <= start || hl.start >= end);
      return {
        ...prev,
        [passageId]: {
          ...passageHLs,
          [paragraphIdx]: [...filteredHLs, { id, start, end, text, note }].sort((a,b) => a.start - b.start)
        }
      };
    });
    setPopover(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleExistingHighlightClick = (e: any, hl: any, passageId: number, paragraphIdx: number) => {
    if(reviewMode || !leftPanelRef.current) return;
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = leftPanelRef.current.getBoundingClientRect();

    setPopover({
      type: 'existing',
      x: rect.left - containerRect.left + leftPanelRef.current.scrollLeft + (rect.width / 2),
      y: rect.top - containerRect.top + leftPanelRef.current.scrollTop,
      passageId,
      paragraphIdx,
      start: hl.start,
      end: hl.end,
      text: hl.text || '',
      highlightId: hl.id,
      noteText: hl.note
    });
  };

  const handleCopyText = () => {
    if (!popover?.text) return;
    
    const fallbackCopy = () => {
      const textArea = document.createElement("textarea");
      textArea.value = popover.text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        console.error("Fallback copy failed", err);
      }
      textArea.remove();
    };

    try {
      if (navigator.clipboard && window.isSecureContext && window === window.parent) {
         navigator.clipboard.writeText(popover.text).catch(() => fallbackCopy());
      } else {
         fallbackCopy();
      }
      setPopover(null);
      window.getSelection()?.removeAllRanges();
    } catch (err) {
      console.error("Failed to copy text:", err);
      fallbackCopy();
      setPopover(null);
      window.getSelection()?.removeAllRanges();
    }
  };

  const updateNote = () => {
    if (!popover) return;
    setHighlights(prev => {
      const passageHLs = prev[popover.passageId] || {};
      const paraHLs = passageHLs[popover.paragraphIdx] || [];
      return {
        ...prev,
        [popover.passageId]: {
          ...passageHLs,
          [popover.paragraphIdx]: paraHLs.map(hl => 
            hl.id === popover.highlightId ? { ...hl, note: noteInput } : hl
          )
        }
      };
    });
    setPopover(null);
  };

  const clearHighlight = () => {
    if (!popover) return;
    setHighlights(prev => {
      const passageHLs = prev[popover.passageId] || {};
      const paraHLs = passageHLs[popover.paragraphIdx] || [];
      return {
        ...prev,
        [popover.passageId]: {
          ...passageHLs,
          [popover.paragraphIdx]: paraHLs.filter(hl => hl.id !== popover.highlightId)
        }
      };
    });
    setPopover(null);
  };

  const clearAllHighlights = (passageId: number) => {
    setModalConfig({
      title: "Clear Highlights",
      message: "Are you sure you want to clear all highlights and notes for this passage?",
      confirmText: "Clear All",
      cancelText: "Cancel",
      onConfirm: () => {
        setHighlights(prev => ({ ...prev, [passageId]: {} }));
        setModalConfig(null);
      }
    });
  };

  const clearHighlightFromSelection = () => {
    if (!popover) return;
    const { passageId, paragraphIdx, start, end } = popover;
    setHighlights(prev => {
      const passageHLs = prev[passageId] || {};
      const paraHLs = passageHLs[paragraphIdx] || [];
      const filteredHLs = paraHLs.filter(hl => hl.end <= start || hl.start >= end);
      return {
        ...prev,
        [passageId]: {
          ...passageHLs,
          [paragraphIdx]: filteredHLs
        }
      };
    });
    setPopover(null);
    window.getSelection()?.removeAllRanges();
  };

  const renderParagraphWithReviewHighlight = (text: string, passageId: number) => {
    if (!reviewMode || !activeReviewQuestion) return text;
    const explanation = currentExplanations[activeReviewQuestion];
    if (!explanation || explanation.passageId !== passageId || !explanation.highlights) return text;

    let elements: any[] = [text];
    
    explanation.highlights.forEach((highlightStr: string) => {
      if (!highlightStr) return;
      const newElements: any[] = [];
      elements.forEach(el => {
        if (typeof el === 'string') {
          const parts = el.split(highlightStr);
          parts.forEach((part, i) => {
            newElements.push(part);
            if (i < parts.length - 1) {
              newElements.push(
                <mark key={`${highlightStr}-${i}`} className="review-highlight bg-yellow-300 text-black px-1.5 py-0.5 rounded shadow-sm font-semibold transition-all duration-700 animate-[pulse_2s_ease-in-out_infinite]">
                  {highlightStr}
                </mark>
              );
            }
          });
        } else {
          newElements.push(el);
        }
      });
      elements = newElements;
    });
    
    return elements.map((el, i) => <React.Fragment key={i}>{el}</React.Fragment>);
  };

  const renderParagraphWithHighlights = (text: string, paragraphIdx: number, passageId: number) => {
    if (reviewMode) {
      return renderParagraphWithReviewHighlight(text, passageId);
    }

    const passageHLs = highlights[passageId] || {};
    const paraHLs = passageHLs[paragraphIdx] || [];

    if (paraHLs.length === 0) return text;

    let result: any[] = [];
    let lastIndex = 0;

    paraHLs.forEach((hl, idx) => {
      if (hl.start > lastIndex) {
        result.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex, hl.start)}</span>);
      }
      result.push(
        <mark
          key={`hl-${hl.id}`}
          className={`bg-yellow-200 cursor-pointer relative group rounded-sm transition-colors hover:bg-yellow-300 ${hl.note ? 'border-b-2 border-yellow-500' : ''}`}
          onClick={(e) => handleExistingHighlightClick(e, hl, passageId, paragraphIdx)}
        >
          {text.substring(hl.start, hl.end)}
          {hl.note && (
             <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-800 text-white text-xs p-2 rounded shadow-lg whitespace-nowrap z-40 max-w-xs truncate pointer-events-none">
               {hl.note}
             </span>
          )}
          {hl.note && <MessageSquare size={12} className="inline ml-1 text-yellow-600 opacity-70" />}
        </mark>
      );
      lastIndex = hl.end;
    });

    if (lastIndex < text.length) {
      result.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex)}</span>);
    }

    return result;
  };

  const renderQuestionBox = (passageIdx: number) => (qNum: number) => {
    const isAnswered = answers[qNum] && String(answers[qNum]).trim() !== '';
    const isFlagged = reviewFlags[qNum];
    
    let shapeClass = isFlagged ? 'rounded-full' : 'rounded-[3px]';
    let colorClass = isAnswered 
      ? 'bg-[#70b1eb] text-white hover:bg-[#5b9bd5]' 
      : (colorTheme !== 'standard' ? 'bg-[#333] text-white hover:bg-gray-600' : 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-100');
    let ringClass = isFlagged ? 'ring-2 ring-offset-1 ring-blue-500' : '';

    return (
      <button
        key={qNum}
        onClick={() => handleQuestionNavClick(qNum, passageIdx)}
        className={`w-7 h-7 flex items-center justify-center text-sm font-bold transition-all mx-[1px] ${shapeClass} ${colorClass} ${ringClass}`}
        title={isFlagged ? "Flagged for review" : (isAnswered ? "Answered" : "Unanswered")}
      >
        {qNum}
      </button>
    );
  };

  const renderSummaryText = (text: string, type: string, options: any = null) => {
    const parts = text.split(/(\{\d+\})/g);
    return (
      <p className="leading-loose text-gray-700 whitespace-pre-wrap">
        {parts.map((part, i) => {
          const match = part.match(/\{(\d+)\}/);
          if (match) {
            const qId = parseInt(match[1]);
            const isFlagged = reviewFlags[qId];
            const isCorrect = reviewMode ? checkAnswer(qId) : undefined;
            const inputClass = reviewMode
              ? (isCorrect
                  ? (colorTheme !== 'standard' ? 'border-green-800 bg-[#1a2e1a] text-green-400 cursor-pointer' : 'border-green-400 bg-green-50 text-green-900 cursor-pointer hover:bg-green-100')
                  : (colorTheme !== 'standard' ? 'border-red-800 bg-[#3a1a1a] text-red-400 cursor-pointer line-through' : 'border-red-400 bg-red-50 text-red-900 cursor-pointer line-through hover:bg-red-100'))
              : `focus:border-blue-500 ${theme.input}`;
              
            return (
              <span key={i} id={`question-${qId}`} className="inline-block mx-2 align-middle transition-all duration-500 relative group">
                <span className={`text-[0.75em] font-bold mr-1 ${theme.boxTitle}`}>{qId}</span>
                {type === 'summary-options' ? (
                  <select
                    className={`border-b-2 focus:outline-none py-1 px-2 pr-6 rounded shadow-sm transition-colors ${inputClass}`}
                    value={answers[qId] || ''}
                    disabled={false}
                    onChange={(e) => {
                      if (!reviewMode) handleAnswerChange(qId, e.target.value);
                    }}
                    onClick={(e) => {
                      if (reviewMode) {
                        e.preventDefault();
                        startReview(activeReviewQuestion === qId ? 0 : qId);
                      }
                    }}
                  >
                    <option value="">Select...</option>
                    {options.map((opt: string) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className={`border-b-2 focus:outline-none py-1 px-2 w-32 text-center rounded shadow-sm transition-colors cursor-pointer ${inputClass}`}
                    value={answers[qId] || ''}
                    readOnly={reviewMode}
                    onChange={(e) => {
                      if (!reviewMode) handleAnswerChange(qId, e.target.value);
                    }}
                    onClick={(e) => {
                      if (reviewMode) {
                        e.preventDefault();
                        startReview(activeReviewQuestion === qId ? 0 : qId);
                      }
                    }}
                    placeholder="Type answer..."
                  />
                )}
                {!reviewMode && (
                  <button 
                    onClick={() => toggleReviewFlag(qId)} 
                    title="Flag for review"
                    className={`absolute -top-3 -right-2 p-1 rounded-full bg-white shadow-sm border border-gray-100 transition-opacity ${isFlagged ? 'opacity-100 text-blue-600' : 'opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-700'}`}
                  >
                    <Flag size={12} fill={isFlagged ? 'currentColor' : 'none'} />
                  </button>
                )}
              </span>
            );
          }
          return <span key={i} className={theme.text}>{part}</span>;
        })}
      </p>
    );
  };

  // -------------------------------------------------------------
  // RESULTS SCREEN (Grid)
  // -------------------------------------------------------------
  if (isSubmitted && !reviewMode) {
    const score = Array.from({ length: 40 }, (_, i) => i + 1).filter(qNum => checkAnswer(qNum)).length;
    let bandScore = 0;
    if (score >= 39) bandScore = 9.0;
    else if (score >= 37) bandScore = 8.5;
    else if (score >= 35) bandScore = 8.0;
    else if (score >= 33) bandScore = 7.5;
    else if (score >= 30) bandScore = 7.0;
    else if (score >= 27) bandScore = 6.5;
    else if (score >= 23) bandScore = 6.0;
    else if (score >= 19) bandScore = 5.5;
    else if (score >= 15) bandScore = 5.0;
    else if (score >= 13) bandScore = 4.5;
    else if (score >= 10) bandScore = 4.0;
    else if (score >= 8) bandScore = 3.5;
    else if (score >= 6) bandScore = 3.0;
    else if (score >= 4) bandScore = 2.5;
    else if (score >= 2) bandScore = 2.0;
    else if (score >= 1) bandScore = 1.0;

    const renderGradedRow = (qNum: number) => {
      const isCorrect = checkAnswer(qNum);
      let userAns = (answers[qNum] || '').toString().trim().replace(/\s+/g, ' ').toUpperCase();

      if (userAns === 'T') userAns = 'TRUE';
      if (userAns === 'F') userAns = 'FALSE';
      if (userAns === 'NG' || userAns === 'N') userAns = 'NOT GIVEN';
      if (userAns === 'Y') userAns = 'YES';
      if (userAns === 'N' && String(currentAnswerKey[qNum]).includes('NO')) userAns = 'NO';

      return (
        <button 
          key={qNum} 
          onClick={() => startReview(qNum)}
          className={`w-full text-left flex border h-auto min-h-[44px] rounded-lg overflow-hidden transition-all hover:scale-[1.02] hover:shadow-md cursor-pointer ${isCorrect ? (colorTheme !== 'standard' ? 'border-green-800 shadow-sm' : 'border-green-300 shadow-sm') : (colorTheme !== 'standard' ? 'border-red-800 shadow-sm' : 'border-red-300 shadow-sm')}`}
          title="Click to view explanation in passage"
        >
          <div className={`w-10 flex items-center justify-center font-bold text-[1.125em] border-r shrink-0 ${isCorrect ? (colorTheme !== 'standard' ? 'bg-[#1a2e1a] text-green-500 border-green-800' : 'bg-green-50 text-green-700 border-green-200') : (colorTheme !== 'standard' ? 'bg-[#3a1a1a] text-red-500 border-red-800' : 'bg-red-50 text-red-700 border-red-200')}`}>
            {qNum}
          </div>
          <div className={`flex-1 flex flex-col justify-center px-4 py-2 font-medium text-[1em] ${isCorrect ? (colorTheme !== 'standard' ? 'bg-[#222] text-green-400' : 'bg-white text-green-900') : (colorTheme !== 'standard' ? 'bg-[#222]' : 'bg-white')}`}>
            <span className={isCorrect ? '' : (userAns ? (colorTheme !== 'standard' ? 'text-red-400 line-through opacity-80' : 'text-red-600 line-through opacity-80') : 'text-gray-500 italic text-[0.875em]')}>
              {userAns || 'No Answer'}
            </span>
            {!isCorrect && (
              <span className={`text-[0.875em] font-bold block mt-1 flex items-center gap-1 ${colorTheme !== 'standard' ? 'text-green-400' : 'text-green-600'}`}>
                 <CheckCircle2 size={14} /> {currentAnswerKey[qNum]}
              </span>
            )}
          </div>
          <div className={`w-12 border-l flex items-center justify-center font-bold text-[1.25em] shrink-0 ${isCorrect ? (colorTheme !== 'standard' ? 'border-green-800 bg-[#1a2e1a] text-green-500' : 'border-green-200 bg-green-100 text-green-600') : (colorTheme !== 'standard' ? 'border-red-800 bg-[#3a1a1a] text-red-500' : 'border-red-200 bg-red-100 text-red-600')}`}>
            {isCorrect ? '✓' : '✗'}
          </div>
        </button>
      );
    };

    return (
      <>
        <CustomStyles />
        <div className={`min-h-screen py-10 font-sans overflow-y-auto selection:bg-blue-200 ${theme.mainBg} ${textClass}`}>
          <div className={`max-w-4xl mx-auto p-8 md:p-12 shadow-xl rounded-2xl ${theme.box} ${theme.text}`}>
            
            <div className={`flex items-center justify-center gap-3 mb-8 py-3 rounded-xl border ${colorTheme !== 'standard' ? 'bg-[#1a2e1a] text-green-400 border-green-800' : 'bg-green-50 text-green-600 border-green-200'}`}>
              <CheckCircle2 size={24} />
              <span className="text-[1.125em] font-bold">Test Submitted Successfully</span>
            </div>

            <button 
              onClick={() => navigate('/ielts/dashboard')} 
              className="mb-8 flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-[1.125em] transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 w-full md:w-auto mx-auto group"
            >
               <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
            </button>

            <h1 className={`text-[2.25em] font-bold text-center mb-10 font-serif ${theme.heading}`}>IELTS Reading Results</h1>
            
            <div className={`flex flex-col md:flex-row justify-between items-center gap-8 mb-10 p-6 md:p-8 rounded-2xl border shadow-sm ${colorTheme !== 'standard' ? 'bg-[#222] border-gray-700' : 'bg-blue-50/50 border-blue-100'}`}>
              <div className="space-y-5 font-bold text-[0.875em] w-full md:w-2/3">
                <div className="flex items-center gap-4">
                  <span className={`w-24 uppercase tracking-widest text-[0.875em] ${colorTheme !== 'standard' ? 'text-gray-400' : 'text-gray-600'}`}>Candidate Name</span>
                  <div className={`border-b-2 px-4 py-2 flex-1 text-[1.25em] uppercase tracking-wider rounded-t shadow-inner ${colorTheme !== 'standard' ? 'bg-[#111] border-gray-600 text-gray-300' : 'bg-white border-blue-200 text-blue-900'}`}>{studentName}</div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-4 flex-1">
                     <span className={`w-24 leading-tight uppercase tracking-widest text-[0.875em] ${colorTheme !== 'standard' ? 'text-gray-400' : 'text-gray-600'}`}>Candidate No.</span>
                     <div className="flex-1 flex gap-1.5">
                       {[...Array(6)].map((_, i) => <div key={i} className={`border shadow-inner w-8 h-8 rounded-md ${colorTheme !== 'standard' ? 'bg-[#111] border-gray-600' : 'bg-white border-blue-200'}`}></div>)}
                     </div>
                  </div>
                  <div className="flex items-center gap-4 flex-1">
                     <span className={`w-24 text-right uppercase tracking-widest text-[0.875em] ${colorTheme !== 'standard' ? 'text-gray-400' : 'text-gray-600'}`}>Centre No.</span>
                     <div className="flex-1 flex gap-1.5">
                       {[...Array(5)].map((_, i) => <div key={i} className={`border shadow-inner w-8 h-8 rounded-md ${colorTheme !== 'standard' ? 'bg-[#111] border-gray-600' : 'bg-white border-blue-200'}`}></div>)}
                     </div>
                  </div>
                </div>
              </div>
              
              <div className={`text-center p-6 rounded-2xl shadow-md border min-w-[200px] flex flex-col justify-center gap-6 transform hover:scale-105 transition-transform ${colorTheme !== 'standard' ? 'bg-[#111] border-gray-700' : 'bg-white border-blue-100'}`}>
                 <div>
                     <span className={`block text-[0.875em] font-bold uppercase tracking-widest mb-1 ${colorTheme !== 'standard' ? 'text-gray-500' : 'text-gray-500'}`}>Band Score</span>
                     <span className={`text-[4.5em] leading-none font-black ${colorTheme !== 'standard' ? 'text-green-400' : 'text-green-600'}`}>{bandScore.toFixed(1)}</span>
                 </div>
                 <div className={`border-t pt-4 ${colorTheme !== 'standard' ? 'border-gray-800' : 'border-blue-50'}`}>
                     <span className={`block text-[0.75em] font-bold uppercase tracking-widest mb-1 ${colorTheme !== 'standard' ? 'text-gray-600' : 'text-gray-400'}`}>Raw Score</span>
                     <span className={`text-[1.5em] font-black ${colorTheme !== 'standard' ? 'text-blue-400' : 'text-blue-600'}`}>{score}<span className={`text-[0.6em] font-bold ${colorTheme !== 'standard' ? 'text-gray-600' : 'text-gray-400'}`}>/40</span></span>
                 </div>
              </div>
            </div>

            <p className={`text-center text-[0.875em] font-bold uppercase tracking-widest mb-6 flex items-center justify-center gap-2 ${colorTheme !== 'standard' ? 'text-gray-500' : 'text-gray-500'}`}>
               <Info size={16} /> Click on any question below to see the explanation
            </p>

            <div className={`font-bold text-[1.25em] py-3 px-6 flex justify-between mb-8 rounded-lg shadow-md uppercase tracking-widest ${colorTheme !== 'standard' ? 'bg-[#111] text-gray-400 border border-gray-800' : 'bg-[#183473] text-white'}`}>
              <span className="flex-1 text-center border-r border-white/20">Questions 1-20</span>
              <span className="flex-1 text-center">Questions 21-40</span>
            </div>

            {/* Grid for answers: 1-20 left, 21-40 right */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <div className="flex flex-col gap-3">
                {Array.from({ length: 20 }, (_, i) => i + 1).map(qNum => renderGradedRow(qNum))}
              </div>
              <div className="flex flex-col gap-3">
                {Array.from({ length: 20 }, (_, i) => i + 21).map(qNum => renderGradedRow(qNum))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // -------------------------------------------------------------
  // START SCREEN
  // -------------------------------------------------------------
  if (!hasStarted) {
    return (
      <>
        <CustomStyles />
        <div className="flex h-screen bg-gradient-to-br from-blue-50 to-gray-100 items-center justify-center font-sans text-[11pt]">
          <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full border border-gray-200">
            <div className="flex justify-center mb-6">
               <div className="bg-blue-900 p-4 rounded-xl text-white shadow-lg">
                 <Menu size={32} />
               </div>
            </div>
            <h1 className="text-3xl font-extrabold text-blue-900 mb-2 text-center tracking-tight">IELTS Academic Reading</h1>
            <p className="text-gray-500 text-center mb-8 font-medium">60 Minutes • 3 Passages • 40 Questions</p>
            
            <form onSubmit={handleStart} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">Candidate Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 font-medium"
                    placeholder="e.g. John Doe"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={!studentName.trim()}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:shadow-none disabled:cursor-not-allowed transition-all font-bold text-lg"
              >
                Start Official Test
                <Play size={20} fill="currentColor" />
              </button>
            </form>
          </div>
        </div>
      </>
    );
  }

  // -------------------------------------------------------------
  // TEST TAKING & REVIEW SCREEN UI (Shared layout)
  // -------------------------------------------------------------
  return (
    <>
      <CustomStyles />
      <div className={`flex flex-col h-screen font-sans ${theme.mainBg} ${textClass}`}>
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-900 via-[#1a3673] to-indigo-900 text-white shadow-xl flex items-center justify-between px-6 py-4 shrink-0 z-20 relative border-b border-white/10">
          {/* Left Nav */}
          <div className="flex items-center gap-3 relative z-30">
            {reviewMode ? (
              <button 
                onClick={() => setReviewMode(false)}
                className="flex items-center gap-2 hover:bg-blue-800 px-3 py-1.5 rounded-lg transition-colors font-bold text-[0.875em] cursor-pointer pointer-events-auto"
              >
                <ArrowLeft size={18} /> Back to Results
              </button>
            ) : (
              <>
                <Menu size={24} className="cursor-pointer hover:text-blue-200 transition-colors" />
                <h1 className="text-[1.25em] font-bold tracking-wide hidden sm:block">IELTS Academic Reading</h1>
              </>
            )}
          </div>
          
          {/* Central Timer / Review Badge (Wrapped in pointer-events-none to prevent click blocking) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            {!reviewMode ? (
              <div className={`pointer-events-auto flex items-center gap-2 px-6 py-2 rounded-full font-mono font-bold tracking-wider text-[1.125em] shadow-inner ${timeLeft < 300 ? 'bg-red-500 text-white animate-pulse shadow-red-900/50' : 'bg-blue-950 text-blue-100 border border-blue-800'}`}>
                <Clock size={20} />
                <span>{formatTime(timeLeft)}</span>
              </div>
            ) : (
              <div className="pointer-events-auto flex items-center gap-2 px-6 py-2 rounded-full font-bold tracking-wider text-[0.875em] shadow-inner bg-yellow-500 text-black border border-yellow-400">
                <Info size={16} />
                <span>Reviewing Explanations</span>
              </div>
            )}
          </div>

          {/* User Info & Settings */}
          <div className="flex items-center gap-4 relative z-30" ref={settingsRef}>
            <div className="hidden md:flex items-center gap-2 text-blue-200 bg-blue-800/50 px-3 py-1.5 rounded-full border border-blue-700">
              <User size={16} />
              <span className="font-medium max-w-[150px] truncate text-[0.875em]">{studentName}</span>
            </div>
            
            <button 
              onClick={(e) => { e.stopPropagation(); setShowSettings(prev => !prev); }} 
              className={`p-2 rounded-full transition-all cursor-pointer pointer-events-auto ${showSettings ? 'bg-blue-100 text-blue-900 shadow-lg' : 'hover:bg-blue-800 text-blue-100'}`}
            >
              <SettingsIcon size={20} />
            </button>

            {/* Settings Dropdown Menu */}
            {showSettings && (
              <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 text-gray-800 z-50 p-5 font-sans animate-fade-in origin-top-right">
                <h4 className="font-bold mb-4 text-[1em] text-gray-900 border-b pb-2 flex items-center gap-2">
                   <SettingsIcon size={16} className="text-gray-500" /> Options
                </h4>
                
                <div className="mb-5">
                  <p className="text-[0.875em] font-bold text-gray-500 uppercase tracking-wider mb-3">Change Text Size</p>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-3 text-[0.875em] cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                      <input type="radio" name="textSize" className="w-4 h-4 text-blue-600 focus:ring-blue-500" checked={textSize === 'standard'} onChange={() => setTextSize('standard')} /> Standard
                    </label>
                    <label className="flex items-center gap-3 text-[0.875em] cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                      <input type="radio" name="textSize" className="w-4 h-4 text-blue-600 focus:ring-blue-500" checked={textSize === 'large'} onChange={() => setTextSize('large')} /> Large
                    </label>
                    <label className="flex items-center gap-3 text-[0.875em] cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                      <input type="radio" name="textSize" className="w-4 h-4 text-blue-600 focus:ring-blue-500" checked={textSize === 'xlarge'} onChange={() => setTextSize('xlarge')} /> Extra Large
                    </label>
                  </div>
                </div>

                <div>
                  <p className="text-[0.875em] font-bold text-gray-500 uppercase tracking-wider mb-3">Change Screen Colors</p>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-3 text-[0.875em] cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                      <input type="radio" name="colorTheme" className="w-4 h-4 text-blue-600 focus:ring-blue-500" checked={colorTheme === 'standard'} onChange={() => setColorTheme('standard')} /> Standard
                    </label>
                    <label className="flex items-center gap-3 text-[0.875em] cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                      <input type="radio" name="colorTheme" className="w-4 h-4 text-blue-600 focus:ring-blue-500" checked={colorTheme === 'white-on-black'} onChange={() => setColorTheme('white-on-black')} /> White on black
                    </label>
                    <label className="flex items-center gap-3 text-[0.875em] cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                      <input type="radio" name="colorTheme" className="w-4 h-4 text-blue-600 focus:ring-blue-500" checked={colorTheme === 'yellow-on-black'} onChange={() => setColorTheme('yellow-on-black')} /> Yellow on black
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Progress Bar (Visible only when not in review mode) */}
        {!reviewMode && (
          <div className={`w-full h-1.5 shrink-0 z-20 ${colorTheme !== 'standard' ? 'bg-[#333]' : 'bg-blue-900/50'}`}>
            <div 
              className={`h-full transition-all duration-300 ${colorTheme !== 'standard' ? 'bg-yellow-500' : 'bg-blue-400'}`}
              style={{ width: `${(Object.keys(answers).filter(k => (answers[parseInt(k)] || '').toString().trim() !== '').length / 40) * 100}%` }} 
            />
          </div>
        )}

        {/* Passage Navigation Tabs (Top) */}
        <div className={`flex px-6 shrink-0 z-10 shadow-sm ${colorTheme !== 'standard' ? 'bg-[#1a1a1a] border-b border-gray-800' : 'bg-blue-800 border-b border-blue-900'}`}>
          {currentPassagesData.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => {
                setCurrentPassageIdx(idx);
                if (reviewMode) {
                  setActiveReviewQuestion(null);
                }
              }}
              className={`px-6 py-2.5 text-[0.875em] font-bold tracking-wide transition-all ${
                safePassageIdx === idx 
                  ? (colorTheme !== 'standard' ? 'border-b-4 border-yellow-500 text-yellow-400 bg-[#333]' : 'border-b-4 border-white text-white bg-blue-900') 
                  : (colorTheme !== 'standard' ? 'border-b-4 border-transparent text-gray-400 hover:bg-[#222]' : 'border-b-4 border-transparent text-blue-200 hover:bg-blue-900/50 hover:text-white')
              }`}
            >
              {p.title.replace('READING ', '')}
            </button>
          ))}
        </div>

        {/* Main Content Split Screen */}
        <main ref={mainContainerRef} className="flex flex-1 overflow-hidden flex-col md:flex-row relative">
          
          {/* Left Side: Reading Passage */}
          <div 
            ref={leftPanelRef}
            style={{ width: isDesktop ? `${leftWidth}%` : '100%' }}
            className={`h-1/2 md:h-full border-r overflow-y-auto shadow-inner relative selection:bg-blue-300 selection:text-black scroll-smooth ${theme.panelLeft} ${theme.border}`}
            onMouseUp={handleTextSelect}
          >
            <div className="p-8 max-w-3xl mx-auto">
              <div className={`mb-10 flex items-start justify-between border-b pb-6 ${theme.border} border-opacity-50`}>
                <div>
                  <h2 className={`text-[0.875em] font-bold uppercase tracking-widest mb-2 ${theme.muted}`}>{passage.title}</h2>
                  <h3 className={`text-[1.5em] font-bold leading-tight ${theme.heading}`}>{passage.subtitle}</h3>
                </div>
              </div>
              
              <div className="space-y-6 leading-relaxed pb-32">
                {passage.content.map((paragraph, idx) => (
                  <p key={idx} data-paragraph-idx={idx} className={`text-justify relative text-[1em] ${theme.text}`}>
                    {renderParagraphWithHighlights(paragraph, idx, passage.id)}
                  </p>
                ))}
              </div>
            </div>
            
            {/* Popover Menu for Highlights & Notes (Hidden in Review Mode) */}
            {popover && !reviewMode && (
              <div 
                ref={popoverRef}
                className="absolute z-50 bg-white rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-gray-200 px-1 py-1 transform -translate-x-1/2 -translate-y-full animate-fade-in"
                style={{ top: popover.y - 12, left: popover.x }}
              >
                {/* Arrow pointing down */}
                <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-3.5 h-3.5 bg-white border-b border-r border-gray-200 rotate-45"></div>
                
                <div className="relative z-10 flex flex-col font-sans">
                  {popover.type === 'new' && (
                    <div className="flex items-center h-9">
                      <button 
                        onClick={() => addHighlight('')}
                        className="flex items-center justify-center gap-2 px-3 h-full hover:bg-gray-50 rounded text-[0.875em] font-semibold text-gray-700 transition-colors whitespace-nowrap"
                      >
                        <Highlighter size={16} strokeWidth={2.5} className="text-yellow-500" />
                        Highlight
                      </button>
                      <div className="w-px h-5 bg-gray-200 mx-1"></div>
                      <button 
                        onClick={() => { setPopover({...popover, type: 'note-input'}); setNoteInput(''); }}
                        className="flex items-center justify-center gap-2 px-3 h-full hover:bg-gray-50 rounded text-[0.875em] font-semibold text-gray-700 transition-colors whitespace-nowrap"
                      >
                        <Edit3 size={16} strokeWidth={2.5} className="text-blue-500" />
                        Add Note
                      </button>
                      <div className="w-px h-5 bg-gray-200 mx-1"></div>
                      <button 
                        onClick={handleCopyText}
                        className="flex items-center justify-center gap-2 px-3 h-full hover:bg-gray-50 rounded text-[0.875em] font-semibold text-gray-700 transition-colors whitespace-nowrap"
                      >
                        <Copy size={16} strokeWidth={2.5} className="text-gray-600" />
                        Copy
                      </button>
                    </div>
                  )}
                  
                  {popover.type === 'existing' && (
                    <div className="flex flex-col">
                      {popover.noteText ? (
                        <div className="px-3 py-2 border-b border-gray-100 mb-1 max-w-xs bg-yellow-50/50 rounded-t">
                          <p className="text-[0.875em] text-gray-800 break-words font-medium">{popover.noteText}</p>
                        </div>
                      ) : (
                        <div className="hidden"></div>
                      )}
                      
                      <div className="flex items-center h-9">
                        <button 
                          onClick={() => { setPopover({...popover, type: 'note-input'}); setNoteInput(popover.noteText || ''); }}
                          className="flex items-center gap-2 px-3 h-full hover:bg-gray-50 rounded text-[0.875em] font-semibold text-gray-700 transition-colors whitespace-nowrap"
                          title="Edit Note"
                        >
                          <Edit3 size={16} strokeWidth={2.5} className={popover.noteText ? "text-blue-500" : "text-gray-500"} /> {popover.noteText ? 'Edit Note' : 'Add Note'}
                        </button>
                        <div className="w-px h-5 bg-gray-200 mx-1"></div>
                        <button 
                          onClick={handleCopyText}
                          className="flex items-center gap-2 px-3 h-full hover:bg-gray-50 rounded text-[0.875em] font-semibold text-gray-700 transition-colors whitespace-nowrap"
                          title="Copy Highlighted Text"
                        >
                          <Copy size={16} strokeWidth={2.5} className="text-gray-600" /> Copy
                        </button>
                        <div className="w-px h-5 bg-gray-200 mx-1"></div>
                        <button 
                          onClick={clearHighlight}
                          className="flex items-center gap-2 px-3 h-full hover:bg-gray-50 rounded text-[0.875em] font-semibold text-gray-700 transition-colors whitespace-nowrap"
                          title="Clear Highlight"
                        >
                          <Eraser size={16} strokeWidth={2.5} className="text-red-400" /> Clear
                        </button>
                        <div className="w-px h-5 bg-gray-200 mx-1"></div>
                        <button 
                          onClick={() => { setPopover(null); clearAllHighlights(popover.passageId); }}
                          className="flex items-center gap-2 px-3 h-full hover:bg-gray-50 rounded text-[0.875em] font-semibold text-gray-700 transition-colors whitespace-nowrap"
                          title="Clear All Highlights"
                        >
                          <Trash2 size={16} strokeWidth={2.5} className="text-red-500" /> Clear all
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {popover.type === 'note-input' && (
                    <div className="w-64 p-2">
                      <textarea
                        autoFocus
                        className="w-full border border-gray-300 rounded p-3 text-[0.875em] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none shadow-inner"
                        rows={3}
                        placeholder="Type your note here..."
                        value={noteInput}
                        onChange={e => setNoteInput(e.target.value)}
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button 
                          className="px-4 py-1.5 text-gray-600 hover:bg-gray-100 rounded text-[0.875em] font-bold transition-colors" 
                          onClick={() => setPopover(null)}
                        >
                          Cancel
                        </button>
                        <button 
                          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[0.875em] font-bold shadow-sm transition-colors" 
                          onClick={popover.highlightId ? updateNote : () => addHighlight(noteInput)}
                        >
                          Save Note
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Dynamic Resize Split-Pane Handler bar */}
          {isDesktop && (
            <div
              onMouseDown={(e) => { e.preventDefault(); setIsResizing(true); }}
              onTouchStart={(e) => { setIsResizing(true); }}
              className={`w-1.5 hover:w-2 bg-gray-300 hover:bg-blue-500 cursor-col-resize flex-shrink-0 transition-all duration-150 relative z-30 flex items-center justify-center border-l border-r ${theme.resizerBg}`}
              style={{ touchAction: 'none' }}
            >
              {/* Grab Handle UI dots */}
              <div className="flex flex-col gap-1 pointer-events-none">
                <div className={`w-1 h-1 rounded-full ${theme.resizerLines}`} />
                <div className={`w-1 h-1 rounded-full ${theme.resizerLines}`} />
                <div className={`w-1 h-1 rounded-full ${theme.resizerLines}`} />
              </div>
            </div>
          )}

          {/* Right Side: Questions OR Review Panel */}
          <div 
            style={{ width: isDesktop ? `${100 - leftWidth}%` : '100%' }}
            className={`h-1/2 md:h-full overflow-y-auto ${theme.panelRight}`}
          >
            <div className="p-8 max-w-3xl mx-auto pb-32">
                  {passage.questionBlocks.map((block: any, bIdx: number) => (
                    <div key={bIdx} className={`mb-12 rounded-xl shadow-md border overflow-hidden ${theme.box} ${theme.border}`}>
                      <div className={`p-5 border-b ${theme.boxHeader}`}>
                        <h4 className={`font-bold text-[1.125em] ${theme.boxTitle}`}>{block.title}</h4>
                        {(() => {
                          const lines = (block.instruction || '').split('\n');
                          const normalLines: string[] = [];
                          const optionLines: string[] = [];
                          
                          lines.forEach((line: string) => {
                            if (/^[A-K][\.\)]?\s+/.test(line.trim())) {
                              optionLines.push(line);
                            } else {
                              if (optionLines.length === 0) {
                                normalLines.push(line);
                              } else {
                                optionLines.push(line); 
                              }
                            }
                          });

                          return (
                            <>
                              {normalLines.length > 0 && (
                                <p className={`mt-2 whitespace-pre-wrap italic text-[0.875em] ${theme.boxSub}`}>
                                  {normalLines.join('\n')}
                                </p>
                              )}
                              {optionLines.length > 0 && (
                                <div className={`mt-4 p-5 border-2 rounded-lg shadow-sm font-sans not-italic text-[1.125em] font-semibold ${theme.box} ${theme.border} ${theme.text}`}>
                                  {optionLines.map((line: string, idx: number) => (
                                    <div key={idx} className="mb-1.5 last:mb-0">{line}</div>
                                  ))}
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                      
                      <div className="p-6">
                        {/* Summary Type (Dropdown or Text Input inside a paragraph) */}
                        {(block.type === 'summary-options' || block.type === 'summary-input') && (
                          <div className={`p-6 rounded-lg border shadow-sm ${theme.panelRight} ${theme.border}`}>
                            {block.options && (
                              <div className={`mb-6 pb-6 border-b grid grid-cols-2 md:grid-cols-3 gap-3 ${theme.border}`}>
                                {block.options.map((opt: string) => (
                                   <div key={opt} className={`px-4 py-2 border rounded shadow-sm font-medium ${theme.optionBg} ${theme.border} ${theme.text}`}>{opt}</div>
                                ))}
                              </div>
                            )}
                            {renderSummaryText(block.text, block.type, block.options)}
                            {reviewMode && activeReviewQuestion && block.text.includes(`{${activeReviewQuestion}}`) && (
                              <div className={`mt-6 pt-4 border-t ${colorTheme !== 'standard' ? 'border-gray-700' : 'border-gray-300'}`}>
                                {!checkAnswer(activeReviewQuestion) && (
                                  <div className="mb-4">
                                    <span className={`text-[0.875em] uppercase tracking-wider font-bold mb-1 block ${colorTheme !== 'standard' ? 'text-green-400' : 'text-green-700'}`}>Correct Answer</span>
                                    <span className={`text-[1.25em] font-black ${colorTheme !== 'standard' ? 'text-green-400' : 'text-green-700'}`}>
                                      {currentAnswerKey[activeReviewQuestion]}
                                    </span>
                                  </div>
                                )}
                                <h3 className={`font-bold text-[1.125em] mb-2 flex items-center gap-2 ${colorTheme !== 'standard' ? 'text-blue-400' : 'text-blue-900'}`}>
                                  <Info size={20} className="text-blue-500"/> Explanation
                                </h3>
                                <div className={`whitespace-pre-wrap text-[1em] leading-relaxed p-4 rounded-lg border shadow-sm ${colorTheme !== 'standard' ? 'bg-[#332800] text-yellow-100 border-yellow-700' : 'bg-yellow-50/70 text-gray-800 border-yellow-200'}`}>
                                  {currentExplanations[activeReviewQuestion]?.explanation || "Explanation not found."}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Standard Questions */}
                        {block.questions && block.questions.map((q: any) => {
                          const isFlagged = reviewFlags[q.id];
                          const isCorrect = reviewMode ? checkAnswer(q.id) : undefined;
                          const qThemeClass = reviewMode 
                            ? (isCorrect 
                                ? (colorTheme !== 'standard' ? 'border-green-800 bg-[#1a2e1a] hover:bg-[#223d22]' : 'border-green-400 bg-green-50 hover:bg-green-100')
                                : (colorTheme !== 'standard' ? 'border-red-800 bg-[#3a1a1a] hover:bg-[#4d2222]' : 'border-red-400 bg-red-50 hover:bg-red-100'))
                            : (isFlagged ? (colorTheme !== 'standard' ? 'border-blue-500 bg-blue-900/20' : 'border-blue-300 bg-blue-50/30') : 'border-transparent');

                          return (
                            <div 
                              key={q.id} 
                              id={`question-${q.id}`} 
                              className={`mb-8 last:mb-0 p-4 rounded-xl transition-all duration-500 border ${qThemeClass} ${reviewMode ? 'cursor-pointer' : ''}`}
                              onClick={(e) => {
                                if (reviewMode) {
                                  e.preventDefault();
                                  startReview(activeReviewQuestion === q.id ? 0 : q.id);
                                }
                              }}
                            >
                              <div className="flex gap-4">
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-inner border ${isFlagged ? 'bg-blue-500 text-white border-blue-600' : `${theme.iconBg} ${theme.iconText} border-gray-200`}`}>
                                  {q.id}
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between items-start mb-4 gap-4">
                                    <p className={`font-medium text-[1em] leading-relaxed ${theme.text}`}>{q.text}</p>
                                    
                                    {/* Flag for Review Toggle Button */}
                                    {!reviewMode && (
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); toggleReviewFlag(q.id); }}
                                        className={`flex-shrink-0 p-1.5 rounded-full transition-colors ${isFlagged ? (colorTheme !== 'standard' ? 'text-blue-400 bg-blue-900/50 hover:bg-blue-800' : 'text-blue-600 bg-blue-100 hover:bg-blue-200') : (colorTheme !== 'standard' ? 'text-gray-500 hover:bg-[#333] hover:text-gray-300' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700')}`}
                                        title={isFlagged ? "Unflag question" : "Flag for review"}
                                      >
                                        <Flag size={20} fill={isFlagged ? 'currentColor' : 'none'} />
                                      </button>
                                    )}
                                  </div>
                                  
                                  {/* MCQ and Matching logic */}
                                  {(block.type === 'mcq' || block.type === 'matching') && (
                                    <div className="space-y-3">
                                      {(q.options || block.options).map((opt: string, optIdx: number) => {
                                        const optionLetter = opt.charAt(0);
                                        const isSelected = answers[q.id] === optionLetter;
                                        return (
                                          <label 
                                            key={optIdx} 
                                            onClick={(e) => {
                                              if (reviewMode) {
                                                e.preventDefault();
                                                startReview(activeReviewQuestion === q.id ? 0 : q.id);
                                              }
                                            }}
                                            className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all shadow-sm ${
                                              isSelected ? theme.radioChecked : theme.radioUnchecked
                                            } cursor-pointer`}
                                          >
                                            <input
                                              type="radio"
                                              name={`question-${q.id}`}
                                              value={optionLetter}
                                              checked={isSelected}
                                              disabled={false}
                                              onChange={(e) => {
                                                if (!reviewMode) handleAnswerChange(q.id, e.target.value);
                                              }}
                                              className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                            />
                                            <span className="text-[1em] leading-relaxed flex items-start font-serif">
                                              <span className="font-bold font-sans mr-2 shrink-0">{optionLetter}.</span>
                                              <span>{opt.substring(2).trim()}</span>
                                            </span>
                                          </label>
                                        );
                                      })}
                                    </div>
                                  )}

                                  {/* YES/NO/NOT GIVEN or TRUE/FALSE/NOT GIVEN */}
                                  {block.type === 'choice' && (
                                    <div className="flex flex-wrap gap-3">
                                      {block.options.map((opt: string) => {
                                        const isSelected = answers[q.id] === opt;
                                        return (
                                          <label 
                                            key={opt}
                                            onClick={(e) => {
                                              if (reviewMode) {
                                                e.preventDefault();
                                                startReview(activeReviewQuestion === q.id ? 0 : q.id);
                                              }
                                            }}
                                            className={`flex-1 min-w-[120px] text-[1em] text-center p-3 rounded-lg border-2 transition-all font-bold shadow-sm ${
                                              isSelected 
                                                ? theme.radioChecked 
                                                : theme.radioUnchecked
                                            } cursor-pointer`}
                                          >
                                            <input
                                              type="radio"
                                              name={`question-${q.id}`}
                                              value={opt}
                                              className="hidden"
                                              checked={isSelected}
                                              disabled={false}
                                              onChange={(e) => {
                                                if (!reviewMode) handleAnswerChange(q.id, e.target.value);
                                              }}
                                            />
                                            {opt}
                                          </label>
                                        );
                                      })}
                                    </div>
                                  )}

                                  {/* Simple Text Input Fallback */}
                                  {block.type === 'input' && (
                                     <input
                                       type="text"
                                       className={`w-full border-2 rounded-lg p-4 focus:outline-none transition-all shadow-inner font-medium text-[1em] cursor-pointer ${theme.input} ${theme.border} ${reviewMode ? '' : 'focus:border-blue-500'}`}
                                       placeholder="Type your answer here..."
                                       value={answers[q.id] || ''}
                                       readOnly={reviewMode}
                                       onChange={(e) => {
                                         if (!reviewMode) handleAnswerChange(q.id, e.target.value);
                                       }}
                                       onClick={(e) => {
                                         if (reviewMode) {
                                           e.preventDefault();
                                           startReview(activeReviewQuestion === q.id ? 0 : q.id);
                                         }
                                       }}
                                     />
                                  )}

                                  {/* Explanation Block */}
                                  {reviewMode && activeReviewQuestion === q.id && (
                                    <div className={`mt-6 pt-4 border-t ${colorTheme !== 'standard' ? 'border-gray-700' : 'border-gray-300'}`} onClick={e => e.stopPropagation()}>
                                      {!isCorrect && (
                                        <div className="mb-4">
                                          <span className={`text-[0.875em] uppercase tracking-wider font-bold mb-1 block ${colorTheme !== 'standard' ? 'text-green-400' : 'text-green-700'}`}>Correct Answer</span>
                                          <span className={`text-[1.25em] font-black ${colorTheme !== 'standard' ? 'text-green-400' : 'text-green-700'}`}>
                                            {currentAnswerKey[q.id]}
                                          </span>
                                        </div>
                                      )}
                                      <h3 className={`font-bold text-[1.125em] mb-2 flex items-center gap-2 ${colorTheme !== 'standard' ? 'text-blue-400' : 'text-blue-900'}`}>
                                        <Info size={20} className="text-blue-500"/> Explanation
                                      </h3>
                                      <div className={`whitespace-pre-wrap text-[1em] leading-relaxed p-4 rounded-lg border shadow-sm ${colorTheme !== 'standard' ? 'bg-[#332800] text-yellow-100 border-yellow-700' : 'bg-yellow-50/70 text-gray-800 border-yellow-200'}`}>
                                        {currentExplanations[q.id]?.explanation || "Explanation not found."}
                                      </div>
                                    </div>
                                  )}

                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
               </div>
          </div>
        </main>

        {/* Footer Navigation (Only shown during active test, hidden in review) */}
        {!reviewMode && (
          <footer className={`border-t px-4 py-3 shrink-0 z-30 select-none overflow-x-auto relative shadow-[0_-10px_20px_rgba(0,0,0,0.05)] ${colorTheme !== 'standard' ? 'bg-[#111] border-gray-800' : 'bg-[#e8ebf0] border-gray-300'}`}>
            <div className="max-w-[1400px] mx-auto flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between w-full">
              
              <div className="flex flex-col xl:flex-row gap-8 items-start xl:items-center">
                
                {/* Status Legend */}
                <div className={`flex flex-col gap-1.5 shrink-0 mt-2 xl:mt-0 p-2 rounded-lg border text-[0.75em] font-bold ${colorTheme !== 'standard' ? 'bg-[#222] border-gray-800 text-gray-300' : 'bg-white border-gray-200 text-gray-600 shadow-sm'}`}>
                  <div className="flex items-center gap-2">
                     <div className={`w-3.5 h-3.5 rounded-[2px] ${colorTheme !== 'standard' ? 'bg-[#333]' : 'border border-gray-400 bg-white'}`}></div>
                     <span>Unanswered</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-3.5 h-3.5 rounded-[2px] bg-[#70b1eb]"></div>
                     <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className={`w-3.5 h-3.5 rounded-full border-2 border-blue-500 ${colorTheme !== 'standard' ? 'bg-[#333]' : 'bg-white'}`}></div>
                     <span>Flagged for Review</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  {/* Row 1 */}
                  <div className="flex flex-wrap items-center gap-6">
                    <div className={`flex items-center gap-3 p-1.5 rounded-lg ${safePassageIdx === 0 ? (colorTheme !== 'standard' ? 'bg-[#333]' : 'bg-white shadow-sm ring-1 ring-gray-300') : ''}`}>
                      <span className={`font-bold text-[0.75em] uppercase tracking-wider w-14 shrink-0 text-center ${colorTheme !== 'standard' ? 'text-gray-400' : 'text-gray-500'}`}>Part 1</span>
                      <div className="flex flex-wrap gap-[1px]">
                        {Array.from({ length: 13 }, (_, i) => i + 1).map(renderQuestionBox(0))}
                      </div>
                    </div>
                    <div className={`flex items-center gap-3 p-1.5 rounded-lg ${safePassageIdx === 1 ? (colorTheme !== 'standard' ? 'bg-[#333]' : 'bg-white shadow-sm ring-1 ring-gray-300') : ''}`}>
                      <span className={`font-bold text-[0.75em] uppercase tracking-wider w-14 shrink-0 text-center ${colorTheme !== 'standard' ? 'text-gray-400' : 'text-gray-500'}`}>Part 2</span>
                      <div className="flex flex-wrap gap-[1px]">
                        {Array.from({ length: 13 }, (_, i) => i + 14).map(renderQuestionBox(1))}
                      </div>
                    </div>
                  </div>
                  {/* Row 2 */}
                  <div className="flex flex-wrap items-center gap-6">
                    <div className={`flex items-center gap-3 p-1.5 rounded-lg ${safePassageIdx === 2 ? (colorTheme !== 'standard' ? 'bg-[#333]' : 'bg-white shadow-sm ring-1 ring-gray-300') : ''}`}>
                      <span className={`font-bold text-[0.75em] uppercase tracking-wider w-14 shrink-0 text-center ${colorTheme !== 'standard' ? 'text-gray-400' : 'text-gray-500'}`}>Part 3</span>
                      <div className="flex flex-wrap gap-[1px]">
                        {Array.from({ length: 14 }, (_, i) => i + 27).map(renderQuestionBox(2))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={() => {
                  setModalConfig({
                    title: "Submit Test",
                    message: "Are you sure you want to submit your test? You cannot return once submitted.",
                    confirmText: "Submit Test",
                    cancelText: "Cancel",
                    onConfirm: async () => {
                      setIsSubmitted(true);
                      setModalConfig(null);
                      
                      if (user) {
                        try {
                          let title = 'February Reading Practice';
                          if (id) {
                            const numericId = Number(id);
                            if (!isNaN(numericId) && numericId >= 1) {
                              const months = [
                                'January', 'February', 'March', 'April', 'May', 'June',
                                'July', 'August', 'September', 'October', 'November', 'December'
                              ];
                              const monthIndex = Math.floor((numericId - 1) / 3);
                              if (monthIndex >= 0 && monthIndex < months.length) {
                                title = `${months[monthIndex]} Reading Practice`;
                              }
                            } else {
                              title = id.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
                            }
                          }
                          const score = Array.from({ length: 40 }, (_, i) => i + 1).filter(qNum => checkAnswer(qNum)).length;
                          let bandScore = 0;
                          if (score >= 39) bandScore = 9.0;
                          else if (score >= 37) bandScore = 8.5;
                          else if (score >= 35) bandScore = 8.0;
                          else if (score >= 33) bandScore = 7.5;
                          else if (score >= 30) bandScore = 7.0;
                          else if (score >= 27) bandScore = 6.5;
                          else if (score >= 23) bandScore = 6.0;
                          else if (score >= 19) bandScore = 5.5;
                          else if (score >= 15) bandScore = 5.0;
                          else if (score >= 13) bandScore = 4.5;
                          else if (score >= 10) bandScore = 4.0;
                          else if (score >= 8) bandScore = 3.5;
                          else if (score >= 6) bandScore = 3.0;
                          else if (score >= 4) bandScore = 2.5;
                          else if (score >= 2) bandScore = 2.0;

                          await addDoc(collection(db, 'submissions'), {
                            userId: user.uid,
                            studentName: studentName || user.displayName || 'Student',
                            assignmentId: id,
                            assignmentTitle: title,
                            assignmentType: 'reading',
                            createdAt: serverTimestamp(),
                            status: 'submitted',
                            answers: JSON.stringify(answers),
                            bandScore,
                            percentage: (score / 40) * 100,
                            timeSpent: 3600 - timeLeft,
                            requiresEvaluation: false
                          });
                        } catch (err) {
                          console.error("Failed to save score", err);
                        }
                      }
                    }
                  });
                }}
                title="Submit Answers"
                className="group flex items-center justify-center gap-2 px-6 py-3 rounded-full shrink-0 self-end xl:self-auto bg-blue-900 hover:bg-blue-950 text-white shadow-lg transition-all hover:scale-105 ml-auto xl:ml-0 font-bold text-[1em]"
              >
                Finish Test
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>

            </div>
          </footer>
        )}

        {/* Reusable Custom Modal Confirmation Dialog */}
        {modalConfig && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 font-sans animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 border border-gray-200 animate-zoom-in text-black">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                <AlertCircle size={24} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{modalConfig.title}</h3>
              <p className="text-[0.875em] text-gray-600 mb-8 leading-relaxed font-medium">{modalConfig.message}</p>
              <div className="flex justify-end gap-3 text-[0.875em] font-bold">
                <button
                  onClick={() => setModalConfig(null)}
                  className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  {modalConfig.cancelText || "Cancel"}
                </button>
                <button
                  onClick={modalConfig.onConfirm}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors cursor-pointer shadow-md"
                >
                  {modalConfig.confirmText || "Confirm"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
