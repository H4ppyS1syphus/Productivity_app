"""
Chat API endpoints for LLM-powered chatbot.
Supports OpenAI and Anthropic models.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
import httpx

from ..config import settings
from ..auth import get_current_user
from ..models import User

router = APIRouter()


class ChatMessage(BaseModel):
    """Chat message from user or assistant"""
    role: str  # 'user', 'assistant', 'system'
    content: str
    timestamp: str


class TaskContext(BaseModel):
    """Task information for context"""
    id: int
    title: str
    type: str
    status: str
    due_date: Optional[str] = None


class ArxivPaperContext(BaseModel):
    """arXiv paper for context"""
    id: str
    title: str
    authors: List[str]


class ChatContext(BaseModel):
    """Context information for the chat"""
    tasks: List[TaskContext] = []
    currentTab: str = "tasks"
    arxivPapers: List[ArxivPaperContext] = []
    history: List[ChatMessage] = []


class ChatRequest(BaseModel):
    """Request to chat endpoint"""
    message: str
    context: ChatContext


class ChatAction(BaseModel):
    """Action to be executed"""
    type: str
    data: Optional[Dict[str, Any]] = None
    query: Optional[str] = None
    taskId: Optional[int] = None
    filter: Optional[str] = None


class ChatResponse(BaseModel):
    """Response from chat endpoint"""
    message: str
    actions: List[ChatAction] = []


SYSTEM_PROMPT = """You are a helpful productivity assistant integrated into a task management app.

Your capabilities:
1. Create tasks (daily, weekly, monthly, long_term, gym_workout, once)
2. Log gym workouts
3. Search arXiv papers
4. Sync tasks to Google Calendar
5. Start Pomodoro timers
6. Query and filter tasks

When the user asks you to perform an action, respond with:
1. A friendly conversational message
2. An actions array with the appropriate action type and data

Action format:
{
  "message": "Your friendly response",
  "actions": [
    {
      "type": "create_task",
      "data": {
        "title": "Task title",
        "description": "Optional description",
        "type": "daily|weekly|monthly|long_term|gym_workout|once",
        "pause_on_away": false,
        "due_date": "2024-12-25",  // Optional ISO date
        "is_recurring": false,  // Optional for recurring tasks
        "recurrence_time": "09:00:00",  // Optional: HH:MM:SS
        "recurrence_day_of_week": 0,  // Optional: 0=Monday, 6=Sunday
        "recurrence_day_of_month": 15  // Optional: 1-31
      }
    }
  ]
}

Available action types:
- create_task: Create a new task
- log_gym: Log workout (data: {exercise, sets, reps, weight})
- search_arxiv: Search papers (query: "search terms")
- sync_to_calendar: Sync task (taskId: number)
- start_timer: Start Pomodoro (taskId: number)
- query_tasks: Filter tasks (filter: "pending|completed|daily|weekly|etc")

Be concise, friendly, and helpful. Always include the actions array when performing operations.
"""


async def call_openai(messages: List[Dict[str, str]]) -> str:
    """Call OpenAI API"""
    if not settings.openai_api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OpenAI API key not configured"
        )

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.openai_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": settings.llm_model,
                "messages": messages,
                "temperature": settings.llm_temperature,
                "max_tokens": settings.llm_max_tokens,
            }
        )

        if not response.is_success:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"OpenAI API error: {response.text}"
            )

        result = response.json()
        return result["choices"][0]["message"]["content"]


async def call_anthropic(messages: List[Dict[str, str]]) -> str:
    """Call Anthropic API"""
    if not settings.anthropic_api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Anthropic API key not configured"
        )

    # Extract system message if present
    system_message = ""
    user_messages = []
    for msg in messages:
        if msg["role"] == "system":
            system_message = msg["content"]
        else:
            user_messages.append(msg)

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": settings.anthropic_api_key,
                "anthropic-version": "2023-06-01",
                "Content-Type": "application/json",
            },
            json={
                "model": settings.llm_model,
                "system": system_message,
                "messages": user_messages,
                "max_tokens": settings.llm_max_tokens,
                "temperature": settings.llm_temperature,
            }
        )

        if not response.is_success:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Anthropic API error: {response.text}"
            )

        result = response.json()
        return result["content"][0]["text"]


def build_context_message(context: ChatContext) -> str:
    """Build context message from app state"""
    parts = ["Current app context:"]

    if context.tasks:
        parts.append(f"\nTasks ({len(context.tasks)}):")
        for task in context.tasks[:10]:  # Limit to 10 most recent
            parts.append(f"- [{task.status}] {task.title} (type: {task.type}, id: {task.id})")

    if context.currentTab:
        parts.append(f"\nUser is currently on: {context.currentTab} tab")

    if context.arxivPapers:
        parts.append(f"\narXiv papers loaded: {len(context.arxivPapers)}")

    return "\n".join(parts)


def parse_response(response_text: str) -> ChatResponse:
    """Parse LLM response into ChatResponse with actions"""
    try:
        # Try to parse as JSON first
        data = json.loads(response_text)
        return ChatResponse(
            message=data.get("message", response_text),
            actions=[ChatAction(**action) for action in data.get("actions", [])]
        )
    except json.JSONDecodeError:
        # If not JSON, return as plain message
        return ChatResponse(message=response_text, actions=[])


@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Chat with LLM assistant.

    Processes user message with context and returns assistant response with actions.
    """
    try:
        # Build messages for LLM
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT}
        ]

        # Add context
        context_msg = build_context_message(request.context)
        messages.append({"role": "system", "content": context_msg})

        # Add conversation history (last 5 messages)
        for msg in request.context.history[-5:]:
            messages.append({
                "role": msg.role,
                "content": msg.content
            })

        # Add current user message
        messages.append({
            "role": "user",
            "content": request.message
        })

        # Call appropriate LLM provider
        if settings.llm_provider == "openai":
            response_text = await call_openai(messages)
        elif settings.llm_provider == "anthropic":
            response_text = await call_anthropic(messages)
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Unknown LLM provider: {settings.llm_provider}"
            )

        # Parse response and extract actions
        response = parse_response(response_text)

        return response

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat error: {str(e)}"
        )
