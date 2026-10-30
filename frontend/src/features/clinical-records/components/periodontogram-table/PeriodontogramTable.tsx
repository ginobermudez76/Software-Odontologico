import React from 'react';
import { MaterialIcon } from '../../../../components/icons/MaterialIcon';
import styles from './PeriodontogramTable.module.css';
import { PeriodontogramTableProps } from './PeriodontogramTable.types';
import { usePeriodontogramTable } from './usePeriodontogramTable';

export const PeriodontogramTable: React.FC<PeriodontogramTableProps> = ({
  patientId,
  patientName,
  canWrite = true,
  onSaved,
}) => {
  const {
    teeth,
    activeArch,
    setActiveArch,
    activeAspect,
    setActiveAspect,
    activeTeethList,
    notes,
    setNotes,
    isLoading,
    isSaving,
    feedback,
    summary,
    updateSiteValue,
    toggleToothMissing,
    toggleToothImplant,
    setToothMobility,
    setToothFurcation,
    savePeriodontogram,
  } = usePeriodontogramTable(patientId, onSaved);

  const aspectKey = activeAspect === 'VESTIBULAR' ? 'vestibular' : 'lingual';

  return (
    <div className={styles.container}>
      {/* KPI Summary Banner */}
      <section className={styles.kpiGrid} aria-label="Resumen de Índices Periodontales">
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.kpiIconBlue}`}>
            <MaterialIcon name="water_drop" size={24} />
          </div>
          <div className={styles.kpiContent}>
            <span className={styles.kpiTitle}>Índice O'Leary (Placa)</span>
            <span className={styles.kpiValue}>{summary.olearyPlaqueIndex}%</span>
            <span className={styles.kpiSub}>Meta clínica: &le; 20%</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.kpiIconRed}`}>
            <MaterialIcon name="emergency" size={24} />
          </div>
          <div className={styles.kpiContent}>
            <span className={styles.kpiTitle}>Sangrado al Sondaje (BOP)</span>
            <span className={styles.kpiValue}>{summary.bleedingOnProbingIndex}%</span>
            <span className={styles.kpiSub}>Salud gingival: &lt; 10%</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.kpiIconOrange}`}>
            <MaterialIcon name="warning" size={24} />
          </div>
          <div className={styles.kpiContent}>
            <span className={styles.kpiTitle}>Bolsas Periodontales</span>
            <span className={styles.kpiValue}>{summary.periodontalPocketsCount}</span>
            <span className={styles.kpiSub}>Profundas (&ge;6mm): {summary.deepPocketsCount}</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.kpiIconGreen}`}>
            <MaterialIcon name="dentistry" size={24} />
          </div>
          <div className={styles.kpiContent}>
            <span className={styles.kpiTitle}>Dientes Evaluados</span>
            <span className={styles.kpiValue}>{summary.evaluatedTeethCount}</span>
            <span className={styles.kpiSub}>{patientName ? `Paciente: ${patientName}` : 'Examen Periodontal'}</span>
          </div>
        </div>
      </section>

      {/* Main Periodontal Chart Matrix */}
      <div className={styles.card}>
        <header className={styles.headerBar}>
          <div className={styles.tabGroup} role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeArch === 'MAXILLARY'}
              className={`${styles.tabButton} ${activeArch === 'MAXILLARY' ? styles.tabButtonActive : ''}`}
              onClick={() => setActiveArch('MAXILLARY')}
            >
              <MaterialIcon name="expand_less" size={18} />
              Maxilar Superior (Q1 - Q2)
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeArch === 'MANDIBULAR'}
              className={`${styles.tabButton} ${activeArch === 'MANDIBULAR' ? styles.tabButtonActive : ''}`}
              onClick={() => setActiveArch('MANDIBULAR')}
            >
              <MaterialIcon name="expand_more" size={18} />
              Mandíbula Inferior (Q4 - Q3)
            </button>
          </div>

          <div className={styles.aspectToggleGroup}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b' }}>Superficie:</span>
            <button
              type="button"
              className={`${styles.aspectButton} ${activeAspect === 'VESTIBULAR' ? styles.aspectButtonActive : ''}`}
              onClick={() => setActiveAspect('VESTIBULAR')}
            >
              Vestibular
            </button>
            <button
              type="button"
              className={`${styles.aspectButton} ${activeAspect === 'LINGUAL' ? styles.aspectButtonActive : ''}`}
              onClick={() => setActiveAspect('LINGUAL')}
            >
              {activeArch === 'MAXILLARY' ? 'Palatino' : 'Lingual'}
            </button>
          </div>
        </header>

        {feedback && (
          <div
            className={`${styles.feedbackAlert} ${feedback.type === 'success' ? styles.feedbackSuccess : styles.feedbackError}`}
            role="alert"
          >
            <MaterialIcon name={feedback.type === 'success' ? 'check_circle' : 'error'} size={20} />
            {feedback.message}
          </div>
        )}

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Diente</th>
                <th>Mov.</th>
                <th>Furca</th>
                <th>Placa (D/M/M)</th>
                <th>Sangrado (BOP)</th>
                <th>Margen Gingival (MG)</th>
                <th>Prof. Sondaje (PS)</th>
                <th>NIC (PS + MG)</th>
              </tr>
            </thead>
            <tbody>
              {activeTeethList.map((toothNumber) => {
                const key = toothNumber.toString();
                const tooth = teeth[key];
                if (!tooth) return null;

                const aspect = tooth[aspectKey];
                const isMissing = tooth.isMissing;

                const getNicClass = (nic: number = 0, ps: number = 0) => {
                  if (ps >= 6 || nic >= 6) return styles.nicDeepPocket;
                  if (ps >= 4 || nic >= 4) return styles.nicPocket;
                  return styles.nicNormal;
                };

                return (
                  <tr key={toothNumber} style={isMissing ? { opacity: 0.5 } : {}}>
                    {/* Número de diente y estado */}
                    <td className={`${styles.toothNumberCell} ${isMissing ? styles.toothNumberMissing : ''}`}>
                      <div>{toothNumber}</div>
                      <div className={styles.toothStatusActions}>
                        <button
                          type="button"
                          className={`${styles.smallPill} ${isMissing ? styles.smallPillActive : ''}`}
                          onClick={() => toggleToothMissing(toothNumber)}
                          title="Marcar como Ausente"
                        >
                          Aus
                        </button>
                        <button
                          type="button"
                          className={`${styles.smallPill} ${tooth.isImplant ? styles.smallPillActiveImplant : ''}`}
                          onClick={() => toggleToothImplant(toothNumber)}
                          title="Marcar como Implante"
                        >
                          Imp
                        </button>
                      </div>
                    </td>

                    {/* Movilidad */}
                    <td>
                      <select
                        aria-label={`Movilidad diente ${toothNumber}`}
                        disabled={isMissing}
                        className={styles.selectInput}
                        value={tooth.mobility || 0}
                        onChange={(e) => setToothMobility(toothNumber, Number(e.target.value))}
                      >
                        <option value={0}>0</option>
                        <option value={1}>I</option>
                        <option value={2}>II</option>
                        <option value={3}>III</option>
                      </select>
                    </td>

                    {/* Compromiso de Furca */}
                    <td>
                      <select
                        aria-label={`Furca diente ${toothNumber}`}
                        disabled={isMissing}
                        className={styles.selectInput}
                        value={tooth.furcation || 0}
                        onChange={(e) => setToothFurcation(toothNumber, Number(e.target.value))}
                      >
                        <option value={0}>-</option>
                        <option value={1}>I</option>
                        <option value={2}>II</option>
                        <option value={3}>III</option>
                        <option value={4}>IV</option>
                      </select>
                    </td>

                    {/* Placa bacteriana (Distal, Medio, Mesial) */}
                    <td>
                      <div className={styles.cellThreeGroup}>
                        <input
                          type="checkbox"
                          aria-label={`Placa Distal ${toothNumber}`}
                          disabled={isMissing}
                          className={styles.plaqueCheckbox}
                          checked={aspect.distal.plaque || false}
                          onChange={(e) =>
                            updateSiteValue(toothNumber, aspectKey, 'distal', 'plaque', e.target.checked)
                          }
                        />
                        <input
                          type="checkbox"
                          aria-label={`Placa Medio ${toothNumber}`}
                          disabled={isMissing}
                          className={styles.plaqueCheckbox}
                          checked={aspect.middle.plaque || false}
                          onChange={(e) =>
                            updateSiteValue(toothNumber, aspectKey, 'middle', 'plaque', e.target.checked)
                          }
                        />
                        <input
                          type="checkbox"
                          aria-label={`Placa Mesial ${toothNumber}`}
                          disabled={isMissing}
                          className={styles.plaqueCheckbox}
                          checked={aspect.mesial.plaque || false}
                          onChange={(e) =>
                            updateSiteValue(toothNumber, aspectKey, 'mesial', 'plaque', e.target.checked)
                          }
                        />
                      </div>
                    </td>

                    {/* Sangrado al sondaje BOP (Distal, Medio, Mesial) */}
                    <td>
                      <div className={styles.cellThreeGroup}>
                        <input
                          type="checkbox"
                          aria-label={`Sangrado Distal ${toothNumber}`}
                          disabled={isMissing}
                          className={styles.bopCheckbox}
                          checked={aspect.distal.bleeding || false}
                          onChange={(e) =>
                            updateSiteValue(toothNumber, aspectKey, 'distal', 'bleeding', e.target.checked)
                          }
                        />
                        <input
                          type="checkbox"
                          aria-label={`Sangrado Medio ${toothNumber}`}
                          disabled={isMissing}
                          className={styles.bopCheckbox}
                          checked={aspect.middle.bleeding || false}
                          onChange={(e) =>
                            updateSiteValue(toothNumber, aspectKey, 'middle', 'bleeding', e.target.checked)
                          }
                        />
                        <input
                          type="checkbox"
                          aria-label={`Sangrado Mesial ${toothNumber}`}
                          disabled={isMissing}
                          className={styles.bopCheckbox}
                          checked={aspect.mesial.bleeding || false}
                          onChange={(e) =>
                            updateSiteValue(toothNumber, aspectKey, 'mesial', 'bleeding', e.target.checked)
                          }
                        />
                      </div>
                    </td>

                    {/* Margen Gingival (MG) en mm */}
                    <td>
                      <div className={styles.cellThreeGroup}>
                        <input
                          type="number"
                          aria-label={`MG Distal ${toothNumber}`}
                          disabled={isMissing}
                          className={styles.numberInput}
                          value={aspect.distal.gingivalMargin}
                          onChange={(e) =>
                            updateSiteValue(toothNumber, aspectKey, 'distal', 'gingivalMargin', e.target.value)
                          }
                        />
                        <input
                          type="number"
                          aria-label={`MG Medio ${toothNumber}`}
                          disabled={isMissing}
                          className={styles.numberInput}
                          value={aspect.middle.gingivalMargin}
                          onChange={(e) =>
                            updateSiteValue(toothNumber, aspectKey, 'middle', 'gingivalMargin', e.target.value)
                          }
                        />
                        <input
                          type="number"
                          aria-label={`MG Mesial ${toothNumber}`}
                          disabled={isMissing}
                          className={styles.numberInput}
                          value={aspect.mesial.gingivalMargin}
                          onChange={(e) =>
                            updateSiteValue(toothNumber, aspectKey, 'mesial', 'gingivalMargin', e.target.value)
                          }
                        />
                      </div>
                    </td>

                    {/* Profundidad de Sondaje (PS) en mm */}
                    <td>
                      <div className={styles.cellThreeGroup}>
                        <input
                          type="number"
                          aria-label={`PS Distal ${toothNumber}`}
                          disabled={isMissing}
                          className={styles.numberInput}
                          value={aspect.distal.probingDepth}
                          onChange={(e) =>
                            updateSiteValue(toothNumber, aspectKey, 'distal', 'probingDepth', e.target.value)
                          }
                        />
                        <input
                          type="number"
                          aria-label={`PS Medio ${toothNumber}`}
                          disabled={isMissing}
                          className={styles.numberInput}
                          value={aspect.middle.probingDepth}
                          onChange={(e) =>
                            updateSiteValue(toothNumber, aspectKey, 'middle', 'probingDepth', e.target.value)
                          }
                        />
                        <input
                          type="number"
                          aria-label={`PS Mesial ${toothNumber}`}
                          disabled={isMissing}
                          className={styles.numberInput}
                          value={aspect.mesial.probingDepth}
                          onChange={(e) =>
                            updateSiteValue(toothNumber, aspectKey, 'mesial', 'probingDepth', e.target.value)
                          }
                        />
                      </div>
                    </td>

                    {/* Nivel de Inserción Clínica (NIC = PS + MG) */}
                    <td>
                      <div className={styles.cellThreeGroup}>
                        <span
                          className={`${styles.nicPill} ${getNicClass(aspect.distal.clinicalAttachmentLevel, aspect.distal.probingDepth)}`}
                          title={`NIC Distal: ${aspect.distal.clinicalAttachmentLevel} mm`}
                        >
                          {aspect.distal.clinicalAttachmentLevel}
                        </span>
                        <span
                          className={`${styles.nicPill} ${getNicClass(aspect.middle.clinicalAttachmentLevel, aspect.middle.probingDepth)}`}
                          title={`NIC Medio: ${aspect.middle.clinicalAttachmentLevel} mm`}
                        >
                          {aspect.middle.clinicalAttachmentLevel}
                        </span>
                        <span
                          className={`${styles.nicPill} ${getNicClass(aspect.mesial.clinicalAttachmentLevel, aspect.mesial.probingDepth)}`}
                          title={`NIC Mesial: ${aspect.mesial.clinicalAttachmentLevel} mm`}
                        >
                          {aspect.mesial.clinicalAttachmentLevel}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <footer className={styles.footerBar}>
          <div>
            <label htmlFor="periodontogram-notes" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
              Observaciones Clínicas Periodontales
            </label>
            <textarea
              id="periodontogram-notes"
              className={styles.notesInput}
              rows={2}
              placeholder="Anotaciones de diagnóstico periodontal, factores de riesgo o plan terapéutico..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className={styles.actionRow}>
            {/* RBAC: Solo se renderiza si canWrite === true */}
            {canWrite && (
              <button
                type="button"
                className={styles.saveButton}
                onClick={savePeriodontogram}
                disabled={isSaving || isLoading}
              >
                <MaterialIcon name={isSaving ? 'sync' : 'save'} size={18} />
                {isSaving ? 'Guardando...' : 'Guardar Periodontograma'}
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};
