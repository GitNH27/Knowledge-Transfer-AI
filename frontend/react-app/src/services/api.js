// Fetch Client FastAPI Connection

const API_BASE = "http://localhost:8000";

const handleResponse = async (response) => {
  if (!response.ok) {
    // Try to get the detailed error message from FastAPI
    const errorBody = await response.json().catch(() => ({}));
    console.error("Backend Error Detail:", errorBody);
    throw new Error(errorBody.detail || `Server responded with ${response.status}`);
  }
  return response.json();
};

export const apiService = {
  async ingestDocument(sessionId, file) {
    console.log(`[API] Ingesting: ${file.name} for session: ${sessionId}`);
    const formData = new FormData();
    formData.append("session_id", sessionId);
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/ingestDocuments`, {
        method: "POST",
        body: formData,
      });
      return await handleResponse(res);
    } catch (error) {
      console.error("[API] Ingest Call Failed:", error);
      throw error;
    }
  },

  // 2. Standard JSON POST
  async generateLecture(sessionId, topic) {
    const res = await fetch(`${API_BASE}/generateLecture`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, topic }),
    });
    return res.json();
  },

  // 3. Chain call: Takes the output of generateLecture and gets an Audio URL
  async generateAudio(lectureData) {
    const res = await fetch(`${API_BASE}/generateLectureAudio`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lectureData),
    });
    return res.json();
  },

  // POST: Multipart/Form-Data for Audio File upload
  async askQuestionAudio(sessionId, audioBlob) {
    const formData = new FormData();
    formData.append("session_id", sessionId);
    formData.append("audio_file", audioBlob, "user_question.webm");

    const res = await fetch(`${API_BASE}/askQuestionAudio`, {
      method: "POST",
      body: formData,
    });
    return res.json();
  },

  // POST: Simple Text Question
  async askQuestion(sessionId, question) {
    const res = await fetch(`${API_BASE}/askQuestion`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, question }),
    });
    return res.json();
  },

  // GET: Path Variable usage
  async getDocuments(sessionId) {
    const res = await fetch(`${API_BASE}/getDocuments/${sessionId}`);
    return res.json();
  },

  // DELETE: Path Variable usage
  async deleteSession(sessionId) {
    const res = await fetch(`${API_BASE}/deleteSession/${sessionId}`, {
      method: "DELETE",
    });
    return res.json();
  }

};