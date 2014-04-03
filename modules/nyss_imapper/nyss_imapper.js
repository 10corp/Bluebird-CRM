var messages = [];
var contacts = [];

cj(document).ready(function(){

  var first_name = cj('#tab1 .first_name').val();
  var last_name = cj('#tab1 .last_name').val();
  var city = cj('#tab1 .city').val();
  var phone = cj('#tab1 .phone').val();
  var street_address = cj('#tab1 .street_address').val();
  var email_address = cj('#tab1 .email_address').val();

  var reset = cj('#reset');
  var filter = cj('#filter');
  var assign = cj('#assign');
  var reassign = cj('#reassign');
  var create = cj('#add-contact');
  var createReassign = cj('#add-contact-reassign');

  cj(".range option[value='30']").attr('selected', 'selected');

  // onpageload
  if(cj("#Activities").length){
    getMatchedMessages(30);
  }else if(cj("#Unmatched").length){
    getUnmatchedMessages(30);
  }else if(cj("#Reports").length){
    getReports(30);
    // console.log('reports');
  }
  cj('#search_help').live('click', function() {
    cj("#help-popup").dialog('open');
  });

  // Dialogs
  cj( "#help-popup" ).dialog({
    modal: true,
    width: 600,
    autoOpen: false,
    resizable: false
  });

  // After we've already matched something
  cj( "#no_find_match" ).dialog({
    modal: true,
    dialogClass: 'no_find_match',
    width: 370,
    autoOpen: false,
    resizable: false
  });

  // add a delete conform popup thats alarmingly red
  cj( "#delete-confirm" ).dialog({
    modal: true,
    dialogClass: 'delete_popup_class',
    width: 370,
    autoOpen: false,
    resizable: false
  });

  // add a clear conform popup
  cj( "#clear-confirm" ).dialog({
    modal: true,
    width: 370,
    autoOpen: false,
    resizable: false
  });



  // add a find match popup
  cj( "#find-match-popup" ).dialog({
    modal: true,
    height: 580,
    width: 960, // in ie the popup was overflowing
    autoOpen: false,
    resizable: false,
    title: 'Loading Data',
    buttons: {
      Cancel: function() {
        cj( this ).dialog( "close" );
      },

    }
  });

  // add a loading icon popup
  cj( "#loading-popup" ).dialog({
    modal: true,
    width: 200,
    autoOpen: false,
    resizable: false,
    title: 'Please Wait'
  });

  // add a reloading icon popup
  cj( "#reloading-popup" ).dialog({
    modal: true,
    width: 200,
    autoOpen: false,
    resizable: false,
    title: 'Please Wait'
  });

  // add a tagging popup
  cj( "#tagging-popup" ).dialog({
    modal: true,
    height: 565,
    width: 960,
    autoOpen: false,
    resizable: false,
    title: 'Loading Data',  });

  cj( "#matchCheck-popup" ).dialog({
    modal: true,
    width: 400,
    autoOpen: false,
    resizable: false
  });

  cj( "#AdditionalEmail-popup" ).dialog({
    modal: true,
    width: 500,
    autoOpen: false,
    resizable: false,
    open:function () {
      cj(this).closest(".ui-dialog").find(".ui-button:first").addClass("primary_button");
    },
    buttons: {
      "Yes": function() {
        var add_emails = [];
        cj('#add_email input:checked').each(function() {
          add_emails.push(cj(this).attr('value'));
        });
        if (cj('#add_email #cb_static').val()) {
          add_emails.push(cj('#add_email #cb_static').val());
        };
        cj.each(add_emails, function( index, value ) {
          var contacts = cj('#contacts').val();
          cj.ajax({
            url: '/civicrm/imap/ajax/contact/addEmail',
            data: {
              email: value,
              contacts: contacts
            },
            success: function(data,status) {
              if(data != null || data != ''){
                CRM.alert(('Email Added'), '', 'success');
              }
            }
          });
        });
        cj('#assign').click();
      },
      No: function() {
        cj('#add_email').empty();
        cj('#assign').click();
      }
    }
  });
  // BOTH MATCHED & UNMATCHED

  // search function in find_match and edit_match
  filter.live('click', function() {
    cj('#imapper-contacts-list').html('Searching...');
    // checks for deault data
    if(cj('#tab1 .first_name').val() != "First Name"){ var first_name = cj('#tab1 .first_name').val();}
    if(cj('#tab1 .last_name').val() != "Last Name"){ var last_name = cj('#tab1 .last_name').val();}
    if(cj('#tab1 .city').val() != "City"){var city = cj('#tab1 .city').val();}
    if(cj('#tab1 .phone').val() != "Phone Number"){var phone = cj('#tab1 .phone').val();}
    if(cj('#tab1 .street_address').val() != "Street Address"){var street_address = cj('#tab1 .street_address').val();}
    if(cj('#tab1 .email_address').val() != "Email Address"){var email_address = cj('#tab1 .email_address').val();}
    if(cj('#tab1 .form-text.dob').val() != "yyyy-mm-dd"){var dob = cj('#tab1 .form-text.dob').val();}
    if(cj('#tab1 .state').val() != ""){var state = cj('#tab1 .state').val();}
    if((first_name) || (last_name) || (city) || (phone) || (street_address) || (email_address) || (dob)){
      cj.ajax({
        url: '/civicrm/imap/ajax/contact/search',
        async:false,
        data: {
          state: state,
          city: city,
          phone: phone,
          email_address: email_address,
          dob: dob,
          street_address: street_address,
          first_name: first_name,
          last_name: last_name
        },
        success: function(data,status) {
          if(data != null || data != ''){
            contacts = cj.parseJSON(data);
            if(contacts.code == 'ERROR'){
              cj('#imapper-contacts-list').html(contacts.message);
            }else{
              cj('.contacts-list').html('').append("<strong>"+(contacts.length )+' Found</strong>');
              buildContactList(0);
              cj("#reassign").show();
            }
          }
        }
      });
    }else{
      CRM.alert('Please Enter a search query', '', 'warn');
    }
    return false;
  });

  // delete confirm & processing both pages
  cj(".delete").live('click', function() {
    var messageId = cj(this).parent().parent().attr('id');
    var contactId = cj(this).parent().parent().attr('data-contact_id');
    var row = cj(this).parent().parent();

    // reset the headers
    if(cj("#Activities").length){
      cj("#delete-confirm").dialog({ title:  "Delete this message from Matched Messages ?"});
    }else{
      cj("#delete-confirm").dialog({ title:  "Delete this message from Unmatched Messages ?"});
    }

    cj( "#delete-confirm" ).dialog({
      open:function () {
        cj(this).closest(".ui-dialog").find(".ui-button:first").addClass("primary_button");
      },
      buttons: {
        "Delete": function() {
          cj( this ).dialog( "close" );
          if(cj("#Activities").length){
            DeleteActivity(messageId);
          }else{
            DeleteMessage(messageId);
          }
        },
        Cancel: function() {
          cj( this ).dialog( "close" );
        }
      }
    });
    cj("#delete-confirm").dialog('open');
    return false;
  });


  // multi_delete confirm & processing both pages
  cj(".multi_delete").live('click', function() {
    cj("#loading-popup").dialog('open');

    // delete_ids = message id / activity id
    var delete_ids = new Array();
    // delete_secondary = imap id / contact id
    var delete_secondary = new Array();
    var rows = new Array();

    cj('#imapper-messages-list input:checked').each(function() {
      delete_ids.push(cj(this).attr('name'));
      delete_secondary.push(cj(this).attr('id'));
      rows.push(cj(this).parent().parent().attr('id')); // not awesome but ok
    });
    if(!rows.length){
      cj("#loading-popup").dialog('close');
      CRM.alert('Use the checkbox to select one or more messages to delete', '', 'error');
      return false;
    }

    // reset the headers
    if(cj("#Activities").length){
      cj("#delete-confirm").dialog({ title:  "Delete "+delete_ids.length+" messages from Matched Messages?"});
    }else{
      cj("#delete-confirm").dialog({ title:  "Delete "+delete_ids.length+" messages from Unmatched Messages?"});
    }

    cj( "#delete-confirm" ).dialog({
      open:function () {
        cj(this).closest(".ui-dialog").find(".ui-button:first").addClass("primary_button");
      },
      buttons: {
        "Delete": function() {
          cj( this ).dialog( "close" );
          if(cj("#Activities").length){
            cj("#reloading-popup").dialog('open');
            cj.each(delete_ids, function(key, value) {
              DeleteActivity(value);
            });
            cj("#reloading-popup").dialog('close');
          }else{
            cj("#reloading-popup").dialog('open');
            cj.each(delete_ids, function(key, value) {
              DeleteMessage(value,delete_secondary[key]);
            });
            cj("#reloading-popup").dialog('close');
          }
        },
        Cancel: function() {
          cj( this ).dialog("close");
        }
      }
    });
    cj("#loading-popup").dialog('close');
    cj("#delete-confirm").dialog('open');
    return false;
  });



  // UNMATCHED
  // assign a message to a contact Unmatched page
  cj('#preAssign').click(function() {
    var contactRadios = cj('input[name=contact_id]');
    var contactIds = '';
    cj.each(contactRadios, function(idx, val) {
      if(cj(val).attr('checked')) {
        if(contactIds != '')
          contactIds = contactIds+',';
        contactIds = contactIds + cj(val).val();
      }
    });
    if(contactIds !='' ){
      cj("#AdditionalEmail-popup").dialog('open');
      cj('#AdditionalEmail-popup #contacts').val(contactIds);
      cj("#find-match-popup").dialog('close');
    }else{
      CRM.alert('Please Choose a contact', '', 'warn');
    };
  });

  // assign a message to a contact Unmatched page
  assign.click(function() {
    var messageId = cj('#id').val();
    var contactRadios = cj('input[name=contact_id]');
    var contactIds = '';
    var add_emails = [];
    cj("#AdditionalEmail-popup").dialog( "close" );

    cj.each(contactRadios, function(idx, val) {
      if(cj(val).attr('checked')) {
        if(contactIds != '')
          contactIds = contactIds+',';
        contactIds = contactIds + cj(val).val();
      }
    });
    if(contactIds !='' ){
      cj.ajax({
        url: '/civicrm/imap/ajax/unmatched/assign',
        data: {
          messageId: messageId,
          contactId: contactIds
        },
        success: function(data, status) {
          data = cj.parseJSON(data);
          if (data.code == 'ERROR'){
            CRM.alert('Could Not Assign message : '+data.message, '', 'error');
          }else{
            cj.each(data.messages, function(id, value) {
              removeRow(messageId);
              CRM.alert(value.message, '', 'success');
              // checkForMatch(value.key,contactIds);
            });
            cj("#find-match-popup").dialog('close');
          }
        }
      });
      return false;
    }else{
      CRM.alert('Please Choose a contact', '', 'warn');
    };
  });

  // create a new contact unmatched page
  create.click(function() {
    var create_messageId = cj('#id').val();
    var create_prefix = cj("#tab2 .prefix").val();
    var create_first_name = cj("#tab2 .first_name").val();
    var create_middle_name = cj("#tab2 .middle_name").val();
    var create_last_name = cj("#tab2 .last_name").val();
    var create_suffix = cj("#tab2 .suffix").val();

    var create_email_address = cj("#tab2 .email_address").val();
    var create_phone = cj("#tab2 .phone").val();
    var create_street_address = cj("#tab2 .street_address").val();
    var create_street_address_2 = cj("#tab2 .street_address_2").val();
    var create_zip = cj("#tab2 .zip").val();
    var create_city = cj("#tab2 .city").val();
    var create_dob = cj("#tab2 .form-text.dob").val();
    var create_state = cj("#tab2 .state").val();

    if ((cj.isNumeric(cj("#tab2 .dob .month").val()) || cj.isNumeric(cj("#tab2 .dob .day").val()) || cj.isNumeric(cj("#tab2 .dob .year").val())) && ( !cj.isNumeric(cj("#tab2 .dob .month").val()) || !cj.isNumeric(cj("#tab2 .dob .day").val()) || !cj.isNumeric(cj("#tab2 .dob .year").val()))) {
      CRM.alert('Please Enter a full date of birth', 'Warning', 'warn');
      return false;
    };





    if((create_first_name)||(create_last_name)||(create_email_address)){
      cj.ajax({
        url: '/civicrm/imap/ajax/contact/add',
        data: {
          messageId: create_messageId,
          prefix: create_prefix,
          first_name: create_first_name,
          middle_name: create_middle_name,
          last_name: create_last_name,
          suffix: create_suffix,
          email_address: create_email_address,
          phone: create_phone,
          street_address: create_street_address,
          street_address_2: create_street_address_2,
          postal_code: create_zip,
          city: create_city,
          state: create_state,
          dob: create_dob
        },
        success: function(data, status) {
          contactData = cj.parseJSON(data);
          if (contactData.code == 'ERROR' || contactData.code == '' || contactData == null ){
            CRM.alert('Could Not Create Contact : '+contactData.message, '', 'error');
            return false;
          }else{
            cj.ajax({
              url: '/civicrm/imap/ajax/unmatched/assign',
              data: {
                messageId: create_messageId,
                contactId: contactData.contact
              },
              success: function(data, status) {
                assign = cj.parseJSON(data);
                if (assign.code == 'ERROR' || assign.code == '' || assign == null ){
                  CRM.alert('Could Not Assign Message : '+assign.message, '', 'error');

                  return false;
                }else{
                  cj.each(assign.messages, function(id, value) {
                    removeRow(create_messageId);
                    CRM.alert('Contact created and '+value.message, '', 'success');
                    if(create_email_address.length > 0){
                      checkForMatch(create_email_address,contactData.contact);
                    }
                  });
                  cj("#find-match-popup").dialog('close');
                }
              },
              error: function(){
                CRM.alert('Failure', '', 'error');
              }
            });
          }
        }
      });
      return false;
    }else{
      CRM.alert('Required: First Name or Last Name or Email', '', 'error');
    }
  });

// create a new contact and Reassign message to them
  createReassign.click(function() {
    var create_messageId = cj('#id').val();
    var create_first_name = cj("#tab2 .first_name").val();
    var create_last_name = cj("#tab2 .last_name").val();
    var create_email_address = cj("#tab2 .email_address").val();
    var create_phone = cj("#tab2 .phone").val();
    var create_street_address = cj("#tab2 .street_address").val();
    var create_street_address_2 = cj("#tab2 .street_address_2").val();
    var create_zip = cj("#tab2 .zip").val();
    var create_city = cj("#tab2 .city").val();
    var create_dob = cj("#tab2 .form-text.dob").val();
    var create_state = cj("#tab2 .state").val();
    if ((cj.isNumeric(cj("#tab2 .dob .month").val()) || cj.isNumeric(cj("#tab2 .dob .day").val()) || cj.isNumeric(cj("#tab2 .dob .year").val())) && ( !cj.isNumeric(cj("#tab2 .dob .month").val()) || !cj.isNumeric(cj("#tab2 .dob .day").val()) || !cj.isNumeric(cj("#tab2 .dob .year").val()))) {
      CRM.alert('Please Enter a full date of birth', 'Warning', 'warn');
      return false;
    };

    if((create_first_name)||(create_last_name)||(create_email_address)){
      cj.ajax({
        url: '/civicrm/imap/ajax/contact/add',
        data: {
          messageId: create_messageId,
          first_name: create_first_name,
          last_name: create_last_name,
          email_address: create_email_address,
          phone: create_phone,
          street_address: create_street_address,
          street_address_2: create_street_address_2,
          postal_code: create_zip,
          city: create_city,
          state: create_state,
          dob: create_dob
        },
      	success: function(data, status) {
      	  contactData = cj.parseJSON(data);
      	  if (contactData.code == 'ERROR' || contactData.code === '' || contactData === null ){
            CRM.alert('Could Not Create Contact : '+contactData.message, '', 'error');
      	    return false;
      	  }else{
      	    cj.ajax({
              url: '/civicrm/imap/ajax/matched/reassign',
              data: {
                id: create_messageId,
                change: contactData.contact
              },
              success: function(data, status) {
                var data = cj.parseJSON(data);
                if (data.code =='ERROR'){
                  CRM.alert('Could not reassign Message : '+data.message, '', 'error');
                }else{
                  cj("#find-match-popup").dialog('close');
                  cj('#'+create_messageId).attr("data-contact_id",data.contact_id); // contact_id
                  cj('#'+create_messageId+" .name").attr("data-firstname",data.first_name); // first_name
                  cj('#'+create_messageId+" .name").attr("data-lastname",data.last_name); // last_name
                  cj('#'+create_messageId+" .match").html("ManuallyMatched");
                  contact = '<a href="/civicrm/profile/view?reset=1&amp;gid=13&amp;id='+data.contact_id+'&amp;snippet=4" class="crm-summary-link"><div class="icon crm-icon '+data.contact_type+'-icon" title="'+data.contact_type+'"></div></a><a title="'+data.display_name+'" href="/civicrm/contact/view?reset=1&amp;cid='+data.contact_id+'">'+data.display_name+'</a><span class="emailbubble marginL5">'+shortenString(data.email,13)+'</span> <span class="matchbubble marginL5  M" title="This email was Manually matched">M</span>';
                  CRM.alert(data.message, '', 'success');
                  // redraw the table
                  var row_index = oTable.fnGetPosition(document.getElementById(create_messageId));
                  oTable.fnUpdate('ManuallyMatched', row_index, 4 );
                  oTable.fnUpdate(contact, row_index, 1 );
                  oTable.fnDraw();
                }
              },
              error: function(){
                CRM.alert('Failure', '', 'error');
              }
      	    });
      	  }
          return false;
        }
      });
    }else{
      CRM.alert("Required: First Name or Last Name or Email", '', 'error');
    }
  });

  // opening find match window Unmatched
  // findMatch
  cj(".find_match").live('click', function() {
    cj("#loading-popup").dialog('open');
    var messageId = cj(this).parent().parent().attr('id');
    var imapId = cj(this).parent().parent().attr('data-imap_id');
    var firstName = cj(this).parent().parent().children('.name').attr('data-firstName');
    var lastName = cj(this).parent().parent().children('.name').attr('data-lastName');
    cj("#tabs :input[type='text']").val("");
    cj(".dob .month,.dob .day,.dob .year,.state").val([]);

    cj('#imapper-contacts-list').html('');
    cj('#message_left_email').html('');
    cj("#message_left_email").animate({
      scrollTop: 0
    }, 'fast');
    cj.ajax({
      url: '/civicrm/imap/ajax/unmatched/details',
      data: {id: messageId },
      success: function(data,status) {
        message = cj.parseJSON(data);
        cj("#loading-popup").dialog('close');
        if(message.code == 'ERROR'){
          if(message.clear =='true')  removeRow(messageId);
            CRM.alert('Unable to load Message : '+ message.message, '', 'error');
          }else{
            var icon ='';
            if( message.attachmentfilename ||  message.attachmentname ||  message.attachment){
              if(message.attachmentname ){var name = message.attachmentname}else{var name = message.attachmentfilename};
              icon = '<div class="ui-icon ui-icon-link attachment" title="'+name+'"></div>'
            }
            cj('#message_left_header').html('');
            cj('#message_left_header').append("<span class='popup_def'>From: </span>");
            if(message.sender_name) cj('#message_left_header').append(shortenString(message.sender_name,50));
            if(message.sender_email) cj('#message_left_header').append("<span class='emailbubble marginL5'>"+shortenString(message.sender_email)+"</span>");
            cj('#message_left_header').append("<br/><span class='popup_def'>Subject: </span>"+shortenString(message.subject,55)+" "+ icon+"<br/><span class='popup_def'>Date Forwarded: </span>"+message.date_long+"<br/>");
            if ((message.forwarder != message.sender_email)){
              cj('#message_left_header').append("<span class='popup_def'>Forwarded by: </span><span class='emailbubble'>"+ message.forwarder+"</span> @ "+ message.updated_long+ "<br/>");
            }else{
              cj('#message_left_header').append("<span class='popup_def'>&nbsp;</span>No forwarded content found<br/>");
            }
            cj('#message_left_email').html(message.body+"<hr/>");
            cj.each(message.attachments, function(key, value) {
              if((!value.rejection) || (value.rejection == '')){
                cj('#message_left_email').append(value.fileName+" ("+((value.size / 1024) / 1024).toFixed(2)+" MB)<br/>");
              }else{
                cj('#message_left_email').append("<span class='rejected'>"+value.fileName+" was rejected ("+value.rejection+")</span><br/>");
              }
            });
            cj('.first_name, .last_name, .phone, .street_address, .street_address_2, .city, .email_address').val('');
            cj('#id').val(messageId);

            cj("#find-match-popup").dialog({
              title:  "Reading: "+shortenString(message.subject,100),
              buttons: {
                Cancel: function() {
                  cj( this ).dialog( "close" );
                }
              }
            });
            cj('#tabs').tabs({
              selected: 0,
              activate: function( event, ui ){
                // console.log('loaded',cj(event.currentTarget).attr('href'));
              }
            });
            cj("#find-match-popup").dialog('open');

            cj('.email_address').val(message.sender_email);
            if(message.sender_email) cj('#filter').click();
            cj('.first_name').val(firstName);
            cj('.last_name').val(lastName);

            cj('#prefix .del,#suffix .del').remove();
            cj('#prefix').append('<option class="del" value=""> </option>');
            cj('#suffix').append('<option class="del" value=""> </option>');
            cj.each(message.prefix, function(idx, val) {
              cj('#prefix').append('<option class="del" value="'+idx+'">'+val+'</option>');
            });
            cj.each(message.suffix, function(idx, val) {
              cj('#suffix').append('<option class="del" value="'+idx+'">'+val+'</option>');
            });

            cj('#AdditionalEmail-popup #add_email').empty();
            cj.each(message.found_emails, function(idx, val) {
              cj('#AdditionalEmail-popup #add_email').append('<fieldset id="fs_'+idx+'"></fieldset>');
              cj('<input />', { type: 'checkbox', id: 'cb_'+idx, value: val }).appendTo('#fs_'+idx);
              cj('<label />', { 'for': 'cb_'+idx, text: val }).appendTo('#fs_'+idx);
              cj('#cb'+idx).click();
            });
            cj('#AdditionalEmail-popup  #add_email').append('<fieldset id="fs_static"></fieldset>');
            cj('<input />', { type: 'input', id: 'cb_static',placeholder: 'Enter a email we missed' }).appendTo('#fs_static');
        }
      },
      error: function(){
        CRM.alert('Unable to load Message', '', 'error');
      }
    });
    return false;
  });

// MATCHED
// MATCHED singular Functions

  // reassign activity to contact on the matched page
  reassign.click(function() {
    var activityId = cj('#id').val();
    // only grabs the 1st one

    var contactRadios = cj('input[name=contact_id]');
    var contactIds = '';
    cj.each(contactRadios, function(idx, val) {
      if(cj(val).attr('checked')) {
        if(contactIds != '')
          contactIds = contactIds+',';
        contactIds = contactIds + cj(val).val();
      }
    });

    if (contactIds =='' ){
      CRM.alert('Please select a contact', '', 'warn');
      return false;
    }else{

    cj.ajax({
      url: '/civicrm/imap/ajax/matched/reassign',
      data: {
        id: activityId,
        change: contactIds
      },
      success: function(data, status) {
        var data = cj.parseJSON(data);
        if (data.code =='ERROR'){
          CRM.alert('Could not reassign Message : '+data.message, '', 'error');
        }else{
          cj("#find-match-popup").dialog('close');
          // reset activity to new data
          cj('#'+activityId).attr("data-contact_id",data.contact_id); // contact_id
          cj('#'+activityId+" .name").attr("data-firstname",data.first_name); // first_name
          cj('#'+activityId+" .name").attr("data-lastname",data.last_name); // last_name
          cj('#'+activityId+" .match").html("ManuallyMatched");
          contact = '<a href="/civicrm/profile/view?reset=1&amp;gid=13&amp;id='+data.contact_id+'&amp;snippet=4" class="crm-summary-link"><div class="icon crm-icon '+data.contact_type+'-icon" title="'+data.contact_type+'"></div></a><a title="'+data.display_name+'" href="/civicrm/contact/view?reset=1&amp;cid='+data.contact_id+'">'+data.display_name+'</a><span class="emailbubble marginL5">'+shortenString(data.email,13)+'</span> <span class="matchbubble marginL5  M" title="This email was Manually matched">M</span>';

          CRM.alert(data.message, '', 'success');

          // redraw the table
          var row_index = oTable.fnGetPosition(document.getElementById(activityId));
          oTable.fnUpdate('ManuallyMatched', row_index, 4 );
          oTable.fnUpdate(contact, row_index, 1 );
          oTable.fnDraw();
        }
      },
      error: function(){
        CRM.alert('failure', '', 'error');
      }
    });
    };
    return false;
    cj("#reassign").hide();
  });
  /// remove activity from the activities screen, but don't delete it Matched
  cj(".clear_activity").live('click', function() {
    cj("#loading-popup").dialog('open');
    // var activityId = cj(this).parent().parent().attr('data-id');
    var Id = cj(this).parent().parent().attr('id');

    cj( "#clear-confirm" ).dialog({
      buttons: {
        "Clear": function() {
          ClearActivity(Id);
        },
        Cancel: function() {
          cj("#clear-confirm").dialog('close');
        }
      }
    });
    cj("#clear-confirm").dialog({ title:  "Remove Message From List?"});
    cj("#loading-popup").dialog('close');
    cj("#clear-confirm").dialog('open');
    return false;
  });

  // Edit a match allready assigned to an Activity Matched Screen
  // editMatch
  cj(".edit_match").live('click', function() {
    cj("#loading-popup").dialog('open');
    cj("#reassign").hide();

    var activityId = cj(this).parent().parent().attr('id');
    var contactId = cj(this).parent().parent().attr('data-contact_id');
    cj("#tabs :input[type='text']").val("");
    cj(".dob .month,.dob .day,.dob .year,.state").val([]);

    cj('#imapper-contacts-list').html('');
    cj("#message_left_email").animate({
      scrollTop: 0
    }, 'fast');
    cj.ajax({
      url: '/civicrm/imap/ajax/matched/details',
      data: {id: activityId, contact: contactId },
      success: function(data,status) {
        message = cj.parseJSON(data);
        if (message.code == 'ERROR'){
          CRM.alert('Could not load message Details: '+message.message, '', 'error');
          cj("#loading-popup").dialog('close');
          if(message.clear =='true')   removeRow(activityId);
        }else{
          cj('#message_left_header').html('');

          if(message.sender_name || message.sender_email) cj('#message_left_header').html('').append("<span class='popup_def'>From: </span>");
          if(message.sender_name) cj('#message_left_header').append(message.sender_name +"  ");
          if(message.sender_email) cj('#message_left_header').append("<span class='emailbubble'>"+ message.sender_email+"</span>");
          cj('#message_left_header').append("<br/><span class='popup_def'>Subject: </span>"+shortenString(message.subject,55) +"<br/><span class='popup_def'>Date Forwarded: </span>"+message.date_long+"<br/>");
          cj('.email_address').val(message.fromEmail);

          if ((message.forwarder != message.sender_email)){
            cj('#message_left_header').append("<span class='popup_def'>Forwarded by: </span><span class='emailbubble'>"+ message.forwarder+"</span> @ "+ message.updated_long+ "<br/>");
          }else{
            cj('#message_left_header').append("<span class='popup_def'>&nbsp;</span>No forwarded content found<br/>");
          }

          cj('#message_left_email').html(message.body+"<hr/>");

          cj.each(message.attachments, function(key, value) {
            if((!value.rejection) || (value.rejection == '')){
              cj('#message_left_email').append(value.fileName+" ("+((value.size / 1024) / 1024).toFixed(2)+" MB)<br/>");
            }else{
              cj('#message_left_email').append("<span class='rejected'>"+value.fileName+" was rejected ("+value.rejection+")</span><br/>");
            }
          });
          cj('#prefix .del,#suffix .del').remove();
          cj('#prefix').append('<option class="del" value=""> </option>');
          cj('#suffix').append('<option class="del" value=""> </option>');
          cj.each(message.prefix, function(idx, val) {
            cj('#prefix').append('<option class="del" value="'+idx+'">'+val+'</option>');
          });
          cj.each(message.suffix, function(idx, val) {
            cj('#suffix').append('<option class="del" value="'+idx+'">'+val+'</option>');
          });
          cj('#id').val(activityId);
          cj("#loading-popup").dialog('close');
          cj("#find-match-popup").dialog({
            title:  "Reading: "+shortenString(message.subject,100),
            buttons: {
              "Clear": function() {
                ClearActivity(activityId);
                cj("#find-match-popup").dialog('close');
              },
              Cancel: function() {
                cj( this ).dialog( "close" );
              }
            }
          });
          cj("#find-match-popup").dialog('open');
          cj("#tabs").tabs();
          cj('#imapper-contacts-list').html('').append("<strong>currently matched to : </strong><br/>           "+'<a href="/civicrm/contact/view?reset=1&cid='+message.matched_to+'" title="'+message.sender_name+'">'+shortenString(message.sender_name,35)+'</a>'+" <br/><i>&lt;"+ message.sender_email+"&gt;</i> <br/>"+ cj('.dob').val()+"<br/> "+ cj('.phone').val()+"<br/> "+  cj('.street_address').val()+"<br/> "+  cj('.city').val()+"<br/>");
        }
      },
      error: function(){
        CRM.alert('unable to Load Message', '', 'error');
      }
    });
    return false;
  });

  // add tag modal Matched screen
  // tag
  cj(".add_tag").live('click', function(){
    cj("#loading-popup").dialog('open');

    var activityId = cj(this).parent().parent().attr('id');
    var contactId = cj(this).parent().parent().attr('data-contact_id');
    cj('#message_left_tag').html('').removeClass('tag_over_ride');
    cj('#message_left_header_tag').html('');
    cj('#message_left_tag').html('').html('<div id="message_left_header_tag"></div><div id="message_left_email_tag"></div>');
    cj('#contact_ids').val('').val(contactId);
    cj('#activity_ids').val('').val(activityId);
    cj('#contact_tag_ids').val('');
    cj('#contact_position_ids').val('');
    cj('#activity_tag_ids').val('');
    cj('#contact_position_name').val('');

    cj('.token-input-dropdown-facebook').html('').remove();
    cj('.token-input-list-facebook').html('').remove();
    cj('#contact-issue-codes').html('');

    cj.ajax({
      url: '/civicrm/imap/ajax/matched/details',
      data: {id: activityId, contact: contactId },
      success: function(data,status) {

        cj("#loading-popup").dialog('close');
        messages = cj.parseJSON(data);

        if(messages.code == 'ERROR'){
          if(messages.clear =='true') removeRow(activityId);
          CRM.alert('Unable to load Message : '+ messages.message, '', 'error');
          return false;
        }else{

          // autocomplete
          cj('#contact_tag_name')
            .tokenInput( '/civicrm/imap/ajax/tag/search', {
            theme: 'facebook',
            zindex: 9999,
            onAdd: function ( item ) {
              current_contact_tags = cj('#contact_tag_ids').val();
              current_contact_tags = current_contact_tags.replace(/,,/g, ",");
              cj('#contact_tag_ids').val(current_contact_tags+','+item.id);
            },
            onDelete: function ( item ) {
              current_contact_tags = cj('#contact_tag_ids').val();
              result = string_replace(current_contact_tags, ','+item.id,',');
              result = result.replace(/,,/g, ",");
              cj('#contact_tag_ids').val(result);
            }
          });

          var tree = new TagTreeTag({
            tree_container: cj('#contact-issue-codes'),
            filter_bar: cj('#contact-issue-codes-search'),
            tag_trees: [291],
            default_tree: 291,

            auto_save: false,
            entity_id: cj('#contact_ids').val(),
            entity_counts: false,
            entity_type: 'civicrm_contact',
          });
          tree.load();



          cj('#activity_tag_name')
            .tokenInput( '/civicrm/imap/ajax/tag/search', {
            theme: 'facebook',
            zindex: 9999,
            onAdd: function ( item ) {
              current_activity_tags = cj('#activity_tag_ids').val();
              current_activity_tags = current_activity_tags.replace(/,,/g, ",");
              cj('#activity_tag_ids').val(current_activity_tags+','+item.id);
            },
            onDelete: function ( item ) {
              current_activity_tags = cj('#activity_tag_ids').val();
              result = string_replace(current_activity_tags, ','+item.id,',');
              result = result.replace(/,,/g, ",");
              cj('#activity_tag_ids').val(result);
            }
          });

          // autocomplete
          cj('#contact_position_name')
            .tokenInput( '/civicrm/ajax/taglist?parentId=292', {
            theme: 'facebook',
            zindex: 9999,
            onAdd: function ( item ) {
              current_contact_positions = cj('#contact_position_ids').val();
              current_contact_positions = current_contact_positions.replace(/,,/g, ",");
              cj('#contact_position_ids').val(current_contact_positions+','+item.id);
            },
            onDelete: function ( item ) {
              current_contact_positions = cj('#contact_position_ids').val();
              result = string_replace(current_contact_positions, ','+item.id,',');
              result = result.replace(/,,/g, ",");
              cj('#contact_position_ids').val(result);
            }
          });

          cj('#message_left_header_tag').html('').append("<span class='popup_def'>From: </span>"+messages.sender_name +"  <span class='emailbubble'>"+ messages.sender_email+"</span><br/><span class='popup_def'>Subject: </span>"+shortenString(messages.subject,55)+"<br/><span class='popup_def'>Date Forwarded: </span>"+messages.date_long+"<br/>");
          cj('#message_left_header_tag').append("<input class='hidden' type='hidden' id='activityId' value='"+activityId+"'><input class='hidden' type='hidden' id='contactId' value='"+contactId+"'>");
          if ((messages.forwarder != messages.sender_email)){
            cj('#message_left_header').append("<span class='popup_def'>Forwarded by: </span><span class='emailbubble'>"+ messages.forwarder+"</span> @"+ messages.updated_long+ "<br/>");
          }else{
            cj('#message_left_header').append("<span class='popup_def'>&nbsp;</span>No forwarded content found<br/>");
          }
          cj('#message_left_email_tag').html(messages.body+"<hr/>");
          cj.each(messages.attachments, function(key, value) {
             if((!value.rejection) || (value.rejection == '')){
              cj('#message_left_email').append(value.fileName+" ("+((value.size / 1024) / 1024).toFixed(2)+" MB)<br/>");
            }else{
              cj('#message_left_email').append("<span class='rejected'>"+value.fileName+" was rejected ("+value.rejection+")</span><br/>");
            }
          });


          cj("#tagging-popup").dialog({ title:  "Tagging: "+ shortenString(messages.subject,50) });
          cj( "#tagging-popup" ).dialog({
            buttons: {
              "Tag": function() {
                var existingTags = new Array();
                cj.each(cj('#contact-issue-codes dt.existing'), function(key, id) {
                  existingTags.push(cj(this).attr('tid'));
                });
                pushtag(existingTags,'');
              },
              "Tag and Clear": function() {
                var existingTags = new Array();
                cj.each(cj('#contact-issue-codes dt.existing'), function(key, id) {
                  existingTags.push(cj(this).attr('tid'));
                });
                pushtag(existingTags,'clear');
              },
              Cancel: function() {
                cj("#tagging-popup").dialog('close');
                cj('.token-input-list-facebook').html('').remove();
                cj('.token-input-dropdown-facebook').html('').remove();
              }
            }
          });
          cj("#tagging-popup").dialog('open');
          cj("#tabs_tag").tabs();
          cj('#tabs_tag').tabs({ selected: 0 });
        }
      },
      error: function(){
        CRM.alert('Unable to load Message ', '', 'error');
        cj('.token-input-dropdown-facebook').html('').remove();
        cj('.token-input-list-facebook').html('').remove();

      }
    });
    return false;
  });

// MATCHED Multiple Functions

  // modal for tagging multiple contacts, different header info is shown
  // opens the add_tag popup
  cj(".multi_tag").live('click', function() {
    cj("#loading-popup").dialog('open');
    var contactIds = new Array();
    var activityIds = new Array();

    cj('#imapper-messages-list input:checked').each(function() {
      activityIds.push(cj(this).attr('name'));
      contactIds.push(cj(this).attr('data-id'));
    });

    if(!activityIds.length){
      cj("#loading-popup").dialog('close');
      CRM.alert('Use the checkbox to select one or more messages to tag', '', 'error');
      return false;
    }
    // render the multi message view
    cj('#contact_ids').val('').val(contactIds);
    cj('#activity_ids').val('').val(activityIds);
    cj('#contact_tag_ids').val('');
    cj('#activity_tag_ids').val('');
    cj('#contact_position_ids').val('');
    cj('#contact_position_name').val('');
    cj('.token-input-dropdown-facebook').html('').remove();
    cj('.token-input-list-facebook').html('').remove();

    cj('#message_left_header_tag').html('');
    cj('#message_left_tag').html('').addClass('tag_over_ride');

    // autocomplete
    cj('#contact_tag_name')
      .tokenInput( '/civicrm/imap/ajax/tag/search', {
      theme: 'facebook',
      zindex: 9999,
      onAdd: function ( item ) {
        current_contact_tags = cj('#contact_tag_ids').val();
        current_contact_tags = current_contact_tags.replace(/,,/g, ",");
        cj('#contact_tag_ids').val(current_contact_tags+','+item.id);
      },
      onDelete: function ( item ) {
        current_contact_tags = cj('#contact_tag_ids').val();
        result = string_replace(current_contact_tags, ','+item.id,',');
        result = result.replace(/,,/g, ",");
        cj('#contact_tag_ids').val(result);
      }
    });
    cj('#activity_tag_name')
      .tokenInput( '/civicrm/imap/ajax/tag/search', {
      theme: 'facebook',
      zindex: 9999,
      onAdd: function ( item ) {
        current_activity_tags = cj('#activity_tag_ids').val();
        current_activity_tags = current_activity_tags.replace(/,,/g, ",");
        cj('#activity_tag_ids').val(current_activity_tags+','+item.id);
      },
      onDelete: function ( item ) {
        current_activity_tags = cj('#activity_tag_ids').val();
        result = string_replace(current_activity_tags, ','+item.id,',');
        result = result.replace(/,,/g, ",");
        cj('#activity_tag_ids').val(result);
      }
    });
    var tree = new TagTreeTag({
      tree_container: cj('#contact-issue-codes'),
      filter_bar: cj('#contact-issue-codes-search'),
      tag_trees: [291],
      default_tree: 291,

      auto_save: false,
      entity_id: false,
      entity_counts: false,
      entity_type: 'civicrm_contact',
    });
    tree.load();

    cj('#contact_position_name')
      .tokenInput( '/civicrm/ajax/taglist?parentId=292', {
      theme: 'facebook',
      zindex: 9999,
      onAdd: function ( item ) {
        current_contact_positions = cj('#contact_position_ids').val();
        current_contact_positions = current_contact_positions.replace(/,,/g, ",");
        cj('#contact_position_ids').val(current_contact_positions+','+item.id);
      },
      onDelete: function ( item ) {
        current_contact_positions = cj('#contact_position_ids').val();
        result = string_replace(current_contact_positions, ','+item.id,',');
        result = result.replace(/,,/g, ",");
        cj('#contact_position_ids').val(result);
      }
    });
    cj.each(activityIds, function(key, activityId) {
      // console.log('activity :'+activityId+" - key : "+key+" - Contact : "+contactIds[key]);
      cj.ajax({
        url: '/civicrm/imap/ajax/matched/details',
        data: {id: activityId, contact: contactIds[key] },
        success: function(data,status) {

          cj("#loading-popup").dialog('close');
          message = cj.parseJSON(data);

          if(message.code == 'ERROR'){
            if(message.clear =='true') removeRow(activityId);
              CRM.alert('Unable to load Message : '+ message.message, '', 'error');
              return false;
            }else{
              cj('#message_left_tag').append("<div id='header_"+activityId+"' data-id='"+activityId+"' class='message_left_header_tags'><span class='popup_def'>From: </span>"+message.sender_name +"  <span class='emailbubble'>"+ message.sender_email+"</span><br/><span class='popup_def'>Subject: </span>"+shortenString(message.subject,55)+"<br/><span class='popup_def'>Date Forwarded: </span>"+message.date_long+"<br/></div><div id='email_"+activityId+"' class='hidden_email' data-id='"+activityId+"'></div>");
              if ((message.forwarder != message.sender_email)){
                cj('#message_left_header').append("<span class='popup_def'>Forwarded by: </span><span class='emailbubble'>"+ message.forwarder+"</span> @"+ message.updated_long+ "<br/>");
              }else{
                cj('#message_left_header').append("<span class='popup_def'>&nbsp;</span>No forwarded content found<br/>");
              }
              cj('#email_'+activityId).html("<span class='info hidden_email_info' data-id='"+activityId+"'>Show Email</span><br/><span class='email'>"+message.body+"</span>");
            }
        },
        error: function(){
          CRM.alert('Unable to load Message ', '', 'error');
        }
      });
    });
    cj( "#tagging-popup" ).dialog({
      buttons: {
        "Tag": function() {
          var existingTags = new Array();
          cj.each(cj('#contact-issue-codes dt.existing'), function(key, id) {
            existingTags.push(cj(this).attr('tid'));
          });
          pushtag(existingTags);
        },
        "Tag and Clear": function() {
          var existingTags = new Array();
          cj.each(cj('#contact-issue-codes dt.existing'), function(key, id) {
            existingTags.push(cj(this).attr('tid'));
          });
          pushtag(existingTags,'clear');
        },
        Cancel: function() {
          cj("#tagging-popup").dialog('close');
          cj('.token-input-list-facebook').html('').remove();
          cj('.token-input-dropdown-facebook').html('').remove();
        }
      }
    });

    cj("#tabs_tag").tabs();
    cj('#tabs_tag').tabs({ selected: 0 });
    cj("#tagging-popup").dialog({ title: "Tagging "+contactIds.length+" Matched messages"});
    cj("#tagging-popup").dialog('open');
    cj("#loading-popup").dialog('close');
    return false;
  });

  // remove multiple activities
  cj(".multi_clear").live('click', function() {
    cj("#loading-popup").dialog('open');
    var delete_ids = new Array();

    cj('#imapper-messages-list input:checked').each(function() {
      delete_ids.push(cj(this).attr('name'));
    });
    if(!delete_ids.length){
      cj("#loading-popup").dialog('close');
      CRM.alert('Use the checkbox to select one or more messages to clear', '', 'error');
      return false;
    }
    cj( "#clear-confirm" ).dialog({
      buttons: {
        "Clear": function() {
          cj("#reloading-popup").dialog('open');
          cj.each(delete_ids, function(key, value) {
            ClearActivity(value);
          });
          cj("#reloading-popup").dialog('close');

        },
        Cancel: function() {
          cj( this ).dialog( "close" );
        }
      }
    });
    cj("#clear-confirm").dialog({ title:  "Remove "+delete_ids.length+" Messages From List?"});
    cj("#loading-popup").dialog('close');
    cj( "#clear-confirm" ).dialog('open');
    return false;
  });

// general functions
  // paginated contact search
  cj(".seeMore").live('click', function() {
    var position = cj(this).attr('id');
    var update = parseInt(position,10)+200;
    buildContactList(update);
    cj(this).remove();
  });

  cj(".FixedHeader_Cloned th").live('click', function() {
    var clickclass = cj(this).attr('class').split(' ')[0];
    cj('.imapperbox th.'+clickclass).click();
  });

  // add highlight to selected rows in table view
  cj(".checkbox").live('click', function() {
      cj(this).parent().parent().toggleClass( "highlight" );
  });


  // smart date picker
  cj( "#tab1 .dob .month,#tab1 .dob .day,#tab1 .dob .year" ).change(function() {
    if ( cj.isNumeric(cj("#tab1 .dob .month").val()) && cj.isNumeric(cj("#tab1 .dob .day").val())  && cj.isNumeric(cj("#tab1 .dob .year").val()) ) {
      var date_string = cj("#tab1 .dob .month").val()+"/"+cj("#tab1 .dob .day").val()+"/"+cj("#tab1 .dob .year").val();
      cj('#tab1 input.form-text.dob').val(date_string);
    }else{
      cj('#tab1 input.form-text.dob').val('');
      return false;
    }
  });

  cj( "#tab2 .dob .month,#tab2 .dob .day,#tab2 .dob .year" ).change(function() {
    if ( cj.isNumeric(cj("#tab2 .dob .month").val()) && cj.isNumeric(cj("#tab2 .dob .day").val())  && cj.isNumeric(cj("#tab2 .dob .year").val()) ) {
      var date_string = cj("#tab2 .dob .month").val()+"/"+cj("#tab2 .dob .day").val()+"/"+cj("#tab2 .dob .year").val();
      cj('#tab2 input.form-text.dob').val(date_string);
    }else{
      cj('#tab2 input.form-text.dob').val('');
      return false;
    }
  });
  // dirty toggles
  // toggle hidden email info in multi_tag popup
  cj(".hidden_email_info").live('click', function(){
    var id = cj(this).data('id');
    cj("#email_"+id+" .info").removeClass('hidden_email_info').addClass('shown_email_info').html('Hide Email');
    cj("#email_"+id).removeClass('hidden_email').addClass('shown_email');
  });

  cj(".shown_email_info").live('click', function(){
    var id = cj(this).data('id');
    cj("#email_"+id+" .info").removeClass('shown_email_info').addClass('hidden_email_info').html('Show Email');
    cj("#email_"+id).removeClass('shown_email').addClass('hidden_email');
  });

  // toggle Debug info for find match message popup
  cj(".debug_on").live('click', function() {
    var debug_info = cj(".debug_info").html();
    cj("#message_left_email").prepend(debug_info);
    cj(this).removeClass('debug_on').addClass('debug_off').html('Hide Debug info');
  });

  cj(".debug_off").live('click', function() {
    cj("#message_left_email .debug_remove").remove();
    cj(this).removeClass('debug_off').addClass('debug_on').html('Show Debug info');
  });
});

