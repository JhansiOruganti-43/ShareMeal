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
      <h2 className="fw-bold mb-4 text-success">
        ✅ Completed Donations
      </h2>

      <div className="row">
        {donations.map((donation) => (
          <div className="col-md-4 mb-4" key={donation._id}>
            <div
              className="card border-0 shadow-lg h-100"
              style={{
                borderRadius: "15px",
                overflow: "hidden",
                transition: "0.3s",
              }}
            >
              {donation.image && (
                <img
                  src={`http://localhost:5000${donation.image}`}
                  className="card-img-top"
                  alt={donation.foodName}
                  style={{
                    height: "200px",
                    objectFit: "cover",
                  }}
                />
              )}

              <div className="card-body">
                <h4 className="fw-bold text-dark mb-3">
                  🍽️ {donation.foodName}
                </h4>

                <p className="mb-2">
                  <strong>📦 Quantity:</strong> {donation.quantity}
                </p>

                <p className="mb-2">
                  <strong>📍 Pickup:</strong> {donation.pickupAddress}
                </p>

                <div className="mt-3">
                  <span
                    className="badge bg-success px-3 py-2"
                    style={{ fontSize: "15px" }}
                  >
                    ✅ Completed
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {donations.length === 0 && (
          <div className="text-center mt-5">
            <h5 className="text-muted">
              No completed donations found.
            </h5>
          </div>
        )}
      </div>
    </div>
  );
}

export default CompletedDonations;