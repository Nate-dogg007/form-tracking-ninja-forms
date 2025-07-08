<script>
(function () {
  if (typeof jQuery === 'undefined') {
    console.warn('❌ jQuery not found. Script won’t run.');
    return;
  }

  jQuery(document).on('nfFormSubmitResponse', function (event, responseData) {
    console.log('🔥 Ninja Forms submitted');
    console.log('🧾 responseData:', responseData);

    var fields = responseData.response?.data?.fields || {};
    var formTitle = responseData.settings?.form_title || 'N/A';

    var formData = {};
    for (var key in fields) {
      if (fields.hasOwnProperty(key)) {
        var label = fields[key].label || '';
        var value = fields[key].value || '';
        var slug = label.toLowerCase().replace(/\s+/g, '_');
        formData[slug] = value;
      }
    }

    console.log('📦 Form data:', formData);

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'form_submission_hashed',
      form_details: {
        form_id: responseData.id || 'N/A',
        form_name: formTitle
      },
      form_data: formData
    });

    console.log('✅ Pushed to dataLayer: form_submission_hashed');
  });
})();
</script>
