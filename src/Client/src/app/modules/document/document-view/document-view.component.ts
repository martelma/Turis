import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { TranslocoModule } from '@ngneat/transloco';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { FuseScrollResetDirective } from '@fuse/directives/scroll-reset';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { DatePipe, JsonPipe, NgFor, NgIf, NgClass, DecimalPipe } from '@angular/common';
import { UntilDestroy } from '@ngneat/until-destroy';
import { Router, RouterLink } from '@angular/router';
import { getStatusColorClass, getStatusText } from 'app/constants';
import { AttachmentsComponent } from 'app/shared/components/attachments/attachments.component';
import { AttachmentService } from 'app/shared/components/attachments/attachment.service';
import { DocumentService } from '../document.service';
import { Document } from '../document.types';
import { trackByFn } from 'app/shared';

@UntilDestroy()
@Component({
    selector: 'app-document-view',
    templateUrl: './document-view.component.html',
    styleUrls: ['./document-view.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        DatePipe,
        JsonPipe,
        DecimalPipe,
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
export class DocumentViewComponent implements OnInit, OnChanges {
    loading = false;
    item: Document;
    @Input()
    set document(value: Document) {
        this.item = value;
    }

    get document(): Document {
        return this.item;
    }

    @ViewChild(MatTabGroup) matTabGroup: MatTabGroup;

    form: UntypedFormGroup;

    trackByFn = trackByFn;
    getStatusColorClass = getStatusColorClass;
    getStatusText = getStatusText;

    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _documentService: DocumentService,
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
}
