'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FileText, LogOut, type LucideIcon } from 'lucide-react';
import { useLogoutMutation } from '@/hooks/queries/auth/useLogout';
import { cn } from '@/utils/cn';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [{ label: '게시글 관리', href: '/posts', icon: FileText }];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { mutate: logout, isPending } = useLogoutMutation();

  const handleLogout = () => {
    logout(undefined, {
      onSettled: () => {
        router.replace('/login');
        router.refresh();
      },
    });
  };

  return (
    <aside className="z-400 flex h-screen w-64 flex-col bg-gray-950 px-4 text-white">
      <div className="flex h-16 items-center gap-2 px-2 pt-6">
        <Image src="/logo.svg" alt="모아쌤" width={28} height={28} />
        <span className="text-lg font-bold">모아쌤 Admin</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 py-4">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
                active ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5',
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        disabled={isPending}
        className="mb-4 flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-gray-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
      >
        <LogOut className="h-5 w-5 shrink-0" />
        <span>로그아웃</span>
      </button>
    </aside>
  );
}
