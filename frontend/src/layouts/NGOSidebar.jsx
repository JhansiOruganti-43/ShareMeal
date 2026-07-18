import { Link, useNavigate } from "react-router-dom";

function NGOSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div
      className="bg-success text-white p-3"
      style={{ width: "250px", minHeight: "100vh" }}
    >
      <h3 className="mb-4">🤝 NGO Panel</h3>

      <ul className="nav flex-column">

        <li className="nav-item mb-2">
          <Link
            to="/ngo-dashboard"
            className="nav-link text-white"
          >
            Dashboard
          </Link>
        </li>

        <li className="nav-item mb-2">
          <Link
            to="/available-donations"
            className="nav-link text-white"
          >
            Available Donations
          </Link>
        </li>

        <li className="nav-item mb-2">
          <Link
            to="/my-claimed-donations"
            className="nav-link text-white"
          >
            My Claimed Donations
          </Link>
        </li>
        <li className="nav-item mb-2"> <Link to="/completed-donations" className="nav-link text-white" >
    Completed Donations
  </Link>
</li>

        <li className="nav-item mt-4">
          <button
            className="btn btn-light w-100"
            onClick={handleLogout}
          >
            Logout
          </button>
        </li>

      </ul>
    </div>
  );
}

export default NGOSidebar;