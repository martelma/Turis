import { Collaborator } from './../service/service.types';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import {
    BehaviorSubject,
    Observable,
    catchError,
    filter,
    finalize,
    map,
    of,
    switchMap,
    take,
    tap,
    throwError,
} from 'rxjs';
import { Contact, ContactSearchParameters } from './contact.types';
import { emptyGuid, PaginatedListResult } from 'app/shared/services/shared.types';
import { BaseEntityService } from 'app/shared/services';
import { environment } from 'environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { TeamSummary } from '../admin/dashboard/dashboard.types';
import { ClientBillingSummary, CollaboratorPaymentSummary } from '../document/document.types';
import { CollaboratorSearchParameters } from '../collaborator/collaborator.types';

@Injectable({ providedIn: 'root' })
export class ContactService extends BaseEntityService<Contact> {
    selectedContactChanged: BehaviorSubject<any> = new BehaviorSubject(null);
    private _contactEdited: BehaviorSubject<string> = new BehaviorSubject(null);

    private _teamSummary: BehaviorSubject<TeamSummary> = new BehaviorSubject(null);
    private _contacts: BehaviorSubject<PaginatedListResult<Contact>> = new BehaviorSubject(null);
    private _contact: BehaviorSubject<Contact> = new BehaviorSubject(null);
    private _contactsLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private _contactParameters: BehaviorSubject<ContactSearchParameters> = new BehaviorSubject({
        length: 0,
        pageIndex: 0,
        pageSize: 10,
    });
    constructor(
        http: HttpClient,
        private _sanitizer: DomSanitizer,
    ) {
        super(http);
        this.defaultApiController = 'contact';
    }

    /**
     * Getter for contacts
     */
    get contacts$(): Observable<PaginatedListResult<Contact>> {
        return this._contacts.asObservable();
    }

    get teamSummary$(): Observable<TeamSummary> {
        return this._teamSummary.asObservable();
    }

    /**
     * Getter for contact
     */
    get contact$(): Observable<Contact> {
        return this._contact.asObservable();
    }

    /**
     * Getter for contacts loading
     */
    get contactsLoading$(): Observable<boolean> {
        return this._contactsLoading.asObservable();
    }

    /**
     * Getter for contact parameters
     */
    get contactParameters$(): Observable<ContactSearchParameters> {
        return this._contactParameters.asObservable();
    }

    /**
     * Getter for contact edited
     */
    get contactEdited$(): Observable<string> {
        return this._contactEdited.asObservable();
    }

    /**
     * Get a contact identified by the given contact id
     */
    getById(id: string): Observable<Contact> {
        return this.getSingle(id).pipe(
            map(contact => {
                contact.avatarUrl = contact.avatar
                    ? this._sanitizer.bypassSecurityTrustResourceUrl(`data:image/jpg;base64, ${contact.avatar}`)
                    : undefined;
                this._contact.next(contact);

                return contact;
            }),
        );
    }

    listClientsToBeBilled(year: number): Observable<ClientBillingSummary[]> {
        const url = `unbilled-list/${year}`;
        return this.apiGet<ClientBillingSummary[]>(url);
    }

    listCollaboratorsToBePaid(year: number): Observable<CollaboratorPaymentSummary[]> {
        const url = `unpaid-list/${year}`;
        return this.apiGet<CollaboratorPaymentSummary[]>(url);
    }

    collaboratorsWithMonitor(params: CollaboratorSearchParameters): Observable<Collaborator[]> {
        let httpParams = new HttpParams();
        httpParams = httpParams.append('pageIndex', params?.pageIndex ?? 0);
        httpParams = httpParams.append('pageSize', params?.pageSize ?? 10);
        httpParams = httpParams.append('pattern', params?.pattern ?? '');
        const queryString = httpParams.toString();

        const url = `collaborators-with-monitor?${queryString}`;

        return this.apiGet<Collaborator[]>(url);
    }

    /**
     * Create a dummy contact
     */

    createEntity(): Observable<Contact> {
        const item: Contact = {
            id: undefined,
            code: '',
            externalCode: '',
            title: '',
            sex: '',
            languages: [],
            firstName: '',
            lastName: '',
            fullName: '',
            displayName: '',
            fiscalCode: '',
            taxCode: '',
            companyName: '',
            birthDate: undefined,
            birthDateText: '',
            birthPlace: '',
            address: '',
            city: '',
            cap: '',
            regionalCode: '',
            stateCode: '',
            phone1: '',
            phone2: '',
            fax: '',
            web: '',
            eMail: '',
            eMailAccounting: '',
            pec: '',
            sdiCode: '',
            note: '',
            documentType: '',
            contactType: '',
            percentageGuida: 0,
            percentageAccompagnamento: 0,
            monitorStat: false,
            tags: [],
            targets: [],
            bookmarkId: '',
            selected: false,
        };

        this._contact.next(item);

        return of(item);
    }
    /*
    createEntity(): Observable<Contact> {
        const contact = new Contact();
        contact.id = emptyGuid;

        return this.contacts$.pipe(
            take(1),
            switchMap(contacts =>
                of(contact).pipe(
                    map(newContact => {
                        // Update the contacts with the new contact
                        this._contacts.next({ ...contacts, items: [newContact, ...contacts.items] });

                        // Return the new contact
                        return newContact;
                    }),
                ),
            ),
        );
    }
    */

