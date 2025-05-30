import { Routes, Route } from "react-router-dom";
import AdminDashboardList from "./AdminDashboardList";
import AdminDashboard from "./AdminDashboard";

const AdminDashboardRouter = () => {
    return (
        <Routes>
            {/* Dashboard List View */}
            <Route path="/" element={<AdminDashboardList />} />

            {/* Individual Dashboard View */}
            <Route path="/:dashboardId" element={<AdminDashboard />} />
        </Routes>
    );
};

export default AdminDashboardRouter; 