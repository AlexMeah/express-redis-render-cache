# The tests in this module flush Redis DB 15 to change the test DB use REDIS_DB=num to override

[![Greenkeeper badge](https://badges.greenkeeper.io/AlexMeah/express-redis-render-cache.svg)](https://greenkeeper.io/)
_____

## Usage

*Requires Node V6*

### Redis Client Setup

```js
const redis = require('redis');
const client = redis.createClient();

app.set('redis', client); // The middleware reads its Redis client from app
```

### Cache Key generation

```js
const supportedQuerystrings = {
    key: true, // Accepts all values
    complex: (value) => {} // Return a boolean
};
```

### Basic

```js
    const cache = expressRedisCache(supportedQuerystrings);

    app.use(cache);
```

### Named

```js
    const cache = expressRedisCache('blogPosts', supportedQuerystrings);

    app.use('/blog', cache); // OR
    app.use(cache);
```
