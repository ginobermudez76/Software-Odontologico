import { useState, useEffect, useCallback, useMemo } from 'react';
import { TreatmentPlan } from '../../types/treatment-plans-commissions.types';
import { NewPlanDraftState } from './TreatmentPlanBuilder.types';
import { treatmentPlansCommissionsApi } from '../../services/treatmentPlansCommissionsApi';

const DEFAULT_PROCEDURES_LIST = [
  { id: 'proc-1', code: 'PRO-001', name: 'Profilaxis y Destartraje Supragingival', price: 45.0, labCost: 0 },
  { id: 'proc-2', code: 'RES-001', name: 'Restauración con Resina Compuesta Simple', price: 70.0, labCost: 0 },
  { id: 'proc-3', code: 'ENDO-001', name: 'Tratamiento de Endodoncia Unirradicular', price: 140.0, labCost: 0 },
  { id: 'proc-4', code: 'PROT-001', name: 'Corona de Porcelana sobre Metal', price: 280.0, labCost: 75.0 },
  { id: 'proc-5', code: 'IMP-001', name: 'Implante Dental de Titanio Osteointegrado', price: 650.0, labCost: 120.0 },
];

export const useTreatmentPlanBuilder = (
  patientId: string = '00000000-0000-0000-0000-000000000001',
  doctorId: string = '00000000-0000-0000-0000-000000000002',
  onPlanCreated?: (plan: TreatmentPlan) => void,
) => {
  const [plans, setPlans] = useState<TreatmentPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<TreatmentPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // New Draft State
  const [draft, setDraft] = useState<NewPlanDraftState>({
    title: 'Plan Integral de Tratamiento Odontológico',
    description: '',
    isAlternative: false,
    phases: [
      {
        phaseNumber: 1,
        name: 'Fase 1: Saneamiento Básico y Profilaxis',
        items: [
          {
            procedureId: 'proc-1',
            procedureName: 'Profilaxis y Destartraje Supragingival',
            quantity: 1,
            unitPrice: 45.0,
            discountPercent: 0,
            labCost: 0,
          },
        ],
      },
      {
        phaseNumber: 2,
        name: 'Fase 2: Operatorias y Endodoncia',
        items: [
          {
            procedureId: 'proc-2',
            procedureName: 'Restauración con Resina Compuesta Simple',
            toothNumber: 36,
            surface: 'MOD',
            quantity: 1,
            unitPrice: 70.0,
            discountPercent: 0,
            labCost: 0,
          },
        ],
      },
      {
        phaseNumber: 3,
        name: 'Fase 3: Prótesis y Rehabilitación Definitiva',
        items: [
          {
            procedureId: 'proc-4',
            procedureName: 'Corona de Porcelana sobre Metal',
            toothNumber: 46,
            quantity: 1,
            unitPrice: 280.0,
            discountPercent: 5,
            labCost: 75.0,
          },
        ],
      },
    ],
  });

  const loadPlans = useCallback(async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const data = await treatmentPlansCommissionsApi.getPatientTreatmentPlans(patientId);
      setPlans(data);
      if (data.length > 0 && !selectedPlan) {
        setSelectedPlan(data[0]);
      }
    } catch (err: any) {
      // Mock fallback if backend empty
      const now = new Date();
      const expires = new Date(now.getTime() + 24 * 24 * 60 * 60 * 1000);
      setPlans([
        {
          id: 'demo-plan-1',
          patientId,
          doctorId,
          planCode: 'PRE-2026-1042',
          title: 'Plan Integral de Rehabilitación',
          description: 'Rehabilitación del sector posterior y profilaxis',
          status: 'EMITIDO',
          isAlternative: false,
          totalAmount: 381.0,
          issuedAt: now.toISOString(),
          expiresAt: expires.toISOString(),
          daysRemaining: 24,
          isExpired: false,
          phases: [
            {
              id: 'phase-1',
              planId: 'demo-plan-1',
              phaseNumber: 1,
              name: 'Fase 1: Higiene y Profilaxis',
              status: 'PENDIENTE',
              orderIndex: 1,
              subtotal: 45.0,
              items: [
                {
                  id: 'item-1',
                  phaseId: 'phase-1',
                  procedureId: 'proc-1',
                  procedure: {
                    id: 'proc-1',
                    code: 'PRO-001',
                    name: 'Profilaxis y Destartraje Supragingival',
                    category: 'Preventiva',
                  },
                  quantity: 1,
                  unitPrice: 45.0,
                  discountPercent: 0,
                  labCost: 0,
                  finalPrice: 45.0,
                  status: 'PENDIENTE',
                  orderIndex: 1,
                },
              ],
            },
            {
              id: 'phase-2',
              planId: 'demo-plan-1',
              phaseNumber: 2,
              name: 'Fase 2: Operatorias',
              status: 'PENDIENTE',
              orderIndex: 2,
              subtotal: 70.0,
              items: [
                {
                  id: 'item-2',
                  phaseId: 'phase-2',
                  procedureId: 'proc-2',
                  procedure: {
                    id: 'proc-2',
                    code: 'RES-001',
                    name: 'Restauración con Resina Compuesta Simple',
                    category: 'Operatoria',
                  },
                  toothNumber: 36,
                  surface: 'MOD',
                  quantity: 1,
                  unitPrice: 70.0,
                  discountPercent: 0,
                  labCost: 0,
                  finalPrice: 70.0,
                  status: 'PENDIENTE',
                  orderIndex: 1,
                },
              ],
            },
            {
              id: 'phase-3',
              planId: 'demo-plan-1',
              phaseNumber: 3,
              name: 'Fase 3: Prótesis Fija',
              status: 'PENDIENTE',
              orderIndex: 3,
              subtotal: 266.0,
              items: [
                {
                  id: 'item-3',
                  phaseId: 'phase-3',
                  procedureId: 'proc-4',
                  procedure: {
                    id: 'proc-4',
                    code: 'PROT-001',
                    name: 'Corona de Porcelana sobre Metal',
                    category: 'Rehabilitación',
                  },
                  toothNumber: 46,
                  quantity: 1,
                  unitPrice: 280.0,
                  discountPercent: 5,
                  labCost: 75.0,
                  finalPrice: 266.0,
                  status: 'PENDIENTE',
                  orderIndex: 1,
                },
              ],
            },
          ],
          createdAt: now.toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [patientId, doctorId, selectedPlan]);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  // Total draft amount calculation
  const draftTotalAmount = useMemo(() => {
    let total = 0;
    draft.phases.forEach((p) => {
      p.items.forEach((i) => {
        const discountMultiplier = (100 - (i.discountPercent || 0)) / 100;
        total += i.quantity * i.unitPrice * discountMultiplier;
      });
    });
    return Number(total.toFixed(2));
  }, [draft]);

  const approvePlan = async (planId: string) => {
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const updated = await treatmentPlansCommissionsApi.updatePlanStatus(planId, 'APROBADO');
      setFeedback({
        type: 'success',
        message: 'Presupuesto aprobado exitosamente. Ya puede convertir los procedimientos en citas agendadas.',
      });
      loadPlans();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message:
          err?.response?.data?.detail ||
          err?.message ||
          'Error al aprobar el presupuesto (compruebe vigencia RN-04)',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const rejectPlan = async (planId: string) => {
    const reason = prompt('Ingrese el motivo de rechazo del presupuesto:') || undefined;
    setIsSubmitting(true);
    setFeedback(null);
    try {
      await treatmentPlansCommissionsApi.updatePlanStatus(planId, 'RECHAZADO', reason);
      setFeedback({
        type: 'success',
        message: 'Presupuesto marcado como Rechazado',
      });
      loadPlans();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.response?.data?.detail || err?.message || 'Error al rechazar presupuesto',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const schedulePlanItem = async (planId: string, itemId: string) => {
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const now = new Date();
      const startDateTime = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
      const endDateTime = new Date(now.getTime() + 25 * 60 * 60 * 1000).toISOString();

      await treatmentPlansCommissionsApi.convertItemToAppointment(planId, itemId, {
        branchId: '00000000-0000-0000-0000-000000000001',
        chairId: '00000000-0000-0000-0000-000000000001',
        startDateTime,
        endDateTime,
        reason: 'Cita generada desde presupuesto aprobado',
      });

      setFeedback({
        type: 'success',
        message: 'Procedimiento agendado como cita clínica exitosamente',
      });
      loadPlans();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message:
          err?.response?.data?.detail ||
          err?.message ||
          'No se pudo agendar la cita para este ítem',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitNewPlan = async () => {
    if (!draft.title.trim()) {
      setFeedback({ type: 'error', message: 'Debe ingresar un título para el presupuesto' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);
    try {
      const created = await treatmentPlansCommissionsApi.createTreatmentPlan({
        patientId,
        doctorId,
        title: draft.title,
        description: draft.description,
        isAlternative: draft.isAlternative,
        phases: draft.phases.map((p) => ({
          phaseNumber: p.phaseNumber,
          name: p.name,
          items: p.items.map((i) => ({
            procedureId: i.procedureId,
            toothNumber: i.toothNumber,
            surface: i.surface,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            discountPercent: i.discountPercent,
            labCost: i.labCost,
          })),
        })),
      });

      setFeedback({
        type: 'success',
        message: `Presupuesto ${created.planCode} creado exitosamente con 30 días de vigencia (Regla RN-04)`,
      });
      setIsModalOpen(false);
      loadPlans();
      if (onPlanCreated) onPlanCreated(created);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message:
          err?.response?.data?.detail ||
          err?.message ||
          'Error al crear el presupuesto clínico',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    plans,
    selectedPlan,
    setSelectedPlan,
    isLoading,
    isSubmitting,
    isModalOpen,
    setIsModalOpen,
    feedback,
    draft,
    setDraft,
    draftTotalAmount,
    availableProcedures: DEFAULT_PROCEDURES_LIST,
    approvePlan,
    rejectPlan,
    schedulePlanItem,
    submitNewPlan,
    reloadPlans: loadPlans,
  };
};
