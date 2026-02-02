export interface TransformState {
  originalImage: string | null; // Data URI
  transformedImage: string | null; // Data URI
  isLoading: boolean;
  error: string | null;
  prompt: string;
}

export interface ImageDimension {
  width: number;
  height: number;
}
