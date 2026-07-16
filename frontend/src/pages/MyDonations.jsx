import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table } from "react-bootstrap";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  getMyDonations,
  deleteDonation,
} from "../services/donationService";

function MyDonations() {
  const [donations, setDonations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const data = await getMyDonations();
      setDonations(data.donations);
    } catch (error) {
      console.log(error);
    }
  };
  const handleDelete = async (id) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this donation?"
  );

  if (!confirmDelete) return;

  try {
    await deleteDonation(id);

    alert("Donation deleted successfully!");

    fetchDonations(); // Refresh the table
  } catch (error) {
    console.log(error);
    alert("Failed to delete donation");
  }
};

  return (
    <DashboardLayout>
      <h2 className="mb-4">My Donations</h2>

      {donations.length === 0 ? (
        <p>No donations found.</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead className="table-success">
            <tr>
              <th>Food Name</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Expiry Time</th>
              <th>Pickup Address</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {donations.map((donation) => (
              <tr key={donation._id}>
                <td>{donation.foodName}</td>
                <td>{donation.quantity}</td>
                <td>{donation.status}</td>
                <td>{new Date(donation.expiryTime).toLocaleString()}</td>
                <td>{donation.pickupAddress}</td>
                <td>
  <div className="d-flex flex-column flex-md-row gap-2">
    <button
      className="btn btn-warning btn-sm"
      onClick={() => navigate(`/edit-donation/${donation._id}`)}
    >
      Edit
    </button>

    <button
  className="btn btn-danger btn-sm"
  onClick={() => handleDelete(donation._id)}>
  Delete
</button>
  </div>
</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </DashboardLayout>
  );
}

export default MyDonations;