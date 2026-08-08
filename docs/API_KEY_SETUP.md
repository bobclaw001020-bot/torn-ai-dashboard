# Torn API Key Setup

API keys are entered by the user through the web application. **Never commit a Torn API key to GitHub or put one in `.env`.**

## Profile setup flow

1. Admin opens Settings -> Profiles -> Add user.
2. Enter a display name.
3. Enter the Torn user ID.
4. Paste that profile's Torn API key into the secure form.
5. The server validates the key with Torn.
6. If valid, the server encrypts the API key and stores only the ciphertext.
7. The browser never receives the stored plaintext key.

## Key replacement

Settings -> Profiles -> selected profile -> Reset/Replace API key.

The old encrypted value is replaced after the new key passes validation.

## Key deletion

The admin can delete the stored key. Deleting a key stops future sync for that profile; historical data may be retained or deleted according to the explicit admin choice.

## Security requirements

- API keys are submitted over HTTPS.
- Encryption happens server-side.
- Encryption master key is stored in deployment secrets.
- API keys are never logged.
- API keys are never included in AI prompts.
- API keys are never returned by profile APIs.
- API keys are never committed to GitHub.
