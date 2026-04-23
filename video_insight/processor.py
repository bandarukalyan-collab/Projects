import re
from huggingface_hub import InferenceClient

def extract_qa_with_llm(transcript, api_key):
    try:
        client = InferenceClient(token=api_key)
        
        prompt = f"""Extract Q&A pairs from the following transcript. Format the output as markdown with sections, questions, and answers in bullet points like this:

## Section Name

**Q1: Question text**
- Answer point 1
- Answer point 2

Transcript:
{transcript[:10000]}"""

        response = client.chat.completions.create(
            model="meta-llama/Llama-3.2-3B-Instruct",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=4000,
            temperature=0.3,
        )
        
        return response.choices[0].message.content
    except Exception as e:
        return f"Error using LLM: {str(e)}"

def extract_qa(transcript):
    lines = transcript.split("\n")
    sections = {}
    current_section = "General"
    current_q = None
    current_a = []
    q_num = 0
    
    for line in lines:
        # Detect section headers (broader patterns)
        section_match = re.match(r'##\s+(.+)', line, re.IGNORECASE)
        if section_match:
            current_section = section_match.group(1).strip()
            sections[current_section] = []
            q_num = 0
            continue
        
        # Detect questions - multiple patterns
        q_match = re.match(r'(?:Question|Q)\s*(\d*)[\.:]?\s*(.+)', line, re.IGNORECASE)
        if not q_match:
            # Try pattern: "What is", "How to", etc.
            q_match = re.match(r'^(what|how|why|when|where|who|which|explain|describe|define)\s+.+', line, re.IGNORECASE)
        
        if q_match:
            # Save previous Q&A if exists
            if current_q:
                answer_text = " ".join(current_a).strip()
                if answer_text:
                    if current_section not in sections:
                        sections[current_section] = []
                    sections[current_section].append({
                        "question": current_q,
                        "answer": answer_text
                    })
            
            # Start new question
            if q_match.group(1).isdigit():
                q_num = int(q_match.group(1))
                current_q = f"Q{q_num}: {q_match.group(2).strip()}"
            else:
                q_num += 1
                current_q = f"Q{q_num}: {q_match.group(0).strip()}"
            current_a = []
        elif current_q and line.strip():
            # Add to answer
            current_a.append(line.strip())
    
    # Save last Q&A
    if current_q:
        answer_text = " ".join(current_a).strip()
        if answer_text:
            if current_section not in sections:
                sections[current_section] = []
            sections[current_section].append({
                "question": current_q,
                "answer": answer_text
            })
    
    return sections

def format_qa_markdown(sections):
    markdown = ""
    for section, qa_pairs in sections.items():
        markdown += f"## {section}\n\n"
        for qa in qa_pairs:
            markdown += f"**{qa['question']}**\n"
            # Format answer as bullet points
            answer_lines = qa['answer'].split('. ')
            for line in answer_lines:
                if line.strip():
                    markdown += f"- {line.strip()}\n"
            markdown += "\n"
    return markdown

def generate_summary(transcript):
    return transcript[:500] + "..."

def extract_key_points(transcript):
    sentences = transcript.split(". ")
    return sentences[:5]
