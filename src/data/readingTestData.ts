import { febPassages, febAnswers, febExplanations } from './februaryReadingData';
import { marchPassages, marchAnswers, marchExplanations } from './marchReadingData';
import { aprilPassages, aprilAnswers, aprilExplanations } from './aprilReadingData';
import { mayPassages, mayAnswers, mayExplanations } from './mayReadingData';
import { junePassages, juneAnswers, juneExplanations } from './juneReadingData';

import { julyPassages, julyAnswers, julyExplanations } from './julyReadingData';
import { augustPassages, augustAnswers, augustExplanations } from './augustReadingData';

export const getReadingTestData = (id: string | undefined) => {
  // Return null for January (id === '1') or any unknown ID (e.g. old submissions)
  // so it falls back to the original passagesData.
  
  if (id === '5') {
    return { passages: febPassages, answers: febAnswers, explanations: febExplanations };
  }
  
  if (id === '9') {
    return { passages: marchPassages, answers: marchAnswers, explanations: marchExplanations };
  }

  if (id === '13') {
    return { passages: aprilPassages, answers: aprilAnswers, explanations: aprilExplanations };
  }
  
  if (id === '17') {
    return { passages: mayPassages, answers: mayAnswers, explanations: mayExplanations };
  }
  
  if (id === '21') {
    return { passages: junePassages, answers: juneAnswers, explanations: juneExplanations };
  }

  
  if (id === '25') {
    return { passages: julyPassages, answers: julyAnswers, explanations: julyExplanations };
  }

  if (id === '29') {
    return { passages: augustPassages, answers: augustAnswers, explanations: augustExplanations };
  }

  // Explicitly defined future tests that don't have content yet
  if (id && ['33', '37', '41'].includes(id)) {
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
