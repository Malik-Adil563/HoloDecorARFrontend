import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import {
  TrendingUp, Users, ShoppingBag, DollarSign,
  Bell, CreditCard, Menu, Trash2, Send, Edit, Mail, LogOut
} from 'lucide-react';

const API = 'https://ecommerce-for-holo-decor.vercel.app';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [admins, setAdmins] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`${API}/getAdmins`)
      .then(res => setAdmins(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    const matched = admins.find(a => a.email === email && a.password === password);
    if (matched) {
      onLogin();
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow p-4" style={{ maxWidth: '400px', width: '100%' }}>
        <h4 className="mb-3 text-center">Admin Login</h4>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            className="form-control mb-3"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="form-control mb-3"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <div className="text-danger text-center mb-2">{error}</div>}
          <button className="btn btn-primary w-100" type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

const Sidebar = ({ activeTab, onTabChange, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'products', label: 'Products', icon: ShoppingBag },
    { id: 'promotion', label: 'Send Promotion', icon: Send },
    { id: 'paymenthistory', label: 'Payment History', icon: DollarSign },
    { id: 'subscribers', label: 'Subscribers', icon: Users },
    { id: 'contact', label: 'Contact Messages', icon: Mail },
    { id: 'notification', label: 'Real-Time Notification', icon: Bell },
  ];
  return (
    <div className="bg-light border-end vh-100 d-flex flex-column justify-content-between p-3" style={{ minWidth: '250px' }}>
      <div>
        <h4 className="fw-bold mb-4">HoloDecor Admin</h4>
        {menuItems.map((item) => (
          <div
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`d-flex align-items-center mb-3 cursor-pointer ${activeTab === item.id ? 'fw-bold text-primary' : ''}`}
          >
            <item.icon className="me-2" size={18} />
            {item.label}
          </div>
        ))}
      </div>
      <div className="border-top pt-3">
        <div className="d-flex align-items-center text-danger cursor-pointer" onClick={onLogout}>
          <LogOut className="me-2" size={18} />
          Logout
        </div>
      </div>
    </div>
  );
};

const TopBar = ({ activeTab }) => {
  const map = {
    dashboard: 'Dashboard',
    users: 'Users Management',
    products: 'Products Management',
    promotion: 'Send Promotion',
    paymenthistory: 'Payment History',
    subscribers: 'Subscribers List',
    contact: 'Contact Messages'
  };
  return (
    <div className="d-flex justify-content-between align-items-center bg-white shadow-sm p-3">
      <h5 className="m-0">{map[activeTab] || 'Dashboard'}</h5>
      <Menu />
    </div>
  );
};

