import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { taskService } from '../../services/dataService';
import Swal from 'sweetalert2';
import { FiArrowLeft, FiCheckCircle, FiClock, FiAlertTriangle } from 'react-icons/fi';

const TaskView = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await taskService.getByOrder(orderId);
      setTasks(res.data.data.tasks || []);
      setOrder(res.data.data.order);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, [orderId]);

  const handleStatusChange = async (taskId, status) => {
    try {
      await taskService.updateStatus(taskId, status);
      Swal.fire({ icon: 'success', title: `Task marked as ${status}!`, timer: 1200, showConfirmButton: false });
      fetchTasks();
    } catch (e) { Swal.fire('Error', 'Failed to update task', 'error'); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <FiCheckCircle color="#4caf50" />;
      case 'overdue': return <FiAlertTriangle color="#f44336" />;
      default: return <FiClock color="#ff9800" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#e8f5e9';
      case 'overdue': return '#ffebee';
      default: return '#fff3e0';
    }
  };

  if (loading) return <div className="loading-overlay"><div className="spinner" /></div>;

  // Group tasks into rows of 4
  const rows = [];
  for (let i = 0; i < tasks.length; i += 4) {
    rows.push(tasks.slice(i, i + 4));
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/admin/clients')}><FiArrowLeft /></button>
          <div>
            <h1>Task View - {order?.order_id || ''}</h1>
            <div style={{ fontSize: 13, color: '#666', fontWeight: 400 }}>
              {order?.company} | {order?.email}
            </div>
          </div>
        </div>
      </div>

      {/* 24 Cards - 4 per row */}
      {order?.plan === 'website' ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🌐</div>
          <h2 style={{ color: '#1a237e', marginBottom: 12 }}>Website Maintenance Plan</h2>
          <p style={{ color: '#666', maxWidth: 500, margin: '0 auto 24px' }}>
            This client is on a Website-only plan. No periodic marketing tasks are generated.
            Hosting and maintenance status can be tracked here.
          </p>
          <div style={{ 
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: 20, maxWidth: 800, margin: '0 auto', textAlign: 'left' 
          }}>
            <div style={{ background: '#f8f9fa', padding: 20, borderRadius: 12, border: '1px solid #eee' }}>
              <div style={{ color: '#999', fontSize: 12, marginBottom: 4 }}>Current Status</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#4caf50' }}>ACTIVE</div>
            </div>
            <div style={{ background: '#f8f9fa', padding: 20, borderRadius: 12, border: '1px solid #eee' }}>
              <div style={{ color: '#999', fontSize: 12, marginBottom: 4 }}>Renewal Date</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#1a237e' }}>{formatDate(order?.upcoming_payment_date)}</div>
            </div>
            <div style={{ background: '#f8f9fa', padding: 20, borderRadius: 12, border: '1px solid #eee', gridColumn: 'span 2' }}>
              <div style={{ color: '#999', fontSize: 12, marginBottom: 4 }}>Important Information</div>
              <div style={{ fontSize: 14, color: '#444' }}>{order?.important_info || 'No additional information provided.'}</div>
            </div>
          </div>
        </div>
      ) : rows.map((row, rowIndex) => (
        <div key={rowIndex} style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: 16, marginBottom: 16
        }}>
          {row.map((task, i) => (
            <div key={task.id} className="card animate-fadeIn" style={{
              animationDelay: `${(rowIndex * 4 + i) * 0.05}s`,
              borderLeft: `4px solid ${task.status === 'completed' ? '#4caf50' : task.status === 'overdue' ? '#f44336' : '#ff9800'}`,
              background: getStatusColor(task.status)
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase' }}>
                  Card {task.card_number}
                </span>
                {getStatusIcon(task.status)}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1a237e', marginBottom: 8 }}>{task.title}</h3>
              <p style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>{task.description}</p>
              <div style={{
                background: 'rgba(26,35,126,0.08)', borderRadius: 8, padding: '8px 12px',
                fontSize: 12, fontWeight: 600, color: '#1a237e', marginBottom: 12
              }}>
                Due: {formatDate(task.due_date)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className={`badge ${task.status === 'completed' ? 'badge-success' : task.status === 'overdue' ? 'badge-danger' : 'badge-warning'}`}>
                  {task.status}
                </span>
                {task.status !== 'completed' && (
                  <button className="btn btn-success btn-sm" onClick={() => handleStatusChange(task.id, 'completed')}>
                    <FiCheckCircle /> Complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}

      {tasks.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>No tasks found for this order</div>
      )}
    </div>
  );
};

export default TaskView;
