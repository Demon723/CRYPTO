import { UsersService } from '../services/users.service';
import { UpdateProfileDto, ChangePasswordDto, Enable2FADto } from './dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(userId: string): Promise<any>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<any>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<void>;
    enable2FA(userId: string, dto: Enable2FADto): Promise<void>;
    disable2FA(userId: string): Promise<void>;
    deleteAccount(userId: string): Promise<void>;
    getAllUsers(): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
