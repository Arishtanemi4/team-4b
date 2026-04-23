import os
import json
from typing import Generator
from openai import OpenAI

def check_api_keys() -> dict:
    """Check which API keys are available"""
    available = {}
    
    if os.getenv("OPENAI_API_KEY"):
        available["openai"] = True
    if os.getenv("ANTHROPIC_API_KEY"):
        available["anthropic"] = True
    if os.getenv("GROQ_API_KEY"):
        available["groq"] = True
    
    return available

def call_openai_streaming(prompt: str, model: str = "gpt-3.5-turbo") -> Generator[str, None, None]:
    """Stream response from OpenAI"""
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
    with client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        stream=True,
        temperature=0.7,
    ) as response:
        for chunk in response:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

def call_groq_streaming(prompt: str, model: str = "mixtral-8x7b-32768") -> Generator[str, None, None]:
    """Stream response from Groq"""
    from groq import Groq
    
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    
    with client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        stream=True,
    ) as response:
        for chunk in response:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

def get_analytics_insights(prompt: str) -> Generator[str, None, None]:
    """Get analytics insights from available LLM API"""
    available_apis = check_api_keys()
    
    if not available_apis:
        return None
    
    # Prefer OpenAI > Groq
    if available_apis.get("openai"):
        return call_openai_streaming(prompt, model="gpt-4-turbo-preview")
    elif available_apis.get("groq"):
        return call_groq_streaming(prompt)
    
    return None

if __name__ == "__main__":
    prompt = """Analyze the team survey data and provide key insights about:
    1. Team morale trends
    2. Stress levels and management
    3. Collaboration effectiveness
    4. Leadership support
    5. Recommendations for improvement"""
    
    insights = get_analytics_insights(prompt)
    
    if insights:
        for chunk in insights:
            print(chunk, end="", flush=True)
    else:
        print("No LLM API keys found")