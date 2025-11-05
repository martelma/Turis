import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { FuseScrollResetDirective } from '@fuse/directives/scroll-reset';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AsyncPipe, DatePipe, DecimalPipe, JsonPipe, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { UntilDestroy } from '@ngneat/until-destroy';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MatExpansionModule } from '@angular/material/expansion';
import { EsigibilitaIVATypes, MY_DATE_FORMATS } from 'app/constants';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
    DateAdapter,
    MAT_DATE_FORMATS,
    MAT_DATE_LOCALE,
    MatNativeDateModule,
    MatOptionModule,
} from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Contact } from 'app/modules/contact/contact.types';
import { ContactService } from 'app/modules/contact/contact.service';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { debounceTime, distinctUntilChanged, Observable, switchMap } from 'rxjs';
import { Payment, PaymentItem } from './../payment.types';
import { ServiceService } from 'app/modules/service/service.service';
import { Service } from 'app/modules/service/service.types';
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { MatSidenavModule } from '@angular/material/sidenav';
import { forEach } from 'lodash';
import { generateGuid } from 'app/shared/shared.utils';
import { PaymentService } from '../payment.service';
import { AliquotaIvaService } from 'app/modules/configuration/aliquote-iva/aliquote-iva.service';
import { AliquotaIva } from 'app/modules/configuration/aliquote-iva/aliquota-iva.types';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ConfirmationDialogService } from 'app/shared/services/confirmation-dialog.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PaymentTypeService } from 'app/modules/configuration/payment-types/payment-types.service';
import { PaymentType } from 'app/modules/configuration/payment-types/payment-types.types';
import { CollaboratorPaymentSummary } from 'app/modules/document/document.types';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { YearsToggleComponent } from 'app/shared/components/years-toggle/years-toggle.component';

