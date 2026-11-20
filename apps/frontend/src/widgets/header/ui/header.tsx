import { LogoutButton } from '@/features/shared/logout';
import { ThemeSwitcher } from '@/features/shared/theme-switcher';
import { Logo } from '@/shared/ui';

export function Header() {
  return (
    <header className="mx-auto flex w-full max-w-[640px] items-center justify-between gap-3 px-5 pt-6">
      <Logo />
      <div className="flex items-center gap-1">
        <ThemeSwitcher />
        <LogoutButton />
      </div>
    </header>
  );
}
