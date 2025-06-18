import React, { useState, useEffect, useRef } from 'react';
import { Footer, Navbar } from "../components";
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";

const OTP_TTL = 5 * 60; // seconds

const Register = () => {
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  // start countdown
  const startTimer = () => {
    setTimer(OTP_TTL);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    if (!email) return alert("Enter your email first");
    try {
      await axios.post('https://ecommerce-for-holo-decor.vercel.app/send-otp', { email });
      alert("OTP sent to your email!");
      setStep(2);
      startTimer();
    } catch (error) {
      alert("Failed to send OTP: " + (error.response?.data || error.message));
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return alert("Enter the OTP");
    try {
      await axios.post('https://ecommerce-for-holo-decor.vercel.app/verify-otp', { email, otp });
      clearInterval(timerRef.current);
      setStep(3);
    } catch (error) {
      alert("OTP verification failed: " + (error.response?.data || error.message));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://ecommerce-for-holo-decor.vercel.app/register', { name, email, password });
      alert("Registered successfully!");
      navigate('/login');
    } catch (error) {
      alert("Signup failed: " + (error.response?.data || error.message));
    }
  };

  // format mm:ss
  const fmt = (secs) => {
    const m = Math.floor(secs/60).toString().padStart(2,'0');
    const s = (secs%60).toString().padStart(2,'0');
    return `${m}:${s}`;
  };

  return (
    <>
      <Navbar />
      <div 
        className="container-fluid d-flex align-items-center justify-content-center min-vh-100 bg-light"
        style={{
          backgroundImage: `url('/assets/register-bg.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="card shadow-lg p-4" style={{ maxWidth: "450px", width: "100%", borderRadius: "20px", background: "rgba(255,255,255,0.9)" }}>
          <h2 className="text-center mb-3">Create an Account ✨</h2>
          <form onSubmit={step===3 ? handleRegister : e => e.preventDefault()}>
            
            {step === 1 && (
              <>
                <div className="mb-3">
                  <label>Email address</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button type="button" className="btn btn-info w-100 mb-2" onClick={handleSendOtp}>
                  Send OTP
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="mb-3">
                  <label>Enter OTP sent to {email}</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="6‑digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={handleVerifyOtp}
                    disabled={timer === 0}
                  >
                    Verify OTP
                  </button>
                  <small>
                    {timer > 0
                      ? <>Expires in <strong>{fmt(timer)}</strong></>
                      : <span className="text-danger">OTP expired</span>
                    }
                  </small>
                </div>
                {timer === 0 && (
                  <button
                    type="button"
                    className="btn btn-link"
                    onClick={handleSendOtp}
                  >
                    Resend OTP
                  </button>
                )}
              </>
            )}

            {step === 3 && (
              <>
                <div className="mb-3">
                  <label>Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label>Set Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-dark w-100">
                  Register
                </button>
              </>
            )}

            <p className="mt-3 text-center">
              Already have an account?{" "}
              <Link to="/login" className="text-info text-decoration-none">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Register;