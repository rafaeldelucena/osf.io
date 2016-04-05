/*global describe, it, expect, example, before, after, beforeEach, afterEach, mocha, sinon*/
'use strict';
var $ = require('jquery');
var bootbox = require('bootbox');

var assert = require('chai').assert;

var utils = require('tests/utils');
var faker = require('faker');

var sharelatexNodeConfig = require('../sharelatexNodeConfig');
var sharelatexNodeConfigVM = sharelatexNodeConfig._ShareLatexNodeConfigViewModel;
var isValidBucketName = sharelatexNodeConfig._isValidBucketName;

var API_BASE = '/api/v1/12345/sharelatex';
var SETTINGS_URL = [API_BASE, 'settings', ''].join('/');
var URLS = {
    create_project: [API_BASE, 'newproject', ''].join('/'),
    import_auth: [API_BASE, 'import-auth', ''].join('/'),
    create_auth: [API_BASE, 'authorize', ''].join('/'),
    deauthorize: SETTINGS_URL,
    project_list: [API_BASE, 'projects', ''].join('/'),
    set_project: SETTINGS_URL,
    settings: '/settings/addons/'
};
var makeSettingsEndpoint = function(result, urls) {
    return {
        method: 'GET',
        url: SETTINGS_URL,
        response: {
            result: $.extend({}, {
                urls: $.extend({}, URLS, urls)
            }, result)
        }
    };
};

var noop = function() {};
var APITestCase = function(cfg) {
    this.description = cfg.description || '';
    this.endpoint = cfg.endpoint || {
        response: {
            result: {}
        }
    };
    this.expected = this.endpoint.response.result;
    $.extend(this.expected, cfg.data || {});
};
APITestCase.prototype.run = function(test) {
    var tc = this;
    var server;
    tc.before = () => {
        server = utils.createServer(sinon, [tc.endpoint]);
    };
    tc.after = () => {
        server.restore();
    };
    test(tc);
};
var APITestCases = function(test, cases) {
    for (var i = 0; i < cases.length; i++) {
        new APITestCase(cases[i]).run(test);
    }
};

var sharelatexViewModelSettings = {
    url: '/api/v1/12345/sharelatex/settings/',
    encryptUploads: false,
    projectLocations: {
        '': 'US',
        'EU': 'ES',
        'us-west-1': 'CA',
        'us-west-2': 'OR',
        'ap-northeast-1': 'TO',
        'ap-southeast-1': 'SI',
        'ap-southeast-2': 'SY',
        'cn-north-1': 'BE'
    }
};

