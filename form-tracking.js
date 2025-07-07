<script>
(function () {
  function hashString(str) {
    if (typeof str !== 'string' || str.length === 0) {
      return Promise.resolve('');
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
      return '';
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

        // Normalise phone formatting
        if (slug === 'phone') {
          value = value.replace(/[\(\)\s-]/g, '');
        }

        if (slug === 'email' || slug === 'phone') {
          // Hash sensitive fields
          promises.push(
            hashString(value).then(function (hashed) {
              inputs['hashed_' + slug] = hashed;
            })
          );
        } else {
          inputs[slug] = value;
        }
      }
    }

    return Promise.all(promises).then(function () {
      return inputs;
    });
  }

  jQuery(document).on('nfFormSubmitResponse', function (event, responseData) {
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
