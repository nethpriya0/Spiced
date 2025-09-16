// IPFS-based encrypted document vault for private credentials
import { keccak256, toBytes, bytesToHex, hexToBytes } from 'viem'

export interface EncryptedDocument {
  id: string
  filename: string
  contentType: string
  size: number
  encryptedContent: string
  encryptionKey: string // This would be encrypted with user's private key
  ipfsHash: string
  uploadedAt: Date
  lastAccessed?: Date
}

export interface VaultDocument {
  id: string
  filename: string
  contentType: string
  size: number
  ipfsHash: string
  isEncrypted: boolean
  uploadedAt: Date
  lastAccessed?: Date
  tags: string[]
  metadata: Record<string, any>
}

export interface DocumentUploadResult {
  success: boolean
  document?: VaultDocument
  error?: string
}

export interface DocumentRetrievalResult {
  success: boolean
  content?: Blob
  document?: VaultDocument
  error?: string
}

export class IPFSVault {
  private static instance: IPFSVault
  private userVaults: Map<string, VaultDocument[]> = new Map()
  private mockIPFSStorage: Map<string, string> = new Map()

  constructor() {
    // In production, initialize IPFS client here
  }

  static getInstance(): IPFSVault {
    if (!IPFSVault.instance) {
      IPFSVault.instance = new IPFSVault()
    }
    return IPFSVault.instance
  }

