import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { secondaryAuth, db } from './firebase';

export async function createStudentAccount(data: {
  firstName: string;
  lastName: string;
  course: string;
  email?: string;
  phone?: string;
}) {
  const { firstName, lastName, course, email, phone } = data;
  
  // Generate random digits for the ID
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const year = new Date().getFullYear();
  const prefix = course.substring(0, 3).toUpperCase();
  
  const studentId = `${prefix}-${year}-${randomNum}`;
  
  const baseUsername = `${firstName.toLowerCase().replace(/[^a-z0-9]/g, '')}${lastName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  const username = baseUsername;
  
  const cleanFirstName = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const tempPassword = `${cleanFirstName}${randomNum}`;
  
  // Construct a dummy email if none provided, or just use dummy to ensure login via username works
  const authEmail = email || `${username}@student.era.edu`;
  
  // Create user with a generated ID since Email/Password Auth is disabled
  const generatedUid = `student_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
  
  // Save to Firestore
  await setDoc(doc(db, 'users', generatedUid), {
    name: `${firstName} ${lastName}`,
    firstName,
    lastName,
    studentId,
    username,
    course,
    email: email || '',
    phone: phone || '',
    status: 'active',
    authEmail,
    tempPassword, // Store password so student can log in via custom flow
    password: tempPassword,
    needsPasswordReset: false,
    createdAt: serverTimestamp(),
    lastLogin: null,
    lastActive: null,
    points: 0
  });

  return {
    studentId,
    username,
    tempPassword,
    authEmail,
    uid: generatedUid
  };
}
