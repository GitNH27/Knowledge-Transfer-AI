import {
  Card,
  CardBody,
  Button,
  Typography,
  Progress,
} from "@material-tailwind/react";
import { useAppConfig } from "@/context/appConfig";
import { IconButton } from "@material-tailwind/react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

export function Lectures() {
  const { lectures, setLectures, activeLecture, setActiveLecture } = useAppConfig();
  const navigate = useNavigate();

  const deleteLecture = (docId, topic) => {
    const filtered = lectures.filter(
      (l) => !(l.documentId === docId && l.topic === topic)
    );
    setLectures(filtered);
  };

  /* -------- Group lectures by document -------- */
  const lecturesByDocument = lectures.reduce((acc, lecture) => {
    if (!acc[lecture.documentId]) {
      acc[lecture.documentId] = {
        documentName: lecture.documentName,
        lectures: [],
      };
    }

    acc[lecture.documentId].lectures.push(lecture);
    return acc;
  }, {});

  const documentSections = Object.values(lecturesByDocument);

  if (documentSections.length === 0) {
    return (
      <div className="max-w-6xl mx-auto py-10">
        <Typography variant="h5" color="gray">
          No lectures generated yet
        </Typography>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-10">
      <Typography variant="h4" className="font-semibold">
        Lectures
      </Typography>

      {documentSections.map((section) => (
        <div key={section.documentName} className="space-y-4">
          {/* Document title */}
          <Typography
            variant="h5"
            className="border-b pb-2 text-blue-gray-800"
          >
            {section.documentName}
          </Typography>

          {/* Lecture cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {section.lectures.map((lecture) => (
              <Card
                key={`${lecture.documentId}-${lecture.topic}`}
                className="hover:shadow-md transition"
              >
                <CardBody className="flex flex-col h-full space-y-3">
                  {/* Title + delete */}
                  <div className="flex items-start justify-between">
                    <Typography variant="h6" className="pr-2">
                      {lecture.topic}
                    </Typography>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-sm text-blue-gray-500 mb-1">
                      <span>Completion</span>
                      <span>{lecture.completion}%</span>
                    </div>
                    <Progress value={lecture.completion} size="sm" />
                  </div>

                  {/* Learn button + Trash */}
                  <div className="mt-auto flex justify-end">
                    <Button
                      size="sm"
                      onClick={() => {
                        setActiveLecture(lecture);
                        navigate("/learn");
                      }}
                    >
                      Learn
                    </Button>

                    <IconButton
                      size="sm"
                      color="red"
                      variant="text"
                      onClick={() =>
                        deleteLecture(lecture.documentId, lecture.topic)
                      }
                    >
                      <TrashIcon className="h-4 w-4" />
                    </IconButton>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Lectures;
