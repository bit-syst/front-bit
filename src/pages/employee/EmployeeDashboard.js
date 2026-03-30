import React, { useState, useEffect } from 'react';
import { employeeService } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';
import { FiDollarSign, FiTrendingUp, FiPackage, FiAward } from 'react-icons/fi';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await employeeService.getDashboard();
        setData(res.data.data);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetch();
  }, []);

  const fmt = (n) => parseFloat(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 });
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN') : '-';

  if (loading) return <div className="loading-overlay"><div className="spinner" /><p>Loading dashboard...</p></div>;
  if (!data) return <div className="loading-overlay"><p>No data available</p></div>;

  const { employee, orders, totalRevenue, totalIncentive, incentiveEligible, salary, prevYearTasks } = data;
  const isMarketingOrSales = employee.department === 'Sales' || employee.department === 'Marketing';

  // Progress bar calculation
  const maxProgress = Math.max(salary + (incentiveEligible ? totalIncentive : 0), 1);
  const salaryWidth = (salary / maxProgress) * 100;
  const incentiveWidth = incentiveEligible ? ((totalIncentive / maxProgress) * 100) : 0;

  // Revenue progress toward 200000 threshold
  const revenueProgress = Math.min((totalRevenue / 200000) * 100, 100);

  return (
    <div>
      <div className="page-header">
        <h1>Welcome, {employee.name}</h1>
        <span className={`badge ${isMarketingOrSales ? 'badge-warning' : 'badge-info'}`} style={{ fontSize: 14, padding: '6px 16px' }}>
          {employee.department} Department
        </span>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card animate-fadeIn" style={{ background: 'linear-gradient(135deg, #1a237e, #3949ab)' }}>
          <div className="stat-icon"><FiDollarSign /></div>
          <div className="stat-value">Rs. {fmt(salary)}</div>
          <div className="stat-label">Monthly Salary</div>
        </div>
        {isMarketingOrSales && (
          <>
            <div className="stat-card animate-fadeIn" style={{ background: 'linear-gradient(135deg, #ff6f00, #ff8f00)', animationDelay: '0.1s' }}>
              <div className="stat-icon"><FiAward /></div>
              <div className="stat-value">Rs. {fmt(incentiveEligible ? totalIncentive : 0)}</div>
              <div className="stat-label">Total Incentive Earned</div>
              <div className="stat-sub">{incentiveEligible ? 'Upto 15% incentive per product' : 'Unlock after Rs. 2,00,000 revenue'}</div>
            </div>
            <div className="stat-card animate-fadeIn" style={{ background: 'linear-gradient(135deg, #4caf50, #66bb6a)', animationDelay: '0.2s' }}>
              <div className="stat-icon"><FiTrendingUp /></div>
              <div className="stat-value">Rs. {fmt(totalRevenue)}</div>
              <div className="stat-label">Total Revenue Generated</div>
            </div>
            <div className="stat-card animate-fadeIn" style={{ background: 'linear-gradient(135deg, #7c4dff, #b388ff)', animationDelay: '0.3s' }}>
              <div className="stat-icon"><FiPackage /></div>
              <div className="stat-value">{orders.length}</div>
              <div className="stat-label">Total Orders</div>
            </div>
          </>
        )}
      </div>

      {/* Horizontal Progress Bar - Salary + Incentive */}
      <div className="card animate-fadeIn" style={{ marginBottom: 24, animationDelay: '0.4s' }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1a237e', marginBottom: 16 }}>
          Earnings Progress
        </h3>
        <div className="progress-container">
          <div className="progress-label">
            <span>Salary: Rs. {fmt(salary)}</span>
            {isMarketingOrSales && <span>Incentive: Rs. {fmt(incentiveEligible ? totalIncentive : 0)}</span>}
            <span>Total: Rs. {fmt(salary + (incentiveEligible ? totalIncentive : 0))}</span>
          </div>
          <div className="progress-bar" style={{ height: 24 }}>
            <div style={{ display: 'flex', height: '100%' }}>
              <div className="progress-fill" style={{
                width: `${salaryWidth}%`,
                background: 'linear-gradient(90deg, #1a237e, #3949ab)',
                borderRadius: incentiveWidth > 0 ? '6px 0 0 6px' : '6px'
              }} />
              {isMarketingOrSales && incentiveWidth > 0 && (
                <div className="progress-fill" style={{
                  width: `${incentiveWidth}%`,
                  background: 'linear-gradient(90deg, #ff6f00, #ff8f00)',
                  borderRadius: '0 6px 6px 0'
                }} />
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 12, marginTop: 6 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: '#1a237e', display: 'inline-block' }} /> Salary
            </span>
            {isMarketingOrSales && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: '#ff6f00', display: 'inline-block' }} /> Incentive
              </span>
            )}
          </div>
        </div>

        {/* Revenue Threshold Progress for Sales/Marketing */}
        {isMarketingOrSales && !incentiveEligible && (
          <div style={{ marginTop: 24 }}>
            <div className="progress-label">
              <span>Revenue Progress to Unlock Incentive</span>
              <span>Rs. {fmt(totalRevenue)} / Rs. 2,00,000</span>
            </div>
            <div className="progress-bar" style={{ height: 16 }}>
              <div className="progress-fill" style={{
                width: `${revenueProgress}%`,
                background: revenueProgress >= 100 ? 'linear-gradient(90deg, #4caf50, #66bb6a)' : 'linear-gradient(90deg, #ff9800, #ff6f00)'
              }} />
            </div>
            <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
              Incentive will be upto 15% beyond 2,00,000 Rs sales
            </div>
          </div>
        )}
      </div>

      {/* Order History (Sales/Marketing Only) */}
      {isMarketingOrSales && orders.length > 0 && (
        <div className="card animate-fadeIn" style={{ animationDelay: '0.5s', marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1a237e', marginBottom: 16 }}>Order History & Incentive</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Company</th>
                  <th>Plan</th>
                  <th>Amount</th>
                  <th>Incentive (Upto 15%)</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                  {orders.map((o, i) => (
                    <tr key={i} className="animate-fadeIn" style={{ animationDelay: `${i * 0.05}s` }}>
                      <td><span className="badge badge-primary">{o.order_id}</span></td>
                      <td style={{ fontWeight: 600 }}>{o.client_name ? `${o.client_name} - ` : ''}{o.company}</td>
                      <td><span className={`badge ${o.plan === 'website' ? 'badge-info' : 'badge-warning'}`}>{o.plan}</span></td>
                      <td style={{ fontWeight: 600 }}>Rs. {fmt(o.amount)}</td>
                      <td style={{ color: '#4caf50', fontWeight: 700 }}>Rs. {fmt(o.incentive)}</td>
                      <td>{formatDate(o.payment_date)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Operations Employee - Dashboard View */}
      {!isMarketingOrSales && orders.length > 0 && (
        <div className="card animate-fadeIn" style={{ animationDelay: '0.5s', marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1a237e', marginBottom: 16 }}>Assigned Projects</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Company</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o, i) => (
                  <tr key={i}>
                    <td><span className="badge badge-primary">{o.order_id}</span></td>
                    <td style={{ fontWeight: 600 }}>{o.company}</td>
                    <td>{o.plan}</td>
                    <td><span className="badge badge-success">{o.status}</span></td>
                    <td>{formatDate(o.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Previous Year Tasklist */}
      <div className="card animate-fadeIn" style={{ animationDelay: '0.6s' }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1a237e', marginBottom: 16 }}>
          Previous Year Tasklist ({new Date().getFullYear() - 1})
        </h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Due Date</th>
                <th>Company</th>
                <th>Task Title</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {prevYearTasks && prevYearTasks.length > 0 ? (
                prevYearTasks.map((t, i) => (
                  <tr key={i}>
                    <td>{formatDate(t.due_date)}</td>
                    <td style={{ fontWeight: 600 }}>{t.company}</td>
                    <td>Card {t.card_number}: {t.title}</td>
                    <td>
                      <span className={`badge ${t.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                    No tasks found for the previous year.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!isMarketingOrSales && orders.length === 0 && (
        <div className="card animate-fadeIn" style={{ animationDelay: '0.5s', textAlign: 'center', padding: 40 }}>
          <FiDollarSign size={48} color="#00bcd4" />
          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1a237e', margin: '16px 0 8px' }}>Operations Department</h3>
          <p style={{ color: '#666', fontSize: 14 }}>Your monthly salary is Rs. {fmt(salary)}</p>
          <p style={{ color: '#999', fontSize: 12 }}>Incentive is not applicable for Operations department</p>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
