export type EmploymentType = 'Umowa o pracę' | 'Umowa zlecenie' | 'Działalność gospodarcza' | string;

export interface BenefitRequest {
  scenario?: string;
  basis?: number;
  employmentType?: EmploymentType;
  children?: number;
  enhancedCertificate?: boolean;
  benefitRate?: '70' | '81.5' | '100' | string;
  sicknessReason?: 'ordinary' | 'pregnancy' | 'commute';
  durationWeeks?: number;
  hospitalWeeks?: number;
  childWeeksAfterBirth?: number;
  startDate?: string;
  documents?: string[];
  insuranceActive?: boolean;
}

export interface RiskRequest {
  birthDate?: string;
  expectedBirthDate?: string;
  employmentType?: EmploymentType;
  documents?: string[];
  scenario?: string;
  terminationDate?: string;
}

export interface ChatRequest {
  message?: string;
  history?: Array<{ role?: string; content?: string }>;
}

export interface LoginRequest {
  name?: string;
}

export interface DocumentRequest {
  fileName?: string;
  documents?: string[];
}
