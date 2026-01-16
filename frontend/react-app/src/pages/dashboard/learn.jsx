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

  // Unified Audio States
  const [activeAudio, setActiveAudio] = useState(null);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState(null); // 'lecture' or index (0, 1, 2...)

  const [questionText, setQuestionText] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [qaHistory, setQaHistory] = useState([]);
  
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  /* -------------------- UNIFIED AUDIO HANDLING -------------------- */

  const toggleAudio = (url, id) => {
    // 1. If the same audio is playing, pause it
    if (currentlyPlayingId === id && activeAudio) {
      activeAudio.pause();
      setCurrentlyPlayingId(null);
      return;
    }

    // 2. If a different audio is playing, stop it first
    if (activeAudio) {
      activeAudio.pause();
    }

    // 3. Play new audio
    const newAudio = new Audio(url);
    newAudio.play().catch(err => console.error("Playback failed:", err));
    
    newAudio.onended = () => {
      setCurrentlyPlayingId(null);
    };

    setActiveAudio(newAudio);
    setCurrentlyPlayingId(id);
  };

  useEffect(() => {
    return () => {
      if (activeAudio) activeAudio.pause();
    };
  }, [activeAudio]);

  /* --- QUESTION HANDLERS --- */

  const handleTextAsk = async () => {
    if (!questionText.trim()) return;
    setIsAsking(true);
    try {
      const res = await apiService.askQuestion(activeLecture.sessionID, questionText);
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
        const res = await apiService.askQuestionAudio(activeLecture.sessionID, audioBlob);
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

  if (!activeLecture) {
    return (
      <div className="max-w-5xl mx-auto py-16 text-center space-y-6">
        <Typography variant="h4">No lecture open</Typography>
        <Button onClick={() => navigate("/lectures")}>Go to Lectures</Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Typography variant="h4" className="font-semibold">{activeLecture.topic}</Typography>
          <Typography color="gray" className="mt-1">Source document: {activeLecture.documentName}</Typography>
        </div>
        <IconButton variant="text" color="blue-gray" onClick={() => { setActiveLecture(null); navigate("/lectures"); }}>
          <XMarkIcon className="h-6 w-6" />
        </IconButton>
      </div>
      
      {/* Key Notes */}
      {activeLecture.slide_content && (
        <Card>
          <CardBody className="space-y-4">
            <Typography variant="h5">Key Notes</Typography>
            <ul className="list-disc pl-5 space-y-2 text-blue-gray-700">
              {activeLecture.slide_content.map((item, idx) => <li key={idx}>{item}</li>)}
            </ul>
          </CardBody>
        </Card>
      )}

      {/* Main AI Explanation */}
      <Card className="border border-blue-gray-100 shadow-sm">
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <Typography variant="h5">AI Explanation</Typography>
            <IconButton onClick={() => toggleAudio(activeLecture.audioUrl, 'lecture')}>
              {currentlyPlayingId === 'lecture' ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
            </IconButton>
          </div>
          <Typography color="blue-gray" className="leading-relaxed whitespace-pre-wrap">
            {activeLecture.lecture_script}
          </Typography>
        </CardBody>
      </Card>

      {/* Ask AI Input Section */}
      <Card className="border border-blue-gray-100 shadow-sm bg-white">
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

      {/* Discussion History */}
      <div className="space-y-6">
        {qaHistory.length > 0 && (
            <Typography variant="h5" className="text-blue-gray-900 ml-1">Discussion History</Typography>
        )}
        {qaHistory.map((item, index) => (
          <Card key={index} className="border border-blue-gray-100 shadow-sm overflow-hidden">
            {/* User Question Header */}
            <div className="bg-blue-gray-50/50 px-4 py-3 border-b border-blue-gray-100">
              <Typography variant="small" className="font-bold text-blue-gray-500 uppercase tracking-wider">
                Your Question
              </Typography>
              <Typography className="text-blue-gray-800 font-medium">
                {item.q}
              </Typography>
            </div>

            {/* AI Answer (Matching Explanation Style) */}
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between">
                <Typography variant="h6" className="text-blue-600 font-semibold">
                  AI Answer
                </Typography>
                {item.audio && (
                  <IconButton 
                    size="sm" 
                    variant="gradient" 
                    color="blue"
                    className="rounded-full"
                    onClick={() => toggleAudio(item.audio, index)}
                  >
                    {currentlyPlayingId === index ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4 ml-0.5" />}
                  </IconButton>
                )}
              </div>
              <Typography color="blue-gray" className="leading-relaxed whitespace-pre-wrap border-l-4 border-blue-50 pl-4">
                {item.a}
              </Typography>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Learn;