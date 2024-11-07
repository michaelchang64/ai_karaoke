from mlx_whisper.transcribe import transcribe

def clean_word_level_timestamps(segments):
    """
    Cleans and formats the word-level timestamps from the transcription segments.
    Adjusts start times by subtracting 0.1 seconds for better sync.
    
    Args:
        segments (list): List of transcription segments with word-level details.
    
    Returns:
        list: Cleaned segments with start, end, text, and words details.
    """
    cleaned_segments = []
    for segment in segments:
        start = segment['start']
        end = segment['end']
        text_yeah = segment['text']
        words = segment['words']
        cleaned_words = []
        
        for word in words:
            cleaned_word = {
                'word': word['word'],
                # 'start': word['start'],  # Subtract 0.1 seconds, ensuring no negative start time
                # 'end': word['end'],
                'start': max(0, word['start'] - 0.36),  # Subtract 0.1 seconds, ensuring no negative start time
                'end': max(0, word['end'] - 0.19),  # Adjust end time similarly
            }
            cleaned_words.append(cleaned_word)
        cleaned_segment = {
            "start": start,
            "end": end,
            "text": text_yeah,
            "words": cleaned_words,
        }
        cleaned_segments.append(cleaned_segment)

    return cleaned_segments

def transcribe_audio(audio_path: str, model: str = "mlx-community/whisper-base-mlx"):
    """
    Transcribes the given audio file using the specified model and returns word-level timestamps.
    
    Args:
        audio_path (str): Path to the audio file to be transcribed.
        model (str): Model to be used for transcription.
    
    Returns:
        dict: Transcription result with text and cleaned word-level timestamps.
    """
    text = transcribe(
        audio=audio_path,
        path_or_hf_repo=model,
        verbose=False,
        word_timestamps=True,
    )

    cleaned_segments = clean_word_level_timestamps(text['segments'])
    return {
        'text': text['text'],
        'segments': cleaned_segments
    }