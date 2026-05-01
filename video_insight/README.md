# VideoInsight

Extract and analyze YouTube video transcripts.

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

## Installation

1. Navigate to the project directory:
```bash
cd video_insight
```

2. Install required dependencies:
```bash
pip install -r requirements.txt
```

This will install:
- streamlit - Web app framework
- yt-dlp - YouTube video downloader

## Running the Application

### Method 1: Using Python module (Recommended)
```bash
python -m streamlit run app.py
```

### Method 2: Using streamlit directly (if in PATH)
```bash
streamlit run app.py
```

The application will start and display:
- Local URL: http://localhost:8501
- Network URL: http://YOUR_IP:8501

Open the Local URL in your browser to use the application.

## Features

- Q&A Extraction
- Summary Generation
- Key Points Extraction
- Raw Transcript

## Troubleshooting

**Issue: "ModuleNotFoundError: No module named 'streamlit'"**
- Solution: Install dependencies using `pip install -r requirements.txt`

**Issue: "streamlit command not found"**
- Solution: Use `python -m streamlit run app.py` instead

**Issue: YouTube video download fails**
- Solution: Ensure yt-dlp is up to date: `pip install --upgrade yt-dlp`

## Project Structure

- `app.py` - Main Streamlit application
- `transcript_extractor.py` - YouTube transcript extraction logic
- `processor.py` - Text processing and analysis
- `storage.py` - Data storage utilities
- `requirements.txt` - Python dependencies
