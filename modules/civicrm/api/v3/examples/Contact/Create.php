<?php
/**
 * Test Generated example demonstrating the Contact.create API.
 *
 * This demonstrates setting a custom field through the API.
 *
 * @return array
 *   API result array
 */
function contact_create_example() {
  $params = array(
    'first_name' => 'abc1',
    'contact_type' => 'Individual',
    'last_name' => 'xyz1',
    'custom_1' => 'custom string',
  );

  try{
    $result = civicrm_api3('Contact', 'create', $params);
  }
  catch (CiviCRM_API3_Exception $e) {
    // Handle error here.
    $errorMessage = $e->getMessage();
    $errorCode = $e->getErrorCode();
    $errorData = $e->getExtraParams();
    return array(
      'is_error' => 1,
      'error_message' => $errorMessage,
      'error_code' => $errorCode,
      'error_data' => $errorData,
    );
  }

  return $result;
}

/**
 * Function returns array of result expected from previous function.
 *
 * @return array
 *   API result array
 */
function contact_create_expectedresult() {

  $expectedResult = array(
    'is_error' => 0,
    'version' => 3,
    'count' => 1,
    'id' => 3,
    'values' => array(
      '3' => array(
        'id' => '3',
        'contact_type' => 'Individual',
        'contact_sub_type' => '',
        'do_not_email' => 0,
        'do_not_phone' => 0,
        'do_not_mail' => 0,
        'do_not_sms' => 0,
        'do_not_trade' => 0,
        'is_opt_out' => 0,
        'legal_identifier' => '',
        'external_identifier' => '',
        'sort_name' => 'xyz1, abc1',
        'display_name' => 'abc1 xyz1',
        'nick_name' => '',
        'legal_name' => '',
        'image_URL' => '',
        'preferred_communication_method' => '',
        'preferred_language' => 'en_US',
        'preferred_mail_format' => 'Both',
        'hash' => '67eac7789eaee00',
        'api_key' => '',
        'first_name' => 'abc1',
        'middle_name' => '',
        'last_name' => 'xyz1',
        'prefix_id' => '',
        'suffix_id' => '',
        'formal_title' => '',
        'communication_style_id' => '',
        'email_greeting_id' => '1',
        'email_greeting_custom' => '',
        'email_greeting_display' => '',
        'postal_greeting_id' => '1',
        'postal_greeting_custom' => '',
        'postal_greeting_display' => '',
        'addressee_id' => '1',
        'addressee_custom' => '',
        'addressee_display' => '',
        'job_title' => '',
        'gender_id' => '',
        'birth_date' => '',
        'is_deceased' => 0,
        'deceased_date' => '',
        'household_name' => '',
        'primary_contact_id' => '',
        'organization_name' => '',
        'sic_code' => '',
        'user_unique_id' => '',
        'created_date' => '2013-07-28 08:49:19',
        'modified_date' => '2012-11-14 16:02:35',
      ),
    ),
  );

  return $expectedResult;
}

/*
* This example has been generated from the API test suite.
* The test that created it is called "testCreateWithCustom"
* and can be found at:
* https://github.com/civicrm/civicrm-core/blob/master/tests/phpunit/api/v3/ContactTest.php
*
* You can see the outcome of the API tests at
* https://test.civicrm.org/job/CiviCRM-master-git/
*
* To Learn about the API read
* http://wiki.civicrm.org/confluence/display/CRMDOC/Using+the+API
*
* Browse the api on your own site with the api explorer
* http://MYSITE.ORG/path/to/civicrm/api
*
* Read more about testing here
* http://wiki.civicrm.org/confluence/display/CRM/Testing
*
* API Standards documentation:
* http://wiki.civicrm.org/confluence/display/CRM/API+Architecture+Standards
*/
