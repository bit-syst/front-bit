import React, { useState, useEffect } from 'react';
import { clientService, taskService, invoiceService } from '../../services/dataService';
import { FiCheckCircle, FiClock, FiAlertTriangle, FiPackage, FiDownload } from 'react-icons/fi';
import Swal from 'sweetalert2';

const ClientDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [ordersRes, tasksRes] = await Promise.all([
          clientService.getMyOrders(),
          taskService.getMyTasks()
        ]);
        setOrders(ordersRes.data.data || []);
        setTasks(tasksRes.data.data || []);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetch();
  }, []);

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

    const handleDownloadInvoice = async (orderId) => {
      try {
        const res = await invoiceService.downloadClient(orderId);
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Invoice-${orderId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        Swal.fire({ icon: 'success', title: 'Invoice Downloaded!', timer: 1500, showConfirmButton: false });
      } catch (e) {
        Swal.fire('Error', 'Failed to download invoice', 'error');
      }
    };

    const pendingTasks = tasks.filter(t => t.status === 'pending');

  const completedTasks = tasks.filter(t => t.status === 'completed');
  const overdueTasks = tasks.filter(t => t.status === 'overdue');

  if (loading) return <div className="loading-overlay"><div className="spinner" /><p>Loading your dashboard...</p></div>;

  return (
    <div>
      <div className="page-header"><h1>My Dashboard</h1></div>

    {/* Order Summary & Website Details */}
    {orders.length > 0 && (
      <div style={{ marginBottom: 24 }}>
        <div className="stats-grid">
          {orders.map((o, i) => (
            <div key={o.id} className="stat-card animate-fadeIn" style={{
              background: o.plan === 'website' ? 'linear-gradient(135deg, #7c4dff, #b388ff)' : 'linear-gradient(135deg, #ff6f00, #ff8f00)',
              animationDelay: `${i * 0.1}s`,
              minHeight: 140
            }}>
              <div className="stat-icon"><FiPackage /></div>
              <div className="stat-value" style={{ fontSize: 20 }}>{o.order_id || o.order_code}</div>
                <div className="stat-label" style={{ fontSize: 16 }}>
                  {o.client_name ? `${o.client_name} - ` : ''}{o.company} - {o.plan.toUpperCase()}
                </div>
                {o.subplan && <div style={{ fontSize: 12, opacity: 0.9 }}>Sub Plan: {o.subplan.toUpperCase()}</div>}
                <div className="stat-sub">Payment: {formatDate(o.payment_date)} | Renewal: {formatDate(o.upcoming_payment_date)}</div>
                <button 
                  className="btn btn-sm btn-light" 
                  style={{ marginTop: 12, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white' }}
                  onClick={() => handleDownloadInvoice(o.id)}
                >
                  <FiDownload /> Download Invoice
                </button>
                  {o.plan === 'website' && (

                  <div style={{ marginTop: 12, background: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: 10, fontSize: 13, border: '1px solid rgba(255,255,255,0.3)' }}>
                      <div style={{ fontWeight: 800, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 8, height: 8, background: o.website_status === 'Active' ? '#4caf50' : '#ff9800', borderRadius: '50%', display: 'inline-block' }}></span>
                        Website Status: {o.website_status?.toUpperCase() || 'IN PROGRESS'}
                      </div>
                      <div style={{ marginBottom: 8 }}><strong>Renewal Date:</strong> {formatDate(o.upcoming_payment_date)}</div>
                      {o.website_link && <div style={{ marginBottom: 8 }}><strong>Link:</strong> <a href={o.website_link} target="_blank" rel="noreferrer" style={{ color: 'white', textDecoration: 'underline' }}>{o.website_link}</a></div>}
                      <div style={{ fontStyle: 'italic', background: 'rgba(0,0,0,0.1)', padding: '6px 10px', borderRadius: 6 }}>
                        <strong>Note:</strong> {o.important_info || 'No additional maintenance information.'}
                      </div>
                  </div>
                )}
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Task Section - Only for Marketing Plans */}
    {orders.some(o => o.plan === 'marketing') ? (
      <>
        {/* Task Stats */}
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          <div className="stat-card animate-fadeIn" style={{ background: 'linear-gradient(135deg, #ff9800, #ff6f00)' }}>
            <div className="stat-icon"><FiClock /></div>
            <div className="stat-value">{pendingTasks.length}</div>
            <div className="stat-label">Pending Tasks</div>
          </div>
          <div className="stat-card animate-fadeIn" style={{ background: 'linear-gradient(135deg, #4caf50, #66bb6a)', animationDelay: '0.1s' }}>
            <div className="stat-icon"><FiCheckCircle /></div>
            <div className="stat-value">{completedTasks.length}</div>
            <div className="stat-label">Completed Tasks</div>
          </div>
          <div className="stat-card animate-fadeIn" style={{ background: 'linear-gradient(135deg, #f44336, #e57373)', animationDelay: '0.2s' }}>
            <div className="stat-icon"><FiAlertTriangle /></div>
            <div className="stat-value">{overdueTasks.length}</div>
            <div className="stat-label">Overdue Tasks</div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="card">
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1a237e', marginBottom: 24 }}>Marketing Activity Timeline</h3>
          {tasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>No tasks assigned yet</div>
          ) : (
            <div className="timeline">
              {tasks.map((task, i) => {
                const isLeft = i % 2 === 0;
                return (
                  <div key={task.id} className={`timeline-item ${isLeft ? 'left' : 'right'} ${isLeft ? 'animate-slideLeft' : 'animate-slideRight'}`}
                    style={{ animationDelay: `${i * 0.1}s` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontWeight: 800, color: '#1a237e', fontSize: 15 }}>{task.title}</span>
                      <span className={`badge ${task.status === 'completed' ? 'badge-success' : task.status === 'overdue' ? 'badge-danger' : 'badge-warning'}`}>
                        {task.status}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Card {task.card_number} - {task.company}</div>
                    <div style={{
                      fontSize: 12, fontWeight: 600, color: '#1a237e',
                      background: '#e8eaf6', display: 'inline-block', padding: '4px 10px', borderRadius: 6
                    }}>
                      Due: {formatDate(task.due_date)}
                    </div>
                    {task.completed_at && (
                      <div style={{ fontSize: 11, color: '#4caf50', marginTop: 4 }}>
                        Completed: {formatDate(task.completed_at)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </>
    ) : (
      <div className="card" style={{ textAlign: 'center', padding: 60 }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>🌐</div>
        <h2 style={{ color: '#1a237e', marginBottom: 12 }}>Your Website Plan is Active</h2>
        <p style={{ color: '#666', maxWidth: 500, margin: '0 auto' }}>
          We are managing your website hosting and maintenance. You can view your renewal date and any important information above.
        </p>
      </div>
    )}
</div>
  );
};

export default ClientDashboard;
