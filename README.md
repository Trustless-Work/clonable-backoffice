<p align="center"> <img src="https://github.com/user-attachments/assets/5b182044-dceb-41f5-acf0-da22dea7c98a" alt="CLR-S (2)"> </p>

# Trustless Work | [API Documentation](https://docs.trustlesswork.com/trustless-work)

The Trustless Work Backoffice is an administrative console for managing the full lifecycle of Trustless Work escrows. It enables deployment, monitoring, and operation of escrows, milestone updates, fund releases, and dispute handling — all in an auditable and accounting-ready workflow.

---

<img width="1509" height="112" alt="image" src="https://github.com/user-attachments/assets/b0293669-f4b0-41f0-add5-39d281d2188d" />

---

# Maintainers | [Telegram](https://t.me/+kmr8tGegxLU0NTA5)

<table align="center">
  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/6b97e15f-9954-47d0-81b5-49f83bed5e4b" alt="Owner 1" width="150" />
      <br /><br />
      <strong>Tech Rebel | Product Manager</strong>
      <br /><br />
      <a href="https://github.com/techrebelgit" target="_blank">techrebelgit</a>
      <br />
      <a href="https://t.me/Tech_Rebel" target="_blank">Telegram</a>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/e245e8af-6f6f-4a0a-a37f-df132e9b4986" alt="Owner 2" width="150" />
      <br /><br />
      <strong>Joel Vargas | Frontend Developer</strong>
      <br /><br />
      <a href="https://github.com/JoelVR17" target="_blank">JoelVR17</a>
      <br />
      <a href="https://t.me/joelvr20" target="_blank">Telegram</a>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/53d65ea1-007e-40aa-b9b5-e7a10d7bea84" alt="Owner 3" width="150" />
      <br /><br />
      <strong>Armando Murillo | Full Stack Developer</strong>
      <br /><br />
      <a href="https://github.com/armandocodecr" target="_blank">armandocodecr</a>
      <br />
      <a href="https://t.me/armandocode" target="_blank">Telegram</a>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/851273f6-2f91-413d-bd2d-d8dc1f3c2d28" alt="Owner 4" width="150" />
      <br /><br />
      <strong>Caleb Loría | Smart Contract Developer</strong>
      <br /><br />
      <a href="https://github.com/zkCaleb-dev" target="_blank">zkCaleb-dev</a>
      <br />
      <a href="https://t.me/zkCaleb_dev" target="_blank">Telegram</a>
    </td>
  </tr>
</table>

---

## Getting Started

Follow the steps below to get started with this project:

## Video Tutorial

[See Video](https://www.youtube.com/watch?v=9EuIe34JwS4)

## Summary

1. Install dependencies.
2. Set enviroment variables.
3. Run the project!

## Steps

1. Fork the repo.
2. Clone the repo locally.
3. Execute `npm i`.
4. Setup .env according to the information below.
   1. The local API Key [Docs](https://docs.trustlesswork.com/trustless-work/developer-resources/request-api-key).
5. Run the project.

## Installation

1. Install dependencies:

   ```bash
   npm i
   ```

2. Format the code using Prettier: (This is for avoid eslint errors)

   ```bash
   npx prettier --write .
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

## Environment Variables

Make sure to set up the following environment variable in your `.env` file:

```

# TRUSTLESS WORK -> See API KEY Video
NEXT_PUBLIC_API_KEY=""

# CROSSMINT (Required for /crossmint route)
NEXT_PUBLIC_CROSSMINT_API_KEY="your_client_key_here"

```

---

## Crossmint Integration Spike (Issue #31)

This project contains a dedicated integration spike located at `/crossmint`. It explores using Crossmint's embedded wallet infrastructure to manage the Trustless Work escrow lifecycle.

### Key Finding: The "C vs G" Address Blocker

The spike successfully bridged the Crossmint and Trustless Work SDKs, but identified a critical architectural mismatch:

- **Crossmint** exclusively provides **Soroban Smart Wallets** on Stellar (addresses starting with `C...`).
- **Trustless Work API** currently expects **Traditional Accounts** (addresses starting with `G...`).
- **Result**: Attempting to deploy an escrow returns a `400 Bad Request` with an `invalid version byte` error.

For full technical details, compatibility notes, and next steps, see the **[Crossmint Findings Report](./docs/CROSSMINT_FINDINGS.md)**.

### Accessing the Demo

1. Set `NEXT_PUBLIC_CROSSMINT_API_KEY` in your `.env`.
2. Navigate to `/crossmint`.
3. Log in with email/social.
4. Attempt an escrow deployment to see the terminal state and error logs.

---

## **Thanks to all the contributors who have made this project possible!**

[![Contributors](https://contrib.rocks/image?repo=Trustless-Work/dApp-Trustless-Work)](https://github.com/Trustless-Work/dApp-Trustless-Work/graphs/contributors)
