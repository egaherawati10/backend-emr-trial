import { Injectable } from '@nestjs/common';
import { CreateServiceItemDto } from './dto/create-service-item.dto';
import { UpdateServiceItemDto } from './dto/update-service-item.dto';

@Injectable()
export class ServiceItemsService {
  create(createServiceItemDto: CreateServiceItemDto) {
    return 'This action adds a new serviceItem';
  }

  findAll() {
    return `This action returns all serviceItems`;
  }

  findOne(id: number) {
    return `This action returns a #${id} serviceItem`;
  }

  update(id: number, updateServiceItemDto: UpdateServiceItemDto) {
    return `This action updates a #${id} serviceItem`;
  }

  remove(id: number) {
    return `This action removes a #${id} serviceItem`;
  }
}
