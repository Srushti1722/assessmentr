import os
import asyncio
import logging
from dotenv import load_dotenv
from livekit import rtc
from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    WorkerOptions,
    cli,
)
from livekit.plugins import google, silero
from mem0 import MemoryClient
import sys

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("agent-Casey-10be")

load_dotenv()

# --- mem0 Setup ---
_memory = None

def get_memory() -> MemoryClient:
    global _memory
    if _memory is None:
        api_key = os.getenv("MEM0_API_KEY")
        if not api_key:
            return None
        try:
            _memory = MemoryClient(api_key=api_key)
        except Exception as e:
            logger.error(f"Failed to initialize MemoryClient: {e}")
            return None
    return _memory

def fetch_memories(user_id: str) -> str:
    try:
        mem = get_memory()
        if mem is None: return ""
        result = mem.get_all(filters={"user_id": user_id})
        entries = result if isinstance(result, list) else result.get("results", [])
        if entries:
            return "\n".join([f"- {e['memory']}" for e in entries if e.get("memory")])
    except Exception as e:
        logger.error(f"Error fetching memories: {e}")
    return ""

def save_memory(user_id: str, transcript: list):
    try:
        mem = get_memory()
        if mem:
            mem.add(transcript, user_id=user_id)
    except Exception as e:
        logger.error(f"Error saving memory: {e}")

# --- Agent Logic ---
def build_instructions(memories_text: str) -> str:
    return f"""You are Assessmentr, a senior technical interviewer.
Your goal is to conduct a professional mock interview.

# Candidate Memories:
{memories_text or "First time interviewing this candidate."}

# Instructions:
1. Ask one technical question at a time.
2. Be critical but helpful.
3. Keep responses concise for voice interaction.
"""

async def entrypoint(ctx: JobContext):
    await ctx.connect()
    
    # Simple identity resolution
    user_id = "default_user"
    for p in ctx.room.remote_participants.values():
        if p.identity:
            user_id = p.identity
            break
            
    memories = fetch_memories(user_id)
    instructions = build_instructions(memories)

    try:
        # Reverting to the simpler AgentSession pattern for compatibility
        # Using a more generic model name to avoid 404 errors
        session = AgentSession(
            llm=google.LLM(model="gemini-1.5-flash"),
            tts=google.TTS(),
            vad=silero.VAD.load(),
        )

        @session.on("user_speech_finished")
        def on_user_speech_finished(event):
            # Future: save transcript to memory
            pass

        # Ensuring the session starts with the correct instructions
        await session.start(agent=Agent(instructions=instructions), room=ctx.room)
        
        # Give it a second to stabilize then say hello
        await asyncio.sleep(1)
        session.push_speech("Hello! I am Assessmentr, your interviewer for today. Shall we begin?")
        
    except Exception as e:
        logger.error(f"Agent setup failed: {e}")

if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            agent_name="Casey-10be",
        )
    )