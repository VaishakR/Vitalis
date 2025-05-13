export interface Vitals {
  bp: string;
  pulse: string;
  temp: string;
  spo2: string;
  respiratoryRate?: string;
  weight?: string;
}

export interface HistoryOfPresentIllness {
  location: string;
  duration: string;
  quality: string;
  timing: string;
  severity: string;
  associatedSignsSymptoms: string;
  others: string;
}

export interface ReviewOfSymptomsType {
  constitutional: { fever: boolean; chills: boolean; nightSweats: boolean; fatigue: boolean };
  neurological: { headache: boolean; numbness: boolean; weakness: boolean; dizziness: boolean };
  cardiovascular: { chestPain: boolean; palpitations: boolean; dyspnea: boolean; heartbeatIrregular: boolean };
  musculoskeletal: { arthralgias: boolean; myalgias: boolean; swellingInJoints: boolean; others: boolean };
  endocrine: { excessThirst: boolean; polyuria: boolean; coldIntolerance: boolean; others: boolean };
  allergicImmun: { allergicRhinitis: boolean; asthma: boolean; hives: boolean; others: boolean };
  respiratory: { shortnessOfBreath: boolean; cough: boolean; others: boolean };
  genitourinary: { hematuria: boolean; dysuria: boolean; others: boolean };
  skin: { eczema: boolean; rash: boolean; pruritus: boolean; others: boolean };
  eyes: { redEye: boolean; decreasedVision: boolean; others: boolean };
  earNoseThroat: { soreThroat: boolean; decreasedHearing: boolean; others: boolean };
  hemLymphatic: { bleedingDiathesis: boolean; others: boolean };
  gastrointestinal: { abdominalPain: boolean; dyspepsiaDysphagia: boolean; heartburnReflux: boolean; others: boolean };
  psychiatric: { depression: boolean; anxiety: boolean; substanceAbuse: boolean; others: boolean };
}

export interface PhysicalExaminationType {
  constitutional: { vitalSigns: string; nutrition: string; appearance: string; other: string };
  neurological: { focalDeficits: string; asterixis: string; other: string };
  cardiovascular: { heartSounds: string; pulseRhythm: string; peripheralEdema: string; other: string };
  musculoskeletal: { gaitStation: string; clubbing: string; muscleWeakness: string; other: string };
  endocrine: { excessThirst: string; polyuria: string; coldIntolerance: string; other: string };
  allergicImmun: { allergicRhinitis: string; asthma: string; hives: string; other: string };
  respiratory: { effort: string; auscultation: string; percussion: string; other: string };
  genitourinary: { hematuria: string; dysuria: string; other: string };
  skin: { rash: string; edema: string; turgor: string; other: string };
  eyes: { icterus: string; abnormalPupils: string; other: string };
  earNoseThroat: { abnormalities: string; pharyngealErythema: string; other: string };
  neck: { masses: string; thyromegaly: string; other: string };
  gastrointestinal: { abnormality: string; tenderness: string; auscultation: string; other: string };
  psychiatric: { affect: string; judgment: string; orientation: string; other: string };
}

export interface PainScreeningType {
  pain: string;
  location: string;
  duration: string;
  frequency: string;
  character: string;
  management: string;
  score: string;
}

export interface SpecialNeedsScreeningType {
  nutritional: string;
  psychological: string;
  functional: string;
  socioeconomic: string;
  specializedAssessment: string;
  spiritualCultural: string;
  suspectedAbuse: string;
}

export interface AllergyDetail {
  type: string;
  description: string;
  dateOfOnset: string;
  reaction: string;
  status: string;
  severity: string;
}

export interface Prescription {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  route: string;
  instructions: string;
}

export interface EMRData {
  consultationDetails: string;
  consultationType: string;
  chiefComplaint: string;
  otherComplaints: string[];
  historyOfPresentIllness: HistoryOfPresentIllness;
  reviewOfSymptoms: ReviewOfSymptomsType;
  pastMedicalHistory: string;
  familyHistory: string;
  socialHistory: string;
  economicStatus: string;
  tobaccoDrugUse: string;
  tobaccoDrugHistory: string;
  currentVitalsData: Vitals;
  allergyDetails: AllergyDetail[];
  physicalExamination: Record<string, Record<string, string>>;
  painScreening: {
    pain: string;
    location: string;
    duration: string;
    frequency: string;
    character: string;
    score: string;
    management: string;
  };
  specialNeedsScreening: {
    nutritional: string;
    psychological: string;
    functional: string;
    socioeconomic: string;
    spiritualCultural: string;
    suspectedAbuse: string;
    specializedAssessment: string;
  };
  dataReviewed?: string;
  finalImpression?: string;
  suspectedCancerCase?: string;
  diagnosisDetails?: DiagnosisDetail[];
  investigationDetails?: InvestigationDetail[];
  clinicalInformation?: string;
  clinicalDataRadiology?: string;
  mainLinesTreatment?: string;
  treatmentPlan?: string;
  measurableElements?: string;
  followUpRequired?: string;
  followUpAfter?: string;
  educationAssessment?: EducationAssessment;
  prescriptions: Prescription[];
}

export interface PreviousMedicalRecord {
  chiefComplaint: string;
  history: string;
  medications: string;
  allergies: string;
  vitals: {
    bp: string;
    pulse: string;
    temp: string;
    spo2: string;
  };
}

export interface TranscriptionResponse {
  type: string;
  text?: string;
  analysis?: Partial<EMRData>;
  shouldNavigate?: boolean;
  message?: string;
}

export interface DiagnosisDetail {
  type: string;
  code: string;
  description: string;
  status: string;
  remarks: string;
}

export interface InvestigationDetail {
  name: string;
  instructions: string;
  specialInstructions: string;
  icdJustification: string;
  priority: string;
}

export interface EducationAssessment {
  nameOfLearner?: string;
  communication?: string;
  ableToLearn?: string;
  ableToRead?: string;
  ableToUnderstand?: string;
  learningBarriers?: string;
  physicalCognitiveLimitation?: string;
  psychologicalEmotional?: string;
  social?: string;
  beliefsValues?: string;
  learningNeeds?: string;
  subject?: string;
  learner?: string;
  methodToolsUsed?: string;
  informationUnderstood?: string;
} 