import { createContext, useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { apiRequest } from "../utils/api";
export const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [projectRole, setProjectRole] = useState("admin");
  const [project, setProject] = useState({ id: 4 });
  useEffect(() => {
    // const role = Cookies.get("role"); // Read role from cookies
    // if (role) {
    //   setUser({ role });
    // }
    console.log(project);
    
    getProjectRole()
  }, []);
  const getProjectRole = async () => {
    return 'admin'
  };

  return (
    <ProjectContext.Provider value={{ projectRole, project, setProject }}>
      {children}
    </ProjectContext.Provider>
  );
};
