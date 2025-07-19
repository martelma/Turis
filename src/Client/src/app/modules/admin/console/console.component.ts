import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { CommonModule, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { SpinnerButtonComponent } from 'app/shared/components/ui/spinner-button/spinner-button.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { KeyValue } from './console.types';
import { environment } from 'environments/environment';
import { AdminService } from '../admin.service';
import { finalize } from 'rxjs';

@UntilDestroy()
@Component({
    selector: 'app-console',
    standalone: true,
    styleUrls: ['./console.component.scss'],
    templateUrl: './console.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgIf,
        MatProgressSpinnerModule,
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        MatSnackBarModule,
        MatExpansionModule,
        TranslocoModule,
        SpinnerButtonComponent,
        CommonModule,
    ],
})
export class ConsoleComponent implements OnInit {
    waiting = false;
    utilitiesPanelOpenState = false;
    configurationsPanelOpenState = false;

    apiConfigurations: KeyValue[] = [];
    clientConfigurations: KeyValue[] = [];

    backendDataSource: MatTableDataSource<KeyValue>;
    clientDataSource: MatTableDataSource<KeyValue>;
    displayedColumns: string[] = ['index', 'key', 'value'];

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _fuseConfirmationService: FuseConfirmationService,
        private _service: AdminService,
        private _translocoService: TranslocoService,
        private _changeDetectorRef: ChangeDetectorRef,
        public snackBar: MatSnackBar,
    ) {
        const snapshot = this._activatedRoute.snapshot;
        const params = { ...snapshot.queryParams };
        if ('otp' in params) {
            delete params.otp;
            this._router.navigate([], { queryParams: params });
        }
    }

    ngOnInit(): void {
        this._loadBackendConfiguration();
        this._loadClientConfiguration();
    }

    truncateElmah(): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: this._translocoService.translate('Admin.Console.TruncateElmah'),
            message: this._translocoService.translate('Questions.AreYouSure'),
            actions: {
                cancel: {
                    label: this._translocoService.translate('General.Cancel'),
                },
                confirm: {
                    label: this._translocoService.translate('General.Truncate'),
                },
            },
        });

        // Subscribe to the confirmation dialog closed action
        confirmation
            .afterClosed()
            .pipe(untilDestroyed(this))
            .subscribe(result => {
                // If the confirm button pressed...
                if (result === 'confirmed') {
                    this.waiting = true;
                    this._service
                        .truncateElmah()
                        .pipe(
                            finalize(() => {
                                this.waiting = false;
                                this._changeDetectorRef.detectChanges();
                            }),
                            untilDestroyed(this),
                        )
                        .subscribe({
                            next: () => {
                                this.snackBar.open(
                                    this._translocoService.translate('Messages.ElmahSuccessfullyTruncated'),
                                    this._translocoService.translate('General.Dismiss'),
                                    {
                                        panelClass: ['success'],
                                    },
                                );
                            },
                            error: error => {
                                console.error(error);

                                this.snackBar.open(error.message, this._translocoService.translate('General.Dismiss'), {
                                    panelClass: ['error'],
                                });
                            },
                        });
                }
            });
    }

    mailProposal(): void {
        this.waiting = true;

        this._service
            .mailProposal()
            .pipe(
                finalize(() => {
                    this.waiting = false;
                    this._changeDetectorRef.detectChanges();
                }),
                untilDestroyed(this),
            )
            .subscribe({
                next: () => {
                    this.snackBar.open(
                        this._translocoService.translate('Messages.MailProposalSuccessfullySent'),
                        this._translocoService.translate('General.Dismiss'),
                        {
                            panelClass: ['success'],
                        },
                    );
                },
                error: error => {
                    console.error(error);

                    this.snackBar.open(error.message, this._translocoService.translate('General.Dismiss'), {
                        panelClass: ['error'],
                    });
                },
            });
    }

    private _loadBackendConfiguration(): void {
        this.apiConfigurations = [];
        this._service
            .backendConfiguration()
            .pipe(untilDestroyed(this))
            .subscribe((items: any) => {
                console.log(items);
                this.apiConfigurations = items;
                this.backendDataSource = new MatTableDataSource(this.apiConfigurations);
            });
    }

    private _loadClientConfiguration(): void {
        this.clientConfigurations = [];
        this.clientConfigurations.push({ key: 'applicationId', value: environment.applicationId });
        this.clientConfigurations.push({ key: 'production', value: environment.production.toString() });
        this.clientConfigurations.push({ key: 'baseUrl', value: environment.baseUrl });
        this.clientDataSource = new MatTableDataSource(this.clientConfigurations);
    }

    expandAll(): void {
        this.utilitiesPanelOpenState = true;
        this.configurationsPanelOpenState = true;
    }

    collapseAll(): void {
        this.utilitiesPanelOpenState = false;
        this.configurationsPanelOpenState = false;
    }
}
