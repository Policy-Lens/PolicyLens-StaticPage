import SideNav from '../WorkFlow/SideNav';
import React from 'react';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
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

