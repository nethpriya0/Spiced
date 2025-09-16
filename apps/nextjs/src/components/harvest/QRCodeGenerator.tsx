import React, { useEffect, useRef } from 'react'
import { type QRCodeData } from '@/types/passport'

interface QRCodeGeneratorProps {
  data: QRCodeData
  size?: number
  className?: string
  onGenerated?: (dataUrl: string) => void
}

export function QRCodeGenerator({ 
  data, 
  size = 200, 
  className = '',
  onGenerated 
}: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    generateQRCode()
  }, [data, size])

  const generateQRCode = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      // For development, we'll create a simple visual representation
      // In production, this would use a QR code library like qrcode
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Clear canvas
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, size, size)

      // Create mock QR code pattern
      const qrData = JSON.stringify(data)
      const gridSize = 25
      const cellSize = size / gridSize

      // Generate pseudo-random pattern based on data hash
      const hash = simpleHash(qrData)
      
      ctx.fillStyle = '#000000'
      
      // Create QR-like pattern
      for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
          const shouldFill = (hash + x * 31 + y * 17) % 3 === 0
          
          // Add position markers (corners)
          const isCorner = (x < 7 && y < 7) || 
                          (x >= gridSize - 7 && y < 7) || 
                          (x < 7 && y >= gridSize - 7)
          
          if (shouldFill || isCorner) {
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
          }
        }
      }

      // Add logo area in center
      const centerX = size / 2
      const centerY = size / 2
      const logoSize = size / 6

      ctx.fillStyle = '#ffffff'
      ctx.fillRect(
        centerX - logoSize / 2, 
        centerY - logoSize / 2, 
        logoSize, 
        logoSize
      )

      // Add spice icon in center
      ctx.fillStyle = '#ff6b35'
      ctx.font = `${logoSize / 2}px Arial`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('🌶️', centerX, centerY)

      // Generate data URL and callback
      const dataUrl = canvas.toDataURL('image/png')
      onGenerated?.(dataUrl)

    } catch (error) {
      console.error('Failed to generate QR code:', error)
    }
  }

  const downloadQRCode = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dataUrl = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `spice-passport-${data.batchId}.png`
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const copyVerificationUrl = async () => {
    try {
      await navigator.clipboard.writeText(data.verificationUrl)
      // Could add toast notification here
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }

  return (
    <div className={`text-center ${className}`}>
      <div className="relative inline-block">
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="border border-gray-200 rounded-lg shadow-sm"
        />
        
        {/* QR Code Label */}
        <div className="mt-3">
          <div className="text-sm font-medium text-gray-900 mb-1">
            Batch ID: {data.batchId}
          </div>
          <div className="text-xs text-gray-600">
            Scan to verify authenticity
          </div>
        </div>
      </div>

      {/* QR Code Data Display */}
      <div className="mt-4 p-3 bg-gray-50 rounded border text-left text-xs">
        <div className="font-medium text-gray-700 mb-2">QR Code Contains:</div>
        <div className="space-y-1 text-gray-600">
          <div><strong>Batch:</strong> {data.batchId}</div>
          <div><strong>Spice:</strong> {data.spiceType}</div>
          <div><strong>Farmer:</strong> {data.farmer}</div>
          <div><strong>Weight:</strong> {data.weight}</div>
          <div><strong>Date:</strong> {data.harvestDate}</div>
          <div><strong>Verify:</strong> 
            <button
              onClick={copyVerificationUrl}
              className="ml-1 text-blue-600 hover:text-blue-800 underline"
            >
              {data.verificationUrl}
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex justify-center space-x-3">
        <button
          onClick={downloadQRCode}
          className="px-4 py-2 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 transition-colors"
        >
          📥 Download QR Code
        </button>
        
        <button
          onClick={copyVerificationUrl}
          className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
        >
          📋 Copy Link
        </button>
      </div>
    </div>
  )
}

/**
 * Simple hash function for generating QR pattern
 */
function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

/**
 * Generate QR code data object from passport information
 */
export function createQRCodeData(
  batchId: string,
  contractAddress: string,
  farmerName: string,
  spiceType: string,
  harvestDate: string,
  weight: string
): QRCodeData {
  const verificationUrl = `${window.location.origin}/verify/${batchId}`
  
  return {
    batchId,
    contractAddress,
    verificationUrl,
    farmer: farmerName,
    spiceType,
    harvestDate,
    weight
  }
}

export default QRCodeGenerator