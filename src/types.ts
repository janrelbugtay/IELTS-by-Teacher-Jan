export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export type AssignmentType = 'reading' | 'listening' | 'writing' | 'speaking';

export interface Assignment {
  id?: string;
  title: string;
  description: string;
  type: AssignmentType;
  speakingParts?: { part1: boolean; part2: boolean; part3: boolean };
  content: string; // for reading test, etc.
  classId?: string; // Optional if assigned to a specific class
  dueDate?: any;
  createdBy: string;
  createdAt: any;
  updatedAt: any;
}

export interface Submission {
  id?: string;
  assignmentId: string;
  assignmentTitle?: string;
  assignmentType?: AssignmentType;
  userId: string;
  sessionId?: string; // added for grouped speaking tests
  studentName?: string;
  answers: string | Record<string, string>; // answers or essay content
  audioUrl?: string; // For speaking
  fileUrl?: string; // For writing PDF
  correctedFileUrl?: string; // For corrected writing
  bandScore?: number; // Automatic or manual score
  percentage?: number; // % correct for reading/listening
  score?: number;
  teacherComment?: string;
  vietnameseTranslation?: string;
  teacherCommentVi?: string;
  aiFeedback?: string;
  timeSpent?: number; // in seconds
  createdAt: any;
}

export interface Class {
  id?: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: any;
}

export interface ClassMember {
  id?: string; // document id
  classId: string;
  userId: string;
  role: 'student' | 'teacher';
  joinedAt: any;
}

export interface CourseFolder {
  id: string;
  name: string;
  course: string;
  parentId?: string | null;
  description?: string;
  color?: string;
  createdBy?: string;
  createdAt: any;
  isDeleted?: boolean;
  deletedAt?: any;
}

export interface NotificationItem {
  id?: string;
  userId: string;
  userName: string;
  userNickname?: string;
  userPhotoURL?: string;
  course: string;
  folderId?: string | null;
  folderName?: string | null;
  type: 'homework' | 'practice_test';
  testType?: 'writing' | 'speaking' | 'reading' | 'listening' | 'general';
  title: string;
  bandScore?: number | string;
  score?: number | string;
  submissionId?: string;
  createdAt: any;
}

