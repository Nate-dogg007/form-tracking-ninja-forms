<script>
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
