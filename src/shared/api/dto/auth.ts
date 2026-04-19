import { z } from 'zod';

// ─── Login ────────────────────────────────────────────────────────────────────

export const LoginCredentialsSchema = z.object({
  account: z.string().min(1, '请输入邮箱或手机号'),
  password: z.string().min(8, '密码至少8位').max(32, '密码最多32位'),
  rememberMe: z.boolean().optional().default(false),
});

export type LoginCredentialsDTO = z.infer<typeof LoginCredentialsSchema>;

// ─── Register ─────────────────────────────────────────────────────────────────

/** 表单校验 schema（含 confirmPassword，仅供 UI 使用） */
export const RegisterFormSchema = z
  .object({
    username: z.string().min(2, '用户名至少2位').max(20, '用户名最多20位'),
    email: z.string().email('请输入有效的邮箱地址').optional().or(z.literal('')),
    password: z
      .string()
      .min(8, '密码至少8位')
      .max(128, '密码最多128位')
      .regex(/[A-Z]/, '需包含大写字母')
      .regex(/[a-z]/, '需包含小写字母')
      .regex(/\d/, '需包含数字'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  });

export type RegisterFormDTO = z.infer<typeof RegisterFormSchema>;

/** API payload schema（不含 confirmPassword） */
export const RegisterApiSchema = z.object({
  username: z.string(),
  email: z.string().optional(),
  password: z.string(),
});

export type RegisterApiDTO = z.infer<typeof RegisterApiSchema>;

// ─── Auth Response ────────────────────────────────────────────────────────────

/** 匹配后端 ApiResult<TokenResponse> 结构 */
export const AuthResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    expiresIn: z.number(),
    userId: z.string(),
    username: z.string(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
  }),
  errorCode: z.string().nullable().optional(),
  message: z.string().nullable().optional(),
});

export type AuthResponseDTO = z.infer<typeof AuthResponseSchema>;
export type TokenDataDTO = AuthResponseDTO['data'];

// ─── Refresh Token ────────────────────────────────────────────────────────────

export const RefreshTokenSchema = z.object({
  refreshToken: z.string(),
});

export type RefreshTokenDTO = z.infer<typeof RefreshTokenSchema>;
