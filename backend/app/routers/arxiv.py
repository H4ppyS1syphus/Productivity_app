"""
arXiv API proxy router to avoid CORS issues
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Literal
import httpx

router = APIRouter(prefix="/arxiv", tags=["arxiv"])

@router.get("/papers")
async def get_arxiv_papers(
    category: Literal["phd", "ml"] = Query(..., description="Category of papers to fetch"),
    max_results: int = Query(20, ge=1, le=100, description="Maximum number of results")
):
    """
    Proxy arXiv API requests to avoid CORS issues.

    Args:
        category: 'phd' for PhD research papers (hep-ex, hep-ph, cs.LG) or 'ml' for ML/AI papers
        max_results: Maximum number of papers to return (1-100)

    Returns:
        XML response from arXiv API
    """
    try:
        # Build search query based on category
        if category == "phd":
            search_query = "cat:hep-ex OR cat:hep-ph OR cat:cs.LG"
        else:  # ml
            search_query = "cat:cs.LG OR cat:cs.AI OR cat:stat.ML"

        # arXiv API endpoint (use HTTPS)
        url = "https://export.arxiv.org/api/query"
        params = {
            "search_query": search_query,
            "start": 0,
            "max_results": max_results,
            "sortBy": "submittedDate",
            "sortOrder": "descending"
        }

        # Make request to arXiv API with redirect following
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()

        # Return XML response
        return response.text

    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch papers from arXiv: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )
