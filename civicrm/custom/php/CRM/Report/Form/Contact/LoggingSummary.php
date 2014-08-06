<?php
/*
 +--------------------------------------------------------------------+
 | CiviCRM version 4.4                                                |
 +--------------------------------------------------------------------+
 | Copyright CiviCRM LLC (c) 2004-2013                                |
 +--------------------------------------------------------------------+
 | This file is a part of CiviCRM.                                    |
 |                                                                    |
 | CiviCRM is free software; you can copy, modify, and distribute it  |
 | under the terms of the GNU Affero General Public License           |
 | Version 3, 19 November 2007 and the CiviCRM Licensing Exception.   |
 |                                                                    |
 | CiviCRM is distributed in the hope that it will be useful, but     |
 | WITHOUT ANY WARRANTY; without even the implied warranty of         |
 | MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.               |
 | See the GNU Affero General Public License for more details.        |
 |                                                                    |
 | You should have received a copy of the GNU Affero General Public   |
 | License and the CiviCRM Licensing Exception along                  |
 | with this program; if not, contact CiviCRM LLC                     |
 | at info[AT]civicrm[DOT]org. If you have questions about the        |
 | GNU Affero General Public License or the licensing of CiviCRM,     |
 | see the CiviCRM license FAQ at http://civicrm.org/licensing        |
 +--------------------------------------------------------------------+
*/

/**
 *
 * @package CRM
 * @copyright CiviCRM LLC (c) 2004-2013
 * $Id$
 *
 */

require_once 'api/api.php'; //NYSS

class CRM_Report_Form_Contact_LoggingSummary extends CRM_Logging_ReportSummary {
  function __construct() {
    parent::__construct();

    /* NYSS 7893 log type translations from table names are not necessary anymore */
    /*$logTypes = array();
    foreach ( array_keys($this->_logTables) as  $table ) {
      $type = $this->getLogType($table);
      $logTypes[$type] = $type;
    }
    asort($logTypes);*/
    $logTypes = array('Contact','Group','Activity','Relationship','Tag','Case','Note','Comment');

    /* NYSS 7893 column definitions changed to match new summary table nyss_changelog_summary */
    $this->_columns = array(
      'log_civicrm_entity' => array(
        'dao' => 'CRM_Contact_DAO_Contact',
        'alias' => 'entity_log',
        'fields' => array(
          'log_change_seq' => array(
            'no_display' => TRUE,
            'required' => TRUE,
          ),
          'log_conn_id' => array(
            'no_display' => TRUE,
            'required' => TRUE,
          ),
          'log_action' => array(
            'dbAlias' => 'log_action_label',
            'default' => TRUE,
            'title' => ts('Action'),
          ),
          'log_type_label' => array(
            'required' => TRUE,
            'title' => ts('Log Type'),
          ),
          'log_user_id' => array(
            'no_display' => TRUE,
            'required' => TRUE,
          ),
          'log_date' => array(
            'default' => TRUE,
            'required' => TRUE,
            'type' => CRM_Utils_Type::T_TIME,
            'title' => ts('When'),
          ),
          'log_entity_info' => array(
            'no_display' => TRUE,
            'required' => TRUE,
          ),
          'altered_contact_id' => array(
            'no_display' => TRUE,
            'required' => TRUE,
          ),
          'altered_contact' => array(
            'default' => TRUE,
            'name' => 'display_name',
            'title' => ts('Altered Contact'),
            'alias' => 'modified_contact_civireport',
          ),
          //NYSS 3461
          'altered_contact_sort_name' => array(
            'required' => TRUE,
            'name' => 'sort_name',
            'no_display' => TRUE,
            'alias' => 'modified_contact_civireport',
          ),
          'is_deleted' => array(
            'no_display' => TRUE,
            'required' => TRUE,
            'alias' => 'modified_contact_civireport',
          ),
        ),
        'filters' => array(
          'log_date' => array(
            'title' => ts('When'),
            'operatorType' => CRM_Report_Form::OP_DATE,
            'type' => CRM_Utils_Type::T_DATE,
          ),
          'altered_contact' => array(
            'name' => 'display_name',
            'title' => ts('Altered Contact'),
            'type' => CRM_Utils_Type::T_STRING,
            'alias' => 'modified_contact_civireport',
          ),
          'altered_contact_id' => array(
            'name' => 'id',
            'type' => CRM_Utils_Type::T_INT,
            'alias' => 'modified_contact_civireport',
            'no_display' => TRUE,
          ),
          'log_type_label' => array(
            'operatorType' => CRM_Report_Form::OP_MULTISELECT,
            'options' => $logTypes,
            'title' => ts('Log Type'),
            'type' => CRM_Utils_Type::T_STRING,
          ),
          'log_action_label' => array(
            'operatorType' => CRM_Report_Form::OP_MULTISELECT,
            'options' => array(
                                'Insert'  => ts('Insert'), 
                                'Update'  => ts('Update'), 
                                'Delete'  => ts('Delete'),
                                'Added'   => ts('Added'),
                                'Removed' => ts('Removed')),
            'title' => ts('Action'),
            'type' => CRM_Utils_Type::T_STRING,
          ),
        ),
        //NYSS 3461
        'order_bys'  =>
        array(
          'log_civicrm_entity_altered_contact_sort_name' =>
          array(
            'title' => ts('Altered Contact'),
            'name' => 'sort_name',
            'alias' => 'modified_contact_civireport',
          ),
          'log_civicrm_entity_log_date' =>
          array(
            'title' => ts('Log Date'),
          ),
        ),
      ),
      'altered_by_contact' => array(
        'dao' => 'CRM_Contact_DAO_Contact',
        'alias' => 'altered_by_contact',
        'fields' => array(
          'display_name' => array(
            'default' => TRUE,
            'name' => 'display_name',
            'title' => ts('Altered By'),
          ),
        ),
        'filters' => array(
          'display_name' => array(
            'name' => 'display_name',
            'title' => ts('Altered By'),
            'type' => CRM_Utils_Type::T_STRING,
          ),
        ),
      ),
    );
  }

