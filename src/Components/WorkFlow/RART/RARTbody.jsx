import { Flex, Row, Spin, Col, message } from "antd";
import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { WorkflowContext } from "../../../Context/WorkflowContext";
import { ProjectContext } from "../../../Context/ProjectContext";
import StepDetails from "../WorkflowComponents/StepDetails";
import RARTview from "./RARTview";
import RARTedit from "./RARTedit";

const RARTbody = ({ projectId, refreshProjectData }) => {
  const { projectid } = useParams();
  const currentProjectId = projectId || projectid;
  
  const {
    getStepDetails,
    isLoading: contextLoading,
    canUserEdit,
    canSeeReviewer,
  } = useContext(WorkflowContext);
  
  const { projectRole } = useContext(ProjectContext);

  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stepDetails, setStepDetails] = useState({});
  const [stepSpecificData, setStepSpecificData] = useState({});
  const [permissions, setPermissions] = useState({ can_edit: false, can_review: false });
  const [stepId, setStepId] = useState(null);

  const editmodeon = () => {
    setEditMode(true);
  };
  
  const editmodeoff = () => {
    setEditMode(false);
  };

  // Fetch RART data (step_no = 6)
  const fetchStepData = async () => {
    if (!currentProjectId) return;

    try {
      setIsLoading(true);
      
      // Fetch fresh data
      const response = await getStepDetails(currentProjectId, 6);
      
      if (response) {
        setStepDetails(response.step_details || {});
        setStepSpecificData(response.step_specific_data || {});
        setPermissions(response.permissions || { can_edit: false, can_review: false });
        setStepId(response.step_id || null);
      } else {
        // No data found, set initial permissions based on role
        const initialPermissions = {
          can_edit: canUserEdit(projectRole, null),
          can_review: canSeeReviewer(null, projectRole)
        };
        setPermissions(initialPermissions);
      }
    } catch (error) {
      console.error('Error fetching RART data:', error);
      message.error('Failed to load RART data');
    } finally {
      setIsLoading(false);
    }
  };
  const refreshData = () => {
    fetchStepData();
    if (refreshProjectData) {
      refreshProjectData();
    }
  };

  useEffect(() => {
    fetchStepData();
  }, [currentProjectId]);

  if (isLoading || contextLoading) {
    return (
      <div style={{ height: "100%", margin: "auto" }}>
        <Spin
          size="large"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        />
      </div>
    );
  }

  return (
    <Row
      justify="space-evenly"
      gutter={[16, 0]}
    >
      <Col
        span={7}
        // style={{ border: "1px solid #E0E0E0", borderRadius: "8px" }}
      >
        <StepDetails 
          stepDetails={stepDetails} 
          setStepDetails={setStepDetails}
          stepId={stepId}
          permissions={permissions}
          refreshData={refreshData}
          projectRole={projectRole}
          projectId={currentProjectId}
          stepSpecificData={stepSpecificData}
        />
      </Col>
      <Col span={16}>
        {editMode ? (
          <RARTedit 
            editmodeoff={editmodeoff}
            stepSpecificData={stepSpecificData}
            setStepSpecificData={setStepSpecificData}
            stepId={stepId}
            projectId={currentProjectId}
            permissions={permissions}
            refreshData={refreshData}
          />
        ) : (
          <RARTview 
            editmodeon={editmodeon}
            stepSpecificData={stepSpecificData}
            stepDetails={stepDetails}
            permissions={permissions}
            projectRole={projectRole}
          />
        )}
      </Col>
    </Row>
  );
};

export default RARTbody;
