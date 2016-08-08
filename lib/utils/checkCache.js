module.exports = function checkCache(redis, cacheKey) {
    return new Promise((res, rej) => {
        redis.get(cacheKey, (err, html) => {
            if (err || !html) {
                return rej();
            }

            return res(html);
        });
    });
}
;
