// mocks/examData.ts
import { ExamCardProps } from '../types/exam';

export const sampleExams: ExamCardProps[] = [
  {
    id: "ef438be4-9dc0-4f29-8cc9-d659ca9efea4",
    title: "CIVL 2110 - Statics",
    date: "16-Dec-2024",
    start_time: "4:00pm",
    end_time: "5:30pm",
    duration: 90,
    room: [
      {
        id: "624366b4-3eb0-400e-be5a-e049657a00fa",
        name: "Room 4212",
        location: "Room 4212"
      }
    ],
    isAdmin: true
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    title: "COMP 3021 - Data Structures",
    date: "18-Dec-2024",
    start_time: "2:00pm",
    end_time: "4:00pm",
    duration: 120,
    room: [
      {
        id: "724366b4-3eb0-400e-be5a-e049657a00fb",
        name: "Room 3001",
        location: "Room 3001"
      }
    ]
  },
  {
    id: "c2a3e0c0-716f-4998-a8b7-b32b56c0c001",
    title: "MATH 2011 - Linear Algebra",
    date: "20-Dec-2024",
    start_time: "9:00am",
    end_time: "11:00am",
    duration: 120,
    room: [
      {
        id: "824366b4-3eb0-400e-be5a-e049657a00fc",
        name: "Room 2101",
        location: "Room 2101"
      }
    ],
    isAdmin: true
  }
];