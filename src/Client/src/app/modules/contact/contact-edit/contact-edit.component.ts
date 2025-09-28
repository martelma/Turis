import { Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { TranslocoModule } from '@ngneat/transloco';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { FuseScrollResetDirective } from '@fuse/directives/scroll-reset';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AsyncPipe, JsonPipe, NgFor, NgIf } from '@angular/common';
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
import { ContactTypes, DocumentTypes, MY_DATE_FORMATS, Sexs } from 'app/constants';
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
import { ContactService } from 'app/modules/contact/contact.service';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { Tag } from 'app/modules/configuration/tags/tag.types';
import { TagFiltersComponent } from 'app/modules/configuration/tags/filters/tag-filters.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TargetComponent } from 'app/modules/collaborator/target/target.component';

@UntilDestroy()
@Component({
    selector: 'app-contact-edit',
    templateUrl: './contact-edit.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./contact-edit.component.scss'],
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
        MatSlideToggleModule,
        MatExpansionModule,
        FuseScrollResetDirective,
        TranslocoModule,
        TagFiltersComponent,
        TargetComponent,
    ],
})
export class ContactEditComponent implements OnInit {
    item: Contact;
    @Input()
    set contact(value: Contact) {
        this.item = value;
        this.onDataChange(value);
    }

    get contact(): Contact {
        return this.item;
    }

    onDataChange(value: Contact) {
        this.originalItem = JSON.parse(JSON.stringify(value));
    }

    originalItem: Contact = null;
    changed = false;

    minDate = new Date(2020, 0, 1); // 1 gennaio 2020
    maxDate = new Date(2030, 11, 31); // 31 dicembre 2030

    sexs = Sexs;
    languages: Language[] = [];

    @ViewChild(MatTabGroup) matTabGroup: MatTabGroup;

    trackByFn = trackByFn;

    contactTypes = ContactTypes;
    documentTypes = DocumentTypes;

    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _contactService: ContactService,
        private _priceListService: PriceListService,
        private _languageService: LanguageService,
    ) {}

    ngOnInit(): void {
        this.loadLanguages();
        this.sexs = Sexs;
    }

    loadLanguages() {
        this._languageService
            .listEntities()
            .pipe(untilDestroyed(this))
            .subscribe(list => {
                this.languages = list.items;
            });
    }

    onChanged() {
        // console.log('onChanged');
        this.checkChanged();
    }

    checkChanged(): void {
        if (this.contact && this.originalItem) {
            this.changed = JSON.stringify(this.contact) !== JSON.stringify(this.originalItem);
        }
    }

    onSelectedTabChange(): void {
        // Do nothing
    }

    onTagsSelectionChange(tags: Tag[]): void {
        this.contact.tags = tags;
        this.checkChanged();
    }
}
