# n8n Email Broadcast Setup Guide

> **Purpose:** When a TPO clicks "Notify All Eligible" in the Notification Center, the backend POSTs student emails + drive details to an n8n webhook. n8n then sends individual emails to each eligible student using its built-in Email (SMTP) node.

---

## Architecture

```
┌──────────────┐     POST /api/notifications/broadcast     ┌──────────────┐
│   Frontend   │ ─────────────────────────────────────────► │   Backend    │
│  (TPO click) │                                            │  (FastAPI)   │
└──────────────┘                                            └──────┬───────┘
                                                                   │
                                                    POST to N8N_WEBHOOK_URL
                                                    {students, drive}
                                                                   │
                                                                   ▼
                                                            ┌──────────────┐
                                                            │     n8n      │
                                                            │  (Docker)    │
                                                            │  port: 5678  │
                                                            └──────┬───────┘
                                                                   │
                                                         SMTP (Gmail/Outlook)
                                                                   │
                                                                   ▼
                                                            ┌──────────────┐
                                                            │   Student    │
                                                            │   Inbox 📧   │
                                                            └──────────────┘
```

---

## Prerequisites

- Docker & Docker Compose running
- A Gmail account with **2-Step Verification** enabled (for Gmail App Password)
- At least one drive created in PlacementPro with eligible students

---

## Step 1 — Start n8n

n8n is already defined in `docker-compose.yml`. Start it:

```bash
docker-compose up -d n8n
```

Verify it's running:

```bash
docker-compose ps n8n
```

Open **http://localhost:5678** in your browser.

**First-time setup:** n8n will ask you to create an owner account. Use any email/password you prefer — this is local to your n8n instance.

---

## Step 2 — Get a Gmail App Password

> Skip this if you're using a different SMTP provider (Outlook, custom SMTP, etc.)

1. Go to **https://myaccount.google.com/security**
2. Ensure **2-Step Verification** is **ON**
3. Go to **https://myaccount.google.com/apppasswords**
4. Select app: **Mail**, device: **Other** → name it `PlacementPro n8n`
5. Click **Generate** → copy the **16-character password** (e.g. `abcd efgh ijkl mnop`)
6. Save this password — you'll use it in Step 4

---

## Step 3 — Create the Broadcast Workflow

