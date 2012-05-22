<?php

/**
 * Author:      Brian Shaughnessy
 * Date:        2012-04-13
 * Description: Enable logging and rebuild triggers. Implemented with v1.3.5
 */

$prog = basename(__FILE__);

require_once 'script_utils.php';
$optList = civicrm_script_init("", array(), False);

drupal_script_init();

require_once 'CRM/Core/Config.php';
$config = CRM_Core_Config::singleton();

//manually drop several triggers in case we are moving dbs
$dropList = array( 'civicrm_domain_after_update',
                   'civicrm_preferences_after_update',
                   'civicrm_preferences_date_after_update',
                   'civicrm_option_value_after_update',
                   'civicrm_option_value_after_insert',
                   'civicrm_uf_match_after_update',
                   'civicrm_uf_match_after_insert',
                   );
foreach ( $dropList as $triggerName ) {
    CRM_Core_DAO::executeQuery("DROP TRIGGER IF EXISTS $triggerName");
}

//set logging value in config and settings
require_once "CRM/Core/BAO/Setting.php";
$config->logging = 0;
$params = array('logging' => 0);
CRM_Core_BAO_Setting::add($params);

echo "Disable Logging...\n";
require_once 'CRM/Logging/Schema.php';
$logging = new CRM_Logging_Schema;
$logging->disableLogging();

//CRM_Core_Error::debug('logging',$logging);

//TODO: make sure the triggerRebuild picks up the hook triggers when they are not in schema info
echo "Rebuild Triggers...\n";
CRM_Core_DAO::triggerRebuild( );
