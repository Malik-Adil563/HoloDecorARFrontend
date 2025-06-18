import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar, Footer } from '../components';
import axios from 'axios';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`https://ecommerce-for-holo-decor.vercel.app/reset-password/${token}`, { password });
      setMsg(res.data.message);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setMsg(err.response?.data || "Error resetting password");
    }
  };

  return (
    <>
      <Navbar />
      <div
        className="d-flex align-items-center justify-content-center"
        style={{
          minHeight: "100vh",
          background: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.6)), url('/assets/login-bg.png') center/cover no-repeat`,
        }}
      >
        <div className="card shadow-lg p-4 rounded-4" style={{ maxWidth: '450px', width: '100%', backgroundColor: 'rgba(255,255,255,0.95)' }}>
          <h3 className="text-center fw-bold mb-3">Reset Password</h3>
          <hr />
          <form onSubmit={handleReset}>
            <div className="mb-3">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="text-end">
              <button type="submit" className="btn btn-success px-4">Reset</button>
            </div>
            {msg && <div className="alert alert-info mt-3">{msg}</div>}
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ResetPassword;