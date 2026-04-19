import type { Email } from './email';
import type { UserId } from './userId';

/**
 * User status enum
 */
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

/**
 * Properties required to create a User
 */
export interface UserProps {
  readonly id: UserId;
  readonly email: Email;
  readonly nickname: string;
  readonly status: UserStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * User aggregate root - immutable entity with business invariants
 */
export class User {
  readonly id: UserId;
  readonly email: Email;
  readonly nickname: string;
  readonly status: UserStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email;
    this.nickname = props.nickname;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;

    Object.freeze(this);
  }

  static create(props: UserProps): User {
    if (!props.id) {
      throw new Error('User.id is required');
    }
    if (!props.email) {
      throw new Error('User.email is required');
    }
    if (!props.nickname || props.nickname.trim() === '') {
      throw new Error('User.nickname is required');
    }
    if (!props.status) {
      throw new Error('User.status is required');
    }
    if (!props.createdAt || !props.updatedAt) {
      throw new Error('User.createdAt and updatedAt are required');
    }
    return new User(props);
  }

  /**
   * Factory method for reconstructing from persistence
   */
  static reconstruct(props: UserProps): User {
    return new User(props);
  }

  /**
   * Check if user is in ACTIVE status
   */
  isActive(): boolean {
    return this.status === 'ACTIVE';
  }

  /**
   * Return new User with updated nickname (immutable)
   */
  updateNickname(nickname: string): User {
    if (!nickname || nickname.trim() === '') {
      throw new Error('Nickname cannot be empty');
    }
    return new User({
      ...this,
      nickname: nickname.trim(),
      updatedAt: new Date(),
    });
  }

  /**
   * Return new User with updated status (immutable)
   */
  updateStatus(status: UserStatus): User {
    return new User({
      ...this,
      status,
      updatedAt: new Date(),
    });
  }

  /**
   * Check equality based on id
   */
  equals(other: User): boolean {
    return this.id.equals(other.id);
  }
}
