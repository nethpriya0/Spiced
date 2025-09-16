import React from 'react'
import { render, screen } from '@testing-library/react'
import { ProvenanceTimeline } from '../ProvenanceTimeline'

describe('ProvenanceTimeline', () => {
  const defaultProps = {
    batchId: 'batch123',
    harvestDate: '2024-01-15T10:00:00Z',
    sealedAt: '2024-01-22T15:30:00Z'
  }

  it('should render all timeline steps', () => {
    render(<ProvenanceTimeline {...defaultProps} />)

    expect(screen.getByText('Harvest Collection')).toBeInTheDocument()
    expect(screen.getByText('Initial Processing')).toBeInTheDocument()
    expect(screen.getByText('Traditional Drying')).toBeInTheDocument()
    expect(screen.getByText('Final Processing & Packaging')).toBeInTheDocument()
    expect(screen.getByText('Blockchain Sealing')).toBeInTheDocument()
  })

  it('should display step descriptions', () => {
    render(<ProvenanceTimeline {...defaultProps} />)

    expect(screen.getByText('Spices harvested from certified organic plantation')).toBeInTheDocument()
    expect(screen.getByText('Cleaning, sorting and preliminary preparation')).toBeInTheDocument()
    expect(screen.getByText('Sun-drying using traditional methods')).toBeInTheDocument()
    expect(screen.getByText('Final preparation and quality control')).toBeInTheDocument()
    expect(screen.getByText('Permanent sealing on blockchain for authenticity')).toBeInTheDocument()
  })

  it('should show processing details for each step', () => {
    render(<ProvenanceTimeline {...defaultProps} />)

    expect(screen.getByText('Manual harvesting at optimal ripeness')).toBeInTheDocument()
    expect(screen.getByText('GPS coordinates recorded: 7.2906°N, 80.6337°E')).toBeInTheDocument()
    expect(screen.getByText('Weather conditions: Sunny, 28°C')).toBeInTheDocument()
    expect(screen.getByText('Quality assessment: Grade AA')).toBeInTheDocument()
  })

  it('should display photo and document counts', () => {
    render(<ProvenanceTimeline {...defaultProps} />)

    expect(screen.getByText('3 photos')).toBeInTheDocument()
    expect(screen.getByText('4 photos')).toBeInTheDocument()
    expect(screen.getByText('6 photos')).toBeInTheDocument()
    expect(screen.getByText('2 photos')).toBeInTheDocument()
    
    expect(screen.getAllByText('1 document')).toHaveLength(3) // Multiple steps have 1 document
    expect(screen.getAllByText('2 documents')).toHaveLength(2) // Two steps have 2 documents
  })

  it('should format timestamps correctly', () => {
    render(<ProvenanceTimeline {...defaultProps} />)

    // Should format the harvest date
    expect(screen.getByText(/Mon, Jan 15/)).toBeInTheDocument()
    
    // Should format the sealed date
    expect(screen.getByText(/Mon, Jan 22/)).toBeInTheDocument()
  })

  it('should show all steps as completed', () => {
    render(<ProvenanceTimeline {...defaultProps} />)

    // All steps should have completed status (green checkmarks)
    const checkCircles = document.querySelectorAll('.lucide-check-circle')
    expect(checkCircles).toHaveLength(5) // All 5 steps should be completed
  })

  it('should display summary stats', () => {
    render(<ProvenanceTimeline {...defaultProps} />)

    expect(screen.getByText('Steps Completed')).toBeInTheDocument()
    expect(screen.getByText('Photos Recorded')).toBeInTheDocument()
    expect(screen.getByText('Days Tracked')).toBeInTheDocument()

    // Should show correct counts
    expect(screen.getByText('5')).toBeInTheDocument() // 5 steps completed
    expect(screen.getByText('15')).toBeInTheDocument() // Total photos (3+4+6+2+0)
    expect(screen.getByText('7')).toBeInTheDocument() // Days between harvest and sealing
  })

  it('should calculate correct number of days tracked', () => {
    const harvestDate = '2024-01-15T10:00:00Z'
    const sealedAt = '2024-01-20T15:30:00Z' // 5 days later
    
    render(<ProvenanceTimeline batchId="test" harvestDate={harvestDate} sealedAt={sealedAt} />)

    expect(screen.getByText('5')).toBeInTheDocument() // Should show 5 days
  })

  it('should handle single day difference', () => {
    const harvestDate = '2024-01-15T10:00:00Z'
    const sealedAt = '2024-01-15T15:30:00Z' // Same day
    
    render(<ProvenanceTimeline batchId="test" harvestDate={harvestDate} sealedAt={sealedAt} />)

    // Should show 0 days - look for it in the "Days Tracked" section specifically
    const statsSection = screen.getByText('Days Tracked').closest('div')
    expect(statsSection?.textContent).toContain('0')
  })

  it('should show proper visual styling for completed steps', () => {
    render(<ProvenanceTimeline {...defaultProps} />)

    // All steps should have green checkmarks since they're completed
    const completedSteps = document.querySelectorAll('.text-green-600')
    expect(completedSteps.length).toBeGreaterThan(0)
  })

  it('should display timeline with proper structure', () => {
    render(<ProvenanceTimeline {...defaultProps} />)

    // Should have the vertical timeline line
    expect(document.querySelector('.absolute.left-6')).toBeInTheDocument()
    
    // Should have proper spacing between steps
    const stepContainer = document.querySelector('.space-y-8')
    expect(stepContainer).toBeInTheDocument()
  })

  it('should show processing details in expandable sections', () => {
    render(<ProvenanceTimeline {...defaultProps} />)

    // Processing details should be in gray boxes
    const processingDetails = document.querySelectorAll('.bg-gray-50.rounded-lg')
    expect(processingDetails.length).toBeGreaterThan(0)

    // Should have "Processing Details" headers
    const detailHeaders = screen.getAllByText('Processing Details')
    expect(detailHeaders).toHaveLength(5) // One for each step
  })

  it('should handle different timestamp formats', () => {
    const propsWithDifferentFormat = {
      batchId: 'batch123',
      harvestDate: '2024-01-15', // ISO date without time
      sealedAt: '2024-01-22' // ISO date without time
    }

    render(<ProvenanceTimeline {...propsWithDifferentFormat} />)

    // Should still render without errors
    expect(screen.getByText('Harvest Collection')).toBeInTheDocument()
    expect(screen.getByText('Blockchain Sealing')).toBeInTheDocument()
  })

  it('should display proper icons for each step', () => {
    render(<ProvenanceTimeline {...defaultProps} />)

    // Should have various step icons (though they're rendered as completed checkmarks)
    const icons = document.querySelectorAll('svg')
    expect(icons.length).toBeGreaterThan(10) // Multiple icons throughout the component
  })
})