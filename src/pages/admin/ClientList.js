import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientService, employeeService, invoiceService } from '../../services/dataService';
import Swal from 'sweetalert2';
import { FiSearch, FiEye, FiDownload, FiPlus, FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight, FiFileText } from 'react-icons/fi';

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [marketingEmps, setMarketingEmps] = useState([]);
  const [opsEmps, setOpsEmps] = useState([]);
  const [form, setForm] = useState({
    email: '', password: '', client_name: '', company: '', mobile: '', city: '', plan: 'website', subplan: '',
    payment_date: new Date().toISOString().split('T')[0],
    marketing_person_id: '', operations_person_id: '', important_info: '',
    requirement_snapshot: null
  });
  const navigate = useNavigate();

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await clientService.getAll({ search, page, limit: 15 });
      setClients(res.data.data.clients);
      setPagination(res.data.data.pagination);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [search, page]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  useEffect(() => {
    const fetchEmps = async () => {
      try {
        const [m, o] = await Promise.all([
          employeeService.getByDepartment('Marketing'),
          employeeService.getByDepartment('Operations')
        ]);
        setMarketingEmps(m.data.data || []);
        setOpsEmps(o.data.data || []);
      } catch (e) {}
    };
    fetchEmps();
  }, []);

  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };

  const fmt = (n) => parseFloat(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN') : '-';

    const handleDownloadInvoice = async (orderId) => {
      try {
        const res = await invoiceService.download(orderId);
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Internal-Invoice-${orderId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        Swal.fire({ icon: 'success', title: 'Internal Invoice Downloaded!', timer: 1500, showConfirmButton: false });
      } catch (e) {
        Swal.fire('Error', 'Failed to download internal invoice', 'error');
      }
    };

    const handleDownloadClientInvoice = async (orderId) => {
      try {
        const res = await invoiceService.downloadClient(orderId);
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Client-Invoice-${orderId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        Swal.fire({ icon: 'success', title: 'Client Invoice Downloaded!', timer: 1500, showConfirmButton: false });
      } catch (e) {
        Swal.fire('Error', 'Failed to download client invoice', 'error');
      }
    };


      const resetForm = () => {
        setForm({ email: '', password: '', client_name: '', company: '', mobile: '', city: '', plan: 'website', subplan: '', payment_date: new Date().toISOString().split('T')[0], marketing_person_id: '', operations_person_id: '', important_info: '', requirement_snapshot: null });
        setEditId(null);
      };

      const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'requirement_snapshot') {
          setForm({ ...form, requirement_snapshot: files[0] || null });
        } else if (name === 'plan') {
          setForm({ ...form, plan: value, subplan: value === 'marketing' ? 'ultimate' : '', important_info: '' });
        } else {
          setForm({ ...form, [name]: value });
        }
      };


  const handleSubmitForm = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await clientService.update(editId, form);
        Swal.fire({ icon: 'success', title: 'Client Updated!', timer: 1500, showConfirmButton: false });
      } else {
        await clientService.create(form);
        Swal.fire({ icon: 'success', title: 'Client Created!', timer: 1500, showConfirmButton: false });
      }
      setShowForm(false);
      resetForm();
      fetchClients();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Operation failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({ title: 'Delete Client?', text: 'This action cannot be undone.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#f44336', confirmButtonText: 'Yes, delete' });
    if (result.isConfirmed) {
      try {
        await clientService.delete(id);
        Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1500, showConfirmButton: false });
        fetchClients();
      } catch (e) { Swal.fire('Error', 'Delete failed', 'error'); }
    }
  };

      const handleEdit = (client) => {
        setForm({
          email: '', password: '', client_name: client.client_name || '', company: client.company,
          mobile: client.mobile || '', city: client.city || '',
          plan: client.plan, subplan: client.subplan || '',
          payment_date: client.payment_date ? new Date(client.payment_date).toISOString().split('T')[0] : '',
          marketing_person_id: client.marketing_person_id || '', operations_person_id: client.operations_person_id || '',
          important_info: client.important_info || '', requirement_snapshot: null
        });
        setEditId(client.id);
        setShowForm(true);
      };

  return (
    <div>
      <div className="page-header">
        <h1>Client Management</h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input type="text" placeholder="Search by any field..." value={search} onChange={handleSearch} />
          </div>
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
            <FiPlus /> Add Client
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-overlay"><div className="spinner" /></div>
      ) : (
        <>
          <div className="table-container">
            <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Email</th>
                    <th>Client Name</th>
                    <th>Company</th>
                    <th>Plan</th>
                    <th>SubPlan</th>
                    <th>Payment Date</th>
                    <th>Next Payment</th>
                    <th>Marketing</th>
                    <th>Operations</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.length === 0 ? (
                    <tr><td colSpan="12" style={{ textAlign: 'center', padding: 40, color: '#999' }}>No clients found</td></tr>
                  ) : clients.map((c, i) => (
                    <tr key={c.id} className="animate-fadeIn" style={{ animationDelay: `${i * 0.03}s` }}>
                      <td><span className="badge badge-primary">{c.order_id}</span></td>
                      <td>{c.email}</td>
                      <td>{c.client_name || '-'}</td>
                      <td style={{ fontWeight: 600 }}>{c.company}</td>
                      <td><span className={`badge ${c.plan === 'website' ? 'badge-info' : 'badge-warning'}`}>{c.plan}</span></td>
                      <td>{c.subplan ? <span className="badge badge-outline">{c.subplan}</span> : '-'}</td>
                      <td>{fmtDate(c.payment_date)}</td>
                      <td>{fmtDate(c.upcoming_payment_date)}</td>
                      <td>{c.marketing_person_name || '-'}</td>
                      <td>{c.operations_person_name || '-'}</td>
                      <td style={{ fontWeight: 700 }}>Rs. {fmt(c.amount)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button className="btn btn-primary btn-sm" title="View Tasks" onClick={() => navigate(`/admin/tasks/${c.id}`)}><FiEye /></button>
                            <button className="btn btn-success btn-sm" title="Download Internal Invoice" onClick={() => handleDownloadInvoice(c.id)}><FiDownload /></button>
                            <button className="btn btn-info btn-sm" title="Download Client Invoice" onClick={() => handleDownloadClientInvoice(c.id)}><FiFileText /></button>
                            <button className="btn btn-accent btn-sm" title="Edit" onClick={() => handleEdit(c)}><FiEdit2 /></button>
                            <button className="btn btn-danger btn-sm" title="Delete" onClick={() => handleDelete(c.id)}><FiTrash2 /></button>
                          </div>
                        </td>

                    </tr>
                  ))}
                </tbody>
            </table>
          </div>
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 20 }}>
              <button className="btn btn-outline btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><FiChevronLeft /></button>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Page {page} of {pagination.totalPages}</span>
              <button className="btn btn-outline btn-sm" onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}><FiChevronRight /></button>
            </div>
          )}
        </>
      )}

      {/* Client Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content animate-scaleIn">
            <div className="modal-header">
              <h2>{editId ? 'Edit Client' : 'Add New Client'}</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmitForm}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {!editId && (
                    <>
                      <div className="form-group">
                        <label>Email *</label>
                        <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} required />
                      </div>
                      <div className="form-group">
                        <label>Password *</label>
                        <input type="password" className="form-control" name="password" value={form.password} onChange={handleChange} required />
                      </div>
                    </>
                  )}
                      <div className="form-group">
                        <label>Client Name *</label>
                        <input type="text" className="form-control" name="client_name" value={form.client_name} onChange={handleChange} required />
                      </div>
                      <div className="form-group">
                        <label>Company *</label>
                        <input type="text" className="form-control" name="company" value={form.company} onChange={handleChange} required />
                      </div>
                      <div className="form-group">
                        <label>Mobile Number</label>
                        <input type="tel" className="form-control" name="mobile" value={form.mobile} onChange={handleChange} placeholder="10-digit mobile number" />
                      </div>
                      <div className="form-group">
                        <label>City / Location</label>
                        <input type="text" className="form-control" name="city" value={form.city} onChange={handleChange} placeholder="City or Location" />
                      </div>
                    <div className="form-group">
                      <label>Plan</label>
                      <select className="form-control" name="plan" value={form.plan} onChange={handleChange}>
                        <option value="website">Website</option>
                        <option value="marketing">Marketing</option>
                      </select>
                    </div>
                    {form.plan === 'marketing' && (
                      <div className="form-group">
                        <label>Sub Plan</label>
                        <select className="form-control" name="subplan" value={form.subplan} onChange={handleChange}>
                          <option value="ultimate">Ultimate - Rs. 42,500</option>
                          <option value="starter">Starter - Rs. 21,250</option>
                        </select>
                      </div>
                    )}
                    <div className="form-group">
                      <label>Payment Date</label>
                      <input type="date" className="form-control" name="payment_date" value={form.payment_date} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label>Marketing Person</label>
                      <select className="form-control" name="marketing_person_id" value={form.marketing_person_id} onChange={handleChange}>
                        <option value="">Select</option>
                        {marketingEmps.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Operations Person</label>
                      <select className="form-control" name="operations_person_id" value={form.operations_person_id} onChange={handleChange}>
                        <option value="">Select</option>
                        {opsEmps.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                      </select>
                    </div>
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label>Requirement Snapshot (Image / PDF / Doc)</label>
                        <input type="file" className="form-control" name="requirement_snapshot" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.webp" onChange={handleChange} style={{ padding: '6px 10px' }} />
                        {editId && <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>Leave blank to keep existing snapshot.</div>}
                      </div>
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label>Important Information</label>
                        <textarea className="form-control" name="important_info" value={form.important_info} onChange={handleChange} rows="2" />
                      </div>
                  </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{editId ? 'Update Client' : 'Create Client'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientList;
