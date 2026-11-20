import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Base } from '@/shared/common/entities/base.entity';
import { OAuthProvider } from '@/user/oauth/dto/enums.dto';
import { User } from '@/user/user/entities/user.entity';

@Entity('oauth_account')
@Index(['provider', 'providerUserId'], { unique: true })
export class OAuthAccount extends Base {
  @Column({ type: 'enum', enum: OAuthProvider, enumName: 'oauth_provider' })
  provider: OAuthProvider;

  @Column({ type: 'varchar', length: 255 })
  providerUserId: string;

  @Index()
  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.oauthAccounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 254, nullable: true })
  email: string | null;
}
