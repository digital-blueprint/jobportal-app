import {css, html} from 'lit';
import * as commonUtils from '@dbp-toolkit/common/utils';
import * as commonStyles from '@dbp-toolkit/common/src/styles.js';
import {ScopedElementsMixin} from '@dbp-toolkit/common/src/scoped/ScopedElementsMixin.js';
import {Icon, Modal} from '@dbp-toolkit/common';
import {DbpStringElement, DbpDateElement, DbpEnumElement} from '@dbp-toolkit/form-elements';
import DBPBulletinLitElement from './dbp-bulletin-lit-element.js';
import {MOCK_JOB_OFFERS} from './utils/mock.js';

// Derive sorted unique option sets from the mock data
const JOB_TYPES = [...new Set(MOCK_JOB_OFFERS.map((j) => j.jobType))].sort();
const AREAS_OF_INTEREST = [...new Set(MOCK_JOB_OFFERS.map((j) => j.areaOfInterest))].sort();

export class CreateJobOfferDialog extends ScopedElementsMixin(DBPBulletinLitElement) {
    static get scopedElements() {
        return {
            'dbp-icon': Icon,
            'dbp-modal': Modal,
            'dbp-string-element': DbpStringElement,
            'dbp-date-element': DbpDateElement,
            'dbp-enum-element': DbpEnumElement,
        };
    }

    constructor() {
        super();

        // Form field state
        /** @type {string} Job title input value */
        this._formTitle = '';
        /** @type {string} Publication start date */
        this._formPublishedAt = '';
        /** @type {string} Publication end date (deadline) */
        this._formDeadline = '';
        /** @type {string} Job description */
        this._formDescription = '';
        /** @type {string} Optional additional link name */
        this._formLinkName = '';
        /** @type {string} Optional additional link URL */
        this._formLinkUrl = '';
        /** @type {string} Optional job start date */
        this._formStartDate = '';
        /** @type {string} Optional salary per month */
        this._formSalary = '';
        /** @type {string} Optional weekly hours / employment level */
        this._formWeeklyHours = '';
        /** @type {string} Optional job type (enum) */
        this._formJobType = '';
        /** @type {string} Optional area of interest (enum) */
        this._formAreaOfInterest = '';
    }

    /** Opens the dialog and resets all form fields to their defaults. */
    open() {
        this._formTitle = '';
        this._formPublishedAt = '';
        this._formDeadline = '';
        this._formDescription = '';
        this._formLinkName = '';
        this._formLinkUrl = '';
        this._formStartDate = '';
        this._formSalary = '';
        this._formWeeklyHours = '';
        this._formJobType = '';
        this._formAreaOfInterest = '';

        const dialog = this._('dbp-modal');
        if (dialog) {
            dialog.open();
        }
    }

    /** Closes the dialog. */
    close() {
        const dialog = this._('dbp-modal');
        if (dialog) {
            dialog.close();
        }
    }

    /**
     * Handles saving the new job offer.
     * Validates required fields first; if valid, dispatches a 'dbp-job-offer-create' event
     * and closes the dialog.
     * TODO: Wire up to a real API endpoint.
     */
    _onSave() {
        const titleEl = this._('dbp-string-element[name="job-title"]');
        const publishedAtEl = this._('dbp-date-element[name="published-at"]');
        const deadlineEl = this._('dbp-date-element[name="deadline"]');
        const descriptionEl = this._('dbp-string-element[name="description"]');

        let valid = true;
        [titleEl, publishedAtEl, deadlineEl, descriptionEl].forEach((el) => {
            if (el && !el.handleErrors()) {
                valid = false;
            }
        });

        if (!valid) {
            return;
        }

        this.dispatchEvent(
            new CustomEvent('dbp-job-offer-create', {
                detail: {
                    title: this._formTitle,
                    publishedAt: this._formPublishedAt,
                    deadline: this._formDeadline,
                    description: this._formDescription,
                    linkName: this._formLinkName,
                    linkUrl: this._formLinkUrl,
                    startDate: this._formStartDate,
                    salary: this._formSalary,
                    weeklyHours: this._formWeeklyHours,
                    jobType: this._formJobType,
                    areaOfInterest: this._formAreaOfInterest,
                },
                bubbles: true,
                composed: true,
            }),
        );

        this.close();
    }

