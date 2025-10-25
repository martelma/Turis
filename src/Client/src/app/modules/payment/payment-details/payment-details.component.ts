import { MatRippleModule } from '@angular/material/core';
import { CommonModule, DatePipe, JsonPipe, NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FuseScrollResetDirective } from '@fuse/directives/scroll-reset';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { fuseAnimations } from '@fuse/animations';
import { SpinnerButtonComponent } from 'app/shared/components/ui/spinner-button/spinner-button.component';
import { tap } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { BookmarkService } from 'app/modules/bookmark/bookmark.service';
import { PaymentComponent } from '../payment.component';
import { trackByFn } from 'app/shared';
import { Payment } from '../payment.types';
import { PaymentService } from '../payment.service';
import { TagSummaryComponent } from 'app/shared/components/tag-summary/tag-summary.component';
import { ConfirmationDialogService } from 'app/shared/services/confirmation-dialog.service';
import { PaymentViewComponent } from '../payment-view/payment-view.component';
import { PaymentEditComponent } from '../payment-edit/payment-edit.component';

@UntilDestroy()
@Component({
    selector: 'app-payment-details',
    templateUrl: './payment-details.component.html',
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
        CommonModule,
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
        SpinnerButtonComponent,
        PaymentViewComponent,
        PaymentEditComponent,
        TagSummaryComponent,
    ],
})
export class PaymentDetailsComponent implements OnInit {
    @ViewChild(PaymentViewComponent) viewPayment: PaymentViewComponent;
    @ViewChild(PaymentEditComponent) editPayment: PaymentEditComponent;

    editMode = false;
    isCreate = false;
    isCopy = false;
    isDownloading = false;
    downloadingData = false;
    validating = false;
    loading = false;

    payment: Payment;

    //queste devono diventare scope
    userCanDeletePayment = true;
    userCanUpdatePayment = true;
    userCanValidatePayment = true;
    userCanDownloadData = true;

    trackByFn = trackByFn;

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _translocoService: TranslocoService,
        private _bookmarkService: BookmarkService,
        private _paymentService: PaymentService,
        private _confirmationDialogService: ConfirmationDialogService,
        public snackBar: MatSnackBar,

        public paymentComponent: PaymentComponent,
    ) {}

    ngOnInit(): void {
        this._subscribeRouteParams();

        this._subscribePayment();
        this._subscribePaymentEdited();
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

    private _subscribePayment() {
        this._paymentService.item$
            .pipe(
                tap((payment: Payment) => {
                    this.setPayment(payment);
                }),
                untilDestroyed(this),
            )
            .subscribe((payment: Payment) => {
                this.payment = payment;

                this.editMode = payment?.id === undefined;
            });
    }

    private setPayment(payment: Payment): void {
        this.payment = payment;
    }

    private _subscribePaymentEdited(): void {
        this._paymentService.edited$.pipe(untilDestroyed(this)).subscribe((paymentId: string) => {
            if (paymentId != null) {
                this._paymentService
                    .getById(paymentId)
                    .pipe(untilDestroyed(this))
                    .subscribe(() => {
                        this.editMode = true;
                    });
            } else {
                this.editMode = this.payment.id === undefined;
            }
        });
    }

    edit(): void {
        this._paymentService.editEntity(this.payment.id);
    }

    cancel(): void {
        this._paymentService.editEntity(null);

        if (this.payment?.id === undefined) {
            this._router.navigate(['../'], { relativeTo: this._activatedRoute });
        }
    }

    save(): void {
        this._paymentService
            .update(this.payment)
            .pipe(untilDestroyed(this))
            .subscribe(() => {
                this._refresh();
            });
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
        if (this.payment?.id) {
            this._paymentService.getById(this.payment?.id).pipe(untilDestroyed(this)).subscribe();
        }

        // Refresh the list of service
        this._paymentService
            .listEntities()
            .pipe(untilDestroyed(this))
            .subscribe(() => {
                if (this.isCreate) {
                    this._router.navigate(['../'], { relativeTo: this._activatedRoute });
                }
            });
    }

    handleBookmark(payment: Payment): void {
        if (payment.bookmarkId) {
            this._bookmarkService
                .delete(payment.bookmarkId)
                .pipe(untilDestroyed(this))
                .subscribe(() => {
                    // Refresh the selected service
                    this._paymentService.getById(payment.id).pipe(untilDestroyed(this)).subscribe();
                });
        } else {
            this._bookmarkService
                .create({
                    entityName: 'Payment',
                    entityId: payment.id,
                })
                .pipe(untilDestroyed(this))
                .subscribe(() => {
                    // Refresh the selected service
                    this._paymentService.getById(payment.id).pipe(untilDestroyed(this)).subscribe();
                });
        }
    }

    menuItem1(payment: Payment) {
        this._confirmationDialogService
            .showWarningMessage({
                title: 'Are you sure?',
                text: "Confermi l'eliminazione di questo Record?",
                showCancelButton: true,
                confirmButtonText: 'Confirm',
            })
            .then(result => {
                if (result.value) {
                    this.loading = true;
                    this._paymentService.delete(payment.id).subscribe({
                        next: () => {
                            this.editMode = false;
                            this.isCreate = false;
                            this.isCopy = false;
                            this.isDownloading = false;

                            this.payment = null;

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
}
