import { PrismaService } from '../../../common/modules/prisma.service';
import { UpdateProfileDto, ChangePasswordDto, Enable2FADto } from './dto';
export declare class UsersService {
    private readonly prisma;
    private readonly logger;
    private readonly bcryptRounds;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<any>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<any>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<void>;
    enable2FA(userId: string, dto: Enable2FADto): Promise<void>;
    disable2FA(userId: string): Promise<void>;
    deleteAccount(userId: string): Promise<void>;
    getUsers(page?: number, limit?: number): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