const UsersSection = () => {
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    axios.get(`${API}/getAllUsers`).then(res => setUsers(res.data)).catch(err => console.error(err));
  }, []);

  const deleteUser = id => {
    axios.delete(`${API}/deleteUser/${id}`).then(() => setUsers(users.filter(u => u._id !== id)));
  };

  const updateUser = () => {
    axios.put(`${API}/updateUser/${editUser._id}`, form).then(res => {
      setUsers(users.map(u => (u._id === editUser._id ? res.data : u)));
      setEditUser(null);
    });
  };

  return (
    <>
      <table className="table">
        <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Actions</th></tr></thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id}>
              <td>{u.name}</td><td>{u.email}</td><td>{u.phone}</td>
              <td>
                <Edit onClick={() => {
                  setEditUser(u);
                  setForm({ name: u.name, email: u.email, phone: u.phone });
                }} className="text-primary me-2 cursor-pointer" />
                <Trash2 onClick={() => deleteUser(u._id)} className="text-danger cursor-pointer" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editUser && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit User</h5>
                <button type="button" className="btn-close" onClick={() => setEditUser(null)}></button>
              </div>
              <div className="modal-body">
                <input className="form-control mb-2" placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                <input className="form-control mb-2" placeholder="Email Address" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                <input className="form-control" placeholder="Phone (optional)" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setEditUser(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={updateUser}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const ProductCard = ({ product, onDelete, onEdit }) => (
  <div className="card h-100">
    <img src={product.image} className="card-img-top" alt={product.title} style={{ height: '180px', objectFit: 'cover' }} />
    <div className="card-body">
      <h6 className="fw-bold">{product.title}</h6>
      <p className="text-muted">PKR {product.price}</p>
      <div className="d-flex justify-content-between">
        <Edit onClick={() => onEdit(product)} className="text-primary me-2 cursor-pointer" />
        <Trash2 onClick={() => onDelete(product._id)} className="text-danger cursor-pointer" />
      </div>
    </div>
  </div>
);

const ProductsSection = () => {
  const [products, setProducts] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({ title: '', price: '', image: '', description: '', category: '', productCode: '' });
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    axios.get(`${API}/getProducts`).then(res => setProducts(res.data)).catch(err => console.error(err));
  }, []);

  const deleteProduct = id => {
    axios.delete(`${API}/deleteProduct/${id}`).then(() => setProducts(products.filter(p => p._id !== id)));
  };

  const updateProduct = () => {
    axios.put(`${API}/updateProduct/${editProduct._id}`, form).then(res => {
      setProducts(products.map(p => (p._id === editProduct._id ? res.data : p)));
      setEditProduct(null);
    });
  };

  const addProduct = () => {
    axios.post(`${API}/addProduct`, form).then(res => {
      setProducts([...products, res.data]);
      setShowAddModal(false);
      setForm({ title: '', price: '', image: '', description: '', category: '', productCode: '' });
    });
  };

  const renderModal = () => (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{editProduct ? 'Edit Product' : 'Add Product'}</h5>
            <button type="button" className="btn-close" onClick={() => {
              setEditProduct(null);
              setShowAddModal(false);
            }}></button>
          </div>
          <div className="modal-body">
            <input className="form-control mb-2" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <input className="form-control mb-2" placeholder="Price in PKR" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
            <input className="form-control mb-2" placeholder="Image URL" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} />
            <input className="form-control mb-2" placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
            <input className="form-control mb-2" placeholder="Product Code" value={form.productCode} onChange={e => setForm({ ...form, productCode: e.target.value })} />
            <textarea className="form-control" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => {
              setEditProduct(null);
              setShowAddModal(false);
            }}>Cancel</button>
            <button className="btn btn-primary" onClick={editProduct ? updateProduct : addProduct}>
              {editProduct ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>Product List</h5>
        <button className="btn btn-success" onClick={() => setShowAddModal(true)}>Add Product</button>
      </div>

      <div className="row">
        {products.map(p => (
          <div key={p._id} className="col-md-4 mb-4">
            <ProductCard product={p} onDelete={deleteProduct} onEdit={() => {
              setEditProduct(p);
              setForm({
                title: p.title,
                price: p.price,
                image: p.image,
                description: p.description,
                category: p.category,
                productCode: p.productCode
              });
            }} />
          </div>
        ))}
      </div>

      {(editProduct || showAddModal) && renderModal()}
    </>
  );
};

const PromotionSection = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const sendPromotion = () => {
    axios.post(`${API}/sendPromotionToAllUsers`, { title, message })
      .then(() => alert('Promotion sent to all users'))
      .catch(err => alert('Failed to send promotion'));
  };
  return (
    <div className="card p-4">
      <h5 className="mb-3">Send Promotional Notification</h5>
      <input className="form-control mb-2" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
      <textarea className="form-control mb-2" placeholder="Message" value={message} onChange={e => setMessage(e.target.value)} />
      <button className="btn btn-primary" onClick={sendPromotion}>Send</button>
    </div>
  );
};

const DashboardSection = () => (
  <div className="alert alert-info">Welcome to HoloDecor Admin Dashboard</div>
);

