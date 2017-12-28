CRM.$(function($) {
  //clear multiple
  $('.multi_clear').click(function() {
    // grab the rows to clear
    var clear_ids = $("input.message-select:checked").map(function(){
      return $(this).prop('id').replace('select-', '');
    }).get();

    if (!clear_ids.length) {
      CRM.alert('Use the checkbox to select one or more messages to clear.', 'Clear Messages', 'warn');
      return false;
    }

    CRM.confirm({
      title: 'Clear Messages?',
      message: 'Are you sure you want to clear ' + clear_ids.length + ' messages?'
    }).on('crmConfirm:yes', function() {
      var url = CRM.url('civicrm/nyss/inbox/clearmsgs', {ids: clear_ids});
      var request = $.post(url);
      CRM.status({success: 'Messages were successfully cleared.'}, request);

      refreshList('matched');
    });
  });

  //process multiple
  $('.multi_process').click(function() {
    // grab the rows to delete
    var process_ids = $("input.message-select:checked").map(function(){
      return $(this).prop('id').replace('select-', '');
    }).get();

    if (!process_ids.length) {
      CRM.alert('Use the checkbox to select one or more messages to process.', 'Process Messages', 'warn');
      return false;
    }

    var url = CRM.url('civicrm/nyss/inbox/process', {ids: process_ids, multi: 1});
    CRM.loadForm(url)
      .on('crmFormSuccess', function(event, data) {
        //console.log('onFormSuccess event: ', event, ' data: ', data);

        if (data.isError) {
          CRM.status({success: data.message});
        }
        else {
          CRM.status({success: 'Messages were successfully processed.'});
        }

        refreshList('matched');
      });
  });

  //TODO we should NOT have to duplicate this from inbox.js, but can't properly reference
  //it without getting errors
  /**
   *
   * @param inboxType
   *
   * refresh the listing, retaining filter options;
   */
  function refreshList(inboxType) {
    var range = $('#range_filter').val();
    var term = $('#search_filter').val();
    //console.log('refreshList:: inboxType: ', inboxType, ' range: ', range, ' term: ', term);

    CRM.$('table.inbox-messages-selector').DataTable().ajax.url(CRM.url('civicrm/nyss/inbox/ajax/' + inboxType, {
      snippet: 4,
      range: range,
      term: JSON.stringify(term)
    })).load();
  }
});
