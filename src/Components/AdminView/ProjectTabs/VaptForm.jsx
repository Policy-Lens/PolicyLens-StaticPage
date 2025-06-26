import React, { useEffect } from "react";
import NewQuestionnaire from "./NewQuestionnaire";
import { useNavigate, useParams } from "react-router-dom";

const VaptForm = (props) => {
  const navigate = useNavigate();
  const { projectid } = useParams();
  // This component simply renders NewQuestionnaire but ensures the VAPT Form tab is selected by default
  // We'll use a key prop to force remount if needed
  useEffect(() => {
    // Optionally, you could add logic here if you want to scroll to the VAPT Form tab or similar
  }, []);
  return (
    <NewQuestionnaire
      defaultTab="vapt_form"
      key="vapt_form"
      onClauseTabClick={() => navigate(`/project/${projectid}/questionbank`)}
      onControlTabClick={() => navigate(`/project/${projectid}/questionbank?tab=control`)}
      {...props}
    />
  );
};

export default VaptForm; 