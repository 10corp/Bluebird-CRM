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

//drop civi triggers
$bbconfig = get_bluebird_instance_config();
$dropCiviTriggers = $bbconfig['app.rootdir'].'/scripts/dropCiviTriggers.sh '.$bbconfig['shortname'];
shell_exec( $dropCiviTriggers );

echo "Disable Logging...\n";
require_once 'CRM/Logging/Schema.php';
$logging = new CRM_Logging_Schema;
$logging->disableLogging();
//CRM_Core_Error::debug('logging',$logging);

//triggerRebuild picks up the hook triggers when they are not in schema info
echo "Rebuild Triggers...\n";
Civi::service('sql_triggers')->rebuild(NULL, TRUE);
