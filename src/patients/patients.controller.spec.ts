// src/patients/patients.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { Gender, PatientProfile, UserRole } from '@prisma/client';

describe('PatientsController', () => {
  let controller: PatientsController;

  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const basePatient: PatientProfile = {
    id: 1,
    userId: 1,
    dob: new Date('1990-01-01'),
    gender: Gender.male,
    address: 'Jl. Sudirman',
    phone: '08123456789',
    clerkId: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const adminReq = { user: { id: 10, role: UserRole.admin } } as any;
  const clerkReq = { user: { id: 20, role: UserRole.registration_clerk } } as any;
  const patientReq = { user: { id: 1, role: UserRole.patient } } as any;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatientsController],
      providers: [
        { provide: PatientsService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<PatientsController>(PatientsController);
  });

  // get all patients
  describe('GET /patients', () => {
    it('returns list on success', async () => {
      mockService.findAll.mockResolvedValue([basePatient]);
      const res = await controller.findAll();
      expect(res).toEqual([basePatient]);
      expect(mockService.findAll).toHaveBeenCalled();
    });

    it('rethrows HttpException from service (e.g., BadRequest)', async () => {
      mockService.findAll.mockRejectedValue(new BadRequestException('boom'));
      await expect(controller.findAll()).rejects.toBeInstanceOf(BadRequestException);
    });

    it('wraps unknown error as 500', async () => {
      mockService.findAll.mockRejectedValue(new Error('db down'));
      await expect(controller.findAll()).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  // get specific patients by id
  describe('GET /patients/:id', () => {
    it('returns patient for admin', async () => {
      mockService.findOne.mockResolvedValue(basePatient);
      const res = await controller.findOne(1, adminReq);
      expect(res).toEqual(basePatient);
      expect(mockService.findOne).toHaveBeenCalledWith(1, 10, UserRole.admin);
    });

    it('returns own patient for patient role', async () => {
      mockService.findOne.mockResolvedValue(basePatient);
      const res = await controller.findOne(1, patientReq);
      expect(res).toEqual(basePatient);
      expect(mockService.findOne).toHaveBeenCalledWith(1, 1, UserRole.patient);
    });

    it('rethrows Forbidden from service', async () => {
      mockService.findOne.mockRejectedValue(new ForbiddenException('nope'));
      await expect(controller.findOne(1, patientReq)).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('rethrows NotFound from service', async () => {
      mockService.findOne.mockRejectedValue(new NotFoundException('missing'));
      await expect(controller.findOne(99, adminReq)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('wraps unknown error as 500', async () => {
      mockService.findOne.mockRejectedValue(new Error('weird'));
      await expect(controller.findOne(1, adminReq)).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  // create patient profile
  describe('POST /patients', () => {
    const dto: CreatePatientDto = {
      userId: 5,
      dob: '1995-05-05',
      gender: Gender.female,
      address: 'Address',
      phone: '080000000',
    };

    it('creates with admin and stamps clerkId automatically (service handles stamping)', async () => {
      mockService.create.mockResolvedValue({ ...basePatient, id: 2, userId: 5, clerkId: adminReq.user.id });
      const res = await controller.create(dto, adminReq);
      expect(res.id).toBe(2);
      expect(mockService.create).toHaveBeenCalledWith(dto, 10, UserRole.admin);
    });

    it('rethrows Forbidden from service', async () => {
      mockService.create.mockRejectedValue(new ForbiddenException());
      await expect(controller.create(dto, patientReq)).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('rethrows Conflict/BadRequest from service', async () => {
      mockService.create.mockRejectedValue(new BadRequestException('invalid'));
      await expect(controller.create(dto, adminReq)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('wraps unknown error as 500', async () => {
      mockService.create.mockRejectedValue(new Error('mystery'));
      await expect(controller.create(dto, adminReq)).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  // edit patient profile
  describe('PATCH /patients/:id', () => {
    const dto: UpdatePatientDto = { address: 'New Address' };

    it('updates with admin', async () => {
      mockService.update.mockResolvedValue({ ...basePatient, address: 'New Address' });
      const res = await controller.update(1, dto, adminReq);
      expect(res.address).toBe('New Address');
      expect(mockService.update).toHaveBeenCalledWith(1, dto, 10, UserRole.admin);
    });

    it('rethrows Forbidden from service', async () => {
      mockService.update.mockRejectedValue(new ForbiddenException('nope'));
      await expect(controller.update(1, dto, patientReq)).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('rethrows NotFound from service', async () => {
      mockService.update.mockRejectedValue(new NotFoundException());
      await expect(controller.update(99, dto, adminReq)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('wraps unknown error as 500', async () => {
      mockService.update.mockRejectedValue(new Error('unknown'));
      await expect(controller.update(1, dto, adminReq)).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  // remove patient profile
  describe('DELETE /patients/:id', () => {
    it('deletes with admin and returns message', async () => {
      mockService.remove.mockResolvedValue(undefined);
      const res = await controller.remove(1, adminReq);
      expect(res).toEqual({ message: 'Patient deleted' });
      expect(mockService.remove).toHaveBeenCalledWith(1, 10, UserRole.admin);
    });

    it('rethrows Forbidden from service', async () => {
      mockService.remove.mockRejectedValue(new ForbiddenException());
      await expect(controller.remove(1, patientReq)).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('rethrows NotFound from service', async () => {
      mockService.remove.mockRejectedValue(new NotFoundException());
      await expect(controller.remove(99, adminReq)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('wraps unknown error as 500', async () => {
      mockService.remove.mockRejectedValue(new Error('db explode'));
      await expect(controller.remove(1, adminReq)).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });
});