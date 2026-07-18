import { useEffect, useState } from "react";
import { getCompletedDonations } from "../services/donationService";

function CompletedDonations() {
  const [donations, setDonations] = useState([]);

  useEffect(() => {
    fetchCompletedDonations();
  }, []);

  const fetchCompletedDonations = async () => {
    try {
      const data = await getCompletedDonations();
      setDonations(data.donations);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Completed Donations</h2>

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
                <p><strong>Quantity:</strong> {donation.quantity}</p>
                <p><strong>Pickup:</strong> {donation.pickupAddress}</p>
                <p><strong>Status:</strong> {donation.status}</p>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CompletedDonations;