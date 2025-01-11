import { ChangeDetectorRef, Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { TranslocoModule } from '@ngneat/transloco';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { FuseScrollResetDirective } from '@fuse/directives/scroll-reset';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { DatePipe, JsonPipe, NgFor, NgIf } from '@angular/common';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ContactService } from '../contact.service';
import { Contact } from '../contact.types';
import { MatExpansionModule } from '@angular/material/expansion';
import { AccountStatementComponent } from '../account-statement/account-statement.component';
import { AttachmentsComponent } from 'app/shared/components/attachments/attachments.component';
import { Attachment, AttachmentSearchParameters } from 'app/shared/components/attachments/attachment.types';
import { AttachmentService } from 'app/shared/components/attachments/attachment.service';
import { PaginatedList } from 'app/shared/types/shared.types';

@UntilDestroy()
@Component({
    selector: 'app-contact-view',
    templateUrl: './contact-view.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./contact-view.component.scss'],
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        DatePipe,
        JsonPipe,
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
        AccountStatementComponent,
        AttachmentsComponent,
    ],
})
export class ContactViewComponent implements OnInit {
    loading = false;
    item: Contact;
    @Input()
    set contact(value: Contact) {
        this.item = value;

        this.loadAttachments();
    }

    get contact(): Contact {
        return this.item;
    }

    @ViewChild(MatTabGroup) matTabGroup: MatTabGroup;

    attachmentSearchParameters: AttachmentSearchParameters = new AttachmentSearchParameters();
    attachments: Attachment[] = [];
    form: UntypedFormGroup;

    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _contactService: ContactService,
        private _attachmentService: AttachmentService,
        private _changeDetectorRef: ChangeDetectorRef,
    ) {}

    ngOnInit(): void {
        // Create the form
        this.form = this._formBuilder.group({});
    }

    onSelectedTabChange(): void {}

    loadAttachments() {
        this._changeDetectorRef.reattach();
        this.loading = true;
        this._changeDetectorRef.detectChanges();

        this.attachmentSearchParameters.pageIndex = 0;
        this.attachmentSearchParameters.pageSize = 100;
        this.attachmentSearchParameters.entityName = 'Contact';
        this.attachmentSearchParameters.entityKey = this.contact.id;

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
