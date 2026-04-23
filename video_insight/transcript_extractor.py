import yt_dlp
import json
import time

def extract_transcript(video_url):
    try:
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'skip_download': True,
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
            
            if 'subtitles' in info and info['subtitles']:
                for lang in ['en', 'en-US', 'en-GB']:
                    if lang in info['subtitles']:
                        sub_url = info['subtitles'][lang][0]['url']
                        time.sleep(1)  # Rate limit delay
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
                        except:
                            transcript_text = content.decode('utf-8')
                        if transcript_text:
                            return {'transcript': transcript_text, 'metadata': metadata}
            
            if not transcript_text and 'automatic_captions' in info and info['automatic_captions']:
                for lang in ['en', 'en-US', 'en-GB']:
                    if lang in info['automatic_captions']:
                        sub_url = info['automatic_captions'][lang][0]['url']
                        time.sleep(1)  # Rate limit delay
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
                        except:
                            transcript_text = content.decode('utf-8')
                        if transcript_text:
                            return {'transcript': transcript_text, 'metadata': metadata}
            
            return {'error': 'No transcript available', 'metadata': metadata}
    except Exception as e:
        error_msg = str(e)
        if '429' in error_msg:
            return {'error': 'YouTube rate limit hit. Please wait a few minutes and try again.', 'metadata': metadata}
        return {'error': error_msg, 'metadata': {'title': 'Error', 'duration': 0, 'description': '', 'url': video_url}}
