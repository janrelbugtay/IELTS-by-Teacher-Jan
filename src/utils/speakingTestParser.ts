export interface SpeakingQuestion {
  id: string;
  topic: string;
  text: string;
  sampleAnswer?: string;
}

export interface Part2Data {
  id: string;
  topic: string;
  bulletPoints: string[];
  sampleAnswer?: string;
}

export interface SpeakingFormData {
  part1: SpeakingQuestion[];
  part2: Part2Data;
  part3: SpeakingQuestion[];
}

export interface ParseStats {
  p1Questions: number;
  p1Answers: number;
  p1Topics: number;
  p2Bullets: number;
  p2HasAnswer: boolean;
  p3Questions: number;
  p3Answers: number;
  p3Topics: number;
}

// Cleans prefix from line, e.g. "1. ", "Q1: ", "• "
function stripQuestionPrefix(text: string): string {
  return text
    .replace(/^(\d+[\.\)\:\-]\s*|Q\d+[\.\:\-]\s*|Question\s*\d+[\.\:\-]\s*|[•\-\*]\s*)/i, '')
    .trim();
}

function stripAnswerPrefix(text: string): string {
  return text
    .replace(/^(Sample\s*Answer|Sample\s*answer|Model\s*Answer|Suggested\s*Answer|Band\s*\d+\s*Answer|Answer|A)\s*[\:\-\.]\s*/i, '')
    .trim();
}

function isQuestionStart(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  // Match "1. ", "1) ", "Q1:", "Question 1:", "1 - "
  if (/^(\d+[\.\)\:\-]|Q\d+[\.\:\-]|Question\s*\d+[\.\:\-])/i.test(trimmed)) {
    return true;
  }
  // Match bullet point that is clearly a question or starts with question words
  if (/^[•\-\*]\s*(What|Where|When|Why|How|Do|Did|Does|Have|Has|Are|Is|Can|Could|Would|Will|Tell|Describe|Please|If|Which)\b/i.test(trimmed)) {
    return true;
  }
  // Line ending with question mark and not starting with Answer/Sample
  if (trimmed.endsWith('?') && !/^(Sample|Model|Answer|A\b|Suggested)/i.test(trimmed)) {
    return true;
  }
  return false;
}

function isAnswerStart(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  return /^(Sample\s*Answer|Sample\s*answer|Model\s*Answer|Model\s*answer|Suggested\s*Answer|Band\s*\d+\s*Answer|Answer\s*[\:\-]|A\s*[\:\-])/i.test(trimmed);
}

function isTopicLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (/^(Topic|Theme|Subject|Topic\s*Area|Let's\s*talk\s*about|Let's\s*discuss)\s*[\:\-]/i.test(trimmed)) {
    return true;
  }
  if (/^Part\s*[123]\s*[\:\-]\s*(Topic\s*[\:\-])?/i.test(trimmed) && !trimmed.endsWith('?')) {
    return true;
  }
  return false;
}

function extractTopicValue(line: string): string {
  return line
    .replace(/^(Part\s*[123]\s*[\:\-]\s*)?(Topic|Theme|Subject|Topic\s*Area|Let's\s*talk\s*about|Let's\s*discuss)\s*[\:\-]\s*/i, '')
    .replace(/^Part\s*[123]\s*[\:\-]\s*/i, '')
    .trim();
}

/**
 * Intelligent parser for Part 1 (Interview & Short Questions)
 */
