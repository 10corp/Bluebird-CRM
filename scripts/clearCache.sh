#!/bin/sh
#
# clearCache.sh
#
# Project: BluebirdCRM
# Author: Ken Zalewski
# Organization: New York State Senate
# Date: 2010-09-15
# Revised: 2011-12-20
# Revised: 2013-05-14 - reorder drush commands; added more Drupal cache tables
# Revised: 2013-07-11 - modularize functionality; fix permissions problem
#

prog=`basename $0`
script_dir=`dirname $0`
execSql=$script_dir/execSql.sh
readConfig=$script_dir/readConfig.sh
drush=$script_dir/drush.sh
clear_all=0
dbcache_only=0
drush_only=0
tmp_only=0
tpl_only=0
wd_only=0

. $script_dir/defaults.sh

clear_civicrm_caches() {
  inst="$1"
  echo "Clearing CiviCRM database caches and navigation"
  sql="
    TRUNCATE civicrm_acl_cache;
    TRUNCATE civicrm_acl_contact_cache;
    TRUNCATE civicrm_cache;
    TRUNCATE civicrm_group_contact_cache;
    TRUNCATE civicrm_menu;
    DROP TABLE IF EXISTS civicrm_task_action_temp;
    UPDATE civicrm_setting SET value=null WHERE name='navigation';
  "
  $execSql -i $inst -c "$sql"
}


clear_civicrm_dashboard() {
  inst="$1"
  echo "Clearing dashboard content"
  sql="UPDATE civicrm_dashboard_contact SET content=null;"
  $execSql -i $inst -c "$sql"
}


clear_civicrm_log() {
  inst="$1"
  echo "Clearing CiviCRM log table"
  sql="TRUNCATE civicrm_log;"
  $execSql -i $inst -c "$sql"
}


clear_drupal_caches() {
  inst="$1"
  echo "Clearing Drupal database caches"
# It seems that cache, cache_bootstrap, cache_field, cache_menu are most used.
  sql="
    TRUNCATE cache;
    TRUNCATE cache_apachesolr;
    TRUNCATE cache_block;
    TRUNCATE cache_bootstrap;
    TRUNCATE cache_field;
    TRUNCATE cache_filter;
    TRUNCATE cache_form;
    TRUNCATE cache_menu;
    TRUNCATE cache_page;
    TRUNCATE cache_path;
    TRUNCATE cache_rules;
    TRUNCATE cache_update;
  "
  $execSql -i $inst -c "$sql" --drupal
}


clear_drupal_sessions() {
  inst="$1"
  echo "Clearing Drupal sessions"
  sql="TRUNCATE sessions;"
  $execSql -i $inst -c "$sql" --drupal
}


clear_drupal_watchdog() {
  inst="$1"
  echo "Clearing Drupal watchdog table"
  sql="TRUNCATE watchdog;"
  $execSql -i $inst -c "$sql" --drupal
}


delete_civicrm_cache_files() {
#  Note that Drush will create civicrm/templates_c/en_US if the dir does not
#  exist.  This causes a permissions problem when Drush is run as root.
#  Therefore, I now delete everything under en_US/, but not en_US/ itself.
  cividir="$1"
  echo "Clearing CiviCRM filesystem caches"
  echo "    Deleting $cividir/civicrm/templates_c/en_US/*"
  rm -rf $cividir/civicrm/templates_c/en_US/*
  echo "    Deleting $cividir/drupal/css/*"
  rm -rf $cividir/drupal/css/*
  echo "    Deleting $cividir/drupal/js/*"
  rm -rf $cividir/drupal/js/*
}


drop_temp_tables() {
  inst="$1"
  echo "Dropping CiviCRM temporary tables"
  tmptabs=`$execSql -i $inst -c "show tables like 'civicrm\_%temp\_%'"`
  if [ "$tmptabs" ]; then
    tmptabs=`echo $tmptabs | tr " " ,`
    echo "Temporary tables to drop: $tmptabs"
    $execSql -i $inst -c "drop table $tmptabs"
  else
    echo "There are no temporary tables to be dropped."
  fi
}


drush_cache_clear_civicrm() {
  inst="$1"
  echo "Running Drush cache-clear for CiviCRM"
  $drush $inst cc civicrm
}


drush_cache_clear_cssjs() {
  inst="$1"
  echo "Running Drush cache-clear for CSS/JS"
  $drush $inst cc css-js
}


usage() {
  echo "Usage: $prog [--all] [--db-caches-only] [--drush-only] [--tmp-only] [--tpl-only] [--wd-only] instanceName" >&2
}


if [ $# -lt 1 ]; then
  usage
  exit 1
fi

while [ $# -gt 0 ]; do
  case "$1" in
    --all) clear_all=1 ;;
    --db*) dbcache_only=1 ;;
    --drush*) drush_only=1 ;;
    --tmp*) tmp_only=1 ;;
    --tpl*) tpl_only=1 ;;
    --wd*) wd_only=1 ;;
    -*) echo "$prog: $1: Invalid option" >&2; usage; exit 1 ;;
    *) instance="$1" ;;
  esac
  shift
done

uniq_sum=`expr $clear_all + $drush_only + $tmp_only + $tpl_only + $wd_only`

if [ $uniq_sum -gt 1 ]; then
  echo "$prog: Cannot specify more than one of { --all --drush-only --tmp-only --tpl_only --wd_only } at the same time." >&2
  exit 1
fi

if ! $readConfig --instance $instance --quiet; then
  echo "$prog: $instance: Instance not found in config file" >&2
  exit 1
fi

data_rootdir=`$readConfig --ig $instance data.rootdir` || data_rootdir="$DEFAULT_DATA_ROOTDIR"
base_domain=`$readConfig --ig $instance base.domain` || base_domain="$DEFAULT_BASE_DOMAIN"
data_basename=`$readConfig --ig $instance data.basename` || data_basename="$instance"

if [ -z "$base_domain" ]; then
  data_dirname="$data_basename"
else
  data_dirname="$data_basename.$base_domain"
fi


if [ $dbcache_only -eq 1 ]; then
  clear_civicrm_caches $instance
  clear_drupal_caches $instance
  exit $?
elif [ $drush_only -eq 1 ]; then
  drush_cache_clear_civicrm $instance
  drush_cache_clear_cssjs $instance
  exit $?
elif [ $tmp_only -eq 1 ]; then
  drop_temp_tables $instance
  exit $?
elif [ $tpl_only -eq 1 ]; then
  delete_civicrm_cache_files $data_rootdir/$data_dirname
  exit $?
elif [ $wd_only -eq 1 ]; then
  clear_drupal_watchdog $instance
  exit $?
fi

delete_civicrm_cache_files $data_rootdir/$data_dirname
drop_temp_tables $instance
clear_civicrm_caches $instance
drush_cache_clear_civicrm $instance
drush_cache_clear_cssjs $instance
clear_drupal_caches $instance
clear_civicrm_dashboard $instance

if [ $clear_all -eq 1 ]; then
  clear_drupal_sessions $instance
  clear_drupal_watchdog $instance
fi

exit 0
