import json
import os
from datetime import datetime

DATA_DIR = "data"

def save_result(video_url, transcript, processed, mode):
    os.makedirs(DATA_DIR, exist_ok=True)
    video_id = video_url.split("v=")[1].split("&")[0]
    filename = f"{DATA_DIR}/{video_id}_{mode}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    
    data = {
        "video_url": video_url,
        "timestamp": datetime.now().isoformat(),
        "mode": mode,
        "transcript": transcript,
        "result": processed
    }
    
    with open(filename, "w") as f:
        json.dump(data, f, indent=2)
    
    return filename
