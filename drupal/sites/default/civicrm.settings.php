<?php
# civicrm.settings.php - CiviCRM configuration file
#
# Project: BluebirdCRM
# Author: Ken Zalewski
# Organization: New York State Senate
# Date: 2010-09-10
# Revised: 2011-06-06
#
# This customized civicrm.settings.php file takes advantage of the strict
# CRM hostname naming scheme that we have developed.  Each CRM instance is
# of the form <instanceName>.crm.nysenate.gov.  The <instanceName> maps
# indirectly to the databases that are used for that instance via the
# Bluebird configuration file.
#


require_once dirname(__FILE__).'/../../../civicrm/scripts/bluebird_config.php';

$bbconfig = get_bluebird_instance_config();

if ($bbconfig == null) {
  die("Unable to properly bootstrap the CiviCRM module.\n");
}

if ( $bbconfig['install_class'] == 'dev' ) {
  //define('CIVICRM_DEBUG_LOG_QUERY', TRUE);
}

define('CIVICRM_UF', 'Drupal');
define('CIVICRM_DSN', $bbconfig['civicrm_db_url'].'?new_link=true');
define('CIVICRM_UF_DSN', $bbconfig['drupal_db_url'].'?new_link=true');
define('CIVICRM_LOGGING_DSN', $bbconfig['log_db_url'].'?new_link=true');

global $civicrm_root;

$civicrm_root = $bbconfig['drupal.rootdir'].'/sites/all/modules/civicrm';
define('CIVICRM_TEMPLATE_COMPILEDIR', $bbconfig['data.rootdir'].'/'.$bbconfig['data_dirname'].'/civicrm/templates_c');
define('CIVICRM_UF_BASEURL', 'http://'.$bbconfig['servername'].'/');
define('CIVICRM_SITE_KEY', get_config_value($bbconfig, 'site.key', '32425kj24h5kjh24542kjh524'));

//define('CIVICRM_MULTISITE', null);
//define('CIVICRM_UNIQ_EMAIL_PER_SITE', null);
define('CIVICRM_DOMAIN_ID', 1);
define('CIVICRM_DOMAIN_GROUP_ID', null);
define('CIVICRM_DOMAIN_ORG_ID', null);
define('CIVICRM_EVENT_PRICE_SET_DOMAIN_ID', 0 );

//define('CIVICRM_ACTIVITY_ASSIGNEE_MAIL' , 1 );
define('CIVICRM_CONTACT_AJAX_CHECK_SIMILAR' , 0 );
define('CIVICRM_PROFILE_DOUBLE_OPTIN', 1 );
define('CIVICRM_TRACK_CIVIMAIL_REPLIES', false);
// define( 'CIVICRM_MAIL_LOG', '%%templateCompileDir%%/mail.log' );
define('CIVICRM_TAG_UNCONFIRMED', 'Unconfirmed');
define('CIVICRM_PETITION_CONTACTS','Petition Contacts');
define('CIVICRM_CIVIMAIL_WORKFLOW', 1 );

// Cache-related constants
define('CIVICRM_DB_CACHE_CLASS', get_config_value($bbconfig, 'cache.db.class', null));
define('CIVICRM_MEMCACHE_TIMEOUT', get_config_value($bbconfig, 'cache.memcache.timeout', 600));
define('CIVICRM_MEMCACHE_PREFIX', $bbconfig['servername']);

// SAGE API constants
define('SAGE_API_KEY', $bbconfig['sage.api.key']);
define('SAGE_API_BASE', $bbconfig['sage.api.base']);

// Set some CiviCRM settings
global $civicrm_setting;

