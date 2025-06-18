import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios'; // Make sure axios is installed

const Navbar = () => {
  const state = useSelector(state => state.handleCart);
  const [isLoginVisible, setIsLoginVisible] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const navigate = useNavigate();

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('https://ecommerce-for-holo-decor.vercel.app/getProducts'); // Change to your backend route
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
      p.title.toLowerCase().startsWith(value.toLowerCase()) ||
      p.title.toLowerCase().endsWith(value.toLowerCase())
    );
    setFilteredSuggestions(suggestions);
  };

  const handleSuggestionClick = (productId) => {
    navigate(`/product/${productId}`);
    setSearchTerm('');
    setFilteredSuggestions([]);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light sticky-top">
      <div className="container-fluid">
        {/* Left Nav Links */}
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
            {/* Suggestions Dropdown */}
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
            <i className="fa fa-cart-shopping me-1"></i>({state.length})
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
                  <li><NavLink to="/login" className="dropdown-item"><i className="fa fa-sign-in-alt me-2"></i> Login</NavLink></li>
                  <li><NavLink to="/register" className="dropdown-item"><i className="fa fa-user-plus me-2"></i> Register</NavLink></li>
                </>
              ) : (
                <li><button onClick={handleLogout} className="dropdown-item"><i className="fa fa-sign-out-alt me-2"></i> Logout</button></li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;