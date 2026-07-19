import DashboardLayout from "../layouts/DashboardLayout";
import { Card, Row, Col } from "react-bootstrap";

function Profile() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <DashboardLayout>
      <h2 className="mb-4">My Profile</h2>

      <Card className="shadow p-4">
        <Row className="mb-3">
          <Col md={3}><strong>Name</strong></Col>
          <Col>{user?.name || "N/A"}</Col>
        </Row>

        <Row className="mb-3">
          <Col md={3}><strong>Email</strong></Col>
          <Col>{user?.email || "N/A"}</Col>
        </Row>

        <Row className="mb-3">
          <Col md={3}><strong>Role</strong></Col>
          <Col>{user?.role || "N/A"}</Col>
        </Row>
      </Card>
    </DashboardLayout>
  );
}

export default Profile;