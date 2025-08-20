import { Medicine } from '@prisma/client';
import { QueryMedicineDto } from './dto/query-medicine.dto';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';

export interface IMedicinesService {
  list(query: QueryMedicineDto): Promise<{ data: Medicine[]; total: number; page: number; pageSize: number }>;
  getById(id: number): Promise<Medicine>;
  create(dto: CreateMedicineDto): Promise<Medicine>;
  update(id: number, dto: UpdateMedicineDto): Promise<Medicine>;
  remove(id: number): Promise<void>;
}