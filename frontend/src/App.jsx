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
import MyClaimedDonations from "./pages/MyClaimedDonations";
import CompletedDonations from "./pages/CompletedDonations";
import RestaurantCompletedDonations from "./pages/RestaurantCompletedDonations";
import SearchDonations from "./pages/SearchDonations";
import Profile from "./pages/Profile";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";



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
        <Route path="/my-claimed-donations" element={<MyClaimedDonations />} />
        <Route path="/completed-donations" element={<CompletedDonations />} />
        <Route path="/restaurant-completed-donations" element={<RestaurantCompletedDonations />}/>
        <Route path="/search" element={<SearchDonations />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  );
}

export default App;