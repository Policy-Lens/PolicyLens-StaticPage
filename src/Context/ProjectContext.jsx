import { createContext, useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { apiRequest } from "../utils/api";
import { useParams } from "react-router-dom";
export const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [projectRole, setProjectRole] = useState("");
  const [project, setProject] = useState({ id: 4 });
  useEffect(() => {
    // const role = Cookies.get("role"); // Read role from cookies
    // if (role) {
    //   setUser({ role });
    // }
    
    
    // console.log(getProjectRole(),projectid);
  }, []);
  const getProjectRole = async(projectid) => {
    // console.log('get Project Role')
    const res = await apiRequest("GET", `/api/project/${projectid}/my-role/`,null,true);
    // console.log(res);
    if(res.status==200){
      setProjectRole(res.data.project_role)
    }
  };

  const getStepId = async(project_id,step_no) =>{
    const res = await apiRequest('GET',`/api/plc/plc_step/${project_id}/${step_no}/get_id/`,null,true);
    if(res.status==200){
      return res.data
    }
    else{
      // console.log(res.error)
    }
  }

  const checkStepAuth = async(step_id) =>{
    const res = await apiRequest('GET',`/api/plc/plc_step/${step_id}/authorization/`,null,true);
    if(res.status==200){
      return res.data.authorization
    }
    else{
      // console.log(res.error)
      return false
    }
  }

  const getStepData = async(step_id) =>{
    const res = await apiRequest('GET',`/api/plc/plc_data/${step_id}/latest/`,null,true);
    // console.log(res.data);
    return res.data
  }

  const addStepData = async(step_id,data) =>{
    const res = await apiRequest('POST',`/api/plc/plc_data/${step_id}/create/`,data,true);
    return res
  }

  const assignStep = async(step_id,data) =>{
    const res = await apiRequest('POST',`/api/plc/step-assignment/${step_id}/create/`,data,true);
    if(res.status==201){
      return true
    }
    else{
      // console.log(res.error)
      return false
    }
  }

  const getStepAssignment = async(step_id) =>{
    const res = await apiRequest('GET',`/api/plc/step-assignment/${step_id}/`,null,true);
    return res
  }
  const getMembers = async (projectid) => {
    const res = await apiRequest(
      "GET",
      `/api/project/${projectid}/members/`,
      null,
      true
    );
    if (res.status === 200) {
      return res.data
    }
  };


  return (
    <ProjectContext.Provider value={{ projectRole, project, setProject,getProjectRole,getStepId,checkStepAuth,getStepData,addStepData,assignStep,getStepAssignment,getMembers }}>
      {children}
    </ProjectContext.Provider>
  );
};
