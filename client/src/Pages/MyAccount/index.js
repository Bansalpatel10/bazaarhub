import React, { useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { IoMdCloudUpload } from "react-icons/io";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import {
  deleteData,
  editData,
  fetchDataFromApi,
  uploadImage,
} from "../../utils/api";

import { MyContext } from "../../App";

import NoUserImg from "../../assets/images/no-user.jpg";
import CircularProgress from "@mui/material/CircularProgress";

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography component="div">{children}</Typography>
        </Box>
      )}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const MyAccount = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [value, setValue] = useState(0);
  const history = useNavigate();
  const context = useContext(MyContext);

  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState([]);

  const [formFields, setFormFields] = useState({
    name: "",
    email: "",
    phone: "",
    images: [],
    isAdmin: false,
  });

  const [fields, setFields] = useState({
    oldPassword: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    window.scrollTo(0, 0);

    const token = localStorage.getItem("token");
    if (token !== "" && token !== undefined && token !== null) {
      setIsLogin(true);
    } else {
      history("/signIn");
    }

    const user = JSON.parse(localStorage.getItem("user"));

    fetchDataFromApi(`/api/user/${user?.userId}`).then((res) => {
      setPreviews(res.images || []);
      setFormFields({
        name: res.name || "",
        email: res.email || "",
        phone: res.phone || "",
        images: res.images || [],
        isAdmin: res.isAdmin || false,
      });
    });

    context.setEnableFilterTab(false);
  }, []);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const changeInput = (e) => {
    setFormFields({
      ...formFields,
      [e.target.name]: e.target.value,
    });
  };

  const changeInput2 = (e) => {
    setFields({
      ...fields,
      [e.target.name]: e.target.value,
    });
  };

  const onChangeFile = async (e, apiEndPoint) => {
    try {
      const files = e.target.files;
      setUploading(true);

      const fd = new FormData();
      for (let i = 0; i < files.length; i++) {
        if (files[i].type.match("image.*")) {
          fd.append("images", files[i]);
        } else {
          context.setAlertBox({
            open: true,
            error: true,
            msg: "Please select valid images (JPG/PNG/WebP).",
          });
          setUploading(false);
          return;
        }
      }

      // 1. Upload to cloud/temp
      uploadImage(apiEndPoint, fd).then((res) => {
        // 2. Fetch the uploaded URLs
        fetchDataFromApi("/api/imageUpload").then((response) => {
          if (response && response.length !== 0) {
            let img_arr = [];
            response.forEach((item) => {
              if (item?.images) {
                item.images.forEach((img) => img_arr.push(img));
              }
            });

            const uniqueArray = [...new Set(img_arr)];
            setPreviews(uniqueArray);

            // Sync formFields with new images
            setFormFields((prev) => ({ ...prev, images: uniqueArray }));

            // 3. Update User profile with new images
            const user = JSON.parse(localStorage.getItem("user"));
            const updateData = {
              ...formFields,
              images: uniqueArray,
            };

            editData(`/api/user/${user?.userId}`, updateData).then(() => {
              setUploading(false);
              context.setAlertBox({
                open: true,
                error: false,
                msg: "Images Uploaded and Profile Updated!",
              });
            });
          }
        });
      });
    } catch (error) {
      console.error(error);
      setUploading(false);
    }
  };

  const edituser = (e) => {
    e.preventDefault();

    if (
      formFields.name !== "" &&
      formFields.email !== "" &&
      formFields.phone !== ""
    ) {
      setIsLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));

      console.log("User ID from storage:", user?.userId);

      if (user && user.userId) {
        // Sending formFields as a JSON object (Fixes the AxiosError)
        editData(`/api/user/${user?.userId}`, formFields)
          .then((res) => {
            setIsLoading(false);
            deleteData("/api/imageUpload/deleteAllImages");
            context.setAlertBox({
              open: true,
              error: false,
              msg: "User updated successfully!",
            });
          })
          .catch((err) => {
            setIsLoading(false);
            console.log(err);
          });
      } else {
        console.error("No User ID found! Please logout and login again.");
        context.setAlertBox({
          open: true,
          error: true,
          msg: "Please fill all the details",
        });
      }
    }
  };

  const changePassword = (e) => {
    e.preventDefault();
    if (
      fields.oldPassword !== "" &&
      fields.password !== "" &&
      fields.confirmPassword !== ""
    ) {
      if (fields.password !== fields.confirmPassword) {
        context.setAlertBox({
          open: true,
          error: true,
          msg: "Password and confirm password do not match",
        });
      } else {
        const user = JSON.parse(localStorage.getItem("user"));
        const data = {
          email: formFields.email,
          password: fields.oldPassword,
          newPass: fields.password,
        };

        editData(`/api/user/changePassword/${user.userId}`, data).then(
          (res) => {
            context.setAlertBox({
              open: true,
              error: false,
              msg: "Password changed successfully!",
            });
          },
        );
      }
    } else {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Please fill all details",
      });
    }
  };

  return (
    <section className="section myAccountPage">
      <div className="container">
        <h2 className="hd">My Account</h2>

        <Box sx={{ width: "100%" }} className="myAccBox card border-0">
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="account tabs"
            >
              <Tab label="Edit Profile" {...a11yProps(0)} />
              <Tab label="Change Password" {...a11yProps(1)} />
            </Tabs>
          </Box>
          <CustomTabPanel value={value} index={0}>
            <form onSubmit={edituser}>
              <div className="row">
                <div className="col-md-4">
                  <div className="userImage d-flex align-items-center justify-content-center">
                    {uploading === true ? (
                      <CircularProgress />
                    ) : (
                      <>
                        {previews?.length !== 0 ? (
                          previews?.map((img, index) => (
                            <img src={img} key={index} alt="user" />
                          ))
                        ) : (
                          <img src={NoUserImg} alt="no-user" />
                        )}
                        <div className="overlay d-flex align-items-center justify-content-center">
                          <IoMdCloudUpload />
                          <input
                            type="file"
                            multiple
                            onChange={(e) =>
                              onChangeFile(e, "/api/user/upload")
                            }
                            name="images"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="col-md-8">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <TextField
                          label="Name"
                          variant="outlined"
                          className="w-100"
                          name="name"
                          onChange={changeInput}
                          value={formFields.name}
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
                        <TextField
                          label="Email"
                          disabled
                          variant="outlined"
                          className="w-100"
                          name="email"
                          value={formFields.email}
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
                        <TextField
                          label="Phone"
                          variant="outlined"
                          className="w-100"
                          name="phone"
                          onChange={changeInput}
                          value={formFields.phone}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <Button
                      type="submit"
                      className="btn-blue bg-red btn-lg btn-big"
                      variant="contained"
                    >
                      {isLoading === true ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        "Save"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </CustomTabPanel>

          <CustomTabPanel value={value} index={1}>
            <form onSubmit={changePassword}>
              <div className="row">
                <div className="col-md-12">
                  <div className="row">
                    <div className="col-md-4">
                      <div className="form-group">
                        <TextField
                          label="Old Password"
                          variant="outlined"
                          className="w-100"
                          name="oldPassword"
                          type="password"
                          onChange={changeInput2}
                        />
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="form-group">
                        <TextField
                          label="New password"
                          variant="outlined"
                          className="w-100"
                          name="password"
                          type="password"
                          onChange={changeInput2}
                        />
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="form-group">
                        <TextField
                          label="Confirm Password"
                          variant="outlined"
                          className="w-100"
                          name="confirmPassword"
                          type="password"
                          onChange={changeInput2}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <Button
                      type="submit"
                      className="btn-blue bg-red btn-lg btn-big"
                      variant="contained"
                    >
                      Save Password
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </CustomTabPanel>
        </Box>
      </div>
    </section>
  );
};

export default MyAccount;
