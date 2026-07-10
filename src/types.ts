export interface VisualHotspot {
  label: string;
  type: 'stem' | 'field_spot' | 'ocr' | 'stripes' | 'general';
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AnalysisResult {
  is_watermelon: boolean;
  is_watermelon_explanation: string;
  ocr_text: string;
  ocr_found: boolean;
  ripeness_score: number;
  quality_score: number;
  ground_spot: {
    color: string;
    description: string;
    ripeness_impact: string;
  };
  stripes: {
    contrast: string;
    description: string;
    ripeness_impact: string;
  };
  stem: {
    state: string;
    description: string;
    ripeness_impact: string;
  };
  shape_profile: {
    shape: string;
    description: string;
    uniformity: string;
  };
  color_palette: string[];
  recommendation: string;
  detailed_analysis: string;
  visual_hotspots: VisualHotspot[];
}

export interface SavedAnalysis {
  id: string;
  date: string;
  image: string;
  result: AnalysisResult;
  soundType: string | null;
}
