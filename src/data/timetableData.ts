// Timetable dataset extracted from college PDFs
// Array format: [Monday, Tuesday, Wednesday, Thursday, Friday] represents periods per day

export type WeeklySchedule = Record<string, [number, number, number, number, number]>;

export const TIMETABLE_DATA: Record<string, WeeklySchedule> = {
  "IV_ECE_B": {
    "Behavioural Psychology": [1, 0, 2, 1, 0],
    "Wireless Communication": [0, 1, 1, 2, 0],
    "Computer Communication": [1, 2, 0, 0, 0],
    "Semiconductor Memory": [0, 2, 0, 0, 1],
    "Scripting Language": [1, 1, 0, 0, 1],
    "Machine Learning": [1, 0, 1, 0, 1],
    "Lab": [0, 0, 2, 0, 0]
  },
  "III_ECE_DS": {
    "Discrete Mathematics": [0, 0, 1, 1, 1],
    "Microprocessor": [0, 3, 0, 0, 1],
    "VLSI Design": [1, 0, 1, 1, 0],
    "Machine Learning": [0, 0, 1, 1, 1],
    "Database Design": [1, 0, 0, 1, 1],
    "Community Connect": [0, 0, 0, 1, 0],
    "Analytical Skills": [0, 0, 0, 2, 0],
    "Indian Art Form": [1, 0, 0, 0, 0],
    "Lab": [2, 0, 0, 0, 2]
  },
  "II_ECE_DS_A": {
    "Transforms & Boundary": [1, 2, 1, 1, 0],
    "Solid State Devices": [0, 0, 1, 1, 1],
    "Computer Organization": [0, 1, 1, 1, 1],
    "Digital Logic": [0, 1, 1, 0, 1],
    "Electromagnetic Theory": [1, 1, 0, 0, 1],
    "Professional Ethics": [0, 0, 0, 1, 0],
    "Universal Human Values": [2, 2, 0, 0, 0],
    "Verbal Reasoning": [0, 2, 2, 0, 0],
    "Social Engineering": [1, 0, 0, 0, 0],
    "Lab": [2, 0, 0, 2, 0]
  },
  "III_BME": {
    "Probability": [0, 0, 2, 1, 1],
    "Microcontrollers": [1, 0, 1, 1, 0],
    "Biomedical Signal": [0, 0, 2, 1, 0],
    "Biometrics": [0, 0, 1, 0, 1],
    "Modern Wireless": [1, 0, 0, 1, 1],
    "Medical Imaging": [1, 0, 1, 0, 1],
    "Analytical Skills": [2, 0, 2, 0, 0],
    "Indian Art Form": [1, 0, 0, 0, 0],
    "Community Connect": [0, 0, 0, 2, 2],
    "Lab": [2, 0, 2, 0, 0]
  },
  "II_BME": {
    "Transforms": [0, 0, 2, 1, 1],
    "Biomedical Signals": [1, 0, 1, 1, 0],
    "Electric Circuits": [1, 1, 0, 0, 1],
    "Digital Logic": [0, 1, 0, 1, 1],
    "Medical Physics": [1, 1, 0, 1, 0],
    "Professional Ethics": [0, 0, 0, 0, 1],
    "Universal Human Values": [0, 0, 2, 0, 2],
    "Verbal Reasoning": [0, 2, 2, 0, 0],
    "Social Engineering": [0, 0, 1, 0, 0],
    "Lab": [0, 2, 0, 2, 0]
  },
  "I_ECE_A": {
    "Philosophy": [2, 0, 1, 0, 0],
    "Advanced Calculus": [1, 1, 0, 1, 1],
    "Chemistry": [1, 1, 1, 0, 1],
    "PCB Design": [0, 1, 0, 0, 1],
    "Programming": [0, 1, 1, 0, 1],
    "Biology": [1, 0, 0, 0, 1],
    "Aptitude": [1, 0, 0, 2, 0],
    "NSS": [0, 0, 0, 1, 0],
    "German": [0, 0, 0, 1, 1],
    "Labs & Workshop": [2, 2, 4, 0, 0]
  },
  "I_ECE_B_EEE": {
    "Biology / Electrical": [1, 0, 1, 0, 0],
    "CDC": [1, 0, 2, 0, 0],
    "Philosophy": [2, 0, 1, 0, 0],
    "Chemistry": [1, 1, 1, 0, 1],
    "Calculus": [1, 1, 0, 1, 1],
    "PCB Design": [0, 1, 0, 1, 0],
    "Programming": [0, 1, 1, 1, 0],
    "German": [0, 0, 0, 1, 2],
    "Labs & Workshop": [2, 2, 2, 2, 0]
  },
  "I_ECE_DS": {
    "Biology": [1, 0, 0, 1, 0],
    "CDC": [1, 0, 2, 0, 0],
    "Philosophy": [2, 1, 0, 0, 0],
    "Chemistry": [1, 2, 0, 1, 0],
    "Calculus": [1, 1, 1, 1, 0],
    "PCB Design": [0, 1, 0, 1, 0],
    "Programming": [0, 1, 0, 1, 0],
    "German": [0, 0, 0, 1, 1],
    "Labs & Workshop": [2, 2, 2, 0, 2]
  },
  "IV_ECE_A": {
    "Behavioural Psychology": [0, 1, 0, 1, 1],
    "Wireless Communication": [0, 1, 1, 1, 0],
    "Computer Communication": [2, 0, 0, 0, 1],
    "Semiconductor": [2, 0, 0, 0, 1],
    "Scripting": [0, 0, 1, 1, 1],
    "Machine Learning": [1, 0, 1, 1, 0],
    "Lab": [0, 2, 0, 0, 0]
  },
  "III_ECE_B": {
    "Discrete Math": [1, 0, 1, 1, 1],
    "Microprocessor": [1, 1, 2, 0, 0],
    "VLSI": [0, 1, 0, 2, 0],
    "System & Network": [1, 1, 0, 0, 1],
    "Machine Learning": [1, 0, 0, 0, 2],
    "Community Connect": [0, 1, 0, 0, 1],
    "Analytical Skills": [0, 1, 1, 0, 0],
    "Indian Art": [0, 0, 1, 0, 0],
    "Lab": [2, 0, 0, 2, 0]
  },
  "II_ECE_DS_B": {
    "Transforms": [0, 1, 1, 1, 1],
    "Solid State": [1, 0, 0, 1, 1],
    "Computer Org": [2, 0, 0, 1, 1],
    "Digital Logic": [2, 0, 1, 0, 0],
    "Electromagnetic": [1, 0, 1, 1, 0],
    "Professional Ethics": [0, 0, 0, 0, 1],
    "Universal Human Values": [0, 0, 1, 1, 0],
    "Verbal Reasoning": [0, 0, 0, 1, 1],
    "Social Engineering": [0, 1, 1, 0, 0],
    "Lab": [2, 2, 0, 0, 0]
  },
  "III_ECE_A": {
    "Discrete Math": [1, 0, 0, 1, 1],
    "Microprocessor": [0, 1, 2, 1, 0],
    "VLSI": [1, 0, 1, 0, 1],
    "System & Network": [2, 0, 1, 0, 0],
    "Machine Learning": [1, 1, 1, 0, 0],
    "Community Connect": [0, 0, 0, 2, 0],
    "Analytical": [0, 0, 0, 2, 0],
    "Indian Art": [1, 0, 0, 0, 0],
    "Lab": [0, 0, 0, 2, 2]
  }
};

export const SECTION_OPTIONS = Object.keys(TIMETABLE_DATA).map(key => ({
  id: key,
  label: key.replace(/_/g, ' '),
}));
