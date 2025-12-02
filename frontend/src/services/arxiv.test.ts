import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchArxivPapers, filterPapersByTopic, type ArxivPaper } from './arxiv'

// Mock fetch globally
global.fetch = vi.fn()

const mockArxivXMLResponse = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <id>http://arxiv.org/abs/2401.12345v1</id>
    <title>Search for long-lived particles in ATLAS</title>
    <summary>We present a search for long-lived axion-like particles...</summary>
    <author><name>John Doe</name></author>
    <author><name>Jane Smith</name></author>
    <published>2024-01-15T00:00:00Z</published>
    <updated>2024-01-15T00:00:00Z</updated>
    <link href="http://arxiv.org/abs/2401.12345v1" rel="alternate" type="text/html"/>
    <arxiv:primary_category xmlns:arxiv="http://arxiv.org/schemas/atom" term="hep-ex"/>
  </entry>
  <entry>
    <id>http://arxiv.org/abs/2401.54321v1</id>
    <title>Machine Learning for Particle Physics</title>
    <summary>Novel ML techniques for event classification...</summary>
    <author><name>Alice Johnson</name></author>
    <published>2024-01-14T00:00:00Z</published>
    <updated>2024-01-14T00:00:00Z</updated>
    <link href="http://arxiv.org/abs/2401.54321v1" rel="alternate" type="text/html"/>
    <arxiv:primary_category xmlns:arxiv="http://arxiv.org/schemas/atom" term="cs.LG"/>
  </entry>
