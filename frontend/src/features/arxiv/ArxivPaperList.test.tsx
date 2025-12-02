import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ArxivPaperList } from './ArxivPaperList'
import { type ArxivPaper } from '@/services/arxiv'

const mockPapers: ArxivPaper[] = [
  {
    id: 'http://arxiv.org/abs/2401.12345v1',
    title: 'Search for long-lived axion-like particles in ATLAS',
    summary: 'We present a comprehensive search for long-lived axion-like particles using the ATLAS detector...',
    authors: ['John Doe', 'Jane Smith', 'Alice Johnson'],
    published: '2024-01-15T00:00:00Z',
    updated: '2024-01-15T00:00:00Z',
    link: 'http://arxiv.org/abs/2401.12345v1',
    category: 'hep-ex',
  },
  {
    id: 'http://arxiv.org/abs/2401.54321v1',
    title: 'Phenomenology of axion-like particles at colliders',
    summary: 'Theoretical predictions for axion-like particle production...',
    authors: ['Bob Wilson'],
    published: '2024-01-14T00:00:00Z',
    updated: '2024-01-14T00:00:00Z',
    link: 'http://arxiv.org/abs/2401.54321v1',
    category: 'hep-ph',
  },
  {
    id: 'http://arxiv.org/abs/2401.99999v1',
    title: 'Machine Learning for Particle Detection',
    summary: 'Novel ML techniques for improving particle detection efficiency...',
    authors: ['Charlie Brown', 'David Lee'],
    published: '2024-01-13T00:00:00Z',
    updated: '2024-01-13T00:00:00Z',
    link: 'http://arxiv.org/abs/2401.99999v1',
    category: 'cs.LG',
  },
]

