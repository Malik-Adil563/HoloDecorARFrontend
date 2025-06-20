import React, { useState } from "react";
import { Footer, Navbar } from "../components";
import axios from "axios";

const ContactPage = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback("");

    try {
      await axios.post("https://ecommerce-for-holo-decor.vercel.app/contact", form);
      setFeedback("Your message has been sent successfully!");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setFeedback("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div
        style={{
          backgroundImage: "url('/assets/contact-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "100vh",
          paddingTop: "60px",
          paddingBottom: "60px",
        }}
      >
        <div className="container">
          <div
            className="col-md-6 col-lg-5 col-sm-10 mx-auto p-4"
            style={{
              background: "rgba(255, 255, 255, 0.75)",
              backdropFilter: "blur(12px)",
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h2 className="text-center mb-4 fw-bold text-dark">Contact Us</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="Name" className="form-label fw-semibold">Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="Name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter your name"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="Email" className="form-label fw-semibold">Email</label>
                <input
                  type="email"
                  className="form-control"
                  id="Email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="name@example.com"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="Message" className="form-label fw-semibold">Message</label>
                <textarea
                  rows={5}
                  className="form-control"
                  id="Message"
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Enter your message"
                />
              </div>
              <div className="text-center">
                <button className="btn btn-dark px-4" type="submit" disabled={loading}>
                  {loading ? "Sending..." : "Send"}
                </button>
              </div>
              {feedback && (
                <p className={`mt-3 text-center ${feedback.includes("successfully") ? "text-success" : "text-danger"}`}>
                  {feedback}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ContactPage;