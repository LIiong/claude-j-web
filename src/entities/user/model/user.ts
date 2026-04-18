/**
 * User entity —— 示例聚合根。
 * 封装业务不变量：状态机（PENDING → ACTIVE → SUSPENDED）。
 * 纯 TS：禁止 import react/next/zustand 等框架。
 */

export type UserStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED';

export interface UserProps {
  readonly id: string;
  readonly email: string;
  readonly status: UserStatus;
}

export class User {
  private constructor(private readonly props: UserProps) {}

  static create(props: UserProps): User {
    if (!props.id) {
      throw new Error('User.id is required');
    }
    if (!props.email.includes('@')) {
      throw new Error(`Invalid email: ${props.email}`);
    }
    return new User(props);
  }

  get id(): string {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get status(): UserStatus {
    return this.props.status;
  }

  /** 激活用户：仅 PENDING → ACTIVE 合法。 */
  activate(): User {
    if (this.props.status !== 'PENDING') {
      throw new Error(`Cannot activate user in status ${this.props.status}`);
    }
    return new User({ ...this.props, status: 'ACTIVE' });
  }

  /** 暂停用户：仅 ACTIVE → SUSPENDED 合法。 */
  suspend(): User {
    if (this.props.status !== 'ACTIVE') {
      throw new Error(`Cannot suspend user in status ${this.props.status}`);
    }
    return new User({ ...this.props, status: 'SUSPENDED' });
  }
}
