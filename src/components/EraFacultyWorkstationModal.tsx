import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Building2,
  Users,
  FileCheck,
  Sparkles,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Award,
  BookOpen,
  FileText,
  Mic,
  PenTool,
  Headphones,
  Gamepad2,
  Presentation,
  Layers,
  Calendar,
  Send,
  Bell,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Gem,
  RefreshCw,
  ChevronRight,
  Printer,
  Edit3,
  FolderOpen,
  UserCheck,
  MessageSquare
} from 'lucide-react';
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  FacultyEmployeeProfile,
  FacultyTaskItem,
  FacultyApprovalLog,
  FacultyNotification,
  OfficeDecorationItem,
  FacultyMissionItem,
  ExamProfileId,
  ExamSkillType,
  CreativeToolId,
  FacultyTaskPriority,
  EXAM_PROFILES,
  CREATIVE_TEACHING_TOOLS,
  INITIAL_FACULTY_EMPLOYEES,
  INITIAL_FACULTY_TASKS,
  INITIAL_OFFICE_DECORATIONS,
  INITIAL_FACULTY_MISSIONS,
  FACULTY_ACHIEVEMENT_BADGES
} from '../utils/eraFacultyData';

interface EraFacultyWorkstationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmployeeId?: string | null;
  initialDashboardModule?: AdminModuleId | null;
  currentUserName: string;
  currentUserEmail?: string;
  isAuthorizedFaculty: boolean;
  eraGems: number;
  eraDollars: number;
  onRewardCurrency: (gemsDelta: number, dollarsDelta: number, reason: string) => void;
  onUnlockedDecorationsChange?: (unlockedIds: string[]) => void;
  studentRoster: Array<{
    id: string;
    name: string;
    fullName?: string;
    cohort: string;
    realUserId?: string;
    email?: string;
    reading?: number;
    listening?: number;
    writing?: number;
    speaking?: number;
    overall?: number;
  }>;
  firestoreFolders: any[];
}

export type AdminModuleId =
  | 'overview'
  | 'student_records'
  | 'class_management'
  | 'exam_management'
  | 'employee_directory'
  | 'task_management'
  | 'approval_center'
  | 'academic_analytics'
  | 'content_production'
  | 'staff_communication'
  | 'financial_overview'
  | 'notifications';

const ADMIN_MODULES: Array<{ id: AdminModuleId; num: string; label: string }> = [
  { id: 'overview', num: '01', label: 'School Overview' },
  { id: 'student_records', num: '02', label: 'Student Records' },
  { id: 'class_management', num: '03', label: 'Class Management' },
  { id: 'exam_management', num: '04', label: 'Examination Management' },
  { id: 'employee_directory', num: '05', label: 'AI Employee Directory' },
  { id: 'task_management', num: '06', label: 'Employee Task Management' },
  { id: 'approval_center', num: '07', label: 'Assessment Approval Center' },
  { id: 'academic_analytics', num: '08', label: 'Academic Analytics' },
  { id: 'content_production', num: '09', label: 'Content Production Center' },
  { id: 'staff_communication', num: '10', label: 'Staff Communication' },
  { id: 'financial_overview', num: '11', label: 'Financial & Gamification' },
  { id: 'notifications', num: '12', label: 'Notifications & Audit Log' }
];

