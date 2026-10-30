export interface SignaturePadProps {
  width?: number;
  height?: number;
  title?: string;
  onSignatureChange?: (dataUrl: string | null) => void;
}

