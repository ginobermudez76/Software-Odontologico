import React from 'react';
import { MaterialIcon } from '../../../../components/icons/MaterialIcon';
import styles from './SignaturePad.module.css';
import { SignaturePadProps } from './SignaturePad.types';
import { useSignaturePad } from './useSignaturePad';

export const SignaturePad: React.FC<SignaturePadProps> = ({
  width = 500,
  height = 180,
  title = 'Firma Biométrica del Paciente / Representante Legal',
  onSignatureChange,
}) => {
  const {
    canvasRef,
    hasSignature,
    startDrawing,
    draw,
    stopDrawing,
    clearSignature,
  } = useSignaturePad(onSignatureChange);

  return (
    <div className={styles.container}>
      <div className={styles.titleBar}>
        <span className={styles.title}>
          <MaterialIcon name="draw" size={16} />
          {title}
        </span>
        <button
          type="button"
          className={styles.clearButton}
          onClick={clearSignature}
          disabled={!hasSignature}
        >
          <MaterialIcon name="restart_alt" size={14} />
          Borrar Trazo
        </button>
      </div>

      <div className={styles.canvasBox} style={{ height }}>
        {!hasSignature && (
          <div className={styles.placeholderPrompt}>
            <MaterialIcon name="gesture" size={28} />
            <span>Dibuje su firma con el dedo, lápiz óptico o cursor del mouse</span>
          </div>
        )}
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className={styles.canvas}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          aria-label="Lienzo de captura de firma biométrica"
        />
      </div>
    </div>
  );
};

