import { describe, expect, it } from 'vitest';
import { toCartEntity, toCartEntityFromResponse, toCartItemEntity } from './cartMappers';

describe('cartMappers', () => {
  describe('toCartItemEntity', () => {
    it('should_map_dto_to_entity_when_valid_input', () => {
      const dto = {
        productId: 'prod-1',
        productName: 'Test Product',
        unitPrice: 100,
        quantity: 2,
        subtotal: 200,
      };

      const entity = toCartItemEntity(dto);

      expect(entity.productId).toBe('prod-1');
      expect(entity.productName).toBe('Test Product');
      expect(entity.unitPrice).toBe(100);
      expect(entity.quantity).toBe(2);
      expect(entity.subtotal).toBe(200);
    });
  });

  describe('toCartEntity', () => {
    it('should_map_cart_dto_to_entity_when_valid_input', () => {
      const dto = {
        userId: 'user-1',
        items: [
          {
            productId: 'prod-1',
            productName: 'Product A',
            unitPrice: 100,
            quantity: 2,
            subtotal: 200,
          },
          {
            productId: 'prod-2',
            productName: 'Product B',
            unitPrice: 50,
            quantity: 1,
            subtotal: 50,
          },
        ],
        totalAmount: 250,
        currency: 'CNY',
        itemCount: 3,
        updateTime: '2025-04-19T10:00:00Z',
      };

      const entity = toCartEntity(dto);

      expect(entity.userId).toBe('user-1');
      expect(entity.items.length).toBe(2);
      expect(entity.totalAmount).toBe(250);
      expect(entity.currency).toBe('CNY');
      expect(entity.itemCount).toBe(3);
    });

    it('should_parse_datetime_string_to_date_when_mapping', () => {
      const dto = {
        userId: 'user-1',
        items: [],
        totalAmount: 0,
        currency: 'CNY',
        itemCount: 0,
        updateTime: '2025-04-19T10:00:00Z',
      };

      const entity = toCartEntity(dto);

      expect(entity.updateTime).toBeInstanceOf(Date);
      expect(entity.updateTime.toISOString()).toBe('2025-04-19T10:00:00.000Z');
    });
  });

  describe('toCartEntityFromResponse', () => {
    it('should_return_entity_when_response_success_with_data', () => {
      const response = {
        success: true,
        data: {
          userId: 'user-1',
          items: [],
          totalAmount: 0,
          currency: 'CNY',
          itemCount: 0,
          updateTime: '2025-04-19T10:00:00Z',
        },
      };

      const entity = toCartEntityFromResponse(response);

      expect(entity).not.toBeNull();
      expect(entity?.userId).toBe('user-1');
    });

    it('should_return_null_when_response_not_success', () => {
      const response = {
        success: false,
        data: null,
        errorCode: 'ERROR',
        message: 'Failed',
      };

      const entity = toCartEntityFromResponse(response);

      expect(entity).toBeNull();
    });

    it('should_return_null_when_data_is_null', () => {
      const response = {
        success: true,
        data: null,
      };

      const entity = toCartEntityFromResponse(response);

      expect(entity).toBeNull();
    });
  });
});
