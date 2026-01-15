import { useState } from "react";
import {
  Card,
  CardBody,
  Typography,
  Button,
  Input,
  Spinner,
} from "@material-tailwind/react";

const API_URL = "http://localhost:8000";

const PRESET_TOPICS = [
  "Employees",
  "Responsibilities",
  "APIs",
  "Architecture",
  "Security",
];

export function Home() {
  // Upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploading, setLoading] = useState(false);

  // Topic and lecture state
  const [selectedTopic, setSelectedTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [lectureStatus, setLectureStatus] = useState("");
  const [generating, setGenerating] = useState(false);

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

  async function generateLecture() {
    const topic = customTopic || selectedTopic;

    if (!topic) {
      alert("Please select or enter a topic");
      return;
    }

    setGenerating(true);
    setLectureStatus("Generating lecture...");

    try {
      const response = await fetch(`${API_URL}/generateLecture`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        setLectureStatus("✅ Lecture generated successfully");
      } else {
        setLectureStatus(`❌ ${data.message}`);
      }
    } catch (error) {
      setLectureStatus(`❌ ${error.message}`);
    } finally {
      setGenerating(false);
    }
  }

  
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card>
        <CardBody className="space-y-4">
          <Typography variant="h4">Upload Document</Typography>

          <input
            type="file"
            onChange={(e) => setSelectedFile(e.target.files[0])}
          />

          <Button onClick={uploadDocument} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload"}
          </Button>

          {uploadStatus && <Typography>{uploadStatus}</Typography>}
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4">
          <Typography variant="h4">Select a Topic</Typography>

          <div className="flex flex-wrap gap-2">
            {PRESET_TOPICS.map((topic) => (
              <Button
                key={topic}
                variant={selectedTopic === topic ? "filled" : "outlined"}
                onClick={() => {
                  setSelectedTopic(topic);
                  setCustomTopic("");
                }}
              >
                {topic}
              </Button>
            ))}
          </div>

          <Input
            label="Custom topic (optional)"
            value={customTopic}
            onChange={(e) => {
              setCustomTopic(e.target.value);
              setSelectedTopic("");
            }}
          />
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4">
          <Typography variant="h4">Generate Lecture</Typography>

          <Button onClick={generateLecture} disabled={generating}>
            {generating ? "Generating..." : "Generate Lecture"}
          </Button>

          {lectureStatus && <Typography>{lectureStatus}</Typography>}
        </CardBody>
      </Card>
    </div>
  );
}

export default Home;