import { febPassages, febAnswers, febExplanations } from './februaryReadingData';
import { marchPassages, marchAnswers, marchExplanations } from './marchReadingData';
import { aprilPassages, aprilAnswers, aprilExplanations } from './aprilReadingData';
import { mayPassages, mayAnswers, mayExplanations } from './mayReadingData';

export const getReadingTestData = (id: string | undefined) => {
  // Return null for January (id === '1') or any unknown ID (e.g. old submissions)
  // so it falls back to the original passagesData.
  
  if (id === '4') {
    return { passages: febPassages, answers: febAnswers, explanations: febExplanations };
  }
  
  if (id === '7') {
    return { passages: marchPassages, answers: marchAnswers, explanations: marchExplanations };
  }

  if (id === '10') {
    return { passages: aprilPassages, answers: aprilAnswers, explanations: aprilExplanations };
  }
  
  if (id === '13') {
    return { passages: mayPassages, answers: mayAnswers, explanations: mayExplanations };
  }
  
  // Explicitly defined future tests that don't have content yet
  if (id && ['16', '19', '22', '25', '28', '31', '34'].includes(id)) {
    return {
      passages: [
        {
          id: 1,
          title: "Content Coming Soon",
          subtitle: "Future Update",
          content: [
            "The reading practice test for this month is currently under development and will be available in a future update."
          ],
          questionBlocks: []
        }
      ],
      answers: {},
      explanations: {}
    };
  }
  
  // Default to January/original content for backwards compatibility with old submissions
  return null;
};

