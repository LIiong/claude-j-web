/**
 * Email value object - immutable, validates RFC 5322 format
 */
export class Email {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(email: string): Email {
    if (!Email.isValid(email)) {
      throw new Error('Invalid email format');
    }
    return new Email(email.toLowerCase().trim());
  }

  static isValid(email: string): boolean {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
