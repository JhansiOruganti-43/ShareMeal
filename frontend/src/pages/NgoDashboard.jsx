import { useEffect, useState } from "react";
import { getNGODashboard } from "../services/donationService";
import DashboardLayout from "../layouts/DashboardLayout";

function NGODashboard() {
  const [stats, setStats] = useState({
    available: 0,
    claimed: 0,
    completed: 0,
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const data = await getNGODashboard();
      setStats(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
  <DashboardLayout role="ngo">
    <div className="container mt-4">
      <h2 className="text-center mb-4">NGO Dashboard</h2>

      <div className="row g-4">
        <div className="col-md-4">
          <div className="card shadow text-center p-4">
            <h4>Available Donations</h4>
            <h2>{stats.available}</h2>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow text-center p-4">
            <h4>Claimed Donations</h4>
            <h2>{stats.claimed}</h2>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow text-center p-4">
            <h4>Completed Donations</h4>
            <h2>{stats.completed}</h2>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
);
}

export default NGODashboard;