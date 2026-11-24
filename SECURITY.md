# IRIFE Security Policy

## Supported development line

Security fixes are evaluated against the current default branch, `main`. The project is under active development and does not currently promise a production service or a formal response-time SLA.

## Reporting a vulnerability

**Do not open a public issue or pull request containing an exploitable vulnerability, exploit code, credentials, personal data, or sensitive logs.**

Use GitHub's private vulnerability reporting feature for this repository when it is enabled:

https://github.com/elmaloufi/irife-brand-assets/security/advisories/new

If private reporting is unavailable, contact the repository owner privately through GitHub and ask for a secure reporting channel. Do not include exploit details in a public message.

Please include, when safe:
- A concise description and affected component/path.
- Impact and realistic attack prerequisites.
- Reproduction steps or a minimal proof of concept that does not access real user data.
- Affected versions/commits and any suggested mitigation.
- Your preferred public attribution, or a request to remain anonymous.

## Safe-harbor expectations

Only test assets and environments you own or have explicit permission to assess. Do not access, modify, delete, or exfiltrate other people's data; do not perform denial-of-service testing; and stop if you encounter real personal or customer data. Good-faith reports are appreciated.

## Secrets and accidental disclosure

If a credential is exposed, do not copy or reuse it. Notify the maintainer privately so it can be revoked and rotated. Removing a secret from the latest commit does not invalidate it; history and any affected systems must also be assessed.

## Disclosure

Please allow maintainers reasonable time to investigate and prepare a fix before public disclosure. Coordinate the disclosure date with the maintainer. This policy does not guarantee a bounty, payment, or a particular response time.
