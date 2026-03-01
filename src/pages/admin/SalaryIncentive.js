import React, { useState, useEffect } from 'react';
import { employeeService } from '../../services/dataService';
import { FiDollarSign, FiTrendingUp, FiUser } from 'react-icons/fi';

const SalaryIncentive = () => {
  const [data, setData] = useState({ employees: [], monthlyPayouts: {}, yearlyPayouts: {} });
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [dateData, setDateData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await employeeService.getSalaryIncentive();
        setData(res.data.data);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetch();
  }, []);

  const handleDateFilter = async () => {
    if (!dateRange.startDate || !dateRange.endDate) return;
    try {
      const res = await employeeService.getPayoutsByDate(dateRange);
      setDateData(res.data.data);
    } catch (e) { console.error(e); }
  };

  const fmt = (n) => parseFloat(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 });

  if (loading) return <div className="loading-overlay"><div className="spinner" /></div>;

  const monthlyTotal = parseFloat(data.monthlyPayouts?.total_salary || 0) + parseFloat(data.monthlyPayouts?.monthly_incentive || 0);
  const yearlyTotal = parseFloat(data.yearlyPayouts?.total_salary || 0) + parseFloat(data.yearlyPayouts?.yearly_incentive || 0);

  return (
    <div>
      <div className="page-header"><h1>Salary & Incentive Overview</h1></div>

      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #1a237e, #3949ab)' }}>
          <div className="stat-icon"><FiDollarSign /></div>
          <div className="stat-value">Rs. {fmt(monthlyTotal)}</div>
          <div className="stat-label">Monthly Total Payouts</div>
          <div className="stat-sub">Salary: Rs. {fmt(data.monthlyPayouts?.total_salary)} | Incentive: Rs. {fmt(data.monthlyPayouts?.monthly_incentive)}</div>
        </div>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #4caf50, #66bb6a)' }}>
          <div className="stat-icon"><FiTrendingUp /></div>
          <div className="stat-value">Rs. {fmt(yearlyTotal)}</div>
          <div className="stat-label">Yearly Total Payouts</div>
          <div className="stat-sub">Salary: Rs. {fmt(data.yearlyPayouts?.total_salary)} | Incentive: Rs. {fmt(data.yearlyPayouts?.yearly_incentive)}</div>
        </div>
      </div>

      {/* Date Filter */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Start Date</label>
            <input type="date" className="form-control" value={dateRange.startDate} onChange={e => setDateRange({...dateRange, startDate: e.target.value})} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>End Date</label>
            <input type="date" className="form-control" value={dateRange.endDate} onChange={e => setDateRange({...dateRange, endDate: e.target.value})} />
          </div>
          <button className="btn btn-primary" onClick={handleDateFilter}>Filter</button>
        </div>
      </div>

      {/* Employee Progress Bars */}
      <div className="card">
        <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1a237e', marginBottom: 24 }}>Employee Salary & Incentive Breakdown</h3>
        {data.employees.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>No employees found</div>
        ) : (
          data.employees.map((emp, i) => {
            const salary = parseFloat(emp.salary || 0);
            const incentive = parseFloat(emp.total_incentive_earned || 0);
            const total = salary + incentive;
            const maxVal = Math.max(...data.employees.map(e => parseFloat(e.salary || 0) + parseFloat(e.total_incentive_earned || 0)), 1);
            const salaryPct = (salary / Math.max(maxVal, 1)) * 100;
            const incentivePct = (incentive / Math.max(maxVal, 1)) * 100;

            return (
              <div key={emp.id} className="progress-container animate-fadeIn" style={{ animationDelay: `${i * 0.1}s` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: emp.department === 'Sales' ? 'linear-gradient(135deg, #ff6f00, #ff8f00)' : 'linear-gradient(135deg, #00bcd4, #0097a7)',
                    color: 'white', fontSize: 14
                  }}><FiUser /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{emp.name}</span>
                      <span style={{ fontWeight: 700, color: '#1a237e' }}>Rs. {fmt(total)}</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#999' }}>
                      <span className={`badge ${emp.department === 'Sales' ? 'badge-warning' : 'badge-info'}`} style={{ marginRight: 8 }}>{emp.department}</span>
                      Salary: Rs. {fmt(salary)} | Incentive: Rs. {fmt(incentive)} | Orders: {emp.total_orders}
                    </div>
                  </div>
                </div>
                <div className="progress-bar">
                  <div style={{ display: 'flex', height: '100%' }}>
                    <div className="progress-fill" style={{ width: `${salaryPct}%`, background: 'linear-gradient(90deg, #1a237e, #3949ab)', borderRadius: '6px 0 0 6px' }} />
                    <div className="progress-fill" style={{ width: `${incentivePct}%`, background: 'linear-gradient(90deg, #ff6f00, #ff8f00)', borderRadius: '0 6px 6px 0' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 11, marginTop: 4 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: '#1a237e', display: 'inline-block' }} /> Salary
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: '#ff6f00', display: 'inline-block' }} /> Incentive
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Date-wise Data */}
      {dateData && (
        <div className="card" style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1a237e', marginBottom: 16 }}>Date-wise Payouts</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Department</th><th>Salary</th><th>Incentive</th><th>Revenue</th><th>Orders</th></tr>
              </thead>
              <tbody>
                {dateData.map((d, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{d.name}</td>
                    <td><span className={`badge ${d.department === 'Sales' ? 'badge-warning' : 'badge-info'}`}>{d.department}</span></td>
                    <td>Rs. {fmt(d.salary)}</td>
                    <td>Rs. {fmt(d.incentive_earned)}</td>
                    <td>Rs. {fmt(d.revenue_generated)}</td>
                    <td>{d.order_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryIncentive;
