<script>
/*
=========================================
Ninja Forms Tracking Script for GTM
Author: Nathan O'Connor
=========================================

📌 What this script does:
- Listens for successful Ninja Forms submissions.
- Extracts form field data (labels and values).
- Hashes any fields that include "email" or "phone" using SHA-256 (for Enhanced Conversions).
- Pushes a `form_submission_hashed` event to the dataLayer, including:
  - form_id
  - form_name (dynamically pulled from Ninja Forms global config)
  - form_data (with plain and hashed fields)

✅ How to use in Google Tag Manager:
1. Create a new Custom HTML tag in GTM.
2. Paste this entire script into the tag.
3. Set the trigger to fire on All Pages (or where the Ninja Form appears).
4. In GTM, use Data Layer Variables to capture:
   - `form_data.hashed_email_address`
   - `form_data.hashed_phone_number`
   - `form_details.form_name`, etc.
5. Connect these to Google Ads/GA4 as needed for tracking or Enhanced Conversions.

This script is designed specifically for Ninja Forms using the `nfFormSubmitResponse` event.
*/

  
(function () {
  // Hashing function (SHA-256)
  function hashString(str) {
    if (typeof str !== 'string' || str.length === 0) {
      return Promise.resolve('');
    }

    var encoder = new TextEncoder();
    var data = encoder.encode(str);

    return crypto.subtle.digest('SHA-256', data).then(function (buffer) {
      var hashArray = Array.prototype.slice.call(new Uint8Array(buffer));
      return hashArray.map(function (b) {
        return ('00' + b.toString(16)).slice(-2);
      }).join('');
    }).catch(function (err) {
      console.error('Hashing error:', err);
      return '';
    });
  }

  // Convert Ninja fields to a simpler format
  function convertNinjaFields(fields) {
    var inputs = {};
    for (var key in fields) {
      if (fields.hasOwnProperty(key)) {
        var label = fields[key].label;
        var slug = label.toLowerCase().replace(/ /g, "_");
        var value = fields[key].value;

        // Clean phone numbers
        if (slug.includes('phone')) {
          value = value.replace(/[\(\)\s-]/g, '');
        }

        inputs[slug] = value;
      }
    }
    return inputs;
  }

  // Lookup Ninja Form name from nfForms global config
  function getFormNameFromNinja(formId) {
    if (typeof nfForms !== 'undefined' && Array.isArray(nfForms)) {
      for (var i = 0; i < nfForms.length; i++) {
        if (nfForms[i] && nfForms[i].id === String(formId)) {
          return nfForms[i].settings && nfForms[i].settings.title
            ? nfForms[i].settings.title
            : '(no form name)';
        }
      }
    }
    return '(no form name)';
  }

  // Listen for Ninja Form submissions
  jQuery(document).on('nfFormSubmitResponse', function(event, responseData) {
    var formId = responseData.id;
    var rawFields = responseData.response.data.fields;
    var cleanFields = convertNinjaFields(rawFields);
    var formData = {};
    var promises = [];

    for (var key in cleanFields) {
      if (cleanFields.hasOwnProperty(key)) {
        var value = cleanFields[key];
        var lowerKey = key.toLowerCase();

        // If key contains 'email' or 'phone' → hash it
        if (lowerKey.includes('email') || lowerKey.includes('phone')) {
          (function (fieldName, fieldValue) {
            var p = hashString(fieldValue).then(function (hash) {
              formData['hashed_' + fieldName] = hash;
            });
            promises.push(p);
          })(key, value);
        } else {
          formData[key] = value;
        }
      }
    }

    Promise.all(promises).then(function () {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'form_submission_hashed',
        form_details: {
          form_id: String(formId),
          form_name: getFormNameFromNinja(formId)
        },
        form_data: formData
      });
      console.log('✅ form_submission_hashed event pushed to dataLayer');
    });
  });
})();
</script>
