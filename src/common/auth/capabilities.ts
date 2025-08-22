// src/common/auth/capabilities.ts

export type Role =
  | 'admin'
  | 'doctor'
  | 'pharmacist'
  | 'cashier'
  | 'patient'
  | 'registration_clerk';

export type Resource =
  | 'Patient'               // src/patients/*
  | 'MedicalRecord'         // src/medical-records/*
  | 'Record'                // Prisma model "Record" (SOAP notes)
  | 'Prescription'          // src/prescriptions/*
  | 'PrescriptionItem'      // src/prescriptions/items/*
  | 'Medicine'              // src/medicines/*
  | 'Service'               // src/services/*
  | 'ServiceOnServiceItem'  // src/services/items/*
  | 'ServiceItem'           // src/service-items/*
  | 'Payment'               // src/payments/*
  | 'PaymentItem';          // src/payments/items/*

export type Action = 'read' | 'create' | 'update' | 'delete';

// Avoid the TS utility type `Record<K,V>` to keep "Record" the resource name unambiguous.
type CapabilityMatrix = {
  [R in Role]: Partial<{ [Res in Resource]?: Action[] }>;
};

/**
 * One place to evolve policy.
 * Controllers annotate endpoints with:  @Can('Resource','action')
 * PolicyGuard checks this map against req.user.role.
 */
export const CAPABILITIES = {
  admin: {
    Patient: ['read', 'create', 'update', 'delete'],
    MedicalRecord: ['read', 'create', 'update', 'delete'],
    Record: ['read', 'create', 'update', 'delete'],
    Prescription: ['read', 'create', 'update', 'delete'],
    PrescriptionItem: ['read', 'create', 'update', 'delete'],
    Medicine: ['read', 'create', 'update', 'delete'],
    Service: ['read', 'create', 'update', 'delete'],
    ServiceOnServiceItem: ['read', 'create', 'update', 'delete'],
    ServiceItem: ['read', 'create', 'update', 'delete'],
    Payment: ['read', 'create', 'update', 'delete'],
    PaymentItem: ['read', 'create', 'update', 'delete'],
  },

  doctor: {
    Patient: ['read'],
    MedicalRecord: ['read', 'update'],
    Record: ['read', 'create', 'update', 'delete'],
    Prescription: ['read', 'create', 'update', 'delete'],
    PrescriptionItem: ['read', 'create', 'update', 'delete'],
    Service: ['read', 'create', 'update', 'delete'],
    ServiceOnServiceItem: ['read', 'create', 'update', 'delete'],
    Medicine: ['read'],
    ServiceItem: ['read'],
    Payment: ['read', 'create', 'update'],
    PaymentItem: ['read', 'update'],
  },

  pharmacist: {
    Patient: ['read'],
    MedicalRecord: ['read'],
    Prescription: ['read', 'create', 'update', 'delete'],
    PrescriptionItem: ['read', 'create', 'update', 'delete'],
    Medicine: ['read', 'create', 'update', 'delete'],
    Payment: ['read'],
    PaymentItem: ['read'],
  },

  cashier: {
    Patient: ['read'],
    MedicalRecord: ['read'],
    Payment: ['read', 'create', 'update'],
    PaymentItem: ['read', 'create', 'update', 'delete'],
    Service: ['read', 'update'],
    ServiceItem: ['read'],
    ServiceOnServiceItem: ['read', 'create', 'update', 'delete'],
    Prescription: ['read', 'update'],
    PrescriptionItem: ['read', 'create', 'update', 'delete'],
    Medicine: ['read'],
  },

  registration_clerk: {
    Patient: ['read', 'create', 'update', 'delete'],
    MedicalRecord: ['read', 'create', 'update', 'delete'],
  },

  patient: {
    Patient: ['read'],
    MedicalRecord: ['read'],  // their own
    Prescription: ['read'],   // their own
    Service: ['read'],        // their own
    Payment: ['read'],        // their own
  },
} satisfies CapabilityMatrix;

// Optional helper for service-level checks or unit tests
export function canDo(role: Role, resource: Resource, action: Action): boolean {
  return (CAPABILITIES[role]?.[resource] ?? []).includes(action);
}