$civicrm_setting['Mailing Preferences']['profile_double_optin'] = FALSE;
$civicrm_setting['Mailing Preferences']['profile_add_to_group_double_optin'] = FALSE;
$civicrm_setting['Mailing Preferences']['track_civimail_replies'] = FALSE;
$civicrm_setting['Mailing Preferences']['civimail_workflow'] = TRUE;
$civicrm_setting['Mailing Preferences']['civimail_server_wide_lock'] = TRUE;
$civicrm_setting['Mailing Preferences']['civimail_multiple_bulk_emails'] = TRUE;
$civicrm_setting['Mailing Preferences']['include_message_id'] = TRUE;
$civicrm_setting['Mailing Preferences']['write_activity_record'] = FALSE;
$civicrm_setting['Mailing Preferences']['disable_mandatory_tokens_check'] = TRUE;
$civicrm_setting['Mailing Preferences']['hash_mailing_url'] = TRUE;

$civicrm_setting['CiviCRM Preferences']['securityAlert'] = FALSE;
$civicrm_setting['CiviCRM Preferences']['enable_innodb_fts'] = TRUE;
$civicrm_setting['Search Preferences']['fts_query_mode'] = 'wildwords-suffix';

if (isset($bbconfig['xhprof.profile']) && $bbconfig['xhprof.profile']) {
  function xhprof_shutdown_func($source, $run_id=NULL) {
    // Hopefully we don't throw an exception; there's no way to catch it now...
    $xhprof_data = xhprof_disable();

    // Check to see if the custom/civicrm/php path has been added to the path
    if (!stream_resolve_include_path("xhprof_lib/utils/xhprof_runs.php")) {
      return; // Can't do anything without this...
    }

    require_once "xhprof_lib/utils/xhprof_runs.php";

    // Save the run under a namespace "bluebird" with an autogenerated uid.
    // uid can also be supplied as a third optional parameter to save_run
    $xhprof_runs = new XHProfRuns_Default();

    // In case no run_id was passed in, set it now from the return value
    $run_id = $xhprof_runs->save_run($xhprof_data, $source, $run_id);

    //TODO: Make some sort of link to the profile output.
  }

  // Build the profiling flags based on configuration parameters
  $flags = 0;
  if (isset($bbconfig['xhprof.memory']) && $bbconfig['xhprof.memory']) {
    $flags += XHPROF_FLAGS_MEMORY;
  }
  if (isset($bbconfig['xhprof.cpu']) && $bbconfig['xhprof.cpu']) {
    $flags += XHPROF_FLAGS_CPU;
  }
  if (!isset($bbconfig['xhprof.builtins']) || !$bbconfig['xhprof.builtins']) {
    $flags += XHPROF_FLAGS_NO_BUILTINS;
  }

  // Build the ignore list based on configuration parameters
  $ignored_functions = array();
  if (isset($bbconfig['xhprof.ignore']) && $bbconfig['xhprof.ignore']) {
    $ignored_functions = $bbconfig['xhprof.ignore'];
  }

  xhprof_enable($flags, array('ignored_functions' => $ignored_functions));
  register_shutdown_function('xhprof_shutdown_func', "{$bbconfig['install_class']}_{$bbconfig['shortname']}", NULL);
}


/**
 *
 * Do not change anything below this line. Keep as is
 *
 */

$include_path = '.'.PATH_SEPARATOR.$civicrm_root.PATH_SEPARATOR.
                $civicrm_root.DIRECTORY_SEPARATOR.'packages'.PATH_SEPARATOR.
                get_include_path( );
set_include_path($include_path);

if (function_exists('variable_get') && variable_get('clean_url', '0') != '0') {
    define('CIVICRM_CLEANURL', 1);
} else {
    define('CIVICRM_CLEANURL', 0);
}

// force PHP to auto-detect Mac line endings
ini_set('auto_detect_line_endings', '1');

// make sure the memory_limit is at least 64 MB
$memLimitString = trim(ini_get('memory_limit'));
$memLimitUnit   = strtolower(substr($memLimitString, -1));
$memLimit       = (int) $memLimitString;
switch ($memLimitUnit) {
    case 'g': $memLimit *= 1024;
    case 'm': $memLimit *= 1024;
    case 'k': $memLimit *= 1024;
}
if ($memLimit >= 0 and $memLimit < 67108864) {
    ini_set('memory_limit', '1000M');
}

require_once 'CRM/Core/ClassLoader.php';
CRM_Core_ClassLoader::singleton()->register();
