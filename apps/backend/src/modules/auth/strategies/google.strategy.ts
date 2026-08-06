import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../services/auth.service';
import { JwtPayload } from '../entities/user.entity';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');

    if (!clientID || !clientSecret) {
      throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be provided for Google OAuth');
    }

    super({
      clientID,
      clientSecret,
      callbackURL: `${configService.get<string>('API_PREFIX', 'api/v1')}/auth/google/callback`,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: { id: string; emails: { value: string }[]; displayName: string; photos: { value: string }[] },
    done: VerifyCallback,
  ): Promise<void> {
    try {
      const email = profile.emails[0]?.value;
      const name = profile.displayName;
      const image = profile.photos[0]?.value;

      if (!email) {
        return done(new Error('No email provided by Google'), false);
      }

      const user = await this.authService.validateOAuthUser({
        email,
        name,
        image,
      });

      done(null, user);
    } catch (error) {
      done(error, false);
    }
  }
}
