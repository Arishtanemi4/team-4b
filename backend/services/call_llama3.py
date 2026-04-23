import subprocess
import json
from typing import Generator

def check_ollama_running() -> bool:
    """Check if Ollama is running"""
    try:
        result = subprocess.run(
            ["ollama", "list"],
            capture_output=True,
            text=True,
            timeout=5
        )
        return result.returncode == 0
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False

def check_llama3_available() -> bool:
    """Check if Llama3 model is available locally"""
    try:
        result = subprocess.run(
            ["ollama", "list"],
            capture_output=True,
            text=True,
            timeout=5
        )
        return "llama3" in result.stdout.lower() or "llama2" in result.stdout.lower()
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False

def call_llama3_streaming(prompt: str, model: str = "llama3") -> Generator[str, None, None]:
    """Stream response from local Llama3 via Ollama"""
    try:
        process = subprocess.Popen(
            ["ollama", "run", model],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1
        )
        
        process.stdin.write(prompt)
        process.stdin.close()
        
        for line in process.stdout:
            if line.strip():
                yield line
        
        process.wait()
    except (FileNotFoundError, subprocess.SubprocessError) as e:
        print(f"Error calling Llama3: {e}")
        return None

def get_analytics_insights(prompt: str) -> Generator[str, None, None]:
    """Get analytics insights from local Llama3"""
    if not check_ollama_running():
        return None
    
    if not check_llama3_available():
        return None
    
    # Try llama3 first, fallback to llama2
    try:
        return call_llama3_streaming(prompt, model="llama3")
    except:
        try:
            return call_llama3_streaming(prompt, model="llama2")
        except:
            return None

if __name__ == "__main__":
    prompt = """Analyze the team survey data and provide key insights about:
    1. Team morale trends
    2. Stress levels and management
    3. Collaboration effectiveness
    4. Leadership support
    5. Recommendations for improvement"""
    
    if check_ollama_running():
        print("Ollama is running")
        if check_llama3_available():
            print("Llama3 is available")
            insights = get_analytics_insights(prompt)
            if insights:
                for chunk in insights:
                    print(chunk, end="", flush=True)
        else:
            print("Llama3 model not found")
    else:
        print("Ollama is not running")