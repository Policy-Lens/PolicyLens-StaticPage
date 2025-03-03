import { createContext, useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { apiRequest } from "../utils/api";
import { useParams } from "react-router-dom";
export const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [projectRole, setProjectRole] = useState("admin");
  const [project, setProject] = useState({ id: 4 });
  const {projectid} = useParams();
  useEffect(() => {
    // const role = Cookies.get("role"); // Read role from cookies
    // if (role) {
    //   setUser({ role });
    // }
    
    
    console.log(getProjectRole(),projectid);
  }, []);
  const getProjectRole = () => {
    return 'admin'
  };

  return (
    <ProjectContext.Provider value={{ projectRole, project, setProject }}>
      {children}
    </ProjectContext.Provider>
  );
};
