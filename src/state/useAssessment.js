import { useContext } from 'react';
import { AssessmentContext } from './assessmentContext';
export function useAssessment() {
  const context = useContext(AssessmentContext);
  if (!context) throw new Error('Assessment provider missing');
  return context;
}
