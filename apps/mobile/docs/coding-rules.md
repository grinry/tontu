# Mobile coding rules

Follow the repository [coding rules](../../../docs/coding-rules.md) and [mobile AGENTS.md](../AGENTS.md).

Keep screens, requests, feature state, validation, and local types/helpers in their owning `src/domains/<domain>/`. A domain cannot import another domain. Reused implementations belong in `src/shared/`; only composition/navigation imports domain public indexes. Shared modules must not import domain code.

Do not import backend source or server dependencies. Validate untrusted API responses before using them. Handle loading, failure, cancellation/timeouts, and duplicate requests where relevant. Avoid coupling client screens to Mastra's vendor API; product functionality should use the application backend API.

Keep helpers/types/constants focused and extract them when there are more than one or two small local definitions. Keep styles close to their screen unless styles are actually reused. Prefer const patterns over enums and use meaningful constants for repeated values.

Consult version-matched Expo docs before using framework/native APIs. Maintain accessibility labels/live feedback and account for emulator versus physical-device connectivity. Never store secrets in `EXPO_PUBLIC_*` variables; these values are embedded in the client bundle.

When changing features, configuration, navigation, API contracts, build commands, or deployment assumptions, update the relevant mobile docs and their index in the same change.
