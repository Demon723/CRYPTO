import { AuthService } from './services/auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<any>;
    login(dto: LoginDto): Promise<any>;
    refresh(dto: RefreshTokenDto): Promise<any>;
    getProfile(user: {
        sub: string;
        email: string;
        role: string;
    }): Promise<any>;
}
