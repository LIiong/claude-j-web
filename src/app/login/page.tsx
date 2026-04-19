'use client';

import { AccessToken, Email, User, UserId } from '@/entities/user';
import { LoginForm, setTokens, useAuthStore, useLogin } from '@/features/auth';
import type { LoginCredentialsDTO } from '@/shared/api/dto/auth';
import type { AuthResponseDTO } from '@/shared/api/dto/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useLogin();
  const { login } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: LoginCredentialsDTO) => {
    setError(null);
    try {
      const response: AuthResponseDTO = await loginMutation.mutateAsync(data);

      if (response.success) {
        // Store tokens
        setTokens(response.data.accessToken, response.data.refreshToken);

        // Create user entity
        const user = User.create({
          id: UserId.create(response.data.user.id),
          email: Email.create(response.data.user.email),
          nickname: response.data.user.nickname,
          status: response.data.user.status,
          createdAt: new Date(response.data.user.createdAt),
          updatedAt: new Date(response.data.user.updatedAt),
        });

        // Create access token
        const accessToken = AccessToken.create(
          response.data.accessToken,
          new Date(Date.now() + response.data.expiresIn * 1000),
          'Bearer',
        );

        // Update store
        login(user, accessToken);

        // Redirect to home
        router.push('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">登录</h1>
        <LoginForm onSubmit={handleSubmit} isLoading={loginMutation.isPending} error={error} />
        <p className="mt-4 text-center text-sm text-gray-600">
          还没有账号？{' '}
          <a href="/register" className="text-blue-500 hover:underline">
            立即注册
          </a>
        </p>
      </div>
    </div>
  );
}
