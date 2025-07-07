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
      var hashArray = Array.prototype.slice.call(new Uint8Array(buffer));
      return hashArray.map(function (b) {
        return ('00' + b.toString(16)).slice(-2);
      }).join('');
    }).catch(function (err) {
      console.error('Hashing error:', err);
      return '';
    });
  }

  // Convert Ninja Forms fields and hash email/phone
  function convertAndHashNinjaFields(fields) {
    var inputs = {};
    var promises = [];

    for (var key in fields) {
      if (fields.hasOwnProperty(key)) {
        var label = fields[key].label || '';
        var slug = label.toLowerCase().replace(/\s+/g, "_");
        var value = fields[key].value || '';

        // Clean phone formatting
        if (slug === 'phone') {
          value = value.replace(/[\(\)\s\-]/g, '');
        }

        // Hash if email or phone
        if (slug === 'email' || slug === 'phone') {
          (function (s, v) {
            promises.push(
              hashString(v).then(function (hash) {
                inputs['hashed_' + s] = hash;
              })
            );
          })(slug, value);
        } else {
          inputs[slug] = value;
        }
      }
    }

    return Promise.all(promises).then(function () {
      return inputs;
    });
  }

  // Listen for successful Ninja Form submission
  jQuery(document).on('nfFormSubmitResponse', function (event, responseData) {
    convertAndHashNinjaFields(responseData.response.data.fields).then(function (inputs) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'form_submission_hashed',
        form_details: {
          form_id: responseData.id || 'N/A',
          form_name: responseData.settings?.form_title || 'N/A'
        },
        form_data: inputs
      });

      console.log('✅ form_submission_hashed event pushed to dataLayer');
    });
  });
})();
</script>
