<?php

/*
 +--------------------------------------------------------------------+
 | CiviCRM version 3.4                                                |
 +--------------------------------------------------------------------+
 | Copyright CiviCRM LLC (c) 2004-2011                                |
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
 * @copyright CiviCRM LLC (c) 2004-2011
 * $Id$
 *
 */

require_once 'CRM/Report/Form.php';

class CRM_Report_Form_ActivityTag extends CRM_Report_Form {
    
    protected $_emailField = false;
    protected $_phoneField = false;
    
    function __construct( ) {
        $this->_columns = array(
                                 'civicrm_tag'      =>
                                array( 'dao'     => 'CRM_Core_DAO_Tag',
                                       'fields'  =>
                                       array( 'id' => 
                                              array('required'   => true,
                                                    'no_display' => true ),
                                              'name' =>
                                              array('title'     => ts('Tag Name'),
                                                    'default'   => true,
                                                    'no_repeat' => true ) ),
                                       'group_bys' => 
                                       array( 'tag_name' =>
                                              array( 'name'     => 'id',
                                                     'title'    => ts( 'Tag' ),
                                                     'default'  => true ),
                                              ),
                                       'order_bys' =>             
                                       array( 'name'  =>
                                              array( 'title' => ts( 'Tag Name') ) ),
                                       'grouping' => 'activity-fields',
                                       ),

                                'civicrm_activity'      =>
                                array( 'dao'     => 'CRM_Activity_DAO_Activity',
                                       'fields'  =>
                                       array( 'activity_type_id'  => 
                                              array( 'title'      => ts( 'Activity Type' ),
                                                     'default'    => true ,
                                                     'type'       =>  CRM_Utils_Type::T_STRING 
                                                     ),
                                               'activity_subject'  => 
                                               array( 'title'      => ts('Subject'),
                                                      'default'    => true,
                                                      ),
                                              'id'                => 
                                              array( 'title'      => 'Total Activities',
                                                     'required'   => false,
                                                     'statistics' =>
                                                     array(
                                                           'count'  => ts( 'Activity Count' ), ), 
                                                     ),
                                              ),
                                       'filters' =>   
                                       array( 'activity_date_time'  => 
                                              array( 'operatorType' => CRM_Report_Form::OP_DATE),
                                              'activity_type_id'    => 
                                              array( 'title'        => ts( 'Activity Type' ),
                                                     'operatorType' => CRM_Report_Form::OP_MULTISELECT,
                                                     'options'      => CRM_Core_PseudoConstant::activityType(true, true, false, 'label', true), ), 
                                              'status_id'           => 
                                              array( 'title'        => ts( 'Activity Status' ),
                                                     'operatorType' => CRM_Report_Form::OP_MULTISELECT,
                                                     'options'      => CRM_Core_PseudoConstant::activityStatus(), ),
                                              'priority_id'         =>
                                              array( 'title'        => ts( 'Priority' ),
                                                     'operatorType' => CRM_Report_Form::OP_MULTISELECT,
                                                     'options'      => CRM_Core_PseudoConstant::priority(), ),
                                              ),
                                       'group_bys' =>             
                                       array( 
                                              'activity_date_time' => 
                                              array( 'title'      => ts( 'Activity Date' ),
                                                     'frequency'  => true ),
                                              'activity_type_id'   =>
                                              array( 'title'      => ts( 'Activity Type' ),
                                                     'default'    => true ),
                                              'activity_id'   =>
                                              array( 'title'      => ts( 'Activity' ),
                                                     'default'    => true ),
                                              ),
                                       'order_bys' =>             
                                       array( 'activity_date_time'  =>
                                              array( 'title' => ts( 'Activity Date' ) ),
                                              'activity_type_id'  =>
                                              array( 'title' => ts( 'Activity Type' ) )
                                              ),
                                       'grouping' => 'activity-fields',
                                       'alias'    => 'activity'
                                       
                                       ),

                                'civicrm_activity_target'      =>
                                array( 'dao'     => 'CRM_Activity_DAO_ActivityTarget',
                                       'fields'  =>
                                       array('target_contact_id'                =>
                                              array( 'title'      => 'Total Target Contacts',
                                                     'required'   => true,
                                                     'statistics' =>
                                                     array(
                                                           'count'  => ts( 'Target Count' ), ),
                                                     ),
                                              ),
                                          ),
                                
                                'civicrm_contact'      =>
                                array( 'dao'     => 'CRM_Contact_DAO_Contact',
                                       'fields'  =>
                                       array( 'id' => 
                                              array('required'   => true,
                                                    'no_display' => true ),
                                              'sort_name' => 
                                              array('title'     => ts('Contact Name'),
                                                    'default'   => true,
                                                    'no_repeat' => true ) ),
                                       'filters' =>             
                                       array( 'sort_name'    =>
                                              array('title'  => ts('Contact Name'),),
                                              ),
//                                        'group_bys' => 
//                                        array( 'sort_name' =>
//                                               array( 'name'     => 'id',
//                                                      'title'    => ts( 'Contact' ),
//                                                      'default'  => true ),
//                                               ),
                                       'order_bys' =>             
                                       array( 'sort_name'  =>
                                              array( 'title' => ts( 'Contact Name') ) ),
                                       'grouping' => 'contact-fields',
                                       ),


                                
                                'civicrm_email'         =>
                                array( 'dao'     => 'CRM_Core_DAO_Email',
                                       'fields'  =>
                                       array( 'email'   =>
                                              array( 'title'   => 'Email',
                                                     'default' => true ) ),
                                       'order_bys' =>             
                                       array( 'email'  =>
                                              array( 'title' => ts( 'Email') ) ),
                                       'grouping' => 'contact-fields',
                                       ),
                                
                                'civicrm_phone'         =>
                                array( 'dao'     => 'CRM_Core_DAO_Email',
                                       'fields'  =>
                                       array( 'phone'   => 
                                              array( 'title' => 'Phone' )),
                                       'grouping' => 'contact-fields',
                                       ),


                                  );

        //$this->_tagFilter = true;
        parent::__construct( );
    }
    
