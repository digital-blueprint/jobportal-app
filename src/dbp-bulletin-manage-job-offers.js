import {css, html} from 'lit';
import {repeat} from 'lit/directives/repeat.js';
import * as commonUtils from '@dbp-toolkit/common/utils';
import * as commonStyles from '@dbp-toolkit/common/src/styles.js';
import {ScopedElementsMixin} from '@dbp-toolkit/common/src/scoped/ScopedElementsMixin.js';
import {Icon} from '@dbp-toolkit/common';
import DBPBulletinLitElement from './dbp-bulletin-lit-element.js';
import {MOCK_JOB_OFFERS} from './utils/mock.js';

const PAGE_SIZE_OPTIONS = [6, 12, 24];
const DEFAULT_PAGE_SIZE = 12;

class ManageJobOffers extends ScopedElementsMixin(DBPBulletinLitElement) {
    static get scopedElements() {
        return {
            'dbp-icon': Icon,
        };
    }

    constructor() {
        super();
        /** @type {'id-asc'|'id-desc'} Current sort column and direction */
        this.sortOrder = 'id-asc';
        this.currentPage = 1;
        this.pageSize = DEFAULT_PAGE_SIZE;
    }

    static get properties() {
        return {
            ...super.properties,
            sortOrder: {type: String, state: true},
            currentPage: {type: Number, state: true},
            pageSize: {type: Number, state: true},
        };
    }

    /**
     * Returns the mock job offers sorted by the current sort order.
     * @returns {Array}
     */
    getSortedJobs() {
        return [...MOCK_JOB_OFFERS].sort((a, b) => {
            // Sort by natural position (index) in the original array, using identifier as a stable key
            const indexA = MOCK_JOB_OFFERS.indexOf(a);
            const indexB = MOCK_JOB_OFFERS.indexOf(b);
            return this.sortOrder === 'id-desc' ? indexB - indexA : indexA - indexB;
        });
    }

    /** Toggles the ID column sort direction. */
    onSortById() {
        this.sortOrder = this.sortOrder === 'id-asc' ? 'id-desc' : 'id-asc';
        this.currentPage = 1;
    }

    onPageSizeChange(e) {
        this.pageSize = Number(e.target.value);
        this.currentPage = 1;
    }

    goToPage(page) {
        this.currentPage = page;
    }

    /** Placeholder handler for the edit action. */
    onEdit(job) {
        console.log('Edit job offer:', job.identifier);
    }

    /** Placeholder handler for the view/preview action. */
    onPreview(job) {
        console.log('Preview job offer:', job.identifier);
    }

