import { IsIn } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsIn(['CONFIRMED', 'CANCELED', 'FULFILLED'])
  status: 'CONFIRMED' | 'CANCELED' | 'FULFILLED';
}