  function alterDisplay(&$rows) {
    // cache for id → is_deleted mapping
    $isDeleted = array();
    $newRows = array();

    foreach ($rows as $key => &$row) {
      /* is_deleted should be passed in the row info.  If not, look it up */
      $this_alt_id = $row['log_civicrm_entity_altered_contact_id'];
      if (!array_key_exists('log_civicrm_entity_is_deleted',$row)) {
        $row['log_civicrm_entity_is_deleted'] = 
            CRM_Core_DAO::getFieldValue('CRM_Contact_DAO_Contact', $this_alt_id, 'is_deleted') !== '0';
      }
      $isDeleted[$this_alt_id] = $row['log_civicrm_entity_is_deleted'];

      /* if the contact is not deleted, and is populated, set links for the altered contact and check for bracket info */
      if (CRM_Utils_Array::value('log_civicrm_entity_altered_contact', $row) && !$isDeleted[$this_alt_id]) {
        $row['log_civicrm_entity_altered_contact_link'] =
          CRM_Utils_System::url('civicrm/contact/view', 'reset=1&cid=' . $this_alt_id);
        $row['log_civicrm_entity_altered_contact_hover'] = ts("Go to contact summary");
        /* NYSS 7893 changed getEntityValue to use pre-populated log_entity_info */
        //$entity = $this->getEntityValue($row['log_civicrm_entity_log_change_seq'], $row['log_civicrm_entity_log_date']);
        $entity = CRM_Utils_Array::value('log_civicrm_entity_log_entity_info', $row, '');
        if ($entity) {
          $row['log_civicrm_entity_altered_contact'] .= " [{$entity}]";
        }
      }
      $row['altered_by_contact_display_name_link'] = CRM_Utils_System::url('civicrm/contact/view', 'reset=1&cid=' . $row['log_civicrm_entity_log_user_id']);
      $row['altered_by_contact_display_name_hover'] = ts("Go to contact summary");

      /* if the contact is marked as "Trashed", update the action label to reflect that status */
      if ($row['log_civicrm_entity_is_deleted'] and 'Update' == CRM_Utils_Array::value('log_civicrm_entity_log_action', $row)) {
        $row['log_civicrm_entity_log_action'] = ts('Delete (to trash)');
      }

      /* If the row is in the "Contact" group, and is an insert, make it say "Update" instead */
      /* commented out so that inserting a new contact appears as an insert
          leave this here for now...this may have been important for other types of contact updates */
      /*if ('Contact' == $row['log_civicrm_entity_log_type_label'] &&
          CRM_Utils_Array::value('log_civicrm_entity_log_action', $row) == 'Insert' ) {
        $row['log_civicrm_entity_log_action'] = ts('Update');
      }*/

      /* format the date for proper display */
      $date = CRM_Utils_Date::isoToMysql($row['log_civicrm_entity_log_date']);

      /* if this row is an "Update" action, inject the links and hover functionality */
      if ('Update' == CRM_Utils_Array::value('log_civicrm_entity_log_action', $row)) {
        $q = "reset=1&log_conn_id={$row['log_civicrm_entity_log_conn_id']}&log_date=". $date;
        if ($this->cid) {
          $q .= '&cid=' . $this->cid;
        }

        //NYSS append instance id so we return properly
        $q .= '&instanceID='.$this->_id;

        //NYSS 7543 append altered contact and altered by name
        $q .= (!empty($row['log_civicrm_entity_altered_contact'])) ?
          '&alteredName='.$row['log_civicrm_entity_altered_contact'] :
          '';
        $q .= (!empty($row['altered_by_contact_display_name'])) ?
          '&alteredBy='.$row['altered_by_contact_display_name'] :
          '';
        $q .= (!empty($row['log_civicrm_entity_log_user_id'])) ?
          '&alteredById='.$row['log_civicrm_entity_log_user_id'] :
          '';

        $url1 = CRM_Report_Utils_Report::getNextUrl('logging/contact/detail', "{$q}&snippet=4&section=2&layout=overlay", FALSE, TRUE);
        $url2 = CRM_Report_Utils_Report::getNextUrl('logging/contact/detail', "{$q}&section=2", FALSE, TRUE);
        $row['log_civicrm_entity_log_action'] = "<a href='{$url1}' class='crm-summary-link'><div class='icon details-icon'></div></a>&nbsp;<a title='View details for this update' href='{$url2}'>" . ts('Update') . '</a>';
      }

      if ( $this->_showDetails ) {
        //$cid = $row['log_civicrm_entity_altered_contact_id'];
        $row['show_details'] = self::getContactDetails($this_alt_id);
      }

      /* NYSS 7893 we can now identify a unique by change_seq alone.  date left in for ordering */
      $key = $row['log_civicrm_entity_log_date'] . '_' . 
             $row['log_civicrm_entity_log_change_seq'];
      $newRows[$key] = $row;

      //unset($row['log_civicrm_entity_log_user_id']);
      //unset($row['log_civicrm_entity_log_conn_id']);
    }

    //NYSS 7452 reorder unless flagged not to
    if ( !$this->_formOrderBy ) {
      krsort($newRows);
    }
    $rows = $newRows;
  }

