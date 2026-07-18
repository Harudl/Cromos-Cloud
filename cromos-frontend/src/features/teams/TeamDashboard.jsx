// src/features/teams/TeamDashboard.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function TeamDashboard() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);

  const [formData, setFormData] = useState({
    id: '',
    nombre: '',
    codigoCorto: '',
    grupo: 'Grupo A'
  });

  useEffect(() => {
    loadTeams();
  }, []);

  async function loadTeams() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getTeams();
      const list = Array.isArray(data) ? data : (data?.items || []);
      setTeams(list);
    } catch (err) {
      setError('Error al obtener la lista de equipos del backend.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenCreate = () => {
    setEditingTeam(null);
    setFormData({
      id: '',
      nombre: '',
      codigoCorto: '',
      grupo: 'Grupo A'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (team) => {
    setEditingTeam(team);
    setFormData({
      id: team.id,
      nombre: team.nombre || team.name,
      codigoCorto: team.codigoCorto || '',
      grupo: team.grupo || 'Grupo A'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        id: formData.id.trim().toLowerCase().replace(/\s+/g, '-'),
        nombre: formData.nombre,
        codigoCorto: formData.codigoCorto.trim().toUpperCase(),
        grupo: formData.grupo
      };

      if (editingTeam) {
        await api.updateTeam(editingTeam.id, payload);
        alert('🛡️ ¡Equipo actualizado con éxito!');
      } else {
        await api.createTeam(payload);
        alert('🛡️ ¡Equipo registrado con éxito!');
      }

      setShowModal(false);
      loadTeams();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Deseas eliminar este equipo?')) {
      try {
        await api.deleteTeam(id);
        alert('Equipo eliminado.');
        loadTeams();
      } catch (err) {
        alert('No se pudo eliminar el equipo.');
      }
    }
  };

  return (
    <div>
      {/* CABECERA */}
      <div style={styles.headerRow}>
        <div>
          <h2>🛡️ Gestión de Equipos y Selecciones</h2>
          <p style={styles.subtitle}>Configura los clubes o selecciones que compiten en el campeonato.</p>
        </div>
        <button style={styles.btnSecondary} onClick={handleOpenCreate}>+ Registrar Equipo</button>
      </div>

      {loading && <p style={styles.loadingText}>Cargando lista de equipos...</p>}
      {error && <div style={styles.errorText}>{error}</div>}

      {/* GRILLA DE EQUIPOS */}
      <div style={styles.teamsGrid}>
        {teams.map((t) => (
          <div key={t.id} style={styles.teamCard}>
            <div style={styles.badgeCode}>{t.codigoCorto || 'N/A'}</div>
            <div style={styles.stadiumPlaceholder}>🏟️</div>
            <h3 style={styles.teamName}>{t.nombre || t.name}</h3>
            <span style={styles.groupBadge}>{t.grupo || 'Sin Grupo'}</span>
            
            <div style={styles.cardActions}>
              <button style={styles.actionBtnEdit} onClick={() => handleOpenEdit(t)}>✏️ Editar</button>
              <button style={styles.actionBtnDelete} onClick={() => handleDelete(t.id)}>🗑️ Borrar</button>
            </div>
          </div>
        ))}
        {teams.length === 0 && !loading && (
          <div style={styles.emptyState}>No hay equipos registrados. ¡Crea uno nuevo!</div>
        )}
      </div>

      {/* FORMULARIO MODAL */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h3>{editingTeam ? '✏️ Editar Equipo' : '🛡️ Registrar Nuevo Equipo'}</h3>
              <button style={styles.closeModalBtn} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>ID del Equipo (Slug único):</label>
                <input 
                  type="text" 
                  placeholder="Ej: argentina o real-madrid" 
                  required 
                  disabled={!!editingTeam}
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  style={styles.input} 
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Nombre del Equipo:</label>
                <input 
                  type="text" 
                  placeholder="Ej: Argentina o Real Madrid" 
                  required 
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  style={styles.input} 
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Código Corto (3 Letras):</label>
                <input 
                  type="text" 
                  placeholder="Ej: ARG, BRA, MAD" 
                  required 
                  maxLength="5"
                  value={formData.codigoCorto}
                  onChange={(e) => setFormData({ ...formData, codigoCorto: e.target.value })}
                  style={styles.input} 
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Grupo / Categoría:</label>
                <select 
                  value={formData.grupo}
                  onChange={(e) => setFormData({ ...formData, grupo: e.target.value })}
                  style={styles.input}
                >
                  <option value="Grupo A">Grupo A</option>
                  <option value="Grupo B">Grupo B</option>
                  <option value="Grupo C">Grupo C</option>
                  <option value="Grupo D">Grupo D</option>
                  <option value="Grupo E">Grupo E</option>
                  <option value="Grupo F">Grupo F</option>
                  <option value="Grupo G">Grupo G</option>
                  <option value="Grupo H">Grupo H</option>
                  <option value="Clubes">Clubes y Ligas</option>
                </select>
              </div>

              <div style={styles.formActions}>
                <button type="button" style={styles.btnCancel} onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" style={styles.btnSubmit}>
                  {editingTeam ? 'Actualizar' : 'Guardar en AWS Cloud'}
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
  teamsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '25px', marginBottom: '40px' },
  teamCard: { background: '#111b2d', border: '1px solid #1e3250', borderRadius: '12px', padding: '25px 20px', textAlign: 'center', position: 'relative' },
  badgeCode: { position: 'absolute', top: '15px', right: '15px', background: '#1a2a46', color: '#00e676', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' },
  stadiumPlaceholder: { fontSize: '2.5rem', marginBottom: '10px' },
  teamName: { fontSize: '1.2rem', margin: '10px 0 5px 0', fontWeight: 'bold', color: '#fff' },
  groupBadge: { display: 'inline-block', background: '#1a2a46', color: '#ffb300', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '15px' },
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
