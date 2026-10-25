import axios from "axios";

export const uploadCloudinary = async (file, formData) => {

  formData.append("file", file);          // correct field
  formData.append("upload_preset", "mern_upload");  // your preset name

  const { data } = await axios.post(
    "https://api.cloudinary.com/v1_1/dvyozjjma/image/upload",
    formData
  );

  return {
    publicId: data.public_id,
    url: data.secure_url
  };
};