    /** Builds the key-value object for job type enum items. */
    _getJobTypeItems() {
        const i18n = this._i18n;
        const t = (key) => (i18n ? i18n.t(key) : key);
        const items = {'': t('manage-job-offers.select-placeholder')};
        JOB_TYPES.forEach((type) => {
            items[type] = type;
        });
        return items;
    }

    /** Builds the key-value object for area of interest enum items. */
    _getAreaOfInterestItems() {
        const i18n = this._i18n;
        const t = (key) => (i18n ? i18n.t(key) : key);
        const items = {'': t('manage-job-offers.select-placeholder')};
        AREAS_OF_INTEREST.forEach((area) => {
            items[area] = area;
        });
        return items;
    }

    render() {
        const i18n = this._i18n;
        const t = (key) => (i18n ? i18n.t(key) : key);

        return html`
            <dbp-modal
                modal-id="create-job-offer-dialog"
                lang="${this.lang}"
                sticky-footer
                style="--dbp-modal-min-width: min(95vw, 740px); --dbp-modal-max-width: min(95vw, 740px); --dbp-modal-max-height: 90vh; --dbp-modal-content-overflow-y: auto;">
                <!-- Title with a plus icon colored like the modal close button -->
                <div slot="title">
                    <h3 class="dialog-title">
                        <dbp-icon class="title-icon" name="plus" aria-hidden="true"></dbp-icon>
                        ${t('manage-job-offers.dialog-title')}
                    </h3>
                </div>

                <!-- Form content -->
                <div slot="content" class="create-dialog-content">
                    <!-- Action bar: Cancel (left) + Save (right) -->
                    <div class="dialog-actions-bar">
                        <button
                            class="button is-secondary cancel-btn"
                            type="button"
                            @click="${this.close}">
                            <dbp-icon class="btn-icon" name="close" aria-hidden="true"></dbp-icon>
                            ${t('manage-job-offers.dialog-cancel')}
                        </button>
                        <button
                            class="button is-primary save-btn"
                            type="button"
                            @click="${this._onSave}">
                            <dbp-icon class="btn-icon" name="save" aria-hidden="true"></dbp-icon>
                            ${t('manage-job-offers.dialog-save')}
                        </button>
                    </div>

                    <!-- Mandatory section -->
                    <h4 class="form-section-heading">
                        ${t('manage-job-offers.section-mandatory')}
                    </h4>

                    <!-- Job title (full width) -->
                    <dbp-string-element
                        name="job-title"
                        lang="${this.lang}"
                        label="${t('manage-job-offers.field-job-title')}"
                        .value="${this._formTitle}"
                        required
                        @change="${(e) => (this._formTitle = e.detail.value)}"></dbp-string-element>

                    <!-- Publication date + deadline (two columns) -->
                    <div class="form-row-2col">
                        <dbp-date-element
                            name="published-at"
                            lang="${this.lang}"
                            label="${t('manage-job-offers.field-published-at')}"
                            .value="${this._formPublishedAt}"
                            required
                            @change="${(e) =>
                                (this._formPublishedAt = e.detail.value)}"></dbp-date-element>
                        <dbp-date-element
                            name="deadline"
                            lang="${this.lang}"
                            label="${t('manage-job-offers.field-deadline')}"
                            .value="${this._formDeadline}"
                            required
                            @change="${(e) =>
                                (this._formDeadline = e.detail.value)}"></dbp-date-element>
                    </div>

                    <!-- Job description textarea (full width) -->
                    <dbp-string-element
                        name="description"
                        lang="${this.lang}"
                        label="${t('manage-job-offers.field-description')}"
                        placeholder="${t('manage-job-offers.field-description-placeholder')}"
                        .value="${this._formDescription}"
                        rows="6"
                        required
                        @change="${(e) =>
                            (this._formDescription = e.detail.value)}"></dbp-string-element>

                    <!-- Optional section -->
                    <h4 class="form-section-heading">${t('manage-job-offers.section-optional')}</h4>

                    <!-- Link name + URL (two columns) -->
                    <div class="form-row-2col">
                        <dbp-string-element
                            name="link-name"
                            lang="${this.lang}"
                            label="${t('manage-job-offers.field-link-name')}"
                            placeholder="${t('manage-job-offers.field-link-name-placeholder')}"
                            .value="${this._formLinkName}"
                            @change="${(e) =>
                                (this._formLinkName = e.detail.value)}"></dbp-string-element>
                        <dbp-string-element
                            name="link-url"
                            lang="${this.lang}"
                            label="${t('manage-job-offers.field-link-url')}"
                            placeholder="${t('manage-job-offers.field-link-url-placeholder')}"
                            type="url"
                            .value="${this._formLinkUrl}"
                            @change="${(e) =>
                                (this._formLinkUrl = e.detail.value)}"></dbp-string-element>
                    </div>

                    <!-- Start date (full width) -->
                    <dbp-string-element
                        name="start-date"
                        lang="${this.lang}"
                        label="${t('manage-job-offers.field-start-date')}"
                        .value="${this._formStartDate}"
                        @change="${(e) =>
                            (this._formStartDate = e.detail.value)}"></dbp-string-element>

                    <!-- Salary (full width) -->
                    <dbp-string-element
                        name="salary"
                        lang="${this.lang}"
                        label="${t('manage-job-offers.field-salary')}"
                        .value="${this._formSalary}"
                        @change="${(e) =>
                            (this._formSalary = e.detail.value)}"></dbp-string-element>

                    <!-- Weekly hours / employment level (full width) -->
                    <dbp-string-element
                        name="weekly-hours"
                        lang="${this.lang}"
                        label="${t('manage-job-offers.field-weekly-hours')}"
                        .value="${this._formWeeklyHours}"
                        @change="${(e) =>
                            (this._formWeeklyHours = e.detail.value)}"></dbp-string-element>

                    <!-- Job type dropdown (full width) -->
                    <dbp-enum-element
                        name="job-type"
                        lang="${this.lang}"
                        label="${t('manage-job-offers.field-job-type')}"
                        .items="${this._getJobTypeItems()}"
                        .value="${this._formJobType}"
                        @change="${(e) => (this._formJobType = e.detail.value)}"></dbp-enum-element>

                    <!-- Area of interest dropdown (full width) -->
                    <dbp-enum-element
                        name="area-of-interest"
                        lang="${this.lang}"
                        label="${t('manage-job-offers.field-area-of-interest')}"
                        .items="${this._getAreaOfInterestItems()}"
                        .value="${this._formAreaOfInterest}"
                        @change="${(e) =>
                            (this._formAreaOfInterest = e.detail.value)}"></dbp-enum-element>
                </div>
            </dbp-modal>
        `;
    }

