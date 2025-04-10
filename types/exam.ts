// types/exam.ts
export type Exam = {
    id: number;
    code: string;
    title: string;
    professor: string;
    icon: number | { uri: string };
    schedule: string;
    location: string;
  };