# fetch

This module provides a fetch instance wrapper designed to handle retries and timeouts seamlessly. It offers the following features:

- **Retries**: Specify the number of retries for failed requests. Default is set to 3.
- **Timeout**: Set a timeout duration (in milliseconds) for requests. By default, there is no timeout.
- **Retry Condition**: Define a custom function to determine whether a retry should be attempted.
Installation

ou can install this module via npm:

```bash
npm install @empiricalrun/fetch
```
## Usage
```js
import {fetchWithRetry} from "@empiricalrun/fetch";

// Define shouldRetryFunction
function shouldRetry(response) {
    // Define your retry condition logic here
    return true;
}

// Usage example
const resp = await fetchWithRetry("<path>", { maxRetries: 2, timeout: 4000, shouldRetry });
const data = await resp.json();
```

> Note: if the retry count has reached max value then `shouldRetry` cannot be called