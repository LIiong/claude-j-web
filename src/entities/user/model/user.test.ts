import { describe, expect, it } from 'vitest';
import { User } from './user';

describe('User entity', () => {
  it('should_create_user_when_props_valid', () => {
    const user = User.create({ id: 'u1', email: 'a@b.com', status: 'PENDING' });
    expect(user.id).toBe('u1');
    expect(user.status).toBe('PENDING');
  });

  it('should_throw_when_email_invalid', () => {
    expect(() =>
      User.create({ id: 'u1', email: 'not-an-email', status: 'PENDING' }),
    ).toThrow(/Invalid email/);
  });

  it('should_activate_when_status_is_pending', () => {
    const user = User.create({ id: 'u1', email: 'a@b.com', status: 'PENDING' });
    const activated = user.activate();
    expect(activated.status).toBe('ACTIVE');
    // 原对象不可变
    expect(user.status).toBe('PENDING');
  });

  it('should_throw_when_activate_non_pending', () => {
    const user = User.create({ id: 'u1', email: 'a@b.com', status: 'ACTIVE' });
    expect(() => user.activate()).toThrow(/Cannot activate/);
  });

  it('should_suspend_when_status_is_active', () => {
    const user = User.create({ id: 'u1', email: 'a@b.com', status: 'ACTIVE' });
    expect(user.suspend().status).toBe('SUSPENDED');
  });

  it('should_throw_when_suspend_non_active', () => {
    const user = User.create({ id: 'u1', email: 'a@b.com', status: 'PENDING' });
    expect(() => user.suspend()).toThrow(/Cannot suspend/);
  });
});
