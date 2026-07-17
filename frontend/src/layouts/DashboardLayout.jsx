import { useState } from "react";
import { Container, Row, Col, Offcanvas } from "react-bootstrap";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import NGOSidebar from "./NGOSidebar";

function DashboardLayout({ children, role = "restaurant" }) {
  const [showSidebar, setShowSidebar] = useState(false);

  const SidebarComponent =
    role === "ngo" ? NGOSidebar : Sidebar;

  return (
    <>
      <Navbar toggleSidebar={() => setShowSidebar(true)} />

      <Container fluid className="p-0">
        <Row className="g-0">

          {/* Desktop Sidebar (Desktop only) */}
          <Col lg={2} className="d-none d-lg-block p-0">
            <SidebarComponent />
          </Col>

          {/* Mobile & Tablet Sidebar */}
          <Offcanvas
            show={showSidebar}
            onHide={() => setShowSidebar(false)}
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>🍽 ShareMeal</Offcanvas.Title>
            </Offcanvas.Header>

            <Offcanvas.Body className="p-0">
              <SidebarComponent />
            </Offcanvas.Body>
          </Offcanvas>

          {/* Main Content */}
          <Col xs={12} lg={10} className="p-4">
            {children}
          </Col>

        </Row>
      </Container>
    </>
  );
}

export default DashboardLayout;