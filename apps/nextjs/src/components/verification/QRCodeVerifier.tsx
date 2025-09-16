import React, { useState, useRef, useEffect } from 'react'
import { 
  Camera, 
  CheckCircle, 
  XCircle, 
  Upload, 
  Loader2,
  AlertTriangle,
  QrCode,
  RefreshCw
} from 'lucide-react'

interface QRCodeVerifierProps {
  expectedBatchId: string
  onClose: () => void
  onVerified: (verified: boolean, scannedData?: any) => void
}

interface QRScanResult {
  success: boolean
  batchId?: string
  farmerAddress?: string
  verificationHash?: string
  timestamp?: string
  error?: string
}

export const QRCodeVerifier: React.FC<QRCodeVerifierProps> = ({
  expectedBatchId,
  onClose,
  onVerified
}) => {
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<QRScanResult | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Mock QR code verification - in production, this would decode actual QR codes
  const verifyQRCode = async (data: string): Promise<QRScanResult> => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock QR data format: "SPICE_BATCH:{batchId}:{farmerAddress}:{verificationHash}:{timestamp}"
    const mockQRData = `SPICE_BATCH:${expectedBatchId}:0x1234567890123456789012345678901234567890:QmHash123:${Date.now()}`
    
    try {
      if (data === mockQRData || data.includes(expectedBatchId)) {
        const parts = mockQRData.split(':')
        return {
          success: true,
          batchId: parts[1],
          farmerAddress: parts[2],
          verificationHash: parts[3],
          timestamp: parts[4]
        }
      } else {
        return {
          success: false,
          error: 'QR code does not match this product'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: 'Invalid QR code format'
      }
    }
  }

  const startCamera = async () => {
    try {
      setCameraError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsScanning(true)
      }
    } catch (error) {
      console.error('Camera access failed:', error)
      setCameraError('Unable to access camera. Please check permissions or upload an image instead.')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
  }

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Mock QR detection - in production, you'd use a QR code library like jsQR
    const mockQRData = `SPICE_BATCH:${expectedBatchId}:0x1234567890123456789012345678901234567890:QmHash123:${Date.now()}`
    
    const result = await verifyQRCode(mockQRData)
    setScanResult(result)
    onVerified(result.success, result)
    stopCamera()
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    
    // Mock file processing - in production, you'd extract QR code from image
    const mockQRData = `SPICE_BATCH:${expectedBatchId}:0x1234567890123456789012345678901234567890:QmHash123:${Date.now()}`
    
    const result = await verifyQRCode(mockQRData)
    setScanResult(result)
    onVerified(result.success, result)
  }

  const resetScanner = () => {
    setScanResult(null)
    setSelectedFile(null)
    setCameraError(null)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <QrCode className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                QR Code Verification
              </h2>
              <p className="text-sm text-gray-600">
                Scan the QR code on your product packaging
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {scanResult ? (
            /* Scan Result */
            <div className="text-center py-8">
              {scanResult.success ? (
                <div>
                  <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-green-900 mb-2">
                    Verification Successful!
                  </h3>
                  <p className="text-green-700 mb-6">
                    The QR code matches this product perfectly.
                  </p>
                  
                  {/* Verification Details */}
                  <div className="bg-green-50 rounded-lg p-4 text-left mb-6">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-green-700">Batch ID:</span>
                        <span className="font-mono text-green-900">{scanResult.batchId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Farmer:</span>
                        <span className="font-mono text-green-900">
                          {scanResult.farmerAddress?.slice(0, 6)}...{scanResult.farmerAddress?.slice(-4)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Verified At:</span>
                        <span className="text-green-900">
                          {scanResult.timestamp ? new Date(parseInt(scanResult.timestamp)).toLocaleString() : 'Now'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-red-900 mb-2">
                    Verification Failed
                  </h3>
                  <p className="text-red-700 mb-6">
                    {scanResult.error || 'The QR code does not match this product.'}
                  </p>
                  
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 text-red-800">
                      <AlertTriangle className="h-5 w-5" />
                      <span className="text-sm font-medium">
                        This may indicate a counterfeit product.
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <button
                  onClick={resetScanner}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Scan Again
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            /* Scanning Interface */
            <div className="space-y-6">
              {/* Instructions */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Verify Product Authenticity
                </h3>
                <p className="text-gray-600">
                  Use your camera to scan the QR code on the product packaging, or upload an image of the QR code.
                </p>
              </div>

              {/* Camera View */}
              {isScanning && !cameraError ? (
                <div className="space-y-4">
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-64 object-cover"
                    />
                    {/* Scanning overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-48 h-48 border-2 border-white border-dashed rounded-lg"></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={captureAndAnalyze}
                      className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                    >
                      <Camera className="h-5 w-5" />
                      Capture & Analyze
                    </button>
                    <button
                      onClick={stopCamera}
                      className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Stop Camera
                    </button>
                  </div>
                </div>
              ) : (
                /* Camera Controls */
                <div className="space-y-4">
                  {cameraError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-red-800">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="text-sm">{cameraError}</span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Camera Option */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-300 transition-colors">
                      <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        Use Camera
                      </h4>
                      <p className="text-gray-600 mb-4 text-sm">
                        Scan the QR code directly with your device camera
                      </p>
                      <button
                        onClick={startCamera}
                        className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                      >
                        Start Camera
                      </button>
                    </div>

                    {/* File Upload Option */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-300 transition-colors">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        Upload Image
                      </h4>
                      <p className="text-gray-600 mb-4 text-sm">
                        Upload a photo of the QR code from your device
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Choose File
                      </button>
                      {selectedFile && (
                        <div className="mt-2 text-sm text-gray-600">
                          Selected: {selectedFile.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Hidden canvas for image capture */}
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default QRCodeVerifier