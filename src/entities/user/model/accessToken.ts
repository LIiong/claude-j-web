/**
 * AccessToken value object - immutable JWT token with expiry
 */
export class AccessToken {
  readonly token: string;
  readonly expiresAt: Date;
  readonly tokenType: string;

  private constructor(token: string, expiresAt: Date, tokenType: string) {
    this.token = token;
    this.expiresAt = expiresAt;
    this.tokenType = tokenType;
  }

  static create(token: string, expiresAt: Date, tokenType = 'Bearer'): AccessToken {
    if (!token || token.trim() === '') {
      throw new Error('Token cannot be empty');
    }
    return new AccessToken(token, expiresAt, tokenType);
  }

  isExpired(): boolean {
    return Date.now() >= this.expiresAt.getTime();
  }

  isValid(): boolean {
    return !this.isExpired() && this.token.length > 0;
  }

  getAuthorizationHeader(): string {
    return `${this.tokenType} ${this.token}`;
  }

  equals(other: AccessToken): boolean {
    return (
      this.token === other.token &&
      this.expiresAt.getTime() === other.expiresAt.getTime() &&
      this.tokenType === other.tokenType
    );
  }
}