function firstName(nameVal){
  if(nameVal){
    var nameLength = nameVal.length;
    var nameSplit = nameVal.split(" ");
    return nameSplit[0];
  }else{
    return 'N/A';
  }
}

function lastName(nameVal){
  if(nameVal){
    var nameLength = nameVal.length;
    var nameSplit = nameVal.split(" ");
    var lastLength = nameLength - nameSplit[0].length;
    var lastNameLength = nameSplit[0].length + 1;
    var lastName = nameVal.slice(lastNameLength);
    return lastName;
  }else{
    return 'N/A';
  }
}

function getUnmatchedMessages(range) {
  if (typeof oTable != "undefined"){
    oTable.fnDestroy();
    cj('.FixedHeader_Cloned.fixedHeader.FixedHeader_Header').remove();
  }
  cj('#imapper-messages-list').html('<td valign="top" colspan="7" class="dataTables_empty"><span class="loading_row"><span class="loading_message">Loading Message data <img src="/sites/default/themes/Bluebird/images/loading.gif"/></span></span></td>');
  cj.ajax({
    url: '/civicrm/imap/ajax/unmatched/list?range='+range,
    success: function(data,status) {
      messages = cj.parseJSON(data);
      buildUnmatchedList();
    },
    error: function(){
      CRM.alert('unable to Load Messages', '', 'error');
    }
  });
}