    function select( ) {
        $select = array( );
        $this->_columnHeaders = array( );
        foreach ( $this->_columns as $tableName => $table ) {
            if ( array_key_exists('group_bys', $table) ) {
                foreach ( $table['group_bys'] as $fieldName => $field ) {
                    if ( CRM_Utils_Array::value( $fieldName, $this->_params['group_bys'] ) ) {
                        
                        switch ( CRM_Utils_Array::value( $fieldName, $this->_params['group_bys_freq'] ) ) {
                        case 'YEARWEEK' :
                            $select[] = "DATE_SUB({$field['dbAlias']}, INTERVAL WEEKDAY({$field['dbAlias']}) DAY) AS {$tableName}_{$fieldName}_start";
                            
                            $select[] = "YEARWEEK({$field['dbAlias']}) AS {$tableName}_{$fieldName}_subtotal";
                            $select[] = "WEEKOFYEAR({$field['dbAlias']}) AS {$tableName}_{$fieldName}_interval";
                            $field['title'] = 'Week';
                            break;
                            
                        case 'YEAR' :
                            $select[] = "MAKEDATE(YEAR({$field['dbAlias']}), 1)  AS {$tableName}_{$fieldName}_start";
                            $select[] = "YEAR({$field['dbAlias']}) AS {$tableName}_{$fieldName}_subtotal";
                            $select[] = "YEAR({$field['dbAlias']}) AS {$tableName}_{$fieldName}_interval";
                            $field['title'] = 'Year';
                            break;
                            
                        case 'MONTH':
                            $select[] = "DATE_SUB({$field['dbAlias']}, INTERVAL (DAYOFMONTH({$field['dbAlias']})-1) DAY) as {$tableName}_{$fieldName}_start";
                            $select[] = "MONTH({$field['dbAlias']}) AS {$tableName}_{$fieldName}_subtotal";
                            $select[] = "MONTHNAME({$field['dbAlias']}) AS {$tableName}_{$fieldName}_interval";
                            $field['title'] = 'Month';
                            break;
                            
                        case 'QUARTER':
                            $select[] = "STR_TO_DATE(CONCAT( 3 * QUARTER( {$field['dbAlias']} ) -2 , '/', '1', '/', YEAR( {$field['dbAlias']} ) ), '%m/%d/%Y') AS {$tableName}_{$fieldName}_start";
                            $select[] = "QUARTER({$field['dbAlias']}) AS {$tableName}_{$fieldName}_subtotal";
                            $select[] = "QUARTER({$field['dbAlias']}) AS {$tableName}_{$fieldName}_interval";
                            $field['title'] = 'Quarter';
                            break;
                            
                        }
                        if ( CRM_Utils_Array::value( $fieldName, $this->_params['group_bys_freq'] ) ) {
                            $this->_interval = $field['title'];
                            $this->_columnHeaders["{$tableName}_{$fieldName}_start"]['title'] = 
                                $field['title'] . ' Beginning';
                            $this->_columnHeaders["{$tableName}_{$fieldName}_start"]['type']  = 
                                $field['type'];
                            $this->_columnHeaders["{$tableName}_{$fieldName}_start"]['group_by'] = 
                                $this->_params['group_bys_freq'][$fieldName];
                            
                            // just to make sure these values are transfered to rows.
                            // since we need that for calculation purpose, 
                            // e.g making subtotals look nicer or graphs
                            $this->_columnHeaders["{$tableName}_{$fieldName}_interval"] = array('no_display' => true);
                            $this->_columnHeaders["{$tableName}_{$fieldName}_subtotal"] = array('no_display' => true);
                        }
                    }
                }
            }
            if ( array_key_exists('fields', $table) ) {
                foreach ( $table['fields'] as $fieldName => $field ) {
                    if ( CRM_Utils_Array::value( 'required', $field ) ||
                         CRM_Utils_Array::value( $fieldName, $this->_params['fields'] ) ) {
                        if ( $tableName == 'civicrm_email' ) {
                            $this->_emailField = true;
                        } 
                        if ( $tableName == 'civicrm_phone' ) {
                            $this->_phoneField = true;
                        } 
                        if ( CRM_Utils_Array::value('statistics', $field) ) {
                            foreach ( $field['statistics'] as $stat => $label ) {
                                switch (strtolower($stat)) {
                                case 'count':
                                    $select[] = "COUNT(DISTINCT({$field['dbAlias']})) as {$tableName}_{$fieldName}_{$stat}";
                                    $this->_columnHeaders["{$tableName}_{$fieldName}_{$stat}"]['type'] = CRM_Utils_Type::T_INT;
                                    $this->_columnHeaders["{$tableName}_{$fieldName}_{$stat}"]['title'] = $label;
                                    $this->_statFields[] = "{$tableName}_{$fieldName}_{$stat}";
                                    break;
                                    
                                }
                            }   
                        } elseif ($fieldName == 'activity_type_id') {
                            if ( ! CRM_Utils_Array::value( 'activity_type_id', $this->_params['group_bys'] )) { 
                                $select[] = "GROUP_CONCAT(DISTINCT {$field['dbAlias']}  ORDER BY {$field['dbAlias']} ) as {$tableName}_{$fieldName}";
                            } else {
                                $select[] = "{$field['dbAlias']} as {$tableName}_{$fieldName}";
                            }
                            $this->_columnHeaders["{$tableName}_{$fieldName}"]['type']  = CRM_Utils_Array::value( 'type', $field );
                            $this->_columnHeaders["{$tableName}_{$fieldName}"]['title'] = CRM_Utils_Array::value( 'title', $field );
                            $this->_columnHeaders["{$tableName}_{$fieldName}"]['no_display'] = CRM_Utils_Array::value( 'no_display', $field );    
                        } else {
                            $select[] = "{$field['dbAlias']} as {$tableName}_{$fieldName}";
                            $this->_columnHeaders["{$tableName}_{$fieldName}"]['type']  = CRM_Utils_Array::value( 'type', $field );
                            $this->_columnHeaders["{$tableName}_{$fieldName}"]['title'] = CRM_Utils_Array::value( 'title', $field );
                            $this->_columnHeaders["{$tableName}_{$fieldName}"]['no_display'] = CRM_Utils_Array::value( 'no_display', $field );
                        }
                    }
                }
            }
        }
        
        $this->_select = "SELECT " . implode( ', ', $select ) . " ";
        
    }
    
