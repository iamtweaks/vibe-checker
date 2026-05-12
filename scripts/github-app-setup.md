# VibeChecker GitHub App Setup

This document explains how to register and configure the VibeChecker GitHub App for automatic PR scanning.

## Overview

The VibeChecker GitHub App listens to `pull_request` webhook events and automatically scans changed files for:
- Debug statements (`console.log`, etc.)
- TODOs without issue references
- Hardcoded secrets and credentials
- Dangerous `eval()` usage
- XSS risks via `innerHTML`

## Prerequisites

- A GitHub organization or user account
- Access to create GitHub Apps
- The webhook server must be publicly accessible (or use a tunneling solution for development)

## Step 1: Register a New GitHub App

### Option A: Using the Manifest

1. Go to GitHub Settings → Developer settings → GitHub Apps
2. Click "New GitHub App"
3. Click "Register GitHub App" using a manifest
4. Use the manifest file at [`.github/APP.yml`](.github/APP.yml)
5. Follow the prompts to install on your account/organization

### Option B: Manual Registration

1. Go to GitHub Settings → Developer settings → GitHub Apps
2. Click "New GitHub App"
3. Fill in the following:

**GitHub App Name:** `VibeChecker` (must be unique across GitHub)

**Homepage URL:** `https://vibecheck.dev`

**Webhook URL:** Your deployed webhook endpoint (e.g., `https://your-server.com/api/webhooks/github`)

**Webhook Secret:** Generate a random secure string (min 20 chars)

**Permissions:**
| Permission | Access |
|------------|--------|
| Repository permissions → Contents | Read-only |
| Repository permissions → Pull requests | Read & Write |
| Repository permissions → Metadata | Read-only |
| Repository permissions → Checks | Read-only |

**Events:**
- `pull_request` (subscribe)

**Where can this GitHub App be installed?** → Any account / Organization

## Step 2: Configure Environment Variables

Set these on your webhook server:

```bash
# GitHub App credentials
GITHUB_APP_ID=123456
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----"

# Webhook secret (must match what you set in GitHub)
GITHUB_WEBHOOK_SECRET=your_webhook_secret_here

# Optional: VibeChecker API URL
VIBECHECKER_URL=https://vibecheck.dev
```

### Getting Your GitHub App Credentials

**GITHUB_APP_ID:**
1. Go to your GitHub App settings
2. Copy the "App ID" from the top of the page

**GITHUB_APP_PRIVATE_KEY:**
1. Go to your GitHub App settings
2. Click "Generate a private key" (bottom of the page)
3. Download the `.pem` file
4. Set the contents as `GITHUB_APP_PRIVATE_KEY` (ensure proper newline formatting)

## Step 3: Install the App

1. Go to your GitHub App settings
2. Click "Install App"
3. Select the account/organization
4. Choose which repositories to scan (all or specific ones)

## Step 4: Verify Installation

1. Open a test PR in one of the installed repositories
2. You should see a comment from VibeChecker within a few seconds

## Development with ngrok

For local development, use ngrok to expose your webhook:

```bash
ngrok http 3000
# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)

# Update your GitHub App webhook URL to:
# https://abc123.ngrok.io/api/webhooks/github
```

## Troubleshooting

### "Failed to get installation access token"
- Verify `GITHUB_APP_ID` is correct
- Verify `GITHUB_APP_PRIVATE_KEY` is properly formatted (check newlines)
- Ensure the App is installed on the repository

### "Invalid signature"
- Verify `GITHUB_WEBHOOK_SECRET` matches exactly what you set in GitHub
- The signature header format is `sha256=<hex>`

### Webhook not triggering
- Ensure the App is installed on the repository
- Verify the webhook URL is publicly accessible
- Check GitHub webhook delivery logs in App settings

## Architecture Notes

```
PR Opened/Updated
       ↓
GitHub sends webhook POST
       ↓
route.ts verifies signature
       ↓
Gets installation access token
       ↓
Fetches changed files from PR
       ↓
Scans each file for issues
       ↓
Posts summary comment to PR
```

## Security Considerations

- The webhook handler is **stateless** - safe for serverless deployment
- Webhook secret verification prevents spoofed requests
- JWT tokens expire after 10 minutes (auto-refreshed)
- No secrets stored in code - all via environment variables