import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { employeeService } from '../../services/dataService';
import Swal from 'sweetalert2';
import { FiUserPlus, FiChevronRight, FiChevronLeft, FiCheck, FiEye, FiEyeOff } from 'react-icons/fi';

const SignupPage = () => {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
      email: '', password: '', client_name: '', company: '', plan: 'website', subplan: '',
      payment_date: new Date().toISOString().split('T')[0],
      marketing_person_id: '', operations_person_id: '', important_info: ''
    });
    const [marketingEmployees, setMarketingEmployees] = useState([]);
    const [opsEmployees, setOpsEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { signup, settings } = useAuth();
    const navigate = useNavigate();

    const themeColors = settings?.theme_colors ? JSON.parse(settings.theme_colors) : ['#1a237e', '#311b92'];
    const gradient = `linear-gradient(135deg, ${themeColors.join(', ')})`;

    useEffect(() => {
      const fetchEmployees = async () => {
        try {
          const [mktRes, salesRes, opsRes1, opsRes2] = await Promise.all([
            employeeService.getPublicByDepartment('Marketing'),
            employeeService.getPublicByDepartment('Sales'),
            employeeService.getPublicByDepartment('Operations'),
            employeeService.getPublicByDepartment('Operation')
          ]);
          
          const mktData = [...(mktRes.data.data || []), ...(salesRes.data.data || [])];
          const uniqueMkt = Array.from(new Map(mktData.map(item => [item.id, item])).values());
          setMarketingEmployees(uniqueMkt);
          
          const opsData = [...(opsRes1.data.data || []), ...(opsRes2.data.data || [])];
          const uniqueOps = Array.from(new Map(opsData.map(item => [item.id, item])).values());
          setOpsEmployees(uniqueOps);
        } catch (e) { console.error('Error fetching employees:', e); }
      };
      fetchEmployees();
    }, []);

    const handleChange = (e) => {
      const { name, value } = e.target;
      if (name === 'plan') {
        setForm({ ...form, plan: value, subplan: value === 'marketing' ? 'ultimate' : '', important_info: '' });
      } else {
        setForm({ ...form, [name]: value });
      }
    };


    const getAmount = () => {
      let base = 21250;
      if (form.plan === 'marketing') {
        base = form.subplan === 'ultimate' ? 42500 : 21250;
      }
      return base;
    };

    const getTotal = () => getAmount();
    const getTax = () => (getTotal() - (getTotal() / 1.18));
    const getBase = () => getTotal() / 1.18;

    const fmt = (n) => n.toLocaleString('en-IN');


  const getUpcomingDate = () => {
    if (!form.payment_date) return '';
    const d = new Date(form.payment_date);
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  };

  const nextStep = () => {
    if (step === 1 && (!form.email || !form.password || !form.client_name)) {
      Swal.fire('Error', 'Please fill account details', 'error');
      return;
    }
    if (step === 2 && !form.company) {
      Swal.fire('Error', 'Please enter company name', 'error');
      return;
    }
    setStep(s => s + 1);
  };

  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 3) return nextStep();
    
    setLoading(true);
    try {
      await signup(form);
      Swal.fire({ icon: 'success', title: 'Registration Successful!', text: 'Please login with your credentials', timer: 2000, showConfirmButton: false });
      navigate('/login');
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Registration failed', 'error');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: gradient,
      padding: 20, overflow: 'hidden'
    }}>
      <div className="animate-scaleIn" style={{
        background: 'white', borderRadius: 24, padding: 32, width: '100%', maxWidth: 480,
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)', position: 'relative'
      }}>
        {/* Progress Bar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{
              height: 6, flex: 1, borderRadius: 3,
              background: step >= s ? '#4caf50' : '#e0e0e0',
              transition: 'all 0.3s ease'
            }} />
          ))}
        </div>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a237e', margin: 0 }}>
            {step === 1 ? 'Create Account' : step === 2 ? 'Plan Details' : 'Final Assignment'}
          </h1>
          <p style={{ color: '#666', fontSize: 13, marginTop: 4 }}>Step {step} of 3</p>
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="animate-fadeIn">
              <div className="form-group">
                <label>Email Address *</label>
                <input type="email" name="email" className="form-control" value={form.email} onChange={handleChange} placeholder="john@example.com" required />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? 'text' : 'password'} name="password" className="form-control" value={form.password} onChange={handleChange} placeholder="••••••••" required style={{ paddingRight: 40 }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#999' }}>
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Client / Representative Name *</label>
                <input type="text" name="client_name" className="form-control" value={form.client_name} onChange={handleChange} placeholder="Full Name" required />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fadeIn">
              <div className="form-group">
                <label>Company / Organization *</label>
                <input type="text" name="company" className="form-control" value={form.company} onChange={handleChange} placeholder="Company Name" required />
              </div>
              <div className="form-group">
                <label>Select Plan</label>
                <select name="plan" className="form-control" value={form.plan} onChange={handleChange}>
                  <option value="website">Website Development</option>
                  <option value="marketing">Marketing Plan</option>
                </select>
              </div>
              {form.plan === 'marketing' && (
                <div className="form-group animate-fadeIn">
                  <label>Sub Plan</label>
                  <select name="subplan" className="form-control" value={form.subplan} onChange={handleChange}>
                    <option value="ultimate">Ultimate (48 Cards)</option>
                    <option value="starter">Starter (24 Cards, Max 2/mo)</option>
                  </select>
                </div>
              )}
              {form.plan === 'website' && (
                <div className="form-group animate-fadeIn">
                  <label>Additional Information</label>
                  <textarea name="important_info" className="form-control" value={form.important_info} onChange={handleChange} placeholder="Requirements..." rows="2" />
                </div>
              )}
            </div>
          )}

            {step === 3 && (
              <div className="animate-fadeIn">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label>Base Amount</label>
                    <input type="text" className="form-control" value={`Rs. ${fmt(getBase())}`} readOnly style={{ background: '#f5f5f5', fontWeight: 600, fontSize: 13 }} />
                  </div>
                  <div className="form-group">
                    <label>Tax (GST 18% Incl.)</label>
                    <input type="text" className="form-control" value={`Rs. ${fmt(getTax())}`} readOnly style={{ background: '#f5f5f5', fontWeight: 600, fontSize: 13 }} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Total Plan Cost (Final)</label>
                  <input type="text" className="form-control" value={`Rs. ${fmt(getTotal())}`} readOnly style={{ background: '#e8f5e9', fontWeight: 800, color: '#2e7d32' }} />
                </div>
              <div className="form-group">
                <label>Payment Date</label>
                <input type="date" name="payment_date" className="form-control" value={form.payment_date} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Marketing Person</label>
                <select name="marketing_person_id" className="form-control" value={form.marketing_person_id} onChange={handleChange}>
                  <option value="">Select Marketing Employee</option>
                  {marketingEmployees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Operations Person</label>
                <select name="operations_person_id" className="form-control" value={form.operations_person_id} onChange={handleChange}>
                  <option value="">Select Operations Employee</option>
                  {opsEmployees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            {step > 1 && (
              <button type="button" onClick={prevStep} className="btn btn-outline" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <FiChevronLeft /> Back
              </button>
            )}
            <button type="submit" className="btn btn-primary" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} disabled={loading}>
              {loading ? 'Processing...' : step === 3 ? <><FiCheck /> Complete</> : <>{step === 1 ? 'Next: Plan' : 'Next: Assignment'} <FiChevronRight /></>}
            </button>
          </div>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#666' }}>
          Already have an account? <Link to="/login" style={{ color: '#1a237e', fontWeight: 700, textDecoration: 'none' }}>Login</Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