export function parsePart1Text(rawText: string, defaultTopic: string = 'General'): {
  questions: SpeakingQuestion[];
  detectedTopic: string;
  stats: { questions: number; answers: number; topics: number };
} {
  const lines = rawText.split('\n');
  const questions: SpeakingQuestion[] = [];
  let currentTopic = defaultTopic;
  let currentQText: string[] = [];
  let currentAnsText: string[] = [];
  let inAnswerMode = false;
  let detectedTopicsCount = 0;

  const pushCurrentQuestion = () => {
    if (currentQText.length > 0) {
      const qText = currentQText.join(' ').trim();
      const ansText = currentAnsText.join('\n').trim();
      if (qText) {
        questions.push({
          id: `p1_${questions.length + 1}`,
          topic: currentTopic || 'General',
          text: stripQuestionPrefix(qText),
          sampleAnswer: ansText || ''
        });
      }
      currentQText = [];
      currentAnsText = [];
      inAnswerMode = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line || /^(\-{3,}|\={3,}|\*{3,})$/.test(line)) {
      // Empty line or divider could separate paragraphs of answer
      if (inAnswerMode && currentAnsText.length > 0 && !/^(\-{3,}|\={3,}|\*{3,})$/.test(line)) {
        currentAnsText.push('');
      }
      continue;
    }

    // Ignore Part 1 section header
    if (/^Part\s*1\s*(\([^\)]*\))?$/i.test(line) || /^Part\s*1\s*Questions/i.test(line)) {
      continue;
    }

    // Check for Topic declaration
    if (isTopicLine(line)) {
      const parsedTopic = extractTopicValue(line);
      if (parsedTopic) {
        pushCurrentQuestion();
        currentTopic = parsedTopic;
        detectedTopicsCount++;
        continue;
      }
    }

    // Check for Question start
    if (isQuestionStart(line)) {
      pushCurrentQuestion();
      currentQText.push(line);
      inAnswerMode = false;
      continue;
    }

    // Check for Answer start
    if (isAnswerStart(line)) {
      inAnswerMode = true;
      currentAnsText.push(stripAnswerPrefix(line));
      continue;
    }

    // Line continuation
    if (inAnswerMode) {
      currentAnsText.push(line);
    } else if (currentQText.length > 0) {
      // If we don't have an answer started yet, could this line be an answer or question continuation?
      if (line.endsWith('?') || /^(What|Where|When|Why|How|Do|Did|Does|Have|Has|Are|Is|Can|Could|Would|Will|Tell)\b/i.test(line)) {
        // Looks like another question without numbering!
        pushCurrentQuestion();
        currentQText.push(line);
      } else {
        // Either multi-line question or unlabelled sample answer
        // If current question already has a '?' at the end, this line is likely the sample answer!
        const lastQLine = currentQText[currentQText.length - 1];
        if (lastQLine.includes('?')) {
          inAnswerMode = true;
          currentAnsText.push(line);
        } else {
          currentQText.push(line);
        }
      }
    } else {
      // Leading text before any question: could be topic if short!
      if (!currentTopic || currentTopic === 'General') {
        if (line.length < 50 && !line.includes('?')) {
          currentTopic = line.replace(/^[•\-\*#]\s*/, '').trim();
          detectedTopicsCount++;
          continue;
        }
      }
      // Or an unnumbered question
      currentQText.push(line);
    }
  }

  pushCurrentQuestion();

  // If no questions parsed (e.g. user just pasted raw sentences), fallback to splitting by lines with '?'
  if (questions.length === 0 && rawText.trim()) {
    const rawSentences = rawText.split(/\n+/).filter(l => l.trim());
    rawSentences.forEach((s, idx) => {
      questions.push({
        id: `p1_${idx + 1}`,
        topic: currentTopic || 'General',
        text: stripQuestionPrefix(s.trim()),
        sampleAnswer: ''
      });
    });
  }

  const answersCount = questions.filter(q => q.sampleAnswer && q.sampleAnswer.trim().length > 0).length;

  return {
    questions,
    detectedTopic: currentTopic,
    stats: {
      questions: questions.length,
      answers: answersCount,
      topics: Math.max(1, detectedTopicsCount)
    }
  };
}

/**
 * Intelligent parser for Part 2 (Cue Card & Bullet Points)
 */
export function parsePart2Text(rawText: string): {
  part2: Part2Data;
  stats: { bullets: number; hasAnswer: boolean };
} {
  const lines = rawText.split('\n');
  let topic = '';
  const bulletPoints: string[] = [];
  const sampleAnswerLines: string[] = [];
  let inBullets = false;
  let inAnswerMode = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line || /^(\-{3,}|\={3,}|\*{3,})$/.test(line)) {
      if (inAnswerMode && sampleAnswerLines.length > 0 && !/^(\-{3,}|\={3,}|\*{3,})$/.test(line)) {
        sampleAnswerLines.push('');
      }
      continue;
    }

    // Ignore Part 2 header
    if (/^Part\s*2\s*(\([^\)]*\))?$/i.test(line) || /^Part\s*2\s*Cue\s*Card/i.test(line)) {
      continue;
    }

    // Check for Answer start
    if (isAnswerStart(line)) {
      inBullets = false;
      inAnswerMode = true;
      sampleAnswerLines.push(stripAnswerPrefix(line));
      continue;
    }

    if (inAnswerMode) {
      sampleAnswerLines.push(line);
      continue;
    }

    // Check for "You should say:"
    if (/You\s*should\s*say\s*[\:\-]?/i.test(line) || /You\s*should\s*mention\s*[\:\-]?/i.test(line)) {
      inBullets = true;
      continue;
    }

    // In bullets mode or bullet detected
    if (inBullets || /^[•\-\*]\s*/.test(line) || /^(and\s+explain|and\s+say|and\s+describe)\b/i.test(line)) {
      const cleanBullet = line.replace(/^[•\-\*]\s*/, '').replace(/^\d+[\.\)\:\-]\s*/, '').trim();
      if (cleanBullet) {
        bulletPoints.push(cleanBullet);
      }
      continue;
    }

    // Check for Topic
    if (isTopicLine(line)) {
      topic = extractTopicValue(line);
      continue;
    }

    // If starts with "Describe", "Talk about", "Discuss"
    if (/^(Describe|Talk\s*about|Discuss|Tell\s*me\s*about)\b/i.test(line)) {
      topic = line;
      continue;
    }

    // If topic is still empty, this line is likely the topic prompt!
    if (!topic) {
      topic = line;
      continue;
    }

    // If topic exists and not in bullets or answer yet, might be a bullet or prompt continuation
    if (line.toLowerCase().startsWith('and ') || line.includes('why') || line.includes('what') || line.includes('where') || line.includes('who')) {
      bulletPoints.push(line.replace(/^[•\-\*]\s*/, '').trim());
    } else {
      // If none of the above, start accumulating as sample answer
      inAnswerMode = true;
      sampleAnswerLines.push(line);
    }
  }

  // Fallback defaults if empty
  const finalBullets = bulletPoints.length > 0 ? bulletPoints : [
    'what it was',
    'where and when it happened',
    'who was involved',
    'and explain why this was memorable to you'
  ];

  const sampleAnswer = sampleAnswerLines.join('\n').trim();

  return {
    part2: {
      id: 'p2_1',
      topic: topic || 'Describe an unforgettable experience you have had',
      bulletPoints: finalBullets,
      sampleAnswer
    },
    stats: {
      bullets: finalBullets.length,
      hasAnswer: !!sampleAnswer
    }
  };
}

