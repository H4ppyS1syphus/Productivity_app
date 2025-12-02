import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, isToday } from 'date-fns'
import { type ArxivPaper } from '@/services/arxiv'

interface ArxivPaperListProps {
  papers: ArxivPaper[]
  isLoading?: boolean
  isLoadingMore?: boolean
  error?: string
  onRetry?: () => void
  onSearch?: (query: string) => void
  onFilterCategory?: (category: string) => void
  activeCategory?: string
  hasMore?: boolean
  onLoadMore?: () => void
  onBookmark?: (paperId: string) => void
  onAddToTask?: (paper: ArxivPaper) => void
  onRefresh?: () => void
  lastUpdated?: string
}

export function ArxivPaperList({
  papers,
  isLoading = false,
  isLoadingMore = false,
  error,
  onRetry,
  onSearch,
  onFilterCategory,
  activeCategory = 'All',
  hasMore = false,
  onLoadMore,
  onBookmark,
  onAddToTask,
  onRefresh,
  lastUpdated,
}: ArxivPaperListProps) {
  const [expandedPapers, setExpandedPapers] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')

  const categories = ['All', 'hep-ex', 'hep-ph', 'cs.LG']

  const toggleExpanded = (paperId: string) => {
    const newExpanded = new Set(expandedPapers)
    if (newExpanded.has(paperId)) {
      newExpanded.delete(paperId)
    } else {
      newExpanded.add(paperId)
    }
    setExpandedPapers(newExpanded)
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    if (onSearch) {
      onSearch(value)
    }
  }

  const formatAuthors = (authors: string[]) => {
    if (authors.length === 0) return 'Unknown'
    if (authors.length <= 3) return authors.join(', ')
    return `${authors[0]}, ${authors[1]}, et al.`
  }

  const extractArxivId = (url: string) => {
    const match = url.match(/(\d+\.\d+)/)
    return match ? match[1] : url
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'hep-ex': 'bg-mocha-mauve text-mocha-base',
      'hep-ph': 'bg-mocha-blue text-mocha-base',
      'cs.LG': 'bg-mocha-green text-mocha-base',
      'cs.AI': 'bg-mocha-teal text-mocha-base',
      'stat.ML': 'bg-mocha-sky text-mocha-base',
    }
    return colors[category] || 'bg-mocha-overlay0 text-mocha-text'
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-mocha-text mb-4">arXiv Papers</h2>
        <div className="text-mocha-subtext0 mb-4">Loading papers...</div>
        <div className="grid grid-cols-1 gap-4" role="list">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              role="status"
              className="bg-mocha-surface0 rounded-lg p-6 animate-pulse"
            >
              <div className="h-6 bg-mocha-surface1 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-mocha-surface1 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-mocha-surface1 rounded w-full mb-2"></div>
              <div className="h-4 bg-mocha-surface1 rounded w-5/6"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-mocha-text mb-4">arXiv Papers</h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-mocha-surface0 border-2 border-mocha-red rounded-lg p-8 text-center"
        >
          <svg
            className="w-16 h-16 text-mocha-red mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-mocha-red text-lg font-semibold mb-4">{error}</p>
          {onRetry && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRetry}
              className="px-6 py-2 bg-mocha-blue text-mocha-base rounded-lg font-semibold hover:bg-mocha-blue/80 transition-colors"
            >
              Retry
            </motion.button>
          )}
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-mocha-text">arXiv Papers</h2>
          {lastUpdated && (
            <p className="text-sm text-mocha-subtext0 mt-1">
              Last updated: {format(new Date(lastUpdated), 'MMM dd, yyyy HH:mm')}
            </p>
          )}
        </div>
        {onRefresh && (
          <motion.button
            whileHover={{ scale: 1.05, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRefresh}
            className="p-2 rounded-lg bg-mocha-surface0 text-mocha-blue hover:bg-mocha-surface1 transition-colors"
            title="Refresh papers"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </motion.button>
        )}
      </div>

      {/* Search */}
      {onSearch && (
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search papers by title or abstract..."
            className="w-full px-4 py-3 pl-12 bg-mocha-surface0 border-2 border-mocha-surface1 rounded-lg text-mocha-text placeholder-mocha-subtext0 focus:border-mocha-blue focus:outline-none transition-colors"
          />
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-mocha-subtext0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      )}

      {/* Category Filter */}
      {onFilterCategory && (
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onFilterCategory(cat)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                activeCategory === cat
                  ? 'bg-mocha-blue text-mocha-base'
                  : 'bg-mocha-surface0 text-mocha-subtext0 hover:bg-mocha-surface1'
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      )}

      {/* Papers List */}
      {papers.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-mocha-surface0 rounded-lg p-12 text-center"
        >
          <svg
            className="w-16 h-16 text-mocha-subtext0 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-mocha-subtext0 text-lg mb-2">No papers found</p>
          <p className="text-mocha-subtext1 text-sm">
            Try adjusting your search or filter criteria
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-4" role="list">
          <AnimatePresence>
            {papers.map((paper, index) => (
              <motion.div
                key={paper.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-mocha-surface0 rounded-lg p-6 hover:bg-mocha-surface1 transition-colors cursor-pointer"
                onClick={() => toggleExpanded(paper.id)}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getCategoryColor(paper.category)}`}>
                        {paper.category}
                      </span>
                      <span className="text-xs text-mocha-subtext1">
                        {extractArxivId(paper.id)}
                      </span>
                      {isToday(new Date(paper.published)) && (
                        <span className="px-2 py-1 rounded text-xs font-bold bg-mocha-peach text-mocha-base">
                          New
                        </span>
                      )}
                    </div>
                    <a
                      href={paper.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-lg font-bold text-mocha-text hover:text-mocha-blue transition-colors"
                    >
                      {paper.title}
                    </a>
                  </div>
                  <div className="flex gap-2">
                    {onBookmark && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          onBookmark(paper.id)
                        }}
                        className="p-2 rounded-lg text-mocha-yellow hover:bg-mocha-yellow/20 transition-colors"
                        title="Bookmark paper"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                          />
                        </svg>
                      </motion.button>
                    )}
                    {onAddToTask && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          onAddToTask(paper)
                        }}
                        className="p-2 rounded-lg text-mocha-green hover:bg-mocha-green/20 transition-colors"
                        title="Add to tasks"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* Authors and Date */}
                <div className="flex flex-wrap items-center gap-2 text-sm text-mocha-subtext0 mb-3">
                  <span>{formatAuthors(paper.authors)}</span>
                  <span>•</span>
                  <span>{format(new Date(paper.published), 'MMM dd, yyyy')}</span>
                </div>

                {/* Summary */}
                <p
                  className={`text-mocha-subtext0 text-sm leading-relaxed ${
                    expandedPapers.has(paper.id) ? '' : 'line-clamp-3'
                  }`}
                >
                  {paper.summary}
                </p>

                {/* Expand indicator */}
                <div className="mt-3 text-xs text-mocha-blue font-semibold">
                  {expandedPapers.has(paper.id) ? 'Click to collapse' : 'Click to expand'}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Load More */}
      {hasMore && onLoadMore && (
        <div className="text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="px-8 py-3 bg-mocha-blue text-mocha-base rounded-lg font-semibold hover:bg-mocha-blue/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingMore ? 'Loading...' : 'Load more papers'}
          </motion.button>
        </div>
      )}
    </div>
  )
}
