import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { CourseDetails } from './pages/CourseDetails';
import { PracticeTests } from './pages/PracticeTests';
import { Dashboard } from './pages/ielts/Dashboard';
import { CreateAssignment } from './pages/CreateAssignment';
import { ViewAssignment } from './pages/ViewAssignment';
import { AdminDashboard } from './pages/AdminDashboard';
import { TeacherClasses } from './pages/TeacherClasses';
import { Login } from './pages/Login';
import { TestResult } from './pages/TestResult';
import { EraAIIeltsApp } from './pages/EraAIIeltsApp';
import { ComputerWritingTest } from './pages/ComputerWritingTest';
import { ComputerSpeakingTest } from './pages/ComputerSpeakingTest';
import { ComputerReadingTest } from './pages/ComputerReadingTest';
import { ComputerListeningTest } from './pages/ComputerListeningTest';
import { ImageGenerator } from './pages/ImageGenerator';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/ielts/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/test/writing/:id" element={<ProtectedRoute><ComputerWritingTest /></ProtectedRoute>} />
        <Route path="/test/speaking/:id" element={<ProtectedRoute><ComputerSpeakingTest /></ProtectedRoute>} />
        <Route path="/test/reading/:id" element={<ProtectedRoute><ComputerReadingTest /></ProtectedRoute>} />
        <Route path="/test/listening/:id" element={<ProtectedRoute><ComputerListeningTest /></ProtectedRoute>} />
        
        <Route path="*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/courses/:id" element={<CourseDetails />} />
              <Route path="/practice-tests" element={<PracticeTests />} />
              <Route path="/login" element={<Login />} />
              <Route path="/ielts/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/shared/dashboard/:userId" element={<Dashboard isShared={true} />} />
              <Route path="/shared/results/:id" element={<TestResult isShared={true} />} />
              <Route path="/writing-examiner" element={<ProtectedRoute><EraAIIeltsApp /></ProtectedRoute>} />
              <Route path="/results/:id" element={<ProtectedRoute><TestResult /></ProtectedRoute>} />
              <Route path="/assignment/:id" element={<ProtectedRoute><ViewAssignment /></ProtectedRoute>} />
              
              {/* Teacher routes */}
              <Route path="/classes" element={<ProtectedRoute adminOnly><TeacherClasses /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
              <Route path="/classes/assignments" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
              <Route path="/classes/create" element={<ProtectedRoute adminOnly><CreateAssignment /></ProtectedRoute>} />
              <Route path="/image-generator" element={<ProtectedRoute adminOnly><ImageGenerator /></ProtectedRoute>} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
