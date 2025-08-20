import { Test, TestingModule } from '@nestjs/testing';
import { PatientsService } from './patients.service';
import { PatientsRepository } from './patients.repository';
import { PatientProfile, Gender, UserRole } from '@prisma/client';
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { CreatePatientDto } from './dto/create-patient.dto';

const mockRepo = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  findByUserId: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('PatientsService', () => {
  let service: PatientsService;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientsService,
        { provide: PatientsRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<PatientsService>(PatientsService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('returns patients', async () => {
      mockRepo.findAll.mockResolvedValue([basePatient]);
      const res = await service.findAll();
      expect(res).toHaveLength(1);
    });

    it('maps repo errors to BadRequest', async () => {
      mockRepo.findAll.mockRejectedValue(new Error('db down'));
      await expect(service.findAll()).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('allows patient to view own profile', async () => {
      mockRepo.findOne.mockResolvedValue(basePatient);
      const result = await service.findOne(1, 1, UserRole.patient);
      expect(result.id).toBe(1);
      expect(mockRepo.findOne).toHaveBeenCalledWith(1);
    });

    it('forbids patient viewing someone else', async () => {
      mockRepo.findOne.mockResolvedValue({ ...basePatient, userId: 99 });
      await expect(service.findOne(1, 1, UserRole.patient)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws NotFound when missing', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(9, 1, UserRole.admin)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('maps repo error to BadRequest', async () => {
      mockRepo.findOne.mockRejectedValue(new Error('db error'));
      await expect(service.findOne(1, 1, UserRole.admin)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('create', () => {
    it('stamps clerkId automatically (registration_clerk)', async () => {
      const dto: CreatePatientDto = {
        userId: 5,
        dob: '1995-05-05',
        gender: Gender.female,
        address: 'Address',
        phone: '080000000',
      };
      mockRepo.create.mockImplementation(async (payload: CreatePatientDto) => {
        // ensure clerkId came from requester
        expect(payload.clerkId).toBe(42);
        return { ...basePatient, id: 2, userId: 5, clerkId: 42 };
      });

      const created = await service.create(dto, 42, UserRole.registration_clerk);
      expect(created.id).toBe(2);
      expect(mockRepo.create).toHaveBeenCalled();
    });

    it('forbids non-admin/clerk', async () => {
      const dto: CreatePatientDto = {
        userId: 7,
        dob: '1990-01-01',
        gender: Gender.male,
        address: 'X',
        phone: 'Y',
      };
      await expect(service.create(dto, 7, UserRole.patient)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it('maps prisma unique violation to ConflictException', async () => {
      const dto: CreatePatientDto = {
        userId: 1,
        dob: '1990-01-01',
        gender: Gender.male,
        address: 'X',
        phone: 'Y',
      };
      // simulate P2002
      const err: any = new Error();
      err.code = 'P2002';
      mockRepo.create.mockRejectedValue(err);

      await expect(service.create(dto, 2, UserRole.admin)).rejects.toThrow(ConflictException);
    });

    it('maps unknown error to BadRequest', async () => {
      const dto: CreatePatientDto = {
        userId: 2,
        dob: '1990-01-01',
        gender: Gender.male,
        address: 'X',
        phone: 'Y',
      };
      mockRepo.create.mockRejectedValue(new Error('db error'));
      await expect(service.create(dto, 2, UserRole.admin)).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('allows admin to update', async () => {
      mockRepo.findOne.mockResolvedValue(basePatient);
      mockRepo.update.mockResolvedValue({ ...basePatient, address: 'New' });

      const dto: UpdatePatientDto = { address: 'New' };
      const result = await service.update(1, dto, 10, UserRole.admin);

      expect(result.address).toBe('New');
      expect(mockRepo.update).toHaveBeenCalledWith(1, dto);
    });

    it('allows registration_clerk to update', async () => {
      mockRepo.findOne.mockResolvedValue(basePatient);
      mockRepo.update.mockResolvedValue({ ...basePatient, phone: '0812' });

      const dto: UpdatePatientDto = { phone: '0812' };
      const result = await service.update(1, dto, 20, UserRole.registration_clerk);

      expect(result.phone).toBe('0812');
      expect(mockRepo.update).toHaveBeenCalledWith(1, dto);
    });

    it('forbids patient to update', async () => {
      mockRepo.findOne.mockResolvedValue(basePatient);
      const dto: UpdatePatientDto = { address: 'Hacker' };
      await expect(service.update(1, dto, 1, UserRole.patient)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('throws NotFound when missing', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.update(9, {}, 1, UserRole.admin)).rejects.toThrow(NotFoundException);
    });

    it('maps unknown repo error to BadRequest', async () => {
      mockRepo.findOne.mockResolvedValue(basePatient);
      mockRepo.update.mockRejectedValue(new Error('db error'));
      await expect(service.update(1, {}, 1, UserRole.admin)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('allows admin to delete', async () => {
      mockRepo.findOne.mockResolvedValue(basePatient);
      mockRepo.delete.mockResolvedValue(basePatient);

      await service.remove(1, 10, UserRole.admin);
      expect(mockRepo.delete).toHaveBeenCalledWith(1);
    });

    it('allows registration_clerk to delete', async () => {
      mockRepo.findOne.mockResolvedValue(basePatient);
      mockRepo.delete.mockResolvedValue(basePatient);

      await service.remove(1, 20, UserRole.registration_clerk);
      expect(mockRepo.delete).toHaveBeenCalledWith(1);
    });

    it('forbids other roles to delete', async () => {
      mockRepo.findOne.mockResolvedValue(basePatient);

      await expect(service.remove(1, 1, UserRole.patient)).rejects.toThrow(ForbiddenException);
      await expect(service.remove(1, 2, UserRole.doctor)).rejects.toThrow(ForbiddenException);
      await expect(service.remove(1, 3, UserRole.pharmacist)).rejects.toThrow(ForbiddenException);
      await expect(service.remove(1, 4, UserRole.cashier)).rejects.toThrow(ForbiddenException);

      expect(mockRepo.delete).not.toHaveBeenCalled();
    });

    it('throws NotFound if missing', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.remove(99, 10, UserRole.admin)).rejects.toThrow(NotFoundException);
    });

    it('maps unknown repo error to BadRequest', async () => {
      mockRepo.findOne.mockResolvedValue(basePatient);
      mockRepo.delete.mockRejectedValue(new Error('db error'));
      await expect(service.remove(1, 10, UserRole.admin)).rejects.toThrow(BadRequestException);
    });
  });
});