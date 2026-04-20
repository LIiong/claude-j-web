import type {
  OrderListResponseDTO,
  OrderResponseDTO,
  SingleOrderResponseDTO,
} from '@/shared/api/dto/order';
import { describe, expect, it } from 'vitest';
import {
  toOrderEntitiesFromListResponse,
  toOrderEntity,
  toOrderEntityFromResponse,
} from './orderMappers';

describe('orderMappers', () => {
  describe('toOrderEntity', () => {
    it('should_map_order_dto_to_entity_when_valid_input', () => {
      const dto: OrderResponseDTO = {
        orderId: 'order-1',
        customerId: 'user-1',
        status: 'PENDING_PAYMENT',
        totalAmount: 250,
        currency: 'CNY',
        items: [
          {
            productId: 'prod-1',
            productName: 'Product A',
            quantity: 2,
            unitPrice: 100,
            subtotal: 200,
          },
        ],
        createTime: '2025-04-19T10:00:00Z',
        updateTime: '2025-04-19T10:30:00Z',
      };

      const entity = toOrderEntity(dto);

      expect(entity.orderId).toBe('order-1');
      expect(entity.customerId).toBe('user-1');
      expect(entity.status).toBe('PENDING_PAYMENT');
      expect(entity.totalAmount).toBe(250);
      expect(entity.items.length).toBe(1);
    });

    it('should_parse_datetime_strings_to_dates_when_mapping', () => {
      const dto: OrderResponseDTO = {
        orderId: 'order-1',
        customerId: 'user-1',
        status: 'PAID',
        totalAmount: 100,
        currency: 'CNY',
        items: [],
        createTime: '2025-04-19T10:00:00Z',
        updateTime: '2025-04-19T10:30:00Z',
      };

      const entity = toOrderEntity(dto);

      expect(entity.createTime).toBeInstanceOf(Date);
      expect(entity.updateTime).toBeInstanceOf(Date);
    });

    it('should_throw_error_when_invalid_status_provided', () => {
      const dto = {
        orderId: 'order-1',
        customerId: 'user-1',
        status: 'INVALID_STATUS',
        totalAmount: 100,
        currency: 'CNY',
        items: [],
        createTime: '2025-04-19T10:00:00Z',
        updateTime: '2025-04-19T10:30:00Z',
      };

      expect(() => toOrderEntity(dto as OrderResponseDTO)).toThrow(
        'Invalid order status: INVALID_STATUS',
      );
    });
  });

  describe('toOrderEntitiesFromListResponse', () => {
    it('should_return_entities_array_when_response_success', () => {
      const response: OrderListResponseDTO = {
        success: true,
        data: [
          {
            orderId: 'order-1',
            customerId: 'user-1',
            status: 'PENDING_PAYMENT',
            totalAmount: 100,
            currency: 'CNY',
            items: [],
            createTime: '2025-04-19T10:00:00Z',
            updateTime: '2025-04-19T10:30:00Z',
          },
          {
            orderId: 'order-2',
            customerId: 'user-1',
            status: 'PAID',
            totalAmount: 200,
            currency: 'CNY',
            items: [],
            createTime: '2025-04-19T11:00:00Z',
            updateTime: '2025-04-19T11:30:00Z',
          },
        ],
      };

      const entities = toOrderEntitiesFromListResponse(response);

      expect(entities.length).toBe(2);
      expect(entities[0]?.orderId).toBe('order-1');
      expect(entities[1]?.orderId).toBe('order-2');
    });

    it('should_return_empty_array_when_response_not_success', () => {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const response = {
        success: false,
        data: null,
        errorCode: 'ERROR',
        message: 'Failed',
      } as unknown as OrderListResponseDTO;

      const entities = toOrderEntitiesFromListResponse(response);

      expect(entities).toEqual([]);
    });
  });

  describe('toOrderEntityFromResponse', () => {
    it('should_return_entity_when_response_success_with_data', () => {
      const response: SingleOrderResponseDTO = {
        success: true,
        data: {
          orderId: 'order-1',
          customerId: 'user-1',
          status: 'PENDING_PAYMENT',
          totalAmount: 100,
          currency: 'CNY',
          items: [],
          createTime: '2025-04-19T10:00:00Z',
          updateTime: '2025-04-19T10:30:00Z',
        },
      };

      const entity = toOrderEntityFromResponse(response);

      expect(entity).not.toBeNull();
      expect(entity?.orderId).toBe('order-1');
    });

    it('should_return_null_when_response_not_success', () => {
      const response: SingleOrderResponseDTO = {
        success: false,
        data: null,
        errorCode: 'ERROR',
        message: 'Failed',
      };

      const entity = toOrderEntityFromResponse(response);

      expect(entity).toBeNull();
    });
  });
});
