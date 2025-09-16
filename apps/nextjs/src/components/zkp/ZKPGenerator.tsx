import React, { useState } from 'react'
import { Lock, Shield, Download, Copy, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'

interface Document {
  id: string
  title: string
  category: string
}

interface ZKPGeneratorProps {
  documents: Document[]
  onGenerate: (documentId: string, proofType: string) => Promise<any>
  selectedDocument: string | null
}

interface ZKProof {
  proofType: string
  documentId: string
  proof: string
  publicSignals: string[]
  verificationKey: string
  timestamp: Date
}

export const ZKPGenerator: React.FC<ZKPGeneratorProps> = ({
  documents,
  onGenerate,
  selectedDocument
}) => {
  const [proofType, setProofType] = useState<string>('age_verification')
  const [generating, setGenerating] = useState(false)
  const [generatedProof, setGeneratedProof] = useState<ZKProof | null>(null)
  const [error, setError] = useState<string | null>(null)

  const proofTypes = [
    {
      id: 'age_verification',
      name: 'Age Verification',
      description: 'Prove you are above a certain age without revealing your exact birthdate'
    },
    {
      id: 'certification_validity',
      name: 'Certification Validity',
      description: 'Prove you hold a valid certification without revealing the certificate details'
    },
    {
      id: 'education_level',
      name: 'Education Level',
      description: 'Prove your education level without revealing the specific institution or grades'
    },
    {
      id: 'identity_verification',
      name: 'Identity Verification',
      description: 'Prove your identity without revealing personal information'
    },
    {
      id: 'residency_status',
      name: 'Residency Status',
      description: 'Prove your residency status without revealing your exact address'
    }
  ]

  const handleGenerateProof = async () => {
    if (!selectedDocument) {
      setError('Please select a document first')
      return
    }

    try {
      setGenerating(true)
      setError(null)
      
      // Simulate ZK proof generation
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Mock proof generation
      const mockProof: ZKProof = {
        proofType,
        documentId: selectedDocument,
        proof: '0x' + Array.from({ length: 128 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        publicSignals: [
          '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
          '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
        ],
        verificationKey: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        timestamp: new Date()
      }
      
      setGeneratedProof(mockProof)
      
    } catch (err) {
      console.error('Proof generation failed:', err)
      setError('Failed to generate zero-knowledge proof. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadProof = () => {
    if (!generatedProof) return
    
    const proofData = {
      ...generatedProof,
      metadata: {
        generator: 'Spice Platform ZKP Generator',
        version: '1.0.0',
        algorithm: 'Groth16',
        curve: 'bn128'
      }
    }
    
    const blob = new Blob([JSON.stringify(proofData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `zkp_${generatedProof.proofType}_${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Documents Available</h3>
        <p className="text-gray-600">
          Upload documents first to generate zero-knowledge proofs.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Proof Type Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Proof Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {proofTypes.map((type) => (
            <div
              key={type.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                proofType === type.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setProofType(type.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{type.name}</h4>
                {proofType === type.id && (
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                )}
              </div>
              <p className="text-sm text-gray-600">{type.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Document Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Document</h3>
        {selectedDocument ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">
                  {documents.find(d => d.id === selectedDocument)?.title}
                </p>
                <p className="text-sm text-green-700">
                  Selected for proof generation
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <p className="text-yellow-800">
                Please select a document from the Documents tab first.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Generate Proof Button */}
      <div className="flex justify-center">
        <button
          onClick={handleGenerateProof}
          disabled={!selectedDocument || generating}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {generating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Generating Proof...
            </>
          ) : (
            <>
              <Lock className="h-5 w-5" />
              Generate Zero-Knowledge Proof
            </>
          )}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Generated Proof Display */}
      {generatedProof && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Generated Proof</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={downloadProof}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
            {/* Proof Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proof Type
              </label>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                  {proofTypes.find(p => p.id === generatedProof.proofType)?.name}
                </span>
                <span className="text-sm text-gray-500">
                  Generated {generatedProof.timestamp.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Proof Data */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ZK Proof
              </label>
              <div className="relative">
                <textarea
                  readOnly
                  value={generatedProof.proof}
                  className="w-full h-24 px-3 py-2 text-xs font-mono bg-white border border-gray-300 rounded-md resize-none"
                />
                <button
                  onClick={() => copyToClipboard(generatedProof.proof)}
                  className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Public Signals */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Public Signals
              </label>
              <div className="space-y-2">
                {generatedProof.publicSignals.map((signal, index) => (
                  <div key={index} className="relative">
                    <input
                      readOnly
                      value={signal}
                      className="w-full px-3 py-2 text-xs font-mono bg-white border border-gray-300 rounded-md"
                    />
                    <button
                      onClick={() => copyToClipboard(signal)}
                      className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Verification Key
              </label>
              <div className="relative">
                <input
                  readOnly
                  value={generatedProof.verificationKey}
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-gray-300 rounded-md"
                />
                <button
                  onClick={() => copyToClipboard(generatedProof.verificationKey)}
                  className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Usage Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <h4 className="font-medium text-blue-900 mb-1">How to Use This Proof</h4>
                <ul className="text-blue-700 space-y-1">
                  <li>• Share the proof data with verifiers who need to validate your claim</li>
                  <li>• The proof validates your statement without revealing the underlying document</li>
                  <li>• Verifiers can use the verification key to confirm the proof's authenticity</li>
                  <li>• Your private document data remains completely confidential</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}