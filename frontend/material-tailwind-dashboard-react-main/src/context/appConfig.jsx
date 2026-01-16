import { createContext, useContext, useState } from "react";

const AppConfigContext = createContext();

export function AppConfigProvider({ children }) {
  const [industry, setIndustry] = useState(null);
  const [role, setRole] = useState(null);
  const [topics, setTopics] = useState([]);
  const [lectures, setLectures] = useState([]);

  return (
    <AppConfigContext.Provider
      value={{
        industry,
        setIndustry,
        role,
        setRole,
        topics,
        setTopics,
        lectures,
        setLectures,
      }}
    >
      {children}
    </AppConfigContext.Provider>
  );
}

export const useAppConfig = () => useContext(AppConfigContext);
