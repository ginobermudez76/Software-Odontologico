import React from 'react';
import { MaterialIcon } from '../../../../components/icons/MaterialIcon';
import { OdontogramPaletteProps } from './OdontogramPalette.types';
import { ToothCondition } from '../../types/odontogram.types';
import styles from './OdontogramPalette.module.css';

interface DiagnosticTool {
  condition: ToothCondition;
  label: string;
  dotColor: string;
  icon?: string;
  applicableTo: 'SURFACE_AND_TOOTH' | 'TOOTH_ONLY';
}

const DIAGNOSTIC_TOOLS: DiagnosticTool[] = [
  { condition: 'CARIES', label: 'Caries Activa', dotColor: '#ef4444', applicableTo: 'SURFACE_AND_TOOTH' },
  { condition: 'RESTORATION', label: 'Restauración Previa', dotColor: '#3b82f6', applicableTo: 'SURFACE_AND_TOOTH' },
  { condition: 'SEALANT', label: 'Sellante', dotColor: '#8b5cf6', applicableTo: 'SURFACE_AND_TOOTH' },
  { condition: 'FRACTURE', label: 'Fractura', dotColor: '#f97316', applicableTo: 'SURFACE_AND_TOOTH' },
  { condition: 'ENDODONTICS', label: 'Endodoncia', dotColor: '#2563eb', icon: 'line_style', applicableTo: 'TOOTH_ONLY' },
  { condition: 'CROWN', label: 'Corona / Prótesis', dotColor: '#eab308', icon: 'circle', applicableTo: 'TOOTH_ONLY' },
  { condition: 'IMPLANT', label: 'Implante', dotColor: '#0284c7', icon: 'build', applicableTo: 'TOOTH_ONLY' },
  { condition: 'EXTRACTION_PROJECTED', label: 'Exodoncia Indicada', dotColor: '#d97706', icon: 'delete_sweep', applicableTo: 'TOOTH_ONLY' },
  { condition: 'EXTRACTED', label: 'Ausente / Extraído', dotColor: '#dc2626', icon: 'close', applicableTo: 'TOOTH_ONLY' },
  { condition: 'HEALTHY', label: 'Sano / Limpiar', dotColor: '#e2e8f0', icon: 'refresh', applicableTo: 'SURFACE_AND_TOOTH' },
];

export const OdontogramPalette: React.FC<OdontogramPaletteProps> = ({
  selectedCondition,
  onSelectCondition,
  applyMode,
  onToggleApplyMode,
}) => {
  return (
    <div className={styles.paletteContainer}>
      {/* Botones de Hallazgos Clínicos y Patologías */}
      <div className={styles.toolsGroup}>
        {DIAGNOSTIC_TOOLS.map((tool) => {
          const isActive = selectedCondition === tool.condition;
          return (
            <button
              key={tool.condition}
              type="button"
              className={`${styles.toolButton} ${isActive ? styles.toolButtonActive : ''}`}
              onClick={() => onSelectCondition(tool.condition)}
              title={
                tool.applicableTo === 'TOOTH_ONLY'
                  ? 'Aplica a la pieza dental completa'
                  : 'Aplica a superficies o a toda la pieza'
              }
            >
              {tool.icon ? (
                <MaterialIcon name={tool.icon} className="text-sm" />
              ) : (
                <span className={styles.colorDot} style={{ backgroundColor: tool.dotColor }} />
              )}
              <span>{tool.label}</span>
            </button>
          );
        })}
      </div>

      {/* Modo de Aplicación: Por Superficie vs. Pieza Completa */}
      <div className={styles.modeToggleGroup}>
        <button
          type="button"
          className={`${styles.modeButton} ${applyMode === 'SURFACE' ? styles.modeButtonActive : ''}`}
          onClick={() => onToggleApplyMode('SURFACE')}
        >
          <MaterialIcon name="crop_free" className="text-sm" />
          <span>Superficie</span>
        </button>
        <button
          type="button"
          className={`${styles.modeButton} ${applyMode === 'TOOTH' ? styles.modeButtonActive : ''}`}
          onClick={() => onToggleApplyMode('TOOTH')}
        >
          <MaterialIcon name="select_all" className="text-sm" />
          <span>Pieza Completa</span>
        </button>
      </div>
    </div>
  );
};
