#!/bin/sh
#
# fixPermissions.sh - Set Bluebird directory permissions appropriately.
#
# Project: BluebirdCRM
# Author: Ken Zalewski
# Organization: New York State Senate
# Date: 2010-09-13
# Revised: 2010-09-28
#

prog=`basename $0`
script_dir=`dirname $0`
readConfig=$script_dir/readConfig.sh

. $script_dir/defaults.sh

webdir=`$readConfig --global www.rootdir` || webdir="$DEFAULT_WWW_ROOTDIR"
owner_user=`$readConfig --global owner.user` || owner_user="$DEFAULT_OWNER_USER"
owner_group=`$readConfig --global owner.group` || owner_group="$DEFAULT_OWNER_GROUP"

if [ ! "$webdir" -o ! "$owner_user" -o ! "$owner_group" ]; then
  echo "$prog: Please set www.rootdir, owner.user, and owner.group in the Bluebird config file." >&2
  exit 1
fi

set -x
chown -R $owner_user:$owner_group $webdir/sites
chmod -R u+rw,go+r-w $webdir
chmod -R ug+rw,o-w $webdir/sites

exit 0
