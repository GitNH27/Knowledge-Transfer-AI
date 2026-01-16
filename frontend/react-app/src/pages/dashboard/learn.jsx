import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
  Typography,
  Button,
  IconButton,
} from "@material-tailwind/react";
import {
  XMarkIcon,
  PlayIcon,
  PauseIcon,
} from "@heroicons/react/24/outline";

import { useAppConfig } from "@/context/appConfig";

export function Learn() {
  const { activeLecture, setActiveLecture } = useAppConfig();
  const navigate = useNavigate();

  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState(null);

  /* -------------------- AUDIO HANDLING -------------------- */

  useEffect(() => {
    // Clean up audio when lecture changes or closes
    return () => {
      if (audio) {
        audio.pause();
        setAudio(null);
      }
    };
  }, [activeLecture]);

  const playAudio = () => {
    if (!audio) {
      // Placeholder audio (replace with TTS output later)
      const newAudio = new Audio("/audio/sample-lecture.mp3");
      newAudio.play();
      setAudio(newAudio);
      setIsPlaying(true);

      newAudio.onended = () => {
        setIsPlaying(false);
      };
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const pauseAudio = () => {
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
  };

  /* -------------------- EMPTY STATE -------------------- */

  if (!activeLecture) {
    return (
      <div className="max-w-5xl mx-auto py-16 text-center space-y-6">
        <Typography variant="h4">
          No lecture open
        </Typography>
        <Typography color="gray">
          Select a lecture to begin learning
        </Typography>
        <Button onClick={() => navigate("/lectures")}>
          Go to Lectures
        </Button>
      </div>
    );
  }

  /* -------------------- MAIN LEARN VIEW -------------------- */

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Typography variant="h4" className="font-semibold">
            {activeLecture.topic}
          </Typography>
          <Typography color="gray" className="mt-1">
            Source document: {activeLecture.documentName}
          </Typography>
        </div>

        <IconButton
          variant="text"
          color="blue-gray"
          onClick={() => {
            setActiveLecture(null);
            navigate("/lectures");
          }}
        >
          <XMarkIcon className="h-6 w-6" />
        </IconButton>
      </div>
      
      {/* Key Notes / Bullet Points */}
      {activeLecture.slide_content && activeLecture.slide_content.length > 0 && (
        <Card>
          <CardBody className="space-y-4">
            <Typography variant="h5">Key Notes</Typography>
            <ul className="list-disc pl-5 space-y-2 text-blue-gray-700">
              {activeLecture.slide_content.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}

      {/* AI Explanation / Lecture Script */}
      {activeLecture.lecture_script && (
        <Card>
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between">
              <Typography variant="h5">AI Explanation</Typography>

              <div className="flex gap-2">
                {!isPlaying ? (
                  <IconButton onClick={playAudio}>
                    <PlayIcon className="h-5 w-5" />
                  </IconButton>
                ) : (
                  <IconButton onClick={pauseAudio}>
                    <PauseIcon className="h-5 w-5" />
                  </IconButton>
                )}
              </div>
            </div>

            <Typography color="blue-gray" className="leading-relaxed whitespace-pre-wrap">
              {activeLecture.lecture_script}
            </Typography>
          </CardBody>
        </Card>
      )}

      {/* Ask AI Section (future) */}
      <Card>
        <CardBody className="space-y-3">
          <Typography variant="h5">Ask a question</Typography>
          <Typography color="gray">
            You’ll be able to ask questions about this lecture here.
          </Typography>
        </CardBody>
      </Card>
    </div>
  );
}

export default Learn;
