import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Form, Button, Card, Row, Col } from "react-bootstrap";
import { registerUser } from "../services/authService";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "restaurant",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await registerUser(formData);

      alert(res.data.message);

      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Registration Failed");
    }
  };

  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}
    >
      <Card
        className="shadow"
        style={{ width: "550px", padding: "30px", borderRadius: "12px" }}
      >
        <h2 className="text-center mb-4">🍽️ ShareMeal Register</h2>

        <Form onSubmit={handleSubmit}>
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3}>
              Name
            </Form.Label>
            <Col sm={9}>
              <Form.Control
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3}>
              Email
            </Form.Label>
            <Col sm={9}>
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={3}>
              Password
            </Form.Label>
            <Col sm={9}>
              <Form.Control
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-4">
            <Form.Label column sm={3}>
              Role
            </Form.Label>
            <Col sm={9}>
              <Form.Select
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="restaurant">Restaurant</option>
                <option value="ngo">NGO</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Col>
          </Form.Group>

          <Button variant="success" type="submit" className="w-100">
            Register
          </Button>

          <p className="text-center mt-3 mb-0">
            Already have an account?{" "}
            <Link to="/">Login</Link>
          </p>
        </Form>
      </Card>
    </Container>
  );
}

export default Register;