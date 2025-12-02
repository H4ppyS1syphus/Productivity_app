export interface ArxivPaper {
  id: string
  title: string
  summary: string
  authors: string[]
  published: string
  updated: string
  link: string
  category: string
}

export interface FetchOptions {
  maxResults?: number
  sortBy?: 'relevance' | 'lastUpdatedDate' | 'submittedDate'
  sortOrder?: 'ascending' | 'descending'
}

/**
 * Fetches papers from arXiv API for specified categories
 * @param categories - Array of arXiv categories (e.g., ['hep-ex', 'hep-ph', 'cs.LG'])
 * @param options - Optional fetch configuration
 * @returns Array of parsed arXiv papers
 */
export async function fetchArxivPapers(
  categories: string[],
  options: FetchOptions = {}
): Promise<ArxivPaper[]> {
  const {
    maxResults = 20,
    sortBy = 'submittedDate',
    sortOrder = 'descending',
  } = options

  // Build search query: cat:hep-ex OR cat:hep-ph OR cat:cs.LG
  const searchQuery = categories.map(cat => `cat:${cat}`).join('+OR+')

  const url = new URL('http://export.arxiv.org/api/query')
  url.searchParams.append('search_query', searchQuery)
  url.searchParams.append('start', '0')
  url.searchParams.append('max_results', maxResults.toString())
  url.searchParams.append('sortBy', sortBy)
  url.searchParams.append('sortOrder', sortOrder)

  try {
    const response = await fetch(url.toString())

    if (!response.ok) {
      throw new Error(`arXiv API error: ${response.status} ${response.statusText}`)
    }

    const xmlText = await response.text()
    return parseArxivXML(xmlText)
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to fetch arXiv papers')
  }
}

/**
 * Parses arXiv API XML response into structured paper objects
 */
function parseArxivXML(xmlText: string): ArxivPaper[] {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml')

  // Check for parsing errors
  const parseError = xmlDoc.querySelector('parsererror')
  if (parseError) {
    throw new Error('Failed to parse arXiv XML response')
  }

  const entries = xmlDoc.querySelectorAll('entry')
  const papers: ArxivPaper[] = []

  entries.forEach(entry => {
    const id = entry.querySelector('id')?.textContent || ''
    const title = entry.querySelector('title')?.textContent?.trim() || ''
    const summary = entry.querySelector('summary')?.textContent?.trim() || ''
    const published = entry.querySelector('published')?.textContent || ''
    const updated = entry.querySelector('updated')?.textContent || ''

    // Get all authors
    const authorNodes = entry.querySelectorAll('author name')
    const authors: string[] = []
    authorNodes.forEach(node => {
      const name = node.textContent?.trim()
      if (name) authors.push(name)
    })

    // Get link
    const linkNode = entry.querySelector('link[type="text/html"]')
    const link = linkNode?.getAttribute('href') || id

    // Get primary category (try both with and without namespace)
    let categoryNode = entry.querySelector('primary_category')
    if (!categoryNode) {
      categoryNode = entry.querySelector('category')
    }
    const category = categoryNode?.getAttribute('term') || ''

    papers.push({
      id,
      title,
      summary,
      authors,
      published,
      updated,
      link,
      category,
    })
  })

  return papers
}

/**
 * Filters papers by search query (matches title or summary)
 * @param papers - Array of papers to filter
 * @param query - Search query string
 * @returns Filtered array of papers
 */
export function filterPapersByTopic(
  papers: ArxivPaper[],
  query: string
): ArxivPaper[] {
  if (!query || query.trim() === '') {
    return papers
  }

  const searchTerms = query.toLowerCase().split(/\s+/)

  return papers.filter(paper => {
    const searchText = `${paper.title} ${paper.summary}`.toLowerCase()

    // Check if any search term matches
    return searchTerms.some(term => searchText.includes(term))
  })
}

/**
 * Fetches papers from specific PhD research topics:
 * - hep-ex (Experimental High Energy Physics)
 * - hep-ph (High Energy Physics - Phenomenology)
 * - cs.LG (Machine Learning)
 * - OpenAI papers
 *
 * Filters by specific keywords: "long lived axion liked particles ATLAS"
 */
export async function fetchPhDRelevantPapers(
  options: FetchOptions = {}
): Promise<ArxivPaper[]> {
  try {
    // Fetch from multiple categories
    const categories = ['hep-ex', 'hep-ph', 'cs.LG']
    const allPapers = await fetchArxivPapers(categories, {
      ...options,
      maxResults: options.maxResults || 50, // Fetch more to filter
    })

    // Filter by PhD topic keywords
    const keywords = 'long lived axion like particles ATLAS'
    const filteredPapers = filterPapersByTopic(allPapers, keywords)

    return filteredPapers
  } catch (error) {
    console.error('Error fetching PhD relevant papers:', error)
    throw error
  }
}

/**
 * Fetches latest ML/AI papers including OpenAI research
 */
export async function fetchMLPapers(
  options: FetchOptions = {}
): Promise<ArxivPaper[]> {
  try {
    // Search for ML papers with relevant keywords
    const papers = await fetchArxivPapers(['cs.LG', 'cs.AI', 'stat.ML'], options)

    // Could also filter by "OpenAI" in authors or search for specific topics
    return papers
  } catch (error) {
    console.error('Error fetching ML papers:', error)
    throw error
  }
}
