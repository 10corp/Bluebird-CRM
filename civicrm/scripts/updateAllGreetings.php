<?php
/*
** Project: BluebirdCRM
** Author: Ken Zalewski
** Organization: New York State Senate
** Date: 2011-08-30
** Revised: 2011-09-19
**
** Using this script you can update Email Greetings, Postal Greetings,
** and Addressee for a specific contact type
**
** params for this script
** ct=Individual or ct=Household or ct=Organization (ct = contact type)
*/

  
require_once 'script_utils.php';

error_reporting(E_ERROR | E_PARSE | E_WARNING);


function run()
{
  $prog = basename(__FILE__);
  $shortopts = 'c:';
  $longopts = array('ct=');
  $stdusage = civicrm_script_usage();
  $usage = "[--ct|-c {Individual|Household|Organization}]";
  $contactOpts = array(
    'i' => 'Individual',
    'h' => 'Household',
    'o' => 'Organization'
  );

  $optlist = civicrm_script_init($shortopts, $longopts);
  if ($optlist === null) {
    error_log("Usage: $prog  $stdusage  $usage");
    exit(1);
  }

  if (!is_cli_script()) {
      echo "<pre>\n";
  }

  //log the execution of script
  require_once 'CRM/Core/Error.php';
  CRM_Core_Error::debug_log_message('updateAllGreetings.php');

  require_once 'CRM/Core/Config.php';
  $config = CRM_Core_Config::singleton();

  $contactType = null;
  if (!empty($optlist['ct'])) {
    $contactOptIdx = strtolower($optlist['ct'][0]);
    if (isset($contactOpts[$contactOptIdx])) {
      $contactType = $contactOpts[$contactOptIdx];
    }
    else {
      //CRM_Core_Error::fatal( ts('Invalid Contact Type.') );
      echo ts("$prog: {$optlist['ct']}: Invalid Contact Type.\n");
      exit(1);
    }
  }

  require_once 'CRM/Contact/BAO/Contact.php';
  $dao = new CRM_Contact_BAO_Contact();
  if ($contactType) {
    $dao->contact_type = $contactType;
  }
  $dao->find(false);
  while ($dao->fetch()) {
    echo "Processing contact id {$dao->id} (type={$dao->contact_type}) {$dao->display_name}\n";
    CRM_Contact_BAO_Contact::processGreetings($dao);
  }
}


run();
echo "\n\n Greeting is updated for contact(s). (Done) \n";
