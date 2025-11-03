import versionInfo from 'version-info.json';
import { Approver, VersionInfo } from './application-version-info.types';

export class VersionInfoService {
    private static instance: VersionInfoService;
    private versionData: VersionInfo;

    private constructor() {
        this.versionData = versionInfo as VersionInfo;
    }

    public static getInstance(): VersionInfoService {
        if (!VersionInfoService.instance) {
            VersionInfoService.instance = new VersionInfoService();
        }
        return VersionInfoService.instance;
    }

    /**
     * Ottiene la versione corrente
     */
    public getVersion(): string {
        return this.versionData.version;
    }

    /**
     * Ottiene tutte le informazioni di versione
     */
    public getVersionInfo(): VersionInfo {
        return { ...this.versionData };
    }

    /**
     * Ottiene la data di release formattata
     */
    public getReleaseDate(locale: string = 'it-IT'): string {
        const date = new Date(this.versionData.releaseDate);
        return date.toLocaleDateString(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }

    /**
     * Ottiene il changelog
     */
    public getChangelog() {
        return this.versionData.changelog;
    }

    /**
     * Verifica se la release richiede approvazione
     */
    public requiresApproval(): boolean {
        return this.versionData.approvalRequired;
    }

    /**
     * Verifica lo stato della release
     */
    public getStatus(): string {
        return this.versionData.status;
    }

    /**
     * Verifica se la release è già stata approvata
     */
    public isApproved(): boolean {
        return this.versionData.status === 'approved';
    }

    /**
     * Ottiene il numero di approvazioni
     */
    public getApprovalCount(): number {
        return this.versionData.metadata.approvers.filter(a => a.decision === 'approved').length;
    }

    /**
     * Ottiene gli approvatori
     */
    public getApprovers(): Approver[] {
        return this.versionData.metadata.approvers;
    }

    /**
     * Formatta il numero di build
     */
    public getBuildNumber(): string {
        return this.versionData.buildNumber;
    }

    /**
     * Ottiene una stringa descrittiva completa
     */
    public getFullVersionString(): string {
        return `${this.versionData.releaseName} v${this.versionData.version} (Build ${this.versionData.buildNumber})`;
    }

    /**
     * Verifica se è una release candidate
     */
    public isReleaseCandidate(): boolean {
        return this.versionData.releaseType === 'release-candidate';
    }

    /**
     * Ottiene il messaggio per il button di approvazione
     */
    public getApprovalButtonText(): string {
        return `Approva rilascio v. ${this.versionData.version}`;
    }
}

// Export singleton instance
export const versionService = VersionInfoService.getInstance();
