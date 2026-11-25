# Provider credential routing
Primary and secondary keys remain in Cloudflare production secrets. Never store values in Git.
The router selects one credential per request, alternates distinct credentials only for an authorized pool, and stops the whole provider on 429 or 402 (honoring Retry-After; 402 pauses at least an hour). It may try another authorized credential on 401. No same-provider quota bypass. Cooldowns and concurrency are isolate-local, not a distributed quota enforcement mechanism.
Default: existing local data, Horde and OpenRouter remain available, Groq/Workers AI retain existing free-plan gates. Keenable keyless remains the default.
Activation flags (Text value true only when the corresponding condition is established):
- ZAI_PUBLIC_USE_AUTHORIZED: Z.ai confirms this public app's campaign-finance research is permitted.
- ZAI_FREE_CONFIRMED: glm-4.7-flash free inference confirmed for the account.
- KEENABLE_FREE_CONFIRMED: authenticated usage cannot incur paid overages; otherwise keep keyless.
- TINYFISH_PUBLIC_USE_AUTHORIZED: provider permits serving public app users. Only free TinySearch is integrated, not paid automation.
- ZAI_POOL_AUTHORIZED, KEENABLE_POOL_AUTHORIZED, TINYFISH_POOL_AUTHORIZED: provider permits pooling the two accounts for this application. Without permission only primary credential is selected.
GET /api/research and GET /api/web-search report counts and configuration without returning secret values.
