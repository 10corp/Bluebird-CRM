{*NYSS 1748*}
{literal}
<script type="text/javascript">
cj(function( ) {
  /*var elementId = "{/literal}#phone_{$blockId}_phone{literal}";
    cj( elementId ).blur( function( ) {
        if ( cj(this).hasClass('valid') ) {
            var currentValue = cj(this).val();
            if ( currentValue ) {
                currentValue = currentValue.replace(/[^\d]/g, "");
                var formattedValue = currentValue.substr(0,3) + '-' + currentValue.substr(3,3) + '-' + currentValue.substr(6,4);
                cj(this).val( formattedValue );
            }
        }
    });*/
});

//move delete link


//suppress address elements link for BOE
cj('[id^=Address_Block_]').each(function(){
  var loctype  = cj(this).find('.location_type_id-address-element input').val();
  var dellink  = cj(this).find('.crm-edit-address-form tr:first a');
  if ( loctype == 6 ) {
    cj(this).find('[id^=streetAddress_] a').remove();
    dellink.remove();
  } else {
    dellink.addClass('delete_block');
    cj('.crm-edit-address-form').before(dellink);
  }
});

//default open address panel
cj('#addressBlockId').addClass('crm-accordion-open').removeClass('crm-accordion-closed');


</script>
{/literal}


