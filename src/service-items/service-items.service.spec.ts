import { Test, TestingModule } from '@nestjs/testing';
import { ServiceItemsService } from './service-items.service';

describe('ServiceItemsService', () => {
  let service: ServiceItemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServiceItemsService],
    }).compile();

    service = module.get<ServiceItemsService>(ServiceItemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
