import { type RegisterDTO, RegisterSchema } from '@/shared/api/dto/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

export interface RegisterFormProps {
  onSubmit: (data: RegisterDTO) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function RegisterForm({ onSubmit, isLoading, error }: RegisterFormProps) {
  const form = useForm<RegisterDTO>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      nickname: '',
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full max-w-md">
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          邮箱
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
        <label htmlFor="nickname" className="block text-sm font-medium mb-1">
          昵称
        </label>
        <input
          {...form.register('nickname')}
          type="text"
          id="nickname"
          placeholder="请输入昵称"
          className="w-full px-3 py-2 border rounded-md"
        />
        {form.formState.errors.nickname && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.nickname.message}</p>
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
          placeholder="请输入密码（8-32位）"
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
