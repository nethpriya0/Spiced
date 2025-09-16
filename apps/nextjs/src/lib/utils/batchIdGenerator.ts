import { SPICE_CODES, type BatchIdData } from '@/types/passport'

/**
 * Generate human-readable batch ID
 * Format: {YYYY}{MM}{DD}-{SPICE_CODE}-{SEQUENCE}
 * Example: 20250829-CIN-001
 */
export function generateBatchId(
  spiceType: string,
  sequence: number,
  date: Date = new Date()
): string {
  // Get date components
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  // Get spice code
  const spiceCode = getSpiceCode(spiceType)
  
  // Format sequence with leading zeros
  const sequenceFormatted = String(sequence).padStart(3, '0')
  
  return `${year}${month}${day}-${spiceCode}-${sequenceFormatted}`
}

/**
 * Get spice code from spice type
 */
export function getSpiceCode(spiceType: string): string {
  // Check exact matches first
  const exactMatch = SPICE_CODES[spiceType as keyof typeof SPICE_CODES]
  if (exactMatch) {
    return exactMatch
  }
  
  // Check partial matches for common variations
  const normalizedType = spiceType.toLowerCase()
  
  if (normalizedType.includes('cinnamon')) return 'CIN'
  if (normalizedType.includes('cardamom')) return 'CAR'
  if (normalizedType.includes('pepper')) return 'PEP'
  if (normalizedType.includes('clove')) return 'CLA'
  if (normalizedType.includes('nutmeg')) return 'NUT'
  if (normalizedType.includes('mace')) return 'MAC'
  if (normalizedType.includes('vanilla')) return 'VAN'
  if (normalizedType.includes('turmeric')) return 'TUR'
  if (normalizedType.includes('ginger')) return 'GIN'
  
  // Generate generic code from first 3 characters
  const genericCode = spiceType
    .replace(/[^a-zA-Z]/g, '')
    .substring(0, 3)
    .toUpperCase()
    .padEnd(3, 'X')
  
  return genericCode
}

/**
 * Parse batch ID back into components
 */
export function parseBatchId(batchId: string): BatchIdData | null {
  const pattern = /^(\d{4})(\d{2})(\d{2})-([A-Z]{3})-(\d{3})$/
  const match = batchId.match(pattern)
  
  if (!match) {
    return null
  }
  
  const [, year, month, day, spiceCode, sequence] = match
  
  return {
    date: new Date(parseInt(year!), parseInt(month!) - 1, parseInt(day!)),
    spiceCode: spiceCode!,
    sequence: parseInt(sequence!)
  }
}

/**
 * Validate batch ID format
 */
export function isValidBatchId(batchId: string): boolean {
  return parseBatchId(batchId) !== null
}

/**
 * Generate next sequence number for a farmer and date
 * In a real implementation, this would query the database/contract
 */
export function getNextSequenceNumber(
  farmerAddress: string,
  date: Date = new Date()
): number {
  // For now, generate a random sequence (in production, this would be from DB)
  // Sequence resets daily per farmer
  const dayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
  const farmerDayKey = `${farmerAddress}-${dayKey}`
  
  // In a real app, this would be stored in localStorage or fetched from server
  const stored = localStorage.getItem(`batch-sequence-${farmerDayKey}`)
  const currentSequence = stored ? parseInt(stored) : 0
  const nextSequence = currentSequence + 1
  
  localStorage.setItem(`batch-sequence-${farmerDayKey}`, nextSequence.toString())
  
  return nextSequence
}

/**
 * Generate batch ID for a farmer's harvest
 */
export function generateFarmerBatchId(
  farmerAddress: string,
  spiceType: string,
  date: Date = new Date()
): string {
  const sequence = getNextSequenceNumber(farmerAddress, date)
  return generateBatchId(spiceType, sequence, date)
}

/**
 * Get display-friendly spice name from code
 */
export function getSpiceNameFromCode(spiceCode: string): string {
  const codeToName: Record<string, string> = {
    'CIN': 'Ceylon Cinnamon',
    'CAR': 'Ceylon Cardamom',
    'PEP': 'Ceylon Pepper', 
    'CLA': 'Ceylon Cloves',
    'NUT': 'Ceylon Nutmeg',
    'MAC': 'Ceylon Mace',
    'VAN': 'Vanilla',
    'TUR': 'Turmeric',
    'GIN': 'Ginger'
  }
  
  return codeToName[spiceCode] || spiceCode
}

/**
 * Generate batch ID with collision detection
 */
export async function generateUniqueBatchId(
  farmerAddress: string,
  spiceType: string,
  existingBatchIds: string[] = [],
  date: Date = new Date()
): Promise<string> {
  let attempts = 0
  const maxAttempts = 100
  
  while (attempts < maxAttempts) {
    const sequence = getNextSequenceNumber(farmerAddress, date)
    const batchId = generateBatchId(spiceType, sequence, date)
    
    if (!existingBatchIds.includes(batchId)) {
      return batchId
    }
    
    attempts++
  }
  
  throw new Error('Unable to generate unique batch ID after maximum attempts')
}

/**
 * Format batch ID for display with spacing
 */
export function formatBatchIdForDisplay(batchId: string): string {
  const parsed = parseBatchId(batchId)
  if (!parsed) return batchId
  
  const { date, spiceCode, sequence } = parsed
  const dateStr = date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
  
  return `${dateStr} • ${getSpiceNameFromCode(spiceCode)} • #${sequence}`
}

/**
 * Get batch ID statistics for a set of batch IDs
 */
export function getBatchIdStats(batchIds: string[]) {
  const spiceCounts: Record<string, number> = {}
  const dateCounts: Record<string, number> = {}
  let validCount = 0
  
  batchIds.forEach(batchId => {
    const parsed = parseBatchId(batchId)
    if (parsed) {
      validCount++
      
      // Count by spice type
      const spiceName = getSpiceNameFromCode(parsed.spiceCode)
      spiceCounts[spiceName] = (spiceCounts[spiceName] || 0) + 1
      
      // Count by date
      const dateKey = parsed.date.toISOString().split('T')[0]!
      dateCounts[dateKey] = (dateCounts[dateKey] || 0) + 1
    }
  })
  
  return {
    total: batchIds.length,
    valid: validCount,
    invalid: batchIds.length - validCount,
    spiceBreakdown: spiceCounts,
    dateBreakdown: dateCounts,
    mostCommonSpice: Object.entries(spiceCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || null
  }
}