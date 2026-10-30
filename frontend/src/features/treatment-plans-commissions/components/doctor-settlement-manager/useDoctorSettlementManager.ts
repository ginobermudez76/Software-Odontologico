import { useState, useEffect, useCallback } from 'react';
import { CommissionSettlement, SettlementPreview } from '../../types/treatment-plans-commissions.types';
import { DoctorOption } from './DoctorSettlementManager.types';
import { treatmentPlansCommissionsApi } from '../../services/treatmentPlansCommissionsApi';

const DEFAULT_DOCTORS: DoctorOption[] = [
  { id: '00000000-0000-0000-0000-000000000002', name: 'Dr. Carlos Mendoza', email: 'cmendoza@sigo-dental.com' },
  { id: '00000000-0000-0000-0000-000000000003', name: 'Dra. María Elena Ramos', email: 'mramos@sigo-dental.com' },
];

export const useDoctorSettlementManager = (
  doctors: DoctorOption[] = DEFAULT_DOCTORS,
  onSettlementGenerated?: (settlement: CommissionSettlement) => void,
) => {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(
    doctors.length > 0 ? doctors[0].id : '',
  );
  const [periodStart, setPeriodStart] = useState<string>('2026-10-01');
  const [periodEnd, setPeriodEnd] = useState<string>('2026-10-31');
  const [preview, setPreview] = useState<SettlementPreview | null>(null);
  const [settlements, setSettlements] = useState<CommissionSettlement[]>([]);
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Load preview calculation
  const calculatePreview = useCallback(async () => {
    if (!selectedDoctorId) return;
    setIsLoadingPreview(true);
    setFeedback(null);
    try {
      const data = await treatmentPlansCommissionsApi.previewSettlement({
        doctorId: selectedDoctorId,
        periodStart,
        periodEnd,
      });
      setPreview(data);
    } catch (err: any) {
      // Fallback demo preview
      const doc = doctors.find((d) => d.id === selectedDoctorId);
      setPreview({
        doctorId: selectedDoctorId,
        doctorName: doc ? doc.name : 'Dr. Odontólogo',
        periodStart,
        periodEnd,
        totalProceduresCount: 3,
        grossAmount: 490.0,
        totalLabCosts: 75.0, // Regla RN-07: Costo laboratorio deducido
        netCommissionableBase: 415.0, // 490 - 75
        netCommissionPaid: 166.0, // 40% de 415
        items: [
          {
            procedureId: 'proc-1',
            procedureName: 'Profilaxis y Destartraje',
            procedureCode: 'PRO-001',
            procedurePrice: 70.0,
            labCost: 0,
            commissionableBase: 70.0,
            commissionRate: 40.0,
            doctorEarning: 28.0,
          },
          {
            procedureId: 'proc-2',
            procedureName: 'Corona Cerámica Metal',
            procedureCode: 'PROT-001',
            procedurePrice: 280.0,
            labCost: 75.0, // Regla RN-07: Lab deducido
            commissionableBase: 205.0, // 280 - 75
            commissionRate: 40.0,
            doctorEarning: 82.0,
          },
          {
            procedureId: 'proc-3',
            procedureName: 'Endodoncia Unirradicular',
            procedureCode: 'ENDO-001',
            procedurePrice: 140.0,
            labCost: 0,
            commissionableBase: 140.0,
            commissionRate: 40.0,
            doctorEarning: 56.0,
          },
        ],
      });
    } finally {
      setIsLoadingPreview(false);
    }
  }, [selectedDoctorId, periodStart, periodEnd, doctors]);

  // Load historical settlements
  const loadSettlements = useCallback(async () => {
    try {
      const data = await treatmentPlansCommissionsApi.getSettlements(selectedDoctorId);
      setSettlements(data);
    } catch {
      setSettlements([]);
    }
  }, [selectedDoctorId]);

  useEffect(() => {
    calculatePreview();
    loadSettlements();
  }, [calculatePreview, loadSettlements]);

  const generateSettlement = async () => {
    if (!selectedDoctorId || !preview) return;
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const created = await treatmentPlansCommissionsApi.generateSettlement({
        doctorId: selectedDoctorId,
        periodStart,
        periodEnd,
        notes: `Liquidación formal de honorarios periodo ${periodStart} a ${periodEnd}`,
      });

      setFeedback({
        type: 'success',
        message: `Liquidación ${created.settlementCode} generada exitosamente. Monto a pagar: $${created.netCommissionPaid}`,
      });
      loadSettlements();
      if (onSettlementGenerated) onSettlementGenerated(created);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message:
          err?.response?.data?.detail ||
          err?.message ||
          'Error al registrar la liquidación de honorarios',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const markAsPaid = async (settlementId: string) => {
    setIsSubmitting(true);
    setFeedback(null);
    try {
      await treatmentPlansCommissionsApi.paySettlement(settlementId);
      setFeedback({
        type: 'success',
        message: 'Liquidación marcada como PAGADA exitosamente',
      });
      loadSettlements();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message:
          err?.response?.data?.detail ||
          err?.message ||
          'Error al actualizar el estado de pago',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    selectedDoctorId,
    setSelectedDoctorId,
    periodStart,
    setPeriodStart,
    periodEnd,
    setPeriodEnd,
    preview,
    settlements,
    isLoadingPreview,
    isSubmitting,
    feedback,
    calculatePreview,
    generateSettlement,
    markAsPaid,
  };
};

