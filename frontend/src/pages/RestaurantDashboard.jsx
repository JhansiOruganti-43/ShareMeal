import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { Row, Col, Card } from "react-bootstrap";
import { getRestaurantDashboard } from "../services/donationService";

function RestaurantDashboard() {
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
  return (
    <DashboardLayout>
      <h2 className="mb-4 text-center text-md-start">
        Restaurant Dashboard
      </h2>

      <Row className="g-4 justify-content-start">
        <Col xs={12} sm={6} lg={3}>
          <Card className="shadow text-center p-3">
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
          <Card className="shadow text-center p-3">
            <h5>Completed</h5>
            <h2>{stats.completed}</h2>
          </Card>
        </Col>
      </Row>
    </DashboardLayout>
  );
}

export default RestaurantDashboard;