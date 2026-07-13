import { useState } from "react";
import Navbar from "../layouts/Navbar";
import Sidebar from "../layouts/Sidebar";
import { Container, Row, Col, Card, Offcanvas } from "react-bootstrap";

function RestaurantDashboard() {
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <>
      <Navbar toggleSidebar={() => setShowSidebar(true)} />

      <Container fluid>
        <Row>
          {/* Desktop Sidebar */}
          <Col md={2} className="d-none d-md-block p-0">
            <Sidebar />
          </Col>

          {/* Mobile Sidebar */}
          <Offcanvas
            show={showSidebar}
            onHide={() => setShowSidebar(false)}
            responsive="md"
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>ShareMeal</Offcanvas.Title>
            </Offcanvas.Header>

            <Offcanvas.Body className="p-0">
              <Sidebar />
            </Offcanvas.Body>
          </Offcanvas>

          {/* Dashboard Content */}
          <Col xs={12} md={10} className="p-4">
            <h2 className="mb-4 text-center text-md-start">
              Restaurant Dashboard
            </h2>

            <Row className="g-4">
              <Col xs={12} sm={6} lg={3}>
                <Card className="shadow text-center p-3">
                  <h5>Total Donations</h5>
                  <h2>0</h2>
                </Card>
              </Col>

              <Col xs={12} sm={6} lg={3}>
                <Card className="shadow text-center p-3">
                  <h5>Available</h5>
                  <h2>0</h2>
                </Card>
              </Col>

              <Col xs={12} sm={6} lg={3}>
                <Card className="shadow text-center p-3">
                  <h5>Claimed</h5>
                  <h2>0</h2>
                </Card>
              </Col>

              <Col xs={12} sm={6} lg={3}>
                <Card className="shadow text-center p-3">
                  <h5>Completed</h5>
                  <h2>0</h2>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default RestaurantDashboard;