function getMatchedMessages(range) {
  if (typeof oTable != "undefined"){
    oTable.fnDestroy();
    cj('.FixedHeader_Cloned.fixedHeader.FixedHeader_Header').remove();
  }
  cj('#imapper-messages-list').html('<td valign="top" colspan="7" class="dataTables_empty"><span class="loading_row"><span class="loading_message">Loading Message data <img src="/sites/default/themes/Bluebird/images/loading.gif"/></span></span></td>');
  cj.ajax({
    url: '/civicrm/imap/ajax/matched/list?range='+range,
    success: function(data,status) {
      messages = cj.parseJSON(data);
      buildMatchedList();
    },
    error: function(){
      CRM.alert('unable to Load Messages', '', 'error');
    }
  });
}
function getReports(range) {
  if (typeof oTable != "undefined"){
    oTable.fnDestroy();
    cj('.FixedHeader_Cloned.fixedHeader.FixedHeader_Header').remove();
  }
  cj('#imapper-messages-list').html('<td valign="top" colspan="7" class="dataTables_empty"><span class="loading_row"><span class="loading_message">Loading Message data <img src="/sites/default/themes/Bluebird/images/loading.gif"/></span></span></td>');
  cj.ajax({
    url: '/civicrm/imap/ajax/reports/list?range='+range,
    success: function(data,status) {
      reports = cj.parseJSON(data);
      buildReports();
    },
    error: function(){
      CRM.alert('unable to Load Messages', '', 'error');
    }
  });
}
// needed to format timestamps to allow sorting:
// make a hidden data attribute with the non-readable date (date(U)) and sort on that
cj.extend( cj.fn.dataTableExt.oSort, {
  "title-string-pre": function ( a ) {
    return a.match(/data-sort="(.*?)"/)[1].toLowerCase();
  },
  "title-string-asc": function ( a, b ) {
    return ((a < b) ? -1 : ((a > b) ? 1 : 0));
  },
  "title-string-desc": function ( a, b ) {
    return ((a < b) ? 1 : ((a > b) ? -1 : 0));
  }
});

