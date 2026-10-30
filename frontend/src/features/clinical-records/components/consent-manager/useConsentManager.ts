import { useState, useEffect, useCallback } from 'react';
import {
  InformedConsent,
  CONSENT_TEMPLATES,
  CreateConsentPayload,
  SignConsentPayload,
} from '../../types/consent-prescription.types';
import { NewConsentModalState, SigningModalState } from './ConsentManager.types';
import { clinicalRecordsApi } from '../../services/clinicalRecordsApi';

export const useConsentManager = (
  patientId?: string,
  onConsentSigned?: (consent: InformedConsent) => void,
) => {
  const [consents, setConsents] = useState<InformedConsent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [newModal, setNewModal] = useState<NewConsentModalState>({
    isOpen: false,
    procedureName: '',
    risksDescription: '',
    templateKey: 'EXODONCIA',
  });

  const [signModal, setSignModal] = useState<SigningModalState>({
    isOpen: false,
    consent: null,
    signatureData: null,
  });

  const loadConsents = useCallback(async () => {
    if (!patientId) return;
    try {
      setIsLoading(true);
      const res = await clinicalRecordsApi.getConsents(patientId);
      setConsents(res.consents || []);
    } catch (err: any) {
      console.warn('Error al cargar consentimientos informados:', err);
    } finally {
      setIsLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadConsents();
  }, [loadConsents]);

  const selectTemplate = (key: string) => {
    const tpl = CONSENT_TEMPLATES[key];
    if (tpl) {
      setNewModal((prev) => ({
        ...prev,
        templateKey: key,
        procedureName: tpl.procedureName,
        risksDescription: tpl.risksDescription,
      }));
    }
  };

  const openNewConsentModal = () => {
    const defaultTpl = CONSENT_TEMPLATES['EXODONCIA'];
    setNewModal({
      isOpen: true,
      templateKey: 'EXODONCIA',
      procedureName: defaultTpl.procedureName,
      risksDescription: defaultTpl.risksDescription,
    });
  };

  const closeNewConsentModal = () => {
    setNewModal((prev) => ({ ...prev, isOpen: false }));
  };

  const submitNewConsent = async () => {
    if (!patientId) {
      setFeedback({ type: 'error', message: 'Paciente no identificado.' });
      return;
    }

    if (!newModal.procedureName.trim() || !newModal.risksDescription.trim()) {
      setFeedback({ type: 'error', message: 'Debe especificar el procedimiento y sus riesgos.' });
      return;
    }

    try {
      setIsSubmitting(true);
      setFeedback(null);
      const payload: CreateConsentPayload = {
        procedureName: newModal.procedureName,
        risksDescription: newModal.risksDescription,
        templateKey: newModal.templateKey,
      };
      await clinicalRecordsApi.createConsent(patientId, payload);
      setFeedback({
        type: 'success',
        message: 'Consentimiento informado generado exitosamente. Pendiente de firma.',
      });
      closeNewConsentModal();
      await loadConsents();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.detail || err.message || 'Error al crear el consentimiento',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openSignModal = (consent: InformedConsent) => {
    setSignModal({
      isOpen: true,
      consent,
      signatureData: null,
      otpCode: '',
    });
  };

  const closeSignModal = () => {
    setSignModal({ isOpen: false, consent: null, signatureData: null });
  };

  const handleSignatureChange = (dataUrl: string | null) => {
    setSignModal((prev) => ({ ...prev, signatureData: dataUrl }));
  };

  const submitSignature = async () => {
    if (!signModal.consent) return;
    if (!signModal.signatureData) {
      setFeedback({
        type: 'error',
        message: 'Debe capturar el trazo de la firma biométrica en el lienzo.',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setFeedback(null);
      const payload: SignConsentPayload = {
        signatureData: signModal.signatureData,
        otpCode: signModal.otpCode,
      };
      const signed = await clinicalRecordsApi.signConsent(signModal.consent.id, payload);
      setFeedback({
        type: 'success',
        message: `Consentimiento firmado exitosamente con Hash SHA-256: ${signed.documentHash?.substring(0, 16)}...`,
      });
      closeSignModal();
      if (onConsentSigned) {
        onConsentSigned(signed);
      }
      await loadConsents();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.detail || err.message || 'Error al firmar el consentimiento',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    consents,
    isLoading,
    isSubmitting,
    feedback,
    newModal,
    setNewModal,
    signModal,
    setSignModal,
    selectTemplate,
    openNewConsentModal,
    closeNewConsentModal,
    submitNewConsent,
    openSignModal,
    closeSignModal,
    handleSignatureChange,
    submitSignature,
    reload: loadConsents,
  };
};

