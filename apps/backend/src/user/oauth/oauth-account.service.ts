import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { AuthSessionService } from '@/user/auth/auth-session.service';
import { OAuthProvider } from '@/user/oauth/dto/enums.dto';
import { OAuthAccount } from '@/user/oauth/entities/oauth-account.entity';
import type { OAuthProfile } from '@/user/oauth/providers/oauth-provider.interface';
import { User } from '@/user/user/entities/user.entity';

const PG_UNIQUE_VIOLATION = '23505';

@Injectable()
export class OAuthAccountService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly authSessionService: AuthSessionService,
  ) {}

  async resolveUser(provider: OAuthProvider, profile: OAuthProfile): Promise<User> {
    try {
      return await this.dataSource.transaction((manager) =>
        this.findOrCreate(manager, provider, profile),
      );
    } catch (error) {
      if ((error as { code?: string }).code === PG_UNIQUE_VIOLATION) {
        return this.dataSource.transaction((manager) =>
          this.findOrCreate(manager, provider, profile),
        );
      }
      throw error;
    }
  }

  private async findOrCreate(
    manager: EntityManager,
    provider: OAuthProvider,
    profile: OAuthProfile,
  ): Promise<User> {
    const accountRepository = manager.getRepository(OAuthAccount);
    const userRepository = manager.getRepository(User);

    const linked = await accountRepository.findOne({
      where: { provider, providerUserId: profile.providerUserId },
      relations: { user: true },
    });
    if (linked) {
      if (!linked.user.avatarUrl && profile.avatarUrl) {
        await userRepository.update(linked.user.id, {
          avatarUrl: profile.avatarUrl,
        });
      }
      return linked.user;
    }

    const email = profile.emailVerified ? profile.email : null;
    let user = email
      ? await userRepository
          .createQueryBuilder('user')
          .addSelect('user.passwordHash')
          .where('user.email = :email', { email })
          .setLock('pessimistic_write')
          .getOne()
      : null;

    if (user && !user.emailVerified) {
      await userRepository.update(user.id, {
        emailVerified: true,
        passwordHash: null,
      });
      await this.authSessionService.revokeAllSessions(user.id);
    }

    if (!user) {
      user = await userRepository.save(
        userRepository.create({
          email,
          emailVerified: !!email,
          name: profile.name.slice(0, 120),
          avatarUrl: profile.avatarUrl,
          passwordHash: null,
        }),
      );
    } else if (!user.avatarUrl && profile.avatarUrl) {
      await userRepository.update(user.id, { avatarUrl: profile.avatarUrl });
    }

    await accountRepository.save(
      accountRepository.create({
        provider,
        providerUserId: profile.providerUserId,
        userId: user.id,
        email: profile.email,
      }),
    );
    return user;
  }
}
