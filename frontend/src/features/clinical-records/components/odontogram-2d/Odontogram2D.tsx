import React from 'react';
import { MaterialIcon } from '../../../../components/icons/MaterialIcon';
import { MedicalAlertBadge } from '../../../patients/components/medical-alert-badge';
import { OdontogramTooth } from '../odontogram-tooth';
import { OdontogramPalette } from '../odontogram-palette';
import { Odontogram2DProps } from './Odontogram2D.types';
import { useOdontogram2D } from './useOdontogram2D';
import {
  FDI_TO_UNIVERSAL_PERMANENT,
  FDI_TO_UNIVERSAL_TEMPORARY,
  QUADRANT_1_PERMANENT,
  QUADRANT_2_PERMANENT,
  QUADRANT_3_PERMANENT,
  QUADRANT_4_PERMANENT,
  QUADRANT_5_TEMPORARY,
  QUADRANT_6_TEMPORARY,
  QUADRANT_7_TEMPORARY,
  QUADRANT_8_TEMPORARY,
} from '../../types/odontogram.types';
import styles from './Odontogram2D.module.css';

export const Odontogram2D: React.FC<Odontogram2DProps> = ({ initialPatientId }) => {
  const {
    patients,
    selectedPatientId,
    setSelectedPatientId,
    patientRecord,
    activeNotation,
    setActiveNotation,
    activeDentition,
    setActiveDentition,
    activeMode,
    handleModeChange,
    selectedCondition,
    setSelectedCondition,
    applyMode,
    setApplyMode,
    selectedTooth,
    setSelectedTooth,
    teeth,
    isLoading,
    isSaving,
    message,
    canWrite,
    handleSurfaceClick,
    handleSelectTooth,
    handleToothNotesChange,
    handleSaveOdontogram,
  } = useOdontogram2D(initialPatientId);

  // Arcos según el tipo de dentición
  const isPermanent = activeDentition === 'PERMANENT';
  const upperRightQuadrant = isPermanent ? QUADRANT_1_PERMANENT : QUADRANT_5_TEMPORARY;
  const upperLeftQuadrant = isPermanent ? QUADRANT_2_PERMANENT : QUADRANT_6_TEMPORARY;
  const lowerRightQuadrant = isPermanent ? QUADRANT_4_PERMANENT : QUADRANT_8_TEMPORARY;
  const lowerLeftQuadrant = isPermanent ? QUADRANT_3_PERMANENT : QUADRANT_7_TEMPORARY;

  const universalMap = isPermanent ? FDI_TO_UNIVERSAL_PERMANENT : FDI_TO_UNIVERSAL_TEMPORARY;

  const selectedToothFinding = selectedTooth ? teeth[String(selectedTooth)] : null;

  return (
    <div className={styles.container}>
      {/* Barra superior con selector de paciente y alertas médicas */}
      <div className={styles.topBar}>
        <div className={styles.titleArea}>
          <MaterialIcon name="dentistry" className={styles.titleIcon} />
          <div>
            <h1 className={styles.title}>Odontograma Anatómico 2D</h1>
            <p className={styles.subtitle}>
              Expediente Clínico Digital con soporte de nomenclaturas FDI y Universal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="patientPicker" className="text-sm font-semibold text-slate-700">
              Paciente:
            </label>
            <select
              id="patientPicker"
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="p-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 bg-white"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.lastName}, {p.firstName} (Doc: {p.documentNumber})
                </option>
              ))}
            </select>
          </div>

          {patientRecord?.visibleAlerts && (
            <MedicalAlertBadge alerts={patientRecord.visibleAlerts} />
          )}
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg flex items-center gap-2 border ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <MaterialIcon name={message.type === 'success' ? 'check_circle' : 'error'} />
          <span>{message.text}</span>
        </div>
      )}

      {/* Barra de Controles y Notaciones */}
      <div className={styles.controlsBar}>
        <div className="flex flex-wrap items-center gap-3">
          {/* Selector Inicial vs. Evolutivo */}
          <div className={styles.selectorPillGroup}>
            <button
              type="button"
              className={`${styles.pillButton} ${activeMode === 'INITIAL' ? styles.pillButtonActive : ''}`}
              onClick={() => handleModeChange('INITIAL')}
            >
              <MaterialIcon name="history" className="text-sm" />
              <span>Odontograma Inicial</span>
            </button>
            <button
              type="button"
              className={`${styles.pillButton} ${activeMode === 'EVOLUTIONARY' ? styles.pillButtonActive : ''}`}
              onClick={() => handleModeChange('EVOLUTIONARY')}
            >
              <MaterialIcon name="update" className="text-sm" />
              <span>Odontograma Evolutivo</span>
            </button>
          </div>

          {/* Selector FDI vs Universal */}
          <div className={styles.selectorPillGroup}>
            <button
              type="button"
              className={`${styles.pillButton} ${activeNotation === 'FDI' ? styles.pillButtonActive : ''}`}
              onClick={() => setActiveNotation('FDI')}
              data-testid="btn-notation-fdi"
            >
              <span>FDI (Dos Dígitos)</span>
            </button>
            <button
              type="button"
              className={`${styles.pillButton} ${activeNotation === 'UNIVERSAL' ? styles.pillButtonActive : ''}`}
              onClick={() => setActiveNotation('UNIVERSAL')}
              data-testid="btn-notation-universal"
            >
              <span>Universal (1-32 / A-T)</span>
            </button>
          </div>

          {/* Selector Dentición Adulto vs Infantil */}
          <div className={styles.selectorPillGroup}>
            <button
              type="button"
              className={`${styles.pillButton} ${activeDentition === 'PERMANENT' ? styles.pillButtonActive : ''}`}
              onClick={() => setActiveDentition('PERMANENT')}
            >
              <MaterialIcon name="person" className="text-sm" />
              <span>Adulto (32)</span>
            </button>
            <button
              type="button"
              className={`${styles.pillButton} ${activeDentition === 'TEMPORARY' ? styles.pillButtonActive : ''}`}
              onClick={() => setActiveDentition('TEMPORARY')}
            >
              <MaterialIcon name="child_care" className="text-sm" />
              <span>Infantil / Decidua (20)</span>
            </button>
          </div>
        </div>

        {/* Botón Guardar: Oculto del DOM si canWrite = false */}
        {canWrite && (
          <button
            type="button"
            className={styles.btnSave}
            onClick={handleSaveOdontogram}
            disabled={isSaving || isLoading}
            data-testid="btn-save-odontogram"
          >
            <MaterialIcon name={isSaving ? 'sync' : 'save'} />
            <span>{isSaving ? 'Guardando...' : `Guardar ${activeMode === 'INITIAL' ? 'Inicial' : 'Evolutivo'}`}</span>
          </button>
        )}
      </div>

      {/* Paleta interactiva de herramientas clínicas */}
      <OdontogramPalette
        selectedCondition={selectedCondition}
        onSelectCondition={setSelectedCondition}
        applyMode={applyMode}
        onToggleApplyMode={setApplyMode}
      />

      {/* Lienzo Anatómico de los Arcos Dentales */}
      <div className={styles.canvasCard}>
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-2">
            <MaterialIcon name="sync" className="animate-spin text-3xl text-sky-600" />
            <span>Cargando expediente odontológico...</span>
          </div>
        ) : (
          <>
            {/* Arco Superior (Maxilar) */}
            <div className={styles.archContainer}>
              <div className={styles.archHeader}>
                <span>Derecho (Q1/Q5)</span>
                <span className="text-sky-700 font-bold">Maxilar Superior</span>
                <span>Izquierdo (Q2/Q6)</span>
              </div>

              <div className={styles.archRow}>
                {/* Cuadrante Superior Derecho */}
                <div className={styles.quadrantGroup}>
                  {upperRightQuadrant.map((fdiNum) => (
                    <OdontogramTooth
                      key={fdiNum}
                      fdiNumber={fdiNum}
                      universalLabel={universalMap[fdiNum] || String(fdiNum)}
                      activeNotation={activeNotation}
                      finding={teeth[String(fdiNum)]}
                      isUpperArch={true}
                      isSelected={selectedTooth === fdiNum}
                      onSelectTooth={handleSelectTooth}
                      onSurfaceClick={handleSurfaceClick}
                    />
                  ))}
                </div>

                {/* Línea Media Dental Superior */}
                <div className={styles.midlineDivider} />

                {/* Cuadrante Superior Izquierdo */}
                <div className={styles.quadrantGroup}>
                  {upperLeftQuadrant.map((fdiNum) => (
                    <OdontogramTooth
                      key={fdiNum}
                      fdiNumber={fdiNum}
                      universalLabel={universalMap[fdiNum] || String(fdiNum)}
                      activeNotation={activeNotation}
                      finding={teeth[String(fdiNum)]}
                      isUpperArch={true}
                      isSelected={selectedTooth === fdiNum}
                      onSelectTooth={handleSelectTooth}
                      onSurfaceClick={handleSurfaceClick}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Plano de Oclusión Dental */}
            <div className={styles.occlusalPlaneDivider}>
              <span className={styles.occlusalPlaneLabel}>PLANO OCLUSAL</span>
            </div>

            {/* Arco Inferior (Mandíbula) */}
            <div className={styles.archContainer}>
              <div className={styles.archRow}>
                {/* Cuadrante Inferior Derecho */}
                <div className={styles.quadrantGroup}>
                  {lowerRightQuadrant.map((fdiNum) => (
                    <OdontogramTooth
                      key={fdiNum}
                      fdiNumber={fdiNum}
                      universalLabel={universalMap[fdiNum] || String(fdiNum)}
                      activeNotation={activeNotation}
                      finding={teeth[String(fdiNum)]}
                      isUpperArch={false}
                      isSelected={selectedTooth === fdiNum}
                      onSelectTooth={handleSelectTooth}
                      onSurfaceClick={handleSurfaceClick}
                    />
                  ))}
                </div>

                {/* Línea Media Dental Inferior */}
                <div className={styles.midlineDivider} />

                {/* Cuadrante Inferior Izquierdo */}
                <div className={styles.quadrantGroup}>
                  {lowerLeftQuadrant.map((fdiNum) => (
                    <OdontogramTooth
                      key={fdiNum}
                      fdiNumber={fdiNum}
                      universalLabel={universalMap[fdiNum] || String(fdiNum)}
                      activeNotation={activeNotation}
                      finding={teeth[String(fdiNum)]}
                      isUpperArch={false}
                      isSelected={selectedTooth === fdiNum}
                      onSelectTooth={handleSelectTooth}
                      onSurfaceClick={handleSurfaceClick}
                    />
                  ))}
                </div>
              </div>

              <div className={styles.archHeader}>
                <span>Derecho (Q4/Q8)</span>
                <span className="text-sky-700 font-bold">Mandíbula Inferior</span>
                <span>Izquierdo (Q3/Q7)</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Detalle y notas clínicas de la pieza seleccionada */}
      {selectedTooth && (
        <div className={styles.toothDetailDrawer}>
          <div className={styles.toothDetailHeader}>
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <MaterialIcon name="info" className="text-sky-600" />
              <span>
                Detalle Clínico de la Pieza FDI {selectedTooth} (Univ: {universalMap[selectedTooth] || selectedTooth})
              </span>
              <span className="text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-700 uppercase font-semibold">
                Estado: {selectedToothFinding?.state || 'SANO'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedTooth(null)}
              className="text-slate-400 hover:text-slate-600 text-sm flex items-center"
            >
              <MaterialIcon name="close" />
            </button>
          </div>

          <div className={styles.drawerGrid}>
            <div>
              <label htmlFor="toothNotes" className="block text-xs font-semibold text-slate-600 mb-1">
                Hallazgo Clínico / Observaciones:
              </label>
              <input
                id="toothNotes"
                type="text"
                value={selectedToothFinding?.notes || ''}
                onChange={(e) => handleToothNotesChange(e.target.value)}
                placeholder="Ej. Caries profunda que compromete cámara pulpar..."
                className={styles.inputField}
              />
            </div>
            <div>
              <label htmlFor="toothTreatment" className="block text-xs font-semibold text-slate-600 mb-1">
                Tratamiento Odontológico Proyectado:
              </label>
              <input
                id="toothTreatment"
                type="text"
                value={selectedToothFinding?.projectedTreatment || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  const key = String(selectedTooth);
                  // actualizar projectedTreatment
                  teeth[key] = {
                    ...(teeth[key] || { toothId: key, state: 'HEALTHY' }),
                    projectedTreatment: val,
                  };
                }}
                placeholder="Ej. Biopulpectomía + Perno de fibra + Corona porcelana..."
                className={styles.inputField}
              />
            </div>
          </div>
        </div>
      )}

      {/* Barra de Leyenda de Códigos Cromáticos Normativos */}
      <div className={styles.legendBar}>
        <div className={styles.legendItem}>
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
          <span>Rojo: Caries Activa</span>
        </div>
        <div className={styles.legendItem}>
          <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>
          <span>Azul: Tratamiento Existente</span>
        </div>
        <div className={styles.legendItem}>
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
          <span>Naranja: Indicado / Fractura</span>
        </div>
        <div className={styles.legendItem}>
          <span className="w-3 h-3 rounded-full bg-purple-500 inline-block"></span>
          <span>Morado: Sellante</span>
        </div>
        <div className={styles.legendItem}>
          <span className="w-3 h-3 border-2 border-red-500 inline-block text-center leading-none text-red-500 font-bold text-xs">
            ✕
          </span>
          <span>Aspa: Exodoncia</span>
        </div>
      </div>
    </div>
  );
};

