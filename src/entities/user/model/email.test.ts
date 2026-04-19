import { describe, it, expect } from 'vitest';
import { Email } from './email';

describe('Email', () => {
  it('should_create_email_when_format_valid', () => {
    const email = Email.create('user@example.com');
    expect(email.value).toBe('user@example.com');
  });

  it('should_throw_when_email_format_invalid', () => {
    expect(() => Email.create('invalid')).toThrow('Invalid email format');
  });

  it('should_throw_when_email_empty', () => {
    expect(() => Email.create('')).toThrow('Invalid email format');
  });

  it('should_equal_when_values_match', () => {
    const e1 = Email.create('a@b.com');
    const e2 = Email.create('a@b.com');
    expect(e1.equals(e2)).toBe(true);
  });

  it('should_not_equal_when_values_differ', () => {
    const e1 = Email.create('a@b.com');
    const e2 = Email.create('c@d.com');
    expect(e1.equals(e2)).toBe(false);
  });
});
