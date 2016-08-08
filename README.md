# The tests in this module flush Redis DB 15 to change the test DB use REDIS_DB=num to override
_____

## Usage

*Requires Node V6*

### Cache Key generation

```js
const supportedQuerystrings = {
    key: true, // Accepts all values
    complex: () => {} // Return a boolean
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