</feed>`

const mockParsedPapers: ArxivPaper[] = [
  {
    id: 'http://arxiv.org/abs/2401.12345v1',
    title: 'Search for long-lived particles in ATLAS',
    summary: 'We present a search for long-lived axion-like particles...',
    authors: ['John Doe', 'Jane Smith'],
    published: '2024-01-15T00:00:00Z',
    updated: '2024-01-15T00:00:00Z',
    link: 'http://arxiv.org/abs/2401.12345v1',
    category: 'hep-ex',
  },
  {
    id: 'http://arxiv.org/abs/2401.54321v1',
    title: 'Machine Learning for Particle Physics',
    summary: 'Novel ML techniques for event classification...',
    authors: ['Alice Johnson'],
    published: '2024-01-14T00:00:00Z',
    updated: '2024-01-14T00:00:00Z',
    link: 'http://arxiv.org/abs/2401.54321v1',
    category: 'cs.LG',
  },
]

describe('arXiv Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchArxivPapers', () => {
    it('fetches papers from specified categories', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockArxivXMLResponse,
      })

      const papers = await fetchArxivPapers(['hep-ex', 'cs.LG'])

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('export.arxiv.org/api/query')
      )
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('search_query=cat%3Ahep-ex%2BOR%2Bcat%3Acs.LG')
      )
      expect(papers).toHaveLength(2)
      expect(papers[0].title).toBe('Search for long-lived particles in ATLAS')
    })

    it('fetches papers from hep-ex category', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockArxivXMLResponse,
      })

      await fetchArxivPapers(['hep-ex'])

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('cat%3Ahep-ex')
      )
    })

    it('fetches papers from hep-ph category', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockArxivXMLResponse,
      })

      await fetchArxivPapers(['hep-ph'])

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('cat%3Ahep-ph')
      )
    })

    it('fetches papers from cs.LG category', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockArxivXMLResponse,
      })

      await fetchArxivPapers(['cs.LG'])

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('cat%3Acs.LG')
      )
    })

    it('limits results to specified max_results', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockArxivXMLResponse,
      })

      await fetchArxivPapers(['hep-ex'], { maxResults: 10 })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('max_results=10')
      )
    })

    it('sorts by submittedDate descending by default', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockArxivXMLResponse,
      })

      await fetchArxivPapers(['hep-ex'])

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('sortBy=submittedDate')
      )
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('sortOrder=descending')
      )
    })

    it('parses XML response correctly', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockArxivXMLResponse,
      })

      const papers = await fetchArxivPapers(['hep-ex', 'cs.LG'])

      expect(papers[0]).toEqual({
        id: 'http://arxiv.org/abs/2401.12345v1',
        title: 'Search for long-lived particles in ATLAS',
        summary: 'We present a search for long-lived axion-like particles...',
        authors: ['John Doe', 'Jane Smith'],
        published: '2024-01-15T00:00:00Z',
        updated: '2024-01-15T00:00:00Z',
        link: 'http://arxiv.org/abs/2401.12345v1',
        category: 'hep-ex',
      })
    })

    it('handles network errors gracefully', async () => {
      ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

      await expect(fetchArxivPapers(['hep-ex'])).rejects.toThrow('Network error')
    })

    it('handles API errors gracefully', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      })

      await expect(fetchArxivPapers(['hep-ex'])).rejects.toThrow()
    })

    it('handles empty results', async () => {
      const emptyResponse = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
</feed>`

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => emptyResponse,
      })

      const papers = await fetchArxivPapers(['hep-ex'])

      expect(papers).toEqual([])
    })

    it('handles malformed XML gracefully', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => 'not valid xml',
      })

      await expect(fetchArxivPapers(['hep-ex'])).rejects.toThrow()
    })
  })

  describe('filterPapersByTopic', () => {
    it('filters papers by PhD topic keywords in title', () => {
      const filtered = filterPapersByTopic(mockParsedPapers, 'long-lived ATLAS')

      expect(filtered).toHaveLength(1)
      expect(filtered[0].title).toBe('Search for long-lived particles in ATLAS')
    })

    it('filters papers by PhD topic keywords in summary', () => {
      const papersWithKeywordInSummary = [
        ...mockParsedPapers,
        {
          id: 'http://arxiv.org/abs/2401.99999v1',
          title: 'Another Paper',
          summary: 'Study of axion-like particles in detector experiments...',
          authors: ['Bob Wilson'],
          published: '2024-01-13T00:00:00Z',
          updated: '2024-01-13T00:00:00Z',
          link: 'http://arxiv.org/abs/2401.99999v1',
          category: 'hep-ph',
        },
      ]

      const filtered = filterPapersByTopic(papersWithKeywordInSummary, 'axion')

      expect(filtered.length).toBeGreaterThanOrEqual(1)
      expect(filtered.some(p => p.summary.toLowerCase().includes('axion'))).toBe(true)
    })

    it('is case-insensitive', () => {
      const filtered = filterPapersByTopic(mockParsedPapers, 'LONG-LIVED atlas')

      expect(filtered).toHaveLength(1)
      expect(filtered[0].title).toBe('Search for long-lived particles in ATLAS')
    })

    it('matches multiple keywords', () => {
      const filtered = filterPapersByTopic(
        mockParsedPapers,
        'long-lived axion-like particles ATLAS'
      )

      expect(filtered).toHaveLength(1)
    })

    it('returns all papers when search query is empty', () => {
      const filtered = filterPapersByTopic(mockParsedPapers, '')

      expect(filtered).toEqual(mockParsedPapers)
    })

    it('returns empty array when no papers match', () => {
      const filtered = filterPapersByTopic(mockParsedPapers, 'nonexistent keyword')

      expect(filtered).toEqual([])
    })

    it('handles papers with missing summary', () => {
      const papersWithMissingSummary = [
        {
          id: 'http://arxiv.org/abs/2401.11111v1',
          title: 'Test Paper',
          summary: '',
          authors: ['Test Author'],
          published: '2024-01-10T00:00:00Z',
          updated: '2024-01-10T00:00:00Z',
          link: 'http://arxiv.org/abs/2401.11111v1',
          category: 'hep-ex',
        },
      ]

      const filtered = filterPapersByTopic(papersWithMissingSummary, 'test')

      expect(filtered).toHaveLength(1)
    })
  })
})
