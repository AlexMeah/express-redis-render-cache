const cache = require('../');
const request = require('supertest');
const redis = require('redis');
const express = require('express');
require('chai').should();

describe('Create cache cacheMiddleware', () => {
    let client;
    const cacheMiddleware = cache.create({
        boolean: true,
        complex: (val) => {
            const safe = ['valid'];

            return safe.indexOf(val) > -1;
        }
    });
    const namedCacheMiddleware = cache.create('blog', {
        boolean: true,
        complex: (val) => {
            const safe = ['valid'];

            return safe.indexOf(val) > -1;
        }
    });

    const app = express();
    const response = `${Math.random()}`;

    app.set('view engine', 'hbs');
    app.set('views', `${__dirname}/views`);

    app.use(cacheMiddleware);
    app.use('/blog', namedCacheMiddleware);

    app.get('/', (req, res) => {
        res.render('index', {
            test: response
        });
    });

    app.get('/blog', (req, res) => {
        res.render('index', {
            test: response
        });
    });

    before(() => {
        client = redis.createClient({
            db: +process.env.REDIS_DB || 15
        });
        app.set('redis', client);
    });

    beforeEach((done) => {
        client.flushdb(done);
    });

    afterEach((done) => {
        client.flushdb(done);
    });

    describe('Flat', () => {
        describe('Basic', () => {
            it('should not be cached on first hit', (done) => {
                request(app)
                    .get('/')
                    .expect('X-LOG-REDIS-HIT', 'false')
                    .expect('X-LOG-REDIS-CACHE-KEY', '__express_cache__/')
                    .expect((resp) => {
                        resp.text.trim().should.equal(response);
                    })
                    .end(done);
            });

            it('should return the response from redis', (done) => {
                client.set('__express_cache__/', 'cached');

                request(app)
                    .get('/')
                    .expect('X-LOG-REDIS-HIT', 'true')
                    .expect('X-LOG-REDIS-CACHE-KEY', '__express_cache__/')
                    .expect((resp) => {
                        resp.text.trim().should.equal('cached');
                    })
                    .end(done);
            });

            it('should not add invalid querystrings to the cache key', (done) => {
                client.set('__express_cache__/', 'cached');

                request(app)
                    .get('/?bot=hello')
                    .expect('X-LOG-REDIS-HIT', 'true')
                    .expect('X-LOG-REDIS-CACHE-KEY', '__express_cache__/')
                    .expect((resp) => {
                        resp.text.trim().should.equal('cached');
                    })
                    .end(done);
            });
        });

        describe('Boolean', () => {
            it('should not be cached on first hit', (done) => {
                request(app)
                    .get('/?boolean=hello')
                    .expect('X-LOG-REDIS-HIT', 'false')
                    .expect('X-LOG-REDIS-CACHE-KEY', '__express_cache__/_boolean_hello')
                    .expect((resp) => {
                        resp.text.trim().should.equal(response);
                    })
                    .end(done);
            });

            it('should return the response from redis', (done) => {
                client.set('__express_cache__/_boolean_hello', 'cached');

                request(app)
                    .get('/?boolean=hello')
                    .expect('X-LOG-REDIS-HIT', 'true')
                    .expect('X-LOG-REDIS-CACHE-KEY', '__express_cache__/_boolean_hello')
                    .expect((resp) => {
                        resp.text.trim().should.equal('cached');
                    })
                    .end(done);
            });
        });

        describe('Complex', () => {
            it('should not be cached on first hit', (done) => {
                request(app)
                    .get('/?complex=valid')
                    .expect('X-LOG-REDIS-HIT', 'false')
                    .expect('X-LOG-REDIS-CACHE-KEY', '__express_cache__/_complex_valid')
                    .expect((resp) => {
                        resp.text.trim().should.equal(response);
                    })
                    .end(done);
            });

            it('should return the response from redis', (done) => {
                client.set('__express_cache__/_complex_valid', 'cached');

                request(app)
                    .get('/?complex=valid')
                    .expect('X-LOG-REDIS-HIT', 'true')
                    .expect('X-LOG-REDIS-CACHE-KEY', '__express_cache__/_complex_valid')
                    .expect((resp) => {
                        resp.text.trim().should.equal('cached');
                    })
                    .end(done);
            });

            it('should not add invalid querystrings to the cache key', (done) => {
                client.set('__express_cache__/_complex_valid', 'cached');
                client.set('__express_cache__/', 'basic_cached');

                request(app)
                    .get('/?complex=invalid')
                    .expect('X-LOG-REDIS-HIT', 'true')
                    .expect('X-LOG-REDIS-CACHE-KEY', '__express_cache__/')
                    .expect((resp) => {
                        resp.text.trim().should.equal('basic_cached');
                    })
                    .end(done);
            });
        });
    });

    describe('Named', () => {
        describe('Basic', () => {
            it('should not be cached on first hit', (done) => {
                request(app)
                    .get('/blog')
                    .expect('X-LOG-REDIS-HIT', 'false')
                    .expect('X-LOG-REDIS-CACHE-KEY', '__express_cache__blog:/')
                    .expect((resp) => {
                        resp.text.trim().should.equal(response);
                    })
                    .end(done);
            });

            it('should return the response from redis', (done) => {
                client.set('__express_cache__blog:/', 'cached');

                request(app)
                    .get('/blog')
                    .expect('X-LOG-REDIS-HIT', 'true')
                    .expect('X-LOG-REDIS-CACHE-KEY', '__express_cache__blog:/')
                    .expect((resp) => {
                        resp.text.trim().should.equal('cached');
                    })
                    .end(done);
            });

            it('should not add invalid querystrings to the cache key', (done) => {
                client.set('__express_cache__blog:/', 'cached');

                request(app)
                    .get('/blog?bot=hello')
                    .expect('X-LOG-REDIS-HIT', 'true')
                    .expect('X-LOG-REDIS-CACHE-KEY', '__express_cache__blog:/')
                    .expect((resp) => {
                        resp.text.trim().should.equal('cached');
                    })
                    .end(done);
            });
        });

        describe('Boolean', () => {
            it('should not be cached on first hit', (done) => {
                request(app)
                    .get('/blog?boolean=hello')
                    .expect('X-LOG-REDIS-HIT', 'false')
                    .expect('X-LOG-REDIS-CACHE-KEY', '__express_cache__blog:/_boolean_hello')
                    .expect((resp) => {
                        resp.text.trim().should.equal(response);
                    })
                    .end(done);
            });

            it('should return the response from redis', (done) => {
                client.set('__express_cache__blog:/_boolean_hello', 'cached');

                request(app)
                    .get('/blog?boolean=hello')
                    .expect('X-LOG-REDIS-HIT', 'true')
                    .expect('X-LOG-REDIS-CACHE-KEY', '__express_cache__blog:/_boolean_hello')
                    .expect((resp) => {
                        resp.text.trim().should.equal('cached');
                    })
                    .end(done);
            });
        });

        describe('Complex', () => {
            it('should not be cached on first hit', (done) => {
                request(app)
                    .get('/blog?complex=valid')
                    .expect('X-LOG-REDIS-HIT', 'false')
                    .expect('X-LOG-REDIS-CACHE-KEY', '__express_cache__blog:/_complex_valid')
                    .expect((resp) => {
                        resp.text.trim().should.equal(response);
                    })
                    .end(done);
            });

            it('should return the response from redis', (done) => {
                client.set('__express_cache__blog:/_complex_valid', 'cached');

                request(app)
                    .get('/blog?complex=valid')
                    .expect('X-LOG-REDIS-HIT', 'true')
                    .expect('X-LOG-REDIS-CACHE-KEY', '__express_cache__blog:/_complex_valid')
                    .expect((resp) => {
                        resp.text.trim().should.equal('cached');
                    })
                    .end(done);
            });

            it('should not add invalid querystrings to the cache key', (done) => {
                client.set('__express_cache__blog:/_complex_valid', 'cached');
                client.set('__express_cache__blog:/', 'basic_cached');

                request(app)
                    .get('/blog?complex=invalid')
                    .expect('X-LOG-REDIS-HIT', 'true')
                    .expect('X-LOG-REDIS-CACHE-KEY', '__express_cache__blog:/')
                    .expect((resp) => {
                        resp.text.trim().should.equal('basic_cached');
                    })
                    .end(done);
            });
        });
    });
});
