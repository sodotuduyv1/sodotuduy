
export interface Lesson {
  id: string;
  title: string;
  pageNumber?: number;
}

export interface MindMapNode {
  id: string;
  label: string;
  description?: string;
  children?: MindMapNode[];
  isExpanded?: boolean;
}

export interface AppState {
  lessons: Lesson[];
  selectedLessonId: string | null;
  isProcessing: boolean;
  mindMapData: MindMapNode | null;
}
