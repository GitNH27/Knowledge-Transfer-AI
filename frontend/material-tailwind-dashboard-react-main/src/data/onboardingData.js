const ONBOARDING_DATA = {
  engineering: {
    label: "Engineering / Technology",
    roles: {
      junior: {
        label: "Junior Engineer",
        topics: [
          "Project summary",
          "Team roles",
          "Dependencies",
          "File access",
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

export default ONBOARDING_DATA;