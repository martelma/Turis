import { FuseConfirmationConfig } from '@fuse/services/confirmation';

export interface ModalConfig {
    title?: string;
    message?: string;
}

export function getConfirmationModal(config?: ModalConfig): FuseConfirmationConfig {
    return {
        actions: {
            cancel: {
                label: 'Annulla',
                show: true,
            },
            confirm: {
                label: 'Conferma',
                show: true,
            },
        },
        icon: {
            color: 'success',
            name: 'heroicons_outline:question-mark-circle',
            show: true,
        },
        dismissible: true,
        message: config?.message ?? 'Sei sicuro di voler procedere?',
        title: config?.title ?? 'Conferma necessaria',
    };
}

export function getDeletingModal(config?: ModalConfig): FuseConfirmationConfig {
    return {
        actions: {
            cancel: {
                label: 'Annulla',
                show: true,
            },
            confirm: {
                label: 'Elimina',
                show: true,
                color: 'warn',
            },
        },
        dismissible: true,
        icon: {
            color: 'error',
            name: 'heroicons_outline:exclamation-triangle',
            show: true,
        },
        message: config?.message ?? 'Sei sicuro di voler eliminare questo elemento?',
        title: config?.title ?? 'Attenzione!',
    };
}

export function getSuccessModal(config?: ModalConfig): FuseConfirmationConfig {
    return {
        actions: {
            cancel: {
                label: 'Annulla',
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
        dismissible: true,
        message: config?.message ?? 'Operazione effettuata con successo',
        title: config?.title ?? 'Successo',
    };
}