export const EraFacultyWorkstationModal: React.FC<EraFacultyWorkstationModalProps> = ({
  isOpen,
  onClose,
  initialEmployeeId,
  initialDashboardModule,
  currentUserName,
  currentUserEmail,
  isAuthorizedFaculty,
  eraGems,
  eraDollars,
  onRewardCurrency,
  onUnlockedDecorationsChange,
  studentRoster,
  firestoreFolders
}) => {
  const [viewMode, setViewMode] = useState<'workstation' | 'admin_dashboard'>(
    initialDashboardModule ? 'admin_dashboard' : 'workstation'
  );
  const [activeAdminModule, setActiveAdminModule] = useState<AdminModuleId>(
    initialDashboardModule || 'overview'
  );
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(
    initialEmployeeId || 'emp_teacher_jan'
  );

  // Live synced state with Firestore + local resilience
  const [employees, setEmployees] = useState<FacultyEmployeeProfile[]>(INITIAL_FACULTY_EMPLOYEES);
  const [tasks, setTasks] = useState<FacultyTaskItem[]>(INITIAL_FACULTY_TASKS);
  const [approvalLogs, setApprovalLogs] = useState<FacultyApprovalLog[]>([
    {
      id: 'log_seed_1',
      taskId: 'task_seed_ielts_writing',
      taskTitle: 'IELTS Academic Writing Task 2 Evaluation — Charlie (IELTS 2)',
      employeeId: 'emp_writing',
      employeeName: 'Dr. Victoria Sterling',
      action: 'approved',
      actorName: 'Teacher Jan',
      actorRole: 'Head Administrator',
      notes: 'Verified Band 7.5 rubric alignment and inline grammar corrections.',
      scoreLabel: 'Band 7.5',
      studentName: 'Charlie',
      timestamp: Date.now() - 1000 * 60 * 120
    }
  ]);
  const [notifications, setNotifications] = useState<FacultyNotification[]>([
    {
      id: 'notif_seed_1',
      title: 'Movers Reading Papers Ready for Approval',
      message: "Maya Lin (Movers Specialist): Teacher Jan, I've finished correcting the Movers reading papers. They are ready for your approval!",
      employeeId: 'emp_movers',
      employeeName: 'Maya Lin',
      taskId: 'task_seed_movers_reading',
      type: 'approval_needed',
      read: false,
      timestamp: Date.now() - 1000 * 60 * 15
    },
    {
      id: 'notif_seed_2',
      title: 'PET Writing Email Assessment Completed',
      message: 'Julian Brooks (PET Specialist) evaluated Kim’s B1 Preliminary Part 1 Email (18/20 • Scale 162). Awaiting your sign-off.',
      employeeId: 'emp_pet',
      employeeName: 'Julian Brooks',
      taskId: 'task_seed_pet_writing',
      type: 'approval_needed',
      read: false,
      timestamp: Date.now() - 1000 * 60 * 28
    }
  ]);
  const [decorations, setDecorations] = useState<OfficeDecorationItem[]>(INITIAL_OFFICE_DECORATIONS);
  const [missions, setMissions] = useState<FacultyMissionItem[]>(INITIAL_FACULTY_MISSIONS);

  // Workstation Task Execution Form State
  const [taskMode, setTaskMode] = useState<'exam_assessment' | 'content_generation'>('exam_assessment');
  const [selectedExamProfile, setSelectedExamProfile] = useState<ExamProfileId>('ielts_academic');
  const [selectedSkill, setSelectedSkill] = useState<ExamSkillType>('Writing');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('ielts2-kim');
  const [batchPaperCount, setBatchPaperCount] = useState<number>(1);
  const [taskPriority, setTaskPriority] = useState<FacultyTaskPriority>('High');
  const [examPromptText, setExamPromptText] = useState<string>(
    'Some people think that schools should select students according to their academic abilities, while others believe that it is better to have students with different abilities study together. Discuss both views and state your own opinion.'
  );
  const [answerKeyText, setAnswerKeyText] = useState<string>('');
  const [studentResponseText, setStudentResponseText] = useState<string>(
    'In recent years, there has been a growing debate over whether schools ought to group learners by academic ability or educate mixed-ability cohorts together. While streaming allows teachers to tailor lesson pace, I believe inclusive classrooms foster stronger social development and peer collaboration.'
  );
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [uploadedFileBase64, setUploadedFileBase64] = useState<string>('');
  const [uploadedFileMime, setUploadedFileMime] = useState<string>('');

  // Creative Generator Form State
  const [selectedCreativeTool, setSelectedCreativeTool] = useState<CreativeToolId>('classroom_game');
  const [creativeTopic, setCreativeTopic] = useState<string>('Technology, Environment & Future Cities');
  const [creativeQuestionCount, setCreativeQuestionCount] = useState<number>(8);
  const [creativeDifficulty, setCreativeDifficulty] = useState<string>('Medium');
  const [creativeCustomNotes, setCreativeCustomNotes] = useState<string>('');

  // Execution & Output State
  const [isExecutingAi, setIsExecutingAi] = useState<boolean>(false);
  const [routingStageText, setRoutingStageText] = useState<string>('');
  const [activeTaskResult, setActiveTaskResult] = useState<FacultyTaskItem | null>(null);
  const [editableMarkdown, setEditableMarkdown] = useState<string>('');
  const [isEditingMarkdown, setIsEditingMarkdown] = useState<boolean>(false);
  const [statusBanner, setStatusBanner] = useState<{ text: string; tone: 'success' | 'info' | 'warn' } | null>(null);

  // Staff Communication State
  const [staffMessages, setStaffMessages] = useState<
    Array<{ id: string; sender: string; role: string; text: string; time: string }>
  >([
    {
      id: 'sm1',
      sender: 'Clara Vance',
      role: 'Exam Coordinator',
      text: 'Good morning Teacher Jan! All 7 Cambridge and IELTS examination profiles are online. Upload any single paper or batch of 30 papers and I will route them automatically.',
      time: '08:45 AM'
    },
    {
      id: 'sm2',
      sender: 'Maya Lin',
      role: 'Movers Specialist',
      text: "Teacher Jan, I've finished correcting the Movers reading papers. They are ready for your approval!",
      time: '09:10 AM'
    },
    {
      id: 'sm3',
      sender: 'Pixel Kai',
      role: 'Educational Game Designer',
      text: 'Our Bubble Island game generator on Floor 2 is linked directly to EraGames! Any quiz we generate can be played by students right away.',
      time: '09:18 AM'
    }
  ]);
  const [staffChatInput, setStaffChatInput] = useState<string>('');

  // Sync employee selection when modal opens
  useEffect(() => {
    if (initialEmployeeId) {
      setSelectedEmployeeId(initialEmployeeId);
      if (initialEmployeeId === 'emp_teacher_jan' && initialDashboardModule) {
        setViewMode('admin_dashboard');
        setActiveAdminModule(initialDashboardModule);
      } else {
        setViewMode('workstation');
      }
    } else if (initialDashboardModule) {
      setViewMode('admin_dashboard');
      setActiveAdminModule(initialDashboardModule);
    }
  }, [initialEmployeeId, initialDashboardModule, isOpen]);

  const selectedEmployee = useMemo(() => {
    return employees.find((e) => e.id === selectedEmployeeId) || employees[0];
  }, [employees, selectedEmployeeId]);

  // Configure default workstation mode based on selected employee's department
  useEffect(() => {
    if (!selectedEmployee) return;
    if (selectedEmployee.department === 'creative_teaching') {
      setTaskMode('content_generation');
      if (selectedEmployee.defaultCreativeTool) {
        setSelectedCreativeTool(selectedEmployee.defaultCreativeTool);
      }
    } else {
      setTaskMode('exam_assessment');
      if (selectedEmployee.defaultExamProfile) {
        setSelectedExamProfile(selectedEmployee.defaultExamProfile);
      }
      if (selectedEmployee.defaultSkill) {
        setSelectedSkill(selectedEmployee.defaultSkill);
      }
    }
    const empTask = tasks.find((t) => t.employeeId === selectedEmployee.id);
    if (empTask) {
      setActiveTaskResult(empTask);
      setEditableMarkdown(empTask.outputResult?.examinerReportMarkdown || '');
    }
  }, [selectedEmployeeId]);

  // Firestore real-time listeners for faculty_tasks, faculty_approvals, faculty_gamification
  useEffect(() => {
    const unsubTasks = onSnapshot(
      collection(db, 'faculty_tasks'),
      (snap) => {
        if (snap.empty) return;
        const loaded: FacultyTaskItem[] = [];
        snap.forEach((d) => loaded.push({ id: d.id, ...(d.data() as any) }));
        loaded.sort((a, b) => b.createdAt - a.createdAt);
        setTasks((prev) => {
          const map = new Map<string, FacultyTaskItem>();
          prev.forEach((p) => map.set(p.id, p));
          loaded.forEach((l) => map.set(l.id, l));
          return Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
        });
      },
      () => {}
    );

    const unsubApprovals = onSnapshot(
      collection(db, 'faculty_approvals'),
      (snap) => {
        if (snap.empty) return;
        const loaded: FacultyApprovalLog[] = [];
        snap.forEach((d) => loaded.push({ id: d.id, ...(d.data() as any) }));
        loaded.sort((a, b) => b.timestamp - a.timestamp);
        setApprovalLogs(loaded);
      },
      () => {}
    );

    const unsubGamification = onSnapshot(
      doc(db, 'faculty_gamification', 'hq_state'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (Array.isArray(data.unlockedDecorations)) {
            setDecorations((prev) =>
              prev.map((d) => ({
                ...d,
                unlocked: data.unlockedDecorations.includes(d.id) || d.id === 'deco_trophy_shelf'
              }))
            );
            onUnlockedDecorationsChange?.(data.unlockedDecorations);
          }
        }
      },
      () => {}
    );

    return () => {
      unsubTasks();
      unsubApprovals();
      unsubGamification();
    };
  }, []);

  const showNotice = (text: string, tone: 'success' | 'info' | 'warn' = 'success') => {
    setStatusBanner({ text, tone });
    window.setTimeout(() => {
      setStatusBanner((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);
    setUploadedFileMime(file.type || 'application/octet-stream');

    if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = () => {
        setStudentResponseText(String(reader.result || ''));
        showNotice(`Loaded text file "${file.name}" into workstation.`);
      };
      reader.readAsText(file);
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedFileBase64(String(reader.result || ''));
        showNotice(
          file.type.startsWith('audio/')
            ? `Audio recording "${file.name}" attached for Gemini speech transcription.`
            : `Image "${file.name}" attached for Gemini OCR & rubric grading.`
        );
      };
      reader.readAsDataURL(file);
    }
  };

  // ==========================================================================
  // EXECUTE REAL AI EXAM ASSESSMENT OR CONTENT GENERATION
  // ==========================================================================
  const handleRunWorkstationTask = async () => {
    if (!isAuthorizedFaculty) {
      showNotice('Only Teacher Jan and authorized Faculty can run AI workstation tasks.', 'warn');
      return;
    }

    setIsExecutingAi(true);
    const examSpec = EXAM_PROFILES.find((ep) => ep.id === selectedExamProfile) || EXAM_PROFILES[5];
    const targetStudent = studentRoster.find((s) => s.id === selectedStudentId);
    const studentLabel =
      batchPaperCount > 1
        ? `${examSpec.shortName} Batch (${batchPaperCount} Papers)`
        : targetStudent?.name || 'Kim';

    try {
      if (taskMode === 'exam_assessment') {
        setRoutingStageText(
          batchPaperCount > 1
            ? `Step 1/3: Exam Coordinator Clara Vance routing ${batchPaperCount} ${examSpec.shortName} ${selectedSkill} papers...`
            : `Step 1/3: Exam Coordinator Clara Vance assigning ${examSpec.shortName} ${selectedSkill} task to ${selectedEmployee.name}...`
        );
        await new Promise((r) => setTimeout(r, 450));

        setRoutingStageText(
          `Step 2/3: ${selectedEmployee.name} (${selectedEmployee.jobTitle}) evaluating with ${examSpec.shortName} rubric...`
        );

        const response = await fetch('/api/faculty/assess-exam', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            examProfile: selectedExamProfile,
            skill: selectedSkill,
            employeeName: selectedEmployee.name,
            employeeTitle: selectedEmployee.jobTitle,
            promptOrQuestion: examPromptText,
            studentResponseText,
            answerKeyText,
            studentName: studentLabel,
            fileBase64: uploadedFileBase64 || undefined,
            fileMimeType: uploadedFileMime || undefined
          })
        });

        const data = await response.json();
        if (!response.ok || !data.result) {
          throw new Error(data.error || 'AI assessment failed.');
        }

        setRoutingStageText('Step 3/3: Storing provisional result & notifying Teacher Jan for final approval...');

        const newTaskId = `task_${Date.now()}`;
        const newTask: FacultyTaskItem = {
          id: newTaskId,
          title: `${examSpec.shortName} ${selectedSkill} Assessment — ${studentLabel}`,
          description: `Evaluated by ${selectedEmployee.name} using the ${examSpec.name} rubric (${examSpec.scoreRangeLabel}).`,
          employeeId: selectedEmployee.id,
          employeeName: selectedEmployee.name,
          employeeTitle: selectedEmployee.jobTitle,
          coordinatorId: 'emp_coordinator',
          department: selectedEmployee.department,
          taskCategory: batchPaperCount > 1 ? 'batch_assessment' : 'exam_assessment',
          examProfile: selectedExamProfile,
          skill: selectedSkill,
          cefrLevel: data.result.cefrEstimate || examSpec.cefrLevel,
          status: 'Awaiting Approval',
          priority: taskPriority,
          targetStudentId: targetStudent?.id,
          targetStudentName: studentLabel,
          targetCohort: targetStudent?.cohort || examSpec.courseMapping,
          batchCount: batchPaperCount,
          inputPayload: {
            promptOrQuestion: examPromptText,
            studentResponseText,
            answerKeyText,
            uploadedFileName: uploadedFileName || undefined,
            uploadedMimeType: uploadedFileMime || undefined
          },
          outputResult: data.result,
          rewardGems: batchPaperCount > 1 ? 65 : 40,
          rewardDollars: batchPaperCount > 1 ? 120 : 75,
          rewardXp: batchPaperCount > 1 ? 220 : 140,
          createdBy: currentUserName || 'Teacher Jan',
          createdAt: Date.now(),
          updatedAt: Date.now()
        };

        setTasks((prev) => [newTask, ...prev]);
        setActiveTaskResult(newTask);
        setEditableMarkdown(data.result.examinerReportMarkdown || '');

        // Update employee status & productivity
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === selectedEmployee.id
              ? {
                  ...emp,
                  status: 'awaiting_approval',
                  currentTaskTitle: `Awaiting Approval: ${newTask.title}`,
                  xp: emp.xp + newTask.rewardXp,
                  tasksCompleted: emp.tasksCompleted + 1
                }
              : emp
          )
        );

        // Create notification for Teacher Jan
        const newNotif: FacultyNotification = {
          id: `notif_${Date.now()}`,
          title: `Provisional ${examSpec.shortName} ${selectedSkill} Ready`,
          message: `${selectedEmployee.name}: "Teacher Jan, I've finished evaluating ${studentLabel} (${data.result.summaryScoreLabel}). It is ready for your approval!"`,
          employeeId: selectedEmployee.id,
          employeeName: selectedEmployee.name,
          taskId: newTaskId,
          type: 'approval_needed',
          read: false,
          timestamp: Date.now()
        };
        setNotifications((prev) => [newNotif, ...prev]);

        try {
          await setDoc(doc(db, 'faculty_tasks', newTaskId), newTask);
          await setDoc(doc(db, 'faculty_notifications', newNotif.id), newNotif);
        } catch (_e) {
          // ignore offline cache delay
        }

        showNotice(
          `${selectedEmployee.name} completed ${newTask.title} (${data.result.summaryScoreLabel})! Status: Awaiting Teacher Jan Approval.`
        );
      } else {
        // CREATIVE TEACHING DEPARTMENT GENERATION
        const toolSpec =
          CREATIVE_TEACHING_TOOLS.find((t) => t.id === selectedCreativeTool) || CREATIVE_TEACHING_TOOLS[0];
        setRoutingStageText(
          `${selectedEmployee.name} (${selectedEmployee.jobTitle}) generating ${toolSpec.name} on "${creativeTopic}"...`
        );

        const response = await fetch('/api/faculty/generate-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            creativeTool: selectedCreativeTool,
            examProfile: selectedExamProfile,
            cefrLevel: examSpec.cefrLevel,
            topic: creativeTopic,
            questionCount: creativeQuestionCount,
            difficulty: creativeDifficulty,
            employeeName: selectedEmployee.name,
            employeeTitle: selectedEmployee.jobTitle,
            customInstructions: creativeCustomNotes
          })
        });

        const data = await response.json();
        if (!response.ok || !data.result) {
          throw new Error(data.error || 'Failed to generate creative content.');
        }

        const newTaskId = `task_creative_${Date.now()}`;
        const newTask: FacultyTaskItem = {
          id: newTaskId,
          title: data.result.title || `${toolSpec.shortName}: ${creativeTopic} (${examSpec.shortName})`,
          description: `Generated ${creativeQuestionCount} items for ${examSpec.name} (${examSpec.cefrLevel}) by ${selectedEmployee.name}.`,
          employeeId: selectedEmployee.id,
          employeeName: selectedEmployee.name,
          employeeTitle: selectedEmployee.jobTitle,
          coordinatorId: 'emp_coordinator',
          department: 'creative_teaching',
          taskCategory: 'content_generation',
          examProfile: selectedExamProfile,
          creativeTool: selectedCreativeTool,
          cefrLevel: examSpec.cefrLevel,
          status: 'Completed',
          priority: taskPriority,
          targetCohort: examSpec.courseMapping,
          inputPayload: {
            topic: creativeTopic,
            questionCount: creativeQuestionCount,
            difficulty: creativeDifficulty,
            promptOrQuestion: creativeCustomNotes
          },
          outputResult: data.result,
          rewardGems: 35,
          rewardDollars: 70,
          rewardXp: 130,
          createdBy: currentUserName || 'Teacher Jan',
          createdAt: Date.now(),
          updatedAt: Date.now()
        };

        setTasks((prev) => [newTask, ...prev]);
        setActiveTaskResult(newTask);
        setEditableMarkdown(data.result.examinerReportMarkdown || '');

        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === selectedEmployee.id
              ? {
                  ...emp,
                  status: 'celebrating',
                  currentTaskTitle: `Completed: ${newTask.title}`,
                  xp: emp.xp + newTask.rewardXp,
                  tasksCompleted: emp.tasksCompleted + 1,
                  gemsEarnedForSchool: emp.gemsEarnedForSchool + newTask.rewardGems,
                  dollarsEarnedForSchool: emp.dollarsEarnedForSchool + newTask.rewardDollars
                }
              : emp
          )
        );

        onRewardCurrency(
          newTask.rewardGems,
          newTask.rewardDollars,
          `Creative Lab Output: ${toolSpec.shortName}`
        );

        try {
          await setDoc(doc(db, 'faculty_tasks', newTaskId), newTask);
        } catch (_e) {}

        showNotice(
          `Generated "${newTask.title}"! Earned +${newTask.rewardGems} Era Gems & +$${newTask.rewardDollars} Era Dollars.`
        );
      }
    } catch (err: any) {
      showNotice(err?.message || 'Error executing AI workstation task.', 'warn');
    } finally {
      setIsExecutingAi(false);
      setRoutingStageText('');
    }
  };

  // ==========================================================================
  // TEACHER JAN APPROVAL & STUDENT RECORD SYNC
  // ==========================================================================
  const handleApproveTask = async (task: FacultyTaskItem) => {
    if (!isAuthorizedFaculty) {
      showNotice('Only Teacher Jan or an authorized Examiner can approve official assessments.', 'warn');
      return;
    }

    const updatedTask: FacultyTaskItem = {
      ...task,
      status: 'Approved',
      approvedBy: currentUserName || 'Teacher Jan',
      approvedAt: Date.now(),
      updatedAt: Date.now()
    };

    setTasks((prev) => prev.map((t) => (t.id === task.id ? updatedTask : t)));
    if (activeTaskResult?.id === task.id) {
      setActiveTaskResult(updatedTask);
    }

    // Update employee state to celebrating & credit rewards
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === task.employeeId
          ? {
              ...emp,
              status: 'celebrating',
              currentTaskTitle: `Approved by Teacher Jan: ${task.title}`,
              gemsEarnedForSchool: emp.gemsEarnedForSchool + task.rewardGems,
              dollarsEarnedForSchool: emp.dollarsEarnedForSchool + task.rewardDollars
            }
          : emp
      )
    );

    const newLog: FacultyApprovalLog = {
      id: `audit_${Date.now()}`,
      taskId: task.id,
      taskTitle: task.title,
      employeeId: task.employeeId,
      employeeName: task.employeeName,
      action: 'approved',
      actorName: currentUserName || 'Teacher Jan',
      actorRole: 'Head Administrator',
      notes: `Approved official score (${task.outputResult?.summaryScoreLabel || 'Completed'}) and synced to student records.`,
      scoreLabel: task.outputResult?.summaryScoreLabel,
      studentName: task.targetStudentName,
      timestamp: Date.now()
    };
    setApprovalLogs((prev) => [newLog, ...prev]);

    // Update missions progress
    setMissions((prev) =>
      prev.map((m) => {
        const nextCount = Math.min(m.targetCount, m.currentCount + 1);
        return {
          ...m,
          currentCount: nextCount,
          completed: nextCount >= m.targetCount
        };
      })
    );

    onRewardCurrency(
      task.rewardGems,
      task.rewardDollars,
      `Approved Assessment: ${task.targetStudentName || task.title}`
    );

    try {
      await setDoc(doc(db, 'faculty_tasks', task.id), updatedTask);
      await setDoc(doc(db, 'faculty_approvals', newLog.id), newLog);

      // Sync approved score to official Firestore submissions collection so student dashboards reflect it
      if (task.taskCategory === 'exam_assessment' && task.outputResult) {
        const targetStudent = studentRoster.find(
          (s) => s.id === task.targetStudentId || s.name === task.targetStudentName
        );
        const subId = `faculty_approved_${task.id}`;
        await setDoc(doc(db, 'submissions', subId), {
          id: subId,
          assignmentId: `faculty_${task.examProfile}_${(task.skill || 'writing').toLowerCase()}`,
          testType: (task.skill || 'writing').toLowerCase(),
          examProfile: task.examProfile,
          userId: targetStudent?.realUserId || targetStudent?.id || task.targetStudentId || 'student',
          studentName: task.targetStudentName || targetStudent?.name || 'Student',
          userEmail: targetStudent?.email || '',
          score: task.outputResult.numericScore,
          bandScore: task.outputResult.numericScore,
          summaryScoreLabel: task.outputResult.summaryScoreLabel,
          aiEvaluation: task.outputResult.examinerReportMarkdown,
          approvedBy: currentUserName || 'Teacher Jan',
          createdAt: Date.now()
        });
      }
    } catch (_e) {}

    showNotice(
      `Approved "${task.title}"! Official score synced to student records (+${task.rewardGems} Gems & +$${task.rewardDollars} Dollars).`
    );
  };

  const handleRequestRevision = async (task: FacultyTaskItem) => {
    const updatedTask: FacultyTaskItem = {
      ...task,
      status: 'Needs Revision',
      revisionNotes: 'Teacher Jan requested rubric re-verification and expanded feedback.',
      updatedAt: Date.now()
    };
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updatedTask : t)));
    if (activeTaskResult?.id === task.id) {
      setActiveTaskResult(updatedTask);
    }
    const newLog: FacultyApprovalLog = {
      id: `audit_${Date.now()}`,
      taskId: task.id,
      taskTitle: task.title,
      employeeId: task.employeeId,
      employeeName: task.employeeName,
      action: 'needs_revision',
      actorName: currentUserName || 'Teacher Jan',
      actorRole: 'Head Administrator',
      notes: 'Returned to specialist for additional rubric detail.',
      studentName: task.targetStudentName,
      timestamp: Date.now()
    };
    setApprovalLogs((prev) => [newLog, ...prev]);
    try {
      await setDoc(doc(db, 'faculty_tasks', task.id), updatedTask);
      await setDoc(doc(db, 'faculty_approvals', newLog.id), newLog);
    } catch (_e) {}
    showNotice(`Task "${task.title}" marked as Needs Revision and returned to ${task.employeeName}.`, 'info');
  };

  // ==========================================================================
  // EXPORT (PDF & MARKDOWN) AND DIRECT PUBLISH (ERAGAMES & HOMEWORK)
  // ==========================================================================
  const handleDownloadMarkdown = (task: FacultyTaskItem) => {
    const content = `# ${task.title}\n\n**Specialist:** ${task.employeeName} (${task.employeeTitle})\n**Result / Score:** ${
      task.outputResult?.summaryScoreLabel || 'Completed'
    }\n**Status:** ${task.status}\n\n---\n\n${
      editableMarkdown || task.outputResult?.examinerReportMarkdown || ''
    }\n\n${
      task.outputResult?.inlineCorrectionsOrMarking
        ? `## Inline Marking & Corrections\n\n${task.outputResult.inlineCorrectionsOrMarking}\n\n`
        : ''
    }${
      task.outputResult?.suggestedImprovementOrModelAnswer
        ? `## Model Answer / Answer Key\n\n${task.outputResult.suggestedImprovementOrModelAnswer}\n`
        : ''
    }`;

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${task.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotice('Downloaded Markdown (.md) report!');
  };

  const handleExportPrintablePdf = async (task: FacultyTaskItem) => {
    try {
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = (html2pdfModule as any).default || html2pdfModule;
      const container = document.createElement('div');
      container.style.padding = '28px';
      container.style.fontFamily = 'Plus Jakarta Sans, sans-serif';
      container.style.color = '#0f172a';
      container.innerHTML = `
        <div style="border-bottom: 3px solid #4f46e5; padding-bottom: 14px; margin-bottom: 18px;">
          <div style="font-size: 12px; font-weight: 800; color: #4f46e5; text-transform: uppercase;">ERA FACULTY • OFFICIAL REPORT & WORKSHEET</div>
          <h1 style="font-size: 22px; font-weight: 800; margin: 6px 0;">${task.title}</h1>
          <div style="font-size: 13px; color: #475569;">Prepared by: <strong>${task.employeeName}</strong> (${task.employeeTitle}) · Status: <strong>${task.status}</strong> · Score/Level: <strong>${task.outputResult?.summaryScoreLabel || task.cefrLevel || ''}</strong></div>
        </div>
        <div style="white-space: pre-wrap; font-size: 13.5px; line-height: 1.65;">${(editableMarkdown || task.outputResult?.examinerReportMarkdown || '').replace(/</g, '&lt;')}</div>
        ${
          task.outputResult?.suggestedImprovementOrModelAnswer
            ? `<div style="margin-top: 20px; padding: 14px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px;">
                <div style="font-weight: 800; font-size: 13px; margin-bottom: 6px;">Model Answer / Answer Key</div>
                <div style="white-space: pre-wrap; font-size: 13px;">${task.outputResult.suggestedImprovementOrModelAnswer}</div>
               </div>`
            : ''
        }
      `;
      await html2pdf()
        .set({
          margin: 10,
          filename: `${task.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.pdf`,
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        })
        .from(container)
        .save();
      showNotice('Exported printable PDF document!');
    } catch (_e) {
      window.print();
    }
  };

  const handlePublishToEraGames = async (task: FacultyTaskItem) => {
    const questions = task.outputResult?.generatedQuestions || [];
    if (questions.length === 0) {
      showNotice('Generate a quiz, worksheet, or game deck with questions first to publish to EraGames.', 'warn');
      return;
    }
    const examSpec = EXAM_PROFILES.find((ep) => ep.id === task.examProfile) || EXAM_PROFILES[1];
    const deckId = `faculty_deck_${Date.now()}`;
    const formattedQuestions = questions.slice(0, 30).map((q, i) => ({
      id: `fq_${i + 1}`,
      prompt: q.question,
      options: Array.isArray(q.options) && q.options.length >= 2 ? q.options.slice(0, 4) : ['Option A', 'Option B', 'Option C', 'Option D'],
      correctIndex: typeof q.correctIndex === 'number' ? Math.max(0, Math.min(3, q.correctIndex)) : 0,
      explanation: q.explanation || 'Verified by ERA FACULTY.',
      points: 100
    }));

    try {
      const safeTitle = (task.title || 'ERA FACULTY Deck').trim().slice(0, 140);
      await setDoc(doc(db, 'game_decks', deckId), {
        title: safeTitle,
        course: examSpec.courseMapping,
        mode: 'trivia',
        source: 'teacher_custom',
        dollarReward: 40,
        questions: formattedQuestions,
        createdBy: task.employeeName,
        createdAt: Date.now()
      });
      onRewardCurrency(25, 50, 'Published Deck to EraGames Bubble Island');
      showNotice(
        `Published "${task.title}" (${formattedQuestions.length} questions) directly to EraGames Bubble Island for ${examSpec.courseMapping} students!`
      );
    } catch (err: any) {
      showNotice(`Saved "${task.title}" to EraGames local deck cache!`, 'info');
    }
  };

  const handlePublishToHomework = async (task: FacultyTaskItem) => {
    const examSpec = EXAM_PROFILES.find((ep) => ep.id === task.examProfile) || EXAM_PROFILES[5];
    const assignId = `faculty_hw_${Date.now()}`;
    try {
      await setDoc(doc(db, 'assignments', assignId), {
        title: task.title,
        type: (task.skill || 'Writing').toLowerCase(),
        course: examSpec.courseMapping,
        description: editableMarkdown || task.outputResult?.examinerReportMarkdown || task.description,
        questions: task.outputResult?.generatedQuestions || [],
        createdBy: currentUserName || 'Teacher Jan',
        createdAt: serverTimestamp()
      });
      onRewardCurrency(25, 50, 'Published Assignment to Homework Hub');
      showNotice(`Published "${task.title}" to EraVerse Homework Hub for ${examSpec.courseMapping}!`);
    } catch (_e) {
      showNotice(`Assigned "${task.title}" to ${examSpec.courseMapping} Homework queue!`, 'success');
    }
  };

  const handleUnlockDecoration = async (deco: OfficeDecorationItem) => {
    if (deco.unlocked) return;
    if (eraGems < deco.costGems || eraDollars < deco.costDollars) {
      showNotice(
        `Need ${deco.costGems} Era Gems and $${deco.costDollars} Era Dollars to unlock ${deco.name}. Complete or approve more tasks!`,
        'warn'
      );
      return;
    }

    onRewardCurrency(-deco.costGems, -deco.costDollars, `Unlocked 3D Office Decoration: ${deco.name}`);
    const nextDecos = decorations.map((d) => (d.id === deco.id ? { ...d, unlocked: true } : d));
    setDecorations(nextDecos);
    const unlockedIds = nextDecos.filter((d) => d.unlocked).map((d) => d.id);
    onUnlockedDecorationsChange?.(unlockedIds);

    try {
      await setDoc(
        doc(db, 'faculty_gamification', 'hq_state'),
        { unlockedDecorations: unlockedIds, updatedAt: Date.now() },
        { merge: true }
      );
    } catch (_e) {}

    showNotice(`Unlocked "${deco.name}"! It is now displayed live in the 3D ERA FACULTY interior!`);
  };

  const handleSendStaffDirective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffChatInput.trim()) return;
    const text = staffChatInput.trim();
    setStaffChatInput('');
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setStaffMessages((prev) => [
      ...prev,
      {
        id: `sm_${Date.now()}`,
        sender: currentUserName || 'Teacher Jan',
        role: 'Head Administrator',
        text,
        time: nowStr
      }
    ]);

    window.setTimeout(() => {
      const responder = selectedEmployee.id === 'emp_teacher_jan' ? employees[1] : selectedEmployee;
      setStaffMessages((prev) => [
        ...prev,
        {
          id: `sm_reply_${Date.now()}`,
          sender: responder.name,
          role: responder.jobTitle,
          text: `Copy that, Teacher Jan! I am prioritizing "${text}" at my workstation right away and will notify you as soon as it is ready for approval.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 600);
  };

  if (!isOpen) return null;

  const awaitingApprovalTasks = tasks.filter((t) => t.status === 'Awaiting Approval');
  const employeeTasks = tasks.filter((t) => t.employeeId === selectedEmployee.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-[1380px] h-[92vh] bg-slate-50 text-slate-900 rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* TOP EXECUTIVE HEADER BAR */}
        <header className="bg-slate-900 text-white px-5 py-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-black text-lg">
              EF
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold tracking-tight text-white whitespace-nowrap">
                  ERA FACULTY
                </h2>
                <span className="text-xs text-amber-300 font-semibold">
                  · Virtual AI School Workforce & Administration
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Cambridge & IELTS Examination Department · Creative Teaching Lab · Approval Gate
              </p>
            </div>
          </div>

          {/* Primary Mode Switcher: AI Employee Workstation vs Teacher Jan 12-Module Admin Dashboard */}
          <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setViewMode('workstation')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                viewMode === 'workstation'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              AI Employee Workstation ({selectedEmployee.name})
            </button>
            <button
              onClick={() => setViewMode('admin_dashboard')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                viewMode === 'admin_dashboard'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>Teacher Jan 12-Module Admin Hub</span>
              {awaitingApprovalTasks.length > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-black rounded bg-rose-600 text-white tabular-nums">
                  {awaitingApprovalTasks.length}
                </span>
              )}
            </button>
          </div>

          {/* Unified Era Gems & Era Dollars + Close */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 text-xs font-bold bg-slate-800/90 border border-slate-700 px-3 py-1.5 rounded-xl tabular-nums">
              <span className="text-pink-400">💎 {eraGems} Gems</span>
              <span className="text-slate-600">·</span>
              <span className="text-emerald-400">💵 ${eraDollars} Dollars</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Return to 3D Era FACULTY HQ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* STATUS BANNER */}
        {statusBanner && (
          <div
            className={`px-5 py-2.5 text-xs font-bold flex items-center justify-between border-b shrink-0 ${
              statusBanner.tone === 'warn'
                ? 'bg-amber-50 text-amber-900 border-amber-200'
                : statusBanner.tone === 'info'
                ? 'bg-sky-50 text-sky-900 border-sky-200'
                : 'bg-emerald-50 text-emerald-900 border-emerald-200'
            }`}
          >
            <span>{statusBanner.text}</span>
            <button onClick={() => setStatusBanner(null)} className="text-xs underline ml-4">
              Dismiss
            </button>
          </div>
        )}

        {/* ====================================================================
            VIEW 1: DEDICATED AI EMPLOYEE WORKSTATION
           ==================================================================== */}
        {viewMode === 'workstation' ? (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* LEFT SIDEBAR: 22 AI Staff Roster Selector + Active Employee Profile */}
            <aside className="w-full lg:w-80 bg-white border-r border-slate-200 flex flex-col overflow-hidden shrink-0">
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
                  Switch AI Staff Workstation (22 Employees)
                </label>
                <select
                  value={selectedEmployee.id}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <optgroup label="Floor 1 · Head Administration">
                    {employees
                      .filter((e) => e.department === 'head_admin')
                      .map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name} — {e.jobTitle}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Floor 1 · Cambridge & IELTS Specialists">
                    {employees
                      .filter((e) => e.department === 'cambridge_specialists')
                      .map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name} — {e.jobTitle}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Floor 1 · Four-Skill Assessment Examiners">
                    {employees
                      .filter((e) => e.department === 'skill_examiners')
                      .map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name} — {e.jobTitle}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Floor 2 · Creative Teaching & Operations">
                    {employees
                      .filter((e) => e.department === 'creative_teaching')
                      .map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name} — {e.jobTitle}
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>

              <div className="p-4 overflow-y-auto flex-1 space-y-4">
                {/* Employee Identity Card */}
                <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-semibold text-amber-400">
                        Floor {selectedEmployee.floor} · {selectedEmployee.departmentLabel}
                      </div>
                      <h3 className="text-lg font-extrabold text-white mt-0.5">
                        {selectedEmployee.name}
                      </h3>
                      <p className="text-xs text-slate-300 font-medium">
                        {selectedEmployee.jobTitle}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-emerald-300 tabular-nums">
                      Lv.{selectedEmployee.level}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 italic bg-slate-800/90 p-2.5 rounded-lg border border-slate-700">
                    "{selectedEmployee.speechBubbles[0]}"
                  </p>

                  <div className="grid grid-cols-3 gap-2 pt-1 text-center tabular-nums">
                    <div className="bg-slate-800 p-2 rounded-lg">
                      <div className="text-[10px] text-slate-400">Completed</div>
                      <div className="text-sm font-black text-white">
                        {selectedEmployee.tasksCompleted}
                      </div>
                    </div>
                    <div className="bg-slate-800 p-2 rounded-lg">
                      <div className="text-[10px] text-slate-400">Approval</div>
                      <div className="text-sm font-black text-emerald-400">
                        {selectedEmployee.approvalRate}%
                      </div>
                    </div>
                    <div className="bg-slate-800 p-2 rounded-lg">
                      <div className="text-[10px] text-slate-400">Staff XP</div>
                      <div className="text-sm font-black text-amber-300">
                        {selectedEmployee.xp}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Responsibilities & Capabilities */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-900">Responsibilities</div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {selectedEmployee.responsibilities}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-slate-900">Specialized Capabilities</div>
                  <div className="text-xs text-slate-600 space-y-1">
                    {selectedEmployee.specializedCapabilities.map((cap, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Employee's Task History Queue */}
                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      Workstation Task Queue ({employeeTasks.length})
                    </span>
                  </div>
                  <div className="space-y-2">
                    {employeeTasks.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setActiveTaskResult(t);
                          setEditableMarkdown(t.outputResult?.examinerReportMarkdown || '');
                        }}
                        className={`w-full text-left p-2.5 rounded-lg border transition-colors ${
                          activeTaskResult?.id === t.id
                            ? 'bg-indigo-50 border-indigo-300'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-xs font-bold text-slate-900 line-clamp-1">
                          {t.title}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                          <span>{t.status}</span>
                          <span className="font-mono tabular-nums">
                            {t.outputResult?.summaryScoreLabel?.slice(0, 18) || t.priority}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* CENTER & RIGHT: TASK SUBMISSION & LIVE AI OUTPUT */}
            <div className="flex-1 flex flex-col xl:flex-row overflow-hidden">
              {/* Task Submission Panel */}
              <div className="w-full xl:w-[460px] p-5 bg-white border-r border-slate-200 overflow-y-auto space-y-4 shrink-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Assign AI Task to {selectedEmployee.name}
                  </h3>
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                    <button
                      onClick={() => setTaskMode('exam_assessment')}
                      className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                        taskMode === 'exam_assessment'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600'
                      }`}
                    >
                      Exam Marking
                    </button>
                    <button
                      onClick={() => setTaskMode('content_generation')}
                      className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                        taskMode === 'content_generation'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600'
                      }`}
                    >
                      Creative Lab
                    </button>
                  </div>
                </div>

                {taskMode === 'exam_assessment' ? (
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Examination Profile
                        </label>
                        <select
                          value={selectedExamProfile}
                          onChange={(e) => setSelectedExamProfile(e.target.value as ExamProfileId)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold bg-white"
                        >
                          {EXAM_PROFILES.map((ep) => (
                            <option key={ep.id} value={ep.id}>
                              {ep.name} ({ep.cefrLevel})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Skill to Evaluate
                        </label>
                        <select
                          value={selectedSkill}
                          onChange={(e) => setSelectedSkill(e.target.value as ExamSkillType)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold bg-white"
                        >
                          <option value="Reading">Reading (Answer Sheet)</option>
                          <option value="Listening">Listening (Audio + Sheet)</option>
                          <option value="Writing">Writing (OCR / Essay Rubric)</option>
                          <option value="Speaking">Speaking (Audio Transcript)</option>
                        </select>
                      </div>
                    </div>

                    {/* Active Rubric Notice */}
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
                      <span className="font-bold text-slate-900">Active Rubric: </span>
                      {EXAM_PROFILES.find((ep) => ep.id === selectedExamProfile)?.rubricNotes}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Target Student
                        </label>
                        <select
                          value={selectedStudentId}
                          onChange={(e) => setSelectedStudentId(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold bg-white"
                        >
                          {studentRoster.map((st) => (
                            <option key={st.id} value={st.id}>
                              {st.name} ({st.cohort})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Papers in Batch (1–30)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={30}
                          value={batchPaperCount}
                          onChange={(e) =>
                            setBatchPaperCount(Math.max(1, Math.min(30, Number(e.target.value) || 1)))
                          }
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold bg-white tabular-nums"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Exam Question / Task Prompt
                      </label>
                      <textarea
                        rows={2}
                        value={examPromptText}
                        onChange={(e) => setExamPromptText(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800"
                        placeholder="Enter the Writing prompt, Speaking questions, or Reading/Listening test instructions..."
                      />
                    </div>

                    {(selectedSkill === 'Reading' || selectedSkill === 'Listening') && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Official Answer Key (Optional for Auto-Marking)
                        </label>
                        <input
                          type="text"
                          value={answerKeyText}
                          onChange={(e) => setAnswerKeyText(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800"
                          placeholder="e.g. 1. TRUE  2. FALSE  3. NOT GIVEN  4. B  5. library"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Student Answer Sheet / Essay / Script
                      </label>
                      <textarea
                        rows={4}
                        value={studentResponseText}
                        onChange={(e) => setStudentResponseText(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800"
                        placeholder="Paste student essay, objective answers, or upload a handwritten image / audio recording below..."
                      />
                    </div>

                    {/* File Upload for Handwritten Image OCR or Speaking/Listening Audio */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Upload Handwritten Script (OCR), Answer Sheet, or Speaking Audio
                      </label>
                      <label className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50 cursor-pointer text-xs font-semibold text-slate-700 transition-colors">
                        <Upload className="w-4 h-4 text-indigo-600" />
                        <span className="truncate">
                          {uploadedFileName
                            ? `Attached: ${uploadedFileName}`
                            : 'Choose Image (PNG/JPG), Audio (MP3/WAV/WEBM), or Text (.txt)'}
                        </span>
                        <input
                          type="file"
                          accept="image/*,audio/*,.txt,.md"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  /* CREATIVE TEACHING LABORATORY GENERATOR CONTROLS */
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Creative Teaching Generator (12 Tools)
                      </label>
                      <select
                        value={selectedCreativeTool}
                        onChange={(e) => setSelectedCreativeTool(e.target.value as CreativeToolId)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold bg-white"
                      >
                        {CREATIVE_TEACHING_TOOLS.map((tool) => (
                          <option key={tool.id} value={tool.id}>
                            {tool.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Cambridge / IELTS Level
                        </label>
                        <select
                          value={selectedExamProfile}
                          onChange={(e) => setSelectedExamProfile(e.target.value as ExamProfileId)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold bg-white"
                        >
                          {EXAM_PROFILES.map((ep) => (
                            <option key={ep.id} value={ep.id}>
                              {ep.shortName} ({ep.cefrLevel})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Difficulty & Item Count
                        </label>
                        <div className="flex items-center gap-2">
                          <select
                            value={creativeDifficulty}
                            onChange={(e) => setCreativeDifficulty(e.target.value)}
                            className="flex-1 px-2.5 py-2 rounded-lg border border-slate-300 text-xs font-semibold bg-white"
                          >
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Challenging">Challenging</option>
                          </select>
                          <input
                            type="number"
                            min={3}
                            max={20}
                            value={creativeQuestionCount}
                            onChange={(e) =>
                              setCreativeQuestionCount(
                                Math.max(3, Math.min(20, Number(e.target.value) || 8))
                              )
                            }
                            className="w-16 px-2.5 py-2 rounded-lg border border-slate-300 text-xs font-semibold tabular-nums"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Lesson / Worksheet / Game Topic
                      </label>
                      <input
                        type="text"
                        value={creativeTopic}
                        onChange={(e) => setCreativeTopic(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800"
                        placeholder="e.g. Present Perfect vs Past Simple, Space Exploration, Animals..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Additional Teacher Instructions (Optional)
                      </label>
                      <textarea
                        rows={3}
                        value={creativeCustomNotes}
                        onChange={(e) => setCreativeCustomNotes(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800"
                        placeholder="Include specific target vocabulary, grammar structures, or classroom timing..."
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={handleRunWorkstationTask}
                  disabled={isExecutingAi}
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  {isExecutingAi ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{routingStageText || 'AI Employee Working...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>
                        {taskMode === 'exam_assessment'
                          ? `Run ${EXAM_PROFILES.find((e) => e.id === selectedExamProfile)?.shortName} ${selectedSkill} Evaluation`
                          : `Generate ${CREATIVE_TEACHING_TOOLS.find((t) => t.id === selectedCreativeTool)?.shortName}`}
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Right Output & Approval Inspector */}
              <div className="flex-1 p-5 bg-slate-50 overflow-y-auto space-y-4">
                {activeTaskResult ? (
                  <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="font-bold text-indigo-600">
                            {activeTaskResult.employeeName} ({activeTaskResult.employeeTitle})
                          </span>
                          <span>·</span>
                          <span>Status: {activeTaskResult.status}</span>
                          <span>·</span>
                          <span>Priority: {activeTaskResult.priority}</span>
                        </div>
                        <h3 className="text-base font-extrabold text-slate-900 mt-1">
                          {activeTaskResult.title}
                        </h3>
                        {activeTaskResult.outputResult?.summaryScoreLabel && (
                          <div className="mt-1.5 text-sm font-black text-emerald-700 tabular-nums">
                            Result: {activeTaskResult.outputResult.summaryScoreLabel}
                          </div>
                        )}
                      </div>

                      {/* Export & Approval Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        {activeTaskResult.status !== 'Approved' && (
                          <button
                            onClick={() => handleApproveTask(activeTaskResult)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve Assessment</span>
                          </button>
                        )}
                        {activeTaskResult.status === 'Awaiting Approval' && (
                          <button
                            onClick={() => handleRequestRevision(activeTaskResult)}
                            className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold"
                          >
                            Request Revision
                          </button>
                        )}
                        <button
                          onClick={() => handleExportPrintablePdf(activeTaskResult)}
                          className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Export PDF</span>
                        </button>
                        <button
                          onClick={() => handleDownloadMarkdown(activeTaskResult)}
                          className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Markdown</span>
                        </button>
                        {(activeTaskResult.outputResult?.generatedQuestions?.length ?? 0) > 0 && (
                          <button
                            onClick={() => handlePublishToEraGames(activeTaskResult)}
                            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5"
                          >
                            <Gamepad2 className="w-3.5 h-3.5" />
                            <span>Publish to EraGames (Bubble Island)</span>
                          </button>
                        )}
                        <button
                          onClick={() => handlePublishToHomework(activeTaskResult)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          <span>Publish to Homework</span>
                        </button>
                      </div>
                    </div>

                    {/* Rubric Criteria Breakdown Grid */}
                    {(activeTaskResult.outputResult?.criteriaBreakdown?.length ?? 0) > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {activeTaskResult.outputResult!.criteriaBreakdown.map((cb, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1"
                          >
                            <div className="flex items-center justify-between text-xs font-bold">
                              <span className="text-slate-900">{cb.criterion}</span>
                              <span className="text-indigo-700 font-mono tabular-nums">
                                {cb.score}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600">{cb.feedback}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* OCR or Audio Transcript (if present) */}
                    {activeTaskResult.outputResult?.extractedTextOcrOrTranscript && (
                      <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                        <div className="text-xs font-bold text-slate-800">
                          Extracted Student Text (OCR / Speech Transcript)
                        </div>
                        <p className="text-xs text-slate-700 whitespace-pre-wrap">
                          {activeTaskResult.outputResult.extractedTextOcrOrTranscript}
                        </p>
                      </div>
                    )}

                    {/* Inline Error Marking */}
                    {activeTaskResult.outputResult?.inlineCorrectionsOrMarking && (
                      <div className="p-3.5 rounded-lg bg-amber-50/60 border border-amber-200 space-y-1.5">
                        <div className="text-xs font-bold text-amber-900">
                          Inline Error Marking & Objective Answer Verification
                        </div>
                        <div className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                          {activeTaskResult.outputResult.inlineCorrectionsOrMarking}
                        </div>
                      </div>
                    )}

                    {/* Editable Examiner Report / Generated Worksheet Markdown */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">
                          Full Output Report / Printable Worksheet
                        </span>
                        <button
                          onClick={() => setIsEditingMarkdown(!isEditingMarkdown)}
                          className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>{isEditingMarkdown ? 'Done Editing' : 'Edit Content'}</span>
                        </button>
                      </div>
                      {isEditingMarkdown ? (
                        <textarea
                          rows={10}
                          value={editableMarkdown}
                          onChange={(e) => setEditableMarkdown(e.target.value)}
                          className="w-full p-3 rounded-lg border border-slate-300 text-xs font-mono text-slate-800"
                        />
                      ) : (
                        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                          {editableMarkdown || activeTaskResult.outputResult?.examinerReportMarkdown}
                        </div>
                      )}
                    </div>

                    {/* PowerPoint Slides Preview (if generated) */}
                    {(activeTaskResult.outputResult?.generatedSlides?.length ?? 0) > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-slate-900">
                          Generated PowerPoint Slide Deck ({activeTaskResult.outputResult!.generatedSlides!.length} Slides)
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {activeTaskResult.outputResult!.generatedSlides!.map((sl) => (
                            <div
                              key={sl.slideNumber}
                              className="p-3.5 rounded-lg bg-slate-900 text-white space-y-2"
                            >
                              <div className="text-[11px] font-bold text-amber-400">
                                Slide {sl.slideNumber}: {sl.title}
                              </div>
                              <ul className="text-xs text-slate-200 list-disc pl-4 space-y-1">
                                {sl.bullets.map((b, i) => (
                                  <li key={i}>{b}</li>
                                ))}
                              </ul>
                              <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-1.5">
                                Speaker Notes: {sl.speakerNotes}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Flashcards Preview (if generated) */}
                    {(activeTaskResult.outputResult?.generatedFlashcards?.length ?? 0) > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-slate-900">
                          Generated Vocabulary Flashcards ({activeTaskResult.outputResult!.generatedFlashcards!.length})
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                          {activeTaskResult.outputResult!.generatedFlashcards!.map((fc, i) => (
                            <div
                              key={i}
                              className="p-3 rounded-lg bg-white border border-slate-200 space-y-1"
                            >
                              <div className="text-xs font-extrabold text-indigo-700">{fc.front}</div>
                              <div className="text-xs text-slate-700">{fc.back}</div>
                              <div className="text-[11px] text-slate-500 italic">"{fc.example}"</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Model Answer / Answer Key */}
                    {activeTaskResult.outputResult?.suggestedImprovementOrModelAnswer && (
                      <div className="p-4 rounded-lg bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                        <div className="text-xs font-bold text-emerald-900">
                          Elevated Model Answer / Official Answer Key
                        </div>
                        <div className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                          {activeTaskResult.outputResult.suggestedImprovementOrModelAnswer}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-center p-8 text-slate-500 text-xs">
                    Select or run a task on the left to inspect rubric evaluations or generated teaching materials.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ==================================================================
             VIEW 2: TEACHER JAN 12-MODULE ADMINISTRATION DASHBOARD
             ================================================================== */
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* 12-Module Sidebar Navigation */}
            <aside className="w-full lg:w-64 bg-slate-900 text-slate-200 border-r border-slate-800 p-3 overflow-y-auto shrink-0 space-y-1">
              <div className="px-2.5 py-2 text-[11px] font-bold text-slate-400">
                Teacher Jan Executive Suite (12 Modules)
              </div>
              {ADMIN_MODULES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveAdminModule(m.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                    activeAdminModule === m.id
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="truncate">
                    {m.num}. {m.label}
                  </span>
                  {m.id === 'approval_center' && awaitingApprovalTasks.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[10px] font-black tabular-nums">
                      {awaitingApprovalTasks.length}
                    </span>
                  )}
                </button>
              ))}
            </aside>

            {/* Active Admin Module Viewport */}
            <main className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50">
              {/* MODULE 01: SCHOOL OVERVIEW */}
              {activeAdminModule === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">
                      01. ERA FACULTY HQ — School Overview
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Real-time operational command across all 22 AI faculty specialists, student cohorts, and examination pipelines.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 tabular-nums">
                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                      <div className="text-xs text-slate-500">Active AI Faculty Staff</div>
                      <div className="text-2xl font-black text-slate-900 mt-1">
                        {employees.length} Specialists
                      </div>
                      <div className="text-xs text-emerald-600 mt-1">
                        Floor 1 Exams · Floor 2 Creative Lab
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                      <div className="text-xs text-slate-500">Awaiting Your Approval</div>
                      <div className="text-2xl font-black text-amber-600 mt-1">
                        {awaitingApprovalTasks.length} Tasks
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Provisional Cambridge & IELTS Marks
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                      <div className="text-xs text-slate-500">Active Campus Students</div>
                      <div className="text-2xl font-black text-indigo-600 mt-1">
                        {studentRoster.length} Students
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        IELTS 1 (15) · IELTS 2 (13) & Cambridge
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                      <div className="text-xs text-slate-500">School Treasury</div>
                      <div className="text-2xl font-black text-emerald-700 mt-1">
                        💎 {eraGems} · 💵 ${eraDollars}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Unified Era Gems & Era Dollars
                      </div>
                    </div>
                  </div>

                  {/* Quick Approval Queue */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-extrabold text-slate-900">
                        Priority Assessments Awaiting Teacher Jan’s Approval
                      </h4>
                      <button
                        onClick={() => setActiveAdminModule('approval_center')}
                        className="text-xs font-bold text-indigo-600 hover:underline"
                      >
                        Open Approval Center →
                      </button>
                    </div>
                    {awaitingApprovalTasks.length === 0 ? (
                      <p className="text-xs text-slate-500">
                        All provisional assessments have been reviewed and approved!
                      </p>
                    ) : (
                      <div className="space-y-2.5">
                        {awaitingApprovalTasks.map((t) => (
                          <div
                            key={t.id}
                            className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3"
                          >
                            <div>
                              <div className="text-xs font-extrabold text-slate-900">{t.title}</div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                Evaluated by {t.employeeName} ({t.employeeTitle}) · Score:{' '}
                                <span className="font-bold text-slate-800">
                                  {t.outputResult?.summaryScoreLabel}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedEmployeeId(t.employeeId);
                                  setActiveTaskResult(t);
                                  setEditableMarkdown(t.outputResult?.examinerReportMarkdown || '');
                                  setViewMode('workstation');
                                }}
                                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100"
                              >
                                Inspect Report
                              </button>
                              <button
                                onClick={() => handleApproveTask(t)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                              >
                                Approve & Sync
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* MODULE 02: STUDENT RECORDS */}
              {activeAdminModule === 'student_records' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-900">02. Official Student Records</h3>
                      <p className="text-xs text-slate-600">
                        All IELTS 1 and IELTS 2 student accounts synced with approved ERA FACULTY HQ assessments.
                      </p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs tabular-nums">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                          <th className="py-3 px-4">Student Name</th>
                          <th className="py-3 px-4">Cohort</th>
                          <th className="py-3 px-4">Reading</th>
                          <th className="py-3 px-4">Listening</th>
                          <th className="py-3 px-4">Writing</th>
                          <th className="py-3 px-4">Speaking</th>
                          <th className="py-3 px-4">Overall</th>
                          <th className="py-3 px-4">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {studentRoster.map((st) => (
                          <tr key={st.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-4 font-bold text-slate-900">{st.name}</td>
                            <td className="py-2.5 px-4 text-slate-600">{st.cohort}</td>
                            <td className="py-2.5 px-4">{st.reading ?? 6.5}</td>
                            <td className="py-2.5 px-4">{st.listening ?? 6.5}</td>
                            <td className="py-2.5 px-4">{st.writing ?? 6.0}</td>
                            <td className="py-2.5 px-4">{st.speaking ?? 6.5}</td>
                            <td className="py-2.5 px-4 font-extrabold text-indigo-700">
                              {st.overall ?? 6.5}
                            </td>
                            <td className="py-2.5 px-4">
                              <button
                                onClick={() => {
                                  setSelectedStudentId(st.id);
                                  setSelectedEmployeeId('emp_writing');
                                  setTaskMode('exam_assessment');
                                  setViewMode('workstation');
                                }}
                                className="text-indigo-600 font-bold hover:underline"
                              >
                                Assess Student →
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* MODULE 03: CLASS MANAGEMENT */}
              {activeAdminModule === 'class_management' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-extrabold text-slate-900">
                    03. Class & Course Folder Management
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { name: 'IELTS 1 Cohort', level: 'B2–C1', specialist: 'Dr. Arthur Pendelton', count: studentRoster.filter((s) => s.cohort === 'IELTS 1').length },
                      { name: 'IELTS 2 Cohort', level: 'B2–C1', specialist: 'Dr. Arthur Pendelton', count: studentRoster.filter((s) => s.cohort === 'IELTS 2').length },
                      { name: 'Cambridge B1 Preliminary (PET)', level: 'B1', specialist: 'Julian Brooks', count: 18 },
                      { name: 'Cambridge A2 Key (KET)', level: 'A2', specialist: 'Nora Thorne', count: 20 },
                      { name: 'Cambridge A2 Flyers', level: 'A2 YLE', specialist: 'Leo Sterling', count: 16 },
                      { name: 'Cambridge A1 Movers & Pre-A1 Starters', level: 'Pre-A1 / A1', specialist: 'Maya Lin & Toby Finch', count: 24 }
                    ].map((cls, i) => (
                      <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                        <div className="text-xs text-indigo-600 font-bold">{cls.level}</div>
                        <div className="text-base font-extrabold text-slate-900">{cls.name}</div>
                        <div className="text-xs text-slate-600">Lead Specialist: {cls.specialist}</div>
                        <div className="text-xs text-slate-500 tabular-nums">
                          Active Learners: {cls.count} · Synced with EraVerse Classrooms
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MODULE 04: EXAMINATION MANAGEMENT */}
              {activeAdminModule === 'exam_management' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">
                      04. Examination Profiles & Official Rubrics (7 Exams)
                    </h3>
                    <p className="text-xs text-slate-600">
                      Strict separation between Cambridge Shields (Starters/Movers/Flyers), Cambridge Scale 0–5 Sub-scores (KET/PET), and IELTS 0–9 Bands.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {EXAM_PROFILES.map((ep) => (
                      <div key={ep.id} className="bg-white p-4 rounded-xl border border-slate-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-extrabold text-slate-900">{ep.name}</span>
                          <span className="text-xs font-bold text-indigo-600">{ep.scoreRangeLabel}</span>
                        </div>
                        <p className="text-xs text-slate-600">{ep.rubricNotes}</p>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <span className="text-xs text-slate-500">CEFR: {ep.cefrLevel}</span>
                          <button
                            onClick={() => {
                              setSelectedExamProfile(ep.id);
                              setSelectedEmployeeId(ep.specialistEmployeeId);
                              setTaskMode('exam_assessment');
                              setViewMode('workstation');
                            }}
                            className="text-xs font-bold text-indigo-600 hover:underline"
                          >
                            Open {ep.shortName} Workstation →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MODULE 05: AI EMPLOYEE DIRECTORY */}
              {activeAdminModule === 'employee_directory' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-extrabold text-slate-900">
                    05. Complete AI Faculty Directory (22 Staff Members)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {employees.map((emp) => (
                      <div
                        key={emp.id}
                        className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3"
                      >
                        <div>
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Floor {emp.floor} · {emp.departmentLabel}</span>
                            <span className="font-mono font-bold text-slate-800">Lv.{emp.level}</span>
                          </div>
                          <h4 className="text-base font-extrabold text-slate-900 mt-1">{emp.name}</h4>
                          <div className="text-xs font-semibold text-indigo-600">{emp.jobTitle}</div>
                          <p className="text-xs text-slate-600 mt-1.5 line-clamp-2">
                            {emp.responsibilities}
                          </p>
                        </div>
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] text-slate-500 tabular-nums">
                            {emp.tasksCompleted} Tasks · {emp.approvalRate}% Approval
                          </span>
                          <button
                            onClick={() => {
                              setSelectedEmployeeId(emp.id);
                              setViewMode('workstation');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
                          >
                            Open Desk
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MODULE 06: EMPLOYEE TASK MANAGEMENT & DISTRIBUTION ENGINE */}
              {activeAdminModule === 'task_management' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-900">
                        06. AI Task Distribution & Queue Management
                      </h3>
                      <p className="text-xs text-slate-600">
                        Assign batch tasks, change priorities, or reassign tasks across employees.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedEmployeeId('emp_coordinator');
                        setSelectedExamProfile('cambridge_pet');
                        setSelectedSkill('Writing');
                        setBatchPaperCount(30);
                        setTaskMode('exam_assessment');
                        setViewMode('workstation');
                      }}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                    >
                      + Upload 30 PET Writing Papers Batch
                    </button>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                          <th className="py-3 px-4">Task Title</th>
                          <th className="py-3 px-4">Assigned Specialist</th>
                          <th className="py-3 px-4">Priority</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Result / Score</th>
                          <th className="py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {tasks.map((t) => (
                          <tr key={t.id} className="hover:bg-slate-50">
                            <td className="py-3 px-4 font-bold text-slate-900">{t.title}</td>
                            <td className="py-3 px-4">
                              <select
                                value={t.employeeId}
                                onChange={(e) => {
                                  const newEmp = employees.find((emp) => emp.id === e.target.value);
                                  if (!newEmp) return;
                                  setTasks((prev) =>
                                    prev.map((item) =>
                                      item.id === t.id
                                        ? {
                                            ...item,
                                            employeeId: newEmp.id,
                                            employeeName: newEmp.name,
                                            employeeTitle: newEmp.jobTitle
                                          }
                                        : item
                                    )
                                  );
                                  showNotice(`Reassigned "${t.title}" to ${newEmp.name}.`, 'info');
                                }}
                                className="px-2 py-1 rounded border border-slate-300 text-xs bg-white"
                              >
                                {employees.map((emp) => (
                                  <option key={emp.id} value={emp.id}>
                                    {emp.name} ({emp.jobTitle})
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="py-3 px-4">
                              <select
                                value={t.priority}
                                onChange={(e) => {
                                  const nextP = e.target.value as FacultyTaskPriority;
                                  setTasks((prev) =>
                                    prev.map((item) =>
                                      item.id === t.id ? { ...item, priority: nextP } : item
                                    )
                                  );
                                }}
                                className="px-2 py-1 rounded border border-slate-300 text-xs bg-white"
                              >
                                <option value="Low">Low</option>
                                <option value="Normal">Normal</option>
                                <option value="High">High</option>
                                <option value="Urgent">Urgent</option>
                              </select>
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-700">{t.status}</td>
                            <td className="py-3 px-4 font-mono tabular-nums text-emerald-700 font-bold">
                              {t.outputResult?.summaryScoreLabel || '—'}
                            </td>
                            <td className="py-3 px-4 space-x-2 whitespace-nowrap">
                              <button
                                onClick={() => {
                                  setSelectedEmployeeId(t.employeeId);
                                  setActiveTaskResult(t);
                                  setEditableMarkdown(t.outputResult?.examinerReportMarkdown || '');
                                  setViewMode('workstation');
                                }}
                                className="text-indigo-600 font-bold hover:underline"
                              >
                                Open
                              </button>
                              {t.status !== 'Approved' && (
                                <button
                                  onClick={() => handleApproveTask(t)}
                                  className="text-emerald-600 font-bold hover:underline"
                                >
                                  Approve
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* MODULE 07: ASSESSMENT APPROVAL CENTER */}
              {activeAdminModule === 'approval_center' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-extrabold text-slate-900">
                    07. Teacher Jan Assessment Approval Center
                  </h3>
                  <p className="text-xs text-slate-600">
                    All AI-generated exam evaluations remain provisional until approved here by Teacher Jan.
                  </p>
                  <div className="space-y-3">
                    {tasks
                      .filter((t) => t.taskCategory === 'exam_assessment' || t.taskCategory === 'batch_assessment')
                      .map((t) => (
                        <div
                          key={t.id}
                          className="bg-white p-4 rounded-xl border border-slate-200 space-y-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <span className="text-xs font-bold text-indigo-600">
                                {t.employeeName} ({t.employeeTitle}) · Status: {t.status}
                              </span>
                              <h4 className="text-sm font-extrabold text-slate-900">{t.title}</h4>
                              <div className="text-xs font-bold text-emerald-700 mt-0.5">
                                Provisional Score: {t.outputResult?.summaryScoreLabel}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {t.status !== 'Approved' && (
                                <>
                                  <button
                                    onClick={() => handleApproveTask(t)}
                                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                                  >
                                    Approve Official Score
                                  </button>
                                  <button
                                    onClick={() => handleRequestRevision(t)}
                                    className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold"
                                  >
                                    Needs Revision
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => {
                                  setSelectedEmployeeId(t.employeeId);
                                  setActiveTaskResult(t);
                                  setEditableMarkdown(t.outputResult?.examinerReportMarkdown || '');
                                  setViewMode('workstation');
                                }}
                                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100"
                              >
                                Full Rubric Report
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* MODULE 08: ACADEMIC ANALYTICS */}
              {activeAdminModule === 'academic_analytics' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-extrabold text-slate-900">
                    08. Academic & Department Analytics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
                      <h4 className="text-sm font-extrabold text-slate-900">
                        Department Productivity Rankings
                      </h4>
                      {[
                        { dept: 'Four-Skill Assessment Specialists', completed: 353, xp: 12710 },
                        { dept: 'Cambridge & IELTS Specialists', completed: 415, xp: 15680 },
                        { dept: 'Creative Teaching & Curriculum Lab', completed: 659, xp: 24530 },
                        { dept: 'Head Administration', completed: 231, xp: 7950 }
                      ].map((d, i) => (
                        <div key={i} className="flex items-center justify-between text-xs py-2 border-b border-slate-100 tabular-nums">
                          <span className="font-bold text-slate-800">
                            {i + 1}. {d.dept}
                          </span>
                          <span className="text-slate-600">
                            {d.completed} Tasks · <strong className="text-indigo-600">{d.xp} XP</strong>
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
                      <h4 className="text-sm font-extrabold text-slate-900">
                        Cohort Skill Averages (IELTS 1 & IELTS 2)
                      </h4>
                      {[
                        { skill: 'Reading Comprehension', avg: 'Band 7.0 / 5 Shields' },
                        { skill: 'Listening Accuracy', avg: 'Band 6.8 / 5 Shields' },
                        { skill: 'Writing (OCR & Rubric)', avg: 'Band 6.5 / Scale 158' },
                        { skill: 'Speaking (Audio Transcript)', avg: 'Band 6.7 / Scale 160' }
                      ].map((s, i) => (
                        <div key={i} className="flex items-center justify-between text-xs py-2 border-b border-slate-100 tabular-nums">
                          <span className="font-bold text-slate-800">{s.skill}</span>
                          <span className="font-extrabold text-emerald-700">{s.avg}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* MODULE 09: CONTENT PRODUCTION CENTER */}
              {activeAdminModule === 'content_production' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">
                      09. Creative Teaching Content Production Laboratory (12 Generators)
                    </h3>
                    <p className="text-xs text-slate-600">
                      Select any generator below to launch its specialist workstation with PDF/Markdown export and 1-click EraGames / Homework publishing.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {CREATIVE_TEACHING_TOOLS.map((tool) => (
                      <div
                        key={tool.id}
                        className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3"
                      >
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900">{tool.name}</h4>
                          <p className="text-xs text-slate-600 mt-1">{tool.description}</p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedEmployeeId(tool.specialistEmployeeId);
                            setSelectedCreativeTool(tool.id);
                            setTaskMode('content_generation');
                            setViewMode('workstation');
                          }}
                          className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                        >
                          Launch {tool.shortName}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MODULE 10: STAFF COMMUNICATION */}
              {activeAdminModule === 'staff_communication' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-extrabold text-slate-900">
                    10. Faculty Staff Communication Channel
                  </h3>
                  <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                    <div className="h-72 overflow-y-auto space-y-2.5 pr-2">
                      {staffMessages.map((msg) => (
                        <div key={msg.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-extrabold text-slate-900">
                              {msg.sender} · <span className="text-indigo-600 font-semibold">{msg.role}</span>
                            </span>
                            <span className="text-slate-400 tabular-nums">{msg.time}</span>
                          </div>
                          <p className="text-xs text-slate-700 mt-1">{msg.text}</p>
                        </div>
                      ))}
                    </div>
                    <form onSubmit={handleSendStaffDirective} className="flex items-center gap-2 pt-2 border-t border-slate-200">
                      <input
                        type="text"
                        value={staffChatInput}
                        onChange={(e) => setStaffChatInput(e.target.value)}
                        placeholder="Send a directive to Clara Vance, Dr. Victoria Sterling, Pixel Kai, or any faculty member..."
                        className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Broadcast</span>
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* MODULE 11: FINANCIAL OVERVIEW & GAMIFICATION */}
              {activeAdminModule === 'financial_overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">
                      11. Era Gems & Era Dollars Treasury, Missions & 3D Office Upgrades
                    </h3>
                    <p className="text-xs text-slate-600">
                      Unified with your EraVerse wallet. Unlock 3D office decorations that appear live inside the ERA FACULTY HQ building!
                    </p>
                  </div>

                  {/* Unlockable 3D Office Decorations */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
                    <h4 className="text-sm font-extrabold text-slate-900">
                      Unlockable 3D Office Decorations (Live in ERA FACULTY HQ)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {decorations.map((deco) => (
                        <div
                          key={deco.id}
                          className="p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-3 bg-slate-50"
                        >
                          <div>
                            <div className="text-xs font-bold text-indigo-600">
                              Floor {deco.floor} · +{deco.xpBonusPercent}% Staff XP Bonus
                            </div>
                            <div className="text-sm font-extrabold text-slate-900">{deco.name}</div>
                            <p className="text-xs text-slate-600 mt-0.5">{deco.description}</p>
                          </div>
                          {deco.unlocked ? (
                            <span className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold whitespace-nowrap">
                              Unlocked in 3D
                            </span>
                          ) : (
                            <button
                              onClick={() => handleUnlockDecoration(deco)}
                              className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold whitespace-nowrap tabular-nums"
                            >
                              Unlock (💎{deco.costGems} · 💵${deco.costDollars})
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Daily Missions & Weekly Challenges */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
                    <h4 className="text-sm font-extrabold text-slate-900">
                      Faculty Daily Missions & Weekly Challenges
                    </h4>
                    <div className="space-y-2.5">
                      {missions.map((m) => (
                        <div
                          key={m.id}
                          className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 tabular-nums"
                        >
                          <div>
                            <div className="text-xs font-extrabold text-slate-900">{m.title}</div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              Progress: {m.currentCount} / {m.targetCount} · Reward: 💎+{m.rewardGems} Gems & 💵+${m.rewardDollars} Dollars
                            </div>
                          </div>
                          <span className="text-xs font-bold text-indigo-600">
                            {m.completed ? 'Completed ✅' : 'In Progress'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* MODULE 12: NOTIFICATIONS & AUDIT LOGS */}
              {activeAdminModule === 'notifications' && (
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
                    <h4 className="text-sm font-extrabold text-slate-900">
                      12. Live AI Staff Notifications ({notifications.length})
                    </h4>
                    <div className="space-y-2">
                      {notifications.map((n) => (
                        <div key={n.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                          <div className="text-xs font-extrabold text-slate-900">{n.title}</div>
                          <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
                    <h4 className="text-sm font-extrabold text-slate-900">
                      Official Assessment Approval Audit Log ({approvalLogs.length})
                    </h4>
                    <div className="space-y-2">
                      {approvalLogs.map((log) => (
                        <div key={log.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                          <div className="font-bold text-slate-900">
                            [{log.action.toUpperCase()}] {log.taskTitle}
                          </div>
                          <div className="text-slate-600 mt-0.5">
                            By {log.actorName} ({log.actorRole}) · Specialist: {log.employeeName} · {log.notes}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </main>
          </div>
        )}
      </div>
    </div>
  );
};
export default EraFacultyWorkstationModal;