    function from( ) {
        
        $this->_from = "
        FROM civicrm_activity {$this->_aliases['civicrm_activity']}
        
             LEFT JOIN civicrm_activity_target activity_target_civireport
                    ON {$this->_aliases['civicrm_activity']}.id = activity_target_civireport.activity_id
             LEFT JOIN civicrm_activity_assignment as activity_assignment_civireport
                    ON {$this->_aliases['civicrm_activity']}.id = activity_assignment_civireport.activity_id
             LEFT JOIN civicrm_contact {$this->_aliases['civicrm_contact']}
                    ON {$this->_aliases['civicrm_activity']}.source_contact_id = {$this->_aliases['civicrm_contact']}.id
             {$this->_aclFrom}
             LEFT JOIN civicrm_option_value 
                    ON ( {$this->_aliases['civicrm_activity']}.activity_type_id = civicrm_option_value.value )
             LEFT JOIN civicrm_option_group 
                    ON civicrm_option_group.id = civicrm_option_value.option_group_id
             LEFT JOIN civicrm_case_activity 
                    ON civicrm_case_activity.activity_id = {$this->_aliases['civicrm_activity']}.id
             LEFT JOIN civicrm_case 
                    ON civicrm_case_activity.case_id = civicrm_case.id
             LEFT JOIN civicrm_case_contact 
                    ON civicrm_case_contact.case_id = civicrm_case.id
             RIGHT JOIN civicrm_entity_tag
                    ON civicrm_entity_tag.entity_id = {$this->_aliases['civicrm_activity']}.id
                    AND civicrm_entity_tag.entity_table = 'civicrm_activity'
             LEFT JOIN civicrm_tag tag_civireport
                    ON civicrm_entity_tag.tag_id = tag_civireport.id
                    ";
        
        if ( $this->_emailField ) {
            $this->_from .= "
            LEFT JOIN civicrm_email  {$this->_aliases['civicrm_email']}
                   ON {$this->_aliases['civicrm_contact']}.id = {$this->_aliases['civicrm_email']}.contact_id AND
                     {$this->_aliases['civicrm_email']}.is_primary = 1 ";
        }
        
        if ( $this->_phoneField ) {
            $this->_from .= "
            LEFT JOIN civicrm_phone  {$this->_aliases['civicrm_phone']}
                   ON {$this->_aliases['civicrm_contact']}.id = {$this->_aliases['civicrm_phone']}.contact_id AND
                     {$this->_aliases['civicrm_phone']}.is_primary = 1 ";
        }
        
    }
    
