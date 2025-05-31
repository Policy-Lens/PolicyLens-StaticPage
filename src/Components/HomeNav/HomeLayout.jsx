import React, { useState, useContext, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { AuthContext } from "../../AuthContext";
import Sidebar from "./Sidebar";

const HomeLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { checkLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyLogin = async () => {
      const isLoggedIn = await checkLogin();
      if (!isLoggedIn) {
        navigate("/"); // Redirect to login if not authenticated
      }
    };

    verifyLogin();
  }, []);

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar onToggle={setCollapsed} />

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          collapsed ? "ml-16" : "ml-[220px]"
        }`}
        style={{
          width: collapsed ? "calc(100% - 4rem)" : "calc(100% - 15rem)",
        }}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default HomeLayout;
