import { describe, expect, it } from 'vitest';
import { AccessToken } from './accessToken';

describe('AccessToken', () => {
  it('should_create_token_when_input_valid', () => {
    const futureDate = new Date(Date.now() + 3600 * 1000);
    const token = AccessToken.create('jwt-token-123', futureDate, 'Bearer');
    expect(token.token).toBe('jwt-token-123');
    expect(token.tokenType).toBe('Bearer');
    expect(token.expiresAt).toEqual(futureDate);
  });

  it('should_throw_when_token_empty', () => {
    const futureDate = new Date(Date.now() + 3600 * 1000);
    expect(() => AccessToken.create('', futureDate, 'Bearer')).toThrow('Token cannot be empty');
  });

  it('should_be_expired_when_past_expiry', () => {
    const pastDate = new Date(Date.now() - 1000);
    const token = AccessToken.create('jwt-token', pastDate, 'Bearer');
    expect(token.isExpired()).toBe(true);
  });

  it('should_not_be_expired_when_future_expiry', () => {
    const futureDate = new Date(Date.now() + 3600 * 1000);
    const token = AccessToken.create('jwt-token', futureDate, 'Bearer');
    expect(token.isExpired()).toBe(false);
  });

  it('should_be_valid_when_not_expired_and_has_token', () => {
    const futureDate = new Date(Date.now() + 3600 * 1000);
    const token = AccessToken.create('jwt-token', futureDate, 'Bearer');
    expect(token.isValid()).toBe(true);
  });

  it('should_not_be_valid_when_expired', () => {
    const pastDate = new Date(Date.now() - 1000);
    const token = AccessToken.create('jwt-token', pastDate, 'Bearer');
    expect(token.isValid()).toBe(false);
  });

  it('should_use_bearer_type_when_tokentype_not_specified', () => {
    const futureDate = new Date(Date.now() + 3600 * 1000);
    const token = AccessToken.create('jwt-token', futureDate);
    expect(token.tokenType).toBe('Bearer');
  });

  it('should_return_bearer_token_when_get_authorization_header_called', () => {
    const futureDate = new Date(Date.now() + 3600 * 1000);
    const token = AccessToken.create('jwt-token', futureDate, 'Bearer');
    expect(token.getAuthorizationHeader()).toBe('Bearer jwt-token');
  });
});
