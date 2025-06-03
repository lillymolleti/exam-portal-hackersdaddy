export interface Exam {
    id: string;
    title: string;
    startTime: string;
    duration: number;
    totalQuestions: number;
    totalStudents: number;
    createdAt: any; // Firestore timestamp (use 'any' for simplicity; can refine with Timestamp type if needed)
  }
  
  export interface Question {
    id: string;
    text: string;
    options?: string[];
    correctAnswer?: string | string[] | null;
    type: 'singleChoice' | 'multipleChoice' | 'essay' | 'matching' | 'ordering';
    points?: number;
    difficulty?: string;
    category?: string;
    createdAt?: any; // Firestore timestamp
  }
  
  export type Role = 'admin' | 'student';
  
  export interface StatsCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    trend: 'up' | 'down' | 'neutral';
    description: string;
    bgClass: string;
  }
  
  export interface ExamCardProps {
    exam: Exam;
    role: Role;
  }

// **Details**:
// - **Exam**: Matches Firestore `exams` fields from `CreateExamModal.tsx`.
// - **Question**: Matches `exams/{examId}/questions` fields from `ExamInterface.tsx` and `Questions.tsx`.
// - **Role**: Defines valid roles for `ExamCard`.
// - **StatsCardProps**: Matches props in `StatsCard` usage.
// - **ExamCardProps**: Matches props in `ExamCard` usage.
// - **createdAt**: Uses `any` for Firestore timestamps (can import `Timestamp` from `firebase/firestore` if needed).
