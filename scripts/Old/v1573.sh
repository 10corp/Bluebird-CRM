#!/bin/sh
#
# v1573.sh
#
# Project: BluebirdCRM
# Authors: Brian Shaughnessy and Ken Zalewski
# Organization: New York State Senate
# Date: 2015-11-10
#

prog=`basename $0`
script_dir=`dirname $0`
execSql=$script_dir/execSql.sh
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

app_rootdir=`$readConfig --ig $instance app.rootdir` || app_rootdir="$DEFAULT_APP_ROOTDIR"

echo "$prog: 9656: increase length of tag name column"
sql="ALTER TABLE civicrm_tag CHANGE name name VARCHAR(128);"
$execSql $instance -c "$sql" -q

echo "$prog: 9651: add data column to activity stream table"
sql="ALTER TABLE nyss_web_activity ADD data TEXT NULL COMMENT 'Additional details to reference the stored record.' AFTER details;"
$execSql $instance -c "$sql" -q
