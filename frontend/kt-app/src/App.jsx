import { useState } from "react";

const API_URL = "http://localhost:8000";

function App() {
  const [status, setStatus] = useState("Disconnected");
  const [sessionId, setSessionId] = useState("test-session-123");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [topic, setTopic] = useState("");
  const [lecture, setLecture] = useState(null);
  const [loading, setLoading] = useState(false);

  // Test connection to backend
  async function connectApi() {
    try {
      setStatus("Connecting...");
      const response = await fetch(`${API_URL}/docs`);
      if (response.ok) {
        setStatus("Connected ✅");
      } else {
        setStatus("Error ❌");
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  }

  // Upload document
  async function uploadDocument() {
    if (!selectedFile) {
      alert("Please select a file");
      return;
    }

    setLoading(true);
    setUploadStatus("Uploading...");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("session_id", sessionId);

      const response = await fetch(`${API_URL}/ingestDocuments`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.status === "success") {
        setUploadStatus(`✅ ${data.message}`);
      } else {
        setUploadStatus(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      setUploadStatus(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  // Ask a question
  async function askQuestion() {
    if (!question.trim()) {
      alert("Please enter a question");
      return;
    }

    setLoading(true);
    setAnswer("");

    try {
      const response = await fetch(`${API_URL}/askQuestion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,
          question: question,
        }),
      });

      const data = await response.json();
      setAnswer(data.answer || "No answer received");
    } catch (error) {
      setAnswer(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  // Generate lecture
  async function generateLecture() {
    if (!topic.trim()) {
      alert("Please enter a topic");
      return;
    }

    setLoading(true);
    setLecture(null);

    try {
      const response = await fetch(`${API_URL}/generateLecture`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,
          topic: topic,
        }),
      });

      const data = await response.json();
      setLecture(data);
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-center text-gray-800">
          Knowledge Transfer AI
        </h1>

        {/* API Connection Status */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Backend Status</p>
              <p className="font-medium text-lg text-gray-800">{status}</p>
            </div>
            <button
              onClick={connectApi}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Test Connection
            </button>
          </div>
        </div>

        {/* Session ID */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <label className="block text-gray-700 font-medium mb-2">
            Session ID
          </label>
          <input
            type="text"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Enter session ID"
          />
        </div>

        {/* Document Upload */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Upload Document</h2>
          <div className="space-y-4">
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              accept=".pdf,.docx,.txt"
            />
            <button
              onClick={uploadDocument}
              disabled={loading}
              className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400"
            >
              {loading ? "Uploading..." : "Upload Document"}
            </button>
            {uploadStatus && (
              <p className="text-sm text-gray-600">{uploadStatus}</p>
            )}
          </div>
        </div>

        {/* Ask Question */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Ask a Question</h2>
          <div className="space-y-4">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Ask a question about the uploaded documents..."
            />
            <button
              onClick={askQuestion}
              disabled={loading}
              className="w-full py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-400"
            >
              {loading ? "Asking..." : "Ask Question"}
            </button>
            {answer && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-700">Answer:</p>
                <p className="text-gray-600 mt-2">{answer}</p>
              </div>
            )}
          </div>
        </div>

        {/* Generate Lecture */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Generate Lecture</h2>
          <div className="space-y-4">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter lecture topic..."
            />
            <button
              onClick={generateLecture}
              disabled={loading}
              className="w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400"
            >
              {loading ? "Generating..." : "Generate Lecture"}
            </button>
            {lecture && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                <div>
                  <p className="font-medium text-gray-700">Topic: {lecture.topic}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700 mb-2">Slide Content:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {lecture.slide_content?.map((slide, idx) => (
                      <li key={idx}>{slide}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-gray-700 mb-2">Lecture Script:</p>
                  <p className="text-gray-600">{lecture.lecture_script}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;