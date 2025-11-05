import { MatButtonToggleModule } from '@angular/material/button-toggle';
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
import { ClientBillingSummary, Document, DocumentItem } from './../document.types';
import { ServiceService } from 'app/modules/service/service.service';
import { Service } from 'app/modules/service/service.types';
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { MatSidenavModule } from '@angular/material/sidenav';
import { forEach } from 'lodash';
import { generateGuid } from 'app/shared/shared.utils';
import { DocumentService } from '../document.service';
import { AliquotaIvaService } from 'app/modules/configuration/aliquote-iva/aliquote-iva.service';
import { AliquotaIva } from 'app/modules/configuration/aliquote-iva/aliquota-iva.types';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ConfirmationDialogService } from 'app/shared/services/confirmation-dialog.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PaymentTypeService } from 'app/modules/configuration/payment-types/payment-types.service';
import { PaymentType } from 'app/modules/configuration/payment-types/payment-types.types';
import { YearsToggleComponent } from 'app/shared/components/years-toggle/years-toggle.component';

@UntilDestroy()
@Component({
    selector: 'app-document-new',
    templateUrl: './document-new.component.html',
    styleUrls: ['./document-new.component.scss'],
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
        MatButtonModule,
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
export class DocumentNewComponent implements OnInit {
    waiting = false;
    document: Document = new Document();
    clientControl = new FormControl();
    clientsToBeBilled: ClientBillingSummary[] = [];
    servicesToBeBilled: Service[] = [];

    aliquoteIva: AliquotaIva[] = [];
    paymentTypes: PaymentType[] = [];

    filteredClients: Observable<Contact[]>;

    drawerMode: 'over' | 'side' = 'side';
    drawerOpened = true;

    selectedItem: DocumentItem | null = null;
    selectedItemForm: UntypedFormGroup;

    esigibilitaIVATypes = EsigibilitaIVATypes;

    generateGuid = generateGuid();

    countClientsToBeBilled: number;
    totalServiceCount = 0;
    totalBillingAmount = 0;

    currentYear: number = new Date().getFullYear();

    constructor(
        private _documentService: DocumentService,
        private _contactService: ContactService,
        private _serviceService: ServiceService,
        private _aliquotaIvaService: AliquotaIvaService,
        private _paymentTypeService: PaymentTypeService,
        private _confirmationDialogService: ConfirmationDialogService,
        private _translocoService: TranslocoService,
        public snackBar: MatSnackBar,
    ) {}

    ngOnInit(): void {
        this.filteredClients = this.clientControl.valueChanges.pipe(
            debounceTime(100), // Attende 300ms dopo l'ultimo carattere digitato
            distinctUntilChanged(), // Evita chiamate duplicate per lo stesso valore
            switchMap(value => this._filterClients(value)),
        );

        this._aliquotaIvaService.list().subscribe(list => {
            this.aliquoteIva = list.items;
            // console.log('Aliquote IVA:', this.aliquoteIva);
        });

        this._paymentTypeService.list().subscribe(list => {
            this.paymentTypes = list.items;
            // console.log('paymentTypes:', this.paymentTypes);
        });

        this.loadClientsToBeBill();
    }

    onDataChange(value: Contact) {}

    onYearChange(year: number) {
        this.currentYear = year;
        this.loadClientsToBeBill();
    }

    private _filterClients(value: string): Observable<Contact[]> {
        return this._contactService.filterClients(value);
    }

    onSelectedClient(event: any) {
        const selectedClient: Contact = event.option.value;

        this.setClient(selectedClient);
    }

    loadClientsToBeBill() {
        this._contactService.listClientsToBeBilled(this.currentYear).subscribe(data => {
            this.clientsToBeBilled = data;
            // console.log('clientsToBeBilled', this.clientsToBeBilled);
            this.countClientsToBeBilled = this.clientsToBeBilled.length;
            this.totalServiceCount = this.clientsToBeBilled.reduce(
                (total, client) => total + (client.serviceCount || 0),
                0,
            );
            this.totalBillingAmount = this.clientsToBeBilled.reduce(
                (total, client) => total + (client.totalAmount || 0),
                0,
            );
        });
    }

    loadServicesToBeBill() {
        this._serviceService.listServicesToBeBilled(this.currentYear, this.document.clientId).subscribe(services => {
            this.servicesToBeBilled = services;
            // console.log('servicesToBeBilled', this.servicesToBeBilled);
        });
    }

    drawerOpenedChanged(event: Event) {
        // console.log('drawerOpenedChanged', event);
    }

    checkAll() {
        if (this.servicesToBeBilled) {
            this.servicesToBeBilled.forEach(service => {
                service.selected = true;
            });
        }
    }

    uncheckAll() {
        if (this.servicesToBeBilled) {
            this.servicesToBeBilled.forEach(service => {
                service.selected = false;
            });
        }
    }

    onInsertSelectedServices() {
        const selectedServices = this.servicesToBeBilled.filter(s => s.selected);
        // console.log('Servizi selezionati da inserire:', selectedServices);

        const newItems = selectedServices.map(service => {
            const newItem: DocumentItem = {
                id: generateGuid(),
                documentId: this.document.id,
                document: this.document,
                serviceId: service.id,
                service: service,
                row: 0,
                code: service.code,
                description: service.title,
                codiceNatura: '',
                riferimentoNormativo: '',
                quantity: 1,
                discountPercentage: 0,
                codiceEsigibilitaIVA: 0,
                price: service.priceCalculated,
                vat: null,
                vatRate: 0,
                vatAmount: 0,
                rowAmount: 0,
                selected: false,
            };

            this.document.items.push(newItem);

            return this.refreshAmounts(newItem);
        });
    }

    public refreshAmounts(item: DocumentItem): DocumentItem {
        item.vatRate = item.vat?.aliquota || 0;
        item.rowAmount = item.quantity * item.price - (item.quantity * item.price * item.discountPercentage) / 100;

        // Castelletto IVA: raggruppa gli importi per aliquota
        const ivaMap: { [aliquota: number]: number } = {};
        let totalVat = 0;
        let totalDoc = 0;

        forEach(this.document.items, det => {
            const aliquota = det.vatRate || 0;
            if (!ivaMap[aliquota]) {
                ivaMap[aliquota] = 0;
            }
            ivaMap[aliquota] += det.rowAmount;
            totalDoc += det.rowAmount;
        });

        // Calcola l'importo IVA per ogni aliquota e somma
        for (const aliquota in ivaMap) {
            const imponibile = ivaMap[aliquota];
            const perc = Number(aliquota);
            const iva = (imponibile * perc) / 100;
            totalVat += iva;
        }

        this.document.totalExemptExpenses = totalDoc;
        this.document.vat = totalVat;
        this.document.total = totalDoc + totalVat;

        return item;
    }

    get hasSelectedServices(): boolean {
        return this.servicesToBeBilled && this.servicesToBeBilled.some(s => s.selected);
    }

    toggleDetails(itemId: string): void {
        if (this.selectedItem && this.selectedItem.id === itemId) {
            this.selectedItem = null; // Deselect if the same item is clicked
        } else {
            this.selectedItem = this.document.items.find(item => item.id === itemId) || null;
        }
    }

    updateSelectedItem(): void {
        console.log('documentItem', this.selectedItem);
    }

    deleteSelectedItem(): void {
        if (!this.selectedItem) return;

        const idx = this.document.items.findIndex(item => item.id === this.selectedItem?.id);
        if (idx > -1) {
            this.document.items.splice(idx, 1);
            this.selectedItem = null;
        }
    }

    onAliquotaIVAChange(item: DocumentItem): void {
        // console.log('onAliquotaIVAChange', item);
        item.codiceNatura = item.vat?.codiceNatura;
        item.riferimentoNormativo = item.vat?.description;
        item.vatRate = item.vat?.aliquota || 0;

        item = this.refreshAmounts(item);
    }

    // setBillTo() {
    //     this._contactService.getById('76ddf85d-259a-4bf0-9452-9757ecf7b072').subscribe(selectedClient => {
    //         this.setClient(selectedClient);
    //     });
    // }

    dropDocumentItem(event: CdkDragDrop<DocumentItem[]>) {
        moveItemInArray(this.document.items, event.previousIndex, event.currentIndex);
        // Aggiorna la property row per ogni item secondo il nuovo ordinamento
        this.document.items.forEach((item, idx) => {
            item.row = idx + 1;
        });
    }

    setClient(client: Contact) {
        this.document.client = client;
        this.document.clientId = client.id;

        this.document.date = new Date();
        this.document.sectional = new Date().getFullYear().toString();

        console.log('document', this.document);

        this.clientControl.setValue(client.companyName);
        this.loadServicesToBeBill();
    }

    resetClient() {
        this.document.client = null;
        this.document.clientId = null;
        this.document.items = [];
        this.servicesToBeBilled = [];
        this.document.date = new Date();
        this.document.sectional = new Date().getFullYear().toString();
        this.clientControl.setValue('');
    }

    save() {
        console.log('document to save', this.document);

        this._confirmationDialogService
            .showWarningMessage({
                title: 'Are you sure?',
                text: 'Confermi il salvataggio del documento corrente?',
                showCancelButton: true,
                confirmButtonText: 'Confirm',
            })
            .then(result => {
                if (result.value) {
                    this.waiting = true;
                    this._documentService.updateEntity(this.document?.id, this.document).subscribe({
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

    onPaymentTypeChange(event: any) {
        // console.log('Selected payment type:', event.value);
        this.document.sdiCodiceTipoPagamento = event.value.sdiCode;
        this.document.sdiValoreTipoPagamento = event.value.sdiName;
    }
}
