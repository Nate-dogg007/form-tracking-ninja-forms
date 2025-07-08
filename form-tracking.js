<script>
(function () {
  // Ensure jQuery is loaded
  if (typeof jQuery === 'undefined') {
    console.error('jQuery is not loaded');
    return;
  }

  function hashString(str) {
    if (typeof str !== 'string' || str.length === 0) {
      return Promise.resolve('');
    }

    // Check for crypto API availability
    if (!window.crypto || !window.crypto.subtle) {
      console.warn('Crypto API not available, skipping hashing');
      return Promise.resolve(''); // Fallback to empty string
    }

    var encoder = new TextEncoder();
    var data = encoder.encode(str);

    return crypto.subtle.digest('SHA-256', data).then(function (buffer) {
      var hashArray = Array.from(new Uint8Array(buffer));
      return hashArray.map(function (b) {
        return ('00' + b.toString(16)).slice(-2);
      }).join('');
    }).catch(function (err) {
      console.error('Hashing error:', err);
      return ''; // Fallback to empty string
    });
  }

  function convertNinjaFieldsToInputs(fields) {
    var inputs = {};
    var promises = [];

    for (var key in fields) {
      if (fields.hasOwnProperty(key)) {
        var label = fields[key].label || '';
        var value = fields[key].value || '';
        var slug = label.toLowerCase().replace(/\s+/g, '_');

        if (slug === 'phone') {
          value = value.replace(/[\(\)\s-]/g, '');
        }

        if (slug === 'email' || slug === 'phone') {
          promises.push(
            hashString(value)
              .then(function (hashed) {
                inputs['hashed_' + slug] = hashed;
              })
              .catch(function (err) {
                console.error('Hashing failed for ' + slug, err);
                inputs['hashed_' + slug] = ''; // Fallback to empty string
              })
          );
        } else {
          inputs[slug] = value;
        }
      }
    }

    return Promise.all(promises).then(function () {
      return inputs;
    }).catch(function (err) {
      console.error('Promise.all failed', err);
      return inputs; // Return inputs even if some promises fail
    });
  }

  jQuery(document).on('nfFormSubmitResponse', function (event, responseData) {
    console.log('nfFormSubmitResponse triggered', responseData); // Debug log
    convertNinjaFieldsToInputs(responseData.response.data.fields).then(function (inputs) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'form_submission_hashed',
        form_details: {
          form_id: responseData.id || 'N/A',
          form_name: responseData.settings.form_title || 'N/A'
        },
        form_data: inputs
      });

      console.log('✅ Ninja Forms submission tracked', inputs);
    });
  });
})();
</script>