  function select() {
    //NYSS get log details param and unset column
    $cols   =& $this->_columns;
    //CRM_Core_Error::debug_var('cols', $cols);

    $params = $this->_submitValues;
    //CRM_Core_Error::debug_var('params', $params);

    if ( isset($cols['log_civicrm_entity']['fields']['log_details']) &&
         $params['fields']['log_details'] ) {
      $this->_showDetails = 1;
      unset($cols['log_civicrm_entity']['fields']['log_details']);
    }

    parent::select();
  }

  function from() {
    // NYSS 7893 changed to reflect new single-select table with JOINs for contact names
    $this->_from = "FROM nyss_changelog_summary entity_log_civireport " .
                   "INNER JOIN civicrm_contact as modified_contact_civireport ON " .
                   "entity_log_civireport.altered_contact_id = modified_contact_civireport.id " .
                   "LEFT JOIN civicrm_contact as altered_by_contact_civireport " .
                   "ON entity_log_civireport.log_user_id = altered_by_contact_civireport.id ";
  }

  //NYSS 4198 calculate distinct contacts
  function statistics( &$rows ) {
    $distinctContacts = array();
    foreach ( $rows as $row ) {
      $distinctContacts[$row['log_civicrm_entity_altered_contact_id']] = 1;
    }
    $statistics = parent::statistics( $rows );
    $statistics['counts']['rowsFound'] = array(
      'title' => ts('Contact(s) Changed'),
      'value' => count($distinctContacts),
    );
    return $statistics;
  }

