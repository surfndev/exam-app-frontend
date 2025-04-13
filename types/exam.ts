// types/exam.ts
export interface Room {
  id: string;
  name: string;
  location: string;
}

export interface ExamCardProps {
  id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  duration: number;
  room: Room[];
  isAdmin?: boolean;
}