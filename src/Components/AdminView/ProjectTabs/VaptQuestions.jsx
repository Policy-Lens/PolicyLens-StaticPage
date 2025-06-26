import React, { useEffect } from "react";
import NewQuestionnaire from "./NewQuestionnaire";
import { useNavigate, useParams } from "react-router-dom";

const VaptQuestions = (props) => {
  const navigate = useNavigate();
  const { projectid } = useParams();
  // This component simply renders NewQuestionnaire but ensures the VAPT tab is selected by default
  // We'll use a key prop to force remount if needed
  useEffect(() => {
    // Optionally, you could add logic here if you want to scroll to the VAPT tab or similar
  }, []);
  return (
    <NewQuestionnaire
      defaultTab="vapt"
      key="vapt"
      onClauseTabClick={() => navigate(`/project/${projectid}/questionbank`)}
      onControlTabClick={() => navigate(`/project/${projectid}/questionbank?tab=control`)}
      {...props}
    />
  );
};

export default VaptQuestions; 