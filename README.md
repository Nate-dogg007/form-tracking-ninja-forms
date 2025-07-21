# 🧩 Ninja Forms GTM Tracking Script

Author: **Nathan O’Connor**  
Version: `1.0`  
Last Updated: `2025-07-17`

---

## 📋 What This Script Does

This script is built to track form submissions from [Ninja Forms](https://ninjaforms.com) in WordPress and push enriched event data into the `dataLayer` for use with **Google Tag Manager (GTM)**, **Google Ads Enhanced Conversions**, or **GA4**.

### ✅ Features:

- Listens for the `nfFormSubmitResponse` event triggered by Ninja Forms on successful submission.
- Collects form field data (label + value).
- Automatically hashes email and phone fields using **SHA-256**.
- Normalizes all keys: lowercase, underscores only (e.g. `hashed_email_address`, not `Hashed Email`).
- Pushes a custom event to the `dataLayer` called: `form_submission_hashed`.
- Dynamically pulls the **form title** from Ninja Forms’ global config (`nfForms`).

---

## 🚀 How To Use in Google Tag Manager

1. **Create a New Tag:**
   - Tag Type: `Custom HTML`
   - Paste the script into the tag editor.

2. **Set the Trigger:**
   - Use `All Pages` or restrict to pages where Ninja Forms are used.

3. **Create Data Layer Variables:**
   Create the following **Data Layer Variables** in GTM:
   - `form_data.hashed_email_address`
   - `form_data.hashed_phone_number`
   - `form_details.form_name`
   - `form_details.form_id`
   - Any other fields inside `form_data` (e.g., `contact_name`, `company_name`)

4. **Test in GTM Preview Mode:**
   - Submit a Ninja Form.
   - Look for the `form_submission_hashed` event in the preview pane.
   - Confirm `form_name`, hashed values, and input data appear correctly.

5. **Send to Google Ads or GA4:**
   - Connect the variables to the appropriate GA4 or Google Ads tags (e.g., Enhanced Conversion fields).

---

## 📦 Example DataLayer Output

```js
{
  event: "form_submission_hashed",
  form_details: {
    form_id: "1",
    form_name: "Contact Me"
  },
  form_data: {
    contact_name: "Nathan",
    company_name: "Adtrak",
    hashed_email_address: "d04cfd3abc...",
    hashed_phone_number: "7d395fd112..."
  }
}
```

---

## 🧠 Notes

- This script requires **jQuery**, which Ninja Forms already uses.
- Make sure `nfForms` is exposed globally (which it is by default in most Ninja Form setups).
- The script excludes fields like password or payment card data by default.

---

## 🔐 Privacy & Compliance

This script:
- Hashes personal identifiers like email/phone using **SHA-256** before pushing them to the dataLayer.
- Supports privacy-first analytics and **GDPR-compliant** Enhanced Conversion setups.

---

## 🛠️ Troubleshooting

- If `form_name` shows as `(no form name)`:
  - Ensure the form has a proper title in the Ninja Forms admin.
  - Check that `nfForms` is not modified by other plugins.

---

## 👏 Attribution

Created by **Nathan O'Connor**  
[www.nathanoconnor.co.uk](https://www.nathanoconnor.co.uk)
