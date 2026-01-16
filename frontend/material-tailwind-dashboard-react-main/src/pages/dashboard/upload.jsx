import { useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Typography,
  Input,
} from "@material-tailwind/react";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";

import { useAppConfig } from "@/context/appConfig";
import DATA from "@/data/onboardingData";

export function Upload() {
  const { industry, role, topics, lectures, setLectures } = useAppConfig(); 
  const [customTopic, setCustomTopic] = useState("");
  const [fileName, setFileName] = useState(null);

  const industryLabel = DATA[industry]?.label;
  const roleLabel = DATA[industry]?.roles[role]?.label;

  const handleFileSelect = (e) => {
    if (e.target.files?.length) {
      setFileName(e.target.files[0].name);
    }
  };

  const generateLecture = (topic) => {
    if (!topic) return;

    // Prevent duplicate
    if (lectures.some(l => l.topic.toLowerCase() === topic.toLowerCase())) return;

    setLectures([
      ...lectures,
      {
        topic,
        completion: 0,
        file: fileName ?? null,
      },
    ]);

    // Clear custom topic input if used
    if (customTopic === topic) setCustomTopic("");
  };

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

      {/* Upload Section */}
      <Card className="border border-dashed border-blue-gray-200 bg-blue-gray-50/40">
        <CardBody className="flex flex-col items-center justify-center py-10">
          <CloudArrowUpIcon className="h-10 w-10 text-blue-gray-400 mb-4" />
          <Typography variant="h6">Upload a document</Typography>
          <Typography color="gray" className="text-sm mt-1 mb-4 text-center">
            Document used as context for lecture generation
          </Typography>

          <label className="cursor-pointer">
            <input
              type="file"
              className="hidden"
              onChange={handleFileSelect}
            />
            <div className="px-6 py-2 rounded-lg bg-white shadow-sm border hover:shadow transition">
              <Typography color="blue-gray">
                {fileName ?? "Choose a file"}
              </Typography>
            </div>
          </label>
        </CardBody>
      </Card>

      {/* Topics Section */}
      <div className="space-y-4">
        <Typography variant="h5">Select a topic</Typography>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topics.map((topic) => {
            const isGenerated = lectures.some(
              (l) => l.topic.toLowerCase() === topic.toLowerCase()
            );
            return (
              <Card
                key={topic}
                className={`transition hover:shadow-md ${
                  isGenerated ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <CardBody className="flex items-center justify-between">
                  <Typography>{topic}</Typography>
                  <Button
                    size="sm"
                    disabled={isGenerated}
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

      {/* Custom Topic Section */}
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
                lectures.some(
                  (l) => l.topic.toLowerCase() === customTopic.toLowerCase()
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
