import { MatRippleModule } from '@angular/material/core';
import { DatePipe, JsonPipe, NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FuseScrollResetDirective } from '@fuse/directives/scroll-reset';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { fuseAnimations } from '@fuse/animations';
import { SpinnerButtonComponent } from 'app/shared/components/ui/spinner-button/spinner-button.component';
import { Service } from '../service.types';
import { ServiceService } from '../service.service';
import { tap } from 'rxjs';
import { ServiceEditComponent } from '../service-edit/service-edit.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ServiceViewComponent } from '../service-view/service-view.component';
import { ServiceComponent } from '../service.component';
import { BookmarkService } from 'app/modules/bookmark/bookmark.service';
import { TagSummaryComponent } from 'app/shared/components/tag-summary/tag-summary.component';
import { ConfirmationDialogService } from 'app/shared/services/confirmation-dialog.service';
import { ClipboardModule } from '@angular/cdk/clipboard';

@UntilDestroy()
@Component({
    selector: 'app-service-details',
    templateUrl: './service-details.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        NgStyle,
        DatePipe,
        JsonPipe,
        RouterLink,
        MatButtonModule,
        MatCheckboxModule,
        MatRippleModule,
        MatIconModule,
        MatMenuModule,
        MatTooltipModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        FuseScrollResetDirective,
        TranslocoModule,
        ServiceViewComponent,
        ServiceEditComponent,
        SpinnerButtonComponent,
        TagSummaryComponent,
        ClipboardModule,
    ],
})
export class ServiceDetailsComponent implements OnInit {
    @ViewChild(ServiceViewComponent) viewService: ServiceViewComponent;
    @ViewChild(ServiceEditComponent) editService: ServiceEditComponent;

    editMode = false;
    isCreate = false;
    isCopy = false;
    isDownloading = false;
    downloadingData = false;
    validating = false;
    loading = false;

    service: Service;

    //queste devono diventare scope
    userCanDeleteService = true;
    userCanUpdateService = true;
    userCanValidateService = true;
    userCanDownloadData = true;
    userCanViewServiceStatistics = true;

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _confirmationDialogService: ConfirmationDialogService,
        private _serviceService: ServiceService,
        private _translocoService: TranslocoService,
        private _bookmarkService: BookmarkService,
        public snackBar: MatSnackBar,

        public serviceComponent: ServiceComponent,
    ) {}

    ngOnInit(): void {
        this._subscribeRouteParams();

        this._subscribeService();
        this._subscribeServiceEdited();
    }

    private _subscribeRouteParams() {
        this._activatedRoute.params
            .pipe(
                tap(params => {
                    // Activates the create user mode
                    this.isCreate = params.id === 'new';
                }),
                untilDestroyed(this),
            )
            .subscribe();
    }

    private _subscribeService() {
        this._serviceService.item$.pipe(untilDestroyed(this)).subscribe((service: Service) => {
            this.service = service;

            this.editMode = service?.id === undefined;
        });
    }

    private _subscribeServiceEdited(): void {
        this._serviceService.edited$.pipe(untilDestroyed(this)).subscribe((serviceId: string) => {
            if (serviceId != null) {
                this._serviceService
                    .getById(serviceId)
                    .pipe(untilDestroyed(this))
                    .subscribe(() => {
                        this.editMode = true;
                    });
            } else {
                this.editMode = this.service.id === undefined;
            }
        });
    }

    isDownloadDataButtonDisabled(): boolean {
        return false;
    }

    edit(): void {
        this._serviceService.editEntity(this.service.id);
    }

    cancel(): void {
        this._serviceService.editEntity(null);

        if (this.service?.id === undefined) {
            this._router.navigate(['../'], { relativeTo: this._activatedRoute });
        }
    }

    menuItem1(service: Service) {
        this._confirmationDialogService
            .showWarningMessage({
                title: 'Are you sure?',
                text: "Confermi l'eliminazione di questo Servizio?",
                showCancelButton: true,
                confirmButtonText: 'Confirm',
            })
            .then(result => {
                if (result.value) {
                    this.loading = true;
                    this._serviceService.delete(service.id).subscribe({
                        next: () => {
                            this._refresh();
                        },
                        error: error => {
                            this.loading = false;
                            console.error(error);
                            // this._toastr.error(error.detail, 'Error!');
                        },
                    });
                }
            });
    }

    copyRif(service: Service) {
        console.log('menuItem2', service);
    }

    menuItem2(service: Service) {
        console.log('menuItem2', service);
    }

    save(): void {
        if (this.isCreate) {
            // console.log('Creating new service', this.service);
            this._serviceService
                .create(this.service)
                .pipe(untilDestroyed(this))
                .subscribe(() => {
                    this._refresh();

                    this._serviceService.editEntity(null);
                });
        } else {
            // console.log('Updating service', this.service);
            this._serviceService
                .update(this.service)
                .pipe(untilDestroyed(this))
                .subscribe(() => {
                    this._refresh();

                    this._serviceService.editEntity(null);
                });
        }
    }

    private _refresh(): void {
        this.snackBar.open(
            this._translocoService.translate('Messages.ChangesSuccessfullySaved'),
            this._translocoService.translate('General.Dismiss'),
            {
                panelClass: ['success'],
            },
        );

        // Refresh the service information
        if (this.service?.id) {
            this._serviceService.getById(this.service?.id).pipe(untilDestroyed(this)).subscribe();
        }

        // Refresh the list of service
        this._serviceService
            .listEntities()
            .pipe(untilDestroyed(this))
            .subscribe(() => {
                if (this.isCreate) {
                    this._router.navigate(['../'], { relativeTo: this._activatedRoute });
                }
            });
    }

    handleBookmark(service: Service): void {
        if (service.bookmarkId) {
            this._bookmarkService
                .delete(service.bookmarkId)
                .pipe(untilDestroyed(this))
                .subscribe(() => {
                    // Refresh the selected service
                    this._serviceService.getById(service.id).pipe(untilDestroyed(this)).subscribe();
                });
        } else {
            this._bookmarkService
                .create({
                    entityName: 'Service',
                    entityId: service.id,
                })
                .pipe(untilDestroyed(this))
                .subscribe(() => {
                    // Refresh the selected service
                    this._serviceService.getById(service.id).pipe(untilDestroyed(this)).subscribe();
                });
        }
    }

    handleCheck(service: Service): void {
        if (service.checked) {
            this._serviceService.setCheck(service);
        } else {
            this._serviceService.setUnCheck(service);
        }
    }
}
