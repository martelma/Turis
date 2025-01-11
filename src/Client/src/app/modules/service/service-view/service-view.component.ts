import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { TranslocoModule } from '@ngneat/transloco';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { FuseScrollResetDirective } from '@fuse/directives/scroll-reset';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { DatePipe, JsonPipe, NgFor, NgIf, NgClass } from '@angular/common';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ServiceService } from '../service.service';
import { Service } from '../service.types';
import { MatExpansionModule } from '@angular/material/expansion';
import { Router, RouterLink } from '@angular/router';
import { Contact } from 'app/modules/contact/contact.types';
import { getStatusColorClass, getStatusText, StatusTypes } from 'app/constants';
import { AttachmentsComponent } from 'app/shared/components/attachments/attachments.component';
import { Attachment, AttachmentSearchParameters } from 'app/shared/components/attachments/attachment.types';
import { PaginatedList } from 'app/shared/types/shared.types';
import { AttachmentService } from 'app/shared/components/attachments/attachment.service';

@UntilDestroy()
@Component({
    selector: 'app-service-view',
    templateUrl: './service-view.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./service-view.component.scss'],
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        DatePipe,
        JsonPipe,
        RouterLink,
        FormsModule,
        ReactiveFormsModule,
        MatTabsModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatExpansionModule,
        FuseScrollResetDirective,
        TranslocoModule,
        AttachmentsComponent,
    ],
})
export class ServiceViewComponent implements OnInit, OnChanges {
    loading = false;
    item: Service;
    @Input()
    set service(value: Service) {
        this.item = value;

        this.loadAttachments();
    }

    get service(): Service {
        return this.item;
    }

    @ViewChild(MatTabGroup) matTabGroup: MatTabGroup;

    attachmentSearchParameters: AttachmentSearchParameters = new AttachmentSearchParameters();
    attachments: Attachment[] = [];
    form: UntypedFormGroup;

    getStatusColorClass = getStatusColorClass;
    getStatusText = getStatusText;

    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _serviceService: ServiceService,
        private _attachmentService: AttachmentService,
        private router: Router,
        private _changeDetectorRef: ChangeDetectorRef,
    ) {}

    ngOnChanges(): void {}

    ngOnInit(): void {
        // Create the form
        this.form = this._formBuilder.group({});
    }

    onSelectedTabChange(): void {}

    openContact(contact: Contact) {
        const url = this.router.serializeUrl(this.router.createUrlTree(['/contact', contact?.id]));
        window.open(url, '_blank');
    }

    loadAttachments() {
        this._changeDetectorRef.reattach();
        this.loading = true;
        this._changeDetectorRef.detectChanges();

        this.attachmentSearchParameters.pageIndex = 0;
        this.attachmentSearchParameters.pageSize = 100;
        this.attachmentSearchParameters.entityName = 'Service';
        this.attachmentSearchParameters.entityKey = this.service.id;

        this._attachmentService
            .listEntities(this.attachmentSearchParameters)
            .pipe(untilDestroyed(this))
            .subscribe({
                next: (items: PaginatedList<Attachment>) => {
                    this.attachments = items.items;
                    console.log('attachments', this.attachments);
                },
                error: error => {
                    this.loading = false;
                    console.error(error);
                    // this._toastr.error(error.detail, 'Error!');
                },
            })
            .add(() => {
                this.loading = false;
                this._changeDetectorRef.detectChanges();
            });
    }
}
