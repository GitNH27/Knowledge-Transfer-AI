import { Card, CardBody, Typography, Progress, Button, IconButton } from "@material-tailwind/react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useAppConfig } from "@/context/appConfig";

export function Lectures() {
  const { lectures, setLectures } = useAppConfig();

  const handleDelete = (idx) => {
    setLectures(lectures.filter((_, i) => i !== idx));
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-6">
      <Typography variant="h4" className="font-semibold">
        Generated Lectures
      </Typography>

      {lectures.length === 0 ? (
        <Typography color="gray">No lectures generated yet.</Typography>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {lectures.map((lecture, idx) => (
            <Card key={idx} className="hover:shadow-lg transition relative">
              <CardBody className="space-y-2">
                <div className="flex justify-between items-start">
                  <Typography variant="h6">{lecture.topic}</Typography>

                  {/* Delete button */}
                  <IconButton
                    size="sm"
                    variant="text"
                    color="red"
                    onClick={() => handleDelete(idx)}
                  >
                    <TrashIcon className="h-5 w-5" />
                  </IconButton>
                </div>

                <div className="flex justify-between text-gray-500 text-sm">
                  <span>Completion</span>
                  <span>{lecture.completion}%</span>
                </div>
                <Progress value={lecture.completion} color="blue" />
                <Button size="sm" variant="outlined" fullWidth>
                  View Lecture
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default Lectures;