@UntilDestroy()
@Component({
    selector: 'app-payment-new',
    templateUrl: './payment-new.component.html',
    styleUrls: ['./payment-new.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    providers: [
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
        { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    ],
    imports: [
        ReactiveFormsModule,
        NgIf,
        NgFor,
        DecimalPipe,
        DatePipe,
        AsyncPipe,
        JsonPipe,
        FormsModule,
        RouterOutlet,
        RouterLink,
        MatAutocompleteModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSelectModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatOptionModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatTabsModule,
        MatTooltipModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatPaginatorModule,
        MatMenuModule,
        MatExpansionModule,
        MatSnackBarModule,
        FuseScrollResetDirective,
        TranslocoModule,
        FuseDrawerComponent,
        MatSidenavModule,
        NgTemplateOutlet,
        YearsToggleComponent,
    ],
})
export class PaymentNewComponent implements OnInit {
    waiting = false;
    payment: Payment = new Payment();
    collaboratorControl = new FormControl();
    servicesToBePaid: Service[] = [];

    aliquoteIva: AliquotaIva[] = [];
    paymentTypes: PaymentType[] = [];

    filteredCollaborators: Observable<Contact[]>;

    drawerMode: 'over' | 'side' = 'side';
    drawerOpened = true;

    selectedItem: PaymentItem | null = null;
    selectedItemForm: UntypedFormGroup;

    esigibilitaIVATypes = EsigibilitaIVATypes;

    generateGuid = generateGuid();

    countClientsToBePaid: number;
    totalServiceCount = 0;
    totalPaymentAmount = 0;

    collaboratorsToBePaid: CollaboratorPaymentSummary[] = [];
    countCollaboratorsToBePaid: number;

    currentYear: number = new Date().getFullYear();

    constructor(
        private _paymentService: PaymentService,
        private _contactService: ContactService,
        private _serviceService: ServiceService,
        private _confirmationDialogService: ConfirmationDialogService,
        private _translocoService: TranslocoService,
        public snackBar: MatSnackBar,
    ) {}

    ngOnInit(): void {
        this.filteredCollaborators = this.collaboratorControl.valueChanges.pipe(
            debounceTime(100), // Attende 300ms dopo l'ultimo carattere digitato
            distinctUntilChanged(), // Evita chiamate duplicate per lo stesso valore
            switchMap(value => this._filterCollaborators(value)),
        );

        this.loadCollaboratorsToBePaid();
        // this.loadServicesToBePaid();
    }

    onDataChange(value: Contact) {}

    onYearChange(year: number) {
        this.currentYear = year;
        this.loadCollaboratorsToBePaid();
    }

    private _filterCollaborators(value: string): Observable<Contact[]> {
        return this._contactService.filterCollaborators(value);
    }

    onSelectedCollaborator(event: any) {
        this.setCollaborator(event.option.value);
    }

    loadCollaboratorsToBePaid() {
        this._contactService.listCollaboratorsToBePaid(this.currentYear).subscribe(data => {
            this.collaboratorsToBePaid = data;
            // console.log('collaboratorsToBePaid', this.collaboratorsToBePaid);
            this.countCollaboratorsToBePaid = this.collaboratorsToBePaid.length;
            this.totalServiceCount = this.collaboratorsToBePaid.reduce(
                (total, client) => total + (client.serviceCount || 0),
                0,
            );
            this.totalPaymentAmount = this.collaboratorsToBePaid.reduce(
                (total, client) => total + (client.totalAmount || 0),
                0,
            );
        });
    }

    loadServicesToBePaid() {
        this._serviceService.listServicesToBePaid(this.currentYear, this.payment.collaboratorId).subscribe(services => {
            this.servicesToBePaid = services;
            console.log('servicesToBePaid', this.servicesToBePaid);
        });
    }

    drawerOpenedChanged(event: Event) {
        // console.log('drawerOpenedChanged', event);
    }

    checkAll() {
        if (this.servicesToBePaid) {
            this.servicesToBePaid.forEach(service => {
                service.selected = true;
            });
        }
    }

    uncheckAll() {
        if (this.servicesToBePaid) {
            this.servicesToBePaid.forEach(service => {
                service.selected = false;
            });
        }
    }

    onInsertSelectedServices() {
        const selectedServices = this.servicesToBePaid.filter(s => s.selected);
        // console.log('Servizi selezionati da inserire:', selectedServices);

        selectedServices.map(service => {
            const newItem: PaymentItem = {
                id: generateGuid(),
                paymentId: '',
                serviceId: service.id,
                service: service,
            };

            this.payment.items.push(newItem);
        });

        forEach(this.payment.items, det => {
            this.payment.total += det.service.commission;
        });
    }

    get hasSelectedServices(): boolean {
        return this.servicesToBePaid && this.servicesToBePaid.some(s => s.selected);
    }

    toggleDetails(itemId: string): void {
        if (this.selectedItem && this.selectedItem.id === itemId) {
            this.selectedItem = null; // Deselect if the same item is clicked
        } else {
            this.selectedItem = this.payment.items.find(item => item.id === itemId) || null;
        }
    }

    updateSelectedItem(): void {
        console.log('paymentItem', this.selectedItem);
    }

    deleteSelectedItem(): void {
        if (!this.selectedItem) return;

        const idx = this.payment.items.findIndex(item => item.id === this.selectedItem?.id);
        if (idx > -1) {
            this.payment.items.splice(idx, 1);
            this.selectedItem = null;
        }
    }

    setCollaborator(collaborator: Contact) {
        console.log('collaborator selected', collaborator);
        this.payment.collaborator = collaborator;
        this.payment.collaboratorId = collaborator.id;

        this.payment.date = new Date();

        console.log('payment', this.payment);

        this.collaboratorControl.setValue(collaborator.fullName);
        this.loadServicesToBePaid();
    }

    // dropPaymentItem(event: CdkDragDrop<PaymentItem[]>) {
    //     moveItemInArray(this.payment.items, event.previousIndex, event.currentIndex);
    //     // Aggiorna la property row per ogni item secondo il nuovo ordinamento
    //     this.payment.items.forEach((item, idx) => {
    //         item.row = idx + 1;
    //     });
    // }

    resetCollaborator() {
        this.payment.collaborator = null;
        this.payment.collaboratorId = null;
        this.payment.items = [];
        this.servicesToBePaid = [];
        this.payment.date = new Date();
        this.collaboratorControl.setValue('');
    }

    save() {
        console.log('payment to save', this.payment);

        this._confirmationDialogService
            .showWarningMessage({
                title: 'Are you sure?',
                text: 'Confermi il salvataggio del paymento corrente?',
                showCancelButton: true,
                confirmButtonText: 'Confirm',
            })
            .then(result => {
                if (result.value) {
                    this.waiting = true;
                    this._paymentService.updateEntity(this.payment?.id, this.payment).subscribe({
                        next: () => {
                            this.snackBar.open(
                                this._translocoService.translate('Messages.RecordSuccessfullySaved'),
                                this._translocoService.translate('General.Dismiss'),
                                {
                                    panelClass: ['success'],
                                },
                            );
                        },
                        error: error => {
                            this.waiting = false;
                            console.error(error);
                            this.snackBar.open(error.message, this._translocoService.translate('General.Dismiss'), {
                                panelClass: ['error'],
                            });
                        },
                    });
                }
            });
    }
}
