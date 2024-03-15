// import type { MiddlewareHandler } from "hono";

// export const csrfMiddleware: MiddlewareHandler = (c, next) => {
// 	// CSRF middleware
// 	if (c.req.method === "GET") {
// 		return next();
// 	}
// 	const originHeader = c.req.header("Origin");
// 	// NOTE: You may need to use `X-Forwarded-Host` instead
// 	const hostHeader = c.req.header("Host");
// 	if (!originHeader || !hostHeader || !verifyRequestOrigin(originHeader, [hostHeader])) {
// 		throw c.newResponse('Unauthorized', 403);
// 	}
// 	return next();
// };
