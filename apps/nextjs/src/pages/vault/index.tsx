import { useState, useEffect } from 'react'
import Head from 'next/head'
import { withAuth } from '@/middleware/withAuth'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { DocumentUpload } from '@/components/vault/DocumentUpload'
import { DocumentList } from '@/components/vault/DocumentList'
import { ZKPGenerator } from '@/components/zkp/ZKPGenerator'
import { BadgeManager } from '@/components/badges/BadgeManager'
import { useDocumentVault } from '@/hooks/useDocumentVault'
import { 
  Shield, 
  Upload, 
  FileText, 
  Award,
  Lock,
  Eye,
  EyeOff,
  Info
} from 'lucide-react'

function DocumentVaultPage() {
  const {
    documents,
    badges,
    isLoading,
    uploadDocument,
    deleteDocument,
    generateZKP,
    refreshData
  } = useDocumentVault()
  
  const [activeTab, setActiveTab] = useState<'documents' | 'badges' | 'zkp'>('documents')
  const [showUpload, setShowUpload] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null)

  return (
    <>
      <Head>
        <title>Document Vault - Spice Platform</title>
        <meta name="description" content="Secure document storage with zero-knowledge proof verification" />
      </Head>

      <DashboardLayout title="Document Vault">
        <div className="flex-1 p-6 bg-slate-50">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Private Document Vault</h1>
                  <p className="text-gray-600">
                    Securely store credentials and generate zero-knowledge proofs for verification
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                    <Shield className="h-4 w-4" />
                    <span>End-to-End Encrypted</span>
                  </div>
                  <button
                    onClick={() => setShowUpload(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-spice-green text-white rounded-lg hover:bg-spice-green-dark transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Document
                  </button>
                </div>
              </div>
              
              {/* Security Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <h3 className="font-medium text-blue-900 mb-1">How Your Privacy is Protected</h3>
                    <ul className="text-blue-800 space-y-1">
                      <li>• Documents are encrypted before being stored on IPFS</li>
                      <li>• Only you have the decryption key</li>
                      <li>• Zero-knowledge proofs let you verify credentials without revealing documents</li>
                      <li>• All cryptographic operations happen in your browser</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex">
                  <button
                    onClick={() => setActiveTab('documents')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'documents'
                        ? 'border-spice-green text-spice-green'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <FileText className="h-4 w-4 inline mr-2" />
                    My Documents ({documents.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('badges')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'badges'
                        ? 'border-spice-green text-spice-green'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Award className="h-4 w-4 inline mr-2" />
                    Verification Badges ({badges.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('zkp')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'zkp'
                        ? 'border-spice-green text-spice-green'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Lock className="h-4 w-4 inline mr-2" />
                    ZKP Generator
                  </button>
                </nav>
              </div>
              
              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'documents' && (
                  <div>
                    {isLoading ? (
                      <div className="text-center py-12">
                        <div className="w-8 h-8 border-2 border-spice-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">Loading documents...</p>
                      </div>
                    ) : documents.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          No documents uploaded
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Upload your first credential or certificate to get started with verification badges.
                        </p>
                        <button
                          onClick={() => setShowUpload(true)}
                          className="px-6 py-3 bg-spice-green text-white rounded-lg hover:bg-spice-green-dark transition-colors"
                        >
                          Upload First Document
                        </button>
                      </div>
                    ) : (
                      <DocumentList
                        documents={documents}
                        onDelete={deleteDocument}
                        onSelect={setSelectedDocument}
                        selectedDocument={selectedDocument}
                      />
                    )}
                  </div>
                )}
                
                {activeTab === 'badges' && (
                  <div>
                    <BadgeManager 
                      badges={badges}
                      documents={documents}
                      onGenerateZKP={generateZKP}
                    />
                  </div>
                )}
                
                {activeTab === 'zkp' && (
                  <div>
                    <ZKPGenerator 
                      documents={documents}
                      onGenerate={generateZKP}
                      selectedDocument={selectedDocument}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Upload Modal */}
        {showUpload && (
          <DocumentUpload
            onUpload={uploadDocument}
            onClose={() => setShowUpload(false)}
          />
        )}
      </DashboardLayout>
    </>
  )
}

export default withAuth(DocumentVaultPage)