    function where( ) {
        $this->_where = " WHERE civicrm_option_group.name = 'activity_type' AND 
                                {$this->_aliases['civicrm_activity']}.is_test = 0 AND
                                {$this->_aliases['civicrm_activity']}.is_deleted = 0 AND
                                {$this->_aliases['civicrm_activity']}.is_current_revision = 1";
        
        $clauses = array( );
        foreach ( $this->_columns as $tableName => $table ) {
            if ( array_key_exists('filters', $table) ) {
                
                foreach ( $table['filters'] as $fieldName => $field ) {
                    $clause = null;
                    if ( CRM_Utils_Array::value('type', $field) & CRM_Utils_Type::T_DATE ) {
                        $relative = CRM_Utils_Array::value( "{$fieldName}_relative", $this->_params );
                        $from     = CRM_Utils_Array::value( "{$fieldName}_from"    , $this->_params );
                        $to       = CRM_Utils_Array::value( "{$fieldName}_to"      , $this->_params );
                        
                        $clause = $this->dateClause( $field['name'], $relative, $from, $to, $field['type'] );
                    } else {
                        $op = CRM_Utils_Array::value( "{$fieldName}_op", $this->_params );
                        if ( $op ) {
                            $clause = 
                                $this->whereClause( $field,
                                                    $op,
                                                    CRM_Utils_Array::value( "{$fieldName}_value", $this->_params ),
                                                    CRM_Utils_Array::value( "{$fieldName}_min", $this->_params ),
                                                    CRM_Utils_Array::value( "{$fieldName}_max", $this->_params ) );
                        }
                    }
                    
                    if ( ! empty( $clause ) ) {
                        $clauses[] = $clause;
                    }
                }
            }
        }
        
        if ( empty( $clauses ) ) {
            $this->_where .= " ";
        } else {
            $this->_where .= " AND " . implode( ' AND ', $clauses );
        }

        if ( $this->_aclWhere ) {
            $this->_where .= " AND {$this->_aclWhere} ";
        }     
    }
    
