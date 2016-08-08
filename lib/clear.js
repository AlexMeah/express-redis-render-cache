module.exports = function clear(client, name) {
    console.warn('This can negatively effect performance please be careful!');

    return new Promise((res, rej) => {
        client.keys(`__express_cache__${name || ''}${name ? ':' : ''}*`, (keysErr, keys) => {
            if (keysErr) {
                return rej(keysErr);
            }

            return client.del(keys, (delErr) => {
                if (delErr) {
                    return rej(delErr);
                }

                return res();
            });
        });
    });
};
