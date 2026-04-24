import streamlit as st
import json
import time
import re
from transcript_extractor import extract_transcript

st.set_page_config(page_title="VideoInsight", page_icon="🎥", layout="wide")

# Initialize session state
if 'single_result' not in st.session_state:
    st.session_state.single_result = None
if 'batch_results' not in st.session_state:
    st.session_state.batch_results = None

# Function to sanitize filename
def sanitize_filename(title):
    # Remove special characters and replace spaces with underscores
    sanitized = re.sub(r'[^\w\s-]', '', title)
    sanitized = re.sub(r'[-\s]+', '_', sanitized)
    # Limit to 20 characters
    return sanitized[:20]

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

# Cookie file upload section (collapsible)
with st.expander("YouTube Authentication (Optional)"):
    st.markdown("""
    **If you're getting "Sign in to confirm you're not a bot" error:**
    
    1. Install a browser extension to export cookies (e.g., "Get cookies.txt LOCALLY" for Chrome/Firefox)
    2. Go to YouTube and log in
    3. Export cookies to a .txt file
    4. Upload the file below
    
    This will make your requests look like a real logged-in browser session.
    """)
    cookie_file = st.file_uploader("Upload cookies.txt file", type=['txt'], key="cookie_upload")
    if cookie_file:
        st.success("Cookie file uploaded. This will be used for extraction.")
        # Save cookie file to temp location
        with open('cookies.txt', 'wb') as f:
            f.write(cookie_file.getbuffer())
        cookie_path = 'cookies.txt'
    else:
        cookie_path = None

mode = st.radio("Mode", ["Single URL", "Batch URLs"], horizontal=True)

if mode == "Single URL":
    col1, col2 = st.columns([1, 1])
    with col1:
        url = st.text_input("YouTube Video URL", placeholder="https://www.youtube.com/watch?v=...", key="single_url")
    if st.button("Extract", key="extract_single"):
            if url:
                result = extract_transcript(url, cookie_file=cookie_path)
                if 'error' in result:
                    st.error(result['error'])
                else:
                    st.session_state.single_result = result
                    st.success(f"Extracted: {result['metadata']['title']}")
            else:
                st.warning("Enter URL")
    
    # Display result from session state if available
    if st.session_state.single_result:
        result = st.session_state.single_result
        st.write(f"**Duration:** {result['metadata']['duration']}s | **URL:** {result['metadata']['url']}")
        st.text_area("Transcript", result['transcript'], height=400, key="single_transcript")
        
        # Generate filename from video title
        safe_title = sanitize_filename(result['metadata']['title'])
        
        st.markdown("### Download Options")
        col1, col2, col3 = st.columns(3)
        with col1:
            st.download_button("TXT", result['transcript'], f"{safe_title}_transcript.txt", use_container_width=True, key="dl_txt")
        with col2:
            st.download_button("JSON", json.dumps(result, indent=2), f"{safe_title}_transcript.json", use_container_width=True, key="dl_json")
        with col3:
            md = f"# {result['metadata']['title']}\n\n{result['transcript']}"
            st.download_button("MD", md, f"{safe_title}_transcript.md", use_container_width=True, key="dl_md")
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
                        result = extract_transcript(url, cookie_file=cookie_path)
                        results.append(result)
                        progress_bar.progress((i + 1) / len(url_list))
                        time.sleep(2)  # Delay between batch requests
                    st.session_state.batch_results = results
                    st.success(f"Extracted {len(results)} videos")
    
    # Display batch results from session state if available
    if st.session_state.batch_results:
        for i, r in enumerate(st.session_state.batch_results):
            if 'error' not in r:
                safe_title = sanitize_filename(r['metadata']['title'])
                with st.expander(f"{i+1}. {r['metadata']['title']} ({len(r['transcript'])} chars)"):
                    st.text_area("Transcript", r['transcript'], height=200, key=f"batch_{i}")
                    st.download_button("TXT", r['transcript'], f"{safe_title}_transcript.txt", key=f"batch_dl_txt_{i}")
                    st.download_button("JSON", json.dumps(r, indent=2), f"{safe_title}_transcript.json", key=f"batch_dl_json_{i}")
