<script>
(function () {
  // Ensure jQuery is loaded
  if (typeof jQuery === 'undefined') {
    console.error('jQuery is not loaded');
    return;
  }

  function hashString(str) {
    if (typeof str !== 'string' || str.length === 0) {
      return '';
    }

    // Check for crypto API availability
    if (!window.crypto || !window.crypto.subtle) {
      console.warn('Crypto API not available, skipping hashing');
      return ''; // Fallback to empty string
    }

    try {
      var encoder = new TextEncoder();
      var data = encoder.encode(str);
      return crypto.subtle.digest('SHA-256', data).then(function (buffer) {
        var hashArray = Array.from(new Uint8Array(buffer));
        return hashArray.map(function (b) {
          return ('00' + b.toString(16)).slice(-2);
        }).join('');
      });
    } catch (err) {
      console.error('Hashing error:', err);
      return ''; // Fallback to empty string
    }
  }

  function convertNinjaFieldsToInputs(fields) {
    var inputs = {};

    if (!fields || typeof fields !== 'object') {
      console.warn('Invalid fields object:', fields);
      return inputs; // Return empty object if fields is invalid
    }

    var promises = [];

    for (var key in fields) {
      if (fields.hasOwnProperty(key)) {
        var field = fields[key];
        var label = field.label || '';
        var value = field.value || '';
        var slug = label.toLowerCase().replace(/\s+/g, '_');

        if (slug === 'phone') {
          value = value.replace(/[\(\)\s-]/g, '');
        }

        if (slug === 'email' || slug === 'phone') {
          // Store promise for hashed value
          promises.push({
            slug: slug,
            hash: hashString(value)
          });
        } else {
          inputs[slug] = value;
        }
      }
    }

    // Resolve all hashing promises
    return Promise.all(promises.map(p => p.hash)).then(function (hashedValues) {
      // Assign hashed values to inputs
      promises.forEach(function (p, index) {
        inputs['hashed_' + p.slug] = hashedValues[index];
      });
      return inputs;
    }).catch(function (err) {
      console.error('Hashing promises failed:', err);
      return inputs; // Return inputs even if hashing fails
    });
  }

  jQuery(document).on('nfFormSubmitResponse', function (event, responseData) {
    console.log('nfFormSubmitResponse triggered:', responseData); // Debug log

    // Ensure responseData is valid
    if (!responseData || !responseData.response || !responseData.response.data) {
      console.error('Invalid responseData structure');
      return false;
    }

    // Convert fields and push to dataLayer
    convertNinjaFieldsToInputs(responseData.response.data.fields)
      .then(function (inputs) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'form_submission_hashed',
          form_id: responseData.id || 'N/A',
          form_name: (responseData.settings && responseData.settings.form_title) || 'N/A',
          inputs: inputs
        });

        console.log('✅ Ninja Forms submission tracked:', {
          form_id: responseData.id,
          form_name: responseData.settings && responseData.settings.form_title,
          inputs: inputs
        });
      })
      .catch(function (err) {
        console.error('Error processing form submission:', err);

        // Fallback dataLayer push to ensure event fires
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'form_submission_hashed',
          form_id: responseData.id || 'N/A',
          form_name: (responseData.settings && responseData.settings.form_title) || 'N/A',
          inputs: {}
        });

        console.log('✅ Fallback Ninja Forms submission tracked');
      });
  });
})();
</script>
