import {css, html} from 'lit';
import * as commonUtils from '@dbp-toolkit/common/utils';
import * as commonStyles from '@dbp-toolkit/common/src/styles.js';
import {ScopedElementsMixin} from '@dbp-toolkit/common/src/scoped/ScopedElementsMixin.js';
import {Icon, IconButton} from '@dbp-toolkit/common';
import {TabulatorTable} from '@dbp-toolkit/tabulator-table/src/tabulator-table';
import DBPBulletinLitElement from './dbp-bulletin-lit-element.js';
import {CreateJobOfferDialog} from './dbp-bulletin-create-job-offer-dialog.js';
import {MOCK_JOB_OFFERS} from './utils/mock.js';

class ManageJobOffers extends ScopedElementsMixin(DBPBulletinLitElement) {
    static get scopedElements() {
        return {
            'dbp-icon': Icon,
            'dbp-icon-button': IconButton,
            'dbp-tabulator-table': TabulatorTable,
            'dbp-bulletin-create-job-offer-dialog': CreateJobOfferDialog,
        };
    }

    constructor() {
        super();
        /** @type {object} Tabulator options including column and lang definitions */
        this._tableOptions = {};
        /** @type {Array} Row data prepared for the table */
        this._tableData = [];
    }

    connectedCallback() {
        super.connectedCallback();
        this._buildTableConfig();
        this.updateComplete.then(() => {
            this._('#manage-job-offers-table').buildTable();
        });
    }

    /**
     * On lang change: rebuild the row data with fresh translated button labels
     * and push it directly to the Tabulator instance via replaceData().
     * We intentionally do NOT call buildTable() here — that would re-trigger the
     * setLocale crash inside the vendored tabulator-table component.
     * The static column titles (ID / Titel) are not rebuilt on lang change because
     * they are the same in both languages.
     * @param {Map} changedProperties
     */
    update(changedProperties) {
        super.update(changedProperties);
        if (changedProperties.has('lang')) {
            this._buildTableData();
            const tableEl = this._('#manage-job-offers-table');
            if (tableEl && tableEl.tabulatorTable) {
                tableEl.tabulatorTable.replaceData(this._tableData);
            }
        }
    }

    /** Placeholder handler for the edit action. */
    onEdit(job) {
        console.log('Edit job offer:', job.identifier);
    }

    /** Placeholder handler for the preview/view action. */
    onPreview(job) {
        console.log('Preview job offer:', job.identifier);
    }

    /** Opens the create job offer dialog. */
    _openCreateDialog() {
        const dialog = this._('dbp-bulletin-create-job-offer-dialog');
        if (dialog) {
            dialog.open();
        }
    }

    /**
     * Builds both the Tabulator options (columns, langs) and the initial row data.
     * Called once from connectedCallback before the table is mounted.
     */
    _buildTableConfig() {
        const i18n = this._i18n;
        const t = (key) => (i18n ? i18n.t(key) : key);

        this._buildTableData();

        this._tableOptions = {
            layout: 'fitColumns',
            columnDefaults: {
                vertAlign: 'middle',
                resizable: false,
            },
            initialSort: [{column: 'id', dir: 'asc'}],
            // langs is required by buildTable() when pagination-enabled is used
            langs: {
                en: {},
                de: {},
            },
            columns: [
                {
                    title: t('manage-job-offers.col-id'),
                    field: 'id',
                    width: 80,
                    sorter: 'number',
                    hozAlign: 'left',
                    headerHozAlign: 'left',
                },
                {
                    title: t('manage-job-offers.col-title'),
                    field: 'title',
                    sorter: 'string',
                    hozAlign: 'left',
                    headerHozAlign: 'left',
                },
                {
                    title: '',
                    field: 'actions',
                    width: 90,
                    formatter: 'html',
                    download: false,
                    headerSort: false,
                    hozAlign: 'right',
                    headerHozAlign: 'right',
                },
            ],
        };
    }

    /**
     * Builds (or rebuilds) only the row data array with fresh DOM button nodes.
     * Safe to call after a lang change to update translated button labels without
     * re-initialising the whole table.
     */
    _buildTableData() {
        const i18n = this._i18n;
        const t = (key, opts) => (i18n ? i18n.t(key, opts) : key);

        this._tableData = MOCK_JOB_OFFERS.map((job, index) => {
            // Create edit icon button using dbp-icon-button so it carries its own styles
            const editBtn = this.createScopedElement('dbp-icon-button');
            editBtn.iconName = 'pencil';
            editBtn.setAttribute(
                'aria-label',
                t('manage-job-offers.edit-btn-aria', {title: job.title}),
            );
            editBtn.title = t('manage-job-offers.edit-btn-title');
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.onEdit(job);
            });

            // Create preview icon button using dbp-icon-button so it carries its own styles
            const previewBtn = this.createScopedElement('dbp-icon-button');
            previewBtn.iconName = 'keyword-research';
            previewBtn.setAttribute(
                'aria-label',
                t('manage-job-offers.preview-btn-aria', {title: job.title}),
            );
            previewBtn.title = t('manage-job-offers.preview-btn-title');
            previewBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.onPreview(job);
            });

            // Wrap both buttons in a right-aligned container
            const actionsEl = this.createScopedElement('div');
            actionsEl.className = 'actions-cell';
            actionsEl.appendChild(editBtn);
            actionsEl.appendChild(previewBtn);

            return {
                id: index + 1,
                title: job.title,
                actions: actionsEl,
            };
        });
    }

    render() {
        const i18n = this._i18n;
        const t = (key) => (i18n ? i18n.t(key) : key);

        return html`
            <div class="manage-board">
                <!-- Create new job offer button -->
                <div class="toolbar">
                    <button
                        class="button is-primary create-btn"
                        type="button"
                        @click="${this._openCreateDialog}">
                        <dbp-icon class="btn-icon" name="plus" aria-hidden="true"></dbp-icon>
                        ${t('manage-job-offers.create-btn')}
                    </button>
                </div>

                <!-- Jobs table with built-in pagination -->
                <dbp-tabulator-table
                    id="manage-job-offers-table"
                    identifier="manage-job-offers-table"
                    pagination-enabled
                    pagination-size="12"
                    .options="${this._tableOptions}"
                    .data="${this._tableData}"></dbp-tabulator-table>
            </div>

            <!-- Create job offer dialog (separate web component) -->
            <dbp-bulletin-create-job-offer-dialog
                lang="${this.lang}"
                @dbp-job-offer-create="${(e) =>
                    console.log(
                        'New job offer:',
                        e.detail,
                    )}"></dbp-bulletin-create-job-offer-dialog>
        `;
    }

    static get styles() {
        return css`
            ${commonStyles.getThemeCSS()}
            ${commonStyles.getGeneralCSS()}
            ${commonStyles.getButtonCSS()}
            ${commonStyles.getNotificationCSS()}

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

            /* Action buttons container inside the table cell */
            .actions-cell {
                display: flex;
                justify-content: flex-end;
                align-items: center;
                gap: 0.1rem;
            }
        `;
    }
}

commonUtils.defineCustomElement('dbp-bulletin-manage-job-offers', ManageJobOffers);
