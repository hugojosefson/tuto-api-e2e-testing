# API end to end testing with Docker

> This fork uses mysql instead of postgres, because the original didn't
> immediately run for me, and I need mysql anyway.
> 
> See the upstream repo at
> [fire-ci/tuto-api-e2e-testing](https://github.com/fire-ci/tuto-api-e2e-testing),
> and read
> [API end to end testing with Docker](https://fire.ci/blog/api-end-to-end-testing-with-docker/)
> to dissect it.

## Prerequisites

- Docker
- `/bin/sh`

Run the tests with this command:

```bash
./scripts/run-tests-in-docker-compose
```