describe('sharelatexNodeConfigViewModel', () => {
    describe('isValidBucketName', () => {
        assert.isTrue(isValidBucketName('valid'));
        assert.isFalse(isValidBucketName('not.valid', false));
        assert.isFalse(isValidBucketName('no'));
        assert.isFalse(isValidBucketName(''));
        var chars = [];
        for (var i = 0, len = 64; i < len; i++) {
            chars.push('a');
        }
        var tooLong = chars.join('');
        assert.isFalse(isValidBucketName(tooLong));
    });

    describe('ViewModel', () => {
        it('imports default settings if not given during instantiation', (done) => {
            // Default settings defined in sharelatexNodeConfig.js
            var defaultSettings = {
                url: '',
                encryptUploads: true,
                projectLocations: {
                    '': 'US Standard',
                    'EU': 'Europe Standard',
                    'us-west-1': 'California',
                    'us-west-2': 'Oregon',
                    'ap-northeast-1': 'Tokyo',
                    'ap-southeast-1': 'Singapore',
                    'ap-southeast-2': 'Sydney',
                    'cn-north-1': 'Beijing'
                }
            };
            var vm = new sharelatexNodeConfigVM('', {});
            vm.updateFromData().always(function() {
                assert.equal(vm.settings.url, defaultSettings.url);
                assert.equal(vm.settings.encryptUploads, defaultSettings.encryptUploads);
                assert.equal(vm.settings.defaultBucketLocationValue, defaultSettings.defaultBucketLocationValue);
                assert.equal(vm.settings.defaultBucketLocationMessage, defaultSettings.defaultBucketLocationMessage);
                done();
            });
        });
        it('uses settings provided during instantiation', (done) => {
           var vm = new sharelatexNodeConfigVM('', sharelatexViewModelSettings);
            vm.updateFromData().always(function() {
                assert.equal(vm.settings.url, sharelatexViewModelSettings.url);
                assert.equal(vm.settings.encryptUploads, sharelatexViewModelSettings.encryptUploads);
                assert.equal(vm.settings.defaultBucketLocationValue, sharelatexViewModelSettings.defaultBucketLocationValue);
                assert.equal(vm.settings.defaultBucketLocationMessage, sharelatexViewModelSettings.defaultBucketLocationMessage);
                done();
            });
        });
    });
    describe('#fetchFromServer', () => {
        new APITestCases(
            function(tc) {
                var expected = tc.expected;
                describe('Case: ' + tc.description, () => {
                    before(tc.before);
                    after(tc.after);
                    it('fetches data from the server and updates its state', (done) => {
                        var vm = new sharelatexNodeConfigVM('', {url: '/api/v1/12345/sharelatex/settings/' });
                        vm.updateFromData()
                            .always(function() {
                                // VM is updated with data from the fake server
                                // observables
                                assert.equal(vm.ownerName(), expected.owner);
                                assert.equal(vm.nodeHasAuth(), expected.node_has_auth);
                                assert.equal(vm.userHasAuth(), expected.user_has_auth);
                                assert.equal(vm.currentBucket(), (expected.project === null) ? null : '');
                                assert.deepEqual(vm.urls(), expected.urls);
                                done();
                            });
                    });
                    describe('... and after updating computed values work as expected', () => {
                        it('shows settings if Node has auth and credentials are valid', (done) => {
                            var vm = new sharelatexNodeConfigVM('', {url: '/api/v1/12345/sharelatex/settings/' });
                            vm.updateFromData()
                                .always(function() {
                                    assert.equal(vm.showSettings(), expected.showSettings);
                                    done();
                                });
                        });
                        it('disables settings in User dosen\'t have auth and is not auth owner', (done) => {
                            var vm = new sharelatexNodeConfigVM('', {url: '/api/v1/12345/sharelatex/settings/' });
                            vm.updateFromData()
                                .always(function() {
                                    assert.equal(vm.disableSettings(), expected.disableSettings);
                                    done();
                                });
                        });
                        it('shows the new project button if User has auth and is auth owner', (done) => {
                            var vm = new sharelatexNodeConfigVM('', {url: '/api/v1/12345/sharelatex/settings/' });
                            vm.updateFromData()
                                .always(function() {
                                    assert.equal(vm.showNewBucket(), expected.showNewBucket);
                                    done();
                                });
                        });
                        it('shows the import auth link if User has auth and Node is unauthorized', (done) => {
                            var vm = new sharelatexNodeConfigVM('', {url: '/api/v1/12345/sharelatex/settings/' });
                            vm.updateFromData()
                                .always(function() {
                                    assert.equal(vm.showImport(), expected.showImportAuth);
                                    done();
                                });
                        });
                        it('shows the create credentials link if User is unauthorized and Node is unauthorized ', (done) => {
                            var vm = new sharelatexNodeConfigVM('', {url: '/api/v1/12345/sharelatex/settings/' });
                            vm.updateFromData()
                                .always(function() {
                                    assert.equal(vm.showCreateCredentials(), expected.showCreateCredentials);
                                    done();
                                });
                        });
                        it('lets User see change project UI if they are auth owner and Node has auth', (done) => {
                            var vm = new sharelatexNodeConfigVM('', {url: '/api/v1/12345/sharelatex/settings/' });
                            vm.updateFromData()
                                .always(function() {
                                    assert.equal(vm.canChange(), expected.canChange);
                                    done();
                                });
                        });
                        it('allows User to change projects if there are projects to be seleted and projects are not currently being loaded ', (done) => {
                            var vm = new sharelatexNodeConfigVM('', {url: '/api/v1/12345/sharelatex/settings/' });
                            vm.updateFromData()
                                .always(function() {
                                    assert.equal(vm.allowSelectBucket(), expected.allowSelectBucket);
                                    done();
                                });
                        });
                    });
                });
            }, [{
                description: 'Node is unauthorized and User is unauthorized',
                endpoint: makeSettingsEndpoint({
                    node_has_auth: false,
                    user_has_auth: false,
                    user_is_owner: false,
                    owner: null,
                    project: null,
                    valid_credentials: false
                }),
                data: {
                    showSettings: false,
                    disableSettings: true,
                    showNewBucket: false,
                    showImportAuth: false,
                    showCreateCredentials: true,
                    canChange: false,
                    allowSelectBucket: false
                }
            }, {
                description: 'Node is authorized and User not auth owner',
                endpoint: makeSettingsEndpoint({
                    node_has_auth: true,
                    user_has_auth: false,
                    user_is_owner: false,
                    owner: faker.name.findName(),
                    project: null,
                    valid_credentials: true
                }),
                data: {
                    showSettings: true,
                    disableSettings: true,
                    showNewBucket: false,
                    showImportAuth: false,
                    showCreateCredentials: false,
                    canChange: false,
                    allowSelectBucket: false
                }
            }, {
                description: 'Node is unauthorized and User has auth',
                endpoint: makeSettingsEndpoint({
                    node_has_auth: false,
                    user_has_auth: true,
                    user_is_owner: true,
                    owner: faker.name.findName(),
                    project: null,
                    valid_credentials: true
                }),
                data: {
                    showSettings: false,
                    disableSettings: false,
                    showNewBucket: true,
                    showImportAuth: true,
                    showCreateCredentials: false,
                    canChange: false,
                    allowSelectBucket: false
                }
            }, {
                description: 'Node is authorized and User is auth owner',
                endpoint: makeSettingsEndpoint({
                    node_has_auth: true,
                    user_has_auth: true,
                    user_is_owner: true,
                    owner: faker.name.findName(),
                    project: null,
                    valid_credentials: true
                }),
                data: {
                    showSettings: true,
                    disableSettings: false,
                    showNewBucket: true,
                    showImportAuth: false,
                    showCreateCredentials: false,
                    canChange: true,
                    allowSelectBucket: false
                }
            }]);
    });
    describe('#toggleBucket', () => {
        var server;
        var endpoints = [{
                method: 'GET',
                url: URLS.project_list,
                response: {
                    projects: new Array(10).map(faker.internet.password)
                }
            },
            makeSettingsEndpoint()
        ];
        before(() => {
            server = utils.createServer(sinon, endpoints);
        });
        after(() => {
            server.restore();
        });
        it('shows the project selector when disabled and if projects aren\'t loaded fetches the list of projects', (done) => {
            var vm = new sharelatexNodeConfigVM('', {url: '/api/v1/12345/sharelatex/settings/' });
            vm.updateFromData()
                .always(function() {
                    var spy = sinon.spy(vm, 'fetchProjectList');
                    var promise = vm.toggleSelect();
                    promise.always(function() {
                        assert.isAbove(vm.projectList().length, 0);
                        assert(spy.calledOnce);
                        spy.restore();
                        done();
                    });
                });
        });
    });
    describe('#selectBucket', () => {
        var postEndpoint = makeSettingsEndpoint();
        postEndpoint.method = 'POST';
        postEndpoint.response = postEndpoint.response.result;
        // Bucket names cannot include periods
        var project = 'validproject';
        postEndpoint.response.project = project;
        postEndpoint.response.has_project = true;
        var endpoints = [
            postEndpoint,
            makeSettingsEndpoint()
        ];
        var server;
        before(() => {
            server = utils.createServer(sinon, endpoints);
        });
        after(() => {
            server.restore();
        });
        it('submits the selected project to the server, and updates data on success', (done) => {
            var vm = new sharelatexNodeConfigVM('', {url: '/api/v1/12345/sharelatex/settings/' });

            vm.updateFromData()
                .always(function() {
                    vm.selectedBucket(project);
                    var promise = vm.selectBucket();
                    promise.always(function() {
                        assert.equal(vm.currentBucket(), project, 'currentBucket not equal to ' + project);
                        done();
                    });
                });
        });
        it('alerts the user that the ShareLatex addon does not support project names containing periods', (done) => {
            var vm = new sharelatexNodeConfigVM('', {url: '/api/v1/12345/sharelatex/settings/'});
            var spy = sinon.spy(bootbox, 'alert');
            vm.updateFromData()
                .always(function () {
                    vm.selectedBucket('pew.pew.pew');
                    vm.selectBucket();
                    assert(spy.calledOnce);
                    spy.restore();
                    done();
                });
        });
    });
    describe('Authorization/Authentication: ', () => {
        var deleteEndpoint = makeSettingsEndpoint({
            user_has_auth: true,
            user_is_owner: true,
            node_has_auth: false,
            valid_credentials: true
        });
        deleteEndpoint.method = 'DELETE';
        deleteEndpoint.response = deleteEndpoint.response.result;
        var importEndpoint = makeSettingsEndpoint({
            node_has_auth: true,
            user_has_auth: true,
            user_is_owner: true,
            valid_credentials: true
        });
        importEndpoint.method = 'POST';
        importEndpoint.url = URLS.import_auth;
        importEndpoint.response = importEndpoint.response.result;
        var createEndpoint = makeSettingsEndpoint({
            node_has_auth: true,
            user_has_auth: true,
            user_is_owner: true,
            valid_credentials: true
        });
        createEndpoint.method = 'POST';
        createEndpoint.url = URLS.create_auth;
        createEndpoint.response = createEndpoint.response.result;
        var endpoints = [
            makeSettingsEndpoint({
                user_has_auth: true,
                user_is_owner: true,
                node_has_auth: true,
                valid_credentials: true
            }),
            deleteEndpoint,
            importEndpoint,
            createEndpoint
        ];
        var server;
        beforeEach(() => {
            server = utils.createServer(sinon, endpoints);
        });
        afterEach(() => {
            server.restore();
        });

        describe('#_deauthorizeNodeConfirm', () => {
            it('makes a DELETE request to the server and updates settings on success', (done) => {
                var expected = endpoints[1].response;
                var vm = new sharelatexNodeConfigVM('', {url: '/api/v1/12345/sharelatex/settings/' });
                vm.updateFromData()
                    .always(function() {
                        var promise = vm._deauthorizeNodeConfirm();
                        promise.always(function() {
                            assert.equal(vm.userHasAuth(), expected.user_has_auth);
                            assert.equal(vm.nodeHasAuth(), expected.node_has_auth);
                            assert.isFalse(vm.showSettings());
                            assert.isTrue(vm.showImport());
                            done();
                        });
                    });
            });
        });
        describe('#_importAuthConfirm', () => {
            before(() => {
                // Prepare settings endpoint for next test
                endpoints[0].response.result.node_has_auth = false;
            });
            it('makes a POST request to import auth and updates settings on success', (done) => {
                var expected = endpoints[2].response;
                var vm = new sharelatexNodeConfigVM('', {url: '/api/v1/12345/sharelatex/settings/' });
                vm.updateFromData()
                    .always(function() {
                        var promise = vm._importAuthConfirm();
                        promise.always(function() {
                            assert.equal(vm.nodeHasAuth(), expected.node_has_auth);
                            assert.isTrue(vm.showSettings());
                            done();
                        });
                    });
            });
        });
        describe('#createCredentials', () => {
            before(() => {
                // Prepare settings endpoint for next test
                endpoints[0].response.result.node_has_auth = false;
                endpoints[0].response.result.user_has_auth = false;
                endpoints[0].response.result.user_is_owner = false;
                // temporarily disable mock server autoRespond
                server.autoRespond = false;
            });
            after(() => {
                // restore fake server autoRespond
                server.autoRespond = true;
            });
            var expected = endpoints[0].response;
            it('makes a POST request to create auth and updates settings on success', (done) => {
                var vm = new sharelatexNodeConfigVM('', {url: '/api/v1/12345/sharelatex/settings/' });
                vm.updateFromData()
                    .always(function() {
                        var promise = vm.createCredentials();
                        assert.isTrue(vm.creatingCredentials());
                        assert.isFalse(vm.userHasAuth());
                        server.respond();
                        promise.always(function() {
                            assert.isFalse(vm.creatingCredentials());
                            assert.isTrue(vm.userHasAuth());
                            done();
                        });
                    });
            });
        });
    });
});