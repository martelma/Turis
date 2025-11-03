import { SafeUrl } from '@angular/platform-browser';
import { ApplicationRole } from 'app/modules/admin/roles/role.types';
import { Application } from 'app/shared/services/shared.types';

export interface User {
    id: string;
    applicationId?: string;
    applicationName?: string;
    applicationRoles: ApplicationRole[];
    applications: Application[];
    userName: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    avatar?: string;
    avatarUrl?: SafeUrl;
    isActive?: boolean;
    twoFactorEnabled?: boolean;
    language?: string;
    contactId?: string;

    accountType?: AccountType;
    roles: string[];
    scopes: string[];
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