    static get styles() {
        return css`
            ${commonStyles.getThemeCSS()}
            ${commonStyles.getGeneralCSS()}
            ${commonStyles.getButtonCSS()}

            /* Match the color of the modal's own close button (--dbp-accent) */
            .title-icon {
                color: var(--dbp-accent);
                top: 0;
            }

            /* Dialog title layout */
            .dialog-title {
                display: inline-flex;
                align-items: center;
                gap: 0.4rem;
                margin: 0;
                font-size: 1.4rem;
                font-weight: 700;
            }

            /* Action bar: Cancel on the left, Save on the right */
            .dialog-actions-bar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1.5rem;
            }

            .cancel-btn,
            .save-btn {
                display: inline-flex;
                align-items: center;
                gap: 0.4rem;
            }

            /* Icon inside buttons: override the default top: 0.125em offset */
            .btn-icon {
                flex-shrink: 0;
                top: 0;
            }

            /* Section headings */
            .form-section-heading {
                font-size: 1rem;
                font-weight: 700;
                margin: 1.25rem 0 0.75rem;
            }

            /* Two-column grid for side-by-side fields */
            .form-row-2col {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
                margin-bottom: 0.75rem;
            }

            @media (max-width: 540px) {
                .form-row-2col {
                    grid-template-columns: 1fr;
                }
            }

            /* Vertical spacing between consecutive form elements */
            .create-dialog-content dbp-string-element,
            .create-dialog-content dbp-date-element,
            .create-dialog-content dbp-enum-element {
                display: block;
                margin-bottom: 0.75rem;
            }

            /* Reset bottom margin for elements inside a two-column row */
            .form-row-2col dbp-string-element,
            .form-row-2col dbp-date-element {
                margin-bottom: 0;
            }
        `;
    }
}

commonUtils.defineCustomElement('dbp-bulletin-create-job-offer-dialog', CreateJobOfferDialog);
