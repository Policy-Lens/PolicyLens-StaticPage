import SideNav from '../WorkFlow/SideNav';
import React, { useContext, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';

const AdminLayout = () => {
    const {checkLogin} = useContext(AuthContext)
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
            <SideNav />

            {/* Main Content */}
            <div className="w-[calc(100%-14rem)] flex-1 overflow-auto bg-gray-100 p-6">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;