function makeTable(){
  oTable = cj("#sortable_results").dataTable({
    "sDom":'<"controlls"lif><"clear">rt <p>',//add i here this is the number of records
    // "iDisplayLength": 1,
    "sPaginationType": "full_numbers",
    "aaSorting": [[ 3, "desc" ]],
    "aoColumnDefs": [
    { 'bSortable': false, 'aTargets': [ 0 ] },
    { 'bSortable': false, 'aTargets': [ 6 ] },
    { "sType": "title-string", "aTargets": [ 2,3,5 ] }
    ],
    "oColVis": { "activate": "mouseover" },
    'aTargets': [ 1 ],
    "iDisplayLength": 50,
    "aLengthMenu": [[10, 50, 100, -1], [10, 50, 100, 'All']],
    "bAutoWidth": false,
    "oLanguage": {
      "sEmptyTable": "No records found"
    }
  });
  oHeader = new FixedHeader( oTable );
  oHeader.fnUpdate();
}



function buildUnmatchedList() {
  if(messages.stats.overview.successes == '0' || messages == null){
    makeTable();
  }else{
    var html = '';
    var total_results = messages.stats.overview.successes;
    cj.each(messages.Unprocessed, function(key, value) {
      var icon ='';
	    html += '<tr id="'+value.id+'" data-key="'+value.sender_email+'" class="imapper-message-box"> <td class="imap_checkbox_column" ><input class="checkbox" type="checkbox" name="'+value.id+'"  data-id="'+value.id+'"/></td>';

      // build a match count bubble
      countWarn = (value.email_count == 1) ? 'warn' :  '';
      countMessage = (value.email_count == 1) ? 'This address should have matched automatically' : 'This email address matches '+value.email_count+' records in bluebird';
      countStatus = (value.email_count == 0) ? 'empty' :  'multi';
      countIcon = '<span class="matchbubble marginL5 '+countWarn+' '+countStatus+'" title="'+countMessage+'">'+value.email_count+'</span></td>';

      // build the name box
      if( value.sender_name != ''  && value.sender_name != null){
        html += '<td class="imap_name_column unmatched" data-firstName="'+firstName(value.sender_name)+'" data-lastName="'+lastName(value.sender_name)+'">'+shortenString(value.sender_name,20);
        if( value.sender_email != '' && value.sender_email != null){
          html += '<span class="emailbubble marginL5">'+shortenString(value.sender_email,15)+'</span>';
          html +=  countIcon;
        }else{
          html += '<span class="emailbubble warn marginL5" title="We could not find the email address of this record">No email found!</span>';
        }
        html +='</td>';
      }else if( value.sender_email != '' && value.sender_email != null ){
        html += '<td class="imap_name_column unmatched"><span class="emailbubble">'+shortenString(value.sender_email,25)+'</span>';
        html +=  countIcon;
      }else {
        html += '<td class="imap_name_column unmatched"><span class="matchbubble warn" title="There was no info found in regard to the source of this message">No source info found</span></td>';
        html +=  countIcon;
      }

      // dealing with attachments
      if(value.attachments != 0 ){
        icon = '<div class="icon attachment-icon attachment" title="'+value.attachments+' Attachments" ></div>'
      }
      html += '<td class="imap_subject_column unmatched">'+shortenString(value.subject,40) +' '+icon+'</td>';
      html += '<td class="imap_date_column unmatched"><span data-sort="'+value.date_u+'" title="'+value.date_long+'">'+value.date_short +'</span></td>';

      // hidden column to sort by
      if(value.match_count != 1){
        var match_short = (value.match_count == 0) ? "NoMatch" : "MultiMatch" ;
        html += '<td class="imap_match_column hidden"><span data="'+match_short+'">'+match_short +'</span></td>';
      }else{
        html += '<td class="imap_match_column hidden"><span data="Error">ProcessError</span></td>';
      }

      // check for direct messages & not empty forwarded messages
      if(value.forwarder === value.sender_email){
        html += '<td class="imap_forwarder_column"><span data-sort="'+value.forwarder.replace("@","_")+'">Direct '+shortenString(value.forwarder,10)+'</span></td>';
      }else if(value.forwarder != ''){
        html += '<td class="imap_forwarder_column"><span data-sort="'+value.forwarder.replace("@","_")+'">'+shortenString(value.forwarder,14)+'</span></td>';
      }else{
        html += '<td class="imap_forwarder_column"> N/A </td>';
      }
      html += '<td class="imap_actions_column "><span class="find_match"><a href="#">Find match</a></span><span class="delete"><a href="#">Delete</a></span></td> </tr>';
    });
    cj('#imapper-messages-list').html(html);
    makeTable();

  }
}

