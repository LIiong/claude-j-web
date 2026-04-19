import { type LoginCredentialsDTO, LoginCredentialsSchema } from '@/shared/api/dto/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

export interface LoginFormProps {
  onSubmit: (data: LoginCredentialsDTO) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function LoginForm({ onSubmit, isLoading, error }: LoginFormProps) {
  const form = useForm<LoginCredentialsDTO>({
    resolver: zodResolver(LoginCredentialsSchema),
    defaultValues: { account: '', password: '', rememberMe: false },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full max-w-md">
      <div>
        <label htmlFor="account" className="block text-sm font-medium mb-1">
          账号（邮箱或手机号）
        </label>
        <input
          {...form.register('account')}
          type="text"
          id="account"
          placeholder="请输入邮箱或手机号"
          className="w-full px-3 py-2 border rounded-md"
        />
        {form.formState.errors.account && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.account.message}</p>
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
          placeholder="请输入密码"
          className="w-full px-3 py-2 border rounded-md"
        />
        {form.formState.errors.password && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input {...form.register('rememberMe')} type="checkbox" id="rememberMe" />
        <label htmlFor="rememberMe" className="text-sm">
          记住我
        </label>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
      >
        {isLoading ? '登录中...' : '登录'}
      </button>
    </form>
  );
}
