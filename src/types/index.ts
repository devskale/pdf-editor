export interface Annotation {
  id: string;
  type: 'textbox';
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  backgroundColor: string;
  textAlign: 'left' | 'center' | 'right';
  verticalAlign: 'top' | 'middle' | 'bottom';
  page: number;
}

export interface PDFState {
  document: any;
  currentPage: number;
  totalPages: number;
  scale: number;
  annotations: Annotation[];
  selectedAnnotation: string | null;
  history: {
    past: Annotation[][];
    present: Annotation[];
    future: Annotation[][];
  };
}