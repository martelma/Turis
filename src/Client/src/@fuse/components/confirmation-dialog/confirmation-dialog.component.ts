import { NgClass, NgIf } from '@angular/common';
import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@ngneat/transloco';
import { merge } from 'lodash';

export interface FuseConfirmationOptions {
    title?: string;
    message?: string;
    htmlMessage?: string;
    icon?: {
        show?: boolean;
        name?: string;
        color?: 'primary' | 'accent' | 'warn' | 'basic' | 'info' | 'success' | 'warning' | 'error';
    };
    actions?: {
        confirm?: {
            show?: boolean;
            label?: string;
            color?: 'primary' | 'accent' | 'warn';
        };
        cancel?: {
            show?: boolean;
            label?: string;
        };
    };
    dismissible?: boolean;
    translations?: {
        [key: string]: string;
    };
}

export enum FuseConfirmationType {
    Default = 'default',
    Deleting = 'deleting',
    Warning = 'warning',
    Success = 'success',
}

export enum FuseConfirmationResult {
    Confirm = 'confirm',
    Cancel = 'cancel',
}

@Component({
    selector: 'fuse-confirmation-dialog',
    templateUrl: './confirmation-dialog.component.html',
    styles: [
        `
            .fuse-confirmation-dialog-panel {
                @apply md:w-128;
            }

            .fuse-confirmation-dialog-panel .mat-mdc-dialog-container .mat-mdc-dialog-surface {
                padding: 0 !important;
            }
        `,
    ],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [NgIf, MatButtonModule, MatDialogModule, MatIconModule, NgClass, TranslocoModule],
})
export class FuseConfirmationDialogComponent {
    FuseConfirmationResult = FuseConfirmationResult;

    constructor(@Inject(MAT_DIALOG_DATA) public data: FuseConfirmationOptions) {}

    static createConfigurations(
        options: Partial<FuseConfirmationOptions>,
        type: FuseConfirmationType = FuseConfirmationType.Default,
    ): MatDialogConfig<FuseConfirmationOptions> {
        switch (type) {
            case FuseConfirmationType.Default:
                options = this.createDefaultOptions(options);
                break;
            case FuseConfirmationType.Deleting:
                options = this.createDeletingOptions(options);
                break;
            case FuseConfirmationType.Warning:
                options = this.createWarningOptions(options);
                break;
            case FuseConfirmationType.Success:
                options = this.createSuccessOptions(options);
                break;
            default:
                options = this.createDefaultOptions(options);
                break;
        }

        return {
            autoFocus: false,
            disableClose: !options.dismissible,
            data: options,
            panelClass: 'fuse-confirmation-dialog-panel',
        };
    }

    private static createDefaultOptions(options: Partial<FuseConfirmationOptions>): FuseConfirmationOptions {
        return {
            ...options,
            actions: merge(
                {
                    cancel: {
                        label: 'Dialogs.Confirm.Default.Cancel',
                        show: true,
                    },
                    confirm: {
                        label: 'Dialogs.Confirm.Default.Confirm',
                        show: true,
                        color: 'warn',
                    },
                },
                options.actions || {},
            ),

            icon: merge(
                {
                    color: 'warn',
                    name: 'heroicons_outline:question-mark-circle',
                    show: true,
                },
                options.icon || {},
            ),

            dismissible: options?.dismissible ?? true,
            message: options?.message ?? 'Dialogs.Confirm.Default.Message',
            title: options?.title ?? 'Dialogs.Confirm.Default.Title',
            translations: options?.translations ?? {},
        };
    }

    private static createDeletingOptions(options: Partial<FuseConfirmationOptions>): FuseConfirmationOptions {
        return {
            ...options,
            actions: merge(
                {
                    cancel: {
                        label: 'Dialogs.Confirm.Delete.Cancel',
                        show: true,
                    },
                    confirm: {
                        label: 'Dialogs.Confirm.Delete.Confirm',
                        show: true,
                        color: 'warn',
                    },
                },
                options.actions || {},
            ),
            dismissible: options.dismissible ?? true,
            icon: merge(
                {
                    color: 'error',
                    name: 'heroicons_outline:exclamation-triangle',
                    show: true,
                },
                options.icon || {},
            ),
            message: options?.message ?? 'Dialogs.Confirm.Delete.Message',
            title: options?.title ?? 'Dialogs.Confirm.Delete.Title',
        };
    }

    private static createWarningOptions(options: Partial<FuseConfirmationOptions>): FuseConfirmationOptions {
        return {
            ...options,
            actions: merge(
                {
                    cancel: {
                        label: 'Dialogs.Confirm.Warning.Cancel',
                        show: true,
                    },
                    confirm: {
                        label: 'Dialogs.Confirm.Warning.Confirm',
                        show: true,
                        color: 'warn',
                    },
                },
                options.actions || {},
            ),
            icon: merge(
                {
                    color: 'warn',
                    name: 'heroicons_outline:exclamation-triangle',
                    show: true,
                },
                options.icon || {},
            ),
            dismissible: options.dismissible ?? true,
            message: options?.message ?? 'Dialogs.Confirm.Warning.Message',
            title: options?.title ?? 'Dialogs.Confirm.Warning.Title',
            translations: options?.translations ?? {},
        };
    }

    private static createSuccessOptions(options: Partial<FuseConfirmationOptions>): FuseConfirmationOptions {
        return {
            ...options,
            actions: merge(
                {
                    cancel: {
                        label: 'Dialogs.Confirm.Success.Cancel',
                        show: false,
                    },
                    confirm: {
                        label: 'Dialogs.Confirm.Success.Confirm',
                        color: 'primary',
                        show: true,
                    },
                },
                options.actions || {},
            ),
            icon: merge(
                {
                    color: 'success',
                    name: 'heroicons_outline:face-smile',
                    show: true,
                },
                options.icon || {},
            ),
            dismissible: options.dismissible ?? true,
            message: options?.message ?? 'Dialogs.Confirm.Success.Message',
            title: options?.title ?? 'Dialogs.Confirm.Success.Title',
            translations: options?.translations ?? {},
        };
    }
}
