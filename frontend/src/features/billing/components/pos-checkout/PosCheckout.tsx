import React from 'react';
import { MaterialIcon } from '../../../../components/icons/MaterialIcon';
import { usePosCheckout } from './usePosCheckout';
import { PosCheckoutProps } from './PosCheckout.types';
import styles from './PosCheckout.module.css';

export const PosCheckout: React.FC<PosCheckoutProps> = ({ initialPatientId }) => {
  const {
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
  } = usePosCheckout(initialPatientId);

  return (
    <div className={styles.container}>
      {/* Barra superior */}
      <div className={styles.topBar}>
        <div className={styles.titleArea}>
          <MaterialIcon name="receipt_long" className={styles.titleIcon} />
          <div>
            <h1 className={styles.title}>Punto de Venta Clínico (POS)</h1>
            <p className={styles.subtitle}>
              Facturación electrónica con soporte para pagos mixtos y control de turno
            </p>
          </div>
        </div>
      </div>

      {!hasOpenShift && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-lg flex items-center gap-3">
          <MaterialIcon name="warning" className="text-amber-600 text-xl" />
          <div>
            <strong>Caja Cerrada:</strong> No tiene un turno de cobro abierto. Debe dirigirse al módulo de{' '}
            <a href="/billing/cash-register" className="underline font-bold">
              Arqueo de Caja
            </a>{' '}
            para iniciar su turno con fondo fijo antes de emitir comprobantes.
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-center gap-2">
          <MaterialIcon name="error" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleCheckout} className={styles.layoutGrid}>
        {/* Columna Izquierda: Paciente e Ítems a facturar */}
        <div className="flex flex-col gap-6">
          {/* Card Paciente & Comprobante */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>
              <MaterialIcon name="person" />
              <span>Datos del Comprobante y Paciente</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="patientSelect">
                  Paciente Titular <span className={styles.required}>*</span>
                </label>
                <select
                  id="patientSelect"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className={styles.select}
                  required
                >
                  <option value="">-- Seleccionar Paciente --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.lastName}, {p.firstName} (DNI/Doc: {p.documentNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="invoiceType">
                  Tipo de Comprobante <span className={styles.required}>*</span>
                </label>
                <select
                  id="invoiceType"
                  value={invoiceType}
                  onChange={(e) => setInvoiceType(e.target.value as any)}
                  className={styles.select}
                >
                  <option value="FACTURA">Factura con Valor Tributario</option>
                  <option value="BOLETA">Boleta de Venta / Consumidor Final</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card Detalle de Procedimientos / Ítems */}
          <div className={styles.card}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <MaterialIcon name="dentistry" />
                <span>Procedimientos e Insumos Facturados</span>
              </div>
              <button
                type="button"
                className={styles.btnAddItem}
                onClick={handleAddItem}
                data-testid="btn-add-item"
              >
                <MaterialIcon name="add" />
                <span>Agregar Ítem</span>
              </button>
            </div>

            <table className={styles.itemsTable}>
              <thead>
                <tr>
                  <th className={styles.th}>Descripción</th>
                  <th className={`${styles.th} w-20`}>Cant.</th>
                  <th className={`${styles.th} w-28`}>P. Unit ($)</th>
                  <th className={`${styles.th} w-28`}>Total ($)</th>
                  <th className={`${styles.th} w-10`}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const lineTotal = item.quantity * item.unitPrice;
                  return (
                    <tr key={idx}>
                      <td className={styles.td}>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          className={styles.input}
                          required
                        />
                      </td>
                      <td className={styles.td}>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(idx, 'quantity', parseInt(e.target.value) || 1)
                          }
                          className={styles.input}
                          required
                        />
                      </td>
                      <td className={styles.td}>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)
                          }
                          className={styles.input}
                          required
                        />
                      </td>
                      <td className={`${styles.td} font-bold text-slate-700`}>
                        ${lineTotal.toFixed(2)}
                      </td>
                      <td className={styles.td}>
                        {items.length > 1 && (
                          <button
                            type="button"
                            className={styles.btnRemoveItem}
                            onClick={() => handleRemoveItem(idx)}
                            aria-label="Eliminar ítem"
                          >
                            <MaterialIcon name="delete" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Columna Derecha: Desglose de Pagos Mixtos y Liquidación */}
        <div className="flex flex-col gap-6">
          <div className={styles.card}>
            <div className={styles.cardTitle}>
              <MaterialIcon name="payments" />
              <span>Desglose de Pagos Mixtos</span>
            </div>

            {/* Resumen de Valores */}
            <div className={styles.totalsSection}>
              <div className={styles.totalRow}>
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className={styles.totalRow}>
                <span>IVA (0% Servicios Médicos):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className={styles.totalRowBig}>
                <span>Total a Cobrar:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Lista de formas de pago registradas */}
            <div className={styles.paymentsList}>
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
                <span>Formas de Pago Aplicadas</span>
                <button
                  type="button"
                  onClick={handleFillExactCash}
                  className="text-sky-600 hover:underline cursor-pointer"
                >
                  Cobro Exacto en Efectivo
                </button>
              </div>

              {payments.map((p, idx) => (
                <div key={idx} className={styles.paymentCard}>
                  <div className="flex items-center gap-2">
                    <MaterialIcon
                      name={
                        p.paymentMethod === 'EFECTIVO'
                          ? 'attach_money'
                          : p.paymentMethod === 'TARJETA'
                          ? 'credit_card'
                          : 'account_balance'
                      }
                      className="text-slate-600"
                    />
                    <div>
                      <span className="font-semibold text-slate-800 text-sm">
                        {p.paymentMethod}
                      </span>
                      {p.voucherReference && (
                        <span className="block text-xs text-slate-500">
                          Ref: {p.voucherReference}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">${p.amount.toFixed(2)}</span>
                    {payments.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePayment(idx)}
                        className="text-red-500 hover:text-red-700"
                        aria-label="Quitar pago"
                      >
                        <MaterialIcon name="close" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Agregar forma de pago adicional */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col gap-2">
              <span className="text-xs font-semibold text-slate-600">
                Añadir Pago Mixto Adicional:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newPaymentMethod}
                  onChange={(e) => setNewPaymentMethod(e.target.value as any)}
                  className={styles.select}
                >
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TARJETA">Tarjeta Déb./Créd.</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                </select>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newPaymentAmount}
                  onChange={(e) => setNewPaymentAmount(e.target.value)}
                  placeholder="Monto ($)"
                  className={styles.input}
                />
              </div>
              {newPaymentMethod !== 'EFECTIVO' && (
                <input
                  type="text"
                  value={newPaymentVoucher}
                  onChange={(e) => setNewPaymentVoucher(e.target.value)}
                  placeholder="N° Comprobante / Voucher / Lote"
                  className={styles.input}
                />
              )}
              <button
                type="button"
                onClick={handleAddPayment}
                className="py-1.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded transition"
              >
                + Registrar Medio de Pago
              </button>
            </div>

            {/* Diferencia o Cuadre */}
            <div
              className={`${styles.paymentDiffBox} ${
                Math.abs(pendingAmount) <= 0.01 ? styles.diffBalanced : styles.diffPending
              }`}
            >
              <span>{Math.abs(pendingAmount) <= 0.01 ? 'Pagos Cuadrados:' : 'Pendiente / Saldo:'}</span>
              <span>
                {Math.abs(pendingAmount) <= 0.01 ? '$0.00 (Listo)' : `$${pendingAmount.toFixed(2)}`}
              </span>
            </div>

            {/* Botón de Emisión: Se oculta si canWrite = false */}
            {canWrite && (
              <button
                type="submit"
                className={styles.btnCheckout}
                disabled={
                  isSubmitting ||
                  !hasOpenShift ||
                  Math.abs(pendingAmount) > 0.01 ||
                  total <= 0
                }
                data-testid="btn-emit-invoice"
              >
                <MaterialIcon name={isSubmitting ? 'sync' : 'point_of_sale'} />
                <span>{isSubmitting ? 'Emitiendo Factura...' : `Cobrar e Imprimir ($${total.toFixed(2)})`}</span>
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Modal de Factura Emitida con Éxito */}
      {issuedInvoice && (
        <div className={styles.receiptModalOverlay} role="dialog" aria-modal="true">
          <div className={styles.receiptCard}>
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-green-600 font-bold">
                <MaterialIcon name="verified" className="text-2xl" />
                <span>¡Comprobante Emitido con Éxito!</span>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-slate-400 hover:text-slate-600"
              >
                <MaterialIcon name="close" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg font-mono text-xs text-slate-700 flex flex-col gap-1 border border-slate-200">
              <div className="text-center font-bold text-sm">SIGO-DENTAL CLÍNICA</div>
              <div className="text-center text-slate-500">RUC: 1792345678001</div>
              <div className="border-b border-dashed my-2"></div>
              <div>SERIE: {issuedInvoice.seriesNumber}</div>
              <div>TIPO: {issuedInvoice.invoiceType}</div>
              <div>FECHA: {new Date(issuedInvoice.createdAt).toLocaleString()}</div>
              <div>
                PACIENTE: {issuedInvoice.patient.lastName}, {issuedInvoice.patient.firstName}
              </div>
              <div>DOC: {issuedInvoice.patient.documentNumber}</div>
              <div className="border-b border-dashed my-2"></div>
              <div className="flex justify-between font-bold text-sm">
                <span>TOTAL:</span>
                <span>${Number(issuedInvoice.total).toFixed(2)}</span>
              </div>
              <div className="border-b border-dashed my-2"></div>
              <div className="font-semibold">PAGOS:</div>
              {issuedInvoice.paymentDetails.map((pd, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span>- {pd.paymentMethod}:</span>
                  <span>${Number(pd.amount).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold flex items-center gap-1.5"
              >
                <MaterialIcon name="print" />
                <span>Imprimir Ticket</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5"
              >
                <MaterialIcon name="add" />
                <span>Nueva Venta</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

