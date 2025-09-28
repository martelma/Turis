import { CdkDrag, CdkDragPlaceholder, CdkDropList } from '@angular/cdk/drag-drop';
import { DecimalPipe, NgClass, NgFor, NgIf, SlicePipe } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { FuseAlertComponent } from '@fuse/components/alert';
import { FuseCardComponent } from '@fuse/components/card';
import { TranslocoModule } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { SearchPipe } from 'app/pipes';
import { detailExpand } from 'app/shared/animations/detail-expand';
import { SearchInputComponent } from 'app/components/global-shortcuts/ui/search-input/search-input.component';
import { KeyboardShortcutsModule } from 'ng-keyboard-shortcuts';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { Target, TargetSearchParameters } from './target.types';
import { MatDialog } from '@angular/material/dialog';
import {
    FuseConfirmationDialogComponent,
    FuseConfirmationResult,
    FuseConfirmationType,
} from '@fuse/components/confirmation-dialog/confirmation-dialog.component';
import { debounceTime } from 'rxjs';
import { TargetService } from './target.service';

@UntilDestroy()
@Component({
    selector: 'app-target',
    templateUrl: './target.component.html',
    animations: [detailExpand],
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        FormsModule,
        ReactiveFormsModule,
        SlicePipe,
        DecimalPipe,
        SearchPipe,
        MatTabsModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatMenuModule,
        MatTableModule,
        MatPaginatorModule,
        MatButtonToggleModule,
        MatExpansionModule,
        MatDividerModule,
        MatSortModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
        KeyboardShortcutsModule,
        CdkDrag,
        CdkDropList,
        CdkDragPlaceholder,
        NgxDropzoneModule,
        SearchPipe,
        FuseCardComponent,
        FuseAlertComponent,
        SearchInputComponent,
        TranslocoModule,
    ],
})
export class TargetComponent implements OnInit {
    _collaboratorId: string;

    @Input()
    set collaboratorId(val: string) {
        setTimeout(() => {
            this._collaboratorId = val;
            this.targetParameters.collaboratorId = this.collaboratorId;
            this.loadData();
        });
    }
    get collaboratorId(): string {
        return this._collaboratorId;
    }

    @Input() readOnly = true;
    @Input() debounce = 500;
    @Input() currentYear = new Date().getFullYear();

    targetParameters: TargetSearchParameters = new TargetSearchParameters();
    targets: Target[] = [];

    currentPageTitle = 'Target';
    loading = false;
    changed = false;
    createMode = false;
    updateMode = false;
    id: string;
    newId = 0;
    item: Target = new Target();
    originalItem: Target = null;
    editItem: Target;
    columns: string[] = ['row', 'year', 'month', 'amountMin', 'amountMax', 'percentageMin', 'percentageMax', 'tools'];
    dataSource!: MatTableDataSource<Target>;
    @ViewChild('paginator') paginator!: MatPaginator;
    expandedElement: Target = null;

    searchControl = new UntypedFormControl();

    constructor(
        private _targetService: TargetService,
        private _dialog: MatDialog,
    ) {}

    ngOnInit(): void {
        // Subscribe to search control changes
        this.searchControl.valueChanges.pipe(debounceTime(this.debounce), untilDestroyed(this)).subscribe(value => {
            if (value !== null) {
                this.applyFilter(value);
            }
        });
    }

    applyFilter(searchText: string): void {
        const tableFilters = [];
        tableFilters.push({
            id: 'code',
            value: searchText,
        });

        this.dataSource.filter = JSON.stringify(tableFilters);
        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    loadData(): void {
        //commissionStats

        this.targetParameters.collaboratorId = this.collaboratorId;
        this.targetParameters.year = this.currentYear;
        this._targetService
            .listEntities(this.targetParameters)
            .pipe(untilDestroyed(this))
            .subscribe(response => {
                this.targets = response.items;
                this.dataSource = new MatTableDataSource(this.targets ?? []);
                setTimeout(() => (this.dataSource.paginator = this.paginator));
            });
    }

    add(): void {
        this._closeAllEdit();
        this.editItem = new Target();
        this.editItem.edit = true;
        this.editItem.new = true;

        this.targets.push(this.editItem);
        this.dataSource = new MatTableDataSource(this.targets ?? []);
        setTimeout(() => (this.dataSource.paginator = this.paginator));

        this.expandedElement = this.expandedElement === this.editItem ? null : this.editItem;

        setTimeout(() => {
            this.paginator.lastPage();
        }, 300);
    }

    delete(item: Target): void {
        const dialogRef = this._dialog.open(
            FuseConfirmationDialogComponent,
            FuseConfirmationDialogComponent.createConfigurations(
                {
                    message: 'Dialogs.Confirm.Message.DeleteRecord',
                },
                FuseConfirmationType.Deleting,
            ),
        );

        dialogRef.afterClosed().subscribe(result => {
            if (result === FuseConfirmationResult.Confirm) {
                this.targets = this.targets.filter(obj => obj !== item);
                this.dataSource = new MatTableDataSource(this.targets ?? []);
                setTimeout(() => (this.dataSource.paginator = this.paginator));

                this.changed = true;
            }
        });
    }

    edit(item: Target): void {
        this.expandedElement = this.expandedElement === this.editItem ? null : this.editItem;

        this._closeAllEdit();

        item.edit = true;
        this.editItem = JSON.parse(JSON.stringify(item));
    }

    private _closeAllEdit(): void {
        this.targets.forEach(item => (item.edit = false));
    }

    confirmEdit(): void {
        this.targets = this.targets.map(item => {
            let returnValue = { ...item };

            if (item.id == this.editItem.id) {
                returnValue = JSON.parse(JSON.stringify(this.editItem));
            }

            return returnValue;
        });

        this.dataSource = new MatTableDataSource(this.targets ?? []);
        setTimeout(() => (this.dataSource.paginator = this.paginator));

        this.editItem = null;
        this._closeAllEdit();
        this.changed = true;
    }

    discardEdit(): void {
        this._closeAllEdit();

        this._resetEditItem();
    }

    private _resetEditItem(): void {
        this.targets = this.targets.filter(obj => obj !== this.editItem);

        this.dataSource = new MatTableDataSource(this.targets ?? []);
        setTimeout(() => (this.dataSource.paginator = this.paginator));

        this.editItem = null;
        this.expandedElement = null;
    }

    prevYear(): void {
        this.currentYear--;
        this.loadData();
    }

    nextYear(): void {
        this.currentYear++;
        this.loadData();
    }
}
