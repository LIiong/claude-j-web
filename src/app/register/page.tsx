'use client';

import { useRegister } from '@/features/auth/api/useRegister';
import { RegisterForm } from '@/features/auth/ui/RegisterForm';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const { mutate, isPending, error } = useRegister();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">注册</h1>
        <RegisterForm
          onSubmit={(data) => mutate(data, { onSuccess: () => router.push('/') })}
          isLoading={isPending}
          error={error?.message ?? null}
        />
        <p className="mt-4 text-center text-sm text-gray-600">
          已有账号？{' '}
          <Link href="/login" className="text-blue-500 hover:underline">
            立即登录
          </Link>
        </p>
      </div>
    </div>
  );
}
