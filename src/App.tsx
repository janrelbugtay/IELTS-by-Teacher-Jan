import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';

// Code-split routes to reduce initial bundle size and speed up page load
const CourseDetails = lazy(() => import('./pages/CourseDetails').then(m => ({ default: m.CourseDetails })));
const PracticeTests = lazy(() => import('./pages/PracticeTests').then(m => ({ default: m.PracticeTests })));
const Dashboard = lazy(() => import('./pages/ielts/Dashboard').then(m => ({ default: m.Dashboard })));
const PetDashboard = lazy(() => import('./pages/pet/Dashboard').then(m => ({ default: m.Dashboard })));
const KetDashboard = lazy(() => import('./pages/ket/Dashboard').then(m => ({ default: m.Dashboard })));
const CreateAssignment = lazy(() => import('./pages/CreateAssignment').then(m => ({ default: m.CreateAssignment })));
const ViewAssignment = lazy(() => import('./pages/ViewAssignment').then(m => ({ default: m.ViewAssignment })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const TestResult = lazy(() => import('./pages/TestResult').then(m => ({ default: m.TestResult })));
const EraAIIeltsApp = lazy(() => import('./pages/EraAIIeltsApp').then(m => ({ default: m.EraAIIeltsApp })));
const ComputerWritingTest = lazy(() => import('./pages/ComputerWritingTest').then(m => ({ default: m.ComputerWritingTest })));
const ComputerSpeakingTest = lazy(() => import('./pages/ComputerSpeakingTest').then(m => ({ default: m.ComputerSpeakingTest })));
const ComputerReadingTest = lazy(() => import('./pages/ComputerReadingTest').then(m => ({ default: m.ComputerReadingTest })));
const ComputerListeningTest = lazy(() => import('./pages/ComputerListeningTest').then(m => ({ default: m.ComputerListeningTest })));
const ImageGenerator = lazy(() => import('./pages/ImageGenerator').then(m => ({ default: m.ImageGenerator })));
const EmbedTest = lazy(() => import('./pages/EmbedTest').then(m => ({ default: m.EmbedTest })));

function PageLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
      <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Loading...</p>
    </div>
  );
}

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { user, userCourse, loading, isAdmin } = useAuth();

  if (loading) {
    return <PageLoading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    if (userCourse?.toLowerCase() === 'pet') {
      return <Navigate to="/pet/dashboard" replace />;
    }
    if (userCourse?.toLowerCase() === 'ket') {
      return <Navigate to="/ket/dashboard" replace />;
    }
    return <Navigate to="/ielts/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/test/writing/:id" element={<ProtectedRoute><ComputerWritingTest /></ProtectedRoute>} />
          <Route path="/test/speaking/:id" element={<ProtectedRoute><ComputerSpeakingTest /></ProtectedRoute>} />
          <Route path="/test/reading/:id" element={<ProtectedRoute><ComputerReadingTest /></ProtectedRoute>} />
          <Route path="/test/listening/:id" element={<ProtectedRoute><ComputerListeningTest /></ProtectedRoute>} />
          <Route path="/test/embed" element={<ProtectedRoute><EmbedTest /></ProtectedRoute>} />
          
          <Route path="*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/courses/:id" element={<CourseDetails />} />
                <Route path="/practice-tests" element={<PracticeTests />} />
                <Route path="/login" element={<Login />} />
                <Route path="/ielts/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/pet/dashboard" element={<ProtectedRoute><PetDashboard /></ProtectedRoute>} />
                <Route path="/ket/dashboard" element={<ProtectedRoute><KetDashboard /></ProtectedRoute>} />
                <Route path="/shared/dashboard/:userId" element={<Dashboard isShared={true} />} />
                <Route path="/shared/pet/dashboard/:userId" element={<PetDashboard isShared={true} />} />
                <Route path="/shared/ket/dashboard/:userId" element={<KetDashboard isShared={true} />} />
                <Route path="/shared/results/:id" element={<TestResult isShared={true} />} />
                <Route path="/writing-examiner" element={<ProtectedRoute><EraAIIeltsApp /></ProtectedRoute>} />
                <Route path="/results/:id" element={<ProtectedRoute><TestResult /></ProtectedRoute>} />
                <Route path="/assignment/:id" element={<ProtectedRoute><ViewAssignment /></ProtectedRoute>} />
                
                {/* Teacher routes */}
                <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
                <Route path="/classes/assignments" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
                <Route path="/classes/create" element={<ProtectedRoute adminOnly><CreateAssignment /></ProtectedRoute>} />
                <Route path="/image-generator" element={<ProtectedRoute adminOnly><ImageGenerator /></ProtectedRoute>} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}
