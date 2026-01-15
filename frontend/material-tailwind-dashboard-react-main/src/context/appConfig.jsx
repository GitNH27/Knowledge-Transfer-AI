import { createContext, useContext, useState } from "react";

const AppConfigContext = createContext();

export function AppConfigProvider({ children }) {
  const [industry, setIndustry] = useState(null);
  const [role, setRole] = useState(null);
  const [topics, setTopics] = useState([]);

  return (
    <AppConfigContext.Provider
      value={{ industry, setIndustry, role, setRole, topics, setTopics }}
    >
      {children}
    </AppConfigContext.Provider>
  );
}

export const useAppConfig = () => useContext(AppConfigContext);