    function groupBy( ) {
        $this->_groupBy   = array();
        if ( is_array($this->_params['group_bys']) && 
             !empty($this->_params['group_bys']) ) {
            foreach ( $this->_columns as $tableName => $table ) {
                if ( array_key_exists('group_bys', $table) ) {
                    foreach ( $table['group_bys'] as $fieldName => $field ) {
                        if ( CRM_Utils_Array::value( $fieldName, $this->_params['group_bys'] ) ) {
                            if ( CRM_Utils_Array::value( 'chart', $field ) ) {
                                $this->assign( 'chartSupported', true );
                            }
                            if ( CRM_Utils_Array::value('frequency', $table['group_bys'][$fieldName]) && 
                                 CRM_Utils_Array::value($fieldName, $this->_params['group_bys_freq']) ) {
                                
                                $append = "YEAR({$field['dbAlias']}),";
                                if ( in_array(strtolower($this->_params['group_bys_freq'][$fieldName]), 
                                              array('year')) ) {
                                    $append = '';
                                }
                                $this->_groupBy[] = "$append {$this->_params['group_bys_freq'][$fieldName]}({$field['dbAlias']})";
                                $append = true;
                            } else {
                                $this->_groupBy[] = $field['dbAlias'];
                            }
                        }
                    }
                }
            }
            
            $this->_groupBy = "GROUP BY " . implode( ', ', $this->_groupBy );            
        } else {
            $this->_groupBy = "GROUP BY tag_civireport.id ";
        }
    }
    
    function formRule ( $fields, $files, $self ) {
        $errors = array();
        $contactFields = array( 'sort_name', 'email', 'phone', 'activity_subject' );
        if ( CRM_Utils_Array::value( 'group_bys', $fields ) ) {
            
            if ( CRM_Utils_Array::value( 'tag_name', $fields['group_bys'] ) &&
                 !CRM_Utils_Array::value( 'activity_id', $fields['group_bys'] ) ) {
                foreach ( $fields['fields'] as $fieldName => $val ) {
                    if ( in_array( $fieldName, $contactFields ) ) {
                        $errors['fields'] = ts("Please select Group By 'Activity' to display Contact Info and Activity Subject Fields");
                        break;
                    }
                }
            }
            
            if ( CRM_Utils_Array::value( 'activity_date_time', $fields['group_bys'] ) ) {
                foreach ( $fields['fields'] as $fieldName => $val ) {
                    if ( in_array( $fieldName, $contactFields ) ) {
                        $errors['fields'] = ts("Please do not select any Contact Info and Activity Subject Fields with Group By 'Activity Date'");
                        break;
                    }
                }
            }
        }
        return $errors; 
    }
    
    function postProcess( ) {
        // get the acl clauses built before we assemble the query
        $this->buildACLClause( $this->_aliases['civicrm_contact'] );
        parent::postProcess();
    }
    
    function alterDisplay( &$rows ) {
        // custom code to alter rows
        
        $entryFound   = false;
        $activityType = CRM_Core_PseudoConstant::activityType( true, true, false, 'label', true );
        $flagTag  = 0;
        
        $onHover        = ts('View Contact Summary for this Contact');
        foreach ( $rows as $rowNum => $row ) {
            
            if ( array_key_exists('civicrm_contact_sort_name', $row ) && $this->_outputMode != 'csv' ) {
                if ( $value = $row['civicrm_contact_id'] ) {  
                    
                    $url = CRM_Utils_System::url( 'civicrm/contact/view',
                                                  'reset=1&cid=' . $value );
                        
                    $rows[$rowNum]['civicrm_contact_sort_name'] ="<a href='$url' title='$onHover'>" .$row['civicrm_contact_sort_name']. '</a>';
                    $entryFound = true;
                }
             }


             if ( array_key_exists('civicrm_tag_name', $row ) && $this->_outputMode != 'csv' ) {
                if ( $value = $row['civicrm_tag_id'] ) {
                    
                    if( $rowNum == 0 ) {
                        $previousTag = $value;
                    } else {
                        if( $previousTag == $value ) {
                            $flagTag     = 1;
                            $previousTag = $value;
                        } else {
                            $flagTag     = 0;
                            $previousTag = $value;
                        }
                    }
                    
                    if( $flagTag == 1 ) {
                        $rows[$rowNum]['civicrm_tag_name'] = "";
                    } else {
                        $rows[$rowNum]['civicrm_tag_name'] =$row['civicrm_tag_name'];
                    }
                    $entryFound = true;
                }
            }
            
            if ( array_key_exists('civicrm_activity_activity_type_id', $row ) ) {
                if ( $value = $row['civicrm_activity_activity_type_id'] ) {
                    
                    $value = explode( ',' , $value );
                    foreach ($value as $key => $id ) {
                        $value[$key] = $activityType[$id];
                    }
                    
                    $rows[$rowNum]['civicrm_activity_activity_type_id'] = implode(' , ',$value );
                    $entryFound = true;
                }
            }
            
            if ( !$entryFound ) {
                break;
            }
        }
    }
 }