function MakeReportTable(){
  oTable = cj("#sortable_results").dataTable({
    "sDom":'<"controlls"lif><"clear">rt <p>',//add i here this is the number of records
    // "iDisplayLength": 1,
    "sPaginationType": "full_numbers",
    "aaSorting": [[ 3, "desc" ]],
    "aoColumnDefs": [ { "sType": "title-string", "aTargets": [ 3,4 ] }],
    'aTargets': [ 1 ],
    "iDisplayLength": 50,
    "aLengthMenu": [[10, 50, 100, -1], [10, 50, 100, 'All']],
    "bAutoWidth": false,
    "oLanguage": {
      "sEmptyTable": "No records found"
    },
  });
  new FixedHeader( oTable );
}

function buildReports() {
  var html = '';
  if(reports.total == '0' || reports.Messages == null){
    MakeReportTable();
  }else{
    cj.each(reports.Messages, function(key, value) {
      html += '<tr id="'+value.id+'" data-id="'+value.activity_id+'" data-contact_id="'+value.matched_to+'" class="imapper-message-box '+value.status_string+'"> ';
      html += '<td class="imap_column">'+shortenString(value.fromName,40)+'</td>';
      if (!value.contactType) {
        html += '<td class="imap_name_column"> </td>';
      } else{
        html += '<td class="imap_name_column" data-firstName="'+value.firstName +'" data-lastName="'+value.lastName +'"> <a class="crm-summary-link" href="/civicrm/profile/view?reset=1&gid=13&id='+value.matched_to+'&snippet=4"> <div class="icon crm-icon '+value.contactType+'-icon"></div> </a> <a href="/civicrm/contact/view?reset=1&cid='+value.matched_to+'" title="'+value.fromName+'">'+shortenString(value.fromName,19)+'</a> </td>';
      }
      html += '<td class="imap_subject_column">'+shortenString(value.subject,40)+'</td>';
      html += '<td class="imap_date_column"><span data-sort="'+value.date_u+'"  title="'+value.date_long+'">'+value.date_short +'</span></td>';
      html += '<td class="imap_date_column"><span data-sort="'+value.email_date_u+'"  title="'+value.email_date_long+'">'+value.email_date_short +'</span></td>';
      if (value.status_string != null) {
        html += '<td class="imap_date_column">' +value.status_string+'</td>';
      }else{
        html += '<td class="imap_date_column"> Automatically Matched</td>';

      }

      html += '<td class="imap_forwarder_column"><span data-sort="'+value.forwarder.replace("@","_")+'">'+shortenString(value.forwarder,14)+'</span></td></tr>';
    });

    cj('#imapper-messages-list').html(html);
    MakeReportTable();
    cj('#total').html(reports.total);
    cj('#total_unMatched').html(reports.unMatched);
    cj('#total_Matched').html(reports.Matched);
    cj('#total_Cleared').html(reports.Cleared);
    cj('#total_Errors').html(reports.Errors);
    cj('#total_Deleted').html(reports.Deleted);

  };

}
cj( ".range" ).live('change', function() {
  if(cj("#Activities").length){
    getMatchedMessages(cj('#range').attr("value"));
  }else if(cj("#Unmatched").length){
    getUnmatchedMessages(cj('#range').attr("value"));
  }else if(cj("#Reports").length){
    getReports(cj('#range').attr("value"));
  }
});

