import React, { useState } from 'react';
import { Navbar, Footer } from '../components';
import axios from 'axios';

const Forgot = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://ecommerce-for-holo-decor.vercel.app/forgot-password', { email });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data || "Something went wrong.");
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
          <h3 className="text-center fw-bold mb-3">Forgot Password</h3>
          <hr />
          <form onSubmit={handleSend}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Enter your email</label>
              <input
                type="email"
                id="email"
                className="form-control"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="text-end">
              <button type="submit" className="btn btn-primary px-4">Send Link</button>
            </div>
            {message && <div className="alert alert-info mt-3">{message}</div>}
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Forgot;