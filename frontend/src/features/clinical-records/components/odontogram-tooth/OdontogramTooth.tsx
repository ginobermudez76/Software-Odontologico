import React from 'react';
import { OdontogramToothProps } from './OdontogramTooth.types';
import { ToothCondition, ToothSurface } from '../../types/odontogram.types';
import styles from './OdontogramTooth.module.css';

const CONDITION_COLORS: Record<ToothCondition, string> = {
  HEALTHY: styles.colorHealthy,
  CARIES: styles.colorCaries,
  RESTORATION: styles.colorRestoration,
  SEALANT: styles.colorSealant,
  FRACTURE: styles.colorFracture,
  CROWN: styles.colorRestoration,
  ENDODONTICS: styles.colorRestoration,
  IMPLANT: styles.colorRestoration,
  EXTRACTION_PROJECTED: styles.colorHealthy,
  EXTRACTED: styles.colorHealthy,
};

export const OdontogramTooth: React.FC<OdontogramToothProps> = ({
  fdiNumber,
  universalLabel,
  activeNotation,
  finding,
  isUpperArch,
  isSelected = false,
  onSelectTooth,
  onSurfaceClick,
}) => {
  // Cuadrante 1 y 4 (derecho del paciente): Mesial está hacia la derecha (hacia el centro)
  // Cuadrante 2 y 3 (izquierdo del paciente): Mesial está hacia la izquierda (hacia el centro)
  const isRightSideOfPatient = [1, 4, 5, 8].includes(Math.floor(fdiNumber / 10));

  const topSurface: ToothSurface = isUpperArch ? 'vestibular' : 'lingual';
  const bottomSurface: ToothSurface = isUpperArch ? 'lingual' : 'vestibular';
  const leftSurface: ToothSurface = isRightSideOfPatient ? 'distal' : 'mesial';
  const rightSurface: ToothSurface = isRightSideOfPatient ? 'mesial' : 'distal';
  const centerSurface: ToothSurface = 'occlusal';

  const getSurfaceClass = (surface: ToothSurface) => {
    const condition = finding?.surfaces?.[surface] || 'HEALTHY';
    return CONDITION_COLORS[condition] || styles.colorHealthy;
  };

  const handleSurfaceClick = (e: React.MouseEvent, surface: ToothSurface) => {
    e.stopPropagation();
    if (onSurfaceClick) {
      onSurfaceClick(fdiNumber, surface);
    }
  };

  const toothState = finding?.state || 'HEALTHY';
  const displayLabel = activeNotation === 'FDI' ? String(fdiNumber) : universalLabel;

  return (
    <div
      className={`${styles.toothWrapper} ${isSelected ? styles.toothSelected : ''}`}
      onClick={() => onSelectTooth?.(fdiNumber)}
      title={`Pieza ${fdiNumber} (${activeNotation === 'UNIVERSAL' ? `Univ: ${universalLabel}` : `FDI: ${fdiNumber}`}) - Estado: ${toothState}`}
      data-testid={`tooth-${fdiNumber}`}
    >
      {/* Etiqueta del Número según la Notación Activa */}
      <span className={styles.toothNumber}>{displayLabel}</span>

      {/* SVG Anatómico de 5 Superficies Dentales */}
      <svg
        viewBox="0 0 60 60"
        className={styles.svgTooth}
        role="img"
        aria-label={`Pieza dental ${fdiNumber}`}
      >
        {/* Superficie Superior */}
        <polygon
          points="0,0 60,0 45,15 15,15"
          className={`${styles.surfacePolygon} ${getSurfaceClass(topSurface)}`}
          onClick={(e) => handleSurfaceClick(e, topSurface)}
          data-testid={`surface-${fdiNumber}-${topSurface}`}
        />

        {/* Superficie Inferior */}
        <polygon
          points="0,60 60,60 45,45 15,45"
          className={`${styles.surfacePolygon} ${getSurfaceClass(bottomSurface)}`}
          onClick={(e) => handleSurfaceClick(e, bottomSurface)}
          data-testid={`surface-${fdiNumber}-${bottomSurface}`}
        />

        {/* Superficie Izquierda */}
        <polygon
          points="0,0 15,15 15,45 0,60"
          className={`${styles.surfacePolygon} ${getSurfaceClass(leftSurface)}`}
          onClick={(e) => handleSurfaceClick(e, leftSurface)}
          data-testid={`surface-${fdiNumber}-${leftSurface}`}
        />

        {/* Superficie Derecha */}
        <polygon
          points="60,0 45,15 45,45 60,60"
          className={`${styles.surfacePolygon} ${getSurfaceClass(rightSurface)}`}
          onClick={(e) => handleSurfaceClick(e, rightSurface)}
          data-testid={`surface-${fdiNumber}-${rightSurface}`}
        />

        {/* Superficie Central (Oclusal / Incisal) */}
        <polygon
          points="15,15 45,15 45,45 15,45"
          className={`${styles.centerSquare} ${getSurfaceClass(centerSurface)}`}
          onClick={(e) => handleSurfaceClick(e, centerSurface)}
          data-testid={`surface-${fdiNumber}-${centerSurface}`}
        />

        {/* OVERLAYS GLOBALES DE LA PIEZA DENTAL */}

        {/* Exodoncia realizada (Aspa Roja 'X') */}
        {toothState === 'EXTRACTED' && (
          <g className={styles.overlayExtracted}>
            <line x1="5" y1="5" x2="55" y2="55" />
            <line x1="55" y1="5" x2="5" y2="55" />
          </g>
        )}

        {/* Extracción indicada / proyectada (Aspa Naranja Discontinua) */}
        {toothState === 'EXTRACTION_PROJECTED' && (
          <g className={styles.overlayExtractionProjected}>
            <line x1="5" y1="5" x2="55" y2="55" />
            <line x1="55" y1="5" x2="5" y2="55" />
          </g>
        )}

        {/* Endodoncia realizada (Línea vertical central en conducto) */}
        {toothState === 'ENDODONTICS' && (
          <line x1="30" y1="2" x2="30" y2="58" className={styles.overlayEndodontics} />
        )}

        {/* Corona o Prótesis Fija (Círculo perimetral) */}
        {toothState === 'CROWN' && (
          <circle cx="30" cy="30" r="28" className={styles.overlayCrown} />
        )}

        {/* Implante Dental (Tornillo protésico) */}
        {toothState === 'IMPLANT' && (
          <g stroke="#0284c7" strokeWidth="2.5" fill="none">
            <line x1="30" y1="5" x2="30" y2="55" />
            <line x1="22" y1="18" x2="38" y2="18" />
            <line x1="24" y1="28" x2="36" y2="28" />
            <line x1="26" y1="38" x2="34" y2="38" />
            <line x1="28" y1="48" x2="32" y2="48" />
          </g>
        )}

        {/* Fractura Dental (Rayo en zigzag) */}
        {toothState === 'FRACTURE' && (
          <polyline
            points="10,10 25,28 15,35 45,55"
            stroke="#ea580c"
            strokeWidth="3"
            fill="none"
          />
        )}
      </svg>

      {/* Indicador de estado abreviado si tiene una condición global */}
      {toothState !== 'HEALTHY' && (
        <span className={styles.badgeState}>
          {toothState === 'EXTRACTED'
            ? 'AUS'
            : toothState === 'CROWN'
            ? 'COR'
            : toothState === 'ENDODONTICS'
            ? 'ENDO'
            : toothState === 'IMPLANT'
            ? 'IMP'
            : toothState === 'EXTRACTION_PROJECTED'
            ? 'EXO'
            : toothState === 'CARIES'
            ? 'CAR'
            : toothState === 'RESTORATION'
            ? 'OBT'
            : toothState}
        </span>
      )}
    </div>
  );
};
