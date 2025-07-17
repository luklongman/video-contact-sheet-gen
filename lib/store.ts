import { create } from 'zustand';

export interface VideoMetadata {
  duration: number;
  fps: number;
  width: number;
  height: number;
  codec: string;
}

export interface FrameSelectionSettings {
  startTime: number;
  endTime: number;
  startFrame: number;
  endFrame: number;
  intervalValue: number;
  frameLimit: number;
}

export interface LayoutSettings {
  columns: number;
  rows: number;
  thumbnailWidth: number;
  thumbnailHeight: number;
  borderSpacing: number;
  filmSpacing: number;
  showBorder: boolean;
  borderThickness: number;
  borderColor: string;
  backgroundColor: string;
  showTimestamp: boolean;
  timestampFontSize: number;
  timestampPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'bottom-center';
  timestampColor: string;
}

export interface OutputSettings {
  format: 'jpeg' | 'png';
  quality: number;
}

export interface AppState {
  // Navigation state
  currentStep: number;
  stepsCompleted: boolean[];
  showHero: boolean;
  
  // Video state
  videoFile: File | null;
  videoMetadata: VideoMetadata | null;
  isAnalyzing: boolean;
  analysisError: string | null;
  
  // Load state
  isLoading: boolean;
  loadProgress: number;
  loadStatus: string;
  
  // Settings
  frameSelection: FrameSelectionSettings;
  layout: LayoutSettings;
  output: OutputSettings;
  
  // Processing state
  isProcessing: boolean;
  processingProgress: number;
  processingStatus: string;
  processingError: string | null;
  
  // Result
  contactSheetDataUrl: string | null;
  
  // Derived values
  totalFramesToExtract: number;
  
  // Actions
  setCurrentStep: (step: number) => void;
  setStepCompleted: (step: number, completed: boolean) => void;
  goToNextStep: () => void;
  setShowHero: (show: boolean) => void;
  
  setVideoFile: (file: File | null) => void;
  setVideoMetadata: (metadata: VideoMetadata | null) => void;
  setAnalyzing: (isAnalyzing: boolean) => void;
  setAnalysisError: (error: string | null) => void;
  
  setLoading: (isLoading: boolean) => void;
  setLoadProgress: (progress: number) => void;
  setLoadStatus: (status: string) => void;
  
  updateFrameSelection: (settings: Partial<FrameSelectionSettings>) => void;
  updateLayout: (settings: Partial<LayoutSettings>) => void;
  updateOutput: (settings: Partial<OutputSettings>) => void;
  
  setProcessing: (isProcessing: boolean) => void;
  setProcessingProgress: (progress: number) => void;
  setProcessingStatus: (status: string) => void;
  setProcessingError: (error: string | null) => void;
  
  setContactSheetDataUrl: (dataUrl: string | null) => void;
  
  calculateTotalFrames: () => void;
  resetState: () => void;
}

const initialFrameSelection: FrameSelectionSettings = {
  startTime: 0,
  endTime: 0,
  startFrame: 0,
  endFrame: 0,
  intervalValue: 30,
  frameLimit: 100,
};

const initialLayout: LayoutSettings = {
  columns: 4,
  rows: 5,
  thumbnailWidth: 300,
  thumbnailHeight: 169, // 16:9 aspect ratio
  borderSpacing: 10,
  filmSpacing: 0,
  showBorder: true,
  borderThickness: 2,
  borderColor: '#000000',
  backgroundColor: '#ffffff',
  showTimestamp: true,
  timestampFontSize: 14,
  timestampPosition: 'bottom-center',
  timestampColor: '#000000',
};