    render() {
        const sorted = this.getSortedJobs();
        const totalPages = Math.max(1, Math.ceil(sorted.length / this.pageSize));

        // Clamp current page within valid range
        const page = Math.min(this.currentPage, totalPages);
        const pageStart = (page - 1) * this.pageSize;
        const pageJobs = sorted.slice(pageStart, pageStart + this.pageSize);

        // Build visible page-number window (at most 5 pages centred on current)
        const windowSize = 2;
        let rangeStart = Math.max(1, page - windowSize);
        let rangeEnd = Math.min(totalPages, page + windowSize);
        if (rangeEnd - rangeStart < windowSize * 2) {
            rangeStart = Math.max(1, rangeEnd - windowSize * 2);
            rangeEnd = Math.min(totalPages, rangeStart + windowSize * 2);
        }
        const pageNumbers = [];
        for (let p = rangeStart; p <= rangeEnd; p++) {
            pageNumbers.push(p);
        }

        const sortIcon = this.sortOrder === 'id-asc' ? 'arrow-down' : 'arrow-up';

        return html`
            <div class="manage-board">
                <!-- Create new job offer button -->
                <div class="toolbar">
                    <button class="button is-primary create-btn" type="button">
                        <dbp-icon class="btn-icon" name="plus" aria-hidden="true"></dbp-icon>
                        Neues Jobangebot erstellen
                    </button>
                </div>

                <!-- Jobs table -->
                <table class="jobs-table">
                    <thead>
                        <tr>
                            <th class="col-id">
                                <button
                                    class="sort-btn"
                                    type="button"
                                    @click="${this.onSortById}"
                                    aria-label="Sort by ID">
                                    ID
                                    <dbp-icon
                                        class="sort-icon"
                                        name="${sortIcon}"
                                        aria-hidden="true"></dbp-icon>
                                </button>
                            </th>
                            <th class="col-title">Titel</th>
                            <th class="col-actions" aria-label="Actions"></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${repeat(
                            pageJobs,
                            (job) => job.identifier,
                            (job, index) => html`
                                <tr class="job-row">
                                    <td class="col-id">${pageStart + index + 1}</td>
                                    <td class="col-title">${job.title}</td>
                                    <td class="col-actions">
                                        <button
                                            class="icon-btn"
                                            type="button"
                                            title="Bearbeiten"
                                            aria-label="Jobangebot bearbeiten: ${job.title}"
                                            @click="${() => this.onEdit(job)}">
                                            <dbp-icon name="pencil" aria-hidden="true"></dbp-icon>
                                        </button>
                                        <button
                                            class="icon-btn"
                                            type="button"
                                            title="Vorschau"
                                            aria-label="Jobangebot ansehen: ${job.title}"
                                            @click="${() => this.onPreview(job)}">
                                            <dbp-icon
                                                name="keyword-research"
                                                aria-hidden="true"></dbp-icon>
                                        </button>
                                    </td>
                                </tr>
                            `,
                        )}
                    </tbody>
                </table>

                <!-- Pagination bar -->
                <div class="pagination-bar">
                    <div class="page-size-wrapper">
                        <label class="page-size-label" for="manage-page-size">Page size</label>
                        <div class="control">
                            <select id="manage-page-size" @change="${this.onPageSizeChange}">
                                ${PAGE_SIZE_OPTIONS.map(
                                    (n) => html`
                                        <option value="${n}" ?selected="${this.pageSize === n}">
                                            ${n}
                                        </option>
                                    `,
                                )}
                            </select>
                        </div>
                    </div>

                    <div class="pagination-buttons">
                        <button
                            class="button"
                            type="button"
                            ?disabled="${page <= 1}"
                            @click="${() => this.goToPage(1)}">
                            First
                        </button>
                        <button
                            class="button"
                            type="button"
                            ?disabled="${page <= 1}"
                            @click="${() => this.goToPage(page - 1)}">
                            Prev
                        </button>
                        ${pageNumbers.map(
                            (p) => html`
                                <button
                                    class="button pagination-page ${p === page ? 'is-primary' : ''}"
                                    type="button"
                                    @click="${() => this.goToPage(p)}"
                                    aria-current="${p === page ? 'page' : 'false'}">
                                    ${p}
                                </button>
                            `,
                        )}
                        <button
                            class="button"
                            type="button"
                            ?disabled="${page >= totalPages}"
                            @click="${() => this.goToPage(page + 1)}">
                            Next
                        </button>
                        <button
                            class="button"
                            type="button"
                            ?disabled="${page >= totalPages}"
                            @click="${() => this.goToPage(totalPages)}">
                            Last
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    static get styles() {
        return css`
            ${commonStyles.getThemeCSS()}
            ${commonStyles.getGeneralCSS()}
            ${commonStyles.getButtonCSS()}
            ${commonStyles.getNotificationCSS()}

            /* Override: ensure select chevron does not overlap text */
            select:not(.select) {
                background-size: 1em !important;
                padding-right: 2em !important;
                width: auto;
                cursor: pointer;
            }

            .manage-board {
                display: flex;
                flex-direction: column;
                gap: 1.5rem;
            }

            /* Toolbar row with the create button */
            .toolbar {
                display: flex;
                align-items: center;
            }

            /* Create button with leading + icon */
            .create-btn {
                display: inline-flex;
                align-items: center;
                gap: 0.4rem;
            }

            /* Full-width table */
            .jobs-table {
                width: 100%;
                border-collapse: collapse;
                table-layout: fixed;
            }

            .jobs-table thead tr {
                border-bottom: 2px solid var(--dbp-content);
            }

            .jobs-table th {
                padding: 0.6rem 0.75rem;
                text-align: left;
                font-weight: 700;
                font-size: 1rem;
            }

            /* Column widths */
            .col-id {
                width: 6rem;
            }

            .col-title {
                /* Takes remaining space */
            }

            /* Actions column: fixed width, right-aligned for both th and td */
            .col-actions {
                width: 6rem;
                white-space: nowrap;
            }

            /* Use flex only on td cells so icon buttons sit flush right */
            .jobs-table td.col-actions {
                display: flex;
                justify-content: flex-end;
                align-items: center;
                gap: 0.4rem;
            }

            /* Keep th text-aligned right as a fallback */
            .jobs-table th.col-actions {
                text-align: right;
            }

            .jobs-table tbody .job-row {
                border-bottom: 1px solid var(--dbp-muted-surface, #e0e0e0);
            }

            .jobs-table tbody .job-row:last-child {
                border-bottom: 1px solid var(--dbp-muted-surface, #e0e0e0);
            }

            .jobs-table td {
                padding: 0.85rem 0.75rem;
                font-size: 1rem;
                vertical-align: middle;
            }

            /* Sortable column header button */
            .sort-btn {
                background: none;
                border: none;
                padding: 0;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 0.3rem;
                font-weight: 700;
                font-size: 1rem;
                color: var(--dbp-content);
            }

            .sort-btn:hover {
                color: var(--dbp-accent, var(--dbp-content));
            }

            .sort-icon {
                font-size: 0.85em;
            }

            .icon-btn {
                background: none;
                border: none;
                cursor: pointer;
                padding: 0.2rem;
                color: var(--dbp-content);
                display: inline-flex;
                align-items: center;
                font-size: 1.25rem;
                border-radius: var(--dbp-border-radius, 2px);
            }

            .icon-btn:hover {
                color: var(--dbp-accent, var(--dbp-content));
            }

            /* Pagination bar */
            .pagination-bar {
                display: flex;
                align-items: center;
                justify-content: center;
                flex-wrap: wrap;
                gap: 0.75rem;
                padding: 0.25rem 0;
            }

            .page-size-wrapper {
                display: flex;
                align-items: baseline;
                gap: 0.4rem;
            }

            .page-size-label {
                white-space: nowrap;
                font-size: 1rem;
            }

            .pagination-buttons {
                display: flex;
                align-items: center;
                gap: 0.25rem;
            }

            .pagination-page {
                min-width: 2rem;
            }
        `;
    }
}

commonUtils.defineCustomElement('dbp-bulletin-manage-job-offers', ManageJobOffers);
