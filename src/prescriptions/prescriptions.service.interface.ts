import { Prescription, PrescriptionItem } from '@prisma/client';
import { QueryPrescriptionDto } from './dto/query-prescription.dto';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { CreatePrescriptionItemDto } from './items/dto/create-prescription-item.dto';
import { UpdatePrescriptionItemDto } from './items/dto/update-prescription-item.dto';

export type IncludeParam = string | string[] | boolean;

export interface IPrescriptionsService {
  list(query: QueryPrescriptionDto): Promise<{ data: Prescription[]; total: number; page: number; pageSize: number }>;
  getById(id: number, include?: IncludeParam): Promise<Prescription>;
  create(dto: CreatePrescriptionDto, include?: IncludeParam): Promise<Prescription>;
  update(id: number, dto: UpdatePrescriptionDto, include?: IncludeParam): Promise<Prescription>;
  remove(id: number): Promise<void>;

  addItem(prescriptionId: number, dto: CreatePrescriptionItemDto): Promise<PrescriptionItem>;
  updateItem(prescriptionId: number, itemId: number, dto: UpdatePrescriptionItemDto): Promise<PrescriptionItem>;
  removeItem(prescriptionId: number, itemId: number): Promise<void>;
}