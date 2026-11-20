import { Exclude } from 'class-transformer';
import { Column, Entity, Index, OneToMany } from 'typeorm';
import { Base } from '@/shared/common/entities/base.entity';
import { OAuthAccount } from '@/user/oauth/entities/oauth-account.entity';

@Entity()
export class User extends Base {
  @Index('UQ_user_email', { unique: true, where: '"email" IS NOT NULL' })
  @Column({ type: 'varchar', length: 254, nullable: true })
  email: string | null;

  @Column({ type: 'boolean', default: false })
  emailVerified: boolean;

  @Exclude()
  @Column({ type: 'varchar', nullable: true, select: false })
  passwordHash: string | null;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  avatarUrl: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt: Date | null;

  @OneToMany(() => OAuthAccount, (account) => account.user)
  oauthAccounts: OAuthAccount[];
}
