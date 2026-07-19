import { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { Form, Button, Card, Row, Col } from "react-bootstrap";
import { createDonation } from "../services/donationService";

function AddDonation() {
  const [formData, setFormData] = useState({
    foodName: "",
    quantity: "",
    expiryTime: "",
    pickupAddress: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await createDonation(formData);

      alert(response.message || "Donation Added Successfully!");

      setFormData({
        foodName: "",
        quantity: "",
        expiryTime: "",
        pickupAddress: "",
        description: "",
      });
    } catch (error) {
      console.error(error);
      alert("Failed to add donation");
    }
  };

  return (
    <DashboardLayout>
      <h2 className="mb-4">Add Donation</h2>

      <Card className="shadow p-4">
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6} className="mb-3">
              <Form.Label>Food Name</Form.Label>
              <Form.Control
                type="text"
                name="foodName"
                value={formData.foodName}
                onChange={handleChange}
                placeholder="Enter food name"
              />
            </Col>

            <Col md={6} className="mb-3">
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="text"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="Ex: 20 Meals"
              />
            </Col>
          </Row>

          <Row>
            <Col md={6} className="mb-3">
              <Form.Label>Expiry Time</Form.Label>
              <Form.Control
                type="datetime-local"
                name="expiryTime"
                value={formData.expiryTime}
                onChange={handleChange}
              />
            </Col>

            <Col md={6} className="mb-3">
              <Form.Label>Pickup Address</Form.Label>
              <Form.Control
                type="text"
                name="pickupAddress"
                value={formData.pickupAddress}
                onChange={handleChange}
                placeholder="Enter pickup location"
              />
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the food..."
            />
          </Form.Group>

          <Button variant="success" type="submit">
            Add Donation
          </Button>
        </Form>
      </Card>
    </DashboardLayout>
  );
}

export default AddDonation;