cj( ".checkbox_switch" ).live('click', function(e) {
  if (this.checked) {
    cj('.checkbox').prop('checked', this.checked)
    cj('.checkbox').parent().parent().addClass('highlight');
  }else{
    cj('.checkbox').prop('checked', this.checked)
    cj('tr').removeClass('highlight');
  }
});

cj(".stats_overview").live('click', function() {
    cj(".stats_overview").removeClass('active');
    cj(this).addClass('active');
});

cj(".Total").live('click', function() {
    oTable.fnFilter( "", 5, false,false);
});
cj(".UnMatched").live('click', function() {
    oTable.fnFilter( 'UnMatched',5 );
});
cj(".Matched").live('click', function() {
    oTable.fnFilter( 'Matched by', 5 );
});
cj(".Cleared").live('click', function() {
    oTable.fnFilter( 'Cleared', 5 );
});
cj(".Errors").live('click', function() {
    oTable.fnFilter( 'error', 5 );
});
cj(".Deleted").live('click', function() {
    oTable.fnFilter( 'Deleted', 5);
});


function DeleteMessage(id,imapid){
  cj.ajax({
    url: '/civicrm/imap/ajax/unmatched/delete',
    async:false,
    data: {id: id },
    success: function(data,status) {
      deleted = cj.parseJSON(data);
      if(deleted.code == 'ERROR' || deleted.code == '' || deleted.code == null){
        if(deleted.clear =='true')  removeRow(id);
        CRM.alert('Unable to Delete Message : '+deleted.message, '', 'error');
      }else{
        removeRow(id); ;
        CRM.alert('Message Deleted', '', 'success');
      }
    },
    error: function(){
      CRM.alert('Unable to Delete Message', '', 'error');
      }
  });
}

