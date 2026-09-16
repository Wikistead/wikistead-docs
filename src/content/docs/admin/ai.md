---
title: AI
screens:
  admin-surface:ai: [save, remove, enableToggleLabel]
---

**Admin → AI** is where a workspace connects its own AI provider and turns AI features on. Nothing is
sent to a provider until both of the steps below are done. AI is off by default everywhere.

## 1. Connect a provider

Choose a provider (Anthropic or OpenAI), a model, and paste in your own API key. This is
**bring-your-own-key**: the workspace pays its own provider directly, at its own provider's prices.
Press **Save** once the fields are filled in.

- The **model** is required; there is no default. Pick the exact model name your provider account
  can use.
- The **key is write-only**. Once saved, it is never shown again, on this screen or any other, not
  even masked. If you need to change it, paste in a new one; leaving the field blank on a later save
  keeps the key you already have.
- **Remove configuration** deletes the saved key. Reconnecting means pasting it in again.

## 2. Turn AI on for this workspace

Connecting a provider does not switch anything on by itself. **Enable AI for this workspace** is the
toggle below it, the workspace's own consent to send content to that provider, off until an admin
turns it on. Turning it back off stops any further use immediately.

## Why AI might still say "not available"

A member-facing AI feature checks three things, and if any one of them is off, AI stays off:

- **Your plan includes AI.** Some plans do not.
- **A provider is connected**, above.
- **This workspace has turned AI on**, above.

The AI tab names whichever of these is missing, so you know which step to take next rather than
guessing why a feature is greyed out.

## Self-hosted

A self-hosted deployment must also have an AI provider wired in at the deployment level before any
workspace's own connection can be used. See the [self-hosting guide](/getting-started/self-hosting/).
Nothing here bills or meters against a self-hosted install; the cost is between the workspace and
whichever provider it connected.
