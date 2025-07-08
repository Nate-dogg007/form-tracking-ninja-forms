(function() {
    // Log script initialization
    console.log('Ninja Forms GTM tracking script initialized.');

    // Function to convert Ninja Forms fields to clean input object
    function convertNinjaFieldsToInputs(fields) {
        var inputs = {};
        try {
            for (var key in fields) {
                if (fields.hasOwnProperty(key)) {
                    var field = fields[key];
                    var label = field.label || 'unnamed_field_' + key;
                    var slug = label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_+|_+$)/g, '');
                    var value = field.value || '';
                    if (slug === 'phone') {
                        value = value.replace(/[\(\)\s-]/g, '');
                    }
                    inputs[slug] = value;
                }
            }
        } catch (e) {
            console.error('Error processing form fields:', e);
        }
        return inputs;
    }

    // Check for jQuery
    if (typeof jQuery === 'undefined') {
        console.error('jQuery is not available. Ninja Forms tracking cannot proceed.');
        return;
    }

    // Check for Ninja Forms
    if (typeof nfFrontEnd === 'undefined') {
        console.error('Ninja Forms scripts not detected. Ensure Ninja Forms is active.');
        return;
    }

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];

    // Listen for Ninja Forms submission
    jQuery(document).on('nfFormSubmitResponse', function(event, responseData, id) {
        try {
            console.log('Ninja Forms submission detected - Form ID:', id, 'Response:', responseData);
            if (!responseData || !responseData.response || !responseData.response.data || !responseData.response.data.fields) {
                console.warn('Invalid response data structure:', responseData);
                return;
            }
            dataLayer.push({
                event: 'ninja_form_success',
                form_id: id,
                inputs: convertNinjaFieldsToInputs(responseData.response.data.fields)
            });
            console.log('DataLayer push successful:', {
                event: 'ninja_form_success',
                form_id: id,
                inputs: convertNinjaFieldsToInputs(responseData.response.data.fields)
            });
        } catch (e) {
            console.error('Error handling Ninja Forms submission:', e);
        }
    });

    // Log when script is ready
    console.log('Ninja Forms tracking script ready and listening for submissions.');
})();
