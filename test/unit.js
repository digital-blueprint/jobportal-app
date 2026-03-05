import {assert} from 'chai';

import '../src/dbp-jobportal-show-submissions';
import '../src/dbp-jobportal.js';

suite('dbp-jobportal-show-submissions basics', () => {
    let node;

    suiteSetup(async () => {
        node = document.createElement('dbp-jobportal-show-submissions');
        document.body.appendChild(node);
        await node.updateComplete;
    });

    suiteTeardown(() => {
        node.remove();
    });

    test('should render', () => {
        assert(!!node.shadowRoot);
    });
});
