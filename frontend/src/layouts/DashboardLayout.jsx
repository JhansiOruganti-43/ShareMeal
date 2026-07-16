import { useState } from "react";
import { Container, Row, Col, Offcanvas } from "react-bootstrap";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function DashboardLayout({ children }) {
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <>
      <Navbar toggleSidebar={() => setShowSidebar(true)} />

      <Container fluid className="p-0">
        <Row className="g-0">
          {/* Desktop Sidebar */}
          <Col md={2} className="d-none d-md-block p-0">
            <Sidebar />
          </Col>

          {/* Mobile Sidebar */}
          <Offcanvas
            show={showSidebar}
            onHide={() => setShowSidebar(false)}
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>🍽 ShareMeal</Offcanvas.Title>
            </Offcanvas.Header>

            <Offcanvas.Body className="p-0">
              <Sidebar />
            </Offcanvas.Body>
          </Offcanvas>

          {/* Main Content */}
          <Col xs={12} md={10} lg={10} className="p-4">
            {children}
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default DashboardLayout;