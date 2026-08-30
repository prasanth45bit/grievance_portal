const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Helper to attach authorization header
const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem("token");
  const headers = {};
  if (!isMultipart) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

// Handle response wrapper
const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }
  return data;
};

export const api = {
  // Auth services
  auth: {
    registerCitizen: async (citizenData) => {
      const response = await fetch(`${BASE_URL}/auth/citizen/register`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          fullName: citizenData.fullName,
          email: citizenData.email,
          phone: citizenData.phone,
          password: citizenData.password,
          address: citizenData.address || "No Address Provided",
          districtId: parseInt(citizenData.districtId) || 23, // Default Salem=23 if blank
          pincode: citizenData.pincode || "636001",
        }),
      });
      return handleResponse(response);
    },
    loginCitizen: async (email, password) => {
      const response = await fetch(`${BASE_URL}/auth/citizen/login`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ email, password }),
      });
      const data = await handleResponse(response);
      if (data.success && data.data.token) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("role", "citizen");
        localStorage.setItem("user", JSON.stringify(data.data.user));
      }
      return data;
    },
    loginOfficer: async (email, password) => {
      const response = await fetch(`${BASE_URL}/auth/officer/login`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ email, password }),
      });
      const data = await handleResponse(response);
      if (data.success && data.data.token) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("role", "officer");
        localStorage.setItem("user", JSON.stringify(data.data.user));
      }
      return data;
    },
    loginAdmin: async (email, password) => {
      const response = await fetch(`${BASE_URL}/auth/admin/login`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ email, password }),
      });
      const data = await handleResponse(response);
      if (data.success && data.data.token) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("role", "admin");
        localStorage.setItem("user", JSON.stringify(data.data.user));
      }
      return data;
    },
    logout: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
    },
  },

  // Citizen Dashboard services
  citizen: {
    getProfile: async () => {
      const response = await fetch(`${BASE_URL}/citizens/me`, {
        method: "GET",
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    updateProfile: async (profileData) => {
      const response = await fetch(`${BASE_URL}/citizens/me`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(profileData),
      });
      return handleResponse(response);
    },
    getMyComplaints: async (page = 1, limit = 10, search = "") => {
      const query = `?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;
      const response = await fetch(`${BASE_URL}/complaints/my${query}`, {
        method: "GET",
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    createComplaint: async (complaintFormData) => {
      // complaintFormData must be a FormData instance containing files
      const response = await fetch(`${BASE_URL}/complaints`, {
        method: "POST",
        headers: getHeaders(true),
        body: complaintFormData,
      });
      return handleResponse(response);
    },
    getComplaintDetails: async (id) => {
      const response = await fetch(`${BASE_URL}/complaints/${id}`, {
        method: "GET",
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    submitFeedback: async (complaintId, rating, comments) => {
      const response = await fetch(`${BASE_URL}/complaints/${complaintId}/feedback`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ rating: parseInt(rating), comments }),
      });
      return handleResponse(response);
    },
  },

  // Officer Dashboard services
  officer: {
    getDashboardStats: async () => {
      const response = await fetch(`${BASE_URL}/officer/dashboard`, {
        method: "GET",
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    getAssignedComplaints: async (page = 1, limit = 10, status = "", priority = "") => {
      const query = `?page=${page}&limit=${limit}&status=${status}&priority=${priority}`;
      const response = await fetch(`${BASE_URL}/officer/complaints${query}`, {
        method: "GET",
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    acceptComplaint: async (id) => {
      const response = await fetch(`${BASE_URL}/officer/complaints/${id}/accept`, {
        method: "PATCH",
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    startWork: async (id) => {
      const response = await fetch(`${BASE_URL}/officer/complaints/${id}/start`, {
        method: "PATCH",
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    holdComplaint: async (id, remarks) => {
      const response = await fetch(`${BASE_URL}/officer/complaints/${id}/hold`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ remarks }),
      });
      return handleResponse(response);
    },
    escalateComplaint: async (id, remarks) => {
      const response = await fetch(`${BASE_URL}/officer/complaints/${id}/escalate`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ remarks }),
      });
      return handleResponse(response);
    },
    resolveComplaint: async (id, remarks) => {
      const response = await fetch(`${BASE_URL}/officer/complaints/${id}/resolve`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ remarks }),
      });
      return handleResponse(response);
    },
    uploadResolutionImage: async (complaintId, fileFormData) => {
      const response = await fetch(`${BASE_URL}/officer/complaints/${complaintId}/resolution-image`, {
        method: "POST",
        headers: getHeaders(true),
        body: fileFormData,
      });
      return handleResponse(response);
    },
  },

  // Admin Dashboard services
  admin: {
    getDashboardStats: async () => {
      const response = await fetch(`${BASE_URL}/admin/dashboard`, {
        method: "GET",
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    getComplaints: async (filters = {}) => {
      let queryParams = [];
      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          queryParams.push(`${key}=${encodeURIComponent(filters[key])}`);
        }
      });
      const queryStr = queryParams.length ? `?${queryParams.join("&")}` : "";
      const response = await fetch(`${BASE_URL}/admin/complaints${queryStr}`, {
        method: "GET",
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    createOfficer: async (officerData) => {
      const response = await fetch(`${BASE_URL}/admin/officers`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          fullName: officerData.fullName,
          email: officerData.email,
          phone: officerData.phone,
          employeeId: officerData.employeeId,
          designation: officerData.designation,
          districtId: parseInt(officerData.districtId),
          password: officerData.password,
        }),
      });
      return handleResponse(response);
    },
    getOfficers: async () => {
      const response = await fetch(`${BASE_URL}/admin/officers`, {
        method: "GET",
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    getOfficerDetails: async (id) => {
      const response = await fetch(`${BASE_URL}/admin/officers/${id}`, {
        method: "GET",
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    updateOfficer: async (id, updateData) => {
      const response = await fetch(`${BASE_URL}/admin/officers/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(updateData),
      });
      return handleResponse(response);
    },
    updateOfficerStatus: async (id, status) => {
      const response = await fetch(`${BASE_URL}/admin/officers/${id}/status`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });
      return handleResponse(response);
    },
    getOverviewReport: async () => {
      const response = await fetch(`${BASE_URL}/admin/reports/overview`, {
        method: "GET",
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    getDistrictReport: async () => {
      const response = await fetch(`${BASE_URL}/admin/reports/districts`, {
        method: "GET",
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    getOfficerReport: async () => {
      const response = await fetch(`${BASE_URL}/admin/reports/officers`, {
        method: "GET",
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    getTrendsReport: async () => {
      const response = await fetch(`${BASE_URL}/admin/reports/trends`, {
        method: "GET",
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
  },

  // Common notifications
  notifications: {
    getNotifications: async () => {
      const response = await fetch(`${BASE_URL}/notifications`, {
        method: "GET",
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    markAsRead: async (id) => {
      const response = await fetch(`${BASE_URL}/notifications/${id}/read`, {
        method: "PATCH",
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
  },
};
