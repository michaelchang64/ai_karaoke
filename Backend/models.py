from pydantic import BaseModel

class YouTubeURL(BaseModel):
    url: str

class TranscriptionRequest(BaseModel):
    video_id: str
    model: str

class UpdateTranscriptionRequest(BaseModel):
    video_id: str
    segments: list