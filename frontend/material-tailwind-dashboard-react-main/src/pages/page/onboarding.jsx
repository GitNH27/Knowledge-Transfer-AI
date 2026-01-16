import { useNavigate } from "react-router-dom";
import { useAppConfig } from "@/context/appConfig";
import { Card, CardBody, Typography } from "@material-tailwind/react";
import DATA from "@/data/onboardingData";

export function Onboarding() {
  const navigate = useNavigate();
  const { industry, setIndustry, setRole, setTopics } = useAppConfig();

  // Industry selection
  if (!industry) {
    return (
      <div className="min-h-screen bg-blue-gray-50 flex items-center justify-center p-8">
        <div className="w-full max-w-6xl">
          <Typography variant="h3" className="mb-2">
            Select an Industry
          </Typography>
          <Typography color="gray" className="mb-8">
            Choose the domain that best matches your organization
          </Typography>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      </div>
    );
  }

  const roles = DATA[industry].roles;

  // Role selection
  return (
    <div className="min-h-screen bg-blue-gray-50 flex items-center justify-center p-8">
      <div className="w-full max-w-6xl">
        <Typography variant="h3" className="mb-2">
          Select a Role
        </Typography>
        <Typography color="gray" className="mb-8">
          This helps us generate the most relevant lecture topics
        </Typography>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
    </div>
  );
}

export default Onboarding;