---
name: deep-agent-deployment
description: Deploy Deep Agents as APIs or CLI tools using FastAPI, LangGraph Platform, or Docker. Use when serving the agent as an API, deploying to production, or creating a CLI interface.
version: 1.0.0
author: Maestro
---

# Deep Agent Deployment

Deploy your Deep Agent as a REST API, WebSocket server, or CLI tool for production use.

## When to Use
- When serving the agent as an API endpoint
- When deploying to LangGraph Platform
- When creating a Docker container for the agent
- When building a CLI interface

## Available Operations
1. Serve as FastAPI REST API
2. Add WebSocket streaming
3. Deploy with Docker
4. Deploy to LangGraph Platform
5. Create CLI interface

## Multi-Step Workflow

### Step 1: FastAPI REST API

```python
# api/server.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from deepagents import create_deep_agent
from langgraph.checkpoint.postgres import PostgresSaver

app = FastAPI(title="Deep Agent API")

agent = create_deep_agent(
    model="anthropic:claude-sonnet-4-6",
    checkpointer=PostgresSaver(conn_string=os.environ["DATABASE_URL"])
)

class ChatRequest(BaseModel):
    message: str
    thread_id: str

class ChatResponse(BaseModel):
    response: str
    thread_id: str

@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    config = {"configurable": {"thread_id": req.thread_id}}
    result = agent.invoke(
        {"messages": [{"role": "user", "content": req.message}]},
        config=config
    )
    return ChatResponse(
        response=result["messages"][-1].content,
        thread_id=req.thread_id
    )
```

### Step 2: WebSocket Streaming

```python
# api/websocket.py
from fastapi import WebSocket

@app.websocket("/ws/chat/{thread_id}")
async def ws_chat(websocket: WebSocket, thread_id: str):
    await websocket.accept()
    config = {"configurable": {"thread_id": thread_id}}

    while True:
        message = await websocket.receive_text()

        async for event in agent.astream_events(
            {"messages": [{"role": "user", "content": message}]},
            config=config,
            version="v2"
        ):
            if event["event"] == "on_chat_model_stream":
                chunk = event["data"]["chunk"].content
                if chunk:
                    await websocket.send_text(chunk)

        await websocket.send_text("[DONE]")
```

### Step 3: Docker

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY src/ ./src/
COPY skills/ ./skills/
USER 1000
EXPOSE 8000
CMD ["uvicorn", "src.api.server:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
docker build -t deep-agent:latest .
docker run -p 8000:8000 -e ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY deep-agent:latest
```

### Step 4: LangGraph Platform

```python
# langgraph.json
{
    "graphs": {
        "agent": {
            "path": "src/agent/main.py:agent"
        }
    },
    "dependencies": ["deepagents", "langchain"]
}
```

```bash
# Deploy to LangGraph Platform
langgraph deploy
```

### Step 5: CLI Interface

```python
# cli.py
import asyncio
from deepagents import create_deep_agent

async def main():
    agent = create_deep_agent(model="anthropic:claude-sonnet-4-6")
    config = {"configurable": {"thread_id": "cli-session"}}

    print("Deep Agent CLI (type 'exit' to quit)")
    while True:
        user_input = input("\n> ")
        if user_input.lower() == "exit":
            break

        async for event in agent.astream_events(
            {"messages": [{"role": "user", "content": user_input}]},
            config=config,
            version="v2"
        ):
            if event["event"] == "on_chat_model_stream":
                print(event["data"]["chunk"].content, end="", flush=True)

asyncio.run(main())
```

### Step 6: Verify

```bash
# Test API
uvicorn src.api.server:app --reload --port 8000
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "thread_id": "test-1"}'

# Test CLI
python cli.py
```

## Resources
- `references/deployment-checklist.md` — Production deployment checklist

## Examples

### Example 1: REST API
User asks: "Serve the agent as an API"
Response approach:
1. Create FastAPI app with `/api/chat` endpoint
2. Add PostgresSaver for persistence
3. Run with `uvicorn`
4. Test with curl

### Example 2: Streaming UI
User asks: "Real-time streaming like ChatGPT"
Response approach:
1. Add WebSocket endpoint
2. Use `astream_events` for token-by-token streaming
3. Send chunks via WebSocket
4. Frontend connects and renders

## Notes
- Always use PostgresSaver in production (not MemorySaver)
- Set resource limits in Docker (memory, CPU)
- Add health check endpoint: `GET /health`
- Rate limit the API endpoints
- Use environment variables for API keys, never hardcode
