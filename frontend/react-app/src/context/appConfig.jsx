import { createContext, useContext, useEffect, useState } from "react";
import ONBOARDING_DATA from "@/data/onboardingData";

const AppConfigContext = createContext();

export function AppConfigProvider({ children }) {
  /* ----------------- Industry / Role / Topics ----------------- */
  const [industry, setIndustry] = useState(() => localStorage.getItem("industry") || null);
  const [role, setRole] = useState(() => localStorage.getItem("role") || null);
  const [topics, setTopics] = useState([]);

  /* ----------------- Onboarding ----------------- */
  const [hasOnboarded, setHasOnboarded] = useState(() => localStorage.getItem("hasOnboarded") === "true");

  const completeOnboarding = () => {
    setHasOnboarded(true);
    localStorage.setItem("hasOnboarded", "true");
  };

  /* ----------------- Lectures ----------------- */
  const [lecturesByContext, setLecturesByContext] = useState(() => {
    const stored = localStorage.getItem("lecturesByContext");
    return stored ? JSON.parse(stored) : {};
  });

  const contextKey = `${industry}|${role}`;
  const lectures = lecturesByContext[contextKey] || [];

  const setLectures = (newLectures) => {
    setLecturesByContext((prev) => {
      const updated = { ...prev, [contextKey]: newLectures };
      localStorage.setItem("lecturesByContext", JSON.stringify(updated));
      return updated;
    });
  };

  /* ----------------- Active Lecture ----------------- */
  const [activeLecture, setActiveLecture] = useState(null);

  /* ----------------- Documents ----------------- */
  const [documents, setDocuments] = useState(() => {
    const stored = localStorage.getItem("documents");
    return stored ? JSON.parse(stored) : [];
  });

  const [selectedDocumentId, setSelectedDocumentId] = useState(() => {
    return localStorage.getItem("selectedDocumentId") || null;
  });

  /* ----------------- Persist to localStorage ----------------- */
  useEffect(() => {
    localStorage.setItem("industry", industry || "");
  }, [industry]);

  useEffect(() => {
    localStorage.setItem("role", role || "");
  }, [role]);

  useEffect(() => {
    localStorage.setItem("documents", JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    if (selectedDocumentId) localStorage.setItem("selectedDocumentId", selectedDocumentId);
  }, [selectedDocumentId]);

  useEffect(() => {
    // Whenever industry or role changes, set topics automatically
    if (industry && role) {
      const roleTopics =
        ONBOARDING_DATA[industry]?.roles[role]?.topics ?? [];
      setTopics(roleTopics);
    } else {
      setTopics([]); // Clear topics if no industry/role
    }
  }, [industry, role]);


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
        lecturesByContext,
        setLecturesByContext,
        activeLecture,
        setActiveLecture,
        documents,
        setDocuments,
        selectedDocumentId,
        setSelectedDocumentId,
        hasOnboarded,
        completeOnboarding,
      }}
    >
      {children}
    </AppConfigContext.Provider>
  );
}

export const useAppConfig = () => useContext(AppConfigContext);
