from urllib.parse import urlparse, parse_qs

import unicodedata
import json
import os
import re

def sanitize_filename(filename):
    print(filename[:-4])
    # Normalize the filename to remove accents and special characters
    normalized = unicodedata.normalize('NFKD', filename)
    # Encode to ASCII bytes, ignore errors, and decode back to string
    ascii_encoded = normalized.encode('ascii', 'ignore').decode('ascii')
    # Replace non-alphanumeric characters with underscores, convert to lowercase
    sanitized = re.sub(r'[^\w\s]', '', ascii_encoded).strip().replace(' ', '_').lower()
    return sanitized

def sanitize_model_name(model: str) -> str:
    return re.sub(r'[^\w\-_\. ]', '_', model)

def extract_video_id(url):
    query = urlparse(url)
    if query.hostname == 'youtu.be':
        return query.path[1:]
    if query.hostname in ('www.youtube.com', 'youtube.com'):
        if query.path == '/watch':
            return parse_qs(query.query)['v'][0]
        if query.path[:7] == '/embed/':
            return query.path.split('/')[2]
        if query.path[:3] == '/v/':
            return query.path.split('/')[2]
    return None

def update_downloads(video_info):
    json_file = 'downloads.json'
    try:
        if os.path.exists(json_file):
            with open(json_file, 'r') as file:
                downloads = json.load(file)
        else:
            downloads = {}

        downloads[video_info['id']] = video_info

        with open(json_file, 'w') as file:
            json.dump(downloads, file, indent=4)
    except Exception as e:
        print(f"Error updating downloads.json: {e}")