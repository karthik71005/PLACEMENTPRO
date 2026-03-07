import os
from pinecone import Pinecone
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorDatabase
import json
from core.config import settings

class SkillGapResult(BaseModel):
    present_skills: list[str]
    required_skills: list[str]
    gap: list[str]
    learning_path: list[str]
    message: str = "Success"

class SkillGapAnalyzer:
    def __init__(self):
        gemini_api_key = settings.gemini_api_key or "fake-key"
        self.pc = Pinecone(api_key=settings.pinecone_api_key or "fake-key")
        self.index_name = settings.pinecone_index_name
        
        try:
            self.index = self.pc.Index(self.index_name)
        except Exception:
            self.index = None
        
        # Must match what was ingested
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/gemini-embedding-001",
            google_api_key=gemini_api_key
        )
        
        # LLM for generating the learning path
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=gemini_api_key,
            temperature=0.3
        )
        
        self.prompt = PromptTemplate.from_template("""
        You are an expert career counselor. 
        A student wants to become a: {target_role}
        They currently have these skills: {student_skills}
        Based on market job descriptions, they NEED these skills: {required_skills}
        
        The MISSING skills (gap) are: {gap_skills}
        
        Generate a concise, step-by-step learning path for the student to acquire the MISSING skills.
        Return ONLY a JSON array of strings, where each string is an actionable step. No markdown formatting outside of the JSON array.
        Example output:
        ["Complete a Udemy course on Spring Boot", "Build a REST API to practice microservices", "Deploy your app to AWS free tier"]
        """)

    async def analyze(self, student_id: str, target_role: str, db: AsyncIOMotorDatabase) -> SkillGapResult:
        # Step 1: Fetch student skills from MongoDB
        student = await db["students"].find_one({"user_id": student_id})
        student_skills = []
        if student and "skills" in student:
            student_skills = [s.lower().strip() for s in student["skills"]]

        # Step 2: Query Pinecone for top-5 most similar JD chunks
        try:
            target_vector = self.embeddings.embed_query(target_role)
            query_response = self.index.query(
                vector=target_vector,
                top_k=5,
                include_metadata=True
            )
        except Exception as e:
            return SkillGapResult(
                present_skills=student_skills,
                required_skills=[],
                gap=[],
                learning_path=[],
                message=f"Error accessing market data: {str(e)}"
            )

        if not query_response["matches"]:
            return SkillGapResult(
                present_skills=student_skills,
                required_skills=[],
                gap=[],
                learning_path=[],
                message="Insufficient market data for this role."
            )

        # Step 3: Extract required skill keywords
        required_skills_set = set()
        for match in query_response["matches"]:
            md = match.get("metadata", {})
            skill_str = md.get("skill_keywords", "")
            if skill_str:
                for s in skill_str.split(","):
                    required_skills_set.add(s.lower().strip())
        
        required_skills_list = list(required_skills_set)

        # Step 4: Compute gap
        gap_skills_list = [skill for skill in required_skills_list if skill not in student_skills]

        # Edge case: No gap
        if not gap_skills_list:
             return SkillGapResult(
                present_skills=student_skills,
                required_skills=required_skills_list,
                gap=[],
                learning_path=["You already have all the core skills required for this role! Focus on building advanced projects and interview prep."],
                message="Success"
            )

        # Step 5: Call Gemini to generate learning path
        try:
            prompt_text = self.prompt.format(
                target_role=target_role,
                student_skills=", ".join(student_skills) if student_skills else "None",
                required_skills=", ".join(required_skills_list),
                gap_skills=", ".join(gap_skills_list)
            )
            response = self.llm.invoke(prompt_text)
            
            # Clean up potential markdown code blocks from response
            res_content = response.content.strip()
            if res_content.startswith("```json"):
                res_content = res_content[7:-3]
            elif res_content.startswith("```"):
                res_content = res_content[3:-3]
                
            learning_path = json.loads(res_content.strip())
            if not isinstance(learning_path, list):
                learning_path = [str(learning_path)]
                
        except Exception as e:
            learning_path = [f"Error generating AI learning path: {str(e)}", "Please try again later or focus on the listed gap skills."]

        return SkillGapResult(
            present_skills=student_skills,
            required_skills=required_skills_list,
            gap=gap_skills_list,
            learning_path=learning_path,
            message="Success"
        )
