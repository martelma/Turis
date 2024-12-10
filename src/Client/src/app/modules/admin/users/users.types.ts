export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
    passwordConfirmation: string;
}

export interface ResetPasswodRequest {
    userId: string;
    token: string;
    password: string;
    passwordConfirmation: string;
}