  /**
   * Upload and encrypt a document to IPFS
   */
  async uploadDocument(
    userAddress: string,
    file: File,
    encryptionKey: string,
    tags: string[] = [],
    metadata: Record<string, any> = {}
  ): Promise<DocumentUploadResult> {
    try {
      // Validate file
      if (!file || file.size === 0) {
        return { success: false, error: 'Invalid file' }
      }

      // Check file size limit (5MB for demo)
      if (file.size > 5 * 1024 * 1024) {
        return { success: false, error: 'File size exceeds 5MB limit' }
      }

      // Generate document ID
      const documentId = this.generateDocumentId(file.name, Date.now())

      // Read file content
      const fileContent = await this.readFileAsArrayBuffer(file)
      
      // Encrypt the content
      const encryptedContent = await this.encryptContent(
        new Uint8Array(fileContent),
        encryptionKey
      )

      // Create IPFS hash (simulate)
      const ipfsHash = await this.uploadToIPFS(encryptedContent)

      // Create document record
      const document: VaultDocument = {
        id: documentId,
        filename: file.name,
        contentType: file.type,
        size: file.size,
        ipfsHash: ipfsHash,
        isEncrypted: true,
        uploadedAt: new Date(),
        tags: tags,
        metadata: metadata
      }

      // Store in user's vault
      const userVault = this.userVaults.get(userAddress) || []
      userVault.push(document)
      this.userVaults.set(userAddress, userVault)

      return { success: true, document }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      }
    }
  }

  /**
   * Retrieve and decrypt a document from IPFS
   */
  async retrieveDocument(
    userAddress: string,
    documentId: string,
    encryptionKey: string
  ): Promise<DocumentRetrievalResult> {
    try {
      // Find document in user's vault
      const userVault = this.userVaults.get(userAddress) || []
      const document = userVault.find(doc => doc.id === documentId)

      if (!document) {
        return { success: false, error: 'Document not found' }
      }

      // Retrieve from IPFS
      const encryptedContent = await this.retrieveFromIPFS(document.ipfsHash)

      if (!encryptedContent) {
        return { success: false, error: 'Failed to retrieve from IPFS' }
      }

      // Decrypt content
      const decryptedContent = await this.decryptContent(encryptedContent, encryptionKey)

      // Create blob
      const blob = new Blob([decryptedContent as BlobPart], { type: document.contentType })

      // Update last accessed time
      document.lastAccessed = new Date()

      return { 
        success: true, 
        content: blob, 
        document 
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Retrieval failed'
      }
    }
  }

  /**
   * List documents in user's vault
   */
  async listDocuments(
    userAddress: string,
    filters?: {
      tags?: string[]
      contentType?: string
      dateRange?: { from: Date; to: Date }
    }
  ): Promise<VaultDocument[]> {
    const userVault = this.userVaults.get(userAddress) || []

    let filteredDocuments = [...userVault]

    if (filters) {
      if (filters.tags && filters.tags.length > 0) {
        filteredDocuments = filteredDocuments.filter(doc =>
          filters.tags!.some(tag => doc.tags.includes(tag))
        )
      }

      if (filters.contentType) {
        filteredDocuments = filteredDocuments.filter(doc =>
          doc.contentType.includes(filters.contentType!)
        )
      }

      if (filters.dateRange) {
        filteredDocuments = filteredDocuments.filter(doc =>
          doc.uploadedAt >= filters.dateRange!.from &&
          doc.uploadedAt <= filters.dateRange!.to
        )
      }
    }

    return filteredDocuments.sort((a, b) => 
      b.uploadedAt.getTime() - a.uploadedAt.getTime()
    )
  }

  /**
   * Delete a document from vault and IPFS
   */
  async deleteDocument(
    userAddress: string,
    documentId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const userVault = this.userVaults.get(userAddress) || []
      const documentIndex = userVault.findIndex(doc => doc.id === documentId)

      if (documentIndex === -1) {
        return { success: false, error: 'Document not found' }
      }

      const document = userVault[documentIndex]

      // Remove from IPFS (in production, this might not always be possible)
      await this.removeFromIPFS(document!.ipfsHash)

      // Remove from vault
      userVault.splice(documentIndex, 1)
      this.userVaults.set(userAddress, userVault)

      return { success: true }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Deletion failed'
      }
    }
  }

  /**
   * Get vault statistics for a user
   */
  async getVaultStats(userAddress: string): Promise<{
    totalDocuments: number
    totalSize: number
    documentsByType: Record<string, number>
    recentUploads: number // Last 30 days
  }> {
    const userVault = this.userVaults.get(userAddress) || []
    
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const documentsByType: Record<string, number> = {}
    let totalSize = 0

    userVault.forEach(doc => {
      totalSize += doc.size
      
      const category = this.getFileCategory(doc.contentType)
      documentsByType[category] = (documentsByType[category] || 0) + 1
    })

    const recentUploads = userVault.filter(doc => 
      doc.uploadedAt >= thirtyDaysAgo
    ).length

    return {
      totalDocuments: userVault.length,
      totalSize,
      documentsByType,
      recentUploads
    }
  }

  /**
   * Generate a unique document hash for verification purposes
   */
  async generateDocumentHash(content: ArrayBuffer): Promise<string> {
    const contentBytes = new Uint8Array(content)
    return keccak256(contentBytes)
  }

  private generateDocumentId(filename: string, timestamp: number): string {
    const idData = `${filename}_${timestamp}_${Math.random()}`
    return keccak256(toBytes(idData))
  }

  private async readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as ArrayBuffer)
      reader.onerror = () => reject(reader.error)
      reader.readAsArrayBuffer(file)
    })
  }

  private async encryptContent(
    content: Uint8Array,
    encryptionKey: string
  ): Promise<Uint8Array> {
    // Simplified encryption - in production, use proper encryption like AES-GCM
    const keyBytes = hexToBytes(encryptionKey as `0x${string}`)
    const encrypted = new Uint8Array(content.length)
    
    for (let i = 0; i < content.length; i++) {
      encrypted[i] = content[i]! ^ keyBytes[i % keyBytes.length]!
    }
    
    return encrypted
  }

  private async decryptContent(
    encryptedContent: Uint8Array,
    encryptionKey: string
  ): Promise<Uint8Array> {
    // Same as encryption for XOR cipher
    return this.encryptContent(encryptedContent, encryptionKey)
  }

  private async uploadToIPFS(content: Uint8Array): Promise<string> {
    // Mock IPFS upload - in production, use actual IPFS client
    const contentHash = keccak256(content)
    const ipfsHash = `Qm${contentHash.slice(2, 48)}` // Simulate IPFS hash format
    
    // Store in mock IPFS storage
    this.mockIPFSStorage.set(ipfsHash, bytesToHex(content))
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    return ipfsHash
  }

  private async retrieveFromIPFS(ipfsHash: string): Promise<Uint8Array | null> {
    // Mock IPFS retrieval
    const contentHex = this.mockIPFSStorage.get(ipfsHash)
    
    if (!contentHex) {
      return null
    }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800))
    
    return hexToBytes(contentHex as `0x${string}`)
  }

  private async removeFromIPFS(ipfsHash: string): Promise<void> {
    // Mock IPFS removal
    this.mockIPFSStorage.delete(ipfsHash)
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  private getFileCategory(contentType: string): string {
    if (contentType.startsWith('image/')) return 'Images'
    if (contentType.startsWith('application/pdf')) return 'PDFs'
    if (contentType.startsWith('text/')) return 'Text Documents'
    if (contentType.includes('document') || contentType.includes('word')) return 'Documents'
    if (contentType.includes('spreadsheet') || contentType.includes('excel')) return 'Spreadsheets'
    return 'Other'
  }

  /**
   * Create an encryption key for a user (would typically be derived from their private key)
   */
  static generateEncryptionKey(userPrivateKey: string, salt: string = 'spiced_vault'): string {
    const keyData = `${userPrivateKey}_${salt}_${Date.now()}`
    return keccak256(toBytes(keyData))
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // Check file size
    if (file.size > 5 * 1024 * 1024) {
      errors.push('File size exceeds 5MB limit')
    }

    if (file.size === 0) {
      errors.push('File is empty')
    }

    // Check file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (!allowedTypes.includes(file.type)) {
      errors.push('File type not supported')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}

export default IPFSVault