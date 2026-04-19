/**
 * UserId value object - immutable UUID v4 identifier
 */
export class UserId {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(id: string): UserId {
    if (!UserId.isValidUUID(id)) {
      throw new Error('Invalid UUID format');
    }
    return new UserId(id);
  }

  static generate(): UserId {
    const uuid = UserId.generateUUIDv4();
    return new UserId(uuid);
  }

  private static isValidUUID(uuid: string): boolean {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return regex.test(uuid);
  }

  private static generateUUIDv4(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
