import { collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot, getDoc, doc, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { NotificationItem } from '../types';

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
 */
export async function createSubmissionNotification(params: CreateNotificationParams) {
  try {
    let resolvedCourse = params.course;
    let resolvedFolderId = params.folderId;
    let resolvedFolderName = params.folderName;
    let resolvedName = params.studentName;
    let resolvedNickname = '';
    let resolvedPhotoURL = '';

    // If folder info or course is missing, fetch student profile
    if (!resolvedCourse || resolvedFolderId === undefined || !resolvedName) {
      try {
        const userDoc = await getDoc(doc(db, 'users', params.userId));
        if (userDoc.exists()) {
          const udata = userDoc.data();
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
    }

    const notificationPayload: any = {
      userId: params.userId,
      userName: resolvedName || 'Student',
      userNickname: resolvedNickname,
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
