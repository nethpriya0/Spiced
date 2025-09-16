import React, { useState, useEffect } from 'react'
import { 
  Shield, 
  Upload, 
  FileText, 
  Download, 
  Trash2, 
  Eye,
  EyeOff,
  Lock,
  Plus,
  Search,
  Filter,
  Calendar,
  HardDrive,
  Award,
  AlertTriangle,
  CheckCircle,
  Loader2,
  X
} from 'lucide-react'
import { IPFSVault, type VaultDocument } from '@/lib/storage/IPFSVault'
import { CredentialVerifier, type Credential } from '@/lib/zkp/CredentialVerifier'

interface CredentialVaultProps {
  userAddress: string
  privateKey: string
  onCredentialVerified?: (badge: string) => void
}

interface DocumentWithActions extends VaultDocument {
  isGeneratingProof?: boolean
  hasVerificationBadge?: string
}

export const CredentialVault: React.FC<CredentialVaultProps> = ({
  userAddress,
  privateKey,
  onCredentialVerified
}) => {
  const [documents, setDocuments] = useState<DocumentWithActions[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadTags, setUploadTags] = useState<string[]>([])
  const [uploadLoading, setUploadLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [vaultStats, setVaultStats] = useState({
    totalDocuments: 0,
    totalSize: 0,
    documentsByType: {} as Record<string, number>,
    recentUploads: 0
  })

  const vault = IPFSVault.getInstance()
  const verifier = CredentialVerifier.getInstance()

  useEffect(() => {
    loadDocuments()
    loadVaultStats()
  }, [userAddress])

  const loadDocuments = async () => {
    setLoading(true)
    try {
      const docs = await vault.listDocuments(userAddress)
      setDocuments(docs)
    } catch (error) {
      console.error('Failed to load documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadVaultStats = async () => {
    try {
      const stats = await vault.getVaultStats(userAddress)
      setVaultStats(stats)
    } catch (error) {
      console.error('Failed to load vault stats:', error)
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile) return

    setUploadLoading(true)
    try {
      // Generate encryption key
      const encryptionKey = IPFSVault.generateEncryptionKey(privateKey)

      // Upload to vault
      const result = await vault.uploadDocument(
        userAddress,
        selectedFile,
        encryptionKey,
        uploadTags,
        {
          uploadedBy: userAddress,
          originalName: selectedFile.name
        }
      )

      if (result.success && result.document) {
        await loadDocuments()
        await loadVaultStats()
        setUploadModalOpen(false)
        setSelectedFile(null)
        setUploadTags([])
      } else {
        alert('Upload failed: ' + result.error)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setUploadLoading(false)
    }
  }

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return
    }

    try {
      const result = await vault.deleteDocument(userAddress, documentId)
      if (result.success) {
        await loadDocuments()
        await loadVaultStats()
      } else {
        alert('Delete failed: ' + result.error)
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Delete failed')
    }
  }

  const handleDownloadDocument = async (vaultDoc: VaultDocument) => {
    try {
      const encryptionKey = IPFSVault.generateEncryptionKey(privateKey)
      const result = await vault.retrieveDocument(userAddress, vaultDoc.id, encryptionKey)
      
      if (result.success && result.content) {
        // Create download link
        const url = URL.createObjectURL(result.content)
        const a = document.createElement('a')
        a.href = url
        a.download = vaultDoc.filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else {
        alert('Download failed: ' + result.error)
      }
    } catch (error) {
      console.error('Download error:', error)
      alert('Download failed')
    }
  }

  const handleGenerateZKProof = async (document: VaultDocument) => {
    try {
      // Update document state to show loading
      setDocuments(prev => prev.map(doc => 
        doc.id === document.id 
          ? { ...doc, isGeneratingProof: true }
          : doc
      ))

      // Create credential from document metadata
      const credential: Credential = {
        id: document.id,
        type: inferCredentialType(document),
        issuer: document.metadata?.issuer || 'certified_authority',
        issuedTo: userAddress,
        issuedAt: document.uploadedAt,
        validUntil: document.metadata?.validUntil ? new Date(document.metadata.validUntil) : undefined,
        documentHash: document.ipfsHash,
        metadata: document.metadata
      }

      // Validate credential
      const validation = verifier.validateCredentialForProof(credential)
      if (!validation.valid) {
        alert('Credential validation failed:\n' + validation.errors.join('\n'))
        return
      }

      // Generate challenge and proof
      const challenge = verifier.generateChallenge()
      const proof = await verifier.generateProof({
        credential,
        privateKey,
        challenge
      })

      // Verify the proof
      const verification = await verifier.verifyProof(proof, credential.type)
      
      if (verification.valid && verification.badge) {
        // Update document with badge
        setDocuments(prev => prev.map(doc => 
          doc.id === document.id 
            ? { ...doc, isGeneratingProof: false, hasVerificationBadge: verification.badge || undefined }
            : doc
        ))

        if (onCredentialVerified) {
          onCredentialVerified(verification.badge)
        }

        alert(`Verification successful! You've earned the "${verification.badge}" badge.`)
      } else {
        alert('Proof verification failed: ' + verification.error)
      }
    } catch (error) {
      console.error('ZK Proof generation error:', error)
      alert('Proof generation failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      // Remove loading state
      setDocuments(prev => prev.map(doc => 
        doc.id === document.id 
          ? { ...doc, isGeneratingProof: false }
          : doc
      ))
    }
  }

  const inferCredentialType = (document: VaultDocument): Credential['type'] => {
    const filename = document.filename.toLowerCase()
    const tags = document.tags.map(tag => tag.toLowerCase())
    
    if (tags.includes('organic') || filename.includes('organic')) {
      return 'organic_certification'
    }
    if (tags.includes('quality') || filename.includes('quality') || filename.includes('grade')) {
      return 'quality_assurance'
    }
    if (tags.includes('fairtrade') || filename.includes('fairtrade') || filename.includes('fair')) {
      return 'fair_trade'
    }
    if (tags.includes('education') || filename.includes('certificate') || filename.includes('diploma')) {
      return 'education_certificate'
    }
    
    return 'organic_certification' // Default
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'verified' && doc.hasVerificationBadge) ||
                         (filterType === 'pending' && !doc.hasVerificationBadge)
    
    return matchesSearch && matchesFilter
  })

  const formatFileSize = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const availableCredentialTypes = verifier.getAvailableCredentialTypes()

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Private Credential Vault</h1>
              <p className="text-gray-600">Securely store documents and generate Zero-Knowledge Proofs</p>
            </div>
          </div>
          
          <button
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Upload Document
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{vaultStats.totalDocuments}</div>
                <div className="text-sm text-gray-600">Total Documents</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <HardDrive className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{formatFileSize(vaultStats.totalSize)}</div>
                <div className="text-sm text-gray-600">Storage Used</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {documents.filter(doc => doc.hasVerificationBadge).length}
                </div>
                <div className="text-sm text-gray-600">Verified Credentials</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{vaultStats.recentUploads}</div>
                <div className="text-sm text-gray-600">Recent Uploads</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search documents by name or tags..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Documents</option>
            <option value="verified">Verified Only</option>
            <option value="pending">Pending Verification</option>
          </select>
        </div>
      </div>

      {/* ZKP Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <div className="flex items-start gap-3">
          <Lock className="h-6 w-6 text-blue-600 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Zero-Knowledge Proofs</h3>
            <p className="text-blue-800 mb-4">
              Generate cryptographic proofs of your credentials without revealing sensitive information. 
              Your documents remain private while proving your qualifications publicly.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableCredentialTypes.map(credType => (
                <div key={credType.type} className="bg-blue-100 rounded p-3">
                  <div className="font-medium text-blue-900">{credType.displayName}</div>
                  <div className="text-sm text-blue-700">{credType.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Documents List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try adjusting your search terms.' : 'Upload your first document to get started.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDocuments.map(document => (
            <div key={document.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                    {document.filename}
                  </h3>
                  <div className="text-sm text-gray-600">
                    {formatFileSize(document.size)} • Uploaded {formatDate(document.uploadedAt)}
                  </div>
                  {document.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {document.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                {document.hasVerificationBadge && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                    <CheckCircle className="h-4 w-4" />
                    {document.hasVerificationBadge}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadDocument(document)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Download"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                  
                  <button
                    onClick={() => handleDeleteDocument(document.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                
                {!document.hasVerificationBadge && (
                  <button
                    onClick={() => handleGenerateZKProof(document)}
                    disabled={document.isGeneratingProof}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {document.isGeneratingProof ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating Proof...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4" />
                        Generate ZK Proof
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Upload Document</h2>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Document
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.txt,.doc,.docx"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Supported: PDF, Images (JPG, PNG, GIF), Text, Word documents (Max 5MB)
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g., organic, certification, quality"
                  onChange={(e) => setUploadTags(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Tags help with organization and ZK proof generation
                </p>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Privacy Notice:</p>
                    <p>Documents are encrypted and stored on IPFS. Only you can decrypt and access your files.</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setUploadModalOpen(false)}
                  className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFileUpload}
                  disabled={!selectedFile || uploadLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploadLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload & Encrypt
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CredentialVault