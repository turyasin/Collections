# Email Notification Setup Guide

## SendGrid Configuration

The application uses SendGrid to send email reminders for invoices due in 2 days.

### Setup Instructions:

1. **Get SendGrid API Key:**
   - Go to https://sendgrid.com/
   - Sign up for a free account (allows 100 emails/day)
   - Navigate to Settings → API Keys
   - Create a new API key with "Mail Send" permissions
   - Copy the API key

2. **Configure the Application:**
   - Open `/app/backend/.env`
   - Replace `your-sendgrid-api-key-here` with your actual SendGrid API key:
   ```
   SENDGRID_API_KEY="SG.your-actual-key-here"
   ```
   - Admin email is already set to: `turyasin@gmail.com`

3. **Restart Backend:**
   ```bash
   sudo supervisorctl restart backend
   ```

### How It Works:

- **Schedule:** Every day at 12:00 PM (Turkish Local Time)
- **Check:** System checks for unpaid/partial invoices due in exactly 2 days
- **Email:** Sends reminder email to `turyasin@gmail.com` with:
  - Invoice Number
  - Customer Name
  - Amount (in Turkish Lira ₺)
  - Due Date

### Manual Testing:

To manually trigger the reminder check:

```bash
# Login first
curl -X POST "YOUR_BACKEND_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "your@email.com", "password": "yourpassword"}'

# Use the token to trigger check
curl -X POST "YOUR_BACKEND_URL/api/notifications/check-reminders" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Email Template:

The reminder email includes:
- Professional HTML formatting
- Invoice details (Number, Customer, Amount in ₺, Due Date)
- Warning message about payment collection
- Automated signature

### Troubleshooting:

Check backend logs for email status:
```bash
tail -f /var/log/supervisor/backend.err.log | grep -i email
```

If you see "SendGrid API key not configured", verify the API key is correctly set in `.env` file.