    /**
     * Update contact
     *
     * @param id
     * @param contact
     */
    updateEntity(id: string, contact: Contact): Observable<Contact> {
        return this.contacts$.pipe(
            take(1),
            switchMap(contacts =>
                this.create(contact).pipe(
                    map(() => {
                        // Find the index of the updated contact
                        const index = contacts.items.findIndex(item => item.id === id);

                        // Update the contact
                        contacts[index] = contact;

                        // Update the contact
                        this._contact.next(contact);

                        // Return the updated contact
                        return contact;
                    }),
                    switchMap(updatedContact =>
                        this.contact$.pipe(
                            take(1),
                            filter(item => item && item.id === id),
                            tap(() => {
                                // Update the contact if it's selected
                                this._contact.next(updatedContact);

                                // Return the updated contact
                                return updatedContact;
                            }),
                        ),
                    ),
                ),
            ),
        );
    }

    teamSummary(year: number, pattern: string): Observable<TeamSummary> {
        this._contactsLoading.next(true);

        let httpParams = new HttpParams();
        httpParams = httpParams.append('year', year);
        httpParams = httpParams.append('pattern', pattern ?? '');
        httpParams = httpParams.append('pageIndex', 0);
        httpParams = httpParams.append('pageSize', 1000);
        const queryString = httpParams.toString();

        const url = `team-summary?${queryString}`;

        return this.apiGet<TeamSummary>(url).pipe(
            map((data: TeamSummary) => {
                this._teamSummary.next(data);

                return data;
            }),
            finalize(() => {
                this._contactsLoading.next(false);
            }),
        );
    }

    /**
     * Gets all contacts
     * @returns
     */
    listEntities(params?: ContactSearchParameters): Observable<PaginatedListResult<Contact>> {
        this._contactsLoading.next(true);

        let httpParams = new HttpParams();
        httpParams = httpParams.append('pageIndex', params?.pageIndex ?? 0);
        httpParams = httpParams.append('pageSize', params?.pageSize ?? 10);
        httpParams = httpParams.append('orderBy', params?.orderBy?.toString() ?? '');
        httpParams = httpParams.append('pattern', params?.pattern ?? '');
        httpParams = httpParams.append('onlyBookmarks', params?.onlyBookmarks ? 'true' : 'false');
        httpParams = httpParams.append('code', params?.code ?? '');
        httpParams = httpParams.append('firstName', params?.firstName ?? '');
        httpParams = httpParams.append('lastName', params?.lastName ?? '');
        httpParams = httpParams.append('companyName', params?.companyName ?? '');
        httpParams = httpParams.append('note', params?.note ?? '');
        const contactString = httpParams.toString();

        const url = `?${contactString}`;

        return this.apiGet<PaginatedListResult<Contact>>(url).pipe(
            map((list: PaginatedListResult<Contact>) => {
                list = {
                    ...list,
                    items: list.items.map(contact => ({
                        ...contact,
                        avatarUrl: contact.avatar
                            ? this._sanitizer.bypassSecurityTrustResourceUrl(`data:image/jpg;base64, ${contact.avatar}`)
                            : undefined,
                    })),
                };

                this._contacts.next(list);

                this._contactParameters.next({
                    ...this._contactParameters,
                    ...params,
                    pageIndex: list.pageIndex,
                    pageSize: list.pageSize,
                });

                return list;
            }),
            finalize(() => {
                this._contactsLoading.next(false);
            }),
        );
    }

    /**
     * Delete the contact identified by the given id
     * @param id
     * @returns
     */
    deleteEntity(id: string): Observable<Contact> {
        return this._contacts.pipe(
            take(1),
            switchMap(contacts => {
                // Remove the contact
                this._contact.next(null);

                // Remove the contact from the contacts
                this._contacts.next({ ...contacts, items: contacts.items.filter(item => item.id !== id) });

                // Return the contact
                return this.delete(id);
            }),
            switchMap(contact => {
                if (!contact) {
                    return throwError('Could not found contact with id of ' + id + '!');
                }

                return of(contact);
            }),
        );
    }

    filterClients(pattern: string): Observable<Contact[]> {
        const url = `filter-clients/${pattern}`;
        return this.apiGet<Contact[]>(url);
    }

    filterCollaborators(pattern: string): Observable<Collaborator[]> {
        const url = `filter-collaborators/${pattern}`;
        return this.apiGet<Collaborator[]>(url);
    }

    editContact(contactId: string): void {
        this._contactEdited.next(contactId);
    }

    saveAvatar(formData: FormData, contactId: string): Observable<ArrayBuffer> {
        return this.apiPost<any>(`${contactId}/avatar`, formData);
    }

    resetAvatar(contactId: string): Observable<void> {
        if (!contactId) {
            return of(null);
        }

        return this.apiDelete<void>(`${contactId}/avatar`);
    }

    getAvatar(contactId: string): Observable<any> {
        if (!contactId) {
            return of(null);
        }

        return this.http
            .get(`${environment.baseUrl}/api/contact/${contactId}/avatar`, {
                observe: 'response',
                responseType: 'arraybuffer',
            })
            .pipe(
                map((response: HttpResponse<ArrayBuffer>) => {
                    return response.body;
                }),
                catchError(() => {
                    return of(false);
                }),
            );
    }
}
