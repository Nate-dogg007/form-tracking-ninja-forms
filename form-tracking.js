<script>
(function() {
  function convertNinjaFieldsToInputs(fields) {
      var inputs = {};

      for (var key in fields) {
          if (fields.hasOwnProperty(key)) {
              var label = fields[key].label;
              var slug = label.toLowerCase().replace(/ /g, "_");
              var value = fields[key].value;;

              if(slug === 'phone') {
                value = value.replace(/[\(\)\s-]/g, '');
              }

              inputs[slug] = value;
          }
      }
      return inputs;
  }


  jQuery(document).on('nfFormSubmitResponse', function(event, responseData, id) {  
    dataLayer.push({
      event: 'ninja_form_success',
      form_id: responseData.id,
      inputs: convertNinjaFieldsToInputs(responseData.response.data.fields),
    });
  });
})()
</script>



