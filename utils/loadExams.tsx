// utils/loadExams.ts
import examsData from '../assets/data/exams.json';
import { images } from '../constants';

// 1. First define the valid image keys as a type
type ImageKey = keyof typeof images;

// 2. Create a type guard to verify valid image keys
function isImageKey(key: string): key is ImageKey {
  return key in images;
}

// 3. Define your exam data type
type RawExam = {
  id: number;
  code: string;
  title: string;
  professor: string;
  icon: string; // This comes from JSON as string
  schedule: string;
  location: string;
};

type ProcessedExam = Omit<RawExam, 'icon'> & {
  icon: number | { uri: string };
};

export const loadExams = (): ProcessedExam[] => {
  return examsData.map(exam => {
    // Type-safe conversion of icon string to actual image resource
    if (isImageKey(exam.icon)) {
      return {
        ...exam,
        icon: images[exam.icon]
      };
    }
    
    // Fallback for invalid icon keys
    console.warn(`Invalid icon key: ${exam.icon}`);
    return {
      ...exam,
      icon: images.empty // Your fallback image
    };
  });
};