/**
 * Intelligent parser for Part 3 (Two-way Discussion)
 */
export function parsePart3Text(rawText: string, defaultTopic: string = 'Discussion'): {
  questions: SpeakingQuestion[];
  detectedTopic: string;
  stats: { questions: number; answers: number; topics: number };
} {
  const lines = rawText.split('\n');
  const questions: SpeakingQuestion[] = [];
  let currentTopic = defaultTopic;
  let currentQText: string[] = [];
  let currentAnsText: string[] = [];
  let inAnswerMode = false;
  let detectedTopicsCount = 0;

  const pushCurrentQuestion = () => {
    if (currentQText.length > 0) {
      const qText = currentQText.join(' ').trim();
      const ansText = currentAnsText.join('\n').trim();
      if (qText) {
        questions.push({
          id: `p3_${questions.length + 1}`,
          topic: currentTopic || 'Discussion',
          text: stripQuestionPrefix(qText),
          sampleAnswer: ansText || ''
        });
      }
      currentQText = [];
      currentAnsText = [];
      inAnswerMode = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line || /^(\-{3,}|\={3,}|\*{3,})$/.test(line)) {
      if (inAnswerMode && currentAnsText.length > 0 && !/^(\-{3,}|\={3,}|\*{3,})$/.test(line)) {
        currentAnsText.push('');
      }
      continue;
    }

    if (/^Part\s*3\s*(\([^\)]*\))?$/i.test(line) || /^Part\s*3\s*Questions/i.test(line) || /^Discussion\s*Questions/i.test(line)) {
      continue;
    }

    if (isTopicLine(line)) {
      const parsedTopic = extractTopicValue(line);
      if (parsedTopic) {
        pushCurrentQuestion();
        currentTopic = parsedTopic;
        detectedTopicsCount++;
        continue;
      }
    }

    if (isQuestionStart(line)) {
      pushCurrentQuestion();
      currentQText.push(line);
      inAnswerMode = false;
      continue;
    }

    if (isAnswerStart(line)) {
      inAnswerMode = true;
      currentAnsText.push(stripAnswerPrefix(line));
      continue;
    }

    if (inAnswerMode) {
      currentAnsText.push(line);
    } else if (currentQText.length > 0) {
      if (line.endsWith('?') || /^(What|Where|When|Why|How|Do|Did|Does|Have|Has|Are|Is|Can|Could|Would|Will|Tell)\b/i.test(line)) {
        pushCurrentQuestion();
        currentQText.push(line);
      } else {
        const lastQLine = currentQText[currentQText.length - 1];
        if (lastQLine.includes('?')) {
          inAnswerMode = true;
          currentAnsText.push(line);
        } else {
          currentQText.push(line);
        }
      }
    } else {
      if (!currentTopic || currentTopic === 'Discussion') {
        if (line.length < 50 && !line.includes('?')) {
          currentTopic = line.replace(/^[•\-\*#]\s*/, '').trim();
          detectedTopicsCount++;
          continue;
        }
      }
      currentQText.push(line);
    }
  }

  pushCurrentQuestion();

  if (questions.length === 0 && rawText.trim()) {
    const rawSentences = rawText.split(/\n+/).filter(l => l.trim());
    rawSentences.forEach((s, idx) => {
      questions.push({
        id: `p3_${idx + 1}`,
        topic: currentTopic || 'Discussion',
        text: stripQuestionPrefix(s.trim()),
        sampleAnswer: ''
      });
    });
  }

  const answersCount = questions.filter(q => q.sampleAnswer && q.sampleAnswer.trim().length > 0).length;

  return {
    questions,
    detectedTopic: currentTopic,
    stats: {
      questions: questions.length,
      answers: answersCount,
      topics: Math.max(1, detectedTopicsCount)
    }
  };
}

/**
 * Parses full test text containing Parts 1, 2, and 3
 */
export function parseFullTestText(fullText: string): {
  formData: SpeakingFormData;
  rawParts: { part1: string; part2: string; part3: string };
  stats: ParseStats;
} {
  // Intelligent detection for Part 1, Part 2, and Part 3
  let p1Match = fullText.search(/(^|\n)\s*(#*\s*)?(PART\s*1\b|Part\s*1\b|Part\s*One\b|TASK\s*1\b|Part\s*I\b)/i);
  let p2Match = fullText.search(/(^|\n)\s*(#*\s*)?(PART\s*2\b|Part\s*2\b|Part\s*Two\b|TASK\s*2\b|Cue\s*Card\b|Part\s*II\b|Candidate\s*Task\s*Card\b)/i);
  let p3Match = fullText.search(/(^|\n)\s*(#*\s*)?(PART\s*3\b|Part\s*3\b|Part\s*Three\b|TASK\s*3\b|Discussion\b|Part\s*III\b)/i);

  // Fallback: If no explicit Part 2 header, check for "You should say:"
  if (p2Match === -1) {
    const cueMatch = fullText.search(/(^|\n)\s*(You\s*should\s*say|You\s*should\s*mention)\s*[\:\-]/i);
    if (cueMatch !== -1) {
      // Find the start of the topic line before "You should say:"
      const beforeCue = fullText.substring(0, cueMatch);
      const lastLineBreak = beforeCue.lastIndexOf('\n\n');
      p2Match = lastLineBreak !== -1 ? lastLineBreak + 2 : cueMatch;
    }
  }

  let p1Raw = '';
  let p2Raw = '';
  let p3Raw = '';

  if (p2Match !== -1 && p3Match !== -1) {
    p1Raw = p1Match !== -1 ? fullText.substring(p1Match, p2Match).trim() : fullText.substring(0, p2Match).trim();
    p2Raw = fullText.substring(p2Match, p3Match).trim();
    p3Raw = fullText.substring(p3Match).trim();
  } else if (p2Match !== -1) {
    p1Raw = p1Match !== -1 ? fullText.substring(p1Match, p2Match).trim() : fullText.substring(0, p2Match).trim();
    p2Raw = fullText.substring(p2Match).trim();
  } else if (p3Match !== -1) {
    p1Raw = p1Match !== -1 ? fullText.substring(p1Match, p3Match).trim() : fullText.substring(0, p3Match).trim();
    p3Raw = fullText.substring(p3Match).trim();
  } else {
    // If headers are missing, treat as Part 1
    p1Raw = fullText;
  }

  const p1Result = parsePart1Text(p1Raw || fullText);
  const p2Result = parsePart2Text(p2Raw);
  const p3Result = parsePart3Text(p3Raw);

  const stats: ParseStats = {
    p1Questions: p1Result.questions.length,
    p1Answers: p1Result.stats.answers,
    p1Topics: p1Result.stats.topics,
    p2Bullets: p2Result.stats.bullets,
    p2HasAnswer: p2Result.stats.hasAnswer,
    p3Questions: p3Result.questions.length,
    p3Answers: p3Result.stats.answers,
    p3Topics: p3Result.stats.topics
  };

  return {
    formData: {
      part1: p1Result.questions,
      part2: p2Result.part2,
      part3: p3Result.questions
    },
    rawParts: {
      part1: p1Raw,
      part2: p2Raw,
      part3: p3Raw
    },
    stats
  };
}

/**
 * Formats structured SpeakingFormData into readable bulk paste text
 */
export function formatFormDataToPasteText(formData: SpeakingFormData, section: 'all' | 'part1' | 'part2' | 'part3' = 'all'): string {
  const formatP1 = () => {
    let out = 'PART 1\n';
    let lastTopic = '';
    formData.part1.forEach((q, i) => {
      if (q.topic && q.topic !== lastTopic) {
        out += `\nTopic: ${q.topic}\n`;
        lastTopic = q.topic;
      }
      out += `${i + 1}. ${q.text}\n`;
      if (q.sampleAnswer) {
        out += `Sample Answer: ${q.sampleAnswer}\n`;
      }
    });
    return out.trim();
  };

  const formatP2 = () => {
    let out = 'PART 2 (Cue Card)\n';
    out += `Topic: ${formData.part2.topic}\n\n`;
    out += `You should say:\n`;
    formData.part2.bulletPoints.forEach(bp => {
      out += `• ${bp}\n`;
    });
    if (formData.part2.sampleAnswer) {
      out += `\nSample Answer:\n${formData.part2.sampleAnswer}\n`;
    }
    return out.trim();
  };

  const formatP3 = () => {
    let out = 'PART 3 (Discussion)\n';
    let lastTopic = '';
    formData.part3.forEach((q, i) => {
      if (q.topic && q.topic !== lastTopic) {
        out += `\nTopic: ${q.topic}\n`;
        lastTopic = q.topic;
      }
      out += `${i + 1}. ${q.text}\n`;
      if (q.sampleAnswer) {
        out += `Sample Answer: ${q.sampleAnswer}\n`;
      }
    });
    return out.trim();
  };

  if (section === 'part1') return formatP1();
  if (section === 'part2') return formatP2();
  if (section === 'part3') return formatP3();

  return `${formatP1()}\n\n---\n\n${formatP2()}\n\n---\n\n${formatP3()}`;
}

/**
 * Standard High-Band IELTS Speaking Test 1 Sample Data for immediate testing
 */
export const SAMPLE_BULK_TEST_TEXT = `PART 1
Topic: Hometown and Neighborhood
1. Where is your hometown located?
Sample Answer: I was born and raised in Da Nang, which is a vibrant coastal city located in central Vietnam. It is renowned for its stunning sandy beaches and scenic mountain ranges.

2. What do you like most about living there?
Sample Answer: What I appreciate most is the relaxed pace of life combined with modern amenities. The locals are exceptionally warm and welcoming, and the local seafood is fresh and affordable.

3. Is your hometown a good place for young people to live?
Sample Answer: Definitely yes. In recent years, it has transformed into a dynamic economic and educational hub with numerous tech startups, universities, and recreational spaces for young professionals.

4. Has your hometown changed much over the last ten years?
Sample Answer: Immensely. A decade ago, it was much quieter, but extensive infrastructure investments have brought iconic bridges, high-rise buildings, and international tourism to the area.

Topic: Work and Studies
5. Do you currently work or are you a student?
Sample Answer: Currently, I am in my final year at university studying Computer Science, while also working part-time as a junior front-end web developer.

6. Why did you choose this particular field?
Sample Answer: I have had an innate curiosity about technology since childhood. I love the creative problem-solving process of turning abstract lines of code into functional digital tools.

7. What is your daily study or work routine like?
Sample Answer: My days usually kick off early around 7 AM. I attend morning lectures, spend the afternoon coding and collaborating with my project team, and reserve evenings for revision and reading.

8. Do you plan to continue in this career in the future?
Sample Answer: Without a doubt. The tech industry is continually innovating, especially with artificial intelligence, so I look forward to advancing into software architecture after graduating.

---

PART 2
Topic: Describe an important decision you made that changed your life for the better.

You should say:
• What the decision was
• When and why you made it
• What difficulties or challenges you faced
• And explain how this decision positively influenced your life.

Sample Answer:
An important decision that marked a major turning point in my life occurred about three years ago, when I decided to switch my academic major from accounting to computer engineering. 

At that time, I was halfway through my second year of business studies. Although I was achieving decent grades, I felt uninspired and lacked genuine enthusiasm for financial auditing. After attending a weekend tech hackathon with a friend, I discovered the immense thrill of digital development. That weekend sparked a realization that I wanted to pursue a career that excited me every single morning.

Making the change was not easy. My parents initially expressed deep concern about throwing away two years of coursework, and I had to spend months of intense independent study catching up on advanced calculus and programming fundamentals to pass the transfer exams.

Ultimately, this decision proved to be the most rewarding choice I have ever made. It restored my motivation, allowed me to secure exciting internships, and taught me the invaluable lesson that taking calculated risks to follow your true passion is always worth the effort.

---

PART 3
Topic: Decision Making and Life Choices
1. Do you believe that young people find it harder to make decisions today than in the past?
Sample Answer: Yes, largely because young people today suffer from what psychologists call the paradox of choice. With the explosion of the internet and social media, they are constantly exposed to countless career paths, lifestyles, and opinions, which often creates analysis paralysis and fear of missing out.

2. Should parents make major life decisions for their teenage children?
Sample Answer: In my view, parents should provide guidance and wisdom rather than dictating choices. By allowing teenagers to make their own decisions—and even learn from small mistakes—they foster critical thinking and self-reliance, which are vital life skills in adulthood.

3. How does advice from friends influence people's important decisions?
Sample Answer: Peers can have a profound impact, especially on younger generations. Friends often share similar perspectives and cultural values, making their recommendations feel more relatable, although individuals must remain cautious not to succumb to peer pressure.

Topic: Role of Technology in Everyday Decisions
4. How has modern technology altered the way we make everyday choices?
Sample Answer: Technology has streamlined daily choices through data-driven recommendations, customer reviews, and navigation apps. From deciding where to eat to selecting an airline ticket, algorithms curate tailored options, saving substantial time.

5. Are there any disadvantages to relying heavily on algorithms for decision-making?
Sample Answer: A significant downside is cognitive atrophy and diminished intuition. When individuals rely excessively on algorithmic suggestions, they risk losing the ability to critically weigh options independently and can find themselves trapped in echo chambers.`;
