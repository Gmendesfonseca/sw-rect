| Feature / Capability            | Web Worker              | Shared Worker                    | Service Worker                               |
| ------------------------------- | ----------------------- | -------------------------------- | -------------------------------------------- |
| Scope                           | Single page/tab         | Shared across tabs (same origin) | Global (site-wide, independent of tabs)      |
| Shared across tabs              | No                      | Yes                              | Yes                                          |
| Communication                   | `postMessage` (1:1)     | `port.postMessage` (many:1)      | `postMessage`, `fetch`, Push API, etc.       |
| Persists after tab closes       | No                      | No                               | Yes (managed by browser)                     |
| Use case                        | Offload CPU-heavy tasks | Coordinate logic across tabs     | Background sync, caching, push notifications |
| DOM access                      | No                      | No                               | No                                           |
| Network interception            | No                      | No                               | Yes (`fetch` interception)                   |
| Requires secure context (HTTPS) | No                      | No                               | Yes (HTTPS required)                         |

Conclusion
Service Workers are a cornerstone of modern web development, enabling Progressive Web Apps (PWAs) that are reliable, fast, and engaging. We've seen how they can:

➖ Provide a seamless offline experience by caching resources.

➖ Defer actions until the network is available with Background Sync.

➖ Re-engage users with Push Notifications.

While manual implementation is possible, libraries like Workbox are highly recommended to simplify development and avoid common pitfalls.

**References**

- https://www.rahuljuliato.com/posts/react-workers
- https://www.rahuljuliato.com/posts/react-service-workers
- https://github.com/LionyxML/service-workers-react-talk/blob/main/service-workers-demos/02-react-sw-manual/public/service-worker.js
- https://www.linkedin.com/posts/neciudan_javascript-frontend-websockets-activity-7368520393722159104-qbvJ
