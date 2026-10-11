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

export interface SpeakingTestData {
  part1: SpeakingQuestion[];
  part2: Part2Data;
  part3: SpeakingQuestion[];
}

export const IELTS_SPEAKING_QUESTIONS: Record<string, SpeakingTestData> = {
  // Test 1: Hometown & Studies, Important Decision
  '1': {
    part1: [
      { 
        id: 'p1_1', 
        topic: 'Hometown', 
        text: 'Where is your hometown located?',
        sampleAnswer: 'I was born and raised in Da Nang, a vibrant coastal city in central Vietnam, renowned for its sandy beaches and scenic mountain ranges.'
      },
      { 
        id: 'p1_2', 
        topic: 'Hometown', 
        text: 'What do you like most about living there?',
        sampleAnswer: 'What I appreciate most is the balanced pace of life combined with modern amenities, genuinely friendly locals, and delicious fresh seafood.'
      },
      { 
        id: 'p1_3', 
        topic: 'Hometown', 
        text: 'Is your hometown a good place for young people to live?',
        sampleAnswer: 'Definitely yes. Over the past few years, it has transformed into a thriving economic and educational hub with numerous opportunities in tech and tourism.'
      },
      { 
        id: 'p1_4', 
        topic: 'Hometown', 
        text: 'Has your hometown changed much over the last ten years?',
        sampleAnswer: 'Immensely. Large-scale infrastructure investments have brought iconic bridges, modern high-rises, and international travel connections.'
      },
      { 
        id: 'p1_5', 
        topic: 'Work & Studies', 
        text: 'Do you currently work or are you a student?',
        sampleAnswer: 'Currently, I am in my final undergraduate year studying Information Systems while interning part-time at a local software startup.'
      },
      { 
        id: 'p1_6', 
        topic: 'Work & Studies', 
        text: 'Why did you choose this particular field of study or work?',
        sampleAnswer: 'I have had a passion for computing since childhood. I love the creative problem-solving process of building practical digital solutions.'
      },
      { 
        id: 'p1_7', 
        topic: 'Work & Studies', 
        text: 'What is your daily study or work routine like?',
        sampleAnswer: 'My days start early around 7 AM. I attend morning lectures, spend the afternoon coding and collaborating with my teammates, and revise in the evening.'
      },
      { 
        id: 'p1_8', 
        topic: 'Work & Studies', 
        text: 'Do you plan to continue in this career path in the future?',
        sampleAnswer: 'Without a doubt. The tech field continues to expand rapidly, especially with AI, and I aspire to become a senior solutions architect.'
      }
    ],
    part2: {
      id: 'p2_1',
      topic: 'Describe an important decision you made that changed your life for the better.',
      bulletPoints: [
        'what the decision was',
        'when and why you made it',
        'what difficulties or challenges you faced',
        'and explain how this decision positively influenced your life.'
      ],
      sampleAnswer: `An important decision that marked a major turning point in my life occurred about three years ago, when I decided to switch my academic major to computer engineering.

At that time, I was halfway through my second year of business studies. Although I was achieving good grades, I felt uninspired and lacked genuine enthusiasm for financial accounting. After attending a weekend tech hackathon, I discovered the immense thrill of digital development.

Making the change was not easy. My parents initially expressed deep concern about throwing away two years of coursework, and I had to spend months of intense independent study catching up on programming fundamentals and calculus.

Ultimately, this decision proved to be the most rewarding choice I have ever made. It restored my motivation, allowed me to secure exciting internships, and taught me that taking calculated risks to follow your true passion is always worth the effort.`
    },
    part3: [
      { 
        id: 'p3_1', 
        topic: 'Decision Making', 
        text: 'Do you believe that young people find it harder to make decisions today than in the past?',
        sampleAnswer: 'Yes, largely because young people today face information overload and a paradox of choice. Constant exposure to contrasting lifestyles on social media often sparks analysis paralysis.'
      },
      { 
        id: 'p3_2', 
        topic: 'Decision Making', 
        text: 'Should parents make major life decisions for their teenage children?',
        sampleAnswer: 'In my view, parents should provide guidance and wisdom rather than dictating choices, allowing teenagers to build confidence and independence by learning from their own decisions.'
      },
      { 
        id: 'p3_3', 
        topic: 'Decision Making', 
        text: "How does advice from friends influence people's important choices?",
        sampleAnswer: 'Peers offer relatable perspectives because they share similar generational values, though one must remain objective and avoid simple conformity.'
      },
      { 
        id: 'p3_4', 
        topic: 'Technology & Choices', 
        text: 'How has modern technology altered the way we make everyday choices?',
        sampleAnswer: 'Technology simplifies routine choices through algorithms and customer reviews, from ride-hailing to online meal deliveries.'
      },
      { 
        id: 'p3_5', 
        topic: 'Technology & Choices', 
        text: 'Are there any disadvantages to relying heavily on algorithms for decision-making?',
        sampleAnswer: 'Excessive reliance can erode critical thinking skills and keep users confined in cognitive echo chambers where alternative choices are never encountered.'
      }
    ]
  },

  // Test 2: Where You Live & Singing, Tall Building
  '2': {
    part1: [
      { 
        id: 'p1_1', 
        topic: 'Where You Live', 
        text: 'What do you like most about the place where you live?',
        sampleAnswer: 'What I enjoy most is the peaceful ambiance and close sense of community in my neighborhood, along with convenient access to parks and public transit.'
      },
      { 
        id: 'p1_2', 
        topic: 'Where You Live', 
        text: 'Is it a good place for young people? Why or why not?',
        sampleAnswer: 'I would say it is very suitable. There are several coffee shops, study spaces, sports facilities, and good job hubs within easy commuting distance.'
      },
      { 
        id: 'p1_3', 
        topic: 'Where You Live', 
        text: 'Would you like to move to another place in the future? Why?',
        sampleAnswer: 'Eventually, I might consider living abroad for a few years to experience different cultures and advance my career, although I will always consider this city my true home.'
      },
      { 
        id: 'p1_4', 
        topic: 'Study', 
        text: 'What do you enjoy most about your work or studies?',
        sampleAnswer: 'I really love the collaborative atmosphere and the opportunity to tackle real-world case studies that challenge my analytical thinking.'
      },
      { 
        id: 'p1_5', 
        topic: 'Study', 
        text: 'What subject or part of your work do you find the most challenging?',
        sampleAnswer: 'Time management and balancing multiple project deadlines simultaneously is definitely the most demanding aspect.'
      },
      { 
        id: 'p1_6', 
        topic: 'Singing', 
        text: 'When do you usually sing?',
        sampleAnswer: 'I mostly sing casually while listening to music in the shower, or occasionally at karaoke gatherings with close friends on weekends.'
      },
      { 
        id: 'p1_7', 
        topic: 'Singing', 
        text: 'Did you enjoy singing when you were a child?',
        sampleAnswer: 'Yes, I was quite enthusiastic about singing during primary school music classes and would often sing along to nursery rhymes.'
      },
      { 
        id: 'p1_8', 
        topic: 'Singing', 
        text: 'Is singing a popular activity in your country?',
        sampleAnswer: 'Singing and karaoke culture are immensely popular in Vietnam across all age groups, especially during family reunions and festivals.'
      }
    ],
    part2: {
      id: 'p2_1',
      topic: 'Describe a tall building you like or dislike.',
      bulletPoints: [
        'where it is',
        'what it looks like',
        'why you visited it or know about it',
        'and explain why you like or dislike this building.'
      ],
      sampleAnswer: `I would like to describe Landmark 81, which is the tallest skyscraper in Ho Chi Minh City and an iconic modern landmark in Vietnam.

Located right along the scenic Saigon River in Binh Thanh District, this architectural marvel features a sleek tiered glass structure inspired by traditional bundles of bamboo, symbolizing resilience and collective unity.

I visited the building last year with my friends to check out the sky observation deck on the top floors. From up there, you get a breathtaking panoramic view of the entire metropolis, especially as the sun sets and the city lights flicker on.

I genuinely admire Landmark 81 not only for its stunning modern aesthetics, but also because it stands as a proud symbol of rapid technological and economic progress in Vietnam.`
    },
    part3: [
      { 
        id: 'p3_1', 
        topic: 'Skyscrapers', 
        text: 'Why are cities building more skyscrapers nowadays?',
        sampleAnswer: 'Due to severe land scarcity and high population densities in metropolitan centers, building upward maximizes urban efficiency and accommodates commercial and residential needs.'
      },
      { 
        id: 'p3_2', 
        topic: 'Skyscrapers', 
        text: 'What are the advantages of tall buildings?',
        sampleAnswer: 'Skyscrapers offer vertical integration, reducing daily commuting times when offices, retail, and living quarters are located within the same complex, while also preserving open green space at ground level.'
      },
      { 
        id: 'p3_3', 
        topic: 'Skyscrapers', 
        text: 'Which do you think is better: living in a high-rise apartment or in a traditional house? Why?',
        sampleAnswer: 'Both have distinct merits. High-rise apartments provide 24/7 security, elevated views, and integrated amenities, whereas traditional houses offer private land ownership and greater autonomy.'
      },
      { 
        id: 'p3_4', 
        topic: 'Skyscrapers', 
        text: 'Do you think cities should preserve old buildings instead of constructing new ones?',
        sampleAnswer: 'Striking a balance is paramount. Historic heritage structures preserve cultural identity and attract tourism, so they should be restored alongside modern construction.'
      },
      { 
        id: 'p3_5', 
        topic: 'Skyscrapers', 
        text: 'How do you think buildings will change in the future?',
        sampleAnswer: 'Future architecture will prioritize sustainability, integrating solar facades, vertical hanging gardens, rainwater harvesting, and smart energy-saving automation.'
      }
    ]
  },

  // Test 3: Headphones & Scenery, A Rule You Dislike
  '3': {
    part1: [
      { id: 'p1_1', topic: 'Headphones', text: 'Do you often use headphones?', sampleAnswer: 'Yes, almost every single day, particularly during commutes and while focusing on assignments in the library.' },
      { id: 'p1_2', topic: 'Headphones', text: 'What do you usually listen to with your headphones?', sampleAnswer: 'I usually listen to instrumental lo-fi music when studying, or informative podcasts during my morning walks.' },
      { id: 'p1_3', topic: 'Headphones', text: 'Do you prefer wireless or wired headphones?', sampleAnswer: 'I definitely prefer wireless earbuds for everyday convenience and freedom of movement, though wired sets have slightly better latency.' },
      { id: 'p1_4', topic: 'Headphones', text: 'Do you think headphones affect communication with others?', sampleAnswer: 'They can occasionally create a social barrier in public spaces, making people less approachable, but they also provide essential personal focus.' },
      { id: 'p1_5', topic: 'Scenery', text: 'Do you enjoy looking at beautiful scenery?', sampleAnswer: 'Absolutely. Taking in panoramic views of natural landscapes provides immediate mental clarity and lowers stress.' },
      { id: 'p1_6', topic: 'Scenery', text: 'What kind of scenery do you like the most?', sampleAnswer: 'I am particularly drawn to coastal vistas with turquoise water and cliffs, as well as misty mountain valleys at sunrise.' },
      { id: 'p1_7', topic: 'Scenery', text: 'Is there a place with beautiful scenery near where you live?', sampleAnswer: 'Yes, there is a scenic lake and hill park just twenty minutes from my home where residents enjoy walking during sunset.' },
      { id: 'p1_8', topic: 'Scenery', text: 'Do you often take photos of landscapes?', sampleAnswer: 'Frequently. Whenever I encounter a striking vista while traveling, I like to photograph it to preserve the aesthetic memory.' }
    ],
    part2: {
      id: 'p2_1',
      topic: "Describe a rule (at school or at work) that you don't like",
      bulletPoints: [
        'What the rule is',
        'Where you have to follow it',
        'How other people feel about it',
        "and explain why you don't like this rule."
      ],
      sampleAnswer: `One school rule that I don't really like is the strict ban on mobile phone usage during break times and independent study periods.

I had to follow this rule at my high school. The school administration introduced it to minimize digital distractions and encourage face-to-face peer interaction. However, many students felt the blanket prohibition was excessive.

The main reason I disliked this rule was its lack of flexibility. In today's digital era, smartphones serve as indispensable learning tools for looking up academic references, checking schedule updates, and accessing educational apps. A more nuanced guideline that permits purposeful academic use would be far more constructive.`
    },
    part3: [
      { 
        id: 'p3_1', 
        topic: 'Rules and Laws', 
        text: "It's often said that everyone breaks the law at some point in their life. Do you agree or disagree? Why?",
        sampleAnswer: 'I agree to an extent. Many people commit minor infractions unwittingly, such as jaywalking or exceeding the speed limit by a few kilometers per hour, often due to habit or convenience rather than malice.'
      },
      { 
        id: 'p3_2', 
        topic: 'Rules and Laws', 
        text: "What would happen if every country in the world had the same set of laws?",
        sampleAnswer: 'A completely unified legal system would be impractical because laws must reflect the unique cultural traditions, socio-economic contexts, and moral values of each sovereign nation.'
      },
      { 
        id: 'p3_3', 
        topic: 'Rules and Laws', 
        text: "Why do countries have different laws even though some problems are universal?",
        sampleAnswer: 'Even though crimes like theft are universal, different societies favor varying philosophies of punishment versus rehabilitation depending on their historical and religious background.'
      }
    ]
  },

  // Test 4: Weather & Books, Conversation with a Stranger
  '4': {
    part1: [
      { id: 'p1_1', topic: 'Weather', text: 'What is the weather like today in your city?', sampleAnswer: 'It is pleasantly sunny with a gentle breeze and clear blue skies, making it ideal for outdoor activities.' },
      { id: 'p1_2', topic: 'Weather', text: 'Do you prefer hot or cold weather? Why?', sampleAnswer: 'I prefer cooler autumn weather because it is far more comfortable for walking and allows for stylish layering of clothes.' },
      { id: 'p1_3', topic: 'Weather', text: 'Does the weather ever affect your mood or daily plans?', sampleAnswer: 'Definitely. Continuous gloomy rain can make me feel sluggish, whereas crisp sunshine immediately boosts my enthusiasm and energy levels.' },
      { id: 'p1_4', topic: 'Weather', text: 'What is your favorite season of the year?', sampleAnswer: 'My favorite season is spring, when trees blossom and temperatures are mild and invigorating.' },
      { id: 'p1_5', topic: 'Books', text: 'Do you enjoy reading books in your free time?', sampleAnswer: 'Yes, I read frequently, especially non-fiction titles on psychology, technology, and biographies of visionary entrepreneurs.' },
      { id: 'p1_6', topic: 'Books', text: 'What kinds of books did you read when you were younger?', sampleAnswer: 'As a child, I was enthralled by adventure novels, comic strips, and fantasy series like Harry Potter.' },
      { id: 'p1_7', topic: 'Books', text: 'Do you prefer reading printed paper books or digital e-books?', sampleAnswer: 'I appreciate the convenience and lightness of e-readers for commuting, but nothing beats the tactile pleasure and scent of a traditional paper book.' },
      { id: 'p1_8', topic: 'Books', text: 'Have you ever given a book to someone as a gift?', sampleAnswer: 'Yes, I recently gifted an inspiring self-development book to my younger cousin on his high school graduation.' }
    ],
    part2: {
      id: 'p2_1',
      topic: 'Describe an interesting conversation you had with a stranger.',
      bulletPoints: [
        'who this person was',
        'where and when the conversation took place',
        'what you talked about',
        'and explain why you found this conversation interesting.'
      ],
      sampleAnswer: `I would like to talk about a memorable chat I had with an elderly gentleman while traveling on a cross-country train journey about six months ago.

I was traveling alone from Hanoi to Da Nang, and the trip took over fourteen hours. He was sitting opposite me by the window, sketching the landscapes passing by in a leather-bound notebook. Out of curiosity, I complimented his artwork, which led into a lively and warm conversation.

It turned out he was a retired landscape architect who had spent his career working on historic preservation projects. He shared fascinating stories about how traditional architecture harmonizes with nature, and how modern urbanization is transforming cityscapes.

What made the conversation truly captivating was his perspective on life. Rather than lamenting modernization, he emphasized the value of finding beauty in quiet everyday moments. His warmth and optimism left a lasting impression on me.`
    },
    part3: [
      { 
        id: 'p3_1', 
        topic: 'Communication', 
        text: 'Do you think modern technology has made people communicate more or less effectively?',
        sampleAnswer: 'Technology allows instantaneous connectivity, but it often encourages superficial text interactions over empathetic, face-to-face dialogue.'
      },
      { 
        id: 'p3_2', 
        topic: 'Communication', 
        text: 'Why do some people find it difficult to talk to strangers?',
        sampleAnswer: 'Social anxiety, fear of negative judgment, and fear of rejection frequently hold individuals back from initiating spontaneous conversations.'
      },
      { 
        id: 'p3_3', 
        topic: 'Communication', 
        text: 'What are the benefits of talking to people from diverse backgrounds?',
        sampleAnswer: 'It broadens our worldview, fosters cultural empathy, and challenges personal preconceptions.'
      },
      { 
        id: 'p3_4', 
        topic: 'Communication', 
        text: 'How do communication styles differ between younger and older generations?',
        sampleAnswer: 'Younger people favor brief, visually rich digital formats, whereas older individuals typically appreciate structured, in-depth verbal exchanges.'
      }
    ]
  },

  // Test 5: Travel & Morning Routines, Journey by Public Transport
  '5': {
    part1: [
      { id: 'p1_1', topic: 'Travel', text: 'Do you enjoy traveling to new places?', sampleAnswer: 'Yes, I love exploring unfamiliar destinations because it exposes me to diverse cultures, cuisines, and perspectives on life.' },
      { id: 'p1_2', topic: 'Travel', text: 'How do you usually plan your trips?', sampleAnswer: 'I usually research travel vlogs and online forums to locate authentic local eateries, while booking transport and accommodation well in advance.' },
      { id: 'p1_3', topic: 'Travel', text: 'Do you prefer traveling alone or with friends?', sampleAnswer: 'I lean towards traveling with close companions because shared memories and laughter make the overall experience much richer.' },
      { id: 'p1_4', topic: 'Travel', text: 'Where would you like to travel next?', sampleAnswer: 'I would love to explore Japan during the cherry blossom season to experience its captivating blend of ancient temples and cutting-edge tech.' },
      { id: 'p1_5', topic: 'Morning Routine', text: 'What is your typical morning routine?', sampleAnswer: 'I usually wake up around 6:30 AM, drink a glass of warm water, stretch for ten minutes, and enjoy freshly brewed coffee while checking the morning news.' },
      { id: 'p1_6', topic: 'Morning Routine', text: 'Are your morning habits different on weekends?', sampleAnswer: 'Yes, weekends are far more leisurely; I sleep in an hour later and often go out for brunch with friends instead of rushing to study.' },
      { id: 'p1_7', topic: 'Morning Routine', text: 'Do you consider yourself a morning person or a night owl?', sampleAnswer: 'I am definitely more productive in the morning when my mind is clear and there are minimal interruptions.' },
      { id: 'p1_8', topic: 'Morning Routine', text: 'Is breakfast important to you?', sampleAnswer: 'Very important. A nutritious breakfast provides the sustained metabolic energy needed for high mental focus throughout the day.' }
    ],
    part2: {
      id: 'p2_1',
      topic: 'Describe a memorable journey you took by public transport.',
      bulletPoints: [
        'what transport you used',
        'where you were going and with whom',
        'what happened during the journey',
        'and explain why this journey was memorable to you.'
      ],
      sampleAnswer: `I would like to describe a scenic high-speed train journey I took last summer from Tokyo to Kyoto with two of my closest friends.

We boarded the Shinkansen early on a bright July morning. As the bullet train pulled smoothly away from the station, the dense urban skyline gradually transformed into emerald-green rice paddies and rolling mountains.

About an hour into the trip, the train conductor announced that Mount Fuji was visible on the right. The entire carriage turned to gaze at the snow-dusted peak rising majestically above the clouds. We ate traditional bento lunch boxes purchased at the station while marveling at the punctuality and whisper-quiet engineering of the train.

What made this journey truly unforgettable was the sheer contrast between blistering 300 km/h speed and profound inner peace. It proved that traveling between destinations can be just as inspiring as the destination itself.`
    },
    part3: [
      { id: 'p3_1', topic: 'Public Transport', text: 'Why do governments need to invest heavily in public transport systems?', sampleAnswer: 'Efficient mass transit alleviates traffic congestion, lowers carbon emissions, and ensures equitable urban mobility for low-income citizens.' },
      { id: 'p3_2', topic: 'Public Transport', text: 'What are the main drawbacks of relying exclusively on private cars?', sampleAnswer: 'Private automobiles exacerbate gridlock, consume immense parking real estate, and contribute heavily to air pollution and fossil fuel depletion.' },
      { id: 'p3_3', topic: 'Urban Mobility', text: 'How will autonomous vehicles and electric buses transform urban commuting?', sampleAnswer: 'They will optimize traffic flows, eliminate human driver fatigue errors, and drastically curb urban smog.' },
      { id: 'p3_4', topic: 'Urban Mobility', text: 'Do you think fares for public transport should be subsidized or completely free?', sampleAnswer: 'Subsidizing fares to keep them affordable is sustainable, whereas completely free transit often strains municipal maintenance budgets.' }
    ]
  },

  // Test 6: Sports & Fitness, Exciting Sports Event
  '6': {
    part1: [
      { id: 'p1_1', topic: 'Sports', text: 'Do you play any sports regularly?', sampleAnswer: 'Yes, I play badminton twice a week with friends and go swimming on weekends to keep active.' },
      { id: 'p1_2', topic: 'Sports', text: 'What is the most popular sport in your country?', sampleAnswer: 'Football is by far the most beloved sport; whenever the national team competes, entire cities celebrate in the streets.' },
      { id: 'p1_3', topic: 'Sports', text: 'Did you participate in sports when you were in school?', sampleAnswer: 'Yes, I was on my middle school basketball team, which taught me cooperation, physical agility, and sportsmanship.' },
      { id: 'p1_4', topic: 'Sports', text: 'Do you prefer watching sports live in a stadium or on television?', sampleAnswer: 'Watching live at a stadium is unmatched because the roaring energy of thousands of fans creates an electric atmosphere.' },
      { id: 'p1_5', topic: 'Shopping', text: 'How often do you go shopping?', sampleAnswer: 'I do grocery shopping two or three times weekly, while clothes and electronics shopping happens once every couple of months.' },
      { id: 'p1_6', topic: 'Shopping', text: 'Do you prefer shopping online or in traditional stores?', sampleAnswer: 'I prefer online shopping for everyday commodities due to competitive discounts, but I visit physical stores when buying clothes to check fabric and fit.' },
      { id: 'p1_7', topic: 'Shopping', text: 'Have you ever bought something on impulse that you regretted?', sampleAnswer: 'Yes, I once bought a fancy coffee espresso machine during an online flash sale that ended up gathering dust in my cupboard.' },
      { id: 'p1_8', topic: 'Shopping', text: 'Do you enjoy shopping with others or alone?', sampleAnswer: 'I prefer shopping alone because I can browse at my own pace without feeling pressured or keeping anyone waiting.' }
    ],
    part2: {
      id: 'p2_1',
      topic: 'Describe an exciting sports event you watched live or on television.',
      bulletPoints: [
        'what the event was',
        'where you watched it and who was with you',
        'what happened during the competition',
        'and explain why you found it so thrilling.'
      ],
      sampleAnswer: `I would like to describe the dramatic 2022 FIFA World Cup Final between Argentina and France, which I watched live on television with my family and several close friends.

We gathered at my home on a Sunday evening, ordering pizza and snacks. The match began with Argentina dominating and taking a two-goal lead, which had us convinced the game was settled.

However, in the final ten minutes of regular time, Kylian Mbappé scored two breathtaking goals in under two minutes, sending the match into extra time. The tension was palpable; both teams traded spectacular goals, culminating in a nerve-racking penalty shootout that saw Lionel Messi finally hoist the trophy.

What made this event so thrilling was the unbelievable emotional rollercoaster. The supreme athleticism, tactical intensity, and sheer drama on display demonstrated why sports unite people like nothing else.`
    },
    part3: [
      { id: 'p3_1', topic: 'Sports & Society', text: 'Why do elite athletes earn significantly higher salaries than professionals like doctors and teachers?', sampleAnswer: 'Their compensation reflects the enormous commercial revenues generated by global broadcasting rights, sponsorship deals, and entertainment value, rather than strict utilitarian importance.' },
      { id: 'p3_2', topic: 'Sports & Society', text: 'Should governments prioritize funding for elite Olympic athletes or grassroots public fitness?', sampleAnswer: 'Grassroots public fitness deserves precedence because promoting widespread physical health yields massive long-term reductions in healthcare expenditures.' },
      { id: 'p3_3', topic: 'Fitness Culture', text: 'Why is physical inactivity becoming a major health crisis among young people?', sampleAnswer: 'Sedentary screen time, addictive social media, and academic pressure have crowded out spontaneous outdoor play and daily exercise.' },
      { id: 'p3_4', topic: 'Fitness Culture', text: 'How can schools encourage students who dislike competitive athletics to stay physically active?', sampleAnswer: 'By offering non-competitive recreational activities like yoga, hiking, dance, and cycling alongside traditional ball sports.' }
    ]
  },

  // Test 7: Art & Leisure, Captivating Piece of Art
  '7': {
    part1: [
      { id: 'p1_1', topic: 'Art', text: 'Do you enjoy visiting art galleries and museums?', sampleAnswer: 'Yes, whenever I have free time on weekends, visiting modern art galleries provides a deeply restorative creative escape.' },
      { id: 'p1_2', topic: 'Art', text: 'Did you learn drawing or painting in primary school?', sampleAnswer: 'Yes, we had weekly watercolor and sketch lessons, which taught me visual composition and color harmony.' },
      { id: 'p1_3', topic: 'Art', text: 'Do you have any artwork displayed in your home?', sampleAnswer: 'I have a pair of minimalist landscape prints and a framed photograph of a misty pine forest in my living room.' },
      { id: 'p1_4', topic: 'Art', text: 'Do you think art is an essential subject for children?', sampleAnswer: 'Crucial, because artistic expression nurtures divergent thinking, emotional intelligence, and hand-eye coordination.' },
      { id: 'p1_5', topic: 'Weekends', text: 'How do you usually spend your weekends?', sampleAnswer: 'I divide my weekends between outdoor recreation, catching up on personal reading, and cooking special meals with family.' },
      { id: 'p1_6', topic: 'Weekends', text: 'Do you think weekends are long enough for modern workers?', sampleAnswer: 'A two-day weekend often feels compressed; a four-day work week would allow greater restoration and improve overall workforce productivity.' },
      { id: 'p1_7', topic: 'Weekends', text: 'What is your favorite weekend activity?', sampleAnswer: 'Cycling along the riverside early on Sunday morning when the streets are peaceful and the air is crisp.' },
      { id: 'p1_8', topic: 'Weekends', text: 'Do you plan your weekend in advance or act spontaneously?', sampleAnswer: 'I plan one key outing in advance and leave the rest open for spontaneous relaxation.' }
    ],
    part2: {
      id: 'p2_1',
      topic: 'Describe a piece of art (painting, sculpture, or photograph) you find captivating.',
      bulletPoints: [
        'what the artwork is and who created it',
        'where you saw it',
        'what it looks like',
        'and explain why you find it captivating.'
      ],
      sampleAnswer: `I would like to describe Claude Monet's iconic impressionist masterpiece, 'Water Lilies', which I had the privilege of seeing in person at the Musée de l'Orangerie in Paris.

The artwork is displayed across two custom oval galleries where massive panoramic canvases wrap seamlessly around the curved white walls, illuminated by soft natural skylight.

The painting portrays Monet's flower garden at Giverny. Instead of sharp outlines, Monet used loose, textured brushstrokes in shimmering shades of violet, emerald green, and deep indigo to capture the fleeting play of light reflecting off floating water lily pads.

What makes this artwork so captivating is its immersive, tranquil power. Standing in the center of the room, you feel as though you are floating directly in the cool, serene water. It masterfully conveys mood and sensory emotion rather than mere photographic reality.`
    },
    part3: [
      { id: 'p3_1', topic: 'Art Education', text: 'Should public schools prioritize STEM subjects over visual arts and music?', sampleAnswer: 'A balanced curriculum is vital; creativity nurtured through the arts directly enhances problem-solving skills in science and engineering.' },
      { id: 'p3_2', topic: 'Art & Culture', text: 'Can artificial intelligence truly create art, or does art require human consciousness?', sampleAnswer: 'AI can generate visually stunning patterns, but true art embodies lived human vulnerability, cultural suffering, and conscious intentionality.' },
      { id: 'p3_3', topic: 'Art Preservation', text: 'Why is it important for societies to preserve traditional folk art and crafts?', sampleAnswer: 'Folk art embodies ancestral wisdom, craftsmanship, and local identity that risk being eradicated by mass industrialized consumerism.' },
      { id: 'p3_4', topic: 'Public Art', text: 'What impact does public art (like murals and sculptures) have on urban environments?', sampleAnswer: 'It humanizes sterile concrete architecture, stimulates neighborhood pride, and democratizes art by making it accessible to everyone.' }
    ]
  },

  // Test 8: Food & Gatherings, Memorable Meal
  '8': {
    part1: [
      { id: 'p1_1', topic: 'Food', text: 'What is your favorite type of food?', sampleAnswer: 'I have a deep affection for traditional Vietnamese cuisine, especially pho and spring rolls, because of their delicate balance of fresh herbs and savory broth.' },
      { id: 'p1_2', topic: 'Food', text: 'Do you enjoy cooking for yourself?', sampleAnswer: 'Yes, cooking is therapeutic for me; I enjoy experimenting with spices and preparing balanced home-cooked meals.' },
      { id: 'p1_3', topic: 'Food', text: 'Did you learn to cook when you were younger?', sampleAnswer: 'My mother taught me basic knife skills and soup recipes when I was a teenager so I could take care of myself.' },
      { id: 'p1_4', topic: 'Food', text: 'Do you prefer dining out or eating at home?', sampleAnswer: 'I prefer eating at home on weekdays for health and hygiene, but dining out on weekends offers a fun social change of pace.' },
      { id: 'p1_5', topic: 'Social Gatherings', text: 'How often do you get together with friends?', sampleAnswer: 'At least once or twice a week, usually on Friday evenings for coffee or dinner.' },
      { id: 'p1_6', topic: 'Social Gatherings', text: 'Do you prefer small intimate gatherings or large parties?', sampleAnswer: 'I definitely favor small intimate groups of three to five close friends where genuine, meaningful conversations can flourish.' },
      { id: 'p1_7', topic: 'Social Gatherings', text: 'What do you usually do when you meet up with friends?', sampleAnswer: 'We often explore cozy coffee shops, play board games, or cook dinner together at someone’s home.' },
      { id: 'p1_8', topic: 'Social Gatherings', text: 'Is hospitality an important cultural value in your community?', sampleAnswer: 'Deeply so. Welcoming guests warmly with generous food and tea is a cornerstone of Vietnamese social culture.' }
    ],
    part2: {
      id: 'p2_1',
      topic: 'Describe a special meal you enjoyed with family or friends.',
      bulletPoints: [
        'where you had the meal and who was with you',
        'what dishes were served',
        'why you were celebrating',
        'and explain why this meal was so memorable to you.'
      ],
      sampleAnswer: `I would like to describe the traditional Lunar New Year Eve dinner I shared with my extended family at my grandparents' home in Da Nang this past February.

Tet is the most sacred holiday in Vietnam, and all three generations gathered around a massive wooden banquet table. We had twelve people in total, including my uncles, aunts, and young cousins.

The feast featured celebratory delicacies, including square sticky rice cake (Banh Chung), braised pork belly with eggs in caramelized coconut water, pickled shallots, and fresh boiled chicken with lime leaves. My grandmother also prepared her signature sweet lotus seed soup for dessert.

What made this meal unforgettable was the warm sense of reunion. After months of working apart in different cities, laughing together, exchanging heartfelt blessings, and sharing ancestral stories reminded me of the enduring strength of family bonds.`
    },
    part3: [
      { id: 'p3_1', topic: 'Culinary Traditions', text: 'How have globalization and international fast food chains impacted traditional dining habits?', sampleAnswer: 'While they offer speed and novelty, over-reliance on processed fast food has contributed to lifestyle illnesses and diminished appreciation for slow, home-cooked heritage meals.' },
      { id: 'p3_2', topic: 'Food Sustainability', text: 'Why are plant-based diets gaining widespread popularity among younger generations?', sampleAnswer: 'Young people are increasingly motivated by environmental concerns regarding industrial livestock emissions and ethical considerations regarding animal welfare.' },
      { id: 'p3_3', topic: 'Food Culture', text: 'Can food serve as a bridge between diverse cultures?', sampleAnswer: 'Undoubtedly; sharing culinary traditions breaks down stereotypes and fosters mutual respect faster than almost any other social medium.' },
      { id: 'p3_4', topic: 'Food Waste', text: 'What effective measures can governments and restaurants take to combat food waste?', sampleAnswer: 'Enacting food donation laws, incentivizing redistribution to charities, and educating consumers on proper portion planning.' }
    ]
  },

  // Test 9: Hobbies & Music, New Skill to Learn
  '9': {
    part1: [
      { id: 'p1_1', topic: 'Hobbies', text: 'What hobbies do you enjoy in your spare time?', sampleAnswer: 'I enjoy landscape photography, playing acoustic guitar, and reading historical non-fiction.' },
      { id: 'p1_2', topic: 'Hobbies', text: 'Did you have different hobbies when you were a child?', sampleAnswer: 'As a child, I spent countless hours assembling Lego models and collecting stamps from international letters.' },
      { id: 'p1_3', topic: 'Hobbies', text: 'Do you think hobbies should be relaxing or mentally challenging?', sampleAnswer: 'A combination is ideal; activities that offer gentle challenge like chess or an instrument provide deep satisfaction without causing burnout.' },
      { id: 'p1_4', topic: 'Hobbies', text: 'Is it easy to balance hobbies with full-time work or studies?', sampleAnswer: 'It requires deliberate scheduling, but carving out even thirty minutes a day for a passion revitalizes mental wellbeing.' },
      { id: 'p1_5', topic: 'Music', text: 'What genre of music do you listen to the most?', sampleAnswer: 'I gravitate toward indie folk and acoustic pop because of their thoughtful lyrics and organic melodies.' },
      { id: 'p1_6', topic: 'Music', text: 'Can you play any musical instruments?', sampleAnswer: 'I can play basic chord progressions on the guitar, which is wonderful for winding down in the evening.' },
      { id: 'p1_7', topic: 'Music', text: 'Do you prefer listening to recorded music or attending live concerts?', sampleAnswer: 'Recorded music is great for daily focus, but live concerts offer an unforgettable collective vibration and emotional release.' },
      { id: 'p1_8', topic: 'Music', text: 'Has your taste in music changed over the years?', sampleAnswer: 'Yes, in my teenage years I loved energetic EDM and rock, whereas now I appreciate mellow melodies with poetic lyrics.' }
    ],
    part2: {
      id: 'p2_1',
      topic: 'Describe a hobby or skill you would like to learn in the future.',
      bulletPoints: [
        'what the skill or hobby is',
        'why you want to learn it',
        'how you plan to learn it',
        'and explain what benefits this skill would bring to your life.'
      ],
      sampleAnswer: `I would like to describe a skill that I have aspired to learn for a long time: ceramic pottery and wheel throwing.

I first became interested in pottery when I visited an artisanal craft village in Hoi An. Watching a master artisan shape a shapeless lump of wet clay into an elegant, functional vase was mesmerizing.

I plan to enroll in a beginner's ceramic workshop at a community studio in my city this coming autumn. The course covers clay preparation, centering on the wheel, glazing techniques, and kiln firing over eight intensive weeks.

Learning pottery would provide an invaluable antidote to my screen-dominated daily life. In an era where much of our work is digital and ephemeral, molding something physical with your own hands cultivates mindfulness, patience, and tactile artistic fulfillment.`
    },
    part3: [
      { id: 'p3_1', topic: 'Lifelong Learning', text: 'Why is continuous learning essential for working adults in today’s economy?', sampleAnswer: 'Technological acceleration and AI automation rapidly render static skills obsolete, making adaptability and lifelong learning vital for employability.' },
      { id: 'p3_2', topic: 'Traditional Crafts', text: 'Why are traditional handmade crafts often valued more highly than mass-manufactured goods?', sampleAnswer: 'Handmade items carry human soul, unique artisanal imperfections, and cultural narrative that impersonal machine production can never replicate.' },
      { id: 'p3_3', topic: 'Leisure & Wellbeing', text: 'How does having a creative hobby impact an individual’s mental health?', sampleAnswer: 'It induces a state of psychological flow, lowering cortisol levels and providing a healthy boundary away from professional anxieties.' },
      { id: 'p3_4', topic: 'Online Education', text: 'Can practical manual skills be mastered solely through online video tutorials?', sampleAnswer: 'Video lessons provide great foundational theory, but tactile feedback and in-person mentorship remain irreplaceable for physical crafts.' }
    ]
  },

  // Test 10: Animals & Nature, Encounter with a Wild Animal
  '10': {
    part1: [
      { id: 'p1_1', topic: 'Animals', text: 'Do you like animals?', sampleAnswer: 'Yes, very much. I find animal behavior fascinating and have always felt a strong protective instinct toward pets and wildlife.' },
      { id: 'p1_2', topic: 'Animals', text: 'Have you ever kept a pet at home?', sampleAnswer: 'Yes, my family has a golden retriever named Max who is incredibly loyal, affectionate, and playful.' },
      { id: 'p1_3', topic: 'Animals', text: 'What is a popular pet to have in your country?', sampleAnswer: 'Dogs and cats are the most popular pets in Vietnam, with an increasing trend toward small apartment-friendly dog breeds.' },
      { id: 'p1_4', topic: 'Animals', text: 'Did you visit zoos or wildlife sanctuaries as a child?', sampleAnswer: 'Yes, our school organized annual excursions to the botanical gardens and wildlife reserves, which sparked my love for nature.' },
      { id: 'p1_5', topic: 'Nature', text: 'Do you enjoy spending time in nature and green spaces?', sampleAnswer: 'Enormously. Being surrounded by lush trees, flowing streams, and fresh air immediately revitalizes my spirits.' },
      { id: 'p1_6', topic: 'Nature', text: 'Are there enough public parks in your city?', sampleAnswer: 'There are several pleasant parks, but as urban density intensifies, our city certainly needs more expansive green corridors.' },
      { id: 'p1_7', topic: 'Nature', text: 'What is your favorite natural environment?', sampleAnswer: 'I love ancient temperate forests and pristine mountain ranges where human noise is completely absent.' },
      { id: 'p1_8', topic: 'Nature', text: 'What can individuals do to protect local ecosystems?', sampleAnswer: 'Reduce single-use plastic consumption, participate in community tree-planting drives, and conserve domestic water and energy.' }
    ],
    part2: {
      id: 'p2_1',
      topic: 'Describe an encounter you had with a wild or unusual animal.',
      bulletPoints: [
        'what the animal was and where you saw it',
        'what the animal was doing',
        'how you reacted when you saw it',
        'and explain how this encounter made you feel.'
      ],
      sampleAnswer: `I would like to describe a breathtaking encounter with an endangered red-shanked douc langur that occurred two years ago while trekking on Son Tra Peninsula in Da Nang.

Son Tra is renowned as a biodiversity hotspot, home to hundreds of rare primates. I set out early around 6 AM with a local wildlife photographer friend equipped with binoculars and a telephoto lens.

As we hiked quietly along a jungle trail, we heard gentle rustling in the high canopy. Looking up, we spotted a langur family feeding on tender fig leaves. The adult male had striking coloration—chestnut-red legs, a golden face, and long white tail. He looked directly down at us with calm, intelligent curiosity.

This encounter filled me with profound awe and humility. Seeing such an exquisite creature thriving freely in its native rainforest underscored our urgent responsibility to preserve endangered habitats against urban encroachment.`
    },
    part3: [
      { id: 'p3_1', topic: 'Wildlife Conservation', text: 'Why is biodiversity conservation critical for the survival of humanity?', sampleAnswer: 'Ecosystems provide essential life-support services like oxygen generation, water purification, crop pollination, and pharmaceutical compounds.' },
      { id: 'p3_2', topic: 'Zoos & Ethics', text: 'Do modern zoos play an ethical role in education, or should wild animals never be kept in captivity?', sampleAnswer: 'Modern ethical conservation sanctuaries contribute critically to captive breeding and public awareness, whereas profit-driven cages that exploit animals should be abolished.' },
      { id: 'p3_3', topic: 'Human-Animal Conflict', text: 'How can rapidly expanding cities avoid encroaching on natural wildlife corridors?', sampleAnswer: 'By implementing green buffer zones, wildlife overpasses across highways, and strictly protecting surrounding national parks from commercial developers.' },
      { id: 'p3_4', topic: 'Pet Ownership', text: 'What responsibilities do owners have when adopting a companion animal?', sampleAnswer: 'Ensuring proper veterinary care, nutritious sustenance, daily exercise, and lifelong emotional commitment without abandonment.' }
    ]
  },

  // Test 11: Films & Cinema, Movie with Strong Impression
  '11': {
    part1: [
      { id: 'p1_1', topic: 'Films', text: 'How often do you watch movies?', sampleAnswer: 'I watch movies once or twice a week, usually winding down with a film on Friday evening or during lazy Sunday afternoons.' },
      { id: 'p1_2', topic: 'Films', text: 'What genre of film do you prefer?', sampleAnswer: 'I am particularly drawn to thought-provoking science fiction, historical dramas, and psychological thrillers with compelling character arcs.' },
      { id: 'p1_3', topic: 'Films', text: 'Do you prefer watching movies at the cinema or streaming at home?', sampleAnswer: 'For grand visual spectacles like interstellar epics, the massive cinema screen and surround sound are indispensable, but streaming at home offers supreme comfort.' },
      { id: 'p1_4', topic: 'Films', text: 'Have you ever watched the same movie multiple times?', sampleAnswer: 'Yes, Christopher Nolan’s ‘Interstellar’ is a movie I have watched three times, each viewing revealing deeper philosophical layers.' },
      { id: 'p1_5', topic: 'Relaxation', text: 'What is your preferred way to relax after a stressful day?', sampleAnswer: 'Taking a long warm shower, putting on comfortable clothes, brewing herbal tea, and listening to soothing acoustic melodies.' },
      { id: 'p1_6', topic: 'Relaxation', text: 'Do you find it difficult to disconnect from work or study thoughts?', sampleAnswer: 'Occasionally, especially close to exam deadlines, but practicing ten minutes of mindfulness meditation helps quiet racing thoughts.' },
      { id: 'p1_7', topic: 'Relaxation', text: 'Does exercise help you relieve stress?', sampleAnswer: 'Significantly. A brisk jog or thirty-minute swim releases endorphins that melt away psychological tension.' },
      { id: 'p1_8', topic: 'Relaxation', text: 'Do you think modern life is more stressful than in the past?', sampleAnswer: 'Undoubtedly; the constant barrage of digital notifications, career competitiveness, and round-the-clock availability create chronic cognitive strain.' }
    ],
    part2: {
      id: 'p2_1',
      topic: 'Describe a movie that left a strong impression on you.',
      bulletPoints: [
        'what the movie was and what it was about',
        'when and where you watched it',
        'who the main characters were',
        'and explain why this movie left such a strong impression on you.'
      ],
      sampleAnswer: `I would like to describe the biographical drama 'The Pursuit of Happyness', starring Will Smith, which I watched during my high school years.

The film is based on the true story of Chris Gardner, a homeless single father struggling in San Francisco during the early 1980s. Despite facing eviction, bankruptcy, and sleeping with his young son in subway bathrooms, he battles fiercely to complete an unpaid stockbroker internship.

Will Smith’s performance alongside his real-life son Jaden was emotionally raw and authentic. One particular scene where Chris tells his son, 'Don't ever let somebody tell you you can't do something, not even me,' resonated deeply with me.

The film left an indelible impression because it portrays genuine human perseverance. It reminded me that success is not merely about talent, but about unwavering resilience, dignity, and personal sacrifice in the face of daunting adversity.`
    },
    part3: [
      { id: 'p3_1', topic: 'Cinema & Streaming', text: 'Will online streaming platforms completely replace traditional movie theaters in the future?', sampleAnswer: 'Streaming will dominate routine viewing, but cinemas will survive as premium communal destinations for shared social spectacle and superior audio-visual immersion.' },
      { id: 'p3_2', topic: 'Film & Culture', text: 'How do Hollywood and global cinema influence the cultural values of young audiences worldwide?', sampleAnswer: 'They accelerate globalization, introduce diverse lifestyles, and shape fashion and slang, though they can occasionally overshadow local cultural narratives.' },
      { id: 'p3_3', topic: 'Educational Films', text: 'Can documentary films be more effective educational tools than traditional textbooks?', sampleAnswer: 'Documentaries possess immense emotional storytelling power and real-world footage that engage visual learners far more vividly than dry text.' },
      { id: 'p3_4', topic: 'Censorship & Ethics', text: 'Should governments regulate violent or controversial themes in popular cinema?', sampleAnswer: 'Sensible age-classification guidelines are essential to shield children, but heavy-handed artistic censorship stifles vital creative dialogue and social critique.' }
    ]
  },

  // Test 12: Technology & Time, Indispensable Technology
  '12': {
    part1: [
      { id: 'p1_1', topic: 'Technology', text: 'What electronic device do you use the most every day?', sampleAnswer: 'My smartphone and laptop are tied for first place; my laptop for rigorous coursework and my phone for navigation and communication.' },
      { id: 'p1_2', topic: 'Technology', text: 'Are you quick to adopt new technological gadgets?', sampleAnswer: 'I take a measured approach; I adopt tools that genuinely boost productivity or learning, but avoid buying trendy gadgets purely for novelty.' },
      { id: 'p1_3', topic: 'Technology', text: 'How has technology changed the way you study or work?', sampleAnswer: 'It has made learning frictionless; instant access to digital libraries, AI research assistants, and cloud collaboration tools have replaced physical paper stacks.' },
      { id: 'p1_4', topic: 'Technology', text: 'Do you ever feel overwhelmed by technology?', sampleAnswer: 'Occasionally, especially when endless push notifications fragment my attention span, which is why I enforce strict digital detox hours.' },
      { id: 'p1_5', topic: 'Time Management', text: 'Are you good at managing your daily schedule?', sampleAnswer: 'I have become much better by using digital calendars and time-blocking techniques to organize tasks according to urgency and importance.' },
      { id: 'p1_6', topic: 'Time Management', text: 'Do you ever find yourself procrastinating on important tasks?', sampleAnswer: 'Like most people, I do when facing complex or ambiguous projects, but breaking them down into five-minute micro-goals helps overcome initial resistance.' },
      { id: 'p1_7', topic: 'Time Management', text: 'Is punctuality important in your culture?', sampleAnswer: 'In professional and academic contexts, arriving on time demonstrates respect and reliability, though social gatherings tend to be more forgiving.' },
      { id: 'p1_8', topic: 'Time Management', text: 'How do you prioritize when you have too many things to do?', sampleAnswer: 'I use the Eisenhower Matrix to separate urgent tasks from genuinely important long-term goals, tackling high-impact work first.' }
    ],
    part2: {
      id: 'p2_1',
      topic: 'Describe a piece of technology (computer, app, or gadget) that you find indispensable.',
      bulletPoints: [
        'what the technology is',
        'how long you have been using it',
        'what you use it for',
        'and explain why you find it indispensable in your daily life.'
      ],
      sampleAnswer: `I would like to describe a cloud-based productivity application called Notion, which I have used daily for the past three years.

Notion is an all-in-one digital workspace that combines note-taking, project task boards, document archiving, and personal knowledge management. I access it seamlessly across my laptop, tablet, and smartphone.

I use Notion to manage virtually every dimension of my life: university lecture summaries, collaborative team project timelines, daily habit trackers, and personal budgeting. The ability to customize databases and link related ideas makes it like a customized second brain.

I consider Notion indispensable because it drastically reduces cognitive clutter. Instead of juggling dozens of sticky notes and scattered apps, having a single centralized system gives me complete clarity and saves hours of administrative time each week.`
    },
    part3: [
      { id: 'p3_1', topic: 'Artificial Intelligence', text: 'How will artificial intelligence reshape the future job market over the coming decade?', sampleAnswer: 'AI will automate repetitive cognitive analysis, elevating the economic value of uniquely human capabilities like emotional empathy, complex ethics, and creative vision.' },
      { id: 'p3_2', topic: 'Digital Wellbeing', text: 'Are smartphone addiction and short-form video feeds eroding human attention spans?', sampleAnswer: 'Undeniably; rapid dopamine stimulation from algorithmically curated feeds diminishes the brain’s capacity for sustained, deep analytical reading and reflection.' },
      { id: 'p3_3', topic: 'Digital Divide', text: 'What risks arise when low-income families lack access to high-speed internet and digital hardware?', sampleAnswer: 'It deepens social and economic inequality, locking underprivileged children out of remote learning opportunities, technical jobs, and modern civic resources.' },
      { id: 'p3_4', topic: 'Privacy & Security', text: 'How can individuals protect their personal digital privacy in an era of big data tracking?', sampleAnswer: 'By using encrypted communication tools, auditing app permissions, adopting strong password managers, and minimizing oversharing on social networks.' }
    ]
  },

  // IELTS Speaking Homework 1: Daily Habits & Language Learning
  'homework-test-1': {
    part1: [
      { id: 'p1_1', topic: 'Daily Habits', text: 'What is the most productive part of your day?', sampleAnswer: 'Early morning between 7 and 10 AM is when my mind is sharpest and free from distractions.' },
      { id: 'p1_2', topic: 'Daily Habits', text: 'Have you developed any new healthy habits recently?', sampleAnswer: 'Yes, I started drinking two liters of water daily and going for a 20-minute evening walk.' },
      { id: 'p1_3', topic: 'Daily Habits', text: 'Is it easy or difficult for you to change an old habit?', sampleAnswer: 'Breaking a habit takes discipline and consistent repetition over several weeks before it feels natural.' },
      { id: 'p1_4', topic: 'Daily Habits', text: 'Do you track your daily activities using a journal or app?', sampleAnswer: 'I use a simple habit tracker app on my phone to check off daily reading and exercise goals.' },
      { id: 'p1_5', topic: 'Language Learning', text: 'Why are you studying English?', sampleAnswer: 'I am preparing for international education and career advancement in multinational tech environments.' },
      { id: 'p1_6', topic: 'Language Learning', text: 'What part of learning English do you find most challenging?', sampleAnswer: 'Mastering natural idiomatic expressions and speaking fluently without translating from my mother tongue.' },
      { id: 'p1_7', topic: 'Language Learning', text: 'How do you practice speaking English outside of class?', sampleAnswer: 'I listen to English podcasts, record myself answering sample questions, and chat with international peers online.' },
      { id: 'p1_8', topic: 'Language Learning', text: 'Do you think learning languages becomes harder as we get older?', sampleAnswer: 'Children acquire accents more effortlessly, but adults possess superior analytical discipline and grammar comprehension.' }
    ],
    part2: {
      id: 'p2_1',
      topic: 'Describe a foreign language you would like to master besides English.',
      bulletPoints: [
        'what language it is',
        'where it is spoken',
        'why you want to learn it',
        'and explain what difficulties you might face while learning it.'
      ],
      sampleAnswer: `I would like to talk about Japanese, a language that I have long dreamed of mastering.

Japanese is spoken by over 120 million people in Japan and is celebrated for its intricate cultural history, literature, and modern creative industries like anime and cinema.

I want to learn Japanese primarily because of my admiration for its traditional culture, exquisite architecture, and culinary arts. Furthermore, Japan is a global leader in high-tech manufacturing, robotics, and design, so fluency would unlock exciting international career opportunities.

The biggest challenge I would face is the complex writing system, which blends three distinct alphabets: Hiragana, Katakana, and thousands of intricate Kanji characters. Additionally, navigating multiple levels of polite honorific speech requires deep cultural sensitivity. Despite these hurdles, mastering it would be immensely rewarding.`
    },
    part3: [
      { id: 'p3_1', topic: 'Bilingualism', text: 'What cognitive benefits do multilingual individuals experience?', sampleAnswer: 'Speaking multiple languages enhances neuroplasticity, memory retention, problem-solving agility, and delays cognitive decline.' },
      { id: 'p3_2', topic: 'Language & Culture', text: 'Can automated AI translation apps replace the need to learn foreign languages?', sampleAnswer: 'They facilitate basic practical translation, but cannot replace the deep human empathy, cultural humor, and personal connection built through authentic language mastery.' },
      { id: 'p3_3', topic: 'Global Communication', text: 'Is English likely to remain the dominant global lingua franca for business and science?', sampleAnswer: 'Yes, because its entrenched presence in international finance, academic publications, and the internet gives it extraordinary momentum that is difficult to supersede.' }
    ]
  },

  // IELTS Speaking Homework 2: Social Media & Environmental Awareness
  'homework-test-2': {
    part1: [
      { id: 'p1_1', topic: 'Social Media', text: 'Which social media platforms do you use regularly?', sampleAnswer: 'I primarily use YouTube for educational content and Instagram to stay in touch with friends.' },
      { id: 'p1_2', topic: 'Social Media', text: 'How much time do you spend on social media each day?', sampleAnswer: 'I try to cap my daily screen time at around one hour to prevent mindless scrolling.' },
      { id: 'p1_3', topic: 'Social Media', text: 'What are the main advantages of social media for young people?', sampleAnswer: 'It facilitates instant global communication, diverse community building, and rapid dissemination of creative ideas.' },
      { id: 'p1_4', topic: 'Social Media', text: 'Do you think people present an unrealistic version of their lives online?', sampleAnswer: 'Frequently; people curate highlight reels of their best moments, which can distort reality and spark unhealthy comparison.' },
      { id: 'p1_5', topic: 'Environment', text: 'What environmental issues concern you the most in your city?', sampleAnswer: 'Air pollution from traffic congestion and the excessive generation of non-biodegradable plastic packaging.' },
      { id: 'p1_6', topic: 'Environment', text: 'Do you sort your household waste for recycling?', sampleAnswer: 'Yes, we separate paper, plastic bottles, and aluminum cans from organic food waste.' },
      { id: 'p1_7', topic: 'Environment', text: 'Have you noticed any changes in the climate in recent years?', sampleAnswer: 'Yes, summers have become noticeably more scorching and unpredictable monsoon rains cause localized urban flooding.' },
      { id: 'p1_8', topic: 'Environment', text: 'What is one eco-friendly habit you practice every day?', sampleAnswer: 'I always carry a reusable water bottle and cloth shopping tote to avoid single-use plastics.' }
    ],
    part2: {
      id: 'p2_1',
      topic: 'Describe an environmental problem in your local city or town.',
      bulletPoints: [
        'what the problem is',
        'what causes it',
        'how it affects people living there',
        'and explain what solutions could help resolve it.'
      ],
      sampleAnswer: `I would like to describe the critical issue of plastic waste pollution along coastal beaches in my hometown.

Over the past decade, rapid urbanization and an influx of tourism have led to an explosion of single-use plastic bottles, styrofoam takeaway boxes, and straws littered along the shoreline. During high tide, much of this debris gets swept into the ocean.

This pollution harms marine wildlife, disrupts the livelihoods of local fishing communities, and degrades the natural beauty that attracts visitors in the first place. Microplastics also enter the marine food chain, posing serious long-term public health risks.

To address this crisis, our local government should implement strict fines for littering, mandate biodegradable packaging in beachside food stalls, and invest in modern recycling facilities. In addition, organizing regular community beach clean-ups can foster public stewardship and protect our coastal heritage.`
    },
    part3: [
      { id: 'p3_1', topic: 'Climate Responsibility', text: 'Who bears greater responsibility for fighting climate change: individual citizens or multinational corporations?', sampleAnswer: 'Corporations and governments must take the lead through systemic green policy and energy transitions, while individual consumption choices provide grassroots momentum.' },
      { id: 'p3_2', topic: 'Renewable Energy', text: 'Why is transitioning to solar and wind energy imperative for emerging economies?', sampleAnswer: 'It curtails deadly urban smog, stabilizes energy security, and fosters new green engineering employment sectors.' },
      { id: 'p3_3', topic: 'Environmental Education', text: 'How can primary schools teach young children to value and respect nature?', sampleAnswer: 'Through hands-on school gardening, nature field excursions, and interactive recycling projects that build an innate bond with living ecosystems.' }
    ]
  },

  // IELTS Speaking Homework 3: Gifts & Celebrations, Historical Monuments
  'homework-test-3': {
    part1: [
      { id: 'p1_1', topic: 'Gifts', text: 'Do you enjoy receiving gifts or giving gifts more?', sampleAnswer: 'I find giving gifts more fulfilling because selecting something thoughtful and seeing the recipient’s joy brings deep happiness.' },
      { id: 'p1_2', topic: 'Gifts', text: 'On what occasions do people in your culture give gifts?', sampleAnswer: 'Primarily during the Lunar New Year, birthdays, weddings, and Teacher’s Day as tokens of gratitude.' },
      { id: 'p1_3', topic: 'Gifts', text: 'How do you choose a gift for a close friend?', sampleAnswer: 'I consider their current passions and needs, favoring practical items or memorable shared experiences like concert tickets.' },
      { id: 'p1_4', topic: 'Gifts', text: 'Do you ever make handmade gifts?', sampleAnswer: 'Occasionally, like baking artisanal cookies or writing heartfelt personalized cards, which carry special emotional warmth.' },
      { id: 'p1_5', topic: 'History', text: 'Are you interested in learning about history?', sampleAnswer: 'Very much so; understanding historical milestones provides vital context for interpreting contemporary geopolitics and human society.' },
      { id: 'p1_6', topic: 'History', text: 'Did you enjoy history classes in school?', sampleAnswer: 'I preferred narrative history and character biographies over the rote memorization of dry dates and treaties.' },
      { id: 'p1_7', topic: 'History', text: 'Have you ever visited a famous historical building?', sampleAnswer: 'Yes, I visited the ancient Citadel in Hue, which features majestic imperial palaces and ceremonial gates.' },
      { id: 'p1_8', topic: 'History', text: 'Why should governments preserve historic architecture?', sampleAnswer: 'Historic architecture serves as living testament to cultural identity, artistic heritage, and generational pride.' }
    ],
    part2: {
      id: 'p2_1',
      topic: 'Describe a historic site or building you visited that impressed you.',
      bulletPoints: [
        'where the site is and when you visited it',
        'what the site looks like',
        'what historical significance it has',
        'and explain why you were impressed by it.'
      ],
      sampleAnswer: `I would like to describe the Imperial Citadel of Hue, located along the scenic Perfume River in central Vietnam, which I visited with my family last summer.

Constructed in the early 19th century under the Nguyen Dynasty, this sprawling fortress complex is enclosed by massive ten-meter-thick stone ramparts and a protective moat. Inside lies the Forbidden Purple City, featuring grand ceremonial throne halls, traditional temples, and tranquil lotus ponds.

The Citadel was the political and cultural epicenter of Vietnam for nearly a century and a half. Despite enduring severe damage during past wartime conflicts, its majestic wooden pavilions and intricately carved dragon motifs have been painstakingly restored under UNESCO heritage programs.

What impressed me most was the harmonious blend of royal feng-shui architecture and natural landscape. Walking through the quiet courtyards, you can palpably feel the echoes of centuries past, reminding visitors of Vietnam's enduring resilience and cultural depth.`
    },
    part3: [
      { id: 'p3_1', topic: 'Heritage vs Modernity', text: 'How can modern cities strike a balance between preserving historical buildings and developing high-density housing?', sampleAnswer: 'Urban planners can designate protected historic conservation zones while channeling modern high-rises into designated outer transit hubs.' },
      { id: 'p3_2', topic: 'Historical Tourism', text: 'What challenges can mass tourism cause for fragile ancient monuments?', sampleAnswer: 'Overcrowding accelerates physical wear-and-tear, causes littering, and risks commercializing and cheapening sacred cultural heritage.' },
      { id: 'p3_3', topic: 'Teaching History', text: 'How can digital technology (like VR and 3D simulations) make history more captivating for students?', sampleAnswer: 'Immersive VR reconstructions allow students to virtually walk through ancient civilizations, transforming abstract dates into unforgettable visual adventures.' }
    ]
  },

  // Fallback default
  'fallback': {
    part1: [
      { id: 'p1_1', topic: 'Hometown', text: "Where is your hometown?", sampleAnswer: "I grew up in Da Nang, a coastal city in central Vietnam celebrated for its friendly residents and beaches." },
      { id: 'p1_2', topic: 'Hometown', text: "What do you like most about it?", sampleAnswer: "I love the peaceful coastal atmosphere, the fresh food, and the balanced pace of life." }
    ],
    part2: {
      id: 'p2_1',
      topic: 'Describe a book you have recently read.',
      bulletPoints: [
        'what kind of book it is',
        'what it is about',
        'what sort of people would enjoy it',
        'and explain why you liked it.'
      ],
      sampleAnswer: "I recently read an inspiring biography about visionary entrepreneurs, which emphasized resilience and curiosity."
    },
    part3: [
      { id: 'p3_1', topic: 'Reading', text: 'How have reading habits changed since the internet became popular?', sampleAnswer: "People consume far more brief digital articles, though in-depth reading remains vital for deep comprehension." },
      { id: 'p3_2', topic: 'Reading', text: 'Do you think printed books will eventually disappear?', sampleAnswer: "No, physical books have enduring tactile value and aesthetic appeal that digital screens cannot match." }
    ]
  }
};

