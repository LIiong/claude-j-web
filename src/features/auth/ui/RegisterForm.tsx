import { type RegisterFormDTO, RegisterFormSchema } from '@/shared/api/dto/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

export interface RegisterFormProps {
  onSubmit: (data: RegisterFormDTO) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function RegisterForm({ onSubmit, isLoading, error }: RegisterFormProps) {
  const form = useForm<RegisterFormDTO>({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: { username: '', email: '', password: '', confirmPassword: '' },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full max-w-md">
      <div>
        <label htmlFor="username" className="block text-sm font-medium mb-1">
          用户名
        </label>
        <input
          {...form.register('username')}
          type="text"
          id="username"
          placeholder="请输入用户名（2-20位）"
          className="w-full px-3 py-2 border rounded-md"
        />
        {form.formState.errors.username && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.username.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          邮箱（可选）
        </label>
        <input
          {...form.register('email')}
          type="email"
          id="email"
          placeholder="请输入邮箱"
          className="w-full px-3 py-2 border rounded-md"
        />
        {form.formState.errors.email && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          密码
        </label>
        <input
          {...form.register('password')}
          type="password"
          id="password"
          placeholder="8位以上，含大小写字母和数字"
          className="w-full px-3 py-2 border rounded-md"
        />
        {form.formState.errors.password && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.password.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
          确认密码
        </label>
        <input
          {...form.register('confirmPassword')}
          type="password"
          id="confirmPassword"
          placeholder="请再次输入密码"
          className="w-full px-3 py-2 border rounded-md"
        />
        {form.formState.errors.confirmPassword && (
          <p className="text-red-500 text-sm mt-1">
            {form.formState.errors.confirmPassword.message}
          </p>
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
      >
        {isLoading ? '注册中...' : '注册'}
      </button>
    </form>
  );
}
