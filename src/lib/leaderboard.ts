import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp, orderBy, limit, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface LeaderboardEntry {
  id?: string;
  studentId: string;
  classId: string;
  xp: number;
  points: number;
  weeklyPoints: number;
  monthlyPoints: number;
  allTimePoints: number;
  rank: number;
  streak: number;
  level: number;
  // joined from student
  studentName?: string;
  studentAvatar?: string;
  badges?: string[];
}

export interface Badge {
  id?: string;
  studentId: string;
  badgeName: string;
  dateAwarded: any;
}

export interface ActivityLog {
  id?: string;
  studentId: string;
  activity: string;
  points: number;
  xp: number;
  date: any;
}

// Points constants
export const ACTIVITY_POINTS = {
  DAILY_LOGIN: { xp: 5, points: 5 },
  LESSON_COMPLETED: { xp: 20, points: 20 },
  HOMEWORK_SUBMITTED: { xp: 30, points: 30 },
  PERFECT_HOMEWORK: { xp: 50, points: 50 },
  PRACTICE_TEST_COMPLETED: { xp: 40, points: 40 },
  MOCK_TEST: { xp: 80, points: 80 },
  LISTENING_PRACTICE: { xp: 10, points: 10 },
  READING_PRACTICE: { xp: 10, points: 10 },
  WRITING_PRACTICE: { xp: 15, points: 15 },
  SPEAKING_PRACTICE: { xp: 20, points: 20 },
  WEEKLY_ATTENDANCE: { xp: 25, points: 25 },
  TEACHER_BONUS: { xp: 10, points: 10 },
};

// Calculate level based on XP
export const calculateLevel = (xp: number) => {
  if (xp < 500) return 1;
  if (xp < 1000) return 2;
  if (xp < 2000) return 3;
  // Every 1000 xp after 1000 is a new level (e.g. 2000=L4, 3000=L5)
  return Math.floor((xp - 2000) / 1000) + 4;
};

// Add activity and update points
export const logActivity = async (studentId: string, classId: string, activityName: string, xp: number, points: number) => {
  try {
    // 1. Add Activity Log
    await addDoc(collection(db, 'activity_logs'), {
      studentId,
      activity: activityName,
      points,
      xp,
      date: serverTimestamp()
    });

    // 2. Find or create leaderboard entry
    const q = query(collection(db, 'leaderboard'), where('studentId', '==', studentId), where('classId', '==', classId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      await addDoc(collection(db, 'leaderboard'), {
        studentId,
        classId,
        xp,
        points,
        weeklyPoints: points,
        monthlyPoints: points,
        allTimePoints: points,
        rank: 0,
        streak: 1,
        level: calculateLevel(xp)
      });
    } else {
      const docRef = snapshot.docs[0].ref;
      const data = snapshot.docs[0].data();
      const newXp = (data.xp || 0) + xp;
      
      await updateDoc(docRef, {
        xp: newXp,
        points: (data.points || 0) + points,
        weeklyPoints: (data.weeklyPoints || 0) + points,
        monthlyPoints: (data.monthlyPoints || 0) + points,
        allTimePoints: (data.allTimePoints || 0) + points,
        level: calculateLevel(newXp)
      });
    }
  } catch (error) {
    console.error("Error logging activity", error);
  }
};
