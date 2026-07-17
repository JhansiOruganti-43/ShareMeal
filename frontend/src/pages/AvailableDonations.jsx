import { useEffect, useState } from "react";
import { getAvailableDonations } from "../services/donationService";
import DashboardLayout from "../layouts/DashboardLayout";

function AvailableDonations() {
  const [donations, setDonations] = useState([]);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const data = await getAvailableDonations();
      setDonations(data.donations);
    } catch (error) {
      console.log(error);
    }
  };

  return (
  <DashboardLayout role="ngo">
    <div className="container mt-4">
      <h2 className="text-center mb-4">Available Donations</h2>

      <div className="row">
        {donations.map((donation) => (
          <div className="col-md-4 mb-4" key={donation._id}>
            <div className="card shadow">
              <div className="card-body">
                <h5>{donation.foodName}</h5>
                <p><strong>Quantity:</strong> {donation.quantity}</p>
                <p><strong>Restaurant:</strong> {donation.restaurant?.name}</p>
                <p><strong>Address:</strong> {donation.pickupAddress}</p>
                <p><strong>Status:</strong> {donation.status}</p>

                <button className="btn btn-success w-100">
                  Claim
                </button>
              </div>
            </div>
          </div>
        ))}

        {donations.length === 0 && (
          <div className="alert alert-info text-center">
            No Available Donations
          </div>
        )}
      </div>
    </div>
  </DashboardLayout>
);
}

export default AvailableDonations;