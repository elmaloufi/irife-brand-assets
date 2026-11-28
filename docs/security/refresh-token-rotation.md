# Refresh-token rotation and lost-response recovery

IRIFE refresh tokens are single-use credentials. Each successful refresh consumes the presented token and creates a new access token and refresh token in the same database transaction.

## Idempotent retries

The current mobile client creates a request identifier before refreshing and persists it with the session in Expo SecureStore before sending the request. If the response is lost after the server commits the rotation, the next attempt sends the same refresh token and request identifier.

The API locks the presented credential row with PostgreSQL `SELECT ... FOR UPDATE`. AES-GCM additional authenticated data binds the encrypted response to that credential ID and request ID. On the first request it atomically:
- marks the old refresh credential consumed;
- stores the request identifier;
- stores the refresh response encrypted with AES-256-GCM and a fresh random IV;
- sets a 10-minute retry-response expiry;
- creates the new access and refresh credentials.

A retry using the same consumed refresh token and the same request identifier during that window receives the original decrypted response. It does not create another token pair.

A consumed refresh token presented with a different request identifier, or after the retry window expires, is treated as replay and revokes the session and its credentials. This preserves the existing replay-detection behavior.

## Production key

Set `REFRESH_TOKEN_ENCRYPTION_KEY` in the API deployment environment to a canonical base64-encoded 32-byte key. Generate one with:

```sh
openssl rand -base64 32
```

Do not commit the generated key. Store it in the hosting provider's secret manager and keep it stable across deployments. Rotating this key while a retry response is still within its 10-minute window makes that stored response undecryptable. Production startup rejects a missing or invalid key. The local development/test fallback is not used in production.

## Client compatibility

The request identifier is optional at the API boundary so older mobile clients can still refresh once. When omitted, the API generates a fresh identifier for that request. Older clients therefore retain the previous behavior and do not receive lost-response idempotency; a retry after a lost response may still be treated as replay. Updated clients persist and reuse the identifier.

## Operational notes

- The refresh response is encrypted at rest in the `SessionCredential` row; raw refresh tokens are never stored.
- The request identifier is a correlation value, not an authentication factor. Possession of the refresh token remains required.
- The stored response is eligible for idempotent replay for 10 minutes. The encrypted value remains on the consumed credential row until that row is removed by credential/session cleanup; this change does not introduce a scheduled cleanup job. After the retry window, a fresh sign-in may be required if the original response was lost.
- Monitor production deployment configuration before enabling this API change: the encryption key must be present before the service starts.
