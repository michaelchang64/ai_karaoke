export const downloadVideo = async (url: string) => {
  const response = await fetch("http://localhost:8000/download", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    throw new Error("Failed to download");
  }

  return response.json();
};

export const transcribeVideo = async (videoId: string, model: string) => {
  const response = await fetch("http://localhost:8000/transcribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ video_id: videoId, model }),
  });

  if (!response.ok) {
    throw new Error("Failed to transcribe");
  }

  return response.json();
};
