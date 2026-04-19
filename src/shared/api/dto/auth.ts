import { z } from 'zod';

/**
 * User schema for auth responses
 */
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  nickname: z.string().min(2).max(20),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

/**
 * Login credentials DTO
 */
export const LoginCredentialsSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(8, '密码至少8位').max(32, '密码最多32位'),
});

export type LoginCredentialsDTO = z.infer<typeof LoginCredentialsSchema>;

/**
 * Register request DTO
 */
export const RegisterSchema = z
  .object({
    email: z.string().email('请输入有效的邮箱地址'),
    password: z
      .string()
      .min(8, '密码至少8位')
      .max(32, '密码最多32位')
      .regex(/[A-Z]/, '需包含大写字母')
      .regex(/[a-z]/, '需包含小写字母')
      .regex(/\d/, '需包含数字'),
    nickname: z.string().min(2, '昵称至少2位').max(20, '昵称最多20位'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  });

export type RegisterDTO = z.infer<typeof RegisterSchema>;

/**
 * Auth response DTO
 */
export const AuthResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    expiresIn: z.number(),
    user: UserSchema,
  }),
});

export type AuthResponseDTO = z.infer<typeof AuthResponseSchema>;

/**
 * Refresh token request DTO
 */
export const RefreshTokenSchema = z.object({
  refreshToken: z.string(),
});

export type RefreshTokenDTO = z.infer<typeof RefreshTokenSchema>;