In the n8n editor (http://localhost:5678):

1. Click **"Add workflow"** (top-right)
2. Name it: **`Placement Drive Broadcast`**

### Node 1: Webhook (Trigger)

1. Click **"+"** → search for **"Webhook"** → add it
2. Configure:
   - **HTTP Method:** `POST`
   - **Path:** `broadcast`
3. This will generate a webhook URL like:
   ```
   http://localhost:5678/webhook/broadcast      (for external access)
   http://placementpro_n8n:5678/webhook/broadcast  (Docker internal)
   ```

### Node 2: Split In Batches (Loop)

1. Click **"+"** after the Webhook node → search **"Loop Over Items"** (or "Split In Batches")
2. This node loops through the `students` array from the webhook payload
3. In the **Input** field, set it to process `{{ $json.students }}`

> **Alternative (simpler):** You can skip the loop node and use the "Send Email" node directly if you set "Send to" as an expression. The webhook payload already has individual student objects when looping.

### Node 3: Send Email (SMTP)

1. Click **"+"** after the loop → search **"Send Email"** → add it
2. Configure the fields (see Step 4 below)

### Connect the nodes

```
[Webhook] ──► [Loop Over Items] ──► [Send Email]
```

---

## Step 4 — Configure SMTP Credentials

In the **Send Email** node, click **"Credential"** → **"Create New"** → choose **SMTP**:

### For Gmail:

| Field | Value |
|-------|-------|
| **Host** | `smtp.gmail.com` |
| **Port** | `465` |
| **SSL/TLS** | `✅ Enabled` |
| **User** | `your-tpo-email@gmail.com` |
| **Password** | The 16-char App Password from Step 2 |

### For Outlook/Office 365:

| Field | Value |
|-------|-------|
| **Host** | `smtp.office365.com` |
| **Port** | `587` |
| **SSL/TLS** | `✅ Enabled (STARTTLS)` |
| **User** | `your-tpo@college.edu` |
| **Password** | Your Outlook password |

Click **"Test"** to verify the connection works.

---

## Step 5 — Configure Email Fields

In the Send Email node, set these fields using **expressions** (click the `{ }` icon to toggle expression mode):

| Field | Mode | Value |
|-------|------|-------|
| **From Email** | Fixed | `tpo@sahyadri.edu.in` (or your TPO email) |
| **To Email** | Expression | `{{ $json.email }}` |
| **Subject** | Expression | `🎓 You're eligible for {{ $('Webhook').first().json.drive.company_name }} — {{ $('Webhook').first().json.drive.role }}!` |
| **Email Format** | Fixed | `HTML` |
| **HTML Body** | Expression | See below |

### Email HTML Body Template

Paste this into the HTML body field:

```html
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🎓 PlacementPro</h1>
    <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0;">Training & Placement Office</p>
  </div>

  <div style="background: white; border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
    <h2 style="color: #1f2937; margin-top: 0;">Hi {{ $json.name }},</h2>

    <p style="color: #4b5563; line-height: 1.6;">
      Great news! Based on your profile, you are <strong>eligible</strong> for the following placement drive:
    </p>

    <table style="border-collapse: collapse; width: 100%; margin: 16px 0; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
      <tr style="background: #f9fafb;">
        <td style="padding: 12px 16px; font-weight: 600; color: #374151; width: 120px;">Company</td>
        <td style="padding: 12px 16px; color: #1f2937;">{{ $('Webhook').first().json.drive.company_name }}</td>
      </tr>
      <tr>
        <td style="padding: 12px 16px; font-weight: 600; color: #374151; border-top: 1px solid #e5e7eb;">Role</td>
        <td style="padding: 12px 16px; color: #1f2937; border-top: 1px solid #e5e7eb;">{{ $('Webhook').first().json.drive.role }}</td>
      </tr>
      <tr style="background: #f9fafb;">
        <td style="padding: 12px 16px; font-weight: 600; color: #374151; border-top: 1px solid #e5e7eb;">Date</td>
        <td style="padding: 12px 16px; color: #1f2937; border-top: 1px solid #e5e7eb;">{{ $('Webhook').first().json.drive.drive_date }}</td>
      </tr>
    </table>

    <p style="color: #4b5563; line-height: 1.6;">
      Log in to <strong>PlacementPro</strong> to apply before the deadline.
    </p>

    <div style="text-align: center; margin: 24px 0;">
      <a href="http://localhost:5173/student/feed"
         style="background: #6366f1; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
        Apply Now →
      </a>
    </div>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

    <p style="color: #9ca3af; font-size: 12px; text-align: center;">
      This is an automated notification from PlacementPro.<br />
      Training & Placement Office, Sahyadri College of Engineering & Management
    </p>
  </div>
</div>
```

---

## Step 6 — Activate the Workflow

1. Click the **toggle switch** in the top-right corner of the n8n editor
2. The workflow should show **"Active"** in green
3. The webhook URL is now live and listening

---

## Step 7 — Update Backend .env

The webhook URL is already configured in `backend/.env`:

```env
N8N_WEBHOOK_URL=http://placementpro_n8n:5678/webhook/broadcast
```

> This uses Docker's **internal network** — the backend container reaches n8n directly without going through localhost.

Restart the backend to pick up the env change:

```bash
docker-compose restart backend
```

---

## Step 8 — Test End-to-End

### From the UI:

1. Log in as **TPO**
2. Go to **Notification Center** (`/tpo/notifications`)
3. Click **"🔍 Find Eligible Students"** on a drive
4. Click **"📧 Notify All Eligible"**
5. Confirm in the modal
6. You should see a success toast: *"Notification dispatched to X students."*

### Verify:

| Where to check | What to look for |
|-----------------|------------------|
| **n8n Executions** | http://localhost:5678 → Executions tab → shows the run with student data |
| **Backend logs** | `docker-compose logs backend` → look for `n8n broadcast dispatched` |
| **Student email** | Check the inbox of the test student(s) |
| **MongoDB** | `notifications_log` collection now has a document with `status: "dispatched"` |

### Test with curl (optional):

```bash
# Get a TPO auth token first, then:
curl -X POST http://localhost:8001/api/notifications/broadcast \
  -H "Authorization: Bearer <TPO_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"drive_id": "<DRIVE_ID>", "student_ids": ["<STUDENT_USER_ID_1>"]}'
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| n8n not reachable | Run `docker-compose up -d n8n` and check `docker-compose ps` |
| `N8N_WEBHOOK_URL not configured` in logs | Check `backend/.env` has `N8N_WEBHOOK_URL` set |
| n8n webhook returns 404 | Make sure the workflow is **activated** (green toggle) |
| Emails not sending | Check SMTP credentials in n8n; test the credential connection |
| Gmail blocks login | Use an **App Password**, not your regular password |
| `Authentication failed` | Ensure 2FA is enabled and re-generate the App Password |
| n8n timeout | The backend retries once after 3s. Check n8n container health |

---

## Payload Reference

The backend sends this JSON to the n8n webhook:

```json
{
  "students": [
    {
      "email": "student@gmail.com",
      "name": "Karthik A",
      "student_id": "65f1a2b3c4d5e6f7a8b9c0d1"
    }
  ],
  "drive": {
    "company_name": "Infosys",
    "role": "Software Engineer",
    "drive_date": "2026-03-15T09:00:00+00:00",
    "description": "Campus hiring drive for 2026 batch"
  }
}
```

In n8n expressions, access these as:
- Student email: `{{ $json.email }}`
- Student name: `{{ $json.name }}`
- Drive company: `{{ $('Webhook').first().json.drive.company_name }}`
- Drive role: `{{ $('Webhook').first().json.drive.role }}`
- Drive date: `{{ $('Webhook').first().json.drive.drive_date }}`
