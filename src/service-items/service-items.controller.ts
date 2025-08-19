import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ServiceItemsService } from './service-items.service';
import { CreateServiceItemDto } from './dto/create-service-item.dto';
import { UpdateServiceItemDto } from './dto/update-service-item.dto';

@Controller('service-items')
export class ServiceItemsController {
  constructor(private readonly serviceItemsService: ServiceItemsService) {}

  @Post()
  create(@Body() createServiceItemDto: CreateServiceItemDto) {
    return this.serviceItemsService.create(createServiceItemDto);
  }

  @Get()
  findAll() {
    return this.serviceItemsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceItemsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateServiceItemDto: UpdateServiceItemDto) {
    return this.serviceItemsService.update(+id, updateServiceItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.serviceItemsService.remove(+id);
  }
}
