import type { AccountOperation } from '../interfaces/collection-account.interface';
export const ACCOUNT_OPERATIONS: { label: string; value: AccountOperation }[] = [
  { label: 'Registrar pago manual de la siguiente cuota', value: 'MANUAL_INSTALLMENT' },
  { label: 'Registrar abono individual recibido', value: 'RECORD_DEPOSIT' },
  { label: 'Descontar saldo de cuotas seleccionadas', value: 'DISCOUNT' },
  { label: 'Aplicar fondos en revisión a cuotas completas', value: 'ALLOCATE_UNAPPLIED' },
  { label: 'Aprobar devolución por baja', value: 'APPROVE_WITHDRAWAL_REFUND' },
  { label: 'Aprobar devolución de fondos no aplicados', value: 'APPROVE_UNAPPLIED_REFUND' },
  { label: 'Registrar devolución efectuada en banco', value: 'CONFIRM_REFUND' },
  { label: 'Cerrar revisión con devoluciones pagadas', value: 'RESOLVE_REFUNDED_REVIEW' },
];
