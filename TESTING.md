# Caterfy Testing Guide

All Stripe integrations are in **test mode**. No real money moves. Use the test card numbers below.

---

## 1. Caterer Signup & Onboarding

1. Go to `/signup`
2. Enter a business name, email, and password
3. Check your inbox for a verification email — click the link
4. You'll be redirected to `/dashboard`
5. Check the setup checklist on the dashboard — it shows what's still needed

---

## 2. Set Up Your Profile

Go to `/settings`:

- **Business Profile** — add your phone number and select a location
- **Categories** — tick some cuisine types, event types, and dietary options
- **Contact Methods** — toggle whether contact info shows publicly

---

## 3. Build Your Site

Go to `/site-editor`:

- Pick a template (Classic, Modern, Bold)
- Upload a hero image and logo
- Add a tagline, about text, and terms & conditions
- Set your brand colours and fonts
- Set your URL slug (e.g. `test-caterer`)
- Click **Save Changes**

Visit `/{your-slug}` to see your public site.

---

## 4. Add Menu Items

Go to `/menu`:

- Add a few menu items with prices
- Add a package (e.g. "Silver Package — £25pp, 20–100 guests")
- Toggle items on/off with the availability switch

---

## 5. Add Gallery Images

Go to `/gallery` and upload at least 3 images. They'll appear in the gallery section of your public site.

---

## 6. Test the Subscription Flow

Go to `/settings` → **Subscription** tab → click **Subscribe — £10/month**

Use this Stripe test card:
- Card number: `4242 4242 4242 4242`
- Expiry: any future date (e.g. `12/30`)
- CVC: any 3 digits (e.g. `123`)
- Postcode: any (e.g. `SW1A 1AA`)

After completing checkout, you'll be redirected back to `/settings` and your status should show **active**.

To test a failed payment, use card: `4000 0000 0000 0341`

---

## 7. Test Stripe Connect (Caterer Payouts)

Go to `/payments` → click **Connect with Stripe**

You'll be taken to Stripe's onboarding. In test mode, use these details:
- Phone: `07400 000000` → verification code: `000000`
- Use any fake business details
- Bank account (UK sort code): `108800`, account number: `00012345`

Once completed, your dashboard will show your Connect account as active.

---

## 8. Test the Order Flow (as a Customer)

Open your public site at `/{your-slug}` in a **different browser or incognito tab**.

### Fixed-price order
1. Click **Place Order**
2. Select some menu items
3. Fill in event details and your contact info
4. Choose **Pay by card**
5. Use test card `4242 4242 4242 4242`
6. Submit — you'll get a reference number (e.g. `CAT-A1B2C3D4`)

### Quote request
1. Click **Request a Quote** (if the caterer has quote mode enabled)
2. Fill in event details
3. Submit — caterer receives an email notification

---

## 9. Manage Orders (as the Caterer)

Go to `/orders` in your dashboard:

- You'll see the new order in the **Pending** tab
- Click **Accept** to accept it (customer gets an email)
- Click **Decline** to decline it
- For quote requests, click **Send Quote**, add line items, and send

---

## 10. Test Order Status Lookup (as a Customer)

Go to `/order-status` and enter:
- The reference number from step 8 (e.g. `CAT-A1B2C3D4`)
- The email address used when placing the order

You'll see the current order status, event details, and caterer contact info.

---

## 11. Test the Review Flow

Go to `/review?order=CAT-A1B2C3D4&email=customer@email.com` (replace with real values)

- Leave a star rating and optional text
- Submit
- The caterer gets an email notification
- The review appears on the public caterer page and in `/reviews` in the dashboard

---

## 12. Test the Admin Dashboard

Go to `/mistuzzo` — this is the admin panel showing all caterers, orders, and platform stats.

---

## Stripe Test Cards Reference

| Scenario | Card Number |
|---|---|
| Successful payment | `4242 4242 4242 4242` |
| Payment declined | `4000 0000 0000 0002` |
| Requires authentication (3DS) | `4000 0025 0000 3155` |
| Payment fails after authorise | `4000 0000 0000 0341` |

All test cards use any future expiry, any CVC, any postcode.

---

## Checking Webhooks

In Stripe Dashboard → **Developers → Webhooks**, you can see all events being sent to your endpoint and whether they succeeded. If a webhook fails, you can resend it manually from there.
