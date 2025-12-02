export enum AppState {
  INPUT = 'INPUT',
  GENERATING_ANALYSIS = 'GENERATING_ANALYSIS',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  ANALYZING_COMPLIANCE = 'ANALYZING_COMPLIANCE',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}

export interface UserRequirements {
  rooms: number;
  hasHall: boolean;
  hasKitchen: boolean;
  hasBalcony: boolean;
  totalArea: number; // in sq ft
  country: string;
  additionalNotes: string;
}

export interface RoomDimension {
  name: string;
  width: string;
  length: string;
  area: string;
  notes: string;
}

export interface BylawCheck {
  rule: string;
  status: 'Compliant' | 'Warning' | 'Non-Compliant';
  details: string;
}

export interface PlanAnalysis {
  visualPrompt: string; // The prompt to send to the image generation model
  distributionLogic: string;
  roomDimensions: RoomDimension[];
  bylawCompliance: BylawCheck[];
  totalUtilizedArea: number;
  efficiencyScore: number;
}

export interface GeneratedPlan {
  imageUrl: string;
  analysis: PlanAnalysis;
  timestamp: number;
}