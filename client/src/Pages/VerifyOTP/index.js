import { useContext, useEffect, useState } from "react";
import { MyContext } from "../../App";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import { postData } from "../../utils/api";
import OtpBox from "../../Components/OtpBox";

/** Format email for display: trimmed and consistent (proper format) */
const formatEmailForDisplay = (raw) => {
  if (!raw || typeof raw !== "string") return "";
  return raw.trim();
};

/** Email for API calls - trim only so it matches how user was registered */
const getStoredEmail = () => {
  const raw = localStorage.getItem("userEmail");
  if (!raw || typeof raw !== "string") return "";
  return raw.trim();
};

const VerifyOTP = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otp, setOtp] = useState("");
  const [displayEmail, setDisplayEmail] = useState("");
  const context = useContext(MyContext);
  const history = useNavigate();

  const handleOtpChange = (value) => {
    setOtp(value);
  };

  useEffect(() => {
    context.setisHeaderFooterShow(false);
    context.setEnableFilterTab(false);
    setDisplayEmail(formatEmailForDisplay(localStorage.getItem("userEmail") || ""));
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((c) => (c <= 1 ? 0 : c - 1)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

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
    const actionType = localStorage.getItem("actionType");
    postData(`/api/user/verifyemail`, { otp, email }).then((res) => {
      setIsLoading(false);
      if (res?.success === true) {
        context.setAlertBox({ open: true, error: false, msg: res?.message });
        if (actionType !== "changePassword") {
          localStorage.removeItem("userEmail");
          history("/signIn");
        } else {
          history("/changePassword");
        }
      } else {
        context.setAlertBox({
          open: true,
          error: true,
          msg: res?.message || "Verification failed. Please try again.",
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
    <section className="section signInPage otpPage">
      <div className="shape-bottom">
        <svg
          fill="#fff"
          id="Layer_1"
          x="0px"
          y="0px"
          viewBox="0 0 1921 819.8"
          style={{ enableBackground: "new 0 0 1921 819.8" }}
        >
          <path
            className="st0"
            d="M1921,413.1v406.7H0V0.5h0.4l228.1,598.3c30,74.4,80.8,130.6,152.5,168.6c107.6,57,212.1,40.7,245.7,34.4 c22.4-4.2,54.9-13.1,97.5-26.6L1921,400.5V413.1z"
          />
        </svg>
      </div>

      <div className="container">
        <div className="box card p-3 shadow border-0">
          <div className="text-center">
            <img src={"/shield.png"} width={"100px"} alt="Verify" />
          </div>

          <form className="mt-3" onSubmit={verify}>
            <h2 className="mb-1 text-center">OTP Verification</h2>
            <p className="text-center text-light mb-2">
              OTP has been sent to
            </p>
            <p className="text-center mb-3">
              <strong className="verify-email-display">{displayEmail || "your email"}</strong>
            </p>

            <OtpBox length={6} onChange={handleOtpChange} />

            <div className="d-flex align-items-center mt-3 mb-3 ">
              <Button
                type="submit"
                className="btn-blue col btn-lg btn-big"
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} /> : "Verify OTP"}
              </Button>
            </div>

            <p className="text-center mb-0">
              <Button
                type="button"
                variant="text"
                className="border-effect cursor txt"
                onClick={handleResendOtp}
                disabled={resendLoading || resendCooldown > 0}
                style={{ textTransform: "none", minWidth: 140 }}
              >
                {resendLoading
                  ? "Sending…"
                  : resendCooldown > 0
                  ? `Resend OTP (${resendCooldown}s)`
                  : "Resend OTP"}
              </Button>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default VerifyOTP;
