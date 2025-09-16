import { useState, useEffect } from 'react'

interface Document {
  id: string
  title: string
  description?: string
  category: 'certification' | 'license' | 'identity' | 'education' | 'other'
  fileType: string
  fileSize: number
  uploadedAt: Date
  confidential: boolean
  ipfsHash: string
  encryptionKey?: string
}

interface Badge {
  id: string
  name: string
  description: string
  type: 'certification' | 'achievement' | 'verification' | 'community'
  status: 'earned' | 'pending' | 'available'
  earnedDate?: Date
  expiryDate?: Date
  issuer: string
  documentId?: string
  verificationUrl?: string
  icon: string
}

interface DocumentMetadata {
  title: string
  description: string
  category: 'certification' | 'license' | 'identity' | 'education' | 'other'
  confidential: boolean
}

export function useDocumentVault() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [badges, setBadges] = useState<Badge[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load initial data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Simulate API loading delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock initial data - in real app this would come from API/IPFS
      const mockDocuments: Document[] = [
        {
          id: '1',
          title: 'Organic Farming Certificate',
          description: 'Certificate for organic farming practices from Sri Lankan Organic Agriculture Association',
          category: 'certification',
          fileType: 'pdf',
          fileSize: 2548000,
          uploadedAt: new Date('2024-01-15'),
          confidential: true,
          ipfsHash: 'QmX7vQj9K5L8xHyB2N3mPkRz6aWdFcGt4sUqE9hYwRvTp'
        },
        {
          id: '2',
          title: 'Business License',
          description: 'Official business registration and trading license',
          category: 'license',
          fileType: 'pdf',
          fileSize: 1843000,
          uploadedAt: new Date('2024-01-20'),
          confidential: true,
          ipfsHash: 'QmY8wRk0M6L9yJzC3O4nQlSa7bXeGdUt5vVrF0hZxSwUq'
        }
      ]

      const mockBadges: Badge[] = [
        {
          id: 'organic_verified',
          name: 'Organic Verified',
          description: 'Verified organic farming practices',
          type: 'certification',
          status: 'earned',
          earnedDate: new Date('2024-01-16'),
          issuer: 'Spice Platform',
          documentId: '1',
          icon: '🌱'
        }
      ]

      setDocuments(mockDocuments)
      setBadges(mockBadges)
    } catch (err) {
      setError('Failed to load vault data')
      console.error('Error loading vault data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const uploadDocument = async (file: File, metadata: DocumentMetadata): Promise<void> => {
    try {
      setError(null)
      
      // Simulate file encryption and IPFS upload
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newDocument: Document = {
        id: Date.now().toString(),
        title: metadata.title,
        description: metadata.description,
        category: metadata.category,
        fileType: file.name.split('.').pop()?.toLowerCase() || 'unknown',
        fileSize: file.size,
        uploadedAt: new Date(),
        confidential: metadata.confidential,
        ipfsHash: 'Qm' + Array.from({ length: 44 }, () => 
          'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[
            Math.floor(Math.random() * 62)
          ]
        ).join(''),
        encryptionKey: Array.from({ length: 32 }, () => 
          Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
        ).join('')
      }
      
      setDocuments(prev => [...prev, newDocument])
      
      // Check if this document qualifies for any badges
      await checkForNewBadges(newDocument)
      
    } catch (err) {
      setError('Failed to upload document')
      throw err
    }
  }

  const deleteDocument = async (documentId: string): Promise<void> => {
    try {
      setError(null)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setDocuments(prev => prev.filter(doc => doc.id !== documentId))
      setBadges(prev => prev.filter(badge => badge.documentId !== documentId))
      
    } catch (err) {
      setError('Failed to delete document')
      throw err
    }
  }

  const generateZKP = async (documentId: string, proofType: string): Promise<any> => {
    try {
      setError(null)
      
      // Simulate ZKP generation
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const document = documents.find(d => d.id === documentId)
      if (!document) {
        throw new Error('Document not found')
      }
      
      // Mock ZKP result
      const zkProof = {
        proofType,
        documentId,
        proof: '0x' + Array.from({ length: 128 }, () => 
          Math.floor(Math.random() * 16).toString(16)
        ).join(''),
        publicSignals: [
          '0x' + Array.from({ length: 64 }, () => 
            Math.floor(Math.random() * 16).toString(16)
          ).join(''),
          '0x' + Array.from({ length: 64 }, () => 
            Math.floor(Math.random() * 16).toString(16)
          ).join('')
        ],
        verificationKey: '0x' + Array.from({ length: 64 }, () => 
          Math.floor(Math.random() * 16).toString(16)
        ).join(''),
        timestamp: new Date()
      }
      
      return zkProof
      
    } catch (err) {
      setError('Failed to generate zero-knowledge proof')
      throw err
    }
  }

  const checkForNewBadges = async (document: Document): Promise<void> => {
    // Check if document qualifies for any badges
    const potentialBadges: Badge[] = []
    
    if (document.category === 'certification' && document.title.toLowerCase().includes('organic')) {
      potentialBadges.push({
        id: `organic_verified_${Date.now()}`,
        name: 'Organic Verified',
        description: 'Verified organic farming practices through official certification',
        type: 'certification',
        status: 'pending',
        issuer: 'Spice Platform',
        documentId: document.id,
        icon: '🌱'
      })
    }
    
    if (document.category === 'license') {
      potentialBadges.push({
        id: `business_verified_${Date.now()}`,
        name: 'Business Verified',
        description: 'Verified business registration and trading license',
        type: 'verification',
        status: 'pending',
        issuer: 'Spice Platform',
        documentId: document.id,
        icon: '✅'
      })
    }
    
    if (potentialBadges.length > 0) {
      setBadges(prev => [...prev, ...potentialBadges])
    }
  }

  const refreshData = () => {
    loadData()
  }

  return {
    documents,
    badges,
    isLoading,
    error,
    uploadDocument,
    deleteDocument,
    generateZKP,
    refreshData
  }
}