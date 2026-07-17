import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import RestaurantDashboard from "./pages/RestaurantDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AddDonation from "./pages/AddDonation";
import MyDonations from "./pages/MyDonations";
import EditDonation from "./pages/EditDonation";
import NGODashboard from "./pages/NGODashboard";
import AvailableDonations from "./pages/AvailableDonations";

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
        <Route path="/ngo-dashboard" element={<NGODashboard />} />
        <Route path="/available-donations" element={<AvailableDonations />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/add-donation" element={<AddDonation />} />
        <Route path="/my-donations" element={<MyDonations />}/>
        <Route path="/edit-donation/:id" element={<EditDonation />}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;