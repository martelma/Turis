import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, filter, finalize, map, of, switchMap, take, tap, throwError } from 'rxjs';
import { BaseEntityService } from 'app/shared/services';
import { Language, LanguageSearchParameters } from './language.types';
import { emptyGuid, PaginatedListResult } from 'app/shared/services/shared.types';
import { APPLICATION_CONFIGURATION_TOKEN } from 'app/configurations/application-configuration.token';
import { ApplicationConfiguration } from 'app/configurations/application-configuration.types';

@Injectable({ providedIn: 'root' })
export class LanguageService extends BaseEntityService<Language> {
    private _languages: BehaviorSubject<PaginatedListResult<Language>> = new BehaviorSubject(null);
    private _language: BehaviorSubject<Language> = new BehaviorSubject(null);
    private _languagesLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private _queryParameters: BehaviorSubject<LanguageSearchParameters> = new BehaviorSubject({
        length: 0,
        pageIndex: 0,
        pageSize: 10,
    });
    constructor(
        protected http: HttpClient,
        @Inject(APPLICATION_CONFIGURATION_TOKEN) protected _applicationConfig: ApplicationConfiguration,
    ) {
        super(http, _applicationConfig);
        this.defaultApiController = 'language';
    }

    /**
     * Getter for languages
     */
    get languages$(): Observable<PaginatedListResult<Language>> {
        return this._languages.asObservable();
    }

    /**
     * Getter for language
     */
    get language$(): Observable<Language> {
        return this._language.asObservable();
    }

    /**
     * Getter for languages loading
     */
    get languagesLoading$(): Observable<boolean> {
        return this._languagesLoading.asObservable();
    }

    /**
     * Getter for query parameters
     */
    get queryParameters$(): Observable<LanguageSearchParameters> {
        return this._queryParameters.asObservable();
    }

    /**
     * Get a language identified by the given language id
     */
    getById(id: string): Observable<Language> {
        return this.getSingle(id).pipe(
            map(language => {
                this._language.next(language);

                return language;
            }),
        );
    }

    /**
     * Create a dummy language
     */
    createEntity(): Observable<Language> {
        return this.languages$.pipe(
            take(1),
            switchMap(languages =>
                of({
                    id: emptyGuid,
                    code: '',
                    name: '',
                    codeIso: '',
                }).pipe(
                    map(newLanguage => {
                        // Update the languages with the new language
                        this._languages.next({ ...languages, items: [newLanguage, ...languages.items] });

                        // Return the new language
                        return newLanguage;
                    }),
                ),
            ),
        );
    }

    /**
     * Update language
     *
     * @param id
     * @param language
     */
    updateEntity(id: string, language: Language): Observable<Language> {
        return this.languages$.pipe(
            take(1),
            switchMap(languages =>
                this.create(language).pipe(
                    map(() => {
                        // Find the index of the updated language
                        const index = languages.items.findIndex(item => item.id === id);

                        // Update the language
                        languages[index] = language;

                        // Update the language
                        this._language.next(language);

                        // Return the updated language
                        return language;
                    }),
                    switchMap(updatedLanguage =>
                        this.language$.pipe(
                            take(1),
                            filter(item => item && item.id === id),
                            tap(() => {
                                // Update the language if it's selected
                                this._language.next(updatedLanguage);

                                // Return the updated language
                                return updatedLanguage;
                            }),
                        ),
                    ),
                ),
            ),
        );
    }

    /**
     * Gets all languages
     * @returns
     */
    listEntities(params?: LanguageSearchParameters): Observable<PaginatedListResult<Language>> {
        this._languagesLoading.next(true);

        let httpParams = new HttpParams();
        httpParams = httpParams.append('pageIndex', params?.pageIndex ?? 0);
        httpParams = httpParams.append('pageSize', params?.pageSize ?? 10);
        httpParams = httpParams.append('orderBy', params?.orderBy?.toString() ?? '');
        httpParams = httpParams.append('pattern', params?.pattern ?? '');
        const queryString = httpParams.toString();

        const url = `?${queryString}`;

        return this.apiGet<PaginatedListResult<Language>>(url).pipe(
            map((list: PaginatedListResult<Language>) => {
                this._languages.next(list);

                this._queryParameters.next({
                    ...this._queryParameters,
                    ...params,
                    pageIndex: list.pageIndex,
                    pageSize: list.pageSize,
                });

                return list;
            }),
            finalize(() => {
                this._languagesLoading.next(false);
            }),
        );
    }

    /**
     * Delete the language identified by the given id
     * @param id
     * @returns
     */
    deleteEntity(id: string): Observable<Language> {
        return this._languages.pipe(
            take(1),
            switchMap(languages => {
                // Remove the language
                this._language.next(null);

                // Remove the language from the languages
                this._languages.next({ ...languages, items: languages.items.filter(item => item.id !== id) });

                // Return the language
                return this.delete(id);
            }),
            switchMap(language => {
                if (!language) {
                    return throwError('Could not found language with id of ' + id + '!');
                }

                return of(language);
            }),
        );
    }
}
