// src/features/stickers/StickerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function StickerDashboard() {
  const [stickers, setStickers] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSticker, setEditingSticker] = useState(null); // null para Crear, objeto cromo para Editar

  const [formData, setFormData] = useState({
    number: '',
    playerId: '',
    edition: 'Qatar 2022 Official',
    rarity: 'estandar',
    marketValue: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar cromos y jugadores
      const [stickersData, playersData] = await Promise.all([
        api.getStickers(),
        api.getPlayers()
      ]);

      const stickersList = Array.isArray(stickersData) ? stickersData : (stickersData?.items || []);
      const playersList = Array.isArray(playersData) ? playersData : (playersData?.items || []);

      setStickers(stickersList);
      setPlayers(playersList);

      if (playersList.length > 0) {
        setFormData(prev => ({
          ...prev,
          playerId: playersList[0].id || playersList[0].playerId
        }));
      }
    } catch (err) {
      setError('Error al conectar con la API de AWS Lambda / DB.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenCreate = () => {
    setEditingSticker(null);
    setFormData({
      number: '',
      playerId: players[0]?.id || players[0]?.playerId || '',
      edition: 'Qatar 2022 Official',
      rarity: 'estandar',
      marketValue: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (sticker) => {
    setEditingSticker(sticker);
    setFormData({
      number: sticker.number,
      playerId: sticker.playerId,
      edition: sticker.edition,
      rarity: sticker.rarity || 'estandar',
      marketValue: sticker.marketValue
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        number: formData.number,
        playerId: formData.playerId,
        edition: formData.edition,
        rarity: formData.rarity,
        marketValue: Number(formData.marketValue || 0)
      };

      if (editingSticker) {
        await api.updateSticker(editingSticker.id, payload);
        alert('⚽ ¡Cromo actualizado con éxito!');
      } else {
        await api.createSticker(payload);
        alert('⚽ ¡Cromo registrado con éxito!');
      }

      setShowModal(false);
      loadData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Deseas eliminar este cromo del catálogo?')) {
      try {
        await api.deleteSticker(id);
        alert('Cromo eliminado.');
        loadData();
      } catch (err) {
        alert('No se pudo eliminar el cromo.');
      }
    }
  };

  return (
    <div>
      {/* SECCIÓN HERO / PANEL DE CONTROL */}
      <div style={styles.heroSection}>
        <div style={styles.heroTextSide}>
          <span style={styles.heroTag}>ÁLBUM VIRTUAL</span>
          <h1 style={styles.heroTitle}>COLECCIÓN DE CROMOS</h1>
          <p style={styles.heroSubtitle}>Visualiza, agrega, edita o elimina los cromos mundiales almacenados en tu base de datos cloud.</p>
          <div style={styles.heroButtons}>
            <button style={styles.btnSecondary} onClick={handleOpenCreate}>+ Registrar Cromo</button>
          </div>
        </div>
        
        <div style={styles.statsCard}>
          <h4 style={styles.statsHeader}>📊 Estado del Álbum</h4>
          <div style={styles.bigStatNumber}>{stickers.length}</div>
          <p style={styles.statLabel}>Cromos Registrados</p>
          <div style={styles.progressBarContainer}>
            <div style={{ ...styles.progressBar, width: `${Math.min((stickers.length / 20) * 100, 100)}%` }}></div>
          </div>
          <div style={styles.miniStatsRows}>
            <div>Jugadores vinculados: <span style={{ color: '#ffb300' }}>{players.length}</span></div>
          </div>
        </div>
      </div>

      {/* MENSAJES Y LOADING */}
      {loading && <p style={styles.loadingText}>Conectando con microservicios en la nube...</p>}
      {error && <div style={styles.errorText}>{error}</div>}

      {/* REJILLA DE CROMOS */}
      <h3 style={styles.sectionHeading}>🎴 Catálogo de Cromos Obtenidos</h3>
      <div style={styles.chromosGrid}>
        {stickers.map((st) => (
          <div key={st.id} style={st.rarity === 'special' ? styles.stickerCardGold : styles.stickerCard}>
            <div style={styles.stickerHeader}>
              <span style={styles.stickerNumber}>N° {st.number}</span>
              <span style={styles.stickerFlag}>{st.rarity === 'special' ? '⭐ SPECIAL' : '⚫ ESTÁNDAR'}</span>
            </div>
            <div style={styles.avatarPlaceholder}>
              {st.player?.imageUrl ? (
                <img src={st.player.imageUrl} alt={st.player?.nombre || st.player?.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                '🏃‍♂️'
              )}
            </div>
            <h4 style={styles.stickerName}>{st.player?.nombre || st.player?.name || st.playerId}</h4>
            <p style={styles.stickerMeta}><strong>Posición:</strong> {st.player?.posicion || st.player?.position || 'N/A'}</p>
            <p style={styles.stickerMeta}><strong>Edición:</strong> {st.edition}</p>
            <div style={styles.priceTag}>Val: ${st.marketValue}</div>
            
            <div style={styles.cardActions}>
              <button style={styles.actionBtnEdit} onClick={() => handleOpenEdit(st)}>✏️ Editar</button>
              <button style={styles.actionBtnDelete} onClick={() => handleDelete(st.id)}>🗑️ Borrar</button>
            </div>
          </div>
        ))}
        {stickers.length === 0 && !loading && (
          <div style={styles.emptyState}>No hay cromos registrados en el catálogo. ¡Registra uno nuevo!</div>
        )}
      </div>

      {/* FORMULARIO MODAL INTERACTIVO */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h3>{editingSticker ? '✏️ Editar Cromo Mundialista' : '⚽ Registrar Nuevo Cromo'}</h3>
              <button style={styles.closeModalBtn} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Número de Cromo:</label>
                <input 
                  type="text" 
                  placeholder="Ej: 099" 
                  required 
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  style={styles.input} 
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Seleccionar Jugador:</label>
                <select 
                  value={formData.playerId}
                  onChange={(e) => setFormData({ ...formData, playerId: e.target.value })}
                  style={styles.input}
                  required
                >
                  {players.length > 0 ? (
                    players.map((player) => (
                      <option key={player.id || player.playerId} value={player.id || player.playerId}>
                        {player.nombre || player.name} ({player.paisId || player.countryId || 'N/A'})
                      </option>
                    ))
                  ) : (
                    <option value="">Crea jugadores primero en la pestaña "Jugadores"</option>
                  )}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Edición del Álbum:</label>
                <input 
                  type="text" 
                  required 
                  value={formData.edition}
                  onChange={(e) => setFormData({ ...formData, edition: e.target.value })}
                  style={styles.input} 
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Rareza / Tipo:</label>
                <select 
                  value={formData.rarity}
                  onChange={(e) => setFormData({ ...formData, rarity: e.target.value })}
                  style={styles.input}
                >
                  <option value="estandar">Estándar (Básico)</option>
                  <option value="special">Especial (Dorado / Shiny)</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Valor de Mercado ($ USD):</label>
                <input 
                  type="number" 
                  placeholder="Ej: 50" 
                  value={formData.marketValue}
                  onChange={(e) => setFormData({ ...formData, marketValue: e.target.value })}
                  style={styles.input} 
                  required
                />
              </div>

              <div style={styles.formActions}>
                <button type="button" style={styles.btnCancel} onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" style={styles.btnSubmit}>
                  {editingSticker ? 'Actualizar' : 'Guardar en AWS Cloud'}
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
  heroSection: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', background: 'radial-gradient(circle, #152238 0%, #0b111e 100%)', padding: '35px', borderRadius: '12px', border: '1px solid #1e3250', marginBottom: '40px', alignItems: 'center' },
  heroTextSide: { display: 'flex', flexDirection: 'column', gap: '12px' },
  heroTag: { color: '#ffb300', fontWeight: 'bold', fontSize: '0.85rem', letterSpacing: '2px' },
  heroTitle: { fontSize: '2.2rem', fontWeight: '900', lineHeight: '1.2', margin: 0 },
  heroSubtitle: { color: '#b0bec5', fontSize: '1rem', lineHeight: '1.5', margin: 0 },
  heroButtons: { display: 'flex', gap: '15px', marginTop: '10px' },
  btnSecondary: { background: '#00e676', color: '#0d1626', border: 'none', padding: '12px 24px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' },
  statsCard: { background: '#090f1c', padding: '25px', borderRadius: '10px', border: '1px solid #1a2a46', textAlign: 'center' },
  statsHeader: { margin: '0 0 10px 0', color: '#90a4ae' },
  bigStatNumber: { fontSize: '3.5rem', fontWeight: 'bold', color: '#ffffff' },
  statLabel: { color: '#90a4ae', marginTop: '-5px', fontSize: '0.85rem' },
  progressBarContainer: { background: '#1e3250', height: '8px', borderRadius: '4px', margin: '15px 0', overflow: 'hidden' },
  progressBar: { background: 'linear-gradient(90deg, #ffb300, #00e676)', height: '100%' },
  miniStatsRows: { display: 'flex', justifyContent: 'space-around', fontSize: '0.85rem', color: '#b0bec5', marginTop: '10px' },
  sectionHeading: { fontSize: '1.4rem', marginBottom: '20px', borderLeft: '4px solid #ffb300', paddingLeft: '10px' },
  chromosGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '25px', marginBottom: '40px' },
  stickerCard: { background: '#111b2d', border: '2px solid #23395b', borderRadius: '12px', padding: '20px', textAlign: 'center', position: 'relative' },
  stickerCardGold: { background: 'linear-gradient(135deg, #2c1f03 0%, #111b2d 100%)', border: '2px solid #ffb300', borderRadius: '12px', padding: '20px', textAlign: 'center', position: 'relative', boxShadow: '0 4px 15px rgba(255,179,0,0.2)' },
  stickerHeader: { display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#b0bec5', marginBottom: '15px' },
  stickerNumber: { background: '#1a2a46', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold', color: '#fff' },
  stickerFlag: { color: '#ffb300', fontWeight: 'bold' },
  avatarPlaceholder: { fontSize: '3rem', background: '#1a2a46', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' },
  stickerName: { fontSize: '1.1rem', margin: '0 0 5px 0', fontWeight: 'bold' },
  stickerMeta: { color: '#90a4ae', fontSize: '0.8rem', margin: '3px 0' },
  priceTag: { color: '#00e676', fontWeight: 'bold', fontSize: '1.1rem', margin: '12px 0 5px 0' },
  cardActions: { marginTop: '15px', display: 'flex', gap: '10px', justifyContent: 'center' },
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
  loadingText: { color: '#90a4ae', textAlign: 'center' },
  errorText: { color: '#ff5252', textAlign: 'center', padding: '10px', border: '1px dashed #ff5252', borderRadius: '6px', margin: '20px 0' },
  emptyState: { gridColumn: '1 / -1', color: '#90a4ae', textAlign: 'center', padding: '40px', background: '#090f1c', border: '1px dashed #1e3250', borderRadius: '12px' }
};