// Clear activities
// args : value = activity ID
// Result : A few things
function ClearActivity(value){
  cj.ajax({
    url: '/civicrm/imap/ajax/matched/clear',
    data: {id: value},
    async:false,
    success: function(data,status) {
      data = cj.parseJSON(data);
      if (data.code =='ERROR'){
        CRM.alert('Unable to Clear Activity : '+data.message, '', 'error');
        if(deleted.clear =='true')  removeRow(value);
      }else{
        CRM.alert('Activity Cleared', '', 'success');
      }
      removeRow(value);
      cj("#clear-confirm").dialog('close');
    },
    error: function(){
      CRM.alert('Unable to Clear Activity', '', 'error');
    }
  });
}

// Delete activities
// args : value = activity ID
// Result : A few things
function DeleteActivity(value){
    // setTimeout(this.resolve, (1500));
  // console.log(value);
  cj.ajax({
    url: '/civicrm/imap/ajax/matched/delete',
    data: {id: value},
    success: function(data,status) {
      deleted = cj.parseJSON(data);
      if(deleted.code == 'ERROR' || deleted.code == '' || deleted.code == null){
        if(deleted.clear =='true')  removeRow(value);
        CRM.alert('Unable to Delete Activity : '+deleted.message, '', 'error');
      }else{
        removeRow(value);
        CRM.alert('Activity Deleted', '', 'success');
      }
    },
    error: function(){
      CRM.alert('Unable to Delete Activity', '', 'error');
    }
  });
}

// adding (single / multiple) tags to (single / multiple) contacts,
// function works for multi contact tagging and single
// cj(".push_tag").live('click', function(){
function pushtag(existingTags,clear){

  var contact_ids = cj("#contact_ids").attr('value');
  var activity_ids = cj("#activity_ids").attr('value');

  var contact_tag_ids ='';
  var contact_position_ids ='';

  var activity_tag_ids ='';

  var contact_input = cj("#contact_tag_ids").val().replace(/,,/g, ",").replace(/^,/g, "");
  if(contact_input.length){
    contact_tag_ids = contact_input;
  }

  var contact_position_input = cj("#contact_position_ids").val().replace(/,,/g, ",").replace(/^,/g, "");
  if(contact_position_input.length){
    contact_position_ids = contact_position_input;
  }
  if(contact_position_ids){
    var contact_ids_array = contact_ids.split(',');
    cj.ajax({
      url: '/civicrm/imap/ajax/tag/add',
      async:false,
      data: { contactId: contact_ids, tags: contact_position_ids},
      success: function(data,status) {
        CRM.alert('Added Position', 'Success', 'success');
      },error: function(){
        var output = cj.parseJSON(data);
        CRM.alert('Failed to add Position', 'Error', 'error');
      }
    });
  }

  var activity_input = cj("#activity_tag_ids").val().replace(/,,/g, ",").replace(/^,/g, "");
  if(activity_input.length){
    activity_tag_ids = activity_input;
  }

  var sentTags = new Array();
  cj.each(cj('#contact-issue-codes dt.checked'), function(key, id) {
    sentTags.push(cj(this).attr('tid'));
  });

  var removedTags = cj(existingTags).not(sentTags).get();
  var addedTags = cj(sentTags).not(existingTags).get();

  if (activity_tag_ids.length || contact_tag_ids.length  || removedTags.length || addedTags.length){
    cj("#tagging-popup").dialog('close');
    cj('.token-input-list-facebook .token-input-token-facebook').remove();
    cj('.token-input-dropdown-facebook').html('');
    cj('.token-input-dropdown-facebook').html('').remove();
    cj('#contact-issue-codes').html('');
  }else{
    CRM.alert('Please select a tag', 'Warning', 'warn');
    return false;
  }

  if(addedTags.length){
    cj.ajax({
      url: '/civicrm/imap/ajax/issuecode',
      async:false,
      data: { contacts: contact_ids, issuecodes: addedTags.toString(), action:'create'},
      success: function(data,status) {
        var output = cj.parseJSON(data);
        CRM.alert(output.message, 'Success', 'success');
      },error: function(){
        var output = cj.parseJSON(data);
        CRM.alert(output.message, 'Error', 'error');
      }
    });
  }
  if(removedTags.length){
    cj.ajax({
      url: '/civicrm/imap/ajax/issuecode',
      async:false,
      data: { contacts: contact_ids, issuecodes: removedTags.toString(), action:'delete'},
      success: function(data,status) {
        var output = cj.parseJSON(data);
        CRM.alert(output.message, 'Success', 'success');
      },error: function(){
        var output = cj.parseJSON(data);
        CRM.alert(output.message, 'Error', 'error');
      }
    });
  }



  if(contact_tag_ids){
    var contact_ids_array = contact_ids.split(',');
    cj.each(contact_ids_array, function(key, id) {
      CRM.alert('Contact Tagged', '', 'success');
    });
    cj.ajax({
      url: '/civicrm/imap/ajax/tag/add',
      async:false,
      data: { contactId: contact_ids, tags: contact_tag_ids},
      success: function(data,status) {
      },error: function(){
        CRM.alert('failure', '', 'error');
      }
    });
  }
  if(activity_tag_ids){
    var activity_ids_array = activity_ids.split(',');
    cj.each(activity_ids_array, function(key, id) {
      CRM.alert('Message Tagged', '', 'success');
    });

    cj.ajax({
      url: '/civicrm/imap/ajax/tag/add',
      async:false,
      data: { activityId: activity_ids, tags: activity_tag_ids},
      success: function(data,status) {
      },error: function(){
        CRM.alert('failure', '', 'error');
      }
    });
  }

  if(clear){
    cj("#clear-confirm").dialog('open');
    cj("#clear-confirm").dialog({
      buttons: {
        "Clear": function() {
          cj("#clear-confirm").dialog('close');
          activity_ids_array = activity_ids.split(',');
          cj.each(activity_ids_array, function(key, id) {
            ClearActivity(id);
          });
        },
        Cancel: function() {
          cj("#clear-confirm").dialog('close');
        }
      }
    });
  }

};

