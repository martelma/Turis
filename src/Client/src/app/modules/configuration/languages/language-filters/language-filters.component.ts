import { Language, LanguageSearchParameters } from './../language.types';
import {
    AfterViewChecked,
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { JsonPipe, NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SelectionModel } from '@angular/cdk/collections';
import { SearchInputComponent } from 'app/components/ui/search-input/search-input.component';
import { PaginatedListResult } from 'app/shared/services/shared.types';
import { trackByFn } from 'app/shared';
import { LanguageService } from '../language.service';

@UntilDestroy()
@Component({
    selector: 'language-filters',
    templateUrl: './language-filters.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgStyle,
        NgClass,
        JsonPipe,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatListModule,
        MatProgressBarModule,
        MatPaginatorModule,
        MatTooltipModule,
        TranslocoModule,
        SearchInputComponent,
    ],
})
export class LanguageFiltersComponent implements OnInit, AfterViewInit, AfterViewChecked {
    @Input() language: Language[];
    @Input() selectedLanguage: Language[];
    @Output() selectionChange: EventEmitter<Language[]> = new EventEmitter<Language[]>();

    @ViewChild('languageList') languageList: ElementRef;
    _selectionModel: SelectionModel<Language>;

    totalResults: Language[] = [];
    results: PaginatedListResult<Language>;
    filteredResults: PaginatedListResult<Language>;

    itemsLoading = false;
    queryParameters: LanguageSearchParameters;
    showOnlySelected = false;

    /*
     * Used to avoid flickering in the ui upon load
     */
    dataLoaded = false;

    activeLang: string;

    trackByFn = trackByFn;

    constructor(
        private _languageService: LanguageService,
        private _translocoService: TranslocoService,
        private _changeDetectorRef: ChangeDetectorRef,
    ) {}

    ngAfterViewChecked(): void {
        this._changeDetectorRef.detectChanges();
    }

    ngOnInit(): void {
        this.activeLang = this._translocoService.getActiveLang();

        // Subscribe to language changes
        this._translocoService.langChanges$.pipe(untilDestroyed(this)).subscribe(activeLang => {
            // Get the active lang
            this.activeLang = activeLang;
        });
    }

    ngAfterViewInit(): void {
        // Language
        this._languageService.language$
            .pipe(untilDestroyed(this))
            .subscribe((results: PaginatedListResult<Language>) => {
                this._setResults(results);
            });

        // Query parameters
        this._languageService.queryParameters$
            .pipe(untilDestroyed(this))
            .subscribe((queryParameters: LanguageSearchParameters) => {
                this.queryParameters = queryParameters;
            });

        // Language loading
        this._languageService.languageLoading$.pipe(untilDestroyed(this)).subscribe((languageLoading: boolean) => {
            this.itemsLoading = languageLoading;

            // If the language list element is available & the queries are loaded...
            if (this.languageList && !languageLoading) {
                // Reset the language list element scroll position to top
                this.languageList.nativeElement.scrollTo(0, 0);
            }
        });

        this._languageService
            .getLanguage()
            .pipe(untilDestroyed(this))
            .subscribe((results: PaginatedListResult<Language>) => {
                this._setResults(results);
            })
            .add(() => {
                // Once the data has been loaded at least once, the NoLanguage panel will not be unnecessarily shown, thus, provoking flickering
                this.dataLoaded = true;

                // Selection model
                this._setSelectionModel();

                this.selectedLanguage.forEach(x => {
                    this.totalResults.push(x);
                });
            });
    }

    private _setResults(results: PaginatedListResult<Language>): void {
        // Local cache of all language to be used for retrieving the right instance to compare with the selected items
        results.items.forEach(x => {
            if (this.totalResults.find(y => y.id === x.id) == null) {
                this.totalResults.push(x);
            }
        });

        this.results = results;
        this.filteredResults = Object.assign({}, results);

        this._setFiltered();
    }

    private _setSelectionModel(): void {
        // Selection model
        this._selectionModel = new SelectionModel(true, this.selectedLanguage, true, compareFn);

        this._selectionModel.changed.pipe(untilDestroyed(this)).subscribe(() => {
            this.selectionChange.emit(this._selectionModel?.selected);
        });
    }

    private _setFiltered(): void {
        const items = [];

        if (this.showOnlySelected) {
            this._selectionModel?.selected.forEach(x => {
                items.push(x);
            });

            this.filteredResults = {
                ...this.results,
                items: [...items],
                pageIndex: 0,
                pageSize: this.queryParameters?.pageSize ?? 10,
                totalCount: this._selectionModel?.selected?.length,
            };
        } else {
            this.results.items.forEach(x => {
                items.push(x);
            });

            this.filteredResults = {
                ...this.results,
                items: [...items],
                pageIndex: 0,
                pageSize: this.queryParameters?.pageSize ?? 10,
                totalCount: this.results?.totalCount,
            };
        }

        this.filteredResults.items = [...items];
    }

    handlePageEvent(event: PageEvent): void {
        this._languageService
            .getLanguage({ ...this.queryParameters, pageIndex: event.pageIndex, pageSize: event.pageSize })
            .pipe(untilDestroyed(this))
            .subscribe();
    }

    isSelectedLanguage(language: Language): boolean {
        return this._selectionModel?.selected.find(x => x.id === language.id) != null;
    }

    toggleSelection(language: Language) {
        this._selectionModel?.toggle(language);
        this._setFiltered();
    }

    unselectAll(): void {
        this._selectionModel?.clear();
    }

    selectAll(): void {
        this.filteredResults?.items?.forEach(x => {
            this._selectionModel?.select(x);
        });
    }

    toggleOnlySelected(): void {
        this.showOnlySelected = !this.showOnlySelected;

        this._languageService
            .getLanguage({
                ...this.queryParameters,
                pageIndex: 0,
            })
            .pipe(untilDestroyed(this))
            .subscribe();
    }

    getLanguage(language: Language): Language {
        return this.totalResults.find(x => x.id === language.id) ?? language;
    }

    filter(value: string): void {
        this._languageService.getLanguage({ pattern: value }).pipe(untilDestroyed(this)).subscribe();
    }
}
