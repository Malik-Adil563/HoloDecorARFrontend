import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

const Navbar = () => {
  const state = useSelector(state => state.handleCart);
  const [isLoginVisible, setIsLoginVisible] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const navigate = useNavigate();

  // Fetch products for search
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('https://ecommerce-for-holo-decor.vercel.app/getProducts');
        setAllProducts(res.data);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      }
    };
    fetchProducts();
  }, []);

  // Auth check
  useEffect(() => {
    const authState = localStorage.getItem('authState');
    setIsLoginVisible(authState !== 'loggedin');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authState');
    localStorage.removeItem('userEmail');
    setIsLoginVisible(true);
    navigate('/');
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim() === '') {
      setFilteredSuggestions([]);
      return;
    }

    const suggestions = allProducts.filter(p =>
      p.title.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredSuggestions(suggestions);
  };

  const handleSuggestionClick = (productId) => {
    navigate(`/product/${productId}`);
    setSearchTerm('');
    setFilteredSuggestions([]);
  };

  const handleChangePassword = async () => {
    setPasswordMessage('');
    const email = localStorage.getItem('userEmail');
    if (!email) {
      setPasswordMessage('User email not found. Please login again.');
      return;
    }

    try {
      const res = await axios.post('https://ecommerce-for-holo-decor.vercel.app/change-password', {
        email,
        currentPassword,
        newPassword
      });

      setPasswordMessage(res.data.message);
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      if (error.response && error.response.data) {
        setPasswordMessage(error.response.data.error);
      } else {
        setPasswordMessage('Error changing password.');
      }
    }
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-light sticky-top">
        <div className="container-fluid">
          {/* Left Nav */}
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item">
                <NavLink className="nav-link" to="/">Home</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/product">Products</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/about">About</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/contact">Contact</NavLink>
              </li>
            </ul>
          </div>

          {/* Center Logo */}
          <NavLink to="/" className="navbar-brand position-absolute start-50 translate-middle-x">
            <img
              src="/assets/holodecorlogo.png"
              alt="HoloDecor Logo"
              style={{ height: '70px', objectFit: 'contain', cursor: 'pointer' }}
            />
          </NavLink>

          {/* Right Section */}
          <div className="d-flex align-items-center ms-auto position-relative">
            {/* Search */}
            <div className="d-none d-lg-block me-2">
              <input
                type="text"
                placeholder="Search"
                className="form-control form-control-sm"
                value={searchTerm}
                onChange={handleSearchChange}
                style={{ maxWidth: '200px' }}
              />
              {filteredSuggestions.length > 0 && (
                <ul className="list-group position-absolute mt-1 zindex-tooltip" style={{ width: '200px' }}>
                  {filteredSuggestions.map(p => (
                    <li
                      key={p._id}
                      className="list-group-item list-group-item-action"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSuggestionClick(p._id)}
                    >
                      {p.title}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Cart Button */}
            <NavLink to="/cart" className="btn btn-sm btn-outline-primary me-2">
              <i className="fa fa-shopping-cart me-1"></i>({state.length})
            </NavLink>

            {/* User Dropdown */}
            <div className="dropdown d-inline-block">
              <button
                className="btn btn-sm btn-outline-secondary dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
              >
                <i className="fa fa-user"></i>
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                {isLoginVisible ? (
                  <>
                    <li>
                      <NavLink to="/login" className="dropdown-item">
                        <i className="fa fa-sign-in-alt me-2"></i>Login
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/register" className="dropdown-item">
                        <i className="fa fa-user-plus me-2"></i>Register
                      </NavLink>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          setPasswordMessage('');
                          setShowPasswordModal(true);
                        }}
                      >
                        <i className="fa fa-key me-2"></i>Change Password
                      </button>
                    </li>
                    <li>
                      <button onClick={handleLogout} className="dropdown-item">
                        <i className="fa fa-sign-out-alt me-2"></i>Logout
                      </button>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Change Password</h5>
                <button type="button" className="btn-close" onClick={() => setShowPasswordModal(false)}></button>
              </div>
              <div className="modal-body">
                <input
                  type="password"
                  placeholder="Current Password"
                  className="form-control mb-2"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="New Password"
                  className="form-control mb-2"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                {passwordMessage && (
                  <div className={`alert ${passwordMessage.toLowerCase().includes('success') ? 'alert-success' : 'alert-danger'} mt-2`}>
                    {passwordMessage}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleChangePassword}>Change Password</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;