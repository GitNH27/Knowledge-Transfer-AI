import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
  Typography,
  Button,
  IconButton,
  Input,
  Spinner,
} from "@material-tailwind/react";
import {
  XMarkIcon,
  PlayIcon,
  PauseIcon,
  PaperAirplaneIcon,
  MicrophoneIcon,
  StopIcon,
} from "@heroicons/react/24/outline";

import { useAppConfig } from "@/context/appConfig";
import { apiService } from "@/services/api";

export function Learn() {
  const { activeLecture, setActiveLecture } = useAppConfig();
  const navigate = useNavigate();

  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState(null);
  const [questionText, setQuestionText] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [qaHistory, setQaHistory] = useState([]);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

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

  /* --- TEXT QUESTION HANDLER --- */
  const handleTextAsk = async () => {
    if (!questionText.trim()) return;
    setIsAsking(true);
    try {
      const res = await apiService.askQuestion(activeLecture.sessionId, questionText);
      setQaHistory(prev => [...prev, { q: questionText, a: res.answer, audio: res.audio_url }]);
      setQuestionText("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsAsking(false);
    }
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    audioChunks.current = [];

    mediaRecorder.current.ondataavailable = (e) => audioChunks.current.push(e.data);
    mediaRecorder.current.onstop = async () => {
      setIsAsking(true);
      const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
      try {
        const res = await apiService.askQuestionAudio(activeLecture.sessionId, audioBlob);
        setQaHistory(prev => [...prev, { q: res.question, a: res.answer, audio: res.audio_url }]);
      } catch (err) {
        console.error(err);
      } finally {
        setIsAsking(false);
      }
    };

    mediaRecorder.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
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
      
      {/* Notes Section */}
      <Card>
        <CardBody className="space-y-4">
          <Typography variant="h5">
            Key Notes
          </Typography>

          <ul className="list-disc pl-5 space-y-2 text-blue-gray-700">
            <li>Main concepts extracted from the document</li>
            <li>Important definitions</li>
            <li>Practical examples</li>
          </ul>
        </CardBody>
      </Card>
      
      {/* AI Explanation */}
      <Card>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <Typography variant="h5">
              AI Explanation
            </Typography>

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

          {/* Placeholder content */}
          <Typography color="blue-gray" className="leading-relaxed">
            This section will contain the AI-generated explanation of the
            lecture topic. You will be able to listen to it using text-to-speech
            and pause or resume at any time.
          </Typography>
        </CardBody>
      </Card>

      {/* Ask AI Section (future) */}
  {/* Ask AI Section */}
    <Card className="border border-blue-gray-100 shadow-sm">
      <CardBody className="space-y-4">
        <Typography variant="h5">Ask a question</Typography>
        
        <div className="flex gap-2 items-center">
          <div className="relative flex w-full">
            <Input
              type="text"
              label="Ask about this lecture..."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTextAsk()}
              className="pr-20"
              containerProps={{ className: "min-w-[0]" }}
            />
            <IconButton
              size="sm"
              color={questionText ? "blue" : "blue-gray"}
              variant="text"
              className="!absolute right-1 top-1 rounded"
              onClick={handleTextAsk}
              disabled={isAsking || !questionText}
            >
              <PaperAirplaneIcon className="h-4 w-4" />
            </IconButton>
          </div>

          <IconButton
            color={isRecording ? "red" : "blue"}
            className="rounded-full flex-shrink-0"
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            disabled={isAsking}
          >
            {isRecording ? <StopIcon className="h-5 w-5" /> : <MicrophoneIcon className="h-5 w-5" />}
          </IconButton>
        </div>
      
      {isAsking && (
        <div className="flex items-center gap-2 text-blue-500">
          <Spinner className="h-4 w-4" />
          <Typography className="text-sm font-medium">AI is thinking...</Typography>
        </div>
      )}
    </CardBody>
  </Card>

    {/* QA History Display */}
        {qaHistory.map((item, index) => (
          <Card key={index} className="bg-blue-gray-50/50 shadow-none border border-dashed border-blue-gray-200">
            <CardBody className="p-4 space-y-2">
              <Typography variant="small" className="font-bold text-blue-gray-800">
                Q: {item.q}
              </Typography>
              <Typography className="text-blue-gray-700">
                {item.a}
              </Typography>
              {item.audio && (
                <audio controls src={item.audio} className="h-8 mt-2 w-full max-w-xs" />
              )}
            </CardBody>
          </Card>
        ))}
    </div>
  );
}

export default Learn;
