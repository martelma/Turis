import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
    MatAutocompleteModule,
    MatAutocompleteSelectedEvent,
    MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { NgIf, NgFor, NgStyle, NgClass, CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@ngneat/transloco';
import { SearchInputComponent } from 'app/shared/components/ui/search-input/search-input.component';
import { Tag } from '../tag.types';
import { TagService } from '../tag.service';
import { untilDestroyed } from '@ngneat/until-destroy';

@Component({
    selector: 'app-tag-filters',
    templateUrl: './tag-filters.component.html',
    styleUrls: ['./tag-filters.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgStyle,
        NgClass,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatChipsModule,
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
export class TagFiltersComponent implements OnInit {
    // @Input() allTags: Tag[] = [];

    private _selectedTags: Tag[] = [];

    @Input()
    set selectedTags(value: Tag[]) {
        this._selectedTags = value || [];
        this.loadTags();
    }

    get selectedTags(): Tag[] {
        return this._selectedTags;
    }

    @Output() selectionChange: EventEmitter<Tag[]> = new EventEmitter<Tag[]>();

    @ViewChild('tagInput') tagInput!: ElementRef<HTMLInputElement>;
    @ViewChild(MatAutocompleteTrigger) autocompleteTrigger!: MatAutocompleteTrigger;

    allTags: Tag[] = [];

    tagCtrl = new FormControl('');
    filteredTags: Observable<Tag[]> = new Observable<Tag[]>();

    separatorKeysCodes: number[] = [ENTER, COMMA];

    constructor(private tagService: TagService) {
        this.filteredTags = this.tagCtrl.valueChanges.pipe(
            startWith(null),
            map((tagName: string | null) => this._filter(tagName)),
        );
    }

    ngOnInit(): void {
        console.log('selectedTags', this.selectedTags);
        if (!this.selectedTags) {
            this.selectedTags = [];
        }
    }

    loadTags() {
        this.tagService
            .listEntities()
            // .pipe(untilDestroyed(this))
            .subscribe(list => {
                this.allTags = list.items;
                console.log('allTags', this.allTags);
            });
    }

    add(event: MatChipInputEvent): void {
        // Don't allow manual input, only selection from autocomplete
        // Clear the input value
        event.chipInput!.clear();
    }

    remove(tag: Tag): void {
        const index = this.selectedTags.findIndex(t => t.id === tag.id);

        if (index >= 0) {
            this.selectedTags.splice(index, 1);
            this.selectionChange.emit([...this.selectedTags]);
        }
    }

    selected(event: MatAutocompleteSelectedEvent): void {
        const selectedTag = event.option.value as Tag;

        // Check if the tag is already selected
        if (!this.selectedTags.some(tag => tag.id === selectedTag.id)) {
            this.selectedTags.push(selectedTag);
            this.selectionChange.emit([...this.selectedTags]);
        }

        this.tagInput.nativeElement.value = '';
        this.tagCtrl.setValue(null);
    }

    private _filter(value: string | Tag | null): Tag[] {
        if (!value) {
            return this.getAvailableTags();
        }

        const filterValue = typeof value === 'string' ? value.toLowerCase() : value.name.toLowerCase();

        return this.getAvailableTags().filter(tag => tag.name.toLowerCase().includes(filterValue));
    }

    private getAvailableTags(): Tag[] {
        // Filter out tags that are already selected
        return this.allTags.filter(tag => !this.selectedTags.some(selectedTag => selectedTag.id === tag.id));
    }

    openAutocomplete(): void {
        if (this.getAvailableTags().length > 0) {
            this.autocompleteTrigger.openPanel();
        }
    }

    onInputClick(event: MouseEvent): void {
        // Ferma la propagazione dell'evento per evitare comportamenti indesiderati
        event.stopPropagation();

        // Apri il pannello di autocomplete
        this.openAutocomplete();
    }
}
