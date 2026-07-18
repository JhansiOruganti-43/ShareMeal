import { useEffect, useState } from "react";
import {
  getMyClaimedDonations,
  completeDonation,
} from "../services/donationService";
function MyClaimedDonations() {
  const [donations, setDonations] = useState([]);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const data = await getMyClaimedDonations();
      console.log(data.donations);
      setDonations(data.donations);
    } catch (error) {
      console.error(error);
    }
  };
  const handleComplete = async (id) => {
  try {
    await completeDonation(id);

    alert("Donation marked as completed!");

    fetchDonations();
  } catch (error) {
    alert(error.response?.data?.message || "Something went wrong");
  }
};

  return (
    <div className="container mt-4">
      <h2 className="mb-4">My Claimed Donations</h2>

      <div className="row">
        {donations.map((donation) => (
          <div className="col-md-4 mb-3" key={donation._id}>
            <div className="card shadow-sm">
              {donation.image && (
                <img
  src={`http://localhost:5000${donation.image}`}
  className="card-img-top"
  alt={donation.foodName}
  style={{ height: "200px", objectFit: "cover" }}
/>
              )}

              <div className="card-body">
                <h5>{donation.foodName}</h5>
                <p>Quantity: {donation.quantity}</p>
                <p>Status: {donation.status}</p>
                {donation.status === "Claimed" && (
  <button
    className="btn btn-primary w-100 mb-3"
    onClick={() => handleComplete(donation._id)}
  >
    Mark as Completed
  </button>
)}
                <p>Pickup: {donation.pickupAddress}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyClaimedDonations;