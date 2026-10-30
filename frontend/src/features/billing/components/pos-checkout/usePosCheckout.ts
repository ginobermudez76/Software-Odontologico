import { useState, useEffect } from 'react';
import { useCurrentOptionPermissions } from '../../../../hooks/useCurrentOptionPermissions';
import { useAuthStore } from '../../../../stores/authStore';
import { billingApi } from '../../services/billingApi';
import { patientsApi } from '../../../patients/services/patientsApi';
import { PatientListItem } from '../../../patients/types/patient.types';
import {
  Invoice,
  InvoiceItem,
  InvoiceType,
  PaymentMethod,
  PaymentSplit,
} from '../../types/billing.types';

export const usePosCheckout = (initialPatientId?: string) => {
  const { canWrite } = useCurrentOptionPermissions();
  const user = useAuthStore((state) => state.user);
  const branchId = user?.branchId || '00000000-0000-0000-0000-000000000001';

  const [patientId, setPatientId] = useState<string>(initialPatientId || '');
  const [invoiceType, setInvoiceType] = useState<InvoiceType>('FACTURA');
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [hasOpenShift, setHasOpenShift] = useState<boolean>(true);

  const [items, setItems] = useState<InvoiceItem[]>([
    { description: 'Consulta Odontológica y Diagnóstico', quantity: 1, unitPrice: 35.0 },
  ]);

  const [payments, setPayments] = useState<PaymentSplit[]>([
    { paymentMethod: 'EFECTIVO', amount: 35.0 },
  ]);

  const [newPaymentMethod, setNewPaymentMethod] = useState<PaymentMethod>('TARJETA');
  const [newPaymentAmount, setNewPaymentAmount] = useState<string>('0.00');
  const [newPaymentVoucher, setNewPaymentVoucher] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [issuedInvoice, setIssuedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    // Verificar si el cajero tiene turno abierto
    billingApi
      .getCurrentShift(branchId)
      .then((shift) => setHasOpenShift(!!shift))
      .catch(() => setHasOpenShift(false));

    // Cargar pacientes
    patientsApi
      .findAll('', 1, 100)
      .then((res) => {
        setPatients(res.data);
        if (!patientId && res.data.length > 0) {
          setPatientId(res.data[0].id);
        }
      })
      .catch(() => setPatients([]));
  }, [branchId, patientId]);

  // Cálculos de totales
  const subtotal = Number(
    items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0).toFixed(2),
  );
  const tax = 0.0;
  const total = Number((subtotal + tax).toFixed(2));

  const totalPaid = Number(
    payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2),
  );
  const pendingAmount = Number((total - totalPaid).toFixed(2));

  // Manejo de ítems
  const handleAddItem = () => {
    setItems((prev) => [...prev, { description: 'Procedimiento Dental', quantity: 1, unitPrice: 20.0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Manejo de pagos mixtos
  const handleAddPayment = () => {
    const amountNum = parseFloat(newPaymentAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    setPayments((prev) => [
      ...prev,
      {
        paymentMethod: newPaymentMethod,
        amount: amountNum,
        voucherReference: newPaymentVoucher || undefined,
      },
    ]);

    setNewPaymentAmount('0.00');
    setNewPaymentVoucher('');
  };

  const handleRemovePayment = (index: number) => {
    setPayments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFillExactCash = () => {
    setPayments([{ paymentMethod: 'EFECTIVO', amount: total }]);
  };

  // Envío de la factura
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!patientId) {
      setErrorMessage('Seleccione un paciente para emitir el comprobante.');
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Debe agregar al menos un ítem o procedimiento a facturar.');
      return;
    }

    if (Math.abs(pendingAmount) > 0.01) {
      setErrorMessage(
        `Los pagos ingresados ($${totalPaid.toFixed(2)}) deben coincidir exactamente con el total ($${total.toFixed(2)}).`,
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const invoice = await billingApi.createInvoice({
        patientId,
        invoiceType,
        items,
        paymentDetails: payments,
      });

      setIssuedInvoice(invoice);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.detail || 'Error al procesar la facturación.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIssuedInvoice(null);
    setItems([{ description: 'Consulta Odontológica y Diagnóstico', quantity: 1, unitPrice: 35.0 }]);
    setPayments([{ paymentMethod: 'EFECTIVO', amount: 35.0 }]);
  };

  return {
    patientId,
    setPatientId,
    invoiceType,
    setInvoiceType,
    patients,
    hasOpenShift,
    items,
    payments,
    subtotal,
    tax,
    total,
    totalPaid,
    pendingAmount,
    newPaymentMethod,
    setNewPaymentMethod,
    newPaymentAmount,
    setNewPaymentAmount,
    newPaymentVoucher,
    setNewPaymentVoucher,
    isSubmitting,
    errorMessage,
    issuedInvoice,
    canWrite,
    handleAddItem,
    handleRemoveItem,
    handleItemChange,
    handleAddPayment,
    handleRemovePayment,
    handleFillExactCash,
    handleCheckout,
    handleReset,
  };
};

