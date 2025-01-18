# ESD + ITSA

### Prerequisites

1. node
2. pnpm
3. turbo

## Installation

```bash
pnpm install
```

## Usage

1. Running the development server (with module hot reloading)

```bash
pnpm run dev
```

2. Running with docker

```bash
docker compose up -d
```

## Github Actions

### AWS

#### Prequisite

Add in these repository secrets

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`

#### Usage

1. Commit message need to contain `deploy` (case-insensitive) to trigger the workflow

2. Specify the environment to deploy

- `deploy` (case-insensitive): to deploy to development environment
- `deploy-prod` (case-insensitive): to deploy to production environment

## Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
