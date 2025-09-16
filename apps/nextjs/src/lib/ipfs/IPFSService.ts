import { type HarvestLog, type IpfsUrl } from '@/types/passport'

export class IPFSError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message)
    this.name = 'IPFSError'
  }
}

export interface IPFSConfig {
  gatewayUrl?: string
  apiUrl?: string
  projectId?: string
  apiKey?: string
}

export interface UploadResult {
  hash: string
  url: IpfsUrl
  size: number
}

export class IPFSService {
  private config: IPFSConfig

  constructor(config: IPFSConfig = {}) {
    this.config = {
      gatewayUrl: config.gatewayUrl || process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/',
      apiUrl: config.apiUrl || 'https://api.pinata.cloud/pinning',
      apiKey: config.apiKey || process.env.PINATA_API_KEY,
      ...config
    }
  }

  /**
   * Upload a file to IPFS
   */
  async uploadFile(file: File): Promise<IpfsUrl> {
    try {
      // Validate file
      this.validateFile(file)

      // Check if we have Pinata credentials
      const apiKey = process.env.PINATA_API_KEY || this.config.apiKey
      
      if (apiKey && apiKey !== 'demo_api_key' && apiKey !== 'your_pinata_api_key_here') {
        return await this.uploadToPinata(file)
      }

      // Only allow mock in development
      if (process.env.NODE_ENV === 'production') {
        throw new IPFSError('PINATA_API_KEY required for production uploads. Please configure your Pinata API credentials.')
      }

      // Fallback to mock for development
      console.warn('⚠️  Using mock IPFS service - set PINATA_API_KEY for real uploads')
      const mockHash = this.generateMockHash(file)
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      return `ipfs://${mockHash}` as IpfsUrl

    } catch (error) {
      throw new IPFSError(
        `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      )
    }
  }

  /**
   * Upload JSON data to IPFS
   */
  async uploadJSON(data: any): Promise<IpfsUrl> {
    try {
      const jsonBlob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      })
      
      const file = new File([jsonBlob], 'data.json', { type: 'application/json' })
      return await this.uploadFile(file)

    } catch (error) {
      throw new IPFSError(
        `Failed to upload JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      )
    }
  }

