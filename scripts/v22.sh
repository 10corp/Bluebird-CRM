#!/bin/sh
#
# v22.sh
#
# Project: BluebirdCRM
# Authors: Brian Shaughnessy and Ken Zalewski
# Organization: New York State Senate
# Date: 2018-05-15
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

## 8034
echo "$prog: alter activity assignment email subject"
sql="
  UPDATE civicrm_msg_template
  SET msg_subject = '[Bluebird] Constituent Activity: {contact.display_name}'
  WHERE msg_title = 'Cases - Send Copy of an Activity';
"
$execSql $instance -c "$sql" -q

## 7362
echo "$prog: install activity extension"
$drush $instance cvapi extension.install key=gov.nysenate.activity --quiet

## record completion
echo "$prog: upgrade process is complete."
