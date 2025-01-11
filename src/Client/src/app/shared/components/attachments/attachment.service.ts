import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseEntityService } from 'app/shared/services';
import { BehaviorSubject, filter, finalize, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { emptyGuid, PaginatedListResult } from 'app/shared/services/shared.types';
import { Attachment, AttachmentSearchParameters } from './attachment.types';

@Injectable({ providedIn: 'root' })
export class AttachmentService extends BaseEntityService<Attachment> {
    private _attachments: BehaviorSubject<PaginatedListResult<Attachment>> = new BehaviorSubject(null);
    private _attachment: BehaviorSubject<Attachment> = new BehaviorSubject(null);
    private _attachmentsLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private _queryParameters: BehaviorSubject<AttachmentSearchParameters> = new BehaviorSubject({
        length: 0,
        pageIndex: 0,
        pageSize: 10,
    });
    constructor(http: HttpClient) {
        super(http);
        this.defaultApiController = 'attachment';
    }

    /**
     * Getter for attachments
     */
    get attachments$(): Observable<PaginatedListResult<Attachment>> {
        return this._attachments.asObservable();
    }

    /**
     * Getter for attachment
     */
    get attachment$(): Observable<Attachment> {
        return this._attachment.asObservable();
    }

    /**
     * Getter for attachments loading
     */
    get attachmentsLoading$(): Observable<boolean> {
        return this._attachmentsLoading.asObservable();
    }

    /**
     * Getter for query parameters
     */
    get attachmentParameters$(): Observable<AttachmentSearchParameters> {
        return this._queryParameters.asObservable();
    }

    /**
     * Get a attachment identified by the given attachment id
     */
    getById(id: string): Observable<Attachment> {
        return this.getSingle(id).pipe(
            map(attachment => {
                this._attachment.next(attachment);

                return attachment;
            }),
        );
    }

    /**
     * Create a dummy attachment
     */
    createEntity(): Observable<Attachment> {
        return this.attachments$.pipe(
            take(1),
            switchMap(attachments =>
                of({
                    id: emptyGuid,
                    entityName: undefined,
                    entityKey: undefined,
                    timeStamp: undefined,
                    originalFileName: undefined,
                    folder: undefined,
                    type: undefined,
                    note: undefined,
                }).pipe(
                    map(newAttachment => {
                        // Update the attachments with the new attachment
                        this._attachments.next({ ...attachments, items: [newAttachment, ...attachments.items] });

                        // Return the new attachment
                        return newAttachment;
                    }),
                ),
            ),
        );
    }

    /**
     * Update attachment
     *
     * @param id
     * @param attachment
     */
    updateEntity(id: string, attachment: Attachment): Observable<Attachment> {
        return this.attachments$.pipe(
            take(1),
            switchMap(attachments =>
                this.create(attachment).pipe(
                    map(() => {
                        // Find the index of the updated attachment
                        const index = attachments.items.findIndex(item => item.id === id);

                        // Update the attachment
                        attachments[index] = attachment;

                        // Update the attachment
                        this._attachment.next(attachment);

                        // Return the updated attachment
                        return attachment;
                    }),
                    switchMap(updatedAttachment =>
                        this.attachment$.pipe(
                            take(1),
                            filter(item => item && item.id === id),
                            tap(() => {
                                // Update the attachment if it's selected
                                this._attachment.next(updatedAttachment);

                                // Return the updated attachment
                                return updatedAttachment;
                            }),
                        ),
                    ),
                ),
            ),
        );
    }

    /**
     * Gets all attachments
     * @returns
     */
    listEntities(params?: AttachmentSearchParameters): Observable<PaginatedListResult<Attachment>> {
        this._attachmentsLoading.next(true);

        let httpParams = new HttpParams();
        httpParams = httpParams.append('pageIndex', params?.pageIndex ?? 0);
        httpParams = httpParams.append('pageSize', params?.pageSize ?? 10);
        httpParams = httpParams.append('orderBy', params?.orderBy?.toString() ?? '');
        httpParams = httpParams.append('pattern', params?.pattern ?? '');
        httpParams = httpParams.append('onlyBookmarks', params?.onlyBookmarks ? 'true' : 'false');
        httpParams = httpParams.append('attachmentName', params?.entityName ?? '');
        httpParams = httpParams.append('attachmentKey', params?.entityKey ?? '');
        httpParams = httpParams.append('folder', params?.folder ?? '');
        httpParams = httpParams.append('type', params?.type ?? '');
        const queryString = httpParams.toString();

        const url = `list?${queryString}`;

        return this.apiGet<PaginatedListResult<Attachment>>(url).pipe(
            map((list: PaginatedListResult<Attachment>) => {
                this._attachments.next(list);

                this._queryParameters.next({
                    ...this._queryParameters,
                    ...params,
                    pageIndex: list.pageIndex,
                    pageSize: list.pageSize,
                });

                return list;
            }),
            finalize(() => {
                this._attachmentsLoading.next(false);
            }),
        );
    }

    /**
     * Delete the attachment identified by the given id
     * @param id
     * @returns
     */
    deleteEntity(id: string): Observable<Attachment> {
        return this._attachments.pipe(
            take(1),
            switchMap(attachments => {
                // Remove the attachment
                this._attachment.next(null);

                // Remove the attachment from the _attachments
                this._attachments.next({ ...attachments, items: attachments.items.filter(item => item.id !== id) });

                // Return the attachment
                return this.delete(id);
            }),
            switchMap(attachment => {
                if (!attachment) {
                    return throwError('Could not found attachment with id of ' + id + '!');
                }

                return of(attachment);
            }),
        );
    }

    deleteAll(entityName: string, entityKey: string, folder: string): Observable<Attachment> {
        return this._attachments.pipe(
            take(1),
            switchMap(attachments => {
                // Remove the attachment
                this._attachment.next(null);

                // Remove the attachment from the _attachments
                this._attachments.next({
                    ...attachments,
                    items: attachments.items.filter(
                        item =>
                            item.entityName !== entityName && item.entityKey !== entityKey && item.folder !== folder,
                    ),
                });

                //todo api call

                return of(null);
            }),
            switchMap(attachment => {
                return of(attachment);
            }),
        );
    }

    upload(data: any): Observable<string> {
        const apiUrl = this.prepareUrl('upload');
        return this.http.post<string>(apiUrl, data);
    }
}