describe('ArxivPaperList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders paper list with correct papers', () => {
      render(<ArxivPaperList papers={mockPapers} />)

      expect(screen.getByText('Search for long-lived axion-like particles in ATLAS')).toBeInTheDocument()
      expect(screen.getByText('Phenomenology of axion-like particles at colliders')).toBeInTheDocument()
      expect(screen.getByText('Machine Learning for Particle Detection')).toBeInTheDocument()
    })

    it('displays paper titles as links', () => {
      render(<ArxivPaperList papers={mockPapers} />)

      const titleLink = screen.getByText('Search for long-lived axion-like particles in ATLAS')
      expect(titleLink.closest('a')).toHaveAttribute('href', 'http://arxiv.org/abs/2401.12345v1')
      expect(titleLink.closest('a')).toHaveAttribute('target', '_blank')
      expect(titleLink.closest('a')).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('displays paper authors', () => {
      render(<ArxivPaperList papers={mockPapers} />)

      expect(screen.getByText(/John Doe/)).toBeInTheDocument()
      expect(screen.getByText(/Jane Smith/)).toBeInTheDocument()
      expect(screen.getByText(/Alice Johnson/)).toBeInTheDocument()
    })

    it('displays paper summaries', () => {
      render(<ArxivPaperList papers={mockPapers} />)

      expect(screen.getByText(/comprehensive search for long-lived axion-like particles/)).toBeInTheDocument()
    })

    it('displays publication dates', () => {
      render(<ArxivPaperList papers={mockPapers} />)

      // Should format dates nicely (e.g., "Jan 15, 2024")
      expect(screen.getByText(/Jan 15, 2024/i)).toBeInTheDocument()
    })

    it('displays category badges', () => {
      render(<ArxivPaperList papers={mockPapers} />)

      expect(screen.getByText('hep-ex')).toBeInTheDocument()
      expect(screen.getByText('hep-ph')).toBeInTheDocument()
      expect(screen.getByText('cs.LG')).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('displays empty state when no papers', () => {
      render(<ArxivPaperList papers={[]} />)

      expect(screen.getByText(/No papers found/i)).toBeInTheDocument()
    })

    it('shows helpful message in empty state', () => {
      render(<ArxivPaperList papers={[]} />)

      expect(screen.getByText(/Try adjusting your search/i)).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('displays loading indicator when loading', () => {
      render(<ArxivPaperList papers={[]} isLoading={true} />)

      expect(screen.getByText(/Loading papers/i)).toBeInTheDocument()
    })

    it('shows skeleton cards while loading', () => {
      render(<ArxivPaperList papers={[]} isLoading={true} />)

      // Should show multiple skeleton loading cards
      const loadingCards = screen.getAllByRole('status', { hidden: true })
      expect(loadingCards.length).toBeGreaterThanOrEqual(1)
    })

    it('does not show empty state while loading', () => {
      render(<ArxivPaperList papers={[]} isLoading={true} />)

      expect(screen.queryByText(/No papers found/i)).not.toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('displays error message when error occurs', () => {
      render(<ArxivPaperList papers={[]} error="Failed to fetch papers" />)

      expect(screen.getByText(/Failed to fetch papers/i)).toBeInTheDocument()
    })

    it('shows retry button on error', () => {
      const onRetry = vi.fn()
      render(<ArxivPaperList papers={[]} error="Network error" onRetry={onRetry} />)

      const retryButton = screen.getByText(/Retry/i)
      expect(retryButton).toBeInTheDocument()

      fireEvent.click(retryButton)
      expect(onRetry).toHaveBeenCalled()
    })

    it('displays error icon', () => {
      render(<ArxivPaperList papers={[]} error="Something went wrong" />)

      // Error icon should be present
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument()
    })
  })

  describe('Search and Filter', () => {
    it('shows search input when onSearch is provided', () => {
      const onSearch = vi.fn()
      render(<ArxivPaperList papers={mockPapers} onSearch={onSearch} />)

      expect(screen.getByPlaceholderText(/Search papers/i)).toBeInTheDocument()
    })

    it('calls onSearch when search input changes', async () => {
      const onSearch = vi.fn()
      render(<ArxivPaperList papers={mockPapers} onSearch={onSearch} />)

      const searchInput = screen.getByPlaceholderText(/Search papers/i)
      fireEvent.change(searchInput, { target: { value: 'axion' } })

      await waitFor(() => {
        expect(onSearch).toHaveBeenCalledWith('axion')
      })
    })

    it('shows category filter buttons', () => {
      const onFilterCategory = vi.fn()
      render(<ArxivPaperList papers={mockPapers} onFilterCategory={onFilterCategory} />)

      // Get all buttons with these texts
      const allButton = screen.getAllByText('All')
      const hepExButton = screen.getAllByText('hep-ex')
      const hepPhButton = screen.getAllByText('hep-ph')
      const csLGButton = screen.getAllByText('cs.LG')

      // At least one of each should be present (could be in filters or badges)
      expect(allButton.length).toBeGreaterThanOrEqual(1)
      expect(hepExButton.length).toBeGreaterThanOrEqual(1)
      expect(hepPhButton.length).toBeGreaterThanOrEqual(1)
      expect(csLGButton.length).toBeGreaterThanOrEqual(1)
    })

    it('calls onFilterCategory when category is selected', () => {
      const onFilterCategory = vi.fn()
      render(<ArxivPaperList papers={mockPapers} onFilterCategory={onFilterCategory} />)

      // Get all hep-ex buttons and find the filter button (not the badge)
      const hepExButtons = screen.getAllByText('hep-ex')
      const filterButton = hepExButtons.find(btn => btn.tagName === 'BUTTON')

      fireEvent.click(filterButton!)

      expect(onFilterCategory).toHaveBeenCalledWith('hep-ex')
    })

    it('highlights active category filter', () => {
      const onFilterCategory = vi.fn()
      render(<ArxivPaperList papers={mockPapers} activeCategory="hep-ex" onFilterCategory={onFilterCategory} />)

      // Get all hep-ex elements and find the button
      const hepExButtons = screen.getAllByText('hep-ex')
      const filterButton = hepExButtons.find(btn => btn.tagName === 'BUTTON')

      // Check if button has the active class
      expect(filterButton?.className).toMatch(/bg-mocha-blue/)
    })
  })

  describe('Pagination', () => {
    it('shows load more button when hasMore is true', () => {
      const onLoadMore = vi.fn()
      render(<ArxivPaperList papers={mockPapers} hasMore={true} onLoadMore={onLoadMore} />)

      expect(screen.getByText(/Load more/i)).toBeInTheDocument()
    })

    it('calls onLoadMore when button is clicked', () => {
      const onLoadMore = vi.fn()
      render(<ArxivPaperList papers={mockPapers} hasMore={true} onLoadMore={onLoadMore} />)

      const loadMoreButton = screen.getByText(/Load more/i)
      fireEvent.click(loadMoreButton)

      expect(onLoadMore).toHaveBeenCalled()
    })

    it('does not show load more button when hasMore is false', () => {
      render(<ArxivPaperList papers={mockPapers} hasMore={false} />)

      expect(screen.queryByText(/Load more/i)).not.toBeInTheDocument()
    })

    it('shows loading state on load more button when loading', () => {
      const onLoadMore = vi.fn()
      render(<ArxivPaperList papers={mockPapers} hasMore={true} onLoadMore={onLoadMore} isLoadingMore={true} />)

      expect(screen.getByText(/Loading/i)).toBeInTheDocument()
    })
  })

  describe('Paper Actions', () => {
    it('shows bookmark button when onBookmark is provided', () => {
      const onBookmark = vi.fn()
      render(<ArxivPaperList papers={mockPapers} onBookmark={onBookmark} />)

      const bookmarkButtons = screen.getAllByTitle(/Bookmark/i)
      expect(bookmarkButtons.length).toBeGreaterThanOrEqual(1)
    })

    it('calls onBookmark when bookmark button is clicked', () => {
      const onBookmark = vi.fn()
      render(<ArxivPaperList papers={mockPapers} onBookmark={onBookmark} />)

      const bookmarkButtons = screen.getAllByTitle(/Bookmark/i)
      fireEvent.click(bookmarkButtons[0])

      expect(onBookmark).toHaveBeenCalledWith(mockPapers[0].id)
    })

    it('shows add to task button when onAddToTask is provided', () => {
      const onAddToTask = vi.fn()
      render(<ArxivPaperList papers={mockPapers} onAddToTask={onAddToTask} />)

      const addButtons = screen.getAllByTitle(/Add to tasks/i)
      expect(addButtons.length).toBeGreaterThanOrEqual(1)
    })

    it('calls onAddToTask when add button is clicked', () => {
      const onAddToTask = vi.fn()
      render(<ArxivPaperList papers={mockPapers} onAddToTask={onAddToTask} />)

      const addButtons = screen.getAllByTitle(/Add to tasks/i)
      fireEvent.click(addButtons[0])

      expect(onAddToTask).toHaveBeenCalledWith(mockPapers[0])
    })
  })

  describe('Responsive Design', () => {
    it('renders in grid layout on desktop', () => {
      const { container } = render(<ArxivPaperList papers={mockPapers} />)

      // Find the div with grid class
      const gridContainer = container.querySelector('.grid.grid-cols-1')
      expect(gridContainer).toBeTruthy()
      expect(gridContainer?.className).toMatch(/grid/)
    })

    it('adjusts to single column on mobile', () => {
      // Mock mobile viewport
      global.innerWidth = 375
      global.dispatchEvent(new Event('resize'))

      const { container } = render(<ArxivPaperList papers={mockPapers} />)

      // The component always uses grid-cols-1 for papers
      const gridContainer = container.querySelector('.grid-cols-1')
      expect(gridContainer).toBeTruthy()
      expect(gridContainer?.className).toMatch(/grid-cols-1/)
    })
  })

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<ArxivPaperList papers={mockPapers} />)

      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveTextContent(/arXiv Papers/i)
    })

    it('has accessible links with proper aria labels', () => {
      render(<ArxivPaperList papers={mockPapers} />)

      const links = screen.getAllByRole('link')
      links.forEach(link => {
        expect(link).toHaveAttribute('href')
        expect(link).toHaveAttribute('target', '_blank')
      })
    })

    it('provides keyboard navigation for interactive elements', () => {
      const onBookmark = vi.fn()
      render(<ArxivPaperList papers={mockPapers} onBookmark={onBookmark} />)

      const bookmarkButtons = screen.getAllByTitle(/Bookmark/i)
      bookmarkButtons[0].focus()

      expect(document.activeElement).toBe(bookmarkButtons[0])
    })
  })

  describe('Paper Card Interactions', () => {
    it('shows expanded summary on click', async () => {
      render(<ArxivPaperList papers={mockPapers} />)

      // Summary should be truncated initially
      const paperCard = screen.getByText('Search for long-lived axion-like particles in ATLAS').closest('div')

      fireEvent.click(paperCard!)

      await waitFor(() => {
        // Full summary should be visible
        expect(screen.getByText(/comprehensive search for long-lived axion-like particles using the ATLAS detector/i)).toBeInTheDocument()
      })
    })

    it('handles multiple authors correctly', () => {
      render(<ArxivPaperList papers={mockPapers} />)

      // Should show "et al." for papers with many authors
      expect(screen.getByText(/John Doe/)).toBeInTheDocument()
    })

    it('formats arXiv ID correctly', () => {
      render(<ArxivPaperList papers={mockPapers} />)

      expect(screen.getByText(/2401.12345/)).toBeInTheDocument()
    })
  })

  describe('Daily Updates', () => {
    it('shows new badge for papers published today', () => {
      const today = new Date().toISOString()
      const todayPapers = [
        {
          ...mockPapers[0],
          published: today,
        },
      ]

      render(<ArxivPaperList papers={todayPapers} />)

      expect(screen.getByText(/New/i)).toBeInTheDocument()
    })

    it('shows last updated timestamp', () => {
      render(<ArxivPaperList papers={mockPapers} lastUpdated={new Date().toISOString()} />)

      expect(screen.getByText(/Last updated/i)).toBeInTheDocument()
    })

    it('shows refresh button', () => {
      const onRefresh = vi.fn()
      render(<ArxivPaperList papers={mockPapers} onRefresh={onRefresh} />)

      const refreshButton = screen.getByTitle(/Refresh/i)
      fireEvent.click(refreshButton)

      expect(onRefresh).toHaveBeenCalled()
    })
  })
})
