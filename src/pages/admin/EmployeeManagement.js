import React, { useState, useEffect, useCallback } from 'react';
import { employeeService } from '../../services/dataService';
import Swal from 'sweetalert2';
import { FiPlus, FiEdit2, FiTrash2, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    name: '', aadhar: '', mobile: '', date_of_joining: '', department: 'Marketing', incentive_applicable: true,
    email: '', password: '', confirmPassword: '', salary: ''
  });

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await employeeService.getAll();
      setEmployees(res.data.data || []);
    } catch (err) {
      Swal.fire('Error', 'Failed to fetch employees', 'error');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

    const resetForm = () => {
        setForm({ name: '', aadhar: '', mobile: '', date_of_joining: '', department: 'Marketing', incentive_applicable: true, email: '', password: '', confirmPassword: '', salary: '' });
        setEditId(null);
      };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newForm = { ...form, [name]: type === 'checkbox' ? checked : value };
    // Disable incentive for Operations
    if (name === 'department' && value === 'Operations') {
      newForm.incentive_applicable = false;
    }
    setForm(newForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editId && form.password !== form.confirmPassword) {
      Swal.fire('Error', 'Passwords do not match', 'error');
      return;
    }
    try {
      if (editId) {
        await employeeService.update(editId, form);
        Swal.fire({ icon: 'success', title: 'Employee Updated!', timer: 1500, showConfirmButton: false });
      } else {
        await employeeService.create(form);
        Swal.fire({ icon: 'success', title: 'Employee Created!', timer: 1500, showConfirmButton: false });
      }
      setShowForm(false);
      resetForm();
      fetchEmployees();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Operation failed', 'error');
    }
  };

    const handleEdit = (emp) => {
      setForm({
        name: emp.name, aadhar: emp.aadhar || '', mobile: emp.mobile || '', date_of_joining: emp.date_of_joining ? new Date(emp.date_of_joining).toISOString().split('T')[0] : '',
        department: emp.department,
        incentive_applicable: emp.incentive_applicable === 1, email: emp.email,
        password: '', confirmPassword: '', salary: emp.salary || ''
      });
      setEditId(emp.id);
      setShowForm(true);
    };

  const handleDelete = async (id) => {
    const result = await Swal.fire({ title: 'Delete Employee?', text: 'This action cannot be undone.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#f44336', confirmButtonText: 'Yes, delete' });
    if (result.isConfirmed) {
      try {
        await employeeService.delete(id);
        Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1500, showConfirmButton: false });
        fetchEmployees();
      } catch (e) { Swal.fire('Error', 'Delete failed', 'error'); }
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Employee Management</h1>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
          <FiPlus /> Add Employee
        </button>
      </div>

      {loading ? (
        <div className="loading-overlay"><div className="spinner" /></div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Aadhar</th>
                <th>Department</th>
                <th>Incentive</th>
                <th>Salary</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: 40, color: '#999' }}>No employees found</td></tr>
              ) : employees.map((emp, i) => (
                <tr key={emp.id} className="animate-fadeIn" style={{ animationDelay: `${i * 0.05}s` }}>
                  <td>{i + 1}</td>
                  <td style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: emp.department === 'Marketing' ? 'linear-gradient(135deg, #ff6f00, #ff8f00)' : 'linear-gradient(135deg, #00bcd4, #0097a7)',
                      color: 'white', fontSize: 14
                    }}><FiUser /></div>
                    <span style={{ fontWeight: 600 }}>{emp.name}</span>
                  </td>
                  <td>{emp.email}</td>
                  <td>{emp.aadhar || '-'}</td>
                  <td><span className={`badge ${emp.department === 'Marketing' ? 'badge-warning' : 'badge-info'}`}>{emp.department}</span></td>
                  <td>{emp.incentive_applicable ? <span className="badge badge-success">Yes</span> : <span className="badge badge-danger">No</span>}</td>
                  <td style={{ fontWeight: 600 }}>Rs. {parseFloat(emp.salary || 0).toLocaleString('en-IN')}</td>
                  <td>{emp.is_active ? <span className="badge badge-success">Active</span> : <span className="badge badge-danger">Inactive</span>}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-accent btn-sm" onClick={() => handleEdit(emp)}><FiEdit2 /></button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(emp.id)}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Employee Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content animate-scaleIn">
            <div className="modal-header">
              <h2>{editId ? 'Edit Employee' : 'Add New Employee'}</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                      <label>Name *</label>
                      <input type="text" name="name" className="form-control" value={form.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label>Aadhar</label>
                      <input type="text" name="aadhar" className="form-control" value={form.aadhar} onChange={handleChange} placeholder="Aadhar number" />
                    </div>
                    <div className="form-group">
                      <label>Mobile Number</label>
                      <input type="tel" name="mobile" className="form-control" value={form.mobile} onChange={handleChange} placeholder="10-digit mobile number" />
                    </div>
                    <div className="form-group">
                      <label>Date of Joining</label>
                      <input type="date" name="date_of_joining" className="form-control" value={form.date_of_joining} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label>Department *</label>
                      <select name="department" className="form-control" value={form.department} onChange={handleChange}>
                        <option value="Marketing">Marketing</option>
                        <option value="Operations">Operations</option>
                      </select>
                    </div>
                  <div className="form-group">
                    <label>Salary</label>
                    <input type="number" name="salary" className="form-control" value={form.salary} onChange={handleChange} placeholder="Monthly salary" />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="checkbox" name="incentive_applicable" checked={form.incentive_applicable}
                        onChange={handleChange} disabled={form.department === 'Operations'} />
                      Incentive Applicable {form.department === 'Operations' && <span style={{ color: '#999', fontSize: 11 }}>(Disabled for Operations)</span>}
                    </label>
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input type="email" name="email" className="form-control" value={form.email} onChange={handleChange} required />
                  </div>
                    <div className="form-group">
                      <label>Password {editId ? '(leave blank to keep)' : '*'}</label>
                      <div style={{ position: 'relative' }}>
                        <input type={showPassword ? 'text' : 'password'} name="password" className="form-control" value={form.password} onChange={handleChange} {...(!editId && { required: true })} style={{ paddingRight: 40 }} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#666' }}>
                          {showPassword ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                    </div>
                    {!editId && (
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label>Confirm Password *</label>
                        <div style={{ position: 'relative' }}>
                          <input type={showPassword ? 'text' : 'password'} name="confirmPassword" className="form-control" value={form.confirmPassword} onChange={handleChange} required style={{ paddingRight: 40 }} />
                        </div>
                      </div>
                    )}
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{editId ? 'Update Employee' : 'Create Employee'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