  /**
   * Upload harvest data with photo
   */
  async uploadHarvestData(harvestData: {
    spiceType: string
    harvestWeight: number // in grams
    qualityClaims: string[]
    harvestPhotoFile: File
    dateHarvested: number
    location?: { latitude: number; longitude: number }
  }): Promise<IpfsUrl> {
    try {
      // Upload harvest photo first
      const photoUrl = await this.uploadFile(harvestData.harvestPhotoFile)
      
      // Create harvest log structure
      const harvestLog: HarvestLog = {
        spiceType: harvestData.spiceType,
        harvestWeight: harvestData.harvestWeight,
        qualityClaims: harvestData.qualityClaims,
        harvestPhotoUrl: photoUrl,
        dateHarvested: harvestData.dateHarvested,
        location: harvestData.location
      }
      
      // Upload complete harvest log as JSON
      return await this.uploadJSON({
        type: 'HARVEST_LOG',
        version: '1.0',
        data: harvestLog,
        timestamp: Date.now()
      })

    } catch (error) {
      throw new IPFSError(
        `Failed to upload harvest data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      )
    }
  }

  /**
   * Retrieve data from IPFS
   */
  async retrieveData(ipfsUrl: IpfsUrl): Promise<any> {
    try {
      const hash = ipfsUrl.replace('ipfs://', '')
      const url = `${this.config.gatewayUrl}${hash}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new IPFSError(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()

    } catch (error) {
      throw new IPFSError(
        `Failed to retrieve data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      )
    }
  }

  /**
   * Get public URL for IPFS resource
   */
  getPublicUrl(ipfsUrl: IpfsUrl): string {
    const hash = ipfsUrl.replace('ipfs://', '')
    return `${this.config.gatewayUrl}${hash}`
  }

  /**
   * Validate file before upload
   */
  private validateFile(file: File): void {
    const MAX_SIZE = 10 * 1024 * 1024 // 10MB
    const ALLOWED_TYPES = [
      'image/jpeg',
      'image/png', 
      'image/webp',
      'application/json'
    ]

    if (file.size > MAX_SIZE) {
      throw new IPFSError(`File size exceeds ${MAX_SIZE / (1024 * 1024)}MB limit`)
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new IPFSError(`File type ${file.type} not allowed`)
    }
  }

  /**
   * Generate mock IPFS hash for development
   * In production, this would come from actual IPFS service
   */
  private generateMockHash(file: File): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 15)
    const fileName = file.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
    
    return `Qm${timestamp}${fileName}${random}`.substring(0, 46)
  }

  /**
   * Compress image file before upload (client-side)
   */
  async compressImage(file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              })
              resolve(compressedFile)
            } else {
              reject(new IPFSError('Failed to compress image'))
            }
          },
          file.type,
          quality
        )
      }

      img.onerror = () => reject(new IPFSError('Failed to load image for compression'))
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * Batch upload multiple files
   */
  async uploadBatch(files: File[]): Promise<UploadResult[]> {
    try {
      const uploadPromises = files.map(async (file) => {
        const url = await this.uploadFile(file)
        return {
          hash: url.replace('ipfs://', ''),
          url,
          size: file.size
        }
      })

      return await Promise.all(uploadPromises)

    } catch (error) {
      throw new IPFSError(
        `Failed to upload batch: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      )
    }
  }

  /**
   * Upload processing step data with photos
   */
  async uploadProcessingStepData(stepData: {
    stepNumber: number
    processingType: string
    description: string
    dateCompleted: number
    processingPhotoFiles: File[]
    location?: { latitude: number; longitude: number }
    qualityMetrics?: Record<string, number>
    notes?: string
  }): Promise<IpfsUrl> {
    try {
      // Upload processing photos first
      const photoUrls = await Promise.all(
        stepData.processingPhotoFiles.map(file => this.uploadFile(file))
      )
      
      // Create processing step log structure
      const processingLog = {
        stepNumber: stepData.stepNumber,
        processingType: stepData.processingType,
        description: stepData.description,
        dateCompleted: stepData.dateCompleted,
        processingPhotoUrls: photoUrls,
        location: stepData.location,
        qualityMetrics: stepData.qualityMetrics,
        notes: stepData.notes
      }
      
      // Upload complete processing step log as JSON
      return await this.uploadJSON({
        type: 'PROCESSING_STEP_LOG',
        version: '1.0',
        data: processingLog,
        timestamp: Date.now()
      })

    } catch (error) {
      throw new IPFSError(
        `Failed to upload processing step data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      )
    }
  }

  /**
   * Upload file to Pinata IPFS service
   */
  private async uploadToPinata(file: File): Promise<IpfsUrl> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('pinataOptions', JSON.stringify({
        cidVersion: 1
      }))
      formData.append('pinataMetadata', JSON.stringify({
        name: `spice-${Date.now()}-${file.name}`,
        keyvalues: {
          platform: 'spice-platform',
          timestamp: Date.now().toString(),
          fileType: file.type
        }
      }))

      // Try different authentication methods based on key format
      const apiKey = process.env.PINATA_API_KEY || this.config.apiKey
      const secretKey = process.env.PINATA_SECRET_API_KEY
      
      let headers: Record<string, string> = {}
      
      if (apiKey && apiKey.startsWith('eyJ')) {
        // JWT token format
        headers['Authorization'] = `Bearer ${apiKey}`
      } else if (apiKey && secretKey) {
        // Traditional API key + secret
        headers['pinata_api_key'] = apiKey
        headers['pinata_secret_api_key'] = secretKey
      } else {
        // Fallback to Bearer token
        headers['Authorization'] = `Bearer ${apiKey}`
      }

      console.log('🔄 Uploading to Pinata IPFS...')

      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers,
        body: formData
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Pinata upload error:', response.status, errorText)
        
        // Try to provide helpful error messages
        if (response.status === 401) {
          throw new IPFSError('Pinata authentication failed. Please check your API key and secret.')
        } else if (response.status === 403) {
          throw new IPFSError('Pinata access forbidden. Please verify your account has upload permissions.')
        } else {
          throw new IPFSError(`Pinata upload failed: ${response.status} - ${errorText}`)
        }
      }

      const result = await response.json()
      console.log('✅ File uploaded to Pinata IPFS:', result.IpfsHash)
      
      return `ipfs://${result.IpfsHash}` as IpfsUrl

    } catch (error) {
      console.error('Pinata upload error:', error)
      throw new IPFSError(
        `Pinata upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      )
    }
  }

  /**
   * Check if IPFS service is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(this.config.gatewayUrl!, {
        method: 'HEAD',
        timeout: 5000
      } as any)
      
      return response.ok

    } catch (error) {
      return false
    }
  }

  /**
   * Get file metadata from IPFS
   */
  async getFileMetadata(ipfsUrl: IpfsUrl): Promise<{
    hash: string
    size?: number
    type?: string
  }> {
    try {
      const hash = ipfsUrl.replace('ipfs://', '')
      const url = `${this.config.gatewayUrl}${hash}`
      
      const response = await fetch(url, { method: 'HEAD' })
      
      if (!response.ok) {
        throw new IPFSError(`Failed to get metadata: ${response.statusText}`)
      }

      return {
        hash,
        size: response.headers.get('content-length') ? 
          parseInt(response.headers.get('content-length')!) : undefined,
        type: response.headers.get('content-type') || undefined
      }

    } catch (error) {
      throw new IPFSError(
        `Failed to get file metadata: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      )
    }
  }
}