const initialOutput: OutputSettings = {
  format: 'jpeg',
  quality: 90,
};

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  currentStep: 1,
  stepsCompleted: [false, false, false, false],
  showHero: true,
  
  videoFile: null,
  videoMetadata: null,
  isAnalyzing: false,
  analysisError: null,
  
  isLoading: false,
  loadProgress: 0,
  loadStatus: '',
  
  frameSelection: initialFrameSelection,
  layout: initialLayout,
  output: initialOutput,
  
  isProcessing: false,
  processingProgress: 0,
  processingStatus: '',
  processingError: null,
  
  contactSheetDataUrl: null,
  totalFramesToExtract: 0,
  
  // Actions
  setCurrentStep: (step) => set({ currentStep: step }),
  setStepCompleted: (step, completed) => {
    const stepsCompleted = [...get().stepsCompleted];
    stepsCompleted[step - 1] = completed;
    set({ stepsCompleted });
  },
  goToNextStep: () => {
    const currentStep = get().currentStep;
    if (currentStep < 4) {
      set({ currentStep: currentStep + 1 });
    }
  },
  setShowHero: (show) => set({ showHero: show }),
  
  setVideoFile: (file) => set({ videoFile: file }),
  setVideoMetadata: (metadata) => {
    set({ videoMetadata: metadata });
    // Calculate total frames directly without setTimeout
    if (metadata) {
      const { frameSelection } = get();
      const startFrame = frameSelection.startFrame;
      const endFrame = frameSelection.endFrame || Math.floor(metadata.duration * metadata.fps);
      const totalFrames = endFrame - startFrame + 1;
      
      let framesToExtract = 0;
      const useIntervalExtraction = frameSelection.intervalValue > 1;
      
      if (useIntervalExtraction) {
        framesToExtract = Math.ceil(totalFrames / frameSelection.intervalValue);
      } else {
        framesToExtract = totalFrames;
      }
      
      const maxFrames = Math.floor(metadata.duration * metadata.fps);
      const actualFrameLimit = Math.min(frameSelection.frameLimit, maxFrames);
      framesToExtract = Math.min(framesToExtract, actualFrameLimit);
      
      set({ totalFramesToExtract: framesToExtract });
    }
  },
  setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setAnalysisError: (error) => set({ analysisError: error }),
  
  setLoading: (isLoading) => set({ isLoading }),
  setLoadProgress: (progress) => set({ loadProgress: progress }),
  setLoadStatus: (status) => set({ loadStatus: status }),
  
  updateFrameSelection: (settings) => {
    const currentSettings = get().frameSelection;
    const newSettings = { ...currentSettings, ...settings };
    set({ frameSelection: newSettings });
    
    // Calculate total frames directly without setTimeout
    const { videoMetadata } = get();
    if (videoMetadata) {
      const startFrame = newSettings.startFrame;
      const endFrame = newSettings.endFrame || Math.floor(videoMetadata.duration * videoMetadata.fps);
      const totalFrames = endFrame - startFrame + 1;
      
      let framesToExtract = 0;
      const useIntervalExtraction = newSettings.intervalValue > 1;
      
      if (useIntervalExtraction) {
        framesToExtract = Math.ceil(totalFrames / newSettings.intervalValue);
      } else {
        framesToExtract = totalFrames;
      }
      
      const maxFrames = Math.floor(videoMetadata.duration * videoMetadata.fps);
      const actualFrameLimit = Math.min(newSettings.frameLimit, maxFrames);
      framesToExtract = Math.min(framesToExtract, actualFrameLimit);
      
      set({ totalFramesToExtract: framesToExtract });
    }
  },
  
  updateLayout: (settings) => {
    const currentSettings = get().layout;
    set({ layout: { ...currentSettings, ...settings } });
  },
  
  updateOutput: (settings) => {
    const currentSettings = get().output;
    set({ output: { ...currentSettings, ...settings } });
  },
  
  setProcessing: (isProcessing) => set({ isProcessing }),
  setProcessingProgress: (progress) => set({ processingProgress: progress }),
  setProcessingStatus: (status) => set({ processingStatus: status }),
  setProcessingError: (error) => set({ processingError: error }),
  
  setContactSheetDataUrl: (dataUrl) => set({ contactSheetDataUrl: dataUrl }),
  
  calculateTotalFrames: () => {
    const { frameSelection, videoMetadata } = get();
    if (!videoMetadata) return;
    
    const startFrame = frameSelection.startFrame;
    const endFrame = frameSelection.endFrame || Math.floor(videoMetadata.duration * videoMetadata.fps);
    const totalFrames = endFrame - startFrame + 1; // +1 because endFrame is inclusive
    
    let framesToExtract = 0;
    
    // Check if we're extracting every frame or using interval
    const useIntervalExtraction = frameSelection.intervalValue > 1;
    
    if (useIntervalExtraction) {
      framesToExtract = Math.ceil(totalFrames / frameSelection.intervalValue);
    } else {
      // Extract every frame
      framesToExtract = totalFrames;
    }
    
    const maxFrames = Math.floor(videoMetadata.duration * videoMetadata.fps);
    const actualFrameLimit = Math.min(frameSelection.frameLimit, maxFrames);
    framesToExtract = Math.min(framesToExtract, actualFrameLimit);
    
    set({ totalFramesToExtract: framesToExtract });
  },
  
  resetState: () => set({
    currentStep: 1,
    stepsCompleted: [false, false, false, false, false],
    showHero: true,
    videoFile: null,
    videoMetadata: null,
    isAnalyzing: false,
    analysisError: null,
    isLoading: false,
    loadProgress: 0,
    loadStatus: '',
    frameSelection: { ...initialFrameSelection },
    layout: { ...initialLayout },
    output: { ...initialOutput },
    isProcessing: false,
    processingProgress: 0,
    processingStatus: '',
    processingError: null,
    contactSheetDataUrl: null,
    totalFramesToExtract: 0,
  }),
}));
