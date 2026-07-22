export declare class UpdateProfileDto {
    name?: string;
    image?: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}
export declare class Enable2FADto {
    secret: string;
    token: string;
}
