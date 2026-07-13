import { Nav } from "react-bootstrap";
import {
  FaHome,
  FaPlusCircle,
  FaBoxOpen,
  FaUser,
} from "react-icons/fa";

function Sidebar() {
  return (
    <div
      className="bg-dark text-white p-3"
      style={{
        minHeight: "100vh",
      }}
    >
      <h5 className="text-center mb-4">Restaurant</h5>

      <Nav className="flex-column">

        <Nav.Link href="/restaurant-dashboard" className="text-white mb-3">
          <FaHome className="me-2" />
          Dashboard
        </Nav.Link>

        <Nav.Link href="/add-donation" className="text-white mb-3">
          <FaPlusCircle className="me-2" />
          Add Donation
        </Nav.Link>

        <Nav.Link href="/my-donations" className="text-white mb-3">
          <FaBoxOpen className="me-2" />
          My Donations
        </Nav.Link>

        <Nav.Link href="/profile" className="text-white">
          <FaUser className="me-2" />
          Profile
        </Nav.Link>

      </Nav>
    </div>
  );
}

export default Sidebar;