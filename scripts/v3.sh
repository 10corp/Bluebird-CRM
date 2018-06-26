#!/bin/sh
#
# v3.sh
#
# Project: BluebirdCRM
# Authors: Brian Shaughnessy and Ken Zalewski
# Organization: New York State Senate
# Date: 2018-06-26
#

prog=`basename $0`
script_dir=`dirname $0`
execSql=$script_dir/execSql.sh
drush=$script_dir/drush.sh
readConfig=$script_dir/readConfig.sh

. $script_dir/defaults.sh

if [ $# -ne 1 ]; then
  echo "Usage: $prog instanceName" >&2
  exit 1
fi

instance="$1"

if ! $readConfig --instance $instance --quiet; then
  echo "$prog: $instance: Instance not found in config file" >&2
  exit 1
fi

## set new default theme
echo "set default theme to Seven..."
$drush $instance pm-enable seven -y
$drush $instance vset theme_default seven -y
$drush $instance vset admin_theme seven -y

## enable menu/admin modules
echo "enable menu/admin modules..."
$drush $instance pm-enable admin_menu -y
$drush $instance pm-enable adminimal_admin_menu -y
$drush $instance pm-enable module_filter -y

## install navigation extension
echo "$prog: install navigation extension"
$drush $instance cvapi extension.install key=gov.nysenate.navigation --quiet

## record completion
echo "$prog: upgrade process is complete."
