import yt_dlp
import json
import time
import os
import tempfile

def extract_transcript(video_url, api_key=None):
    try:
        # Add delay to avoid bot detection
        time.sleep(2)
        
        # Download subtitles to temp file
        temp_dir = tempfile.mkdtemp()
        
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'skip_download': True,
            'writesubtitles': True,
            'writeautomaticsub': True,
            'subtitleslangs': ['en', 'en-US', 'en-GB'],
            'subtitlesformat': 'json',
            'outtmpl': os.path.join(temp_dir, '%(id)s.%(ext)s'),
            'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(video_url, download=False)
            
            metadata = {
                'title': info.get('title', 'Unknown'),
                'duration': info.get('duration', 0),
                'description': info.get('description', '')[:500],
                'url': video_url
            }
            
            transcript_text = ""
            
            # Try to download and parse subtitle file
            try:
                ydl_opts['skip_download'] = True
                ydl.download([video_url])
                
                # Look for downloaded subtitle files
                for file in os.listdir(temp_dir):
                    if file.endswith('.json'):
                        with open(os.path.join(temp_dir, file), 'r', encoding='utf-8') as f:
                            content = f.read()
                            try:
                                data = json.loads(content)
                                if 'events' in data:
                                    for event in data['events']:
                                        if 'segs' in event:
                                            for seg in event['segs']:
                                                if 'utf8' in seg:
                                                    transcript_text += seg['utf8'] + " "
                                elif 'body' in data:
                                    for item in data['body']:
                                        if 'text' in item:
                                            transcript_text += item['text'] + " "
                            except:
                                transcript_text = content
                            
                            if transcript_text and len(transcript_text) > 50:
                                return {'transcript': transcript_text, 'metadata': metadata}
            except Exception as e:
                pass  # Fallback to URL method
            
            # Cleanup temp dir
            try:
                for file in os.listdir(temp_dir):
                    os.remove(os.path.join(temp_dir, file))
                os.rmdir(temp_dir)
            except:
                pass
            
            # Fallback to URL method
            if 'subtitles' in info and info['subtitles']:
                for lang in info['subtitles']:
                    try:
                        sub = info['subtitles'][lang][0]
                        if 'url' in sub:
                            sub_url = sub['url']
                            time.sleep(1)
                            response = ydl.urlopen(sub_url)
                            content = response.read()
                            
                            try:
                                data = json.loads(content.decode('utf-8'))
                                if 'events' in data:
                                    for event in data['events']:
                                        if 'segs' in event:
                                            for seg in event['segs']:
                                                if 'utf8' in seg:
                                                    transcript_text += seg['utf8'] + " "
                                elif 'body' in data:
                                    for item in data['body']:
                                        if 'text' in item:
                                            transcript_text += item['text'] + " "
                            except:
                                transcript_text = content.decode('utf-8')
                            
                            if transcript_text and len(transcript_text) > 50:
                                return {'transcript': transcript_text, 'metadata': metadata}
                    except:
                        continue
            
            if not transcript_text and 'automatic_captions' in info and info['automatic_captions']:
                for lang in info['automatic_captions']:
                    try:
                        sub = info['automatic_captions'][lang][0]
                        if 'url' in sub:
                            sub_url = sub['url']
                            time.sleep(1)
                            response = ydl.urlopen(sub_url)
                            content = response.read()
                            
                            try:
                                data = json.loads(content.decode('utf-8'))
                                if 'events' in data:
                                    for event in data['events']:
                                        if 'segs' in event:
                                            for seg in event['segs']:
                                                if 'utf8' in seg:
                                                    transcript_text += seg['utf8'] + " "
                                elif 'body' in data:
                                    for item in data['body']:
                                        if 'text' in item:
                                            transcript_text += item['text'] + " "
                            except:
                                transcript_text = content.decode('utf-8')
                            
                            if transcript_text and len(transcript_text) > 50:
                                return {'transcript': transcript_text, 'metadata': metadata}
                    except:
                        continue
            
            debug_info = {
                'has_subtitles': 'subtitles' in info and bool(info['subtitles']),
                'has_auto_captions': 'automatic_captions' in info and bool(info['automatic_captions']),
                'subtitle_languages': list(info.get('subtitles', {}).keys()) if 'subtitles' in info else [],
                'auto_caption_languages': list(info.get('automatic_captions', {}).keys()) if 'automatic_captions' in info else []
            }
            
            return {'error': f'Could not extract transcript. Debug: {debug_info}', 'metadata': metadata}
            
    except Exception as e:
        error_msg = str(e)
        if '429' in error_msg:
            return {'error': 'YouTube rate limit hit. Please wait a few minutes and try again.', 'metadata': metadata}
        if 'bot' in error_msg.lower() or 'sign in' in error_msg.lower():
            return {'error': 'YouTube bot protection detected. Please try again in a few minutes, or manually export cookies from your browser.', 'metadata': {'title': 'Error', 'duration': 0, 'description': '', 'url': video_url}}
        return {'error': f'Error: {error_msg}', 'metadata': {'title': 'Error', 'duration': 0, 'description': '', 'url': video_url}}