// matched messages screen
function buildMatchedList() {
  if(messages.stats.overview.successes == '0' || messages == null){
    cj('#imapper-messages-list').html('<td valign="top" colspan="7" class="dataTables_empty">No records found</td>');
    makeTable();

  }else{
    var html = '';
    var total_results = messages.stats.overview.successes;
    // console.log(messages);
    cj.each(messages.Processed, function(key, value) {
      if(value.date_short != null){
      html += '<tr id="'+value.id+'" data-id="'+value.activity_id+'" data-contact_id="'+value.matched_to+'" class="imapper-message-box"> <td class="imap_checkbox_column" ><input class="checkbox" type="checkbox" name="'+value.id+'" data-id="'+value.matched_to+'"/></td>';

        if( value.contactType != ''){
          html += '<td class="imap_name_column" data-firstName="'+value.firstName +'" data-lastName="'+value.lastName +'">';
          html += '<a class="crm-summary-link" href="/civicrm/profile/view?reset=1&gid=13&id='+value.matched_to+'&snippet=4">';
          html += '<div class="icon crm-icon '+value.contactType+'-icon"></div>';
          html += '</a>';
          html += '<a href="/civicrm/contact/view?reset=1&cid='+value.matched_to+'" title="'+value.fromName+'">'+shortenString(value.fromName,19)+'</a>';
          html += ' ';
        }else {
          html += '<td class="imap_name_column">';
        }

        if(value.matcher){
          // previously we called bluebird admin 0, its actually 1
          if (value.matcher == 0) {
            value.matcher = 1;
          }
          var match_string = (value.matcher != 1) ? "Manually matched by "+value.matcher_name : "Automatically Matched" ;
          var match_short = (value.matcher != 1) ? "M" : "A" ;
          match_sort = (value.matcher != 1) ? "ManuallyMatched" : "AutomaticallyMatched" ;
          html += '<span class="matchbubble marginL5 '+match_short+'" title="This email was '+match_string+'">'+match_short+'</span>';
        }else{
          match_sort = 'ProcessError';
        }
        html +='</td>';
        html += '<td class="imap_subject_column">'+shortenString(value.subject,40);
        if(value.attachments != 0){
          html += '<div class="icon attachment-icon attachment" title="'+value.attachments+' Attachments" ></div>';
        }
        html +='</td>';
        html += '<td class="imap_date_column"><span data-sort="'+value.date_u+'"  title="'+value.date_long+'">'+value.date_short +'</span></td>';
        html += '<td class="imap_match_column  hidden">'+match_sort +'</td>';

        html += '<td class="imap_forwarder_column"><span data-sort="'+value.forwarder.replace("@","_")+'">'+shortenString(value.forwarder,14)+'</span> </td>';
        html += '<td class="imap_actions_column"><span class="edit_match"><a href="#">Edit</a></span><span class="add_tag"><a href="#">Tag</a></span><span class="clear_activity"><a href="#">Clear</a></span><span class="delete"><a href="#">Delete</a></span></td> </tr>';

      }
    });
    cj('#imapper-messages-list').html(html);
    makeTable();
  }
}

function buildContactList(loop) {
  var contactsHtml = '';
  html = "<br/><br/><i>Contact Search results:</i><br/><strong>Number of matches: </strong>"+contacts.length+' ';
  if(contacts.length < 1){
    html += "(No Matches)";
  }
  cj('.search_info').html(html);

  for (var i = loop; i < contacts.length && i < loop+200; i++) {
    // calculate the aprox age
    if(contacts[i].birth_date){
      var date = new Date();
      var year  = date.getFullYear();
      var birth_year = contacts[i].birth_date.substring(0,4);
      var age = year - birth_year;
    }
    contactsHtml += '<div class="imapper-contact-box" data-id="'+contacts[i].id+'">';
    contactsHtml += '<div class="imapper-address-select-box">';
    contactsHtml += '<input type="checkbox" class="imapper-contact-select-button" name="contact_id" value="'+contacts[i].id+'" />';
    contactsHtml += '</div>';
    contactsHtml += '<div class="imapper-address-box">';
    if(contacts[i].display_name){ contactsHtml += contacts[i].display_name + '<br/>'; };
    if(contacts[i].birth_date){ contactsHtml += '<strong>'+age+'</strong> - '+contacts[i].birth_date + '<br/>';}
    if(contacts[i].email){ contactsHtml += contacts[i].email + '<br/>'; }
    if(contacts[i].phone){ contactsHtml += contacts[i].phone + '<br/>'; }
    if(contacts[i].street_address){ contactsHtml += contacts[i].street_address + '<br/>'; }
    if(contacts[i].city){ contactsHtml += contacts[i].city + ', ' + contacts[i].name +" "+ contacts[i].postal_code + '<br/>'; }
    contactsHtml += '</div></div>';
    contactsHtml += '<div class="clear"></div>';
  }
  if (contacts.length > loop+200){
    contactsHtml += '<span class="seeMore" id="'+loop+'">see more</span>';
  };
  cj('#imapper-contacts-list').append(contactsHtml);

}


// Create shortended String with title tag for hover
// If subject is null return N/A
function shortenString(subject, length){
  if(subject){
    if (subject.length > length ){
      var safe_subject = '<span title="'+subject+'" data-sort="'+subject+'">'+subject.substring(0,length)+"...</span>";
      return safe_subject;
    }else{
      return '<span data-sort="'+subject+'">'+subject+'</span>';
    }
  }else{
    return '<span title="Not Available" data-sort="Not Available"> N/A </span>';
  }
 }

// Look for empty rows that match the KEY of a matched row
// Remove them from the view so the user doesn't re-add / create duplicates
// key = md5 ( shortened to 8 ) of user_email
function checkForMatch(key,contactIds){
  cj("#matchCheck-popup").dialog('open');
  // console.log('checking',key,contactIds);
  cj(".this_address").html(key);
  cj('.imapper-message-box').each(function(i, item) {
    var check = cj(this).data('key');
    var messageId = cj(this).attr('id');
    if (key == check) {
      if (cj('.matchbubble.empty',this).length){
        cj.ajax({
          url: '/civicrm/imap/ajax/unmatched/assign',
          async:false,
          data: {
            messageId: messageId,
            contactId: contactIds
          },
          success: function(data,status) {
            if(data != null || data != ''){
              var assign = cj.parseJSON(data);
              if(assign.code == 'ERROR'){
                // CRM.alert(('Other Records not Matched'), ts(actionData.name), actionData['errorClass']);
              }else{
                removeRow(messageId);
                CRM.alert(('Other Records Automatically Matched'), '', 'success');

              }
            }
          }
        });
      }
    };
  });
  cj("#matchCheck-popup").dialog( "close" );

}

// removes row from the UI, forces table reload
function removeRow(id){
  if(cj("#"+id).length){
    var row_index = oTable.fnGetPosition( document.getElementById(id));
    oTable.fnDeleteRow(row_index);
  }else{
    // CRM.alert('could not delete row', '', 'error');
  }
}

function string_replace(haystack, find, sub) {
    return haystack.split(find).join(sub);
}
