import os
import yaml
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain.tools import tool
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging

logger = logging.getLogger("placementpro_ai")

# ── Static FAQs ─────────────────────────────────────────────────────────────
FAQ_DATA = """
general:
  timings: "The placement cell is open Monday to Friday, 9:00 AM to 5:00 PM."
  venue: "Placement Cell Office, Ground Floor, Main Block."
  contact: "Email: placements@sahyadri.edu.in, Phone: +91-824-2277444."
process:
  eligibility: "Students must have no active backlogs and a minimum CGPA of 6.0 to participate in standard drives. Tier-1 drives often require 7.5+ CGPA."
  registration: "All students must register through the PlacementPro portal's Drive Manager."
"""

# ── Global DB Reference for Tools ───────────────────────────────────────────
# LangChain tools run synchronously or pseudo-asynchronously. To keep scoping clean, 
# we'll inject the DB reference into a global or closure state before calling the agent.
_db_ref: AsyncIOMotorDatabase = None

def set_tool_db(db: AsyncIOMotorDatabase):
    global _db_ref
    _db_ref = db

# ── LangChain Tools ─────────────────────────────────────────────────────────

@tool
async def get_drive_info(company_name: str) -> str:
    """Fetch basic information about an upcoming or ongoing placement drive for a specific company."""
    if not _db_ref:
        return "Database connection unavailable."
    
    # Simple regex search for company name
    drives = await _db_ref["company_drives"].find(
        {"company_name": {"$regex": company_name, "$options": "i"}}
    ).to_list(length=3)
    
    if not drives:
        return f"No drives found for '{company_name}'."
    
    res = []
    for d in drives:
        res.append(f"Company: {d['company_name']}, Role: {d.get('role', 'Unknown')}, Status: {d.get('status', 'Unknown')}, Date: {d.get('drive_date', 'TBA')}")
    
    logger.info(f"Tool Call: get_drive_info({company_name}) -> Success")
    return "\n".join(res)

@tool
async def get_cutoff(company_name: str) -> str:
    """Check the CGPA and backlog cutoff criteria for a specific company's drive."""
    if not _db_ref:
        return "Database connection unavailable."
    
    drive = await _db_ref["company_drives"].find_one(
        {"company_name": {"$regex": company_name, "$options": "i"}}
    )
    
    if not drive:
        return f"Could not find drive criteria for '{company_name}'."
        
    eligibility = drive.get("eligibility_criteria", {})
    cgpa = eligibility.get("min_cgpa", "Not specified")
    backlogs = eligibility.get("max_backlogs", "Not specified")
    
    logger.info(f"Tool Call: get_cutoff({company_name}) -> CGPA: {cgpa}, Backlogs: {backlogs}")
    return f"Eligibility for {drive['company_name']}: Minimum CGPA {cgpa}, Maximum Active Backlogs {backlogs}."

@tool
def get_faqs(topic: str = "general") -> str:
    """Get answers to general placement FAQs (timings, venue, contact, eligibility, registration processes)."""
    try:
        data = yaml.safe_load(FAQ_DATA)
        # Search the YAML dict
        for category, items in data.items():
            for key, val in items.items():
                if topic.lower() in key.lower() or topic.lower() in val.lower():
                    logger.info(f"Tool Call: get_faqs({topic}) -> Match found")
                    return f"{key.capitalize()}: {val}"
        
        logger.info(f"Tool Call: get_faqs({topic}) -> Returning general summary")
        return f"We couldn't find a specific FAQ for '{topic}'. The Placement cell is open 9 AM-5 PM on the Ground Floor."
    except Exception as e:
        logger.error(f"Error parsing FAQ Yaml: {e}")
        return "Error loading FAQs."

@tool
async def get_interview_schedule(company_name: str) -> str:
    """Check the scheduled interviews for a specific company's drive."""
    if not _db_ref:
        return "Database connection unavailable."
    
    drive = await _db_ref["company_drives"].find_one(
        {"company_name": {"$regex": company_name, "$options": "i"}}
    )
    
    if not drive:
        return f"Could not find a drive for '{company_name}' to check interviews."
    
    drive_id = str(drive["_id"])
    cursor = _db_ref["interviews"].find({"drive_id": drive_id}).sort("hour", 1)
    
    interviews = await cursor.to_list(length=10)
    if not interviews:
        return f"No interviews are currently scheduled for {drive['company_name']}."
    
    res = []
    for i in interviews:
        res.append(f"Student: {i.get('student_name', 'Unknown')}, Day: {i.get('day', 'TBA')}, Time: {i.get('hour', 'TBA')}:00")
        
    logger.info(f"Tool Call: get_interview_schedule({company_name}) -> {len(interviews)} found")
    return f"Interview Schedule for {drive['company_name']}:\n" + "\n".join(res)

# ── Agent Class ─────────────────────────────────────────────────────────────

class PlacementBot:
    def __init__(self):
        gemini_api_key = os.getenv("GEMINI_API_KEY")
        
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=gemini_api_key,
            temperature=0.2, # Low temp for factual consistency
            max_output_tokens=500
        )
        logger.info("PlacementBot LLM initialized successfully with gemini-2.0-flash")
        
        self.tools = [get_drive_info, get_cutoff, get_faqs, get_interview_schedule]
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", 
             "You are PlacementBot, a friendly, helpful placement assistant for Sahyadri College of Engineering & Management. "
             "Your goal is to help students navigate the placement process. "
             "Keep your answers concise, encouraging, and highly accurate. "
             "Always use the provided tools to look up drive, cutoff, or FAQ information before answering. "
             "If you don't know the answer, direct the student to 'placements@sahyadri.edu.in' or the Placement Cell Office on the Ground Floor."
            ),
            MessagesPlaceholder(variable_name="history"),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad"),
        ])
        
        agent = create_tool_calling_agent(self.llm, self.tools, prompt)
        
        # Agent executor to handle the tool-calling loop
        self.agent_executor = AgentExecutor(
            agent=agent, 
            tools=self.tools, 
            verbose=False,
            handle_parsing_errors=True
        )
        
        # Simple in-memory memory store (keyed by session_id)
        # In production this would be backed by Redis
        self.sessions = {}

    async def chat(self, user_id: str, message: str, history_payload: list) -> str:
        # Convert incoming payload history into LangChain messages
        history = []
        for msg in history_payload:
            if msg.get("role") == "user":
                history.append(HumanMessage(content=msg.get("content", "")))
            else:
                history.append(AIMessage(content=msg.get("content", "")))
                
        try:
            response = await self.agent_executor.ainvoke({
                "input": message,
                "history": history
            })
            return response.get("output", "I'm not exactly sure how to respond to that.")
        except Exception as e:
            logger.error(f"Agent Execution Error: {e}")
            return "PlacementBot is temporarily unavailable due to a technical issue. Please try again later."
