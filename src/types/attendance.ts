export type AttendanceStatus = 'safe' | 'warning' | 'danger' | 'detention';

export type SubjectIconType = 
  | 'data-structures' 
  | 'operating-systems' 
  | 'database' 
  | 'networks' 
  | 'web' 
  | 'software-engineering' 
  | 'default';

export interface SubjectInput {
  id: string;
  name: string;
  currentPercentage: number;
}

export interface SubjectPrediction extends SubjectInput {
  targetPercentage: number;
  remainingClasses: number;
  requiredClassesToAttend: number;
  status: AttendanceStatus;
  statusText: string;
  isIrreversibleDetention: boolean;
  maxAchievablePercentage: number;
  iconType: SubjectIconType;
  tPast?: number;
  tFuture?: number;
  tTotal?: number;
  bunkableClasses?: number;
  projectedPercentage?: number;
  odCredit?: number;
  sickDeduction?: number;
}

export interface SimulationSettings {
  odDays: number;
  sickDays: number;
}

export interface PredictionState {
  section: string;
  targetDate: string;
  totalClassesRemaining: number;
  subjects: SubjectPrediction[];
  hasDetentionWarning: boolean;
  overallAttendanceAverage: number;
  simulation: SimulationSettings;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}
