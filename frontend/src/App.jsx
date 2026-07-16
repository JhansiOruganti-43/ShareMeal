import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import RestaurantDashboard from "./pages/RestaurantDashboard";
import NgoDashboard from "./pages/NgoDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AddDonation from "./pages/AddDonation";
import MyDonations from "./pages/MyDonations";
import EditDonation from "./pages/EditDonation";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/restaurant-dashboard"
          element={<RestaurantDashboard />}
        />
        <Route path="/ngo-dashboard" element={<NgoDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/add-donation" element={<AddDonation />} />
        <Route path="/my-donations" element={<MyDonations />}/>
        <Route path="/edit-donation/:id" element={<EditDonation />}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;