import { Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { TranslocoModule } from '@ngneat/transloco';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FuseScrollResetDirective } from '@fuse/directives/scroll-reset';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Collaborator, Service } from '../service.types';
import { AsyncPipe, JsonPipe, NgFor, NgIf, NgClass } from '@angular/common';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { trackByFn } from 'app/shared';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MatExpansionModule } from '@angular/material/expansion';
import {
    DurationTypes,
    getStatusColorClass,
    getStatusText,
    getWorkflowCollaboratorStatusColorClass,
    getWorkflowCollaboratorStatusText,
    MY_DATE_FORMATS,
    ServiceTypes,
    StatusTypes,
    WorkflowCollaboratorStatusTypes,
} from 'app/constants';
import { PriceList } from 'app/modules/configuration/price-list/price-list.types';
import { PriceListService } from 'app/modules/configuration/price-list/price-list.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { LanguageService } from 'app/modules/configuration/languages/language.service';
import { Language } from 'app/modules/configuration/languages/language.types';
import {
    DateAdapter,
    MAT_DATE_FORMATS,
    MAT_DATE_LOCALE,
    MatNativeDateModule,
    MatOptionModule,
} from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Contact } from 'app/modules/contact/contact.types';
import { debounceTime, distinctUntilChanged, Observable, switchMap } from 'rxjs';
import { ContactService } from 'app/modules/contact/contact.service';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { Tag } from 'app/modules/configuration/tags/tag.types';
import { TagFiltersComponent } from 'app/modules/configuration/tags/filters/tag-filters.component';
import { ServiceService } from '../service.service';
import { Attachment } from 'app/shared/components/attachments/attachment.types';
import { AttachmentsComponent } from 'app/shared/components/attachments/attachments.component';
import { LinkedServicesComponent } from '../linked-services/linked-services.component';

@UntilDestroy()
@Component({
    selector: 'app-service-edit',
    templateUrl: './service-edit.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./service-edit.component.scss'],
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
        NgClass,
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
        TagFiltersComponent,
        AttachmentsComponent,
        LinkedServicesComponent,
    ],
})
export class ServiceEditComponent implements OnInit {
    @ViewChild(MatTabGroup) matTabGroup: MatTabGroup;

    item: Service;
    @Input()
    set service(value: Service) {
        this.item = value;
        if (this.item.id === undefined) {
            this.service.status = StatusTypes[0].value;
            this.service.serviceType = ServiceTypes[0].value;
            this.service.durationType = DurationTypes[0].value;
            this.service.workflowCollaboratorStatus = WorkflowCollaboratorStatusTypes[0].value;
        }
        console.log('item', this.item);

        this.clientControl.setValue(this.item.client?.companyName);
        this.collaboratorControl.setValue(this.item.collaborator?.fullName);

        this.onDataChange(value);
    }

    get service(): Service {
        return this.item;
    }

    onDataChange(value: Service) {
        this.originalItem = JSON.parse(JSON.stringify(value));
    }

    originalItem: Service = null;
    changed = false;

    minDate = new Date(2020, 0, 1); // 1 gennaio 2020
    maxDate = new Date(2030, 11, 31); // 31 dicembre 2030

    filteredClients: Observable<Contact[]>;
    filteredCollaborators: Observable<Collaborator[]>;

    serviceTypes = ServiceTypes;
    durationTypes = DurationTypes;
    statusTypes = StatusTypes;
    workflowCollaboratorStatus = WorkflowCollaboratorStatusTypes;

    originalPriceLists: PriceList[] = [];
    priceLists: PriceList[] = [];
    languages: Language[] = [];

    clientControl = new FormControl();
    collaboratorControl = new FormControl();

    trackByFn = trackByFn;
    getStatusColorClass = getStatusColorClass;
    getStatusText = getStatusText;
    getWorkflowCollaboratorStatusColorClass = getWorkflowCollaboratorStatusColorClass;
    getWorkflowCollaboratorStatus = getWorkflowCollaboratorStatusText;

    constructor(
        private _serviceService: ServiceService,
        private _priceListService: PriceListService,
        private _languageService: LanguageService,
        private _contactService: ContactService,
    ) {
        this.serviceTypes = ServiceTypes;
        this.durationTypes = DurationTypes;
    }

    ngOnInit(): void {
        this.loadPriceLists();
        this.loadLanguages();

        this.filteredClients = this.clientControl.valueChanges.pipe(
            debounceTime(100), // Attende 300ms dopo l'ultimo carattere digitato
            distinctUntilChanged(), // Evita chiamate duplicate per lo stesso valore
            switchMap(value => this._filterClients(value)),
        );

        this.filteredCollaborators = this.collaboratorControl.valueChanges.pipe(
            debounceTime(100), // Attende 300ms dopo l'ultimo carattere digitato
            distinctUntilChanged(), // Evita chiamate duplicate per lo stesso valore
            switchMap(value => this._filterCollaborators(value)),
        );
    }

