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
import { UntilDestroy } from '@ngneat/until-destroy';
import { ServiceService } from '../service.service';
import { Service } from '../service.types';
import { MatExpansionModule } from '@angular/material/expansion';
import { Router, RouterLink } from '@angular/router';
import { Contact } from 'app/modules/contact/contact.types';
import { getStatusColorClass, getStatusText } from 'app/constants';
import { AttachmentsComponent } from 'app/shared/components/attachments/attachments.component';
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
    }

    get service(): Service {
        return this.item;
    }

    attachmentsCount = 0;

    @ViewChild(MatTabGroup) matTabGroup: MatTabGroup;

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

    suggestCollaborator() {
        console.log('suggestCollaborator');
    }
}
