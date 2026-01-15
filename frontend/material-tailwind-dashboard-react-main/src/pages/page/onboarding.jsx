import { useNavigate } from "react-router-dom";
import { useAppConfig } from "@/context/appConfig";
import { Card, CardBody, Typography } from "@material-tailwind/react";

const DATA = {
  engineering: {
    label: "Engineering / Technology",
    roles: {
      junior: {
        label: "Junior Engineer",
        topics: [
          "Project summary",
          "Team member roles and key stakeholders",
          "Dependencies",
          "File access and read permissions",
        ],
      },
      senior: {
        label: "Senior Engineer",
        topics: [
          "Project summary",
          "Teaming dependencies",
          "Project architecture",
          "API contracts",
        ],
      },
      manager: { label: "Manager / Tech Lead", topics: [] },
    },
  },
  academia: {
    label: "Academia / Education",
    roles: {
      student: {
        label: "Student",
        topics: [
          "Course objectives",
          "Grading structure",
          "Assignment workflow",
        ],
      },
      instructor: {
        label: "Instructor / TA",
        topics: [
          "Curriculum structure",
          "Learning outcomes",
          "Assessment strategy",
        ],
      },
      admin: {
        label: "Administrator",
        topics: [
          "Program structure",
          "Compliance requirements",
          "Resource allocation",
          "Scheduling constraints",
        ],
      },
    },
  },
  healthcare: {
    label: "Healthcare / Regulated Operations",
    roles: {
      clinical: {
        label: "Clinical Staff",
        topics: [
          "Workflow overview",
          "Patient data handling",
          "Compliance & privacy",
          "Incident reporting",
        ],
      },
      it: {
        label: "Technical / IT Staff",
        topics: [
          "System architecture",
          "Downtime procedures",
          "Access control & auditing",
          "Security & compliance",
        ],
      },
      ops: {
        label: "Operations / Admin",
        topics: [
          "Operational procedures",
          "Regulatory requirements",
          "Risk management",
        ],
      },
    },
  },
};

export function Onboarding() {
  const navigate = useNavigate();
  const { industry, setIndustry, setRole, setTopics } = useAppConfig();

  if (!industry) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-gray-50 p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full">
          {Object.entries(DATA).map(([key, val]) => (
            <Card
              key={key}
              className="cursor-pointer hover:shadow-lg transition"
              onClick={() => setIndustry(key)}
            >
              <CardBody>
                <Typography variant="h5">{val.label}</Typography>
                <Typography color="gray" className="mt-2">
                  Tailored onboarding lectures
                </Typography>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const roles = DATA[industry].roles;

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-gray-50 p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full">
        {Object.entries(roles).map(([key, val]) => (
          <Card
            key={key}
            className="cursor-pointer hover:shadow-lg transition"
            onClick={() => {
              setRole(key);
              setTopics(val.topics);
              navigate("/upload");
            }}
          >
            <CardBody>
              <Typography variant="h5">{val.label}</Typography>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Onboarding;
