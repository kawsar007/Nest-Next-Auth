import { Inject } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthService } from "../auth.service";
import refreshConfig from "../config/refresh.config";
import { AuthJwtPayload } from "../types/auth-jwtPayload";


export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh-jwt') {
  constructor(
    @Inject(refreshConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshConfig>,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: refreshTokenConfig.secret,
      ignoreExpiration: false,
      // passReqToCallback: true,
    });
  }

  validate(payload: AuthJwtPayload) {
    const userId = payload.sub;
    return this.authService.validateRefreshToken(userId);
  }
}