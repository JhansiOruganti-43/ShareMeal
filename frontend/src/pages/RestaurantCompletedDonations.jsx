import { useEffect, useState } from "react";
import { getRestaurantCompletedDonations } from "../services/donationService";

function RestaurantCompletedDonations() {
  const [donations, setDonations] = useState([]);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const data = await getRestaurantCompletedDonations();
      setDonations(data.donations);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="fw-bold text-success mb-4">
        ✅ Completed Donations
      </h2>

      <div className="row">
        {donations.map((donation) => (
          <div className="col-md-4 mb-4" key={donation._id}>
            <div
              className="card border-0 shadow-lg h-100"
              style={{
                borderRadius: "15px",
                transition: "0.3s",
              }}
            >
              <div className="card-body">
                <h4 className="fw-bold mb-3">
                  🍽️ {donation.foodName}
                </h4>

                <p className="mb-2">
                  <strong>📦 Quantity:</strong> {donation.quantity}
                </p>

                <p className="mb-2">
                  <strong>🏢 Claimed By:</strong>{" "}
                  {donation.claimedBy?.name || "N/A"}
                </p>

                <p className="mb-2">
                  <strong>✉️ Email:</strong>{" "}
                  {donation.claimedBy?.email || "N/A"}
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

export default RestaurantCompletedDonations;