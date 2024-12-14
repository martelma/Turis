import { CurrencyPipe, JsonPipe, NgClass, NgFor, NgIf, NgStyle, NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { trackByFn } from 'app/shared';
import { UserService } from 'app/core/user/user.service';
import { AliquotaIva, AliquotaIvaSearchParameters } from '../aliquota-iva.types';
import { AliquotaIvaService } from '../aliquote-iva.service';
import { PaginatedListResult } from 'app/shared/services/shared.types';
import { getSuccessModal } from 'app/shared/types/confirm-modal.types';
import { SearchInputComponent } from 'app/shared/components/ui/search-input/search-input.component';

@UntilDestroy()
@Component({
    selector: 'app-aliquote-iva-list',
    templateUrl: './aliquote-iva-list.component.html',
    styles: [
        `
            .list-grid {
                grid-template-columns: 1fr 1fr 2fr 1fr 1fr 1fr;
            }
        `,
    ],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        NgStyle,
        CurrencyPipe,
        FormsModule,
        ReactiveFormsModule,
        MatProgressBarModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        MatSortModule,
        NgTemplateOutlet,
        MatPaginatorModule,
        MatSlideToggleModule,
        MatSelectModule,
        MatOptionModule,
        MatCheckboxModule,
        MatRippleModule,
        TranslocoModule,
        SearchInputComponent,
        // TranslationsComponent,
        JsonPipe,
        SearchInputComponent,
    ],
})
export class AliquoteIvaListComponent implements OnInit, AfterViewInit {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    flashMessage: 'success' | 'error' | null = null;

    results: PaginatedListResult<AliquotaIva>;
    list: AliquotaIva[] = [];
    itemsLoading = false;
    queryParameters: AliquotaIvaSearchParameters;

    activeLang: string;
    selectedItem: AliquotaIva | null = null;
    selectedItemForm: UntypedFormGroup;

    displayColumns = ['code', 'name', 'description', 'aliquota', 'codiceNatura'];

    trackByFn = trackByFn;

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: UntypedFormBuilder,
        private _aliquotaIvaService: AliquotaIvaService,
        private _translocoService: TranslocoService,
    ) {}

    ngOnInit(): void {
        this.activeLang = this._translocoService.getActiveLang();

        // Create the selected aliquotaIva form
        this.selectedItemForm = this._formBuilder.group({
            id: [''],
            code: ['', [Validators.required]],
            name: ['', [Validators.required]],
            description: [''],
            aliquota: [''],
            codiceNatura: [''],
        });

        // AliquotaIvas
        this._aliquotaIvaService.aliquotaIvas$
            .pipe(untilDestroyed(this))
            .subscribe((results: PaginatedListResult<AliquotaIva>) => {
                this.results = results;
                this.list = results?.items;
            });

        // AliquotaIvas loading
        this._aliquotaIvaService.aliquotaIvasLoading$
            .pipe(untilDestroyed(this))
            .subscribe((aliquotaIvasLoading: boolean) => {
                this.itemsLoading = aliquotaIvasLoading;
            });

        // Query parameters
        this._aliquotaIvaService.queryParameters$
            .pipe(untilDestroyed(this))
            .subscribe((queryParameters: AliquotaIvaSearchParameters) => {
                this.queryParameters = queryParameters;
            });

        // Subscribe to aliquotaIva changes
        this._translocoService.langChanges$.pipe(untilDestroyed(this)).subscribe(activeLang => {
            // Get the active lang
            this.activeLang = activeLang;
        });
    }

    ngAfterViewInit(): void {
        if (this._sort && this._paginator) {
            // Set the initial sort
            this._sort.sort({
                id: 'name',
                start: 'asc',
                disableClear: true,
            });

            // Mark for check
            this._changeDetectorRef.markForCheck();

            // If the user changes the sort order...
            this._sort.sortChange.pipe(untilDestroyed(this)).subscribe(() => {
                // Reset back to the first page
                this._paginator.pageIndex = 0;

                // Close the details
                this.closeDetails();
            });
        }
        this._list();
    }

    create(): void {
        // Create the aliquotaIva
        this._aliquotaIvaService
            .createEntity()
            .pipe(untilDestroyed(this))
            .subscribe(item => {
                this._updateSelectedItem(item);
            });
    }

    private _updateSelectedItem(item: AliquotaIva): void {
        // Go to new tag
        this.selectedItem = item;

        // Fill the form
        this.selectedItemForm.patchValue(item);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    updateSelectedItem(): void {
        // Get the aliquotaIva object
        const aliquotaIva = {
            ...this.selectedItemForm.getRawValue(),
        };

        // Update the aliquotaIva on the server
        this._aliquotaIvaService
            .updateEntity(aliquotaIva.id, aliquotaIva)
            .pipe(untilDestroyed(this))
            .subscribe(() => {
                // this._fuseConfirmationService.open(getSuccessModal());

                setTimeout(() => {
                    this.closeDetails();
                    this._list();
                    // this._aliquotaIvaService.list().pipe(untilDestroyed(this)).subscribe();
                }, 2000);
            });
    }

    deleteSelectedItem(): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: this._translocoService.translate('AliquotaIvas.DeleteAliquotaIva'),
            message: this._translocoService.translate('Questions.AreYouSure'),
            actions: {
                cancel: {
                    label: this._translocoService.translate('General.Cancel'),
                },
                confirm: {
                    label: this._translocoService.translate('General.Delete'),
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
                    // Get the aliquotaIva object
                    const aliquotaIva = this.selectedItemForm.getRawValue();

                    // Delete the aliquotaIva on the server
                    this._aliquotaIvaService
                        .deleteEntity(aliquotaIva.id)
                        .pipe(untilDestroyed(this))
                        .subscribe(() => {
                            // Close the details
                            this.closeDetails();
                        });
                }
            });
    }

    showFlashMessage(type: 'success' | 'error'): void {
        // Show the message
        this.flashMessage = type;

        // Mark for check
        this._changeDetectorRef.markForCheck();

        // Hide it after 3 seconds
        setTimeout(() => {
            this.flashMessage = null;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        }, 3000);
    }

    toggleDetails(aliquotaIvaId: string): void {
        // If the aliquotaIva is already selected...
        if (this.selectedItem && this.selectedItem.id === aliquotaIvaId) {
            // Close the details
            this.closeDetails();
            return;
        }

        // Get the aliquotaIva by id
        this._aliquotaIvaService
            .getById(aliquotaIvaId)
            .pipe(untilDestroyed(this))
            .subscribe(item => {
                // Set the selected role
                this.selectedItem = item;

                // Fill the form
                this.selectedItemForm.patchValue(item);

                // Mark for check
                this._changeDetectorRef.markForCheck();

                this._changeDetectorRef.detectChanges();
            });
    }

    closeDetails(): void {
        this.selectedItem = null;

        this.selectedItemForm.reset();
    }

    handlePageEvent(event: PageEvent): void {
        this.queryParameters = { ...this.queryParameters, pageIndex: event.pageIndex, pageSize: event.pageSize };

        this._list();
    }

    private _list(): void {
        this._aliquotaIvaService
            .listEntities({ ...this.queryParameters })
            .pipe(untilDestroyed(this))
            .subscribe();
    }

    filter(value: string): void {
        this.queryParameters = { pattern: value };
        this._list();
    }
}
