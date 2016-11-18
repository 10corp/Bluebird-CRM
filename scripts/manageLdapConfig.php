<?php
// Project: BluebirdCRM
// Author: Ken Zalewski
// Organization: New York State Senate
// Date: 2010-12-02
// Revised: 2013-06-21
// Revised: 2014-07-23 - migrated from PHP mysql interface to PDO
//

require_once 'common_funcs.php';

define('SERVER_ID', 'nyss_ldap');


function getVariableValue($dbh, $name)
{
  $sql = "SELECT value FROM variable WHERE name='$name';";
  $stmt = $dbh->query($sql);
  if (!$stmt) {
    print_r($dbh->errorInfo());
    return false;
  }
  else {
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $val = unserialize($row['value']);
    $stmt = null;
    return $val;
  }
} // getVariableValue()



function getLdapAuthentication($dbh)
{
  return getVariableValue($dbh, 'ldap_authentication_conf');
} // getLdapAuthentication()



function listFields($dbh, $table, $colnames = '*')
{
  $sql = "SELECT $colnames FROM $table WHERE sid='".SERVER_ID."';";
  $stmt = $dbh->query($sql);
  if (!$stmt) {
    print_r($dbh->errorInfo());
    return false;
  }
  else {
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
      foreach ($row as $fldname => $fldval) {
        $val = @unserialize($fldval);
        if ($val === false) {
          echo $fldname.': '.$fldval."\n";
        }
        else {
          echo $fldname.": ".print_r($val, true)."\n";
        }
      }
    }
  }
  $stmt = null;
  return true;
} // listFields()



function listLdapServer($dbh, $colnames = '*')
{
  echo "=== LDAP Server Info ===\n";
  return listFields($dbh, 'ldap_servers', $colnames);
} // listLdapServer()



function listLdapAuthentication($dbh)
{
  echo "=== LDAP Authentication Info ===\n";
  $val = getLdapAuthentication($dbh);
  if ($val !== false) {
    print_r($val);
    return true;
  }
  else {
    return false;
  }
} // listLdapAuthentication()



function listLdapAuthorization($dbh, $colnames = '*')
{
  echo "=== LDAP Authorization Info ===\n";
  return listFields($dbh, 'ldap_authorization', $colnames);
} // listLdapAuthorization()



function setVariableValue($dbh, $name, $val)
{
  $sval = serialize($val);
  $qval = $dbh->quote($sval);
  $sql = "UPDATE variable SET value=$qval WHERE name='$name';";
  $result = $dbh->exec($sql);
  if (!$result) {
    print_r($dbh->errorInfo());
    return false;
  }
  else {
    return true;
  }
} // setVariableValue()



function storeLdapAuthentication($dbh, $val)
{
  return setVariableValue($dbh, 'ldap_authentication_conf', $val);
} // storeLdapAuthentication()



function setAuthenticationField($dbh, $fldname, $fldval)
{
  $authConfig = getLdapAuthentication($dbh);
  if (isset($authConfig[$fldname])) {
    $authConfig[$fldname] = $fldval;
    return storeLdapAuthentication($dbh, $authConfig);
  }
  else {
    echo "Field [$fldname] does not exist in the LDAP authentication config\n";
    return false;
  }
} // setAuthenticationField()



function setField($dbh, $tabname, $fldname, $fldval)
{
  $sql = "UPDATE $tabname SET $fldname = '$fldval' where sid='".SERVER_ID."';";
  $result = $dbh->exec($sql);
  if (!$result) {
    print_r($dbh->errorInfo());
    return false;
  }
  else {
    return true;
  }
} // setField()



function setServerField($dbh, $fldname, $fldval)
{
  return setField($dbh, 'ldap_servers', $fldname, $fldval);
} // setServerField()



function setAuthorizationField($dbh, $fldname, $fldval)
{
  return setField($dbh, 'ldap_authorization', $fldname, $fldval);
} // setAuthorizationField()



function setEntries($dbh, $entries)
{
  $entries = preg_replace('/[ ]*(,[ ]*)+/', "\n", $entries);
  return setAuthorizationField($dbh, 'derive_from_entry_entries', $entries);
} // setEntries()



function setMappings($dbh, $mappings)
{
  $mappings = preg_replace('/[ ]*(,[ ]*)+/', "\n", $mappings);
  return setAuthorizationField($dbh, 'mappings', $mappings);
} // setMappings()



function setPhpAuth($dbh, $codeText)
{
  return setAuthenticationField($dbh, 'allowTestPhp', $codeText);
} // setPhpAuth()


/***************************************************************************
** Main program
***************************************************************************/

$prog = basename($argv[0]);

if ($argc != 3 && $argc != 4) {
  echo "Usage: $prog instance cmd [param]\n".
       "   cmd can be:\n".
       "      listAll, listEntries, listMappings,\n".
       "      listServer, listAuthentication, listAuthorization,\n".
       "      setName, setHost, setPort,\n".
       "      setEntries, setMappings, setPhpAuth\n";
  exit(1);
}
else {
  $instance = $argv[1];
  $cmd = $argv[2];
  $param  = ($argc > 3) ? $argv[3] : "";

  $bootstrap = bootstrap_script($prog, $instance, DB_TYPE_DRUPAL);
  if ($bootstrap == null) {
    echo "$prog: Unable to bootstrap this script; exiting\n";
    exit(1);
  }

  $dbh = $bootstrap['dbrefs'][DB_TYPE_DRUPAL];

  $rc = true;

  if ($cmd == 'listAll') {
    $rc = listLdapServer($dbh);
    echo "\n";
    $rc = listLdapAuthentication($dbh) && $rc;
    echo "\n";
    $rc = listLdapAuthorization($dbh) && $rc;
  }
  else if ($cmd == 'listServer') {
    $rc = listLdapServer($dbh);
  }
  else if ($cmd == 'listAuthentication') {
    $rc = listLdapAuthentication($dbh);
  }
  else if ($cmd == 'listAuthorization') {
    $rc = listLdapAuthorization($dbh);
  }
  else if ($cmd == 'listEntries') {
    $rc = listLdapAuthorization($dbh, 'derive_from_entry_entries');
  }
  else if ($cmd == 'listMappings') {
    $rc = listLdapAuthorization($dbh, 'mappings');
  }
  else if ($cmd == 'setName') {
    $rc = setServerField($dbh, 'name', $param);
  }
  else if ($cmd == 'setHost') {
    $rc = setServerField($dbh, 'address', $param);
  }
  else if ($cmd == 'setPort') {
    $rc = setServerField($dbh, 'port', $param);
  }
  else if ($cmd == 'setEntries') {
    $rc = setEntries($dbh, $param);
  }
  else if ($cmd == 'setMappings') {
    $rc = setMappings($dbh, $param);
  }
  else if ($cmd == 'setPhpAuth') {
    $rc = setPhpAuth($dbh, $param);
  }
  else {
    echo "$prog: $cmd: Unknown command\n";
    $rc = false;
  }

  $dbh = null;

  if ($rc) {
    echo "Operation was successful.\n";
    exit(0);
  }
  else {
    echo "Operation failed.\n";
    exit(1);
  }
}
?>
