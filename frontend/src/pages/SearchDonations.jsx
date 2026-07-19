import { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import axios from "../api/axios";
import { Card, Form, Button } from "react-bootstrap";

function SearchDonations() {
  const [foodName, setFoodName] = useState("");
  const [donations, setDonations] = useState([]);

  const handleSearch = async () => {
    try {
      const response = await axios.get(
        `/donations/search?foodName=${foodName}`
      );
      setDonations(response.data.donations);
    } catch (error) {
      console.error(error);
      alert("Search failed");
    }
  };

  return (
    <DashboardLayout>
      <h2 className="mb-4">Search Donations</h2>

      <div className="d-flex mb-4">
        <Form.Control
          type="text"
          placeholder="Enter food name..."
          value={foodName}
          onChange={(e) => setFoodName(e.target.value)}
        />
        <Button
          variant="success"
          className="ms-2"
          onClick={handleSearch}
        >
          Search
        </Button>
      </div>

      {donations.map((donation) => (
        <Card key={donation._id} className="mb-3 p-3">
          <h5>{donation.foodName}</h5>
          <p><strong>Quantity:</strong> {donation.quantity}</p>
          <p><strong>Pickup:</strong> {donation.pickupAddress}</p>
          <p><strong>Status:</strong> {donation.status}</p>
        </Card>
      ))}
    </DashboardLayout>
  );
}

export default SearchDonations;