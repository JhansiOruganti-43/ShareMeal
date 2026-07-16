import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  getDonationById,
  updateDonation,
} from "../services/donationService";

function EditDonation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
  foodName: "",
  quantity: "",
  expiryTime: "",
  pickupAddress: "",
});

  useEffect(() => {
    fetchDonation();
  }, []);

  const fetchDonation = async () => {
    try {
      const data = await getDonationById(id);

setFormData({
  foodName: data.donation.foodName,
  quantity: data.donation.quantity,
  expiryTime: data.donation.expiryTime.slice(0, 16),
  pickupAddress: data.donation.pickupAddress,
});
    } catch (error) {
      console.log(error);
    }
  };

  
  const handleUpdate = async () => {
  try {
    await updateDonation(id, formData);

    alert("Donation updated successfully!");
    navigate("/my-donations");

  } catch (error) {
    console.log(error);
    alert("Failed to update donation");
  }
};

  return (
    <DashboardLayout>
      <h2>Edit Donation</h2>

      <div className="card p-4 mt-3">

  <div className="mb-3">
    <label>Food Name</label>
    <input
      type="text"
      className="form-control"
      value={formData.foodName}
onChange={(e) =>
  setFormData({ ...formData, foodName: e.target.value })
}
      
    />
  </div>

  <div className="mb-3">
    <label>Quantity</label>
    <input
      type="number"
      className="form-control"
      value={formData.quantity}
onChange={(e) =>
  setFormData({ ...formData, quantity: e.target.value })
}
      
    />
  </div>

  <div className="mb-3">
    <label>Expiry Time</label>
    <input
      type="datetime-local"
      className="form-control"
      value={formData.expiryTime}
onChange={(e) =>
  setFormData({ ...formData, expiryTime: e.target.value })
}
      
    />
  </div>

  <div className="mb-3">
    <label>Pickup Address</label>
    <input
      type="text"
      className="form-control"
      value={formData.pickupAddress}
onChange={(e) =>
  setFormData({ ...formData, pickupAddress: e.target.value })
}
      
    />
    <button
  className="btn btn-success mt-3"
  onClick={handleUpdate}>
  Update Donation
</button>
  </div>

</div>
    </DashboardLayout>
  );
}

export default EditDonation;