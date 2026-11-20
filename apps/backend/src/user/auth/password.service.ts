import { Injectable } from '@nestjs/common';
import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
  type ScryptOptions,
} from 'crypto';

const scrypt = (
  password: string,
  salt: Buffer,
  keylen: number,
  options: ScryptOptions,
) =>
  new Promise<Buffer>((resolve, reject) =>
    scryptCallback(password, salt, keylen, options, (error, key) =>
      error ? reject(error) : resolve(key),
    ),
  );

const PARAMS = { N: 2 ** 15, r: 8, p: 1 };
const KEYLEN = 64;
const MAXMEM = 64 * 1024 * 1024;

@Injectable()
export class PasswordService {
  private readonly dummyHash = this.hash('dummy-password-for-timing');

  async hash(password: string): Promise<string> {
    const salt = randomBytes(16);
    const key = await scrypt(password.normalize('NFKC'), salt, KEYLEN, {
      ...PARAMS,
      maxmem: MAXMEM,
    });
    return [
      'scrypt',
      PARAMS.N,
      PARAMS.r,
      PARAMS.p,
      salt.toString('base64'),
      key.toString('base64'),
    ].join('$');
  }

  async verify(
    password: string,
    stored: string | null | undefined,
  ): Promise<boolean> {
    const target = stored ?? (await this.dummyHash);
    const [scheme, n, r, p, saltB64, hashB64] = target.split('$');
    if (scheme !== 'scrypt' || !saltB64 || !hashB64) {
      return false;
    }
    const expected = Buffer.from(hashB64, 'base64');
    const key = await scrypt(
      password.normalize('NFKC'),
      Buffer.from(saltB64, 'base64'),
      expected.length,
      { N: Number(n), r: Number(r), p: Number(p), maxmem: MAXMEM },
    );
    return timingSafeEqual(key, expected) && !!stored;
  }
}
