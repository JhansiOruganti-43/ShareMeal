import { Navbar, Container, Button } from "react-bootstrap";
import { FaBars } from "react-icons/fa";

function CustomNavbar({ toggleSidebar }) {
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <Navbar bg="success" variant="dark" expand="lg" className="px-3">
      <Container fluid>

        <Button
          variant="success"
          className="d-md-none me-2"
          onClick={toggleSidebar}
        >
           <FaBars size={24} />
        </Button>

        <Navbar.Brand>🍽 ShareMeal</Navbar.Brand>

        <div className="ms-auto d-flex align-items-center">

          <span className="text-white me-3 d-none d-md-block">
            Welcome, {user?.name}
          </span>

          <Button variant="light" onClick={handleLogout}>
            Logout
          </Button>

        </div>

      </Container>
    </Navbar>
  );
}

export default CustomNavbar;