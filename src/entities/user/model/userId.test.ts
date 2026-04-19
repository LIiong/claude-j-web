import { describe, expect, it } from 'vitest';
import { UserId } from './userId';

describe('UserId', () => {
  it('should_create_userId_when_valid_uuid', () => {
    const validUuid = '550e8400-e29b-41d4-a716-446655440000';
    const userId = UserId.create(validUuid);
    expect(userId.value).toBe(validUuid);
  });

  it('should_throw_when_invalid_uuid_format', () => {
    expect(() => UserId.create('invalid-uuid')).toThrow('Invalid UUID format');
  });

  it('should_throw_when_empty_string', () => {
    expect(() => UserId.create('')).toThrow('Invalid UUID format');
  });

  it('should_generate_new_unique_userId', () => {
    const userId1 = UserId.generate();
    const userId2 = UserId.generate();
    expect(userId1.value).not.toBe(userId2.value);
    expect(userId1.value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it('should_equal_when_values_match', () => {
    const id1 = UserId.create('550e8400-e29b-41d4-a716-446655440000');
    const id2 = UserId.create('550e8400-e29b-41d4-a716-446655440000');
    expect(id1.equals(id2)).toBe(true);
  });

  it('should_not_equal_when_values_differ', () => {
    const id1 = UserId.create('550e8400-e29b-41d4-a716-446655440000');
    const id2 = UserId.create('660e8400-e29b-41d4-a716-446655440001');
    expect(id1.equals(id2)).toBe(false);
  });
});
