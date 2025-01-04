import { PaginatedList } from 'app/shared/types/shared.types';
import { AccountStatementParameters, Service } from 'app/modules/service/service.types';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { DatePipe, JsonPipe, NgClass, NgFor, NgIf, NgStyle, NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FuseScrollResetDirective } from '@fuse/directives/scroll-reset';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { fuseAnimations } from '@fuse/animations';
import { SpinnerButtonComponent } from 'app/shared/components/ui/spinner-button/spinner-button.component';
import { Contact } from '../contact.types';
import { ContactComponent } from '../contact.component';
import { ContactService } from '../contact.service';
import { Observable, tap } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { BookmarkService } from 'app/modules/bookmark/bookmark.service';
import { ContactViewComponent } from '../contact-view/contact-view.component';
import { ContactEditComponent } from '../contact-edit/contact-edit.component';
import { SafeUrl } from '@angular/platform-browser';
import { ImageCropperComponent } from 'app/shared/components/image-cropper/image-cropper.component';
import { MatDialog } from '@angular/material/dialog';
import { dataURItoBlob } from 'app/shared';
import { getSuccessModal } from 'app/shared/types/confirm-modal.types';
import { FuseCardComponent } from '@fuse/components/card';
import { TextFieldModule } from '@angular/cdk/text-field';
import { ServiceService } from 'app/modules/service/service.service';
import { PaginatedListResult } from 'app/shared/services/shared.types';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { getBillingStatusColorClass, getCommissionStatusColorClass, getStatusColorClass } from 'app/constants';

@UntilDestroy()
@Component({
    selector: 'app-account-statement',
    templateUrl: './account-statement.component.html',
    styleUrls: ['./account-statement.component.scss'],
    styles: [
        `
            .list-grid {
                grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
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
        DatePipe,
        JsonPipe,
        RouterLink,
        MatProgressBarModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        MatMenuModule,
        MatSortModule,
        MatTooltipModule,
        NgTemplateOutlet,
        MatPaginatorModule,
        MatSlideToggleModule,
        MatSelectModule,
        MatOptionModule,
        MatCheckboxModule,
        MatRippleModule,
        FuseScrollResetDirective,
        TranslocoModule,
        ContactViewComponent,
        ContactEditComponent,
        SpinnerButtonComponent,
        FuseCardComponent,
        TextFieldModule,
    ],
})
export class AccountStatementComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

    _contactId: string;

    @Input()
    set contactId(val: string) {
        setTimeout(() => {
            this._contactId = val;
            this.accountStatementParameters.contactId = this.contactId;
            this.loadAccountStatement();
        });
    }
    get contactId(): string {
        return this._contactId;
    }

    results: PaginatedListResult<Service>;
    list: Service[] = [];
    itemsLoading = false;
    accountStatementParameters: AccountStatementParameters = new AccountStatementParameters();

    getStatusColorClass = getStatusColorClass;
    getBillingStatusColorClass = getBillingStatusColorClass;
    getCommissionStatusColorClass = getCommissionStatusColorClass;

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _contactService: ContactService,
        private _serviceService: ServiceService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _translocoService: TranslocoService,
        private _bookmarkService: BookmarkService,
        private _matDialog: MatDialog,
        public snackBar: MatSnackBar,
    ) { }

    ngOnInit(): void {
        this._serviceService.services$.pipe(untilDestroyed(this)).subscribe((results: PaginatedListResult<Service>) => {
            this.results = results;
            this.list = results?.items;

            this.list?.forEach(item => {
                item.languages = item.languages.map(lang => lang.toLowerCase());
            });
        });

        // Services loading
        this._serviceService.servicesLoading$.pipe(untilDestroyed(this)).subscribe((servicesLoading: boolean) => {
            this.itemsLoading = servicesLoading;
        });
    }

    ngAfterViewInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.contactId = changes.currentValue.currentValue;
    }

    ngOnDestroy(): void {
    }

    loadAccountStatement() {
        this._serviceService
            .listAccountStatement(this.accountStatementParameters)
            .pipe(untilDestroyed(this))
            .subscribe();
    }

    handlePageEvent(event: PageEvent): void {
        this.accountStatementParameters = { ...this.accountStatementParameters, pageIndex: event.pageIndex, pageSize: event.pageSize };

        this.loadAccountStatement();
    }
}

