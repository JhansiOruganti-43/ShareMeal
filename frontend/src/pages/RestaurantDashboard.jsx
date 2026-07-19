import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { Row, Col, Card } from "react-bootstrap";
import { getRestaurantDashboard } from "../services/donationService";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

function RestaurantDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    claimed: 0,
    completed: 0,
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const data = await getRestaurantDashboard();
      setStats(data);
    } catch (error) {
      console.log(error);
    }
  };

  const chartData = [
    { name: "Available", value: stats.available },
    { name: "Claimed", value: stats.claimed },
    { name: "Completed", value: stats.completed },
  ];

  const COLORS = ["#28a745", "#ffc107", "#0d6efd"];

  return (
    <DashboardLayout>
      <h2 className="mb-4 text-center text-md-start">
        Restaurant Dashboard
      </h2>

      {/* Dashboard Cards */}
      <Row className="g-4 justify-content-start">
        <Col xs={12} sm={6} lg={3}>
          <Card
            className="shadow text-center p-3"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/my-donations")}
          >
            <h5>Total Donations</h5>
            <h2>{stats.total}</h2>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="shadow text-center p-3">
            <h5>Available</h5>
            <h2>{stats.available}</h2>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="shadow text-center p-3">
            <h5>Claimed</h5>
            <h2>{stats.claimed}</h2>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card
            className="shadow text-center p-3"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/restaurant-completed-donations")}
          >
            <h5>Completed</h5>
            <h2>{stats.completed}</h2>
          </Card>
        </Col>
      </Row>

      {/* Pie Chart */}
      <Row className="mt-5">
        <Col md={6} className="mx-auto">
          <Card className="shadow p-3">
            <h5 className="text-center mb-3">Donation Status</h5>

            <PieChart width={350} height={300}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>

              <Tooltip />
              <Legend />
            </PieChart>
          </Card>
        </Col>
      </Row>
    </DashboardLayout>
  );
}

export default RestaurantDashboard;