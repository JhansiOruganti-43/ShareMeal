import axios from "../api/axios";

// Create Donation
export const createDonation = async (formData) => {
  const token = localStorage.getItem("token");

  const response = await axios.post(
    "/donations/add",
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

// Get My Donations
export const getMyDonations = async () => {
  const token = localStorage.getItem("token");

  const response = await axios.get(
    "/donations/my",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};
export const getDonationById = async (id) => {
  const token = localStorage.getItem("token");

  const response = await axios.get(
    `/donations/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// Update Donation
export const updateDonation = async (id, formData) => {
  const token = localStorage.getItem("token");

  const response = await axios.put(
    `/donations/update/${id}`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};
// Delete Donation
export const deleteDonation = async (id) => {
  const token = localStorage.getItem("token");

  const response = await axios.delete(
    `/donations/delete/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};
// Restaurant Dashboard
export const getRestaurantDashboard = async () => {
  const token = localStorage.getItem("token");

  const response = await axios.get(
    "/donations/dashboard",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};
export const getNGODashboard = async () => {
  const token = localStorage.getItem("token");

  const response = await axios.get("/donations/ngo-dashboard", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
export const getAvailableDonations = async () => {
  const token = localStorage.getItem("token");

  const response = await axios.get("/donations/available", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
export const claimDonation = async (id) => {
  const token = localStorage.getItem("token");

  const response = await axios.put(
    `/donations/claim/${id}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};
export const getMyClaimedDonations = async () => {
  const token = localStorage.getItem("token");

  const response = await axios.get("/donations/my-claimed", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
export const completeDonation = async (id) => {
  const token = localStorage.getItem("token");

  const response = await axios.put(
    `/donations/complete/${id}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};
export const getCompletedDonations = async () => {
  const token = localStorage.getItem("token");

  const response = await axios.get("/donations/completed", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
export const getRestaurantCompletedDonations = async () => {
  const token = localStorage.getItem("token");

  const response = await axios.get(
    "/donations/restaurant-completed",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};