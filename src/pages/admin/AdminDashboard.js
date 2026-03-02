import React, { useState, useEffect } from 'react';
import { clientService } from '../../services/dataService';
import { FiUsers, FiDollarSign, FiTrendingUp, FiUserCheck, FiAlertCircle, FiGlobe, FiTarget } from 'react-icons/fi';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Date filter state
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    
    const [dateRange, setDateRange] = useState({
      startDate: firstDay,
      endDate: lastDay
    });
  
    const fetchStats = async (range) => {
      try {
        setLoading(true);
        const res = await clientService.getDashboardStats({
          startDate: range.startDate,
          endDate: range.endDate
        });
        setStats(res.data.data);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
  
    useEffect(() => {
      fetchStats(dateRange);
    }, []);
  
    const handleDateChange = (e) => {
      const { name, value } = e.target;
      const newRange = { ...dateRange, [name]: value };
      setDateRange(newRange);
      fetchStats(newRange);
    };

  if (loading && !stats) return <div className="loading-overlay"><div className="spinner" /><p>Loading dashboard...</p></div>;

    const fmt = (n) => parseFloat(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const statCards = [
      { label: 'Total Clients', value: stats?.totalClients || 0, icon: <FiUsers />, gradient: 'linear-gradient(135deg, #1a237e, #3949ab)' },
      { label: 'Total Employees', value: stats?.totalEmployees || 0, icon: <FiUserCheck />, gradient: 'linear-gradient(135deg, #00bcd4, #0097a7)' },
      { label: 'Pending Tasks', value: stats?.pendingTasks || 0, icon: <FiAlertCircle />, gradient: 'linear-gradient(135deg, #ff6f00, #ff8f00)' },
      { label: 'Total Revenue', value: `Rs. ${fmt(stats?.totalRevenue?.total)}`, icon: <FiDollarSign />, gradient: 'linear-gradient(135deg, #4caf50, #66bb6a)', sub: `Monthly: Rs. ${fmt(stats?.totalRevenue?.monthly)} | Yearly: Rs. ${fmt(stats?.totalRevenue?.yearly)}` },
    ];

    const financialCards = [
      { label: 'Total Income (100%)', value: stats?.financialSummary?.totalRevenue, color: '#1a237e', bg: '#e8eaf6' },
      { label: 'Hosting Charges (50%)', value: stats?.financialSummary?.hostingCost, color: '#fbc02d', bg: '#fffde7' },
      { label: 'Gross Margin', value: stats?.financialSummary?.grossMargin, color: '#388e3c', bg: '#e8f5e9' },
      { label: 'Payments (16%)', value: stats?.financialSummary?.payments, color: '#0288d1', bg: '#e1f5fe' },
      { label: 'Incentive (8%)', value: stats?.financialSummary?.incentive, color: '#7b1fa2', bg: '#f3e5f5' },
      { label: 'Office Expenses (4%)', value: stats?.financialSummary?.officeExpenses, color: '#c2185b', bg: '#fce4ec' },
      { label: 'Extraordinary (4%)', value: stats?.financialSummary?.extraordinary, color: '#e64a19', bg: '#fbe9e7' },
      { label: 'Net Profit (18%)', value: stats?.financialSummary?.netProfit, color: '#2e7d32', bg: '#c8e6c9' },
      // { label: 'Sumit (50% of NP)', value: stats?.financialSummary?.dividendSumit, color: '#1565c0', bg: '#e3f2fd' },
      // { label: 'Abhay (40% of NP)', value: stats?.financialSummary?.dividendAbhay, color: '#00838f', bg: '#e0f7fa' },
      // { label: 'TTD (10% of NP)', value: stats?.financialSummary?.dividendTTD, color: '#263238', bg: '#eceff1' },
    ];

    return (
      <div>

          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1>Admin Dashboard</h1>
          </div>
  
          <div className="stats-grid">
            {statCards.map((card, i) => (
              <div key={i} className="stat-card animate-fadeIn" style={{ background: card.gradient, animationDelay: `${i * 0.1}s` }}>
                <div className="stat-icon">{card.icon}</div>
                <div className="stat-value">{card.value}</div>
                <div className="stat-label">{card.label}</div>
                {card.sub && <div className="stat-sub">{card.sub}</div>}
              </div>
            ))}
          </div>
  
        {/* Domain-wise Earnings */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20, marginBottom: 24, marginTop: 24 }}>
          {/* Website Earnings */}
          <div className="card animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #7c4dff, #b388ff)', color: 'white', fontSize: 22
              }}><FiGlobe /></div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#1a237e' }}>Website Earnings</div>
                <div style={{ fontSize: 12, color: '#999' }}>Domain revenue breakdown</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ background: '#f3e5f5', borderRadius: 10, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#7b1fa2', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Monthly</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#4a148c' }}>Rs. {fmt(stats?.websiteEarnings?.monthly)}</div>
              </div>
              <div style={{ background: '#ede7f6', borderRadius: 10, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#512da8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Yearly</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#311b92' }}>Rs. {fmt(stats?.websiteEarnings?.yearly)}</div>
              </div>
            </div>
          </div>
  
          {/* Marketing Earnings */}
          <div className="card animate-fadeIn" style={{ animationDelay: '0.5s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #ff6f00, #ff8f00)', color: 'white', fontSize: 22
              }}><FiTarget /></div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#1a237e' }}>Marketing Earnings</div>
                <div style={{ fontSize: 12, color: '#999' }}>Domain revenue breakdown</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ background: '#fff3e0', borderRadius: 10, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#e65100', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Monthly</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#bf360c' }}>Rs. {fmt(stats?.marketingEarnings?.monthly)}</div>
              </div>
              <div style={{ background: '#fbe9e7', borderRadius: 10, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#d84315', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Yearly</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#b71c1c' }}>Rs. {fmt(stats?.marketingEarnings?.yearly)}</div>
              </div>
            </div>
          </div>
        </div>
  
        {/* Financial Summary */}
        <div className="card animate-fadeIn" style={{ animationDelay: '0.6s', marginBottom: 32, marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #1a237e, #3949ab)', color: 'white', fontSize: 22
                }}><FiTrendingUp /></div>
                <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#1a237e' }}>Financial Summary</div>
                <div style={{ fontSize: 12, color: '#999' }}>Detailed Revenue and Expense Breakdown</div>
                </div>
            </div>
            <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#999', textTransform: 'uppercase', marginBottom: 4 }}>From Date</div>
                    <input type="date" name="startDate" value={dateRange.startDate} onChange={handleDateChange} className="input-field" style={{ width: 150, marginBottom: 0, padding: '6px 10px', borderRadius: 8 }} />
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#999', textTransform: 'uppercase', marginBottom: 4 }}>To Date</div>
                    <input type="date" name="endDate" value={dateRange.endDate} onChange={handleDateChange} className="input-field" style={{ width: 150, marginBottom: 0, padding: '6px 10px', borderRadius: 8 }} />
                </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'center' }}>
            {financialCards.map((card, i) => (
              <div key={i} style={{ 
                flex: '1 1 calc(25% - 20px)',
                minWidth: 240,
                maxWidth: 'calc(25% - 15px)',
                background: card.bg,
                borderRadius: 12,
                padding: '24px 20px',
                border: `1px solid ${card.color}20`,
                textAlign: 'center',
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: card.color, textTransform: 'uppercase', marginBottom: 10, letterSpacing: 0.8, opacity: 0.8 }}>{card.label}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: card.color }}>Rs. {fmt(card.value)}</div>
              </div>
            ))}
          </div>
          
          <div style={{ marginTop: 24, padding: 16, background: '#fcfcfc', borderRadius: 10, border: '1px dashed #ddd' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1a237e', marginBottom: 8 }}>Income & Expense Breakdown:</div>
            <ul style={{ fontSize: 11, color: '#666', listStyleType: 'disc', paddingLeft: 20, lineHeight: 1.6 }}>
                <li><b>Total Income (100%)</b></li>
                {/* <li><b>Base Amount:</b> Revenue excluding tax (Total / 1.18).</li> */}
                <li><b>Hosting Cost (50%)</b> </li>
                <li><b>Payment Charges (16%)</b> </li>
                <li><b>Employee Incentives (8%):</b> Applicable only when an employee achieves ₹1,00,000 cross-sell per month</li>
                <li><b>Official Expenses (4%):</b> Final profit after all internal expenses (18% of Base).</li>
                <li><b>Extraordinary Expenses (4%)</b></li>
                <li><b>Gross Margin(50%)</b></li>
                <li><b>Net Profit(18%):</b> Net profit will be distributed among partners as per the agreed policy</li>
            </ul>
          </div>
        </div>

      </div>
    );
  };

export default AdminDashboard;
