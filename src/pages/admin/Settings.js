import React, { useState, useEffect } from 'react';
import { settingsService } from '../../services/dataService';
import { FiSave, FiPlus, FiTrash2, FiImage, FiLayout } from 'react-icons/fi';
import Swal from 'sweetalert2';

const Settings = () => {
  const [colors, setColors] = useState(['#1a237e', '#3949ab']);
  const [logoUrl, setLogoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await settingsService.get();
        if (res.data.success) {
          const data = res.data.data;
          if (data.theme_colors) setColors(JSON.parse(data.theme_colors));
          if (data.logo_url) setLogoUrl(data.logo_url);
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleAddColor = () => {
    if (colors.length < 3) setColors([...colors, '#000000']);
  };

  const handleRemoveColor = (index) => {
    if (colors.length > 2) {
      const newColors = colors.filter((_, i) => i !== index);
      setColors(newColors);
    } else {
      Swal.fire('Info', 'Minimum 2 colors required for gradient', 'info');
    }
  };

  const handleColorChange = (index, value) => {
    const newColors = [...colors];
    newColors[index] = value;
    setColors(newColors);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsService.update({ theme_colors: colors, logo_url: logoUrl });
      Swal.fire({ icon: 'success', title: 'Settings saved!', text: 'Reloading to apply changes...', timer: 2000 });
      setTimeout(() => window.location.reload(), 2000);
    } catch (e) {
      Swal.fire('Error', 'Failed to save settings', 'error');
    }
    setSaving(false);
  };

  if (loading) return <div className="loading-overlay"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <h1>System Settings</h1>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 24 }}>
        {/* Theme Customization */}
        <div className="card animate-fadeIn">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <FiLayout />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1a237e' }}>Theme Customization</h3>
          </div>

          <div className="form-group">
            <label>Gradient Theme Colors</label>
            <p style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>Pick 2-3 colors for your system's primary gradient.</p>
            
            {colors.map((color, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <input 
                  type="color" 
                  value={color} 
                  onChange={(e) => handleColorChange(index, e.target.value)}
                  style={{ width: 60, height: 40, padding: 2, border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer' }}
                />
                <input 
                  type="text" 
                  value={color} 
                  onChange={(e) => handleColorChange(index, e.target.value)}
                  className="form-control"
                  style={{ flex: 1 }}
                />
                <button 
                  className="btn btn-icon btn-danger" 
                  style={{ background: '#ffebee', color: '#c62828' }}
                  onClick={() => handleRemoveColor(index)}
                  disabled={colors.length <= 2}
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            ))}

            {colors.length < 3 && (
              <button className="btn btn-outline btn-sm" onClick={handleAddColor} style={{ width: '100%', marginTop: 8 }}>
                <FiPlus /> Add Third Color
              </button>
            )}
          </div>

          <div style={{ marginTop: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 12 }}>Preview Gradient</label>
            <div style={{ 
              height: 100, borderRadius: 12, 
              background: `linear-gradient(135deg, ${colors.join(', ')})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 18,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              SYSTEM THEME PREVIEW
            </div>
          </div>
        </div>

        {/* Logo Customization */}
        <div className="card animate-fadeIn" style={{ animationDelay: '0.1s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--gradient-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <FiImage />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1a237e' }}>Logo Settings</h3>
          </div>

          <div className="form-group">
            <label>Logo URL</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="https://example.com/logo.png"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
            />
            <p style={{ fontSize: 11, color: '#999', marginTop: 6 }}>Provide a direct link to your company logo (PNG/SVG recommended).</p>
          </div>

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 12, textAlign: 'left' }}>Logo Preview</label>
            <div style={{ 
              height: 120, border: '2px dashed #ddd', borderRadius: 12, 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#f8f9fa'
            }}>
              {logoUrl ? (
                <img src={logoUrl} alt="System Logo" style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain' }} />
              ) : (
                <div style={{ textAlign: 'center', color: '#999' }}>
                  <FiImage size={32} style={{ marginBottom: 8, opacity: 0.5 }} /><br />
                  No logo URL provided
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