const PaymentHistorySection = () => {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    axios.get(`${API}/getAllPayments`)
      .then(res => setRecords(res.data))
      .catch(err => console.error(err));
  }, []);

  const deleteRecord = id => {
    axios.delete(`${API}/deletePayment/${id}`)
      .then(() => setRecords(records.filter(r => r._id !== id)));
  };

  return (
    <div>
      <h5 className="mb-3">All Payment Records</h5>
      <table className="table table-striped">
        <thead><tr><th>Name</th><th>Email</th><th>Product</th><th>Country</th><th>Action</th></tr></thead>
        <tbody>
          {records.map(r => (
            <tr key={r._id}>
              <td>{r.firstName} {r.lastName}</td>
              <td>{r.email}</td>
              <td>{r.product?.name} (PKR {r.product?.price})</td>
              <td>{r.country}</td>
              <td><Trash2 className="text-danger cursor-pointer" onClick={() => deleteRecord(r._id)} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const SubscribersSection = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [editSub, setEditSub] = useState(null);
  const [form, setForm] = useState({ email: '' });

  useEffect(() => {
    axios.get(`${API}/getAllSubscribers`)
      .then(res => setSubscribers(res.data))
      .catch(err => console.error(err));
  }, []);

  const deleteSubscriber = id => {
    axios.delete(`${API}/deleteSubscriber/${id}`)
      .then(() => setSubscribers(subscribers.filter(s => s._id !== id)));
  };

  const updateSubscriber = () => {
    axios.put(`${API}/updateSubscriber/${editSub._id}`, form)
      .then(res => {
        setSubscribers(subscribers.map(s => (s._id === editSub._id ? res.data : s)));
        setEditSub(null);
      });
  };

  return (
    <>
      <h5 className="mb-3">All Subscribers</h5>
      <table className="table">
        <thead><tr><th>Email</th><th>Actions</th></tr></thead>
        <tbody>
          {subscribers.map(s => (
            <tr key={s._id}>
              <td>{s.email}</td>
              <td>
                <Edit onClick={() => {
                  setEditSub(s);
                  setForm({ email: s.email });
                }} className="text-primary me-2 cursor-pointer" />
                <Trash2 onClick={() => deleteSubscriber(s._id)} className="text-danger cursor-pointer" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editSub && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Subscriber</h5>
                <button type="button" className="btn-close" onClick={() => setEditSub(null)}></button>
              </div>
              <div className="modal-body">
                <input
                  className="form-control"
                  value={form.email}
                  placeholder="Subscriber Email"
                  onChange={e => setForm({ email: e.target.value })}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setEditSub(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={updateSubscriber}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const ContactSection = () => {
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState('');
  const [activeMessage, setActiveMessage] = useState(null);

  useEffect(() => {
    axios.get(`${API}/getAllMessages`).then(res => setMessages(res.data)).catch(err => console.error(err));
  }, []);

  const sendReply = () => {
    axios.post(`${API}/replyMessage/${activeMessage._id}`, { reply })
      .then(() => {
        alert("Reply sent");
        setActiveMessage(null);
        setReply('');
      }).catch(err => alert("Failed to send reply"));
  };

  return (
    <div>
      <h5 className="mb-3">Contact Messages</h5>
      <table className="table">
        <thead><tr><th>Name</th><th>Email</th><th>Message</th><th>Actions</th></tr></thead>
        <tbody>
          {messages.map(m => (
            <tr key={m._id}>
              <td>{m.name}</td>
              <td>{m.email}</td>
              <td>{m.message}</td>
              <td><Send onClick={() => setActiveMessage(m)} className="text-primary cursor-pointer" /></td>
            </tr>
          ))}
        </tbody>
      </table>

      {activeMessage && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reply to {activeMessage.name}</h5>
                <button type="button" className="btn-close" onClick={() => setActiveMessage(null)}></button>
              </div>
              <div className="modal-body">
                <p><strong>Email:</strong> {activeMessage.email}</p>
                <textarea
                  className="form-control"
                  placeholder="Write your reply here..."
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setActiveMessage(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={sendReply}>Send</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NotificationSender = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const sendNotification = () => {
    axios.post(`${API}/sendNotification`, { title, message })
      .then(() => alert('Notification sent'))
      .catch(err => alert('Failed to send'));
  };

  return (
    <div className="card p-4">
      <h5 className="mb-3">Push Real-time Notification</h5>
      <input className="form-control mb-2" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
      <textarea className="form-control mb-2" placeholder="Message" value={message} onChange={e => setMessage(e.target.value)} />
      <button className="btn btn-primary" onClick={sendNotification}>Send Notification</button>
    </div>
  );
};

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const renderSection = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardSection />;
      case 'users': return <UsersSection />;
      case 'products': return <ProductsSection />;
      case 'promotion': return <PromotionSection />;
      case 'paymenthistory': return <PaymentHistorySection />;
      case 'subscribers': return <SubscribersSection />;
      case 'contact': return <ContactSection />;
      case 'notification': return <NotificationSender />;
      default: return <DashboardSection />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="d-flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} />
      <div className="flex-grow-1">
        <TopBar activeTab={activeTab} />
        <div className="p-4">{renderSection()}</div>
      </div>
    </div>
  );
};

export default AdminDashboard;