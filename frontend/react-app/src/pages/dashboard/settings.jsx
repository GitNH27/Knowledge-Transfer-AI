import {
  Card,
  CardBody,
  Typography,
  Input,
  Button,
  Select,
  Option,
  IconButton,
} from "@material-tailwind/react";
import { TrashIcon } from "@heroicons/react/24/outline";

import { useAppConfig } from "@/context/appConfig";
import DATA from "@/data/onboardingData";

export function Settings() {
  const {
    industry,
    role,
    sessionId,
    setIndustry,
    setRole,
    setSessionId,
  } = useAppConfig();

  const industryOptions = Object.entries(DATA);

  const roleOptions =
    industry && DATA[industry]
      ? Object.entries(DATA[industry].roles)
      : [];

  /* -------------------- HANDLERS -------------------- */

  const handleIndustryChange = (newIndustry) => {
    const roles = DATA[newIndustry]?.roles;

    // Safety check
    if (!roles || Object.keys(roles).length === 0) {
      setIndustry(newIndustry);
      setRole("");
      return;
    }

    const firstRoleKey = Object.keys(roles)[0];

    setIndustry(newIndustry);
    setRole(firstRoleKey);
  };



  const handleClearSession = () => {
    setSessionId("");
  };

  /* -------------------- UI -------------------- */

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      <Typography variant="h4" className="font-semibold">
        Settings
      </Typography>

      {/* Session ID */}
      <Card>
        <CardBody className="space-y-4">
          <Typography variant="h5">
            Session
          </Typography>

          <div className="flex gap-3">
            <Input
              label="Session ID"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
            />

            <IconButton
              color="red"
              variant="outlined"
              onClick={handleClearSession}
              disabled={!sessionId}
            >
              <TrashIcon className="h-4 w-4" />
            </IconButton>
          </div>

          <Typography color="gray" className="text-sm">
            Used to associate uploads, lectures, and progress
          </Typography>
        </CardBody>
      </Card>

      {/* Industry & Role */}
      <Card>
        <CardBody className="space-y-6">
          <Typography variant="h5">
            Context
          </Typography>

          {/* Industry */}
          <div className="space-y-2">
            <Typography variant="small" color="gray">
              Industry
            </Typography>
            <Select
              value={industry}
              onChange={handleIndustryChange}
            >
              {industryOptions.map(([key, val]) => (
                <Option key={key} value={key}>
                  {val.label}
                </Option>
              ))}
            </Select>
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Typography variant="small" color="gray">
              Role
            </Typography>
            <Select
              key={industry} 
              value={role}
              onChange={(val) => setRole(val)}
            >
              {roleOptions.map(([key, val]) => (
                <Option key={key} value={key}>
                  {val.label}
                </Option>
              ))}
            </Select>
          </div>

          <Typography color="gray" className="text-sm">
            Changing these will update available topics and lectures
          </Typography>
        </CardBody>
      </Card>
    </div>
  );
}

export default Settings;
