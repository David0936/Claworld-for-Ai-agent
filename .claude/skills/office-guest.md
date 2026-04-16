# Claworld Office — Guest Agent Integration

Invites other AI agents (or external systems) to appear in your Claworld Desktop pixel office.

## How It Works

```
You (Host)                          Guest Agent
   │                                     │
   ├── Create/get invite code ──────────►│
   │                                     │
   │◄─── Joins office via code ──────────┤
   │                                     │
   └── Guest appears in office slot ─────┘
```

- **Host** generates an invite code from the Office page → copies and shares it
- **Guest** uses this SKILL to join — their agent name + status appear in a pixel office slot
- Multiple guests can join the same office (up to 8 members per room)

---

## For the Host

### Step 1: Open the Office page

Go to your Claworld Desktop → **Office** tab.

If this is your first time, a default room with an invite code is auto-created. Copy the invite code and share it with guests.

### Step 2: Invite others

Share the invite code with other agents or humans. They use the SKILL below to join.

---

## For Guests (Agent SKILL)

When someone shares an invite code with you, follow these steps:

### Step 1: Get the invite code

The host will share a code like `A1B2C3D4`.

### Step 2: Join the office

Run this command to join:

```
lark-cli tenants create --name "Your Agent Name" --your-name "Your Agent Name" --description "Joining the office"
```

Then call the API to join by invite code:

```bash
curl -X POST http://localhost:3000/api/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "action": "join",
    "inviteCode": "A1B2C3D4",
    "yourName": "Your Agent Name",
    "color": "#00d4aa"
  }'
```

Replace `A1B2C3D4` with the actual invite code, and `"Your Agent Name"` with your agent's display name.

### Step 3: Push your status

After joining, periodically push your status so the office updates in real-time.

**For OpenClaw agents**, add this to your SOUL.md or rules:

```
## Claworld Office Status Rules
- When starting a task: push status as "busy" with a description
- When idle: push status as "idle"
- When offline: push status as "offline"

Status endpoint: POST http://localhost:3000/api/tenants
Body: {"action": "update-member", "tenantId": "<your-tenant-id>", "memberId": "<your-member-id>", "status": "<status>", "description": "<what you're doing>"}
```

---

## Status → Office Slot Mapping

| Status | Office Area | Description |
|--------|------------|-------------|
| `online` | 🛋 Sofa | Idle, ready to help |
| `busy` | 💻 Desk | Working on a task |
| `idle` | 🛋 Sofa | Idle, resting |
| `offline` | 🛏 Bed | Disconnected / sleeping |

---

## API Reference

### Tenants

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tenants` | List all rooms |
| POST | `/api/tenants` | Create room (`action: create`) |
| POST | `/api/tenants` | Join by code (`action: join`) |
| POST | `/api/tenants` | Update room (`action: update`) |
| POST | `/api/tenants` | Regenerate invite code (`action: regenerate-code`) |

### Agents

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/agents` | List all agents in the office |
| POST | `/api/agents` | Register a new agent |

---

## Troubleshooting

**"Invalid invite code"**
→ Check the code is exactly as shared (uppercase, 8 chars)

**"Room is full"**
→ The office has reached the max 8 members limit

**Agent not showing in office**
→ Refresh the Office page — agents load on page load

**Status not updating**
→ The status push is one-way; the office polls on refresh. For real-time updates, the office needs WebSocket support (planned).
