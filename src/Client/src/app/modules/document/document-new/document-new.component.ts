import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslocoModule } from '@ngneat/transloco';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { FuseScrollResetDirective } from '@fuse/directives/scroll-reset';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AsyncPipe, DatePipe, DecimalPipe, JsonPipe, NgFor, NgIf } from '@angular/common';
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
import { MY_DATE_FORMATS } from 'app/constants';
import { PriceListService } from 'app/modules/configuration/price-list/price-list.service';
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
import { TagFiltersComponent } from 'app/modules/configuration/tags/filters/tag-filters.component';
import { debounceTime, distinctUntilChanged, Observable, switchMap } from 'rxjs';
import { Document } from './../document.types';
import { ServiceService } from 'app/modules/service/service.service';
import { Service } from 'app/modules/service/service.types';
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { MatSidenavModule } from '@angular/material/sidenav';

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
        MatPaginatorModule,
        MatMenuModule,
        MatExpansionModule,
        FuseScrollResetDirective,
        TranslocoModule,
        FuseDrawerComponent,
        MatSidenavModule,
    ],
})
export class DocumentNewComponent implements OnInit {
    document: Document = new Document();
    clientControl = new FormControl();
    servicesToBeBilled: Service[] = [];

    filteredClients: Observable<Contact[]>;

    drawerMode: 'over' | 'side' = 'side';
    drawerOpened = true;

    // @ViewChild('toBeBilledDrawer') toBeBilledDrawer: MatDrawer;

    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _contactService: ContactService,
        private _serviceService: ServiceService,
        private _priceListService: PriceListService,
    ) {}

    ngOnInit(): void {
        this.filteredClients = this.clientControl.valueChanges.pipe(
            debounceTime(100), // Attende 300ms dopo l'ultimo carattere digitato
            distinctUntilChanged(), // Evita chiamate duplicate per lo stesso valore
            switchMap(value => this._filterClients(value)),
        );
    }

    onDataChange(value: Contact) {}

    private _filterClients(value: string): Observable<Contact[]> {
        return this._contactService.filterClients(value);
    }

    onSelectedClient(event: any) {
        const selectedClient: Contact = event.option.value;
        this.document.client = selectedClient;
        this.document.clientId = selectedClient.id;
        this.clientControl.setValue(selectedClient.companyName);
        this.loadServicesToBeBuill();
    }

    loadServicesToBeBuill() {
        this._serviceService.listServicesToBeBilled(this.document.clientId).subscribe(services => {
            this.servicesToBeBilled = services;
            console.log('servicesToBeBilled', this.servicesToBeBilled);
        });
    }

    drawerOpenedChanged(event: Event) {
        console.log('drawerOpenedChanged', event);
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
        // TODO: implementa la logica di inserimento, ad esempio aggiungili al documento
        console.log('Servizi selezionati da inserire:', selectedServices);
        // Esempio: this.document.services = [...(this.document.services || []), ...selectedServices];
    }

    get hasSelectedServices(): boolean {
        return this.servicesToBeBilled && this.servicesToBeBilled.some(s => s.selected);
    }
}
