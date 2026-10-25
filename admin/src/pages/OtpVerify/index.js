import { useContext, useEffect, useState } from "react";
import Logo from "../../assets/images/logo.png";
import patern from "../../assets/images/pattern.webp";
import { MyContext } from "../../App";
import Button from "@mui/material/Button";
import { Link, useNavigate } from "react-router-dom";
import { postData } from "../../utils/api";
import CircularProgress from "@mui/material/CircularProgress";
import OtpBox from "../../components/OtpBox";

const formatEmailForDisplay = (raw) => {
  if (!raw || typeof raw !== "string") return "";
  return raw.trim();
};

const getStoredEmail = () => {
  const raw = localStorage.getItem("userEmail");
  if (!raw || typeof raw !== "string") return "";
  return raw.trim();
};

const VerifyAccount = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otp, setOtp] = useState("");
  const [displayEmail, setDisplayEmail] = useState("");
  const history = useNavigate();
  const context = useContext(MyContext);

  useEffect(() => {
    context.setisHideSidebarAndHeader(true);
    setDisplayEmail(formatEmailForDisplay(localStorage.getItem("userEmail") || ""));
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((c) => (c <= 1 ? 0 : c - 1)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const handleOtpChange = (value) => {
    setOtp(value);
  };

  const verify = (e) => {
    e.preventDefault();
    const email = getStoredEmail();
    if (!email) {
      context.setAlertBox({ open: true, error: true, msg: "Session expired. Please sign in again." });
      return;
    }
    if (!otp || otp.length < 6) {
      context.setAlertBox({ open: true, error: true, msg: "Please enter the 6-digit OTP." });
      return;
    }
    setIsLoading(true);
    postData(`/api/user/verifyemail`, { otp, email }).then((res) => {
      setIsLoading(false);
      if (res?.success === true) {
        context.setAlertBox({ open: true, error: false, msg: res?.message });
        localStorage.removeItem("userEmail");
        history("/login");
      } else {
        context.setAlertBox({
          open: true,
          error: true,
          msg: res?.message || "Verification failed.",
        });
      }
    });
  };

  const handleResendOtp = () => {
    const email = getStoredEmail();
    if (!email) {
      context.setAlertBox({ open: true, error: true, msg: "Session expired. Please sign in again." });
      return;
    }
    if (resendLoading || resendCooldown > 0) return;
    setResendLoading(true);
    postData("/api/user/verifyAccount/resendOtp", { email }).then((res) => {
      setResendLoading(false);
      if (res?.success === true) {
        setResendCooldown(60);
        context.setAlertBox({ open: true, error: false, msg: res?.message || "New OTP sent to your email." });
      } else {
        context.setAlertBox({
          open: true,
          error: true,
          msg: res?.message || "Failed to resend OTP. Try again.",
        });
      }
    });
  };

  return (
    <>
      <img src={patern} className="loginPatern" alt="" />
      <section className="loginSection">
        <div className="loginBox">
          <Link to={"/"} className="d-flex align-items-center flex-column logo">
            <img src={Logo} alt="Logo" />
            <span className="ml-2">ECOMMERCE</span>
          </Link>
          <div className="wrapper mt-3 card border text-center">
            <form onSubmit={verify}>
              <img src={"/shield.png"} width="80px" alt="Verify" />
              <p className="text-center mt-3 mb-1">OTP has been sent to</p>
              <p className="text-center mb-3"><b>{displayEmail || "your email"}</b></p>

              <OtpBox length={6} onChange={handleOtpChange} />

              <div className="form-group mt-3 row">
                <Button
                  type="submit"
                  className="btn-blue btn-lg w-100 btn-big"
                  disabled={isLoading}
                >
                  {isLoading ? <CircularProgress size={24} /> : "Verify OTP"}
                </Button>
              </div>
            </form>
          </div>

          <div className="wrapper mt-3 card border footer p-3">
            <span className="text-center">
              <Button
                type="button"
                variant="text"
                className="link color ml-2"
                onClick={handleResendOtp}
                disabled={resendLoading || resendCooldown > 0}
                style={{ textTransform: "none" }}
              >
                {resendLoading ? "Sending…" : resendCooldown > 0 ? `Resend OTP (${resendCooldown}s)` : "Resend OTP"}
              </Button>
            </span>
          </div>
        </div>
      </section>
    </>
  );
};

export default VerifyAccount;
