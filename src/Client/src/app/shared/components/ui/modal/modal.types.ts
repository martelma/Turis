import { FuseConfirmationConfig } from '@fuse/services/confirmation';

export type ModalConfig = FuseConfirmationConfig;

export const getConfirmationModal = (config?: ModalConfig): FuseConfirmationConfig => {
    return {
        actions: config.actions ?? {
            cancel: {
                label: 'Cancel',
                show: true,
            },
            confirm: {
                label: 'Confirm',
                show: true,
            },
        },
        icon: {
            color: 'success',
            name: 'heroicons_outline:question-mark-circle',
            show: true,
        },
        dismissible: config.dismissible ?? true,
        message: config?.message ?? 'Are you sure to proceed?',
        title: config?.title ?? 'Required Confirmation',
    };
};

export const getDeletingModal = (config?: ModalConfig): FuseConfirmationConfig => {
    return {
        actions: config.actions ?? {
            cancel: {
                label: 'Cancel',
                show: true,
            },
            confirm: {
                label: 'Delete',
                show: true,
                color: 'warn',
            },
        },
        dismissible: config.dismissible ?? true,
        icon: {
            color: 'error',
            name: 'heroicons_outline:exclamation-triangle',
            show: true,
        },
        message: config?.message ?? 'Are you sure to delete this item?',
        title: config?.title ?? 'Attention!',
    };
};

export const getWarningModal = (config?: ModalConfig): FuseConfirmationConfig => {
    return {
        actions: config.actions ?? {
            cancel: {
                label: 'Cancel',
                show: true,
            },
            confirm: {
                label: 'Confirm',
                show: true,
            },
        },
        icon: {
            color: 'warn',
            name: 'heroicons_outline:exclamation-triangle',
            show: true,
        },
        dismissible: config.dismissible ?? true,
        message: config?.message ?? 'Are you sure to proceed?',
        title: config?.title ?? 'Required Confirmation',
    };
};

export const getSuccessModal = (config?: ModalConfig): FuseConfirmationConfig => {
    return {
        actions: config.actions ?? {
            cancel: {
                label: 'Cancel',
                show: false,
            },
            confirm: {
                label: 'Ok',
                color: 'primary',
                show: true,
            },
        },
        icon: {
            color: 'success',
            name: 'heroicons_outline:face-smile',
            show: true,
        },
        dismissible: config.dismissible ?? true,
        message: config?.message ?? 'Operation was successfully completed',
        title: config?.title ?? 'Success',
    };
};

export interface ErrorModalCommand {
    title: string;
    message: string;
    error?: {
        title: string;
        detail?: string;
        innerException: {
            title: string;
            detail: string;
        };
    };
    severity: 'error' | 'info' | 'warning' | 'question';
}
