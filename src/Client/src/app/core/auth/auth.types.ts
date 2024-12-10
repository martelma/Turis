import { User } from '../user/user.types';

export interface Login {
    /**
     * The accessToken property
     */
    accessToken?: string;
    /**
     * The changePasswordToken property
     */
    changePasswordToken?: string;
    /**
     * The firstName property
     */
    firstName?: string;
    /**
     * The lastName property
     */
    lastName?: string;
    /**
     * The passwordExpiration property
     */
    passwordExpiration?: Date;
    /**
     * The refreshToken property
     */
    refreshToken?: string;
    /**
     * The refreshTokenExpiration property
     */
    refreshTokenExpiration?: Date;
    /**
     * The tokenExpiration property
     */
    tokenExpiration?: Date;
    /**
     * The userId property
     */
    userId?: string;
}

export interface SecurityCode {
    code: string;
}

export interface Otp {
    /**
     * The token property
     */
    token?: string;
}

export interface PartialLogin {
    userId: string;
    changePasswordToken: string;
}

export function isPartialLogin(value: PartialLogin | Login | [User, Login]): value is PartialLogin {
    return 'changePasswordToken' in value;
}

export function isLogin(value: PartialLogin | Login | [User, Login]): value is Login {
    return 'accessToken' in value;
}

export interface ResetPasswordRequest {
    userId: string;
    token: string;
    password: string;
    passwordConfirmation: string;
}
