import React, { useState, useEffect } from 'react';
import { taskService } from '../services/dataService';
import { FiX, FiClock, FiAlertTriangle, FiCalendar, FiCheckCircle } from 'react-icons/fi';

const TaskPopup = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [data, setData] = useState({ todayTasks: [], twoDayTasks: [], upcomingTasks: [], completedTasks: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await taskService.getPopup();
        setData(res.data.data);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchTasks();
  }, []);

  const tabs = [
    { label: "Today's Tasks", icon: <FiClock />, data: data.todayTasks, color: '#f44336' },
    { label: '2 Days Left', icon: <FiAlertTriangle />, data: data.twoDayTasks, color: '#ff9800' },
    { label: 'Upcoming (4 days)', icon: <FiCalendar />, data: data.upcomingTasks, color: '#2196f3' },
    { label: 'Completed (7 days)', icon: <FiCheckCircle />, data: data.completedTasks, color: '#4caf50' },
  ];

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN') : '-';

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-scaleIn" style={{ maxWidth: 750 }}>
        <div className="modal-header">
          <h2>Task Overview</h2>
          <button className="modal-close" onClick={onClose}><FiX /></button>
        </div>
        <div className="modal-body">
          <div className="tabs">
            {tabs.map((tab, i) => (
              <button key={i} className={`tab-btn ${activeTab === i ? 'active' : ''}`} onClick={() => setActiveTab(i)}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {tab.icon} {tab.label}
                <span style={{
                  background: activeTab === i ? 'rgba(255,255,255,0.3)' : tab.color,
                  color: 'white', borderRadius: 10, padding: '2px 8px', fontSize: 11, fontWeight: 700, marginLeft: 4
                }}>{tab.data.length}</span>
              </button>
            ))}
          </div>
          {loading ? (
            <div className="loading-overlay"><div className="spinner" /></div>
          ) : (
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {tabs[activeTab].data.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>
                    {activeTab === 3 ? <FiCheckCircle /> : <FiCalendar />}
                  </div>
                  No tasks found
                </div>
              ) : (
                <table className="data-table" style={{ fontSize: 13 }}>
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Company</th>
                      <th>Task</th>
                      <th>Due Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tabs[activeTab].data.map((task, i) => (
                      <tr key={i} className="animate-fadeIn" style={{ animationDelay: `${i * 0.05}s` }}>
                        <td><span className="badge badge-primary">{task.order_code}</span></td>
                        <td>{task.company}</td>
                        <td style={{ fontWeight: 600 }}>{task.title} <span style={{ color: '#999', fontSize: 11 }}>Card {task.card_number}</span></td>
                        <td>{formatDate(task.due_date)}</td>
                        <td>
                          <span className={`badge ${task.status === 'completed' ? 'badge-success' : task.status === 'overdue' ? 'badge-danger' : 'badge-warning'}`}>
                            {task.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskPopup;
