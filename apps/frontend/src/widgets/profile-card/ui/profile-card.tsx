import type { UserDto } from '@/shared/api/model';
import { Avatar } from '@/shared/ui';
import { formatLongDate } from '@/shared/utils';

export function ProfileCard({ user }: { user: UserDto }) {
  return (
    <section className="flex flex-col items-center gap-4 rounded-32 bg-background p-6 text-center shadow-card sm:flex-row sm:p-8 sm:text-left">
      <Avatar name={user.name} src={user.avatarUrl} size={80} />
      <div className="flex min-w-0 flex-col gap-1">
        <h2 className="m-0 text-[26px] leading-8 font-semibold tracking-lg break-words">{user.name}</h2>
        {user.email && <p className="m-0 text-body break-all text-subtle-foreground">{user.email}</p>}
        <p className="m-0 text-caption text-muted-foreground">С нами с {formatLongDate(user.createdAt)}</p>
      </div>
    </section>
  );
}