  function groupBy() {
    //NYSS 5751
    // ported from previous ReportSummary override, 
    //NYSS 7893 grouping changed to reflect new single-select table and new sequence generator
    $this->_groupBy = "";
  }

  function getContactDetails( $cid ) {
    $left = $middle = $right = array();
    $leftList = $middleList = $addressList = '';

    $IMProvider = CRM_Core_PseudoConstant::get('CRM_Core_DAO_IM', 'provider_id');

    $params = array(
      'version' => 3,
      'id' => $cid,
    );
    $contact = civicrm_api( 'contact', 'getsingle', $params );
    //CRM_Core_Error::debug('contact',$contact);

    $left['nick_name'] = "{$contact['nick_name']} (nickname)";
    $left['gender'] = "{$contact['gender']} (gender)";
    $left['job_title'] = "{$contact['job_title']} (job title)";
    $left['birth_date'] = "{$contact['birth_date']} (birthday)";

    $middle['phone'] = "{$contact['phone']} (phone)";
    $middle['email'] = "{$contact['email']} (email)";
    $middle['im'] = "{$contact['im']} ({$IMProvider[$contact['provider_id']]})";

    $address['street1'] = $contact['street_address'];
    $address['street2'] = $contact['supplemental_address_1'];
    $address['street3'] = $contact['supplemental_address_2'];
    $address['city'] = $contact['city'];
    $address['state'] = $contact['state_province'];
    $address['zip'] = $contact['postal_code'];

    //check against contact and remove if empty
    foreach ( $left as $f => $v ) {
      if ( empty($contact[$f]) ) {
        unset($left[$f]);
      }
    }
    foreach ( $middle as $f => $v ) {
      if ( empty($contact[$f]) ) {
        unset($middle[$f]);
      }
    }
    $address = array_filter($address);

    if ( !empty($left) ) {
      $leftList  = "<div class='logLeftList'><ul><li>";
      $leftList .= implode("</li>\n<li>", $left);
      $leftList .= '</li></ul></div>';
    }
    if ( !empty($middle) ) {
      $middleList  = "<div class='logMiddleList'><ul><li>";
      $middleList .= implode("</li>\n<li>", $middle);
      $middleList .= '</li></ul></div>';
    }

    if ( !empty($address) ) {
      $addressList  = "<div class='logRightList'><ul><li>";
      $addressList .= ( $address['street3'] ) ? "{$address['street3']}<br />" : '';
      $addressList .= ( $address['street1'] ) ? "{$address['street1']}<br />" : '';
      $addressList .= ( $address['street2'] ) ? "{$address['street2']}<br />" : '';
      $addressList .= "{$address['city']}, {$address['state']} {$address['zip']}";
      $addressList .= '</li></ul></div>';
    }

    $html = $leftList.$middleList.$addressList;
    //CRM_Core_Error::debug_var('html',$html);

    return $html;
  }

  function postProcess() {
    // NYSS #7893 changes in this method supercede previous override for CRM_Logging_ReportSummary
    // override CRM_Logging_ReportSummary was dropped with NYSS #7893

    $this->beginPostProcess();
    $rows = array();

    // note the group by columns are same as that used in alterDisplay as $newRows - $key
    $this->select();
    $this->from();
    $this->where();
    $this->groupBy();
    $this->limit();
    $sql = "{$this->_select} " .
           "{$this->_from} " .
           "{$this->_where} " .
           "{$this->_groupBy} " .
           "ORDER BY log_civicrm_entity_log_date DESC " .
           "{$this->_limit}";
    $this->buildRows($sql, $rows);
    // format result set.
    $this->formatDisplay($rows);

    // assign variables to templates
    $this->doTemplateAssignment($rows);

    // do print / pdf / instance stuff if needed
    $this->endPostProcess($rows);
  }
}
