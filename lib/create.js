const buildCacheKey = require('./utils/buildCacheKey');
const checkCache = require('./utils/checkCache');

module.exports = function create(name, supportedQuerystrings) {
    let _name = name;
    let _supportedQuerystrings = supportedQuerystrings;

    if (typeof name !== 'string') {
        _supportedQuerystrings = name;
        _name = '';
    }

    const cacheKeyQs = Object.keys(_supportedQuerystrings);

    return (req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
            return next();
        }

        const redis = req.app.get('redis');
        const cacheKey = buildCacheKey(req, cacheKeyQs, _name, _supportedQuerystrings);

        res.set('X-LOG-REDIS-CACHE-KEY', cacheKey);
        res.set('X-LOG-REDIS-HIT', false);

        res.render = (view, args = {}) => { // eslint-disable-line
            req.app.render(view, args, (err, html) => {
                if (err) {
                    return next(err);
                }

                redis.set(cacheKey, html);

                return res.send(html);
            });
        };

        return checkCache(redis, cacheKey).then((html) => {
            res.set('X-LOG-REDIS-HIT', true);
            res.send(html);
        }).catch(() => next());
    };
};
