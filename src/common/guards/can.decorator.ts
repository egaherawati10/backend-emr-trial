import { SetMetadata } from '@nestjs/common';
import { Action, Resource } from '../auth/capabilities';

export type AnyResource = Resource | 'User';
export const CAN_KEY = 'can';

export const Can = (resource: AnyResource, action: Action) =>
  SetMetadata(CAN_KEY, { resource, action });