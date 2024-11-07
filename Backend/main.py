from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from mlx_whisper_extract_timestamps import transcribe_audio
from models import YouTubeURL, TranscriptionRequest, UpdateTranscriptionRequest
from utils import sanitize_model_name, extract_video_id, update_downloads

import json
import os
import yt_dlp

app = FastAPI()

# Allow all origins (for development purposes)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this to specific domains in production
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

@app.post("/download")
async def download_audio(youtube_url: YouTubeURL):
    video_id = extract_video_id(youtube_url.url)
    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")

    directory = os.path.join('audio', video_id)
    filename = os.path.join(directory, f"{video_id}.wav")

    if not os.path.exists(directory):
        os.makedirs(directory)

    video_info = None

    if not os.path.exists(filename):
        ydl_opts = {
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'wav',
                'preferredquality': '192',
            }],
            'outtmpl': os.path.join(directory, '%(title)s.%(ext)s'),
        }
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info_dict = ydl.extract_info(youtube_url.url, download=True)
                downloaded_filename = ydl.prepare_filename(info_dict).replace('.webm', '.wav')
                os.rename(downloaded_filename, filename)

                video_info = {
                    "id": video_id,
                    "title": info_dict.get('title', ''),
                    "url": youtube_url.url,
                    "duration": info_dict.get('duration', 0),
                    "thumbnail": info_dict.get('thumbnail', '')
                }
                update_downloads(video_info)

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    if video_info is None:
        with open('downloads.json', 'r') as file:
            downloads = json.load(file)
            video_info = downloads.get(video_id)

    return {"message": "Audio downloaded", "path": filename, "title": video_info['title']}

@app.get("/play/{video_id}")
async def play_audio(video_id: str):
    filename = os.path.join('audio', video_id, f"{video_id}.wav")
    if not os.path.exists(filename):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(filename, media_type="audio/wav")

@app.post("/transcribe")
async def transcribe_audio_endpoint(request: TranscriptionRequest, background_tasks: BackgroundTasks):
    video_id = request.video_id
    model = request.model
    
    audio_path = os.path.join('audio', video_id, f"{video_id}.wav")
    
    if not os.path.exists(audio_path):
        raise HTTPException(status_code=404, detail="Audio file not found")

    sanitized_model_name = sanitize_model_name(model)
    transcription_cache_file = os.path.join('audio', video_id, f"{video_id}_{sanitized_model_name}_transcription.json")
    
    if os.path.exists(transcription_cache_file):
        with open(transcription_cache_file, 'r') as file:
            cached_transcription = json.load(file)
        return cached_transcription

    def perform_transcription():
        try:
            transcription_result = transcribe_audio(audio_path, model)
            with open(transcription_cache_file, 'w') as file:
                json.dump(transcription_result, file, indent=4)
            return transcription_result
        except Exception as e:
            print(f"Error during transcription: {e}")
            raise

    background_tasks.add_task(perform_transcription)
    return {"message": "Transcription started, please check back later for results."}

@app.post("/update-transcription")
async def update_transcription(request: UpdateTranscriptionRequest):
    video_id = request.video_id
    segments = request.segments

    transcription_cache_file = os.path.join('audio', video_id, f"{video_id}_transcription.json")

    try:
        with open(transcription_cache_file, 'w') as file:
            json.dump({"segments": segments}, file, indent=4)
        return {"message": "Transcription updated successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating transcription: {e}")