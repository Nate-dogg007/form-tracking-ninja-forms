<script>
(function () {
  // SHA-256 hashing function
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

  // Convert fields and hash email/phone
  function convertAndHashNinjaFields(fields) {
    var inputs = {};
    var promises = [];

    for (var key in fields) {
      if (fields.hasOwnProperty(key)) {
        var label = fields[key].label || '';
        var slug = label.toLowerCase().replace(/\s+/g, "_");
        var value = fields[key].value || '';

        if (slug === 'phone') {
          value = value.replace(/[\(\)\s-]/g, '');
        }

        // Check if this field should be hashed
        if (slug === 'email' || slug === 'phone') {
          promises.push(
            hashString(value).then(function (hash) {
              inputs['hashed_' + slug] = hash;
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

  // Main event listener
  jQuery(document).on('nfFormSubmitResponse', function (event, responseData) {
    convertAndHashNinjaFields(responseData.response.data.fields).then(function (inputs) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'form_submission_hashed',
        form_details: {
          form_id: responseData.id,
          form_name: responseData.settings.form_title || 'N/A'
        },
        form_data: inputs
      });

      console.log('✅ Pushed form_submission_hashed to dataLayer', inputs);
    });
  });
})();
</script>
