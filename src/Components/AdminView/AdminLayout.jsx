import SideNav from '../WorkFlow/SideNav';
import React, { useContext, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';



const AdminLayout = () => {
  const { checkLogin } = useContext(AuthContext)
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    const verifyLogin = async () => {
      const isLoggedIn = await checkLogin();
      if (!isLoggedIn) {
        navigate("/");
      }
    };

    verifyLogin();

  }, []);

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar */}
      <SideNav collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 overflow-auto bg-gray-100 p-0 ${collapsed ? "ml-16" : "ml-56"}`} >
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;

