import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Form, Button, Card } from "react-bootstrap";
import { loginUser } from "../services/authService";
import { toast } from "react-toastify";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
      const res = await loginUser(formData);

toast.success("Login Successful!");
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      const role = res.data.user.role;

      if (role === "restaurant") {
        navigate("/restaurant-dashboard");
      } else if (role === "ngo") {
        navigate("/ngo-dashboard");
      } else if (role === "admin") {
        navigate("/admin-dashboard");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login Failed");
    }
  };
  
  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ height: "100vh" }}
    >
      <Card style={{ width: "400px", padding: "25px" }}>
        <h2 className="text-center mb-4">🍽️ ShareMeal Login</h2>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />
          </Form.Group>

          <Button variant="success" type="submit" className="w-100">
            Login
          </Button>

          <p className="text-center mt-3">
            Don't have an account?{" "}
            <Link to="/register">Register</Link>
          </p>
        </Form>
      </Card>
    </Container>
  );
}

export default Login;