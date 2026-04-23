import streamlit as st
import json
import time
from transcript_extractor import extract_transcript

st.set_page_config(page_title="VideoInsight", page_icon="🎥")

st.title("🎥 VideoInsight")
st.subheader("Extract Transcripts with Metadata")

mode = st.radio("Mode", ["Single URL", "Batch URLs"])

if mode == "Single URL":
    url = st.text_input("YouTube Video URL", placeholder="https://www.youtube.com/watch?v=...")
    if st.button("Extract"):
        if url:
            result = extract_transcript(url)
            if 'error' in result:
                st.error(result['error'])
            else:
                st.success(f"Extracted: {result['metadata']['title']}")
                st.write(f"**Duration:** {result['metadata']['duration']}s | **URL:** {result['metadata']['url']}")
                st.text_area("Transcript", result['transcript'], height=400)
                
                # Export
                st.download_button("Download TXT", result['transcript'], "transcript.txt")
                st.download_button("Download JSON", json.dumps(result, indent=2), "transcript.json")
                md = f"# {result['metadata']['title']}\n\n{result['transcript']}"
                st.download_button("Download MD", md, "transcript.md")
        else:
            st.warning("Enter URL")
else:
    urls = st.text_area("YouTube URLs (one per line, max 5)", height=150)
    if st.button("Batch Extract"):
        if urls:
            url_list = [u.strip() for u in urls.split('\n') if u.strip()]
            if len(url_list) > 5:
                st.error("Maximum 5 URLs allowed. Please process in smaller batches.")
            else:
                results = []
                for url in url_list:
                    result = extract_transcript(url)
                    results.append(result)
                    time.sleep(2)  # Delay between batch requests
                st.success(f"Extracted {len(results)} videos")
                for i, r in enumerate(results):
                    if 'error' not in r:
                        with st.expander(f"{i+1}. {r['metadata']['title']} ({len(r['transcript'])} chars)"):
                            st.text_area("Transcript", r['transcript'], height=200, key=f"batch_{i}")
