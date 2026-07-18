// src/features/countries/CountryDashboard.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function CountryDashboard() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCountry, setEditingCountry] = useState(null);

  const [formData, setFormData] = useState({
    id: '',
    nombre: '',
    banderaEmoji: '',
    continente: 'Sudamérica'
  });

  useEffect(() => {
    loadCountries();
  }, []);

  async function loadCountries() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getCountries();
      const list = Array.isArray(data) ? data : (data?.items || []);
      setCountries(list);
    } catch (err) {
      setError('Error al obtener la lista de países del backend.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenCreate = () => {
    setEditingCountry(null);
    setFormData({
      id: '',
      nombre: '',
      banderaEmoji: '',
      continente: 'Sudamérica'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (country) => {
    setEditingCountry(country);
    setFormData({
      id: country.id,
      nombre: country.nombre || country.name,
      banderaEmoji: country.banderaEmoji || country.flag || '',
      continente: country.continente || 'Sudamérica'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        id: formData.id.trim().toLowerCase().replace(/\s+/g, '-'),
        nombre: formData.nombre,
        banderaEmoji: formData.banderaEmoji,
        continente: formData.continente
      };

      if (editingCountry) {
        await api.updateCountry(editingCountry.id, payload);
        alert('🌍 ¡País actualizado con éxito!');
      } else {
        await api.createCountry(payload);
        alert('🌍 ¡País registrado con éxito!');
      }

      setShowModal(false);
      loadCountries();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Deseas eliminar este país?')) {
      try {
        await api.deleteCountry(id);
        alert('País eliminado.');
        loadCountries();
      } catch (err) {
        alert('No se pudo eliminar el país.');
      }
    }
  };

  return (
    <div>
      {/* CABECERA */}
      <div style={styles.headerRow}>
        <div>
          <h2>🌍 Catálogo de Países Mundialistas</h2>
          <p style={styles.subtitle}>Configura las naciones que participan en la base de datos cloud.</p>
        </div>
        <button style={styles.btnSecondary} onClick={handleOpenCreate}>+ Registrar País</button>
      </div>

      {loading && <p style={styles.loadingText}>Cargando lista de países...</p>}
      {error && <div style={styles.errorText}>{error}</div>}

      {/* REJILLA DE PAÍSES */}
      <div style={styles.countriesGrid}>
        {countries.map((c) => (
          <div key={c.id} style={styles.countryCard}>
            <div style={styles.flagSymbol}>{c.flag || c.banderaEmoji || '🏳️'}</div>
            <h3 style={styles.countryName}>{c.nombre || c.name}</h3>
            <span style={styles.continentBadge}>{c.continente || 'Global'}</span>
            
            <div style={styles.cardActions}>
              <button style={styles.actionBtnEdit} onClick={() => handleOpenEdit(c)}>✏️ Editar</button>
              <button style={styles.actionBtnDelete} onClick={() => handleDelete(c.id)}>🗑️ Borrar</button>
            </div>
          </div>
        ))}
        {countries.length === 0 && !loading && (
          <div style={styles.emptyState}>No hay países registrados. ¡Registra uno nuevo!</div>
        )}
      </div>

      {/* FORMULARIO MODAL */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h3>{editingCountry ? '✏️ Editar País' : '🌍 Registrar Nuevo País'}</h3>
              <button style={styles.closeModalBtn} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>ID del País (Slug único):</label>
                <input 
                  type="text" 
                  placeholder="Ej: argentina o ecuador" 
                  required 
                  disabled={!!editingCountry}
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  style={styles.input} 
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Nombre del País:</label>
                <input 
                  type="text" 
                  placeholder="Ej: Argentina" 
                  required 
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  style={styles.input} 
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Emoji de Bandera (Windows: Win + .):</label>
                <input 
                  type="text" 
                  placeholder="Ej: 🇦🇷 o 🇪🇨" 
                  required 
                  maxLength="10"
                  value={formData.banderaEmoji}
                  onChange={(e) => setFormData({ ...formData, banderaEmoji: e.target.value })}
                  style={styles.input} 
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Continente:</label>
                <select 
                  value={formData.continente}
                  onChange={(e) => setFormData({ ...formData, continente: e.target.value })}
                  style={styles.input}
                >
                  <option value="Sudamérica">Sudamérica</option>
                  <option value="Europa">Europa</option>
                  <option value="Asia">Asia</option>
                  <option value="África">África</option>
                  <option value="Norteamérica">Norteamérica</option>
                  <option value="Oceanía">Oceanía</option>
                </select>
              </div>

              <div style={styles.formActions}>
                <button type="button" style={styles.btnCancel} onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" style={styles.btnSubmit}>
                  {editingCountry ? 'Actualizar' : 'Guardar en AWS Cloud'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  subtitle: { color: '#90a4ae', fontSize: '0.9rem', margin: '5px 0 0 0' },
  btnSecondary: { background: '#00e676', color: '#0d1626', border: 'none', padding: '12px 24px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' },
  loadingText: { color: '#90a4ae', textAlign: 'center' },
  errorText: { color: '#ff5252', textAlign: 'center', padding: '10px', border: '1px dashed #ff5252', borderRadius: '6px', margin: '20px 0' },
  countriesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '25px', marginBottom: '40px' },
  countryCard: { background: '#111b2d', border: '1px solid #1e3250', borderRadius: '12px', padding: '25px 20px', textAlign: 'center', position: 'relative' },
  flagSymbol: { fontSize: '3rem', marginBottom: '10px' },
  countryName: { fontSize: '1.2rem', margin: '10px 0 5px 0', fontWeight: 'bold', color: '#fff' },
  continentBadge: { display: 'inline-block', background: '#1a2a46', color: '#ffb300', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '15px' },
  cardActions: { display: 'flex', gap: '10px', justifyContent: 'center' },
  actionBtnEdit: { background: '#1a2a46', color: '#fff', border: '1px solid #23395b', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' },
  actionBtnDelete: { background: '#ff5252', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(5, 10, 20, 0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalCard: { background: '#111b2d', border: '1px solid #1e3250', borderRadius: '12px', width: '100%', maxWidth: '450px', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e3250', paddingBottom: '12px', marginBottom: '20px' },
  closeModalBtn: { background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '0.85rem', color: '#b0bec5' },
  input: { background: '#1a2a46', border: '1px solid #23395b', padding: '10px', borderRadius: '6px', color: '#fff', fontSize: '0.95rem', outline: 'none' },
  formActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' },
  btnCancel: { background: '#37474f', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' },
  btnSubmit: { background: '#00e676', color: '#0d1626', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' },
  emptyState: { gridColumn: '1 / -1', color: '#90a4ae', textAlign: 'center', padding: '40px', background: '#090f1c', border: '1px dashed #1e3250', borderRadius: '12px' }
};
