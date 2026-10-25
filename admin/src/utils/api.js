import axios from "axios";

export const getApiBaseUrl = () => process.env.REACT_APP_BASE_URL || process.env.REACT_APP_API_URL || "";

/** Open order invoice in new window and auto-print (like shipping label) */
export const openOrderInvoice = (orderId) => {
  const base = getApiBaseUrl();
  if (!base || !orderId) return;
  const url = `${base}/api/orders/${orderId}/invoice`;
  fetch(url, { method: "GET", headers: { Accept: "text/html" } })
    .then((r) => (r.ok ? r.text() : Promise.reject(new Error("Failed"))))
    .then((html) => {
      const w = window.open("", "_blank");
      if (w) {
        w.document.write(html);
        w.document.close();
        setTimeout(() => { w.focus(); w.print(); }, 400);
      }
    })
    .catch(() => window.open(url, "_blank"));
};

/** Open refund invoice in new window and auto-print (like shipping label) */
export const openRefundInvoice = (returnId) => {
  const base = getApiBaseUrl();
  if (!base || !returnId) return;
  const url = `${base}/api/returns/${returnId}/invoice`;
  fetch(url, { method: "GET", headers: { Accept: "text/html" } })
    .then((r) => (r.ok ? r.text() : Promise.reject(new Error("Failed"))))
    .then((html) => {
      const w = window.open("", "_blank");
      if (w) {
        w.document.write(html);
        w.document.close();
        setTimeout(() => { w.focus(); w.print(); }, 400);
      }
    })
    .catch(() => window.open(url, "_blank"));
};

const token = localStorage.getItem("token");

const params = {
  headers: {
    Authorization: `Bearer ${token}`, // Include your API key in the Authorization header
    "Content-Type": "application/json", // Adjust the content type as needed
  },
};

export const fetchDataFromApi = async (url) => {
  try {
    const { data } = await axios.get(
      process.env.REACT_APP_BASE_URL + url,
      params,
    );
    return data;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const uploadImage = async (url, formData) => {
  const { res } = await axios.post(
    process.env.REACT_APP_BASE_URL + url,
    formData,
  );
  return res;
};

export const postData = async (url, formData) => {
  try {
    const response = await fetch(process.env.REACT_APP_BASE_URL + url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`, // Include your API key in the Authorization header
        "Content-Type": "application/json", // Adjust the content type as needed
      },

      body: JSON.stringify(formData),
    });

    if (response.ok) {
      const data = await response.json();
      //console.log(data)
      return data;
    } else {
      const errorData = await response.json();
      return errorData;
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

export const editData = async (url, updatedData) => {
  const { res } = await axios.put(
    `${process.env.REACT_APP_BASE_URL}${url}`,
    updatedData,
  );
  return res;
};

export const deleteData = async (url) => {
  const { res } = await axios.delete(
    `${process.env.REACT_APP_BASE_URL}${url}`,
    params,
  );
  return res;
};

export const deleteImages = async (url, image) => {
  const { res } = await axios.delete(
    `${process.env.REACT_APP_BASE_URL}${url}`,
    image,
  );
  return res;
};
