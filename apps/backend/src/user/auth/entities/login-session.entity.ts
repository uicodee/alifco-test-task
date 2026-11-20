import { Exclude } from 'class-transformer';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Base } from '@/shared/common/entities/base.entity';
import { User } from '@/user/user/entities/user.entity';

@Entity()
@Index(['userId', 'revokedAt'])
export class LoginSession extends Base {
  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Exclude()
  @Column({ type: 'char', length: 64 })
  refreshTokenHash: string;

  @Exclude()
  @Column({ type: 'char', length: 64, nullable: true })
  previousRefreshTokenHash: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  rotatedAt: Date | null;

  @Column({ type: 'varchar', length: 512, nullable: true })
  userAgent: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  ipAddress: string | null;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  revokedAt: Date | null;
}