    private _filterClients(value: string): Observable<Contact[]> {
        return this._contactService.filterClients(value);
    }

    private _filterCollaborators(value: string): Observable<Collaborator[]> {
        return this._contactService.filterCollaborators(value);
    }

    onPriceListSelected(event: any) {
        const selectedPriceList: PriceList = event.value;
        this.item.priceListId = selectedPriceList.id;
        this.item.priceList = selectedPriceList;
        this.rebuild();
    }

    onSelectedClient(event: any) {
        const selectedClient: Contact = event.option.value;
        this.item.client = selectedClient;
        this.item.clientId = selectedClient.id;
        this.clientControl.setValue(selectedClient.companyName);
        this.rebuild();
    }

    onSelectedCollaborator(event: any) {
        const selectedCollaborator: Collaborator = event.option.value;
        this.item.collaborator = selectedCollaborator;
        this.item.collaboratorId = selectedCollaborator.id;
        this.collaboratorControl.setValue(selectedCollaborator.fullName);

        this.item.workflowCollaboratorStatus = WorkflowCollaboratorStatusTypes.find(x => x.text === 'Pending')?.value;

        this.rebuild();
    }

    loadPriceLists() {
        this._priceListService
            .listEntities()
            .pipe(untilDestroyed(this))
            .subscribe(list => {
                this.priceLists = list.items;
                this.originalPriceLists = JSON.parse(JSON.stringify(list.items));
            });
    }

    loadLanguages() {
        this._languageService
            .listEntities()
            .pipe(untilDestroyed(this))
            .subscribe(list => {
                this.languages = list.items;
                // console.log('languages', this.languages);
            });
    }

    onChanged() {
        this.checkChanged();
    }

    checkChanged(): void {
        if (this.service && this.originalItem) {
            this.changed = JSON.stringify(this.service) !== JSON.stringify(this.originalItem);
        }
    }

    onSelectedTabChange(): void {
        // Do nothing
    }

    serviceTypeChanged(): void {
        this.filterPriceList();
        this.rebuild();
    }

    durationTypeChanged(): void {
        this.filterPriceList();
        this.rebuild();
    }

    statusTypeChanged(): void {}

    peopleChanged(): void {
        this.filterPriceList();
        this.rebuild();
    }

    filterPriceList() {
        this.priceLists = this.originalPriceLists.filter(item => {
            return (
                (!this.service.serviceType || item.serviceType === this.service.serviceType) &&
                (!this.service.durationType || item.durationType === this.service.durationType) &&
                (item.maxCount === 0 || this.service.people <= item.maxCount)
            );
        });

        //devo verificare se è ancora valido (in termini di serviceType e durationType) il listino eventualmente selezionato
        if (this.service.priceList?.serviceType !== this.service.serviceType) {
            this.service.priceListId = null;
            this.service.priceList = null;
        }
        if (this.service.priceList?.durationType !== this.service.durationType) {
            this.service.priceListId = null;
            this.service.priceList = null;
        }
    }

    rebuild() {
        if (this.service.priceList) {
            if (this.service.people <= this.service.priceList.maxCount) {
                this.service.priceCalculated = this.service.priceList.price;
            } else {
                this.service.priceCalculated =
                    this.service.priceList.price +
                    (this.service.people - this.service.priceList.maxCount) * this.service.priceList.priceExtra;
            }
        } else {
            this.service.priceCalculated = 0;
        }

        if (this.service.collaborator) {
            if (this.service.serviceType === 'Guida') {
                this.service.commissionPercentage = this.service.collaborator.percentageGuida;
            } else if (this.service.serviceType === 'Accompagnamento') {
                this.service.commissionPercentage = this.service.collaborator.percentageAccompagnamento;
            }

            if (this.service.price > 0) {
                this.service.commissionCalculated =
                    (this.service.price * (100 - this.service.commissionPercentage)) / 100;
            } else {
                this.service.commissionCalculated =
                    (this.service.priceCalculated * (100 - this.service.commissionPercentage)) / 100;
            }
        } else {
            this.service.commissionPercentage = 0;
            this.service.commissionCalculated = 0;
        }

        this.checkChanged();
    }

    onTagsSelectionChange(tags: Tag[]): void {
        this.service.tags = tags;
        this.checkChanged();
    }

    notifyProposal() {
        // console.log('notifyProposal called', this.service);
        this.service.workflowCollaboratorStatus = WorkflowCollaboratorStatusTypes.find(
            x => x.text === 'Pending',
        )?.value;

        this._serviceService
            .saveEntity(this.service.id, this.service)
            .pipe(untilDestroyed(this))
            .subscribe(() => {
                this._serviceService
                    .notifyProposal(this.service.id)
                    .pipe(untilDestroyed(this))
                    .subscribe(() => {});
            });
    }

    notifyReminder() {
        console.log('notifyReminder called', this.service);
    }
}
