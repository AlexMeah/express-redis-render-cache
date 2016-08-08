module.exports = function buildCacheKey(req, cacheKeyQs, name, supportedQuerystrings) {
    return cacheKeyQs.reduce((_cacheKey, key) => {
        const val = req.query[key];

        if (!val) {
            return _cacheKey;
        } else if (
            supportedQuerystrings[key] === true ||
            supportedQuerystrings[key](val)
        ) {
            return `${_cacheKey}_${key}_${val}`;
        }

        return _cacheKey;
    }, `__express_cache__${name}${name ? ':' : ''}${req.path}`);
};
