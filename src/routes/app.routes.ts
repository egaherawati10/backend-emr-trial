// import { Module } from '@nestjs/common';
// import { RouterModule } from '@nestjs/core';

// // Patients (collection + items)
// import { PatientsModule } from 'src/patients/patients.module';

// // Medical records (split: patient-scoped collection vs canonical items)
// import { MedicalRecordsCollectionModule } from 'src/medical-records/medical-records.collection.module';
// import { MedicalRecordsItemsModule } from 'src/medical-records/medical-records.items.module';

// // Records (SOAP) (split: MR-scoped collection vs canonical items)
// import { RecordsCollectionModule } from 'src/records/records.collection.module';
// import { RecordsItemsModule } from 'src/records/records.items.module';

// // Prescriptions (split: MR-scoped collection vs canonical items)
// import { PrescriptionsCollectionModule } from 'src/prescriptions/prescriptions.collection.module';
// import { PrescriptionsItemsModule } from 'src/prescriptions/prescriptions.items.module';

// // Prescription items (split: Rx-scoped collection vs canonical items)
// import { PrescriptionItemsCollectionModule } from 'src/prescriptions/items/prescription-items.collection.module';
// import { PrescriptionItemsItemsModule } from 'src/prescriptions/items/prescription-items.items.module';

// // Patient hub (patient-scoped Services & Payments lists)
// import { PatientHubModule } from 'src/patient-hub/patient-hub.module';

// // Optional: canonical items modules for services/payments and catalogs
// // (only include if you have them split this way)
// import { ServicesItemsModule } from 'src/services/services.items.module';
// import { PaymentsItemsModule } from 'src/payments/payments.items.module';
// import { ServiceItemsModule } from 'src/service-items/service-items.module';
// import { MedicinesModule } from 'src/medicines/medicines.module';
// import { UsersModule } from 'src/users/users.module';

// @Module({
//   imports: [
//     RouterModule.register([
//       // ============ Patients ============
//       { path: 'patients', module: PatientsModule },

//       // Patient-scoped collections (Hub)
//       // Controllers inside PatientHubModule should be @Controller('services') and @Controller('payments'),
//       // because the base "patients/:patientId" is provided here.
//       {
//         path: 'patients/:patientId',
//         children: [
//           { path: 'services', module: PatientHubModule },
//           { path: 'payments', module: PatientHubModule },
//           { path: 'medical-records', module: MedicalRecordsCollectionModule },
//         ],
//       },

//       // ============ Medical Records ============
//       // Canonical item routes for medical records
//       { path: 'medical-records', module: MedicalRecordsItemsModule },

//       // ============ Records (SOAP) ============
//       // Collection under a specific medical record
//       { path: 'medical-records/:medicalRecordId/records', module: RecordsCollectionModule },
//       // Canonical items
//       { path: 'records', module: RecordsItemsModule },

//       // ============ Prescriptions ============
//       // Collection under a specific medical record
//       { path: 'medical-records/:medicalRecordId/prescriptions', module: PrescriptionsCollectionModule },
//       // Canonical items
//       { path: 'prescriptions', module: PrescriptionsItemsModule },

//       // ============ Prescription Items ============
//       // Collection under a specific prescription
//       { path: 'prescriptions/:prescriptionId/items', module: PrescriptionItemsCollectionModule },
//       // Canonical items
//       { path: 'prescription-items', module: PrescriptionItemsItemsModule },

//       // ============ Optional canonical modules ============
//       { path: 'services', module: ServicesItemsModule },          // if you have a /services items module
//       { path: 'payments', module: PaymentsItemsModule },          // if you have a /payments items module
//       { path: 'service-items', module: ServiceItemsModule },      // service catalog
//       { path: 'medicines', module: MedicinesModule },             // medicine catalog
//       { path: 'users', module: UsersModule },                     // users management
//     ]),
//   ],
//   exports: [RouterModule],
// })
// export class AppRoutesModule {}