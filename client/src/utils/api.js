import axios from "axios";

export const getApiBaseUrl = () => process.env.REACT_APP_API_URL || "";

/** Open order invoice in new window and auto-print (like shipping label) */
export const openOrderInvoice = (orderId) => {
  const base = getApiBaseUrl();
  if (!base || !orderId) return;
  const url = `${base}/api/orders/${orderId}/invoice`;
  fetch(url, { method: "GET", headers: { Accept: "text/html" } })
    .then((r) => (r.ok ? r.text() : Promise.reject(new Error("Failed to load invoice"))))
    .then((html) => {
      const w = window.open("", "_blank");
      if (w) {
        w.document.write(html);
        w.document.close();
        setTimeout(() => {
          w.focus();
          w.print();
        }, 400);
      }
    })
    .catch(() => {
      window.open(url, "_blank");
    });
};

/** Open refund invoice in new window and auto-print (like shipping label) */
export const openRefundInvoice = (returnId) => {
  const base = getApiBaseUrl();
  if (!base || !returnId) return;
  const url = `${base}/api/returns/${returnId}/invoice`;
  fetch(url, { method: "GET", headers: { Accept: "text/html" } })
    .then((r) => (r.ok ? r.text() : Promise.reject(new Error("Failed to load invoice"))))
    .then((html) => {
      const w = window.open("", "_blank");
      if (w) {
        w.document.write(html);
        w.document.close();
        setTimeout(() => {
          w.focus();
          w.print();
        }, 400);
      }
    })
    .catch(() => {
      window.open(url, "_blank");
    });
};

// Helper function to get fresh headers every time a request is made
const getOptions = () => {
    const token = localStorage.getItem("token");
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    };
};

export const fetchDataFromApi = async (url) => {
    try {
        const { data } = await axios.get(process.env.REACT_APP_API_URL + url, getOptions());
        return data;
    } catch (error) {
        console.log(error);
        return error;
    }
}

export const postData = async (url, formData) => {
    try {
        const response = await fetch(process.env.REACT_APP_API_URL + url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = { msg: response.statusText || 'Request failed' };
        }

        if (response.ok) {
            return data;
        }
        return data;
    } catch (error) {
        console.error('Error:', error);
        return { success: false, msg: error?.message || 'Network error. Please try again.' };
    }
}

export const editData = async (url, updatedData) => {
    // FIX: Destructure { data } instead of { res }
    try {
        const { data } = await axios.put(`${process.env.REACT_APP_API_URL}${url}`, updatedData, getOptions());
        return data;
    } catch (error) {
        console.error("Edit Error:", error);
        throw error;
    }
}

export const deleteData = async (url) => {
    // FIX: Destructure { data } instead of { res }
    const { data } = await axios.delete(`${process.env.REACT_APP_API_URL}${url}`, getOptions());
    return data;
}

export const uploadImage = async (url, formData) => {
  try {
    const token = localStorage.getItem("token");
    const fullUrl = `${process.env.REACT_APP_API_URL}${url}`;
    console.log("Upload URL:", fullUrl); // Add this to see the full URL
    
    const { data } = await axios.post(fullUrl, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  } catch (error) {
    console.error("Upload error - Full URL:", error.config?.url);
    console.error("Error response:", error.response);
    console.error("Error status:", error.response?.status);
    throw error;
  }
}

export const deleteImages = async (url, image) => {
    // FIX: Axios delete handles data differently
    const { data } = await axios.delete(`${process.env.REACT_APP_API_URL}${url}`, {
        ...getOptions(),
        data: image 
    });
    return data;
}