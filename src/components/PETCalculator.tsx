import React, { useState, useEffect, useMemo } from 'react';

const BookIcon = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
  </svg>
);

const EditIcon = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const HeadphonesIcon = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
  </svg>
);

const MessageIcon = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const ResetIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

const DownloadIcon = ({ size = 22 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const StarIcon = ({ size = 24, filled = false }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const TranslateIcon = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m5 8 6 6" />
    <path d="m4 14 6-6 2-3" />
    <path d="M2 5h12" />
    <path d="M7 2h1" />
    <path d="m22 22-5-10-5 10" />
    <path d="M14 18h6" />
  </svg>
);

const MIN_POINTS = { reading: 5, writing: 10, listening: 5, speaking: 7 };
const MAX_POINTS = { reading: 32, writing: 40, listening: 25, speaking: 30 };

// Map arrays: [Raw Marks, Cambridge Scale Score]
const CONVERSION_MAPS = {
  reading: [[0, 82], [5, 102], [13, 120], [23, 140], [29, 160], [32, 170]],
  writing: [[0, 82], [10, 102], [16, 120], [24, 140], [34, 160], [40, 170]],
  listening: [[0, 82], [5, 102], [11, 120], [18, 140], [23, 160], [25, 170]],
  speaking: [[0, 82], [7, 102], [12, 120], [18, 140], [24, 160], [30, 170]]
};

const THEMES = {
  reading: {
    name: 'Reading',
    icon: <BookIcon />,
    lightBg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200',
    bgGradient: 'bg-gradient-to-br from-violet-500 to-purple-600',
    textGradient: 'bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-purple-600',
    shadow: 'shadow-violet-200/50', ring: 'focus:ring-violet-500', hoverBorder: 'hover:border-violet-400'
  },
  writing: {
    name: 'Writing',
    icon: <EditIcon />,
    lightBg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200',
    bgGradient: 'bg-gradient-to-br from-rose-500 to-pink-600',
    textGradient: 'bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-pink-600',
    shadow: 'shadow-rose-200/50', ring: 'focus:ring-rose-500', hoverBorder: 'hover:border-rose-400'
  },
  listening: {
    name: 'Listening',
    icon: <HeadphonesIcon />,
    lightBg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200',
    bgGradient: 'bg-gradient-to-br from-amber-400 to-orange-500',
    textGradient: 'bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-600',
    shadow: 'shadow-amber-200/50', ring: 'focus:ring-amber-500', hoverBorder: 'hover:border-amber-400'
  },
  speaking: {
    name: 'Speaking',
    icon: <MessageIcon />,
    lightBg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200',
    bgGradient: 'bg-gradient-to-br from-emerald-400 to-teal-500',
    textGradient: 'bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-600',
    shadow: 'shadow-emerald-200/50', ring: 'focus:ring-emerald-500', hoverBorder: 'hover:border-emerald-400'
  }
};

const SPEAKING_FEEDBACK = {
  g: {
    title: "Grammar & Vocabulary",
    0: ["No assessable language produced."],
    1: ["Uses very basic grammar only.", "Constant grammatical errors.", "Extremely limited vocabulary.", "Frequent incorrect word choices.", "Communication frequently breaks down."],
    2: ["Relies almost entirely on simple grammar.", "Frequent grammatical mistakes.", "Limited vocabulary.", "Often searches for words.", "Rarely paraphrases.", "Errors sometimes interfere with communication."],
    3: ["Uses mostly simple grammatical structures correctly.", "Attempts some complex structures with mixed success.", "Vocabulary is adequate for familiar topics.", "Frequent repetition of common words.", "Errors occasionally cause awkwardness but meaning remains clear."],
    4: ["Uses a good range of grammar.", "Makes a few noticeable grammatical errors.", "Uses sufficient vocabulary for most situations.", "Occasionally repeats words.", "Can usually explain unfamiliar words.", "Communication remains clear throughout."],
    5: ["Uses a wide range of B1 grammar accurately.", "Makes only occasional minor errors that do not affect communication.", "Uses varied vocabulary naturally.", "Selects appropriate words for different topics.", "Successfully paraphrases when necessary.", "Expresses ideas precisely and confidently."]
  },
  d: {
    title: "Discourse Management",
    0: ["No connected speech."],
    1: ["Speaks mostly in isolated words or short phrases.", "Very long pauses.", "Cannot develop ideas.", "Responses often stop after one sentence."],
    2: ["Gives short responses.", "Long pauses occur frequently.", "Limited use of connectors.", "Ideas sometimes seem disconnected.", "Needs examiner support."],
    3: ["Produces connected speech.", "Gives enough detail.", "Uses basic connectors.", "Some noticeable hesitation.", "Occasionally loses the flow."],
    4: ["Usually speaks continuously.", "Gives developed answers.", "Uses several linking words correctly.", "Some hesitation while organizing ideas.", "Responses remain coherent."],
    5: ["Speaks fluently with very few pauses.", "Gives extended answers.", "Organizes ideas logically.", "Uses a wide variety of linking devices naturally.", "Rarely hesitates."]
  },
  p: {
    title: "Pronunciation",
    0: ["No intelligible speech."],
    1: ["Very difficult to understand.", "Numerous pronunciation errors.", "Incorrect stress throughout.", "Communication frequently breaks down."],
    2: ["Frequent pronunciation problems.", "Incorrect stress often affects understanding.", "Intonation is limited.", "Listener frequently struggles."],
    3: ["Is understandable most of the time.", "Several pronunciation errors.", "Occasionally repeats words.", "Listener sometimes needs extra concentration."],
    4: ["Is generally easy to understand.", "Some pronunciation mistakes occur.", "Stress is mostly correct.", "Intonation is generally appropriate."],
    5: ["Is consistently easy to understand.", "Uses natural stress and intonation.", "Pronunciation supports communication.", "Minor pronunciation errors do not affect meaning."]
  },
  i: {
    title: "Interactive Communication",
    0: ["No interaction."],
    1: ["Minimal participation.", "Rarely responds appropriately.", "Does not ask questions.", "Conversation repeatedly stops.", "Heavy examiner intervention required."],
    2: ["Limited interaction.", "Often waits for prompts.", "Rarely asks questions.", "Difficulty extending conversation.", "Partner carries much of the discussion."],
    3: ["Responds appropriately.", "Takes turns successfully.", "Sometimes asks questions.", "Conversation continues with occasional examiner prompting."],
    4: ["Participates actively.", "Usually responds appropriately.", "Occasionally asks questions.", "Helps maintain discussion.", "Needs little support."],
    5: ["Interacts confidently.", "Responds immediately.", "Asks relevant follow-up questions.", "Builds naturally on partner's ideas.", "Encourages discussion.", "Keeps conversation flowing without examiner support."]
  },
  ga: {
    title: "Global Achievement",
    0: ["No assessable performance."],
    1: ["Struggles to complete tasks.", "Communication frequently breaks down.", "Significant examiner support required.", "Performance is below B1 standard."],
    2: ["Completes some tasks only partially.", "Communication is inconsistent.", "Frequent errors reduce effectiveness.", "Needs examiner support several times."],
    3: ["Successfully completes most tasks.", "Communication is generally effective.", "Some weaknesses are noticeable.", "Meets the expected B1 standard."],
    4: ["Completes nearly all tasks successfully.", "Communication is consistently effective.", "Minor weaknesses do not reduce overall performance.", "Needs very little support."],
    5: ["Completes all speaking tasks confidently.", "Communicates ideas effectively.", "Maintains communication naturally.", "Demonstrates clear B1 ability throughout.", "Requires virtually no examiner assistance."]
  }
};

const SPEAKING_FEEDBACK_VI = {
  g: {
    title: "Ngữ pháp & Từ vựng",
    0: ["Không tạo ra ngôn ngữ đủ để đánh giá."],
    1: ["Chỉ sử dụng các cấu trúc ngữ pháp rất cơ bản.", "Mắc lỗi ngữ pháp liên tục.", "Vốn từ cực kỳ hạn chế.", "Thường xuyên chọn sai từ.", "Giao tiếp thường xuyên bị gián đoạn."],
    2: ["Gần như chỉ sử dụng các cấu trúc ngữ pháp đơn giản.", "Mắc nhiều lỗi ngữ pháp.", "Vốn từ hạn chế.", "Thường xuyên phải tìm từ để diễn đạt.", "Hiếm khi biết cách diễn đạt lại.", "Lỗi đôi khi ảnh hưởng đến việc giao tiếp."],
    3: ["Sử dụng đúng phần lớn các cấu trúc ngữ pháp đơn giản.", "Thử sử dụng một số cấu trúc phức tạp nhưng thành công chưa ổn định.", "Vốn từ đủ dùng cho các chủ đề quen thuộc.", "Thường xuyên lặp lại các từ thông dụng.", "Lỗi đôi khi khiến câu nói thiếu tự nhiên nhưng ý nghĩa vẫn rõ ràng."],
    4: ["Sử dụng khá đa dạng các cấu trúc ngữ pháp.", "Mắc một số lỗi ngữ pháp dễ nhận thấy.", "Có đủ vốn từ cho hầu hết các tình huống.", "Thỉnh thoảng lặp lại từ.", "Thường có thể giải thích những từ mình chưa biết.", "Khả năng giao tiếp vẫn rõ ràng trong suốt bài nói."],
    5: ["Sử dụng chính xác nhiều cấu trúc ngữ pháp ở trình độ B1.", "Chỉ mắc một vài lỗi nhỏ, không ảnh hưởng đến giao tiếp.", "Sử dụng vốn từ đa dạng và tự nhiên.", "Lựa chọn từ phù hợp với nhiều chủ đề khác nhau.", "Có thể diễn đạt lại ý khi cần thiết.", "Diễn đạt ý tưởng chính xác và tự tin."]
  },
  d: {
    title: "Quản lý diễn ngôn",
    0: ["Không tạo được lời nói có tính liên kết."],
    1: ["Chủ yếu nói bằng các từ đơn lẻ hoặc cụm từ ngắn.", "Có rất nhiều khoảng dừng dài.", "Không thể phát triển ý.", "Câu trả lời thường kết thúc sau một câu."],
    2: ["Trả lời ngắn.", "Thường xuyên có khoảng dừng dài.", "Ít sử dụng từ nối.", "Ý tưởng đôi khi rời rạc.", "Cần giám khảo hỗ trợ."],
    3: ["Nói thành các đoạn có liên kết.", "Đưa ra đủ chi tiết.", "Sử dụng các từ nối cơ bản.", "Có sự do dự khá rõ.", "Đôi khi mất mạch bài nói."],
    4: ["Thường nói liên tục.", "Trả lời có phát triển ý.", "Sử dụng đúng nhiều từ nối.", "Có một số lần ngập ngừng khi sắp xếp ý.", "Bài nói vẫn mạch lạc."],
    5: ["Nói trôi chảy với rất ít khoảng dừng.", "Đưa ra câu trả lời dài và phát triển đầy đủ.", "Sắp xếp ý tưởng logic.", "Sử dụng đa dạng các từ nối một cách tự nhiên.", "Hầu như không do dự."]
  },
  p: {
    title: "Phát âm",
    0: ["Không có lời nói đủ rõ để hiểu."],
    1: ["Rất khó hiểu.", "Có rất nhiều lỗi phát âm.", "Trọng âm sai xuyên suốt.", "Giao tiếp thường xuyên bị gián đoạn."],
    2: ["Thường xuyên gặp vấn đề về phát âm.", "Trọng âm sai thường ảnh hưởng đến việc hiểu.", "Ngữ điệu còn hạn chế.", "Người nghe thường xuyên gặp khó khăn."],
    3: ["Phần lớn thời gian đều dễ hiểu.", "Có khá nhiều lỗi phát âm.", "Đôi khi phải lặp lại từ hoặc câu.", "Người nghe đôi lúc cần tập trung hơn để hiểu."],
    4: ["Nhìn chung dễ hiểu.", "Có một số lỗi phát âm.", "Trọng âm phần lớn chính xác.", "Ngữ điệu nhìn chung phù hợp."],
    5: ["Luôn dễ hiểu.", "Sử dụng trọng âm và ngữ điệu tự nhiên.", "Phát âm hỗ trợ hiệu quả cho giao tiếp.", "Một vài lỗi nhỏ không làm thay đổi ý nghĩa."]
  },
  i: {
    title: "Tương tác giao tiếp",
    0: ["Không có sự tương tác."],
    1: ["Tham gia rất ít.", "Hiếm khi phản hồi phù hợp.", "Không đặt câu hỏi.", "Cuộc hội thoại liên tục bị ngắt quãng.", "Cần sự can thiệp đáng kể từ giám khảo."],
    2: ["Khả năng tương tác còn hạn chế.", "Thường chờ giám khảo gợi ý.", "Hiếm khi đặt câu hỏi.", "Gặp khó khăn trong việc kéo dài cuộc hội thoại.", "Bạn cùng thi phải đảm nhận phần lớn cuộc thảo luận."],
    3: ["Phản hồi phù hợp.", "Luân phiên lượt nói thành công.", "Đôi khi đặt câu hỏi.", "Cuộc hội thoại vẫn tiếp tục với một vài sự gợi ý từ giám khảo."],
    4: ["Tham gia tích cực.", "Thường phản hồi phù hợp.", "Thỉnh thoảng đặt câu hỏi.", "Góp phần duy trì cuộc thảo luận.", "Chỉ cần rất ít sự hỗ trợ."],
    5: ["Tương tác tự tin.", "Phản hồi ngay lập tức.", "Đặt các câu hỏi tiếp theo phù hợp.", "Phát triển tự nhiên từ ý tưởng của bạn cùng thi.", "Khuyến khích cuộc thảo luận.", "Duy trì cuộc trò chuyện mà hầu như không cần giám khảo hỗ trợ."]
  },
  ga: {
    title: "Đánh giá tổng thể",
    0: ["Không thể hiện được năng lực để đánh giá."],
    1: ["Gặp nhiều khó khăn trong việc hoàn thành các nhiệm vụ.", "Giao tiếp thường xuyên bị gián đoạn.", "Cần sự hỗ trợ đáng kể từ giám khảo.", "Thể hiện dưới chuẩn B1."],
    2: ["Chỉ hoàn thành một phần các nhiệm vụ.", "Khả năng giao tiếp chưa ổn định.", "Nhiều lỗi làm giảm hiệu quả giao tiếp.", "Cần giám khảo hỗ trợ nhiều lần."],
    3: ["Hoàn thành thành công phần lớn các nhiệm vụ.", "Giao tiếp nhìn chung hiệu quả.", "Có một số điểm yếu dễ nhận thấy.", "Đạt chuẩn trình độ B1 theo yêu cầu."],
    4: ["Hoàn thành thành công gần như tất cả các nhiệm vụ.", "Khả năng giao tiếp luôn hiệu quả.", "Một vài điểm yếu nhỏ không làm giảm chất lượng tổng thể.", "Chỉ cần rất ít sự hỗ trợ."],
    5: ["Hoàn thành tất cả các nhiệm vụ nói một cách tự tin.", "Truyền đạt ý tưởng hiệu quả.", "Duy trì giao tiếp tự nhiên.", "Thể hiện rõ năng lực B1 trong suốt bài thi.", "Hầu như không cần sự hỗ trợ từ giám khảo."]
  }
};

const getScaleScore = (marks, section) => {
  const map = CONVERSION_MAPS[section];
  if (marks <= map[0][0]) return map[0][1];
  for (let i = 1; i < map.length; i++) {
    if (marks <= map[i][0]) {
      const p1 = map[i - 1];
      const p2 = map[i];
      const fraction = (marks - p1[0]) / (p2[0] - p1[0]);
      return Math.round(p1[1] + fraction * (p2[1] - p1[1]));
    }
  }
  return map[map.length - 1][1];
};

const getGradeInfo = (scaleScore) => {
  if (scaleScore === null) return { text: "-", color: "text-gray-400" };
  if (scaleScore < 102) return { text: "Not Reported", color: "text-red-500" };
  if (scaleScore <= 119) return { text: "Level A1", color: "text-orange-500" };
  if (scaleScore <= 139) return { text: "Fail - Level A2", color: "text-amber-500" };
  if (scaleScore <= 152) return { text: "Pass - Grade C (Level B1)", color: "text-emerald-500" };
  if (scaleScore <= 159) return { text: "Pass - Grade B (Level B1)", color: "text-teal-500" };
  return { text: "Pass - Grade A (Level B2)", color: "text-blue-500" };
};

const Select = ({ label, value, max, onChange, theme }) => (
  <div className="flex flex-col gap-1.5 w-full group">
    <label className="text-sm font-bold text-gray-700 ml-1 group-hover:text-gray-900 transition-colors">{label}</label>
    <div className="relative transform transition-all duration-300 group-hover:-translate-y-0.5">
      <select
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className={`w-full appearance-none rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm py-3 px-4 pr-10 text-gray-900 shadow-sm transition-all duration-300 ${theme.ring} focus:border-transparent focus:outline-none focus:ring-2 ${theme.hoverBorder} hover:shadow-md font-bold text-lg cursor-pointer`}
      >
        {Array.from({ length: max + 1 }).map((_, i) => (
          <option key={i} value={i}>{i}</option>
        ))}
      </select>
      <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 ${theme.text}`}>
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
      </div>
    </div>
  </div>
);

const ScoreSummary = ({ title, points, maxPoints, minPoints, scaleScore, theme }) => {
  const gradeInfo = getGradeInfo(scaleScore);
  return (
    <div className="mt-8 animate-fade-in">
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 px-1">{title} Score Summary</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className={`bg-white rounded-2xl p-5 border-2 border-transparent hover:border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-center`}>
          <div className="text-sm font-semibold text-gray-400 mb-1">Points Obtained</div>
          <div className={`text-3xl font-extrabold ${theme.text}`}>{points} <span className="text-gray-300 text-xl font-bold">/ {maxPoints}</span></div>
          <div className="text-xs font-medium text-gray-400 mt-2 bg-gray-50 inline-block px-2 py-1 rounded-md w-max">Min. {minPoints} required</div>
        </div>
        <div className={`bg-white rounded-2xl p-5 border-2 border-transparent hover:border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-center relative overflow-hidden group`}>
          <div className={`absolute top-0 right-0 w-16 h-16 opacity-10 rounded-bl-full ${theme.bgGradient} transition-transform duration-500 group-hover:scale-150`}></div>
          <div className="text-sm font-semibold text-gray-400 mb-1 relative z-10">Cambridge Scale</div>
          <div className={`text-4xl font-black ${theme.textGradient} relative z-10`}>{scaleScore}</div>
        </div>
        <div className={`bg-white rounded-2xl p-5 border-2 border-transparent hover:border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-center`}>
          <div className="text-sm font-semibold text-gray-400 mb-1">Grade Result</div>
          <div className={`text-lg font-bold ${gradeInfo.color}`}>{gradeInfo.text}</div>
        </div>
      </div>
    </div>
  );
};

export function PETCalculator({ initialTab = 'reading', hideTabs = false, hideHeader = false, onScaleScoreChange = null }: any = {}) {
  const initialScores = {
    reading: { p1: 0, p2: 0, p3: 0, p4: 0, p5: 0, p6: 0 },
    writing: {
      p1c: 0, p1a: 0, p1o: 0, p1l: 0,
      p2c: 0, p2a: 0, p2o: 0, p2l: 0,
    },
    listening: { p1: 0, p2: 0, p3: 0, p4: 0 },
    speaking: { g: 0, d: 0, p: 0, i: 0, ga: 0 }
  };

  const initialTouched = { reading: false, writing: false, listening: false, speaking: false };

  const [activeTab, setActiveTab] = useState(initialTab);
  const [scores, setScores] = useState(initialScores);
  const [touched, setTouched] = useState(initialTouched);
  const [isVietnamese, setIsVietnamese] = useState(false);

  // Inject animations & print styles
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
      .animate-fade-in { animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-5px); } 100% { transform: translateY(0px); } }
      .animate-float { animation: float 3s ease-in-out infinite; }
      @keyframes bgShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
      .animate-bg-shift { background-size: 200% 200%; animation: bgShift 15s ease infinite; }
      @media print {
        body { background-color: white !important; -webkit-print-color-adjust: exact; }
        .print\\:hidden { display: none !important; }
        .shadow-sm, .shadow-md, .shadow-lg, .shadow-xl { box-shadow: none !important; }
        .border-transparent { border-color: #e2e8f0 !important; }
        .animate-fade-in { animation: none !important; opacity: 1 !important; transform: none !important; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handleScoreChange = (section, field, value) => {
    setScores(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
    setTouched(prev => ({ ...prev, [section]: true }));
  };

  const handleResetSection = (section) => {
    setScores(prev => ({ ...prev, [section]: initialScores[section] }));
    setTouched(prev => ({ ...prev, [section]: false }));
  };

  const handleResetAll = () => {
    setScores(initialScores);
    setTouched(initialTouched);
  };

  const totals = useMemo(() => {
    const r = scores.reading;
    const w = scores.writing;
    const l = scores.listening;
    const s = scores.speaking;
    
    return {
      reading: r.p1 + r.p2 + r.p3 + r.p4 + r.p5 + r.p6,
      writing: w.p1c + w.p1a + w.p1o + w.p1l + w.p2c + w.p2a + w.p2o + w.p2l,
      listening: l.p1 + l.p2 + l.p3 + l.p4,
      speaking: s.g + s.d + s.p + s.i + (s.ga * 2)
    };
  }, [scores]);

  const scaleScores = useMemo(() => ({
    reading: touched.reading ? getScaleScore(totals.reading, 'reading') : null,
    writing: touched.writing ? getScaleScore(totals.writing, 'writing') : null,
    listening: touched.listening ? getScaleScore(totals.listening, 'listening') : null,
    speaking: touched.speaking ? getScaleScore(totals.speaking, 'speaking') : null,
  }), [totals, touched]);

  
  useEffect(() => {
    if (onScaleScoreChange && touched[activeTab]) {
      const score = scaleScores[activeTab];
      const raw = totals[activeTab];
      if (score !== null) {
        onScaleScoreChange(score, raw);
      }
    }
  }, [scaleScores, activeTab, touched, onScaleScoreChange]);

  const activeScaleScores = Object.values(scaleScores).filter((s): s is number => s !== null);
  const globalAverage = activeScaleScores.length > 0
    ? Math.round(activeScaleScores.reduce((a, b) => a + b, 0) / activeScaleScores.length)
    : null;
  const globalGradeInfo = getGradeInfo(globalAverage);

  const activeTheme = THEMES[activeTab];

  const renderReadingSection = () => (
    <div className="animate-fade-in" key="reading">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <Select label="Part 1 (0-5)" value={scores.reading.p1} max={5} onChange={(v) => handleScoreChange('reading', 'p1', v)} theme={activeTheme} />
        <Select label="Part 2 (0-5)" value={scores.reading.p2} max={5} onChange={(v) => handleScoreChange('reading', 'p2', v)} theme={activeTheme} />
        <Select label="Part 3 (0-5)" value={scores.reading.p3} max={5} onChange={(v) => handleScoreChange('reading', 'p3', v)} theme={activeTheme} />
        <Select label="Part 4 (0-5)" value={scores.reading.p4} max={5} onChange={(v) => handleScoreChange('reading', 'p4', v)} theme={activeTheme} />
        <Select label="Part 5 (0-6)" value={scores.reading.p5} max={6} onChange={(v) => handleScoreChange('reading', 'p5', v)} theme={activeTheme} />
        <Select label="Part 6 (0-6)" value={scores.reading.p6} max={6} onChange={(v) => handleScoreChange('reading', 'p6', v)} theme={activeTheme} />
      </div>
      <div className="w-full h-px bg-gray-100 my-8"></div>
      <ScoreSummary title="Reading" points={totals.reading} maxPoints={MAX_POINTS.reading} minPoints={MIN_POINTS.reading} scaleScore={scaleScores.reading ?? getScaleScore(0, 'reading')} theme={activeTheme} />
    </div>
  );

  const renderWritingSection = () => (
    <div className="animate-fade-in" key="writing">
      <div className="space-y-8">
        <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
          <h4 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${activeTheme.bgGradient}`}></div> Part 1
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <Select label="Content (0-5)" value={scores.writing.p1c} max={5} onChange={(v) => handleScoreChange('writing', 'p1c', v)} theme={activeTheme} />
             <Select label="Achievement (0-5)" value={scores.writing.p1a} max={5} onChange={(v) => handleScoreChange('writing', 'p1a', v)} theme={activeTheme} />
             <Select label="Organisation (0-5)" value={scores.writing.p1o} max={5} onChange={(v) => handleScoreChange('writing', 'p1o', v)} theme={activeTheme} />
             <Select label="Language (0-5)" value={scores.writing.p1l} max={5} onChange={(v) => handleScoreChange('writing', 'p1l', v)} theme={activeTheme} />
          </div>
        </div>
        <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
          <h4 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${activeTheme.bgGradient}`}></div> Part 2
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <Select label="Content (0-5)" value={scores.writing.p2c} max={5} onChange={(v) => handleScoreChange('writing', 'p2c', v)} theme={activeTheme} />
             <Select label="Achievement (0-5)" value={scores.writing.p2a} max={5} onChange={(v) => handleScoreChange('writing', 'p2a', v)} theme={activeTheme} />
             <Select label="Organisation (0-5)" value={scores.writing.p2o} max={5} onChange={(v) => handleScoreChange('writing', 'p2o', v)} theme={activeTheme} />
             <Select label="Language (0-5)" value={scores.writing.p2l} max={5} onChange={(v) => handleScoreChange('writing', 'p2l', v)} theme={activeTheme} />
          </div>
        </div>
      </div>
      <div className="w-full h-px bg-gray-100 my-8"></div>
      <ScoreSummary title="Writing" points={totals.writing} maxPoints={MAX_POINTS.writing} minPoints={MIN_POINTS.writing} scaleScore={scaleScores.writing ?? getScaleScore(0, 'writing')} theme={activeTheme} />
    </div>
  );

  const renderListeningSection = () => (
    <div className="animate-fade-in" key="listening">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Select label="Part 1 (0-7)" value={scores.listening.p1} max={7} onChange={(v) => handleScoreChange('listening', 'p1', v)} theme={activeTheme} />
        <Select label="Part 2 (0-6)" value={scores.listening.p2} max={6} onChange={(v) => handleScoreChange('listening', 'p2', v)} theme={activeTheme} />
        <Select label="Part 3 (0-6)" value={scores.listening.p3} max={6} onChange={(v) => handleScoreChange('listening', 'p3', v)} theme={activeTheme} />
        <Select label="Part 4 (0-6)" value={scores.listening.p4} max={6} onChange={(v) => handleScoreChange('listening', 'p4', v)} theme={activeTheme} />
      </div>
      <div className="w-full h-px bg-gray-100 my-8"></div>
      <ScoreSummary title="Listening" points={totals.listening} maxPoints={MAX_POINTS.listening} minPoints={MIN_POINTS.listening} scaleScore={scaleScores.listening ?? getScaleScore(0, 'listening')} theme={activeTheme} />
    </div>
  );

  const renderSpeakingSection = () => (
    <div className="animate-fade-in" key="speaking">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <Select label="Grammar & Vocab (0-5)" value={scores.speaking.g} max={5} onChange={(v) => handleScoreChange('speaking', 'g', v)} theme={activeTheme} />
        <Select label="Discourse (0-5)" value={scores.speaking.d} max={5} onChange={(v) => handleScoreChange('speaking', 'd', v)} theme={activeTheme} />
        <Select label="Pronunciation (0-5)" value={scores.speaking.p} max={5} onChange={(v) => handleScoreChange('speaking', 'p', v)} theme={activeTheme} />
        <Select label="Interaction (0-5)" value={scores.speaking.i} max={5} onChange={(v) => handleScoreChange('speaking', 'i', v)} theme={activeTheme} />
        <Select label="Global (0-5)" value={scores.speaking.ga} max={5} onChange={(v) => handleScoreChange('speaking', 'ga', v)} theme={activeTheme} />
      </div>
      
      <div className="w-full h-px bg-gray-100 my-8"></div>
      
      <ScoreSummary title="Speaking" points={totals.speaking} maxPoints={MAX_POINTS.speaking} minPoints={MIN_POINTS.speaking} scaleScore={scaleScores.speaking ?? getScaleScore(0, 'speaking')} theme={activeTheme} />
      
      {}
      <div className="mt-10 bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-xl shadow-gray-200/40 relative overflow-hidden print:break-inside-avoid">
        {/* Decorative Background blob */}
        <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full ${activeTheme.bgGradient} opacity-5 blur-3xl`}></div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 relative z-10 w-full">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${activeTheme.bgGradient} text-white shadow-lg ${activeTheme.shadow}`}>
              <MessageIcon size={24} />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-gray-800">Performance Feedback</h3>
              <p className="text-sm font-medium text-gray-500">Based on your selected speaking criteria</p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsVietnamese(!isVietnamese)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 shadow-sm active:scale-95 ${isVietnamese ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            title="Translate feedback"
          >
            <TranslateIcon size={18} />
            <span>{isVietnamese ? 'Tiếng Việt' : 'English'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
          {Object.entries(scores.speaking).map(([key, score]) => {
            const isPassing = (score as number) >= 3;
            const currentFeedback = isVietnamese ? SPEAKING_FEEDBACK_VI : SPEAKING_FEEDBACK;
            
            return (
              <div key={key} className={`group bg-gray-50/80 border-2 rounded-2xl p-5 transition-all duration-300 hover:bg-white hover:shadow-lg ${isPassing ? 'border-transparent hover:border-emerald-200' : 'border-transparent hover:border-orange-200'} ${key === 'ga' ? 'md:col-span-2 md:w-2/3 md:mx-auto' : ''}`}>
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-bold text-gray-800 text-base">{currentFeedback[key].title}</h4>
                  <div className={`flex items-center gap-1 text-sm font-black px-3 py-1 rounded-lg ${isPassing ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                    <StarIcon size={14} filled={true} /> {score}/5
                  </div>
                </div>
                <ul className="space-y-2">
                  {currentFeedback[key][score].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm font-medium text-gray-600 leading-relaxed">
                      <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${isPassing ? 'bg-emerald-400' : 'bg-orange-400'}`}></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50 animate-bg-shift text-slate-800 p-4 md:p-8 font-sans selection:bg-indigo-200">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3 mb-10 pt-4 print:hidden animate-fade-in">
          <div className="inline-block p-3 bg-white rounded-2xl shadow-xl shadow-indigo-100 mb-2 animate-float">
            <div className="bg-gradient-to-br from-indigo-500 to-sky-500 text-white p-2 rounded-xl">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-800 to-sky-600 tracking-tight">
            B1 Preliminary Calculator
          </h1>
          <p className="text-lg font-medium text-gray-500 max-w-lg mx-auto">
            Accurately calculate and evaluate your Cambridge English B1 Preliminary exam scores.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="print:hidden animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-2 bg-white/50 backdrop-blur-md rounded-3xl shadow-sm border border-white">
            {Object.entries(THEMES).map(([id, theme]) => {
              const isActive = activeTab === id;
              return (
                <div
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`relative flex flex-col items-center justify-center py-5 px-3 rounded-2xl cursor-pointer transition-all duration-300 transform ${
                    isActive 
                      ? `${theme.bgGradient} text-white shadow-xl ${theme.shadow} scale-100 md:scale-105 z-10` 
                      : `bg-transparent text-gray-500 hover:bg-white hover:shadow-md hover:scale-100`
                  }`}
                >
                  <div className={`mb-2 transition-transform duration-500 ${isActive ? 'scale-110 animate-float' : ''}`}>
                    {theme.icon}
                  </div>
                  <span className="font-bold text-sm tracking-wide uppercase">{theme.name}</span>
                  {isActive && <div className="absolute -bottom-1 w-8 h-1 bg-white/50 rounded-full"></div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Section Editor */}
        <div className={`bg-white rounded-[2rem] shadow-2xl ${activeTheme.shadow} border-0 p-6 md:p-10 print:hidden relative overflow-hidden transition-all duration-500`} style={{ animationDelay: '0.2s' }}>
          {/* Subtle background glow based on active tab */}
          <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full ${activeTheme.bgGradient} opacity-10 blur-3xl transition-colors duration-500`}></div>
          
          <div className="flex justify-between items-center mb-8 relative z-10 border-b-2 border-gray-50 pb-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${activeTheme.lightBg} ${activeTheme.text}`}>
                {activeTheme.icon}
              </div>
              <h2 className="text-2xl font-extrabold text-gray-800 capitalize tracking-tight">{activeTab} Section</h2>
            </div>
            <button 
              onClick={() => handleResetSection(activeTab)} 
              className="group flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-800 transition-all bg-gray-50 hover:bg-gray-100 py-2.5 px-4 rounded-xl active:scale-95"
              title={`Reset ${activeTab} section`}
            >
              <span className="group-hover:-rotate-180 transition-transform duration-500"><ResetIcon /></span>
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>

          <div className="relative z-10">
            {activeTab === 'reading' && renderReadingSection()}
            {activeTab === 'writing' && renderWritingSection()}
            {activeTab === 'listening' && renderListeningSection()}
            {activeTab === 'speaking' && renderSpeakingSection()}
          </div>
        </div>

        {/* Global Summary Panel */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-indigo-200/50 border border-white p-8 md:p-12 mt-12 printable-section relative overflow-hidden animate-fade-in" style={{ animationDelay: '0.3s' }}>
           <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500"></div>
          
          <div className="flex justify-between items-center mb-10 relative z-10">
            <h2 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">Final Cambridge Score</h2>
            <button 
              onClick={handleResetAll} 
              className="group text-gray-400 hover:text-red-500 transition-all bg-white hover:bg-red-50 p-3 rounded-xl shadow-sm hover:shadow-md active:scale-95 print:hidden" 
              title="Reset all sections"
            >
              <span className="block group-hover:-rotate-180 transition-transform duration-500"><ResetIcon size={24} /></span>
            </button>
          </div>

          {activeScaleScores.length > 0 ? (
            <div className="space-y-8 relative z-10">
              {/* Individual Scores Display */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {['reading', 'writing', 'listening', 'speaking'].map((section) => {
                   if (!touched[section]) return null;
                   const theme = THEMES[section];
                   return (
                     <div key={section} className={`bg-white border-2 border-transparent hover:${theme.border} rounded-2xl p-5 text-center shadow-sm transition-all duration-300 transform hover:-translate-y-1`}>
                       <div className="flex justify-center mb-3 text-gray-300">{theme.icon}</div>
                       <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">{theme.name}</div>
                       <div className={`text-3xl font-black ${theme.textGradient}`}>{scaleScores[section]}</div>
                     </div>
                   );
                 })}
              </div>

              {/* Global Average */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2rem] p-8 md:p-12 text-center shadow-2xl relative overflow-hidden group">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                 <div className="absolute -inset-20 bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500 opacity-20 blur-3xl group-hover:opacity-40 transition-opacity duration-1000"></div>
                 
                 <div className="relative z-10">
                   <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Global Average Score</div>
                   <div className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 mb-4 tracking-tighter drop-shadow-lg">
                     {globalAverage}
                   </div>
                   <div className="inline-block bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-full px-4 py-1.5 text-xs font-bold text-gray-400">
                     Calculated from {activeScaleScores.length} section(s)
                   </div>
                 </div>
              </div>

              {/* Overall Grade */}
              <div className={`border-2 rounded-2xl p-6 text-center shadow-sm flex flex-col items-center justify-center transition-colors duration-500 ${
                globalAverage >= 140 ? 'bg-emerald-50 border-emerald-100' : 'bg-orange-50 border-orange-100'
              }`}>
                 <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Overall Grade Awarded</div>
                 <div className={`text-2xl md:text-3xl font-black ${globalGradeInfo.color}`}>{globalGradeInfo.text}</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 px-6 bg-white rounded-3xl border-2 border-dashed border-gray-200">
               <div className="inline-block p-4 bg-gray-50 rounded-full text-gray-300 mb-4">
                 <BookIcon size={48} />
               </div>
               <h3 className="text-xl font-bold text-gray-700 mb-2">Awaiting Input</h3>
               <p className="text-gray-500 font-medium max-w-md mx-auto">Select a section above and enter your scores to generate your Cambridge English Scale global average.</p>
            </div>
          )}
        </div>



      </div>
    </div>
  );
}
