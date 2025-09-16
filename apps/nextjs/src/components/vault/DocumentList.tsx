import React, { useState } from 'react'
import { FileText, Download, Trash2, Eye, Shield, Clock, AlertCircle } from 'lucide-react'

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

interface DocumentListProps {
  documents: Document[]
  onDelete: (documentId: string) => void
  onSelect: (documentId: string) => void
  selectedDocument: string | null
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onDelete,
  onSelect,
  selectedDocument
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'certification':
        return '🏆'
      case 'license':
        return '📜'
      case 'identity':
        return '🆔'
      case 'education':
        return '🎓'
      default:
        return '📄'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'certification':
        return 'bg-yellow-100 text-yellow-800'
      case 'license':
        return 'bg-blue-100 text-blue-800'
      case 'identity':
        return 'bg-purple-100 text-purple-800'
      case 'education':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleDelete = (documentId: string) => {
    onDelete(documentId)
    setShowDeleteConfirm(null)
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents uploaded</h3>
        <p className="text-gray-600">
          Upload your first credential or certificate to get started with verification badges.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {documents.map((document) => (
        <div
          key={document.id}
          className={`border rounded-lg p-4 transition-all cursor-pointer ${
            selectedDocument === document.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
          }`}
          onClick={() => onSelect(document.id)}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className="flex-shrink-0 text-2xl">
                {getCategoryIcon(document.category)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {document.title}
                  </h3>
                  {document.confidential && (
                    <div title="Confidential">
                      <Shield className="h-4 w-4 text-orange-500" />
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 mb-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(document.category)}`}>
                    {document.category}
                  </span>
                  <span className="text-sm text-gray-500">
                    {document.fileType.toUpperCase()} • {formatFileSize(document.fileSize)}
                  </span>
                </div>
                
                {document.description && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {document.description}
                  </p>
                )}
                
                <div className="flex items-center text-xs text-gray-500 space-x-4">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Uploaded {formatDate(document.uploadedAt)}
                  </div>
                  <div className="flex items-center">
                    <Shield className="h-3 w-3 mr-1 text-green-500" />
                    Encrypted on IPFS
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  // TODO: Implement document preview
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                title="Preview document"
              >
                <Eye className="h-4 w-4" />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  // TODO: Implement document download
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                title="Download document"
              >
                <Download className="h-4 w-4" />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowDeleteConfirm(document.id)
                }}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                title="Delete document"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {selectedDocument === document.id && (
            <div className="mt-4 pt-4 border-t border-blue-200 bg-blue-25">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong className="text-gray-700">IPFS Hash:</strong>
                  <code className="block text-xs font-mono text-gray-600 mt-1 break-all">
                    {document.ipfsHash}
                  </code>
                </div>
                <div>
                  <strong className="text-gray-700">Status:</strong>
                  <div className="mt-1 flex items-center text-green-600">
                    <Shield className="h-3 w-3 mr-1" />
                    Encrypted & Stored
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Delete Document</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this document? This action cannot be undone,
              and the document will be permanently removed from IPFS.
            </p>
            
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700"
              >
                Delete Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}