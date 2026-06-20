'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/button/Button';
import Input from '@/components/common/input/Input';
import { useLoginMutation } from '@/hooks/queries/auth/useLogin';
import { getErrorMessage } from '@/utils/getErrorMessage';

export default function LoginPage() {
  const router = useRouter();
  const { mutate: login, isPending } = useLoginMutation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    login(
      { username, password },
      {
        onSuccess: () => {
          router.replace('/posts');
          router.refresh();
        },
        onError: (err) => setError(getErrorMessage(err)),
      },
    );
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">모아쌤 관리자</h1>
        <p className="mt-1 text-sm text-gray-500">관리자 계정으로 로그인하세요.</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <Input
            label="아이디"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="관리자 아이디"
            autoComplete="username"
            required
          />
          <Input
            label="비밀번호"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            autoComplete="current-password"
            required
          />

          {error && <p className="text-sm text-danger-700">{error}</p>}

          <Button
            type="submit"
            isLoading={isPending}
            disabled={!username.trim() || !password.trim()}
            className="mt-2 w-full"
          >
            로그인
          </Button>
        </form>
      </div>
    </main>
  );
}
