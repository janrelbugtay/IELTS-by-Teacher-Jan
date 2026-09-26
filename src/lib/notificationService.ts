import { collection, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

export const ADMIN_EMAILS = [
  'janrelbugtay03@gmail.com', 
  'khaisangschool.edu.vn@gmail.com'
];

/**
 * Checks whether a user is an admin or teacher so their internal test runs are not logged as student notifications.
 */
export function isTeacherOrAdmin(
  userId?: string, 
  email?: string, 
  name?: string, 
  nickname?: string
): boolean {
  if (email && ADMIN_EMAILS.includes(email.toLowerCase().trim())) {
    return true;
  }
  const cleanName = (name || '').toLowerCase().trim();
  const cleanNick = (nickname || '').toLowerCase().trim();
  
  if (
    cleanName === 'teacher jan' || 
    cleanName.includes('teacher jan') || 
    cleanName === 'admin' ||
    cleanName === 'teacher'
  ) {
    return true;
  }
  if (
    cleanNick === 'teacher jan' || 
    cleanNick.includes('teacher jan') || 
    cleanNick === 'admin'
  ) {
    return true;
  }
  return false;
}

/**
 * Helper to prevent duplicate names like Teacher Jan "Teacher Jan" or Suzie "Suzie"
 */
export function formatStudentNameWithNickname(userName?: string, userNickname?: string) {
  const name = (userName || 'Student').trim();
  const nick = (userNickname || '').trim();

  if (!nick) {
    return { name, nickname: null };
  }

  // If nickname is identical to name (case-insensitive), don't show twice
  if (name.toLowerCase() === nick.toLowerCase()) {
    return { name, nickname: null };
  }

  // If name is already just the nickname or vice-versa
  const nameWords = name.toLowerCase().split(/\s+/);
  if (nameWords.length === 1 && nameWords[0] === nick.toLowerCase()) {
    return { name, nickname: null };
  }

  return { name, nickname: nick };
}

export interface CreateNotificationParams {
  userId: string;
  studentName?: string;
  assignmentTitle: string;
  type: 'homework' | 'practice_test';
  testType?: 'writing' | 'speaking' | 'reading' | 'listening' | 'general';
  submissionId?: string;
  bandScore?: number | string;
  score?: number | string;
  course?: string;
  folderId?: string | null;
  folderName?: string | null;
}

/**
 * Creates a notification in Firestore whenever a homework or practice test is submitted.
 * Teachers and Admins are strictly excluded from generating notifications.
 */
export async function createSubmissionNotification(params: CreateNotificationParams) {
  try {
    // Quick check: if name or user matches teacher/admin, skip completely
    if (isTeacherOrAdmin(params.userId, undefined, params.studentName)) {
      return;
    }

    let resolvedCourse = params.course;
    let resolvedFolderId = params.folderId;
    let resolvedFolderName = params.folderName;
    let resolvedName = params.studentName;
    let resolvedNickname = '';
    let resolvedPhotoURL = '';

    // Fetch student profile to get folder and verify not an admin
    try {
      const userDoc = await getDoc(doc(db, 'users', params.userId));
      if (userDoc.exists()) {
        const udata = userDoc.data();
        
        // Strict guard: if user is admin, stop immediately
        if (
          udata.role === 'admin' || 
          udata.isAdmin === true || 
          isTeacherOrAdmin(params.userId, udata.email || udata.authEmail, udata.name || udata.displayName, udata.nickname)
        ) {
          return;
        }

        if (!resolvedCourse) resolvedCourse = udata.course || 'IELTS';
        if (resolvedFolderId === undefined) resolvedFolderId = udata.folderId || null;
        if (resolvedFolderName === undefined) resolvedFolderName = udata.folderName || null;
        if (!resolvedName) resolvedName = udata.name || udata.displayName || 'Student';
        resolvedNickname = udata.nickname || '';
        resolvedPhotoURL = udata.photoURL || '';
      }
    } catch (err) {
      console.warn('Could not fetch user details for notification:', err);
    }

    // Double check resolved values
    if (isTeacherOrAdmin(params.userId, undefined, resolvedName, resolvedNickname)) {
      return;
    }

    // Clean duplicate nickname
    const { name: finalName, nickname: finalNick } = formatStudentNameWithNickname(resolvedName, resolvedNickname);

    const notificationPayload: any = {
      userId: params.userId,
      userName: finalName,
      userNickname: finalNick || '',
      userPhotoURL: resolvedPhotoURL,
      course: resolvedCourse || 'IELTS',
      folderId: resolvedFolderId || null,
      folderName: resolvedFolderName || null,
      type: params.type,
      testType: params.testType || 'general',
      title: params.assignmentTitle,
      createdAt: serverTimestamp()
    };

    if (params.submissionId) notificationPayload.submissionId = params.submissionId;
    if (params.bandScore !== undefined && params.bandScore !== null && params.bandScore !== '') {
      notificationPayload.bandScore = params.bandScore;
    }
    if (params.score !== undefined && params.score !== null && params.score !== '') {
      notificationPayload.score = params.score;
    }

    await addDoc(collection(db, 'notifications'), notificationPayload);
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}
