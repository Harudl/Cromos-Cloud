// src/features/players/PlayerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function PlayerDashboard() {
  const [players, setPlayers] = useState([]);
  const [countries, setCountries] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null); // null para Crear, objeto para Editar

  const [formData, setFormData] = useState({
    id: '',
    nombre: '',
    posicion: 'Delantero',
    paisId: '',
    teamId: '',
    imageUrl: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      // Cargar jugadores, países y equipos
      const [playersData, countriesData, teamsData] = await Promise.all([
        api.getPlayers(),
        api.getCountries(),
        api.getTeams()
      ]);

      const playersList = Array.isArray(playersData) ? playersData : (playersData?.items || []);
      const countriesList = Array.isArray(countriesData) ? countriesData : (countriesData?.items || []);
      const teamsList = Array.isArray(teamsData) ? teamsData : (teamsData?.items || []);

      setPlayers(playersList);
      setCountries(countriesList);
      setTeams(teamsList);

      // Inicializar selectors
      setFormData(prev => ({
        ...prev,
        paisId: countriesList[0]?.id || '',
        teamId: teamsList[0]?.id || ''
      }));

    } catch (err) {
      setError('Error al obtener datos de jugadores / países / equipos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenCreate = () => {
    setEditingPlayer(null);
    setFormData({
      id: '',
      nombre: '',
      posicion: 'Delantero',
      paisId: countries[0]?.id || '',
      teamId: teams[0]?.id || '',
      imageUrl: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (player) => {
    setEditingPlayer(player);
    setFormData({
      id: player.id,
      nombre: player.nombre || player.name,
      posicion: player.posicion || player.position || 'Delantero',
      paisId: player.paisId || '',
      teamId: player.teamId || '',
      imageUrl: player.imageUrl || ''
    });
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        id: formData.id.trim().toLowerCase().replace(/\s+/g, '-'),
        nombre: formData.nombre,
        posicion: formData.posicion,
        paisId: formData.paisId,
        teamId: formData.teamId,
        imageUrl: formData.imageUrl
      };

      if (editingPlayer) {
        await api.updatePlayer(editingPlayer.id, payload);
        alert('🏃‍♂️ ¡Jugador actualizado con éxito!');
      } else {
        await api.createPlayer(payload);
        alert('🏃‍♂️ ¡Jugador registrado con éxito!');
      }

      setShowModal(false);
      loadData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Deseas eliminar este jugador? También afectará a sus cromos.')) {
      try {
        await api.deletePlayer(id);
        alert('Jugador eliminado.');
        loadData();
      } catch (err) {
        alert('No se pudo eliminar el jugador.');
      }
    }
  };

  return (
    <div>
      {/* CABECERA */}
      <div style={styles.headerRow}>
        <div>
          <h2>🏃‍♂️ Catálogo de Jugadores Mundialistas</h2>
          <p style={styles.subtitle}>Gestiona los deportistas que forman parte de las selecciones y escuadras.</p>
        </div>
        <button style={styles.btnSecondary} onClick={handleOpenCreate}>+ Registrar Jugador</button>
      </div>

      {loading && <p style={styles.loadingText}>Cargando lista de jugadores...</p>}
      {error && <div style={styles.errorText}>{error}</div>}

      {/* VISTA EN TABLA DE JUGADORES */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Nombre</th>
              <th style={styles.th}>Posición</th>
              <th style={styles.th}>País</th>
              <th style={styles.th}>Equipo (Club)</th>
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => {
              const countryObj = countries.find(c => c.id === p.paisId || c.id === (p.country?.id || p.country));
              const teamObj = teams.find(t => t.id === p.teamId || t.id === (p.team?.id || p.team));
              return (
                <tr key={p.id} style={styles.tr}>
                  <td style={styles.td}><code>{p.id}</code></td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.nombre || p.name} style={styles.avatarThumbnail} />
                      ) : (
                        <div style={styles.avatarEmpty}>👤</div>
                      )}
                      <strong>{p.nombre || p.name}</strong>
                    </div>
                  </td>
                  <td style={styles.td}><span style={styles.badgePos}>{p.posicion || p.position || 'N/A'}</span></td>
                  <td style={styles.td}>
                    {countryObj ? `${countryObj.flag || countryObj.banderaEmoji || ''} ${countryObj.nombre || countryObj.name}` : p.paisId || 'N/A'}
                  </td>
                  <td style={styles.td}>
                    {teamObj ? teamObj.nombre || teamObj.name : p.teamId || 'N/A'}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button style={styles.btnActionEdit} onClick={() => handleOpenEdit(p)}>✏️</button>
                      <button style={styles.btnActionDelete} onClick={() => handleDelete(p.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {players.length === 0 && !loading && (
              <tr>
                <td colSpan="6" style={styles.tdEmpty}>No hay jugadores registrados. ¡Crea el primero!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL FORMULARIO */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h3>{editingPlayer ? '✏️ Editar Jugador' : '🏃‍♂️ Registrar Nuevo Jugador'}</h3>
              <button style={styles.closeModalBtn} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>ID del Jugador (Identificador único):</label>
                <input 
                  type="text" 
                  placeholder="Ej: lionel-messi" 
                  required 
                  disabled={!!editingPlayer}
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  style={styles.input} 
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Nombre Completo:</label>
                <input 
                  type="text" 
                  placeholder="Ej: Lionel Messi" 
                  required 
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  style={styles.input} 
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Posición:</label>
                <select 
                  value={formData.posicion}
                  onChange={(e) => setFormData({ ...formData, posicion: e.target.value })}
                  style={styles.input}
                >
                  <option value="Portero">Portero</option>
                  <option value="Defensa">Defensa</option>
                  <option value="Centrocampista">Centrocampista</option>
                  <option value="Delantero">Delantero</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>País (Selección):</label>
                <select 
                  value={formData.paisId}
                  onChange={(e) => setFormData({ ...formData, paisId: e.target.value })}
                  style={styles.input}
                  required
                >
                  {countries.length > 0 ? (
                    countries.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.flag || c.banderaEmoji || ''} {c.nombre || c.name}
                      </option>
                    ))
                  ) : (
                    <option value="">Debe registrar países primero</option>
                  )}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Equipo (Club):</label>
                <select 
                  value={formData.teamId}
                  onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                  style={styles.input}
                  required
                >
                  {teams.length > 0 ? (
                    teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nombre || t.name}
                      </option>
                    ))
                  ) : (
                    <option value="">Debe registrar equipos primero</option>
                  )}
                </select>
              </div>

              {/* Subida de foto en base64 */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Foto del Jugador:</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                  style={styles.fileInput} 
                />
                {formData.imageUrl && (
                  <div style={styles.imagePreviewContainer}>
                    <img src={formData.imageUrl} alt="Vista Previa" style={styles.imagePreview} />
                    <button type="button" onClick={() => setFormData({ ...formData, imageUrl: '' })} style={styles.btnRemoveImage}>
                      Quitar Foto
                    </button>
                  </div>
                )}
              </div>

              <div style={styles.formActions}>
                <button type="button" style={styles.btnCancel} onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" style={styles.btnSubmit}>
                  {editingPlayer ? 'Actualizar' : 'Guardar en AWS Cloud'}
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
  tableWrapper: { background: '#111b2d', borderRadius: '12px', border: '1px solid #1e3250', overflow: 'hidden', marginBottom: '40px' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { padding: '15px 20px', background: '#090f1c', borderBottom: '2px solid #1e3250', color: '#b0bec5', fontSize: '0.9rem', fontWeight: 'bold' },
  tr: { borderBottom: '1px solid #1e3250', transition: 'background 0.2s' },
  td: { padding: '15px 20px', fontSize: '0.9rem', color: '#ffffff', verticalAlign: 'middle' },
  tdEmpty: { padding: '30px', textAlign: 'center', color: '#90a4ae' },
  badgePos: { background: '#1a2a46', color: '#ffb300', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' },
  avatarThumbnail: { width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #23395b' },
  avatarEmpty: { width: '36px', height: '36px', borderRadius: '50%', background: '#1a2a46', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', border: '1px solid #23395b' },
  actions: { display: 'flex', gap: '8px' },
  btnActionEdit: { background: '#1e3250', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' },
  btnActionDelete: { background: '#ff5252', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(5, 10, 20, 0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalCard: { background: '#111b2d', border: '1px solid #1e3250', borderRadius: '12px', width: '100%', maxWidth: '450px', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e3250', paddingBottom: '12px', marginBottom: '20px' },
  closeModalBtn: { background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '0.85rem', color: '#b0bec5' },
  input: { background: '#1a2a46', border: '1px solid #23395b', padding: '10px', borderRadius: '6px', color: '#fff', fontSize: '0.95rem', outline: 'none' },
  fileInput: { color: '#b0bec5', fontSize: '0.9rem' },
  imagePreviewContainer: { marginTop: '10px', display: 'flex', alignItems: 'center', gap: '15px' },
  imagePreview: { width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #ffb300' },
  btnRemoveImage: { background: '#ff5252', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' },
  formActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' },
  btnCancel: { background: '#37474f', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' },
  btnSubmit: { background: '#00e676', color: '#0d1626', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }
};
