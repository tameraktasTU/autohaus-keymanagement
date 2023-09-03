import { describe, assert, test, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { crudServiceTestsSuite } from '../suites';
import { FetchMock }             from '../mocks';
import Client                    from '@/Client';
import { AdminService }          from '@/services/AdminService';
import { AdminModel }            from '@/services/utils/dtos';

describe('AdminService', function() {
    const client = new Client('test_base_url');
    const service = new AdminService(client);

    // base tests
    crudServiceTestsSuite(service, '/api/admins');

    const fetchMock = new FetchMock();

    beforeEach(function() {
        service.client.authStore.clear(); // reset
    });

    beforeAll(function () {
        fetchMock.init();
    });

    afterAll(function () {
        fetchMock.restore();
    });

    afterEach(function () {
        fetchMock.clearMocks();
    });

    function authResponseCheck(result: { [key: string]: any }, expectedToken: string, expectedAdmin: AdminModel) {
        assert.isNotEmpty(result);
        assert.equal(result.token, expectedToken);
        assert.deepEqual(result.admin, expectedAdmin);
        assert.equal(service.client.authStore.token, expectedToken);
        assert.deepEqual(service.client.authStore.model, expectedAdmin);
    }

    // more tests:
    // ---------------------------------------------------------------

    describe('AuthStore sync', function() {
        test('Should update the AuthStore admin model on matching update id', async function() {
            fetchMock.on({
                method: 'PATCH',
                url: service.client.buildUrl('/api/admins/test123'),
                replyCode: 200,
                replyBody: {
                    id: "test123",
                    email: "new@example.com",
                },
            });

            service.client.authStore.save("test_token", {id: "test123", email: "old@example.com"} as any);

            await service.update('test123', {email:"new@example.com"});

            assert.equal(service.client.authStore.model?.email, "new@example.com");
        });

        test('Should not update the AuthStore admin model on mismatched update id', async function() {
            fetchMock.on({
                method: 'PATCH',
                url: service.client.buildUrl('/api/admins/test123'),
                replyCode: 200,
                replyBody: {
                    id: "test123",
                    email: "new@example.com",
                },
            });

            service.client.authStore.save("test_token", {id: "test456", email: "old@example.com"} as any);

            await service.update('test123', {email:"new@example.com"});

            assert.equal(service.client.authStore.model?.email, "old@example.com");
        });

        test('Should delete the AuthStore admin model on matching delete id', async function() {
            fetchMock.on({
                method: 'DELETE',
                url: service.client.buildUrl('/api/admins/test123'),
                replyCode: 204,
            });

            service.client.authStore.save("test_token", {id: "test123"} as any);

            await service.delete('test123');

            assert.isNull(service.client.authStore.model);
        });

        test('Should not delete the AuthStore admin model on mismatched delete id', async function() {
            fetchMock.on({
                method: 'DELETE',
                url: service.client.buildUrl('/api/admins/test123'),
                replyCode: 204,
            });

            service.client.authStore.save("test_token", {id: "test456"} as any);

            await service.delete('test123');

            assert.isNotNull(service.client.authStore.model);
        });
    });

    describe('authWithPassword()', function() {
        test('(legacy) Should auth an admin by its email and password', async function() {
            fetchMock.on({
                method: 'POST',
                url: service.client.buildUrl('/api/admins/auth-with-password') + '?q1=456',
                body: {
                    'identity': 'test@example.com',
                    'password': '123456',
                    'b1': 123,
                },
                replyCode: 200,
                replyBody: {
                    'token': 'token_authorize',
                    'admin': { 'id': 'id_authorize' },
                },
            });

            const result = await service.authWithPassword('test@example.com', '123456', { 'b1': 123 }, { 'q1': 456 });

            authResponseCheck(result, 'token_authorize', service.decode({ 'id': 'id_authorize' }));
        });

        test('Should auth an admin by its email and password', async function() {
            fetchMock.on({
                method: 'POST',
                url: service.client.buildUrl('/api/admins/auth-with-password') + '?q1=456',
                body: {
                    'identity': 'test@example.com',
                    'password': '123456',
                },
                additionalMatcher: (_, config) => {
                    return config?.headers?.['x-test'] === '123';
                },
                replyCode: 200,
                replyBody: {
                    'token': 'token_authorize',
                    'admin': { 'id': 'id_authorize' },
                },
            });

            const result = await service.authWithPassword('test@example.com', '123456', {
                'q1':      456,
                'headers': {'x-test': '123'},
            });

            authResponseCheck(result, 'token_authorize', service.decode({ 'id': 'id_authorize' }));
        });
    });

    describe('authRefresh()', function() {
        test('(legacy) Should refresh an authorized admin instance', async function() {
            fetchMock.on({
                method: 'POST',
                url: service.client.buildUrl('/api/admins/auth-refresh') + '?q1=456',
                body: { 'b1': 123 },
                replyCode: 200,
                replyBody: {
                    'token': 'token_refresh',
                    'admin': { 'id': 'id_refresh' },
                },
            });

            const result = await service.authRefresh({ 'b1': 123 }, { 'q1': 456 });

            authResponseCheck(result, 'token_refresh', service.decode({ 'id': 'id_refresh' }));
        });

        test('Should refresh an authorized admin instance', async function() {
            fetchMock.on({
                method: 'POST',
                url: service.client.buildUrl('/api/admins/auth-refresh') + '?q1=456',
                additionalMatcher: (_, config) => {
                    return config?.headers?.['x-test'] === '123';
                },
                replyCode: 200,
                replyBody: {
                    'token': 'token_refresh',
                    'admin': { 'id': 'id_refresh' },
                },
            });

            const result = await service.authRefresh({ 'q1': 456, 'headers': {'x-test': '123'} });

            authResponseCheck(result, 'token_refresh', service.decode({ 'id': 'id_refresh' }));
        });
    });

    describe('requestPasswordReset()', function() {
        test('(legacy) Should send a password reset request', async function() {
            fetchMock.on({
                method: 'POST',
                url: service.client.buildUrl('/api/admins/request-password-reset') + '?q1=456',
                body: {
                    'email': 'test@example.com',
                    'b1': 123,
                },
                replyCode: 204,
                replyBody: true,
            });

            const result = await service.requestPasswordReset('test@example.com', { 'b1': 123 }, { 'q1': 456 });

            assert.isTrue(result);
        });

        test('Should send a password reset request', async function() {
            fetchMock.on({
                method: 'POST',
                url: service.client.buildUrl('/api/admins/request-password-reset') + '?q1=456',
                body: {
                    'email': 'test@example.com',
                },
                additionalMatcher: (_, config) => {
                    return config?.headers?.['x-test'] === '123';
                },
                replyCode: 204,
                replyBody: true,
            });

            const result = await service.requestPasswordReset('test@example.com', { 'q1': 456, 'headers': {'x-test': '123'} });

            assert.isTrue(result);
        });
    });

    describe('confirmPasswordReset()', function() {
        test('(legacy) Should confirm a password reset request', async function() {
            fetchMock.on({
                method: 'POST',
                url: service.client.buildUrl('/api/admins/confirm-password-reset') + '?q1=456',
                body: {
                    'token': 'test',
                    'password': '123',
                    'passwordConfirm': '456',
                    'b1': 123,
                },
                replyCode: 204,
                replyBody: true,
            });

            const result = await service.confirmPasswordReset('test', '123', '456', { 'b1': 123 }, { 'q1': 456 });

            assert.isTrue(result);
        });

        test('Should confirm a password reset request', async function() {
            fetchMock.on({
                method: 'POST',
                url: service.client.buildUrl('/api/admins/confirm-password-reset') + '?q1=456',
                body: {
                    'token': 'test',
                    'password': '123',
                    'passwordConfirm': '456',
                },
                additionalMatcher: (_, config) => {
                    return config?.headers?.['x-test'] === '123';
                },
                replyCode: 204,
                replyBody: true,
            });

            const result = await service.confirmPasswordReset('test', '123', '456', {
                'q1': 456,
                'headers': {'x-test': '123'}
            });

            assert.isTrue(result);
        });
    });
});
