import streamlit as st
import json
import time
from transcript_extractor import extract_transcript

st.set_page_config(page_title="VideoInsight", page_icon="🎥", layout="wide")

# Custom CSS for styling
st.markdown("""
<style>
    .stApp {
        background-color: #f8f9fa;
    }
    .main {
        background-color: white;
        border-radius: 8px;
        padding: 30px;
        margin: 10px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    h1 {
        color: #2c3e50;
        font-size: 2rem;
        text-align: center;
        margin-bottom: 0.5rem;
    }
    .stButton > button {
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 16px;
        font-weight: 500;
    }
    .stButton > button:hover {
        background-color: #2980b9;
    }
    .stTextInput > div > div > input {
        border: 1px solid #ddd;
        border-radius: 4px;
        max-width: 400px;
    }
    .stTextArea > div > div > textarea {
        border: 1px solid #ddd;
        border-radius: 4px;
    }
    .stRadio > label {
        font-size: 1.1rem;
        color: #2c3e50;
        font-weight: 500;
    }
    label[data-testid="stTextInputLabel"] {
        font-size: 1.1rem;
        color: #2c3e50;
        font-weight: 500;
    }
</style>
""", unsafe_allow_html=True)

st.title("VideoInsight")
st.markdown("<p style='text-align: center; color: #666; font-size: 0.9rem; margin-bottom: 20px;'>Extract Transcripts with Metadata</p>", unsafe_allow_html=True)

mode = st.radio("Mode", ["Single URL", "Batch URLs"], horizontal=True)

if mode == "Single URL":
    col1, col2 = st.columns([1, 1])
    with col1:
        url = st.text_input("YouTube Video URL", placeholder="https://www.youtube.com/watch?v=...", key="single_url")
    if st.button("Extract", key="extract_single"):
            if url:
                result = extract_transcript(url)
                if 'error' in result:
                    st.error(result['error'])
                else:
                    st.success(f"Extracted: {result['metadata']['title']}")
                    st.write(f"**Duration:** {result['metadata']['duration']}s | **URL:** {result['metadata']['url']}")
                    st.text_area("Transcript", result['transcript'], height=400, key="single_transcript")
                    
                    st.markdown("### Download Options")
                    col1, col2, col3 = st.columns(3)
                    with col1:
                        st.download_button("TXT", result['transcript'], "transcript.txt", use_container_width=True, key="dl_txt")
                    with col2:
                        st.download_button("JSON", json.dumps(result, indent=2), "transcript.json", use_container_width=True, key="dl_json")
                    with col3:
                        md = f"# {result['metadata']['title']}\n\n{result['transcript']}"
                        st.download_button("MD", md, "transcript.md", use_container_width=True, key="dl_md")
            else:
                st.warning("Enter URL")
else:
    urls = st.text_area("YouTube URLs (one per line, max 5)", height=150, key="batch_urls")
    if st.button("Batch Extract", key="extract_batch"):
            if urls:
                url_list = [u.strip() for u in urls.split('\n') if u.strip()]
                if len(url_list) > 5:
                    st.error("Maximum 5 URLs allowed. Please process in smaller batches.")
                else:
                    results = []
                    progress_bar = st.progress(0)
                    for i, url in enumerate(url_list):
                        result = extract_transcript(url)
                        results.append(result)
                        progress_bar.progress((i + 1) / len(url_list))
                        time.sleep(2)  # Delay between batch requests
                    st.success(f"Extracted {len(results)} videos")
                    for i, r in enumerate(results):
                        if 'error' not in r:
                            with st.expander(f"{i+1}. {r['metadata']['title']} ({len(r['transcript'])} chars)"):
                                st.text_area("Transcript", r['transcript'], height=200, key=f"batch_{i}")
