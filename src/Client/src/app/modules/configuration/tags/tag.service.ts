import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, filter, finalize, map, of, switchMap, take, tap, throwError } from 'rxjs';
import { BaseEntityService } from 'app/shared/services';
import { Tag, TagSearchParameters } from './tag.types';
import { emptyGuid, PaginatedListResult } from 'app/shared/services/shared.types';
import { APPLICATION_CONFIGURATION_TOKEN } from 'app/configurations/application-configuration.token';
import { ApplicationConfiguration } from 'app/configurations/application-configuration.types';

@Injectable({ providedIn: 'root' })
export class TagService extends BaseEntityService<Tag> {
    private _tags: BehaviorSubject<PaginatedListResult<Tag>> = new BehaviorSubject(null);
    private _tag: BehaviorSubject<Tag> = new BehaviorSubject(null);
    private _tagsLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private _queryParameters: BehaviorSubject<TagSearchParameters> = new BehaviorSubject({
        length: 0,
        pageIndex: 0,
        pageSize: 10,
    });
    constructor(
        protected http: HttpClient,
        @Inject(APPLICATION_CONFIGURATION_TOKEN) protected _applicationConfig: ApplicationConfiguration,
    ) {
        super(http, _applicationConfig);
        this.defaultApiController = 'tag';
    }

    /**
     * Getter for tags
     */
    get tags$(): Observable<PaginatedListResult<Tag>> {
        return this._tags.asObservable();
    }

    /**
     * Getter for tag
     */
    get tag$(): Observable<Tag> {
        return this._tag.asObservable();
    }

    /**
     * Getter for tags loading
     */
    get tagsLoading$(): Observable<boolean> {
        return this._tagsLoading.asObservable();
    }

    /**
     * Getter for query parameters
     */
    get queryParameters$(): Observable<TagSearchParameters> {
        return this._queryParameters.asObservable();
    }

    /**
     * Get a tag identified by the given tag id
     */
    getById(id: string): Observable<Tag> {
        return this.getSingle(id).pipe(
            map(tag => {
                this._tag.next(tag);

                return tag;
            }),
        );
    }

    /**
     * Create a dummy tag
     */
    createEntity(): Observable<Tag> {
        return this.tags$.pipe(
            take(1),
            switchMap(tags =>
                of({
                    id: emptyGuid,
                    name: '',
                    description: '',
                    color: '',
                }).pipe(
                    map(newTag => {
                        // Update the tags with the new tag
                        this._tags.next({ ...tags, items: [newTag, ...tags.items] });

                        // Return the new tag
                        return newTag;
                    }),
                ),
            ),
        );
    }

    /**
     * Update tag
     *
     * @param id
     * @param tag
     */
    updateEntity(id: string, tag: Tag): Observable<Tag> {
        return this.tags$.pipe(
            take(1),
            switchMap(tags =>
                this.create(tag).pipe(
                    map(() => {
                        // Find the index of the updated tag
                        const index = tags.items.findIndex(item => item.id === id);

                        // Update the tag
                        tags[index] = tag;

                        // Update the tag
                        this._tag.next(tag);

                        // Return the updated tag
                        return tag;
                    }),
                    switchMap(updatedTag =>
                        this.tag$.pipe(
                            take(1),
                            filter(item => item && item.id === id),
                            tap(() => {
                                // Update the tag if it's selected
                                this._tag.next(updatedTag);

                                // Return the updated tag
                                return updatedTag;
                            }),
                        ),
                    ),
                ),
            ),
        );
    }

    /**
     * Gets all tags
     * @returns
     */
    listEntities(params?: TagSearchParameters): Observable<PaginatedListResult<Tag>> {
        this._tagsLoading.next(true);

        let httpParams = new HttpParams();
        httpParams = httpParams.append('pageIndex', params?.pageIndex ?? 0);
        httpParams = httpParams.append('pageSize', params?.pageSize ?? 10);
        httpParams = httpParams.append('orderBy', params?.orderBy?.toString() ?? '');
        httpParams = httpParams.append('pattern', params?.pattern ?? '');
        const queryString = httpParams.toString();

        const url = `?${queryString}`;

        return this.apiGet<PaginatedListResult<Tag>>(url).pipe(
            map((list: PaginatedListResult<Tag>) => {
                this._tags.next(list);

                this._queryParameters.next({
                    ...this._queryParameters,
                    ...params,
                    pageIndex: list.pageIndex,
                    pageSize: list.pageSize,
                });

                return list;
            }),
            finalize(() => {
                this._tagsLoading.next(false);
            }),
        );
    }

    /**
     * Delete the tag identified by the given id
     * @param id
     * @returns
     */
    deleteEntity(id: string): Observable<Tag> {
        return this._tags.pipe(
            take(1),
            switchMap(tags => {
                // Remove the tag
                this._tag.next(null);

                // Remove the tag from the tags
                this._tags.next({ ...tags, items: tags.items.filter(item => item.id !== id) });

                // Return the tag
                return this.delete(id);
            }),
            switchMap(tag => {
                if (!tag) {
                    return throwError('Could not found tag with id of ' + id + '!');
                }

                return of(tag);
            }),
        );
    }
}
