import { describe, expect, it } from 'vitest';
import { Email } from './email';
import { User, type UserStatus } from './user';
import { UserId } from './userId';

describe('User', () => {
  it('should_create_user_when_props_valid', () => {
    const user = User.create({
      id: UserId.create('550e8400-e29b-41d4-a716-446655440000'),
      email: Email.create('user@example.com'),
      nickname: 'TestUser',
      status: 'ACTIVE' as UserStatus,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    });
    expect(user.email.value).toBe('user@example.com');
    expect(user.nickname).toBe('TestUser');
    expect(user.status).toBe('ACTIVE');
  });

  it('should_be_active_when_status_is_active', () => {
    const user = User.create({
      id: UserId.create('550e8400-e29b-41d4-a716-446655440000'),
      email: Email.create('user@example.com'),
      nickname: 'TestUser',
      status: 'ACTIVE' as UserStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(user.isActive()).toBe(true);
  });

  it('should_not_be_active_when_status_is_inactive', () => {
    const user = User.create({
      id: UserId.create('550e8400-e29b-41d4-a716-446655440000'),
      email: Email.create('user@example.com'),
      nickname: 'TestUser',
      status: 'INACTIVE' as UserStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(user.isActive()).toBe(false);
  });

  it('should_not_be_active_when_status_is_suspended', () => {
    const user = User.create({
      id: UserId.create('550e8400-e29b-41d4-a716-446655440000'),
      email: Email.create('user@example.com'),
      nickname: 'TestUser',
      status: 'SUSPENDED' as UserStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(user.isActive()).toBe(false);
  });

  it('should_update_nickname_returning_new_user', () => {
    const user = User.create({
      id: UserId.create('550e8400-e29b-41d4-a716-446655440000'),
      email: Email.create('user@example.com'),
      nickname: 'OldName',
      status: 'ACTIVE' as UserStatus,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    });
    const updated = user.updateNickname('NewName');
    expect(updated.nickname).toBe('NewName');
    expect(user.nickname).toBe('OldName'); // original unchanged
  });

  it('should_be_immutable_after_creation', () => {
    const user = User.create({
      id: UserId.create('550e8400-e29b-41d4-a716-446655440000'),
      email: Email.create('user@example.com'),
      nickname: 'TestUser',
      status: 'ACTIVE' as UserStatus,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    });
    // Test immutability by verifying Object.freeze was called
    expect(Object.isFrozen(user)).toBe(true);
  });
});
