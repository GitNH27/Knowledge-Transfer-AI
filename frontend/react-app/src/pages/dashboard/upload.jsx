import { useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Typography,
  Input,
  IconButton,
} from "@material-tailwind/react";
import {
  CloudArrowUpIcon,
  TrashIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

import { useAppConfig } from "@/context/appConfig";
import DATA from "@/data/onboardingData";
import { useNavigate } from "react-router-dom";
import { apiService } from "@/api/api";

export function Upload() {
  const {
    industry,
    role,
    topics,
    lectures,
    lecturesByContext,
    setLecturesByContext,
    activeLecture,
    setActiveLecture,
    documents,
    setDocuments,
    selectedDocumentId,
    setSelectedDocumentId,
  } = useAppConfig();
  const navigate = useNavigate();

  const [customTopic, setCustomTopic] = useState("");

  const industryLabel = DATA[industry]?.label;
  const roleLabel = DATA[industry]?.roles[role]?.label;

  /* -------------------- DOCUMENT HANDLING -------------------- */

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newDoc = {
      id: crypto.randomUUID(),
      name: file.name,
      file,
      uploadedAt: Date.now(),
    };

    setDocuments((prev) => [...prev, newDoc]);
    setSelectedDocumentId(newDoc.id); // auto-select
  };

  const deleteDocument = (id) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    if (id === selectedDocumentId) {
      setSelectedDocumentId(null);
    }
  };

  const selectedDocument = documents.find(
    (doc) => doc.id === selectedDocumentId
  );

  /* -------------------- LECTURE GENERATION -------------------- */

  const generateLecture = async (topic) => {
    if (!topic || !selectedDocument) return;

    try {
      const sessionID = crypto.randomUUID();
            
      // 1. Ingest document
      const ingestResult = await apiService.ingestDocument(
        sessionID, // replace with dynamic session ID if needed
        selectedDocument.file // ensure you store the actual File object when uploading
      );

      if (ingestResult.status !== "success") {
        alert("Failed to ingest document: " + ingestResult.message);
        return;
      }

      // 2. Generate lecture
      const lectureData = await apiService.generateLecture(sessionID, topic);

      // 3. Generate audio for lecture
      const audioData = await apiService.generateAudio(lectureData);

      // 4. Build the lecture object for app state
      const newLecture = {
        id: crypto.randomUUID(),
        topic,
        documentId: selectedDocument.id,
        documentName: selectedDocument.name,
        sessionID,
        slide_content: lectureData.slide_content,
        lecture_script: lectureData.lecture_script,
        audioUrl: audioData.audio_url, // returned from API
        createdAt: Date.now(),
      };

      // Save lecture in context
      const contextKey = `${industry}|${role}`;
      setLecturesByContext({
        ...lecturesByContext,
        [contextKey]: [...(lecturesByContext[contextKey] || []), newLecture],
      });

      setActiveLecture(newLecture);

      // Navigate to Learn page
      navigate("/learn");
    } catch (error) {
      console.error(error);
      alert("Error generating lecture: " + error.message);
    }
  };


  /* -------------------- UI -------------------- */

  return (
    <div className="space-y-10 max-w-6xl mx-auto py-6">
      <div>
        <Typography variant="h4" className="font-semibold">
          {industryLabel} → {roleLabel}
        </Typography>
        <Typography color="gray" className="mt-1">
          Upload documents and generate onboarding lectures
        </Typography>
      </div>

      {/* Upload */}
      <Card className="border border-dashed border-blue-gray-200 bg-blue-gray-50/40">
        <CardBody className="flex flex-col items-center py-8">
          <CloudArrowUpIcon className="h-10 w-10 text-blue-gray-400 mb-4" />
          <Typography variant="h6">Upload a document</Typography>

          <label className="cursor-pointer mt-4">
            <input type="file" className="hidden" onChange={handleFileSelect} />
            <div className="px-6 py-2 rounded-lg bg-white border shadow-sm hover:shadow transition">
              <Typography color="blue-gray">Choose file</Typography>
            </div>
          </label>
        </CardBody>
      </Card>

      {/* Documents */}
      {documents.length > 0 && (
        <div className="space-y-3">
          <Typography variant="h5">Uploaded documents</Typography>

          <div className="space-y-2">
            {documents.map((doc) => {
              const isSelected = doc.id === selectedDocumentId;

              return (
                <Card
                  key={doc.id}
                  className={isSelected ? "border-blue-500" : ""}
                >
                  <CardBody className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Typography>{doc.name}</Typography>
                      {isSelected && (
                        <CheckIcon className="h-4 w-4 text-blue-500" />
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={isSelected ? "filled" : "outlined"}
                        disabled={isSelected}
                        onClick={() => setSelectedDocumentId(doc.id)}
                      >
                        {isSelected ? "Selected" : "Select"}
                      </Button>

                      <IconButton
                        size="sm"
                        color="red"
                        disabled={isSelected}
                        onClick={() => deleteDocument(doc.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </IconButton>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Topics */}
      <div className="space-y-4">
        <Typography variant="h5">Select a topic</Typography>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.isArray(topics) && topics.map((topic) => {
            // Check if this topic is already generated for the selected document
            const isGenerated = Array.isArray(lectures)
              ? lectures.some(
                  (l) =>
                    l.topic.toLowerCase() === topic.toLowerCase() &&
                    l.documentId === selectedDocumentId
                )
              : false;

            return (
              <Card
                key={topic}
                className={`transition ${isGenerated ? "opacity-50" : "hover:shadow-md"}`}
              >
                <CardBody className="flex items-center justify-between">
                  <Typography>{topic}</Typography>
                  <Button
                    size="sm"
                    disabled={isGenerated || !selectedDocument}
                    onClick={() => generateLecture(topic)}
                  >
                    Generate
                  </Button>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Custom Topic */}
      <Card>
        <CardBody className="space-y-4">
          <Typography variant="h5">Custom topic</Typography>

          <div className="flex flex-col md:flex-row gap-4">
            <Input
              label="Describe a custom topic"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
            />
            <Button
              className="md:w-40"
              disabled={
                !customTopic ||
                !selectedDocument ||
                lectures.some(
                  (l) =>
                    l.topic.toLowerCase() === customTopic.toLowerCase() &&
                    l.documentId === selectedDocumentId
                )
              }
              onClick={() => generateLecture(customTopic)}
            >
              Generate
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default Upload;
