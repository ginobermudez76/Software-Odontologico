import { useState } from 'react';
import { BlindCloseModalProps } from './BlindCloseModal.types';
import { BlindCloseResult } from '../../types/billing.types';
import { billingApi } from '../../services/billingApi';

export const useBlindCloseModal = ({ onClose, onSuccess, shift }: BlindCloseModalProps) => {
  const [declaredAmount, setDeclaredAmount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reconciliationResult, setReconciliationResult] = useState<BlindCloseResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const amountNum = parseFloat(declaredAmount);
    if (isNaN(amountNum) || amountNum < 0) {
      setErrorMessage('Por favor ingrese un monto físico válido mayor o igual a 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await billingApi.closeBlindShift(shift.id, amountNum, notes);
      setReconciliationResult(res);
      onSuccess(res);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setErrorMessage(detail || 'Error al procesar el cierre ciego de caja.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    setReconciliationResult(null);
    setDeclaredAmount('');
    setNotes('');
    onClose();
  };

  return {
    declaredAmount,
    setDeclaredAmount,
    notes,
    setNotes,
    isSubmitting,
    errorMessage,
    reconciliationResult,
    handleSubmit,
    handleFinish,
  };
};