// Aliases mapping IDs to ensure any lookup works seamlessly
IELTS_SPEAKING_QUESTIONS['4'] = IELTS_SPEAKING_QUESTIONS['4'] || IELTS_SPEAKING_QUESTIONS['1'];
// PracticeTests month-to-test mapping:
// Month 1 (ID 4) -> Test 1
// Month 2 (ID 8) -> Test 2
// Month 3 (ID 12) -> Test 3
// Month 4 (ID 16) -> Test 4
// Month 5 (ID 20) -> Test 5
// Month 6 (ID 24) -> Test 6
// Month 7 (ID 28) -> Test 7
// Month 8 (ID 32) -> Test 8
// Month 9 (ID 36) -> Test 9
// Month 10 (ID 40) -> Test 10
// Month 11 (ID 44) -> Test 11
// Month 12 (ID 48) -> Test 12

export function getSpeakingTestQuestions(identifier?: string, submissionData?: any): SpeakingTestData {
  // 1. If submission data has saved questions, prioritize them
  if (submissionData?.questions?.part1 && submissionData?.questions?.part2 && submissionData?.questions?.part3) {
    return submissionData.questions;
  }
  
  if (!identifier) return IELTS_SPEAKING_QUESTIONS['1'];

  const clean = String(identifier).trim();
  const lower = clean.toLowerCase();

  // Homework checks
  if (lower.includes('homework-test-1') || lower.includes('homework 1')) {
    return IELTS_SPEAKING_QUESTIONS['homework-test-1'];
  }
  if (lower.includes('homework-test-2') || lower.includes('homework 2')) {
    return IELTS_SPEAKING_QUESTIONS['homework-test-2'];
  }
  if (lower.includes('homework-test-3') || lower.includes('homework 3')) {
    return IELTS_SPEAKING_QUESTIONS['homework-test-3'];
  }

  // Exact key in dictionary
  if (IELTS_SPEAKING_QUESTIONS[clean]) {
    return IELTS_SPEAKING_QUESTIONS[clean];
  }

  // Check numeric matches
  // Matches "IELTS Speaking Test 3", "Test 3", "Speaking 3", etc.
  const testMatch = lower.match(/(?:test|speaking)\s*(\d+)/i) || clean.match(/\b(\d+)\b/);
  if (testMatch) {
    const num = parseInt(testMatch[1], 10);
    // If it's a multiple of 4 from PracticeTests (4, 8, 12, ... 48)
    if (num % 4 === 0 && num >= 4 && num <= 48) {
      const mapped = (num / 4).toString();
      if (IELTS_SPEAKING_QUESTIONS[mapped]) {
        return IELTS_SPEAKING_QUESTIONS[mapped];
      }
    }
    const strNum = num.toString();
    if (IELTS_SPEAKING_QUESTIONS[strNum]) {
      return IELTS_SPEAKING_QUESTIONS[strNum];
    }
  }

  return IELTS_SPEAKING_QUESTIONS['1'];
}
