<script>
(function () {
  function convertFields(fields) {
    var inputs = {};
    for (var key in fields) {
      if (fields.hasOwnProperty(key)) {
        var label = fields[key].label || '';
        var slug = label.toLowerCase().replace(/\s+/g, "_");
        var value = fields[key].value || '';
        inputs[slug] = value;
      }
    }
    return inputs;
  }

  function initFormTracking() {
    console.log('✅ Ninja Forms is ready. Setting up tracking...');
    
    jQuery(document).on('nfFormSubmitResponse', function (event, responseData) {
      console.log('🎯 Form Submitted — nfFormSubmitResponse fired!');
      
      var inputs = convertFields(responseData.response.data.fields || {});
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'form_submission_hashed',
        form_details: {
          form_id: responseData.id || 'N/A',
          form_name: responseData.settings?.form_title || 'N/A'
        },
        form_data: inputs
      });

      console.log('✅ Data pushed to dataLayer:', inputs);
    });
  }

  // Wait until Ninja Forms is ready
  jQuery(document).on('nfFormReady', function () {
    initFormTracking();
  });
})();
</script>
