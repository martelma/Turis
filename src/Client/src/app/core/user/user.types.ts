import { SafeUrl } from '@angular/platform-browser';
import { Application } from 'app/modules/admin/applications/applications.types';

export interface User {
    id: string;
    userName: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    avatar?: string;
    avatarUrl?: SafeUrl;
    isActive?: boolean;
    language?: string;

    accountType?: AccountType;
    applications: Application[];
}

export enum AccountType {
    Local = 'Local',
    AzureActiveDirectory = 'AzureActiveDirectory',
}

export interface CreateUserRequest {
    userName: string;
    firstName: string;
    lastName: string;
    email: string;
    language?: string;
    roles: string[];
    isActive: boolean;
}

export interface UpdateUserRequest {
    userId: string;
    userName: string;
    firstName: string;
    lastName: string;
    email: string;
    language?: string;
    roles: string[];
    isActive: boolean;
}
