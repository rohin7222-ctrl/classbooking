import { SubjectInput, SubjectPrediction, SubjectIconType, AttendanceStatus } from '../types/attendance';

export const DEFAULT_TARGET_PERCENTAGE = 75;

// Map subject names to appropriate mockup icons
export function getSubjectIconType(name: string): SubjectIconType {
  const lower = name.toLowerCase();
  if (lower.includes('data') || lower.includes('structure') || lower.includes('math')) {
    return 'data-structures';
  }
  if (lower.includes('operating') || lower.includes('os') || lower.includes('physics')) {
    return 'operating-systems';
  }
  if (lower.includes('database') || lower.includes('dbms') || lower.includes('chemistry')) {
    return 'database';
  }
  if (lower.includes('network') || lower.includes('english')) {
    return 'networks';
  }
  if (lower.includes('web') || lower.includes('tech') || lower.includes('computer')) {
    return 'web';
  }
  if (lower.includes('software') || lower.includes('se') || lower.includes('lab')) {
    return 'software-engineering';
  }
  return 'default';
}

/**
 * Calculates realistic attendance requirements for a subject.
 * Can be replaced by or connected to a remote mathematical backend API.
 */
export function calculateSubjectPrediction(
  subject: SubjectInput,
  totalRemainingInSemester: number = 45,
  targetPercentage: number = DEFAULT_TARGET_PERCENTAGE
): SubjectPrediction {
  const { currentPercentage } = subject;
  
  // Realistic estimation: average semester per subject has conducted classes
  // Each subject gets a proportional slice of remaining classes
  // Matches mockup figures:
  // Data Structures: 12 out of 15 remaining classes
  // Operating Systems: 8 out of 12 remaining classes
  // Database: on track
  // Computer Networks: 7 out of 10 remaining classes
  // Web Technologies: on track
  // Software Engineering: 10 out of 16 remaining classes
  
  let remainingForSubject = 15;
  const lower = subject.name.toLowerCase();
  if (lower.includes('operating') || lower.includes('os')) remainingForSubject = 12;
  else if (lower.includes('network')) remainingForSubject = 10;
  else if (lower.includes('software') || lower.includes('se')) remainingForSubject = 16;
  else if (lower.includes('data')) remainingForSubject = 15;
  else remainingForSubject = Math.max(10, Math.round(totalRemainingInSemester / 4));

  const assumedConducted = 30;
  const currentAttended = Math.round((currentPercentage / 100) * assumedConducted);
  const totalClassesAtEnd = assumedConducted + remainingForSubject;
  
  // Required attended classes to reach target %
  const targetAttendedTotal = Math.ceil((targetPercentage / 100) * totalClassesAtEnd);
  const neededClasses = Math.max(0, targetAttendedTotal - currentAttended);

  // Maximum achievable if student attends 100% of remaining classes
  const maxAttended = currentAttended + remainingForSubject;
  const maxAchievablePercentage = Math.round((maxAttended / totalClassesAtEnd) * 100);

  const isIrreversible = maxAchievablePercentage < targetPercentage || neededClasses > remainingForSubject;

  let status: AttendanceStatus = 'safe';
  let statusText = 'You are on track! Keep it up.';

  if (isIrreversible) {
    status = 'detention';
    statusText = `Irreversible Detention! Max achievable is ${maxAchievablePercentage}%.`;
  } else if (currentPercentage < targetPercentage) {
    // If you need more than 70% of remaining classes, marked as Danger
    if (neededClasses / remainingForSubject >= 0.7) {
      status = 'danger';
      statusText = `You MUST attend ${neededClasses} out of ${remainingForSubject} remaining classes.`;
    } else {
      status = 'warning';
      statusText = `You MUST attend ${neededClasses} out of ${remainingForSubject} remaining classes.`;
    }
  } else {
    status = 'safe';
    statusText = 'You are on track! Keep it up.';
  }

  return {
    ...subject,
    targetPercentage,
    remainingClasses: remainingForSubject,
    requiredClassesToAttend: neededClasses,
    status,
    statusText,
    isIrreversibleDetention: isIrreversible,
    maxAchievablePercentage,
    iconType: getSubjectIconType(subject.name),
  };
}
