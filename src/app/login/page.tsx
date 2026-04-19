'use client';

import { useLogin } from '@/features/auth/api/useLogin';
import { LoginForm } from '@/features/auth/ui/LoginForm';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const { mutate, isPending, error } = useLogin();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">登录</h1>
        <LoginForm
          onSubmit={(data) => mutate(data, { onSuccess: () => router.push('/') })}
          isLoading={isPending}
          error={error?.message ?? null}
        />
        <p className="mt-4 text-center text-sm text-gray-600">
          还没有账号？{' '}
          <Link href="/register" className="text-blue-500 hover:underline">
            立即注册
          </Link>
        </p>
      </div>
    </div>
  );
}
