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
      <h2 className="mb-4">Completed Donations</h2>

      <div className="row">
        {donations.map((donation) => (
          <div className="col-md-4 mb-3" key={donation._id}>
            <div className="card shadow-sm">

              <div className="card-body">
                <h5>{donation.foodName}</h5>

                <p>
                  <strong>Quantity:</strong> {donation.quantity}
                </p>

                <p>
                  <strong>Claimed By:</strong>{" "}
                  {donation.claimedBy?.name || "N/A"}
                </p>

                <p>
                  <strong>Email:</strong>{" "}
                  {donation.claimedBy?.email || "N/A"}
                </p>

                <p>
                  <strong>Status:</strong> {donation.status}
                </p>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RestaurantCompletedDonations;