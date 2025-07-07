(function () {
  if (!window.crypto || !crypto.subtle) {
    console.warn('SubtleCrypto not supported.');
    return;
  }

  // ✅ CookieYes consent check
  function hasConsent() {
    return (
      window.cookieyes &&
      window.cookieyes.gtm_consent &&
      window.cookieyes.gtm_consent.ad_storage === 'granted'
    );
  }

  // ✅ SHA-256 Hash function
  function hashString(str) {
    if (typeof str !== 'string' || str.length === 0) return Promise.resolve('');
    var encoder = new TextEncoder();
    var data = encoder.encode(str);
    return crypto.subtle.digest('SHA-256', data).then(function (buffer) {
      return Array.from(new Uint8Array(buffer))
        .map(function (b) {
          return ('00' + b.toString(16)).slice(-2);
        })
        .join('');
    });
  }

  // ✅ Convert Ninja Forms data to key-value format
  function convertNinjaFieldsToInputs(fields) {
    var inputs = {};
    for (var key in fields) {
      if (!fields.hasOwnProperty(key)) continue;

      var label = fields[key].label || '';
      var slug = label.toLowerCase().replace(/[^a-z0-9]/g, '_');
      var value = fields[key].value || '';

      if (slug === 'phone') {
        value = value.replace(/[\(\)\s-]/g, '');
      }

      inputs[slug] = value;
    }
    return inputs;
  }

  // ✅ Main tracking function
  function processNinjaForm(responseData) {
    if (!hasConsent()) {
      console.warn('Consent not granted.');
      return;
    }

    var rawInputs = convertNinjaFieldsToInputs(responseData.response.data.fields || {});
    var fieldsToHash = ['email', 'phone'];
    var formData = {};
    var promises = [];

    Object.keys(rawInputs).forEach(function (key) {
      var value = rawInputs[key];
      var shouldHash = fieldsToHash.some(function (f) {
        return key.indexOf(f) !== -1;
      });

      if (shouldHash) {
        var p = hashString(value).then(function (hashed) {
          formData['hashed_' + key] = hashed;
        });
        promises.push(p);
      } else {
        formData[key] = value;
      }
    });

    Promise.all(promises).then(function () {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'form_submission_hashed',
        form_details: {
          form_id: responseData.id || 'N/A',
          form_name:
            (responseData.response.settings && responseData.response.settings.form_title) ||
            'Ninja Form',
        },
        form_data: formData,
      });
    });
  }

  // ✅ Listen to jQuery-based Ninja Forms event
  jQuery(document).on('nfFormSubmitResponse', function (event, responseData, id) {
    processNinjaForm(responseData);
  });
})();
