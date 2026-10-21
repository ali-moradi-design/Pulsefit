type DetectedBarcode = { rawValue: string }
type BarcodeDetectorLike = { detect: (source: CanvasImageSource) => Promise<DetectedBarcode[]> }
type BarcodeDetectorCtor = new (opts?: { formats?: string[] }) => BarcodeDetectorLike

const Ctor = () => (globalThis as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector

export const supportsBarcodeDetector = () => !!Ctor()

export const supportsCamera = () => !!navigator.mediaDevices?.getUserMedia

export function createDetector(): BarcodeDetectorLike | null {
  const C = Ctor()
  return C ? new C({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] }) : null
}
