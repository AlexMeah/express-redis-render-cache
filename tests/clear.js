const cache = require('../');
const redis = require('redis');

require('chai').should();

describe('Clear', () => {
    let client;

    before(() => {
        client = redis.createClient({
            db: +process.env.REDIS_DB || 15
        });
    });

    beforeEach((done) => {
        client.flushdb(done);
    });

    afterEach((done) => {
        client.flushdb(done);
    });

    it('should clear all if no name is specified', (done) => {
        client.mset('__express_cache__/', '1', '__express_cache__/hello', '2', 'hello', '3');

        client.mget('__express_cache__/', '__express_cache__/hello', 'hello', (err, data) => {
            data.should.deep.equal(['1', '2', '3']);

            cache.clear(client).then(() => {
                client.mget('__express_cache__/', '__express_cache__/hello', 'hello', (err1, data1) => {
                    data1.should.deep.equal([null, null, '3']);
                    done();
                });
            }).catch(done);
        });
    });

    it('should clear by name if one is specified', (done) => {
        client.mset('__express_cache__blog:/', '1', '__express_cache__/hello', '2', 'hello', '3');

        client.mget('__express_cache__blog:/', '__express_cache__/hello', 'hello', (err, data) => {
            data.should.deep.equal(['1', '2', '3']);

            cache.clear(client, 'blog').then(() => {
                client.mget('__express_cache__blog:/', '__express_cache__/hello', 'hello', (err1, data1) => {
                    data1.should.deep.equal([null, '2', '3']);
                    done();
                });
            }).catch(done);
        });
    });
});
