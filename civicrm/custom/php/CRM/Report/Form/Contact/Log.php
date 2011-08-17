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

class CRM_Report_Form_Contact_Log extends CRM_Report_Form {

    protected $_summary      = null;
	protected $_addressField = false; //NYSS
    
    function __construct( ) {		

    	$this->activityTypes = CRM_Core_PseudoConstant::activityType(true, true);
        asort($this->activityTypes);
    	
        $this->_columns = 
            array('civicrm_contact_touched' =>
                   array( 'dao'       => 'CRM_Contact_DAO_Contact',
                          'fields'    =>
                          array( 'display_name_touched' => 
                                 array( 'title'      => ts( 'Touched Contact' ),
                                        'name'       => 'display_name', ),
                                 'sort_name_touched' => 
                                 array( 'no_display' => true,
                                        'name'       => 'sort_name', ),
								 'id'       => 
                                 array( 'no_display' => true,
                                        'required'   => true, ), ),
                          'filters'   =>             
                          array( 'sort_name_touched' => 
                                 array( 'title'      => ts( 'Touched Contact' ),
                                        'name'       => 'sort_name',
                                        'where'      => 'civicrm_contact.display_name', //NYSS 3271
                                        'type'       => CRM_Utils_Type::T_STRING
                                      ),
                                ),
                          'grouping'  => 'contact-fields',
                          ),
                  //NYSS alter the order so touched contact is first
				  'civicrm_contact' =>
                   array( 'dao'       => 'CRM_Contact_DAO_Contact',
                          'fields'    =>
                          array( 'display_name' => 
                                 array( 'title'     => ts( 'Modified By' ),
                                        /*'required'  => true,*/),
                                 'id'           => 
                                 array( 'no_display'=> true,
                                        'required'  => true, ), ),
                          'filters'   =>             
                          array( 'sort_name'    => 
                                 array( 'title'      => ts( 'Modified By' ),
                                        'type'       => CRM_Utils_Type::T_STRING ),
                          ),
                          'grouping'  => 'contact-fields',
                        ),
				  
				  //NYSS address
				  'civicrm_address' =>
                   array( 'dao'       => 'CRM_Core_DAO_Address',
                          'grouping'  => 'contact-fields',
                          'fields'    =>
                          array( 'street_address'    => array( 'no_display' => true ),
                                 'city'              => array( 'no_display' => true ),
                                 'postal_code'       => array( 'no_display' => true ),
                                 'state_province_id' => array( 'title'      => ts( 'State/Province' ),
								 							   'no_display' => true ),
                                 ),
                          ),
                          
                  'civicrm_activity' => 
                   array( 'dao'       => 'CRM_Activity_DAO_Activity',
                          'fields'    =>
                          array( 'id'  => array('title'      => ts( 'Activity ID' ),
                                                'no_display' => true,
                                                /*'required'   => true,*/ //NYSS
                                               ),
                                 'subject'  => array('title' => ts('Touched Activity'),
                                                     /*'required'   => true,*/
                                               ),
                                 'activity_type_id'  => array('title'    => ts( 'Activity Type' ),
                                                			  /*'required' => true,*/
                                               ),
                                 'source_contact_id'  => array('no_display' => true,
                                                			   'required'   => true,
                                               ),
                              ),
                          ),

                   'civicrm_log' => 
                   array( 'dao'    => 'CRM_Core_DAO_Log',
                          'fields'    =>
                          array( 'modified_date' => 
                                 array( 'title'     => ts( 'Modified Date' ),
                                        'required'  => true,
                                       ),
                                 'data' => 
                                 array( 'title'     => ts( 'Description' ),
								 		'default'	=> true, //NYSS
                                       ),
                                ),
                          'filters' =>             
                          array( 'modified_date' => 
                                 array( 'title'        => ts( 'Modified Date' ),
                                        'operatorType' => CRM_Report_Form::OP_DATE,
                                        'type'         => CRM_Utils_Type::T_DATE,
                                        'default'      => 'this.week',
                                       ),
								 //NYSS
								 'data' => 
                                 array( 'title'     => ts( 'Description' ),
                                        'type'      => CRM_Utils_Type::T_STRING,
                                       ),
                                 //NYSS exclude activity records
								 'exclude_activities'	 => 
								 array( 'name'         => 'exclude_activities' ,
                                        'title'        => ts( 'Exclude Activity Records' ),
										'type'         => CRM_Utils_Type::T_INT,
                                      	'operatorType' => CRM_Report_Form::OP_SELECT,
                                        'options'      => array('0'=>'No', '1'=>'Yes'),
								 		'default'	   => 1,
                                       ), 
								), 
                          ),
                   );

        parent::__construct( );
    }
    
    function preProcess( ) {
        parent::preProcess( );
    }
    
    function select( ) {
        $select = array( );
        $this->_columnHeaders = array( );
        foreach ( $this->_columns as $tableName => $table ) {
            if ( array_key_exists('fields', $table) ) {
                foreach ( $table['fields'] as $fieldName => $field ) {
                    if ( CRM_Utils_Array::value( 'required', $field ) ||
                         CRM_Utils_Array::value( $fieldName, $this->_params['fields'] ) ) {

                        $select[] = "{$field['dbAlias']} as {$tableName}_{$fieldName}";
                        $this->_columnHeaders["{$tableName}_{$fieldName}"]['type']  = CRM_Utils_Array::value( 'type', $field );
                        $this->_columnHeaders["{$tableName}_{$fieldName}"]['title'] = $field['title'];
                    }
                }
            }
        }

        $this->_select = "SELECT " . implode( ', ', $select ) . " ";
    }

    static function formRule( $fields, $files, $self ) {  
        $errors = $grouping = array( );
        return $errors;
    }

    function from( ) {
        $this->_from = "
        FROM civicrm_log {$this->_aliases['civicrm_log']}
        INNER JOIN civicrm_contact {$this->_aliases['civicrm_contact']} 
			ON {$this->_aliases['civicrm_log']}.modified_id = {$this->_aliases['civicrm_contact']}.id
        LEFT JOIN civicrm_contact {$this->_aliases['civicrm_contact_touched']} 
			ON ({$this->_aliases['civicrm_log']}.entity_table='civicrm_contact' 
			AND {$this->_aliases['civicrm_log']}.entity_id = {$this->_aliases['civicrm_contact_touched']}.id)
        LEFT JOIN civicrm_activity {$this->_aliases['civicrm_activity']} 
			ON ({$this->_aliases['civicrm_log']}.entity_table='civicrm_activity' 
			AND {$this->_aliases['civicrm_log']}.entity_id = {$this->_aliases['civicrm_activity']}.id)
        "; 
    }

    function where( ) {
        $clauses = array( );
        $this->_having = '';
        foreach ( $this->_columns as $tableName => $table ) {
            if ( array_key_exists('filters', $table) ) {
                foreach ( $table['filters'] as $fieldName => $field ) {
                    $clause = null;
                    if ( $field['operatorType'] & CRM_Report_Form::OP_DATE ) {
                        $relative = CRM_Utils_Array::value( "{$fieldName}_relative", $this->_params );
                        $from     = CRM_Utils_Array::value( "{$fieldName}_from"    , $this->_params );
                        $to       = CRM_Utils_Array::value( "{$fieldName}_to"      , $this->_params );
                        
                        $clause = $this->dateClause( $field['dbAlias'], $relative, $from, $to );
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
					
					//NYSS 3504 process contact logs only
					if ( $field['name'] == 'exclude_activities' ) {
						$excludeActivities = CRM_Utils_Array::value( "{$fieldName}_value", $this->_params );
						if ( $excludeActivities == 1 ) {
							$clause = "( {$this->_aliases['civicrm_log']}.entity_table = 'civicrm_contact' )";
						} else { //if not flagged, ignore filter value
							$clause = NULL;
						}
					} //LCD end

                    if ( ! empty( $clause ) ) {
                        $clauses[ ] = $clause;
                    }
                }
            }
        }

        $clauses[] = "({$this->_aliases['civicrm_log']}.entity_table <> 'civicrm_domain')";
        $this->_where = "WHERE " . implode( ' AND ', $clauses );
        
    }
    
    function orderBy( ) {
        $this->_orderBy = "ORDER BY IFNULL({$this->_aliases['civicrm_contact_touched']}.sort_name, 'zzzz'), 
			{$this->_aliases['civicrm_log']}.modified_date DESC ";
    }
	
    /*function groupBy( ) {
        $this->_groupBy = "GROUP BY {$this->_aliases['civicrm_contact_touched']}.id, {$this->_aliases['civicrm_log']}.id ";
    }*/
	
    /*function postProcess( ) {

        $this->beginPostProcess( );

        $sql  = $this->buildQuery( true );
CRM_Core_Error::debug('sql', $sql); exit();
        $rows = $graphRows = array();
        $this->buildRows ( $sql, $rows );
        
        $this->formatDisplay( $rows );
        $this->doTemplateAssignment( $rows );
        $this->endPostProcess( $rows );	
    }*/
	
	//NYSS alter the way count is generated
	function statistics( &$rows ) {
        
		$statistics = array();
		//CRM_Core_Error::debug($rows);
		
		$count = 0;
		$past_touched = 0;
		foreach ( $rows as $row ) {
			$current_touched = $row['civicrm_contact_touched_id'];
			if ( $current_touched != $past_touched ) {
				$count++;
			}
			$past_touched = $current_touched;
			//echo $count.'<br />';
		}
        
        $this->countStat  ( $statistics, $count );
        $this->filterStat ( $statistics );
        
		//CRM_Core_Error::debug($statistics);
        return $statistics;
    }
	
	function countStat( &$statistics, $count ) {
        $statistics['counts']['rowCount'] = array( 'title' => ts('Row(s) Listed'),
                                                   'value' => $count );
		
		//CRM_Core_Error::debug($this);
		$this->_select = 'SELECT DISTINCT contact_touched_civireport.id as distinctContacts';
		$query = $this->_select.' '.$this->_from.' '.$this->_where.' '.$this->_groupBy;
		//echo $query;
		$distinctContacts = CRM_Core_DAO::executeQuery( $query );
        $rowCount = $distinctContacts->N;
		
        if ( $this->_rowsFound && ($this->_rowsFound > $count) ) {
            $statistics['counts']['rowsFound'] = array( 'title' => ts('Total Row(s)'),
                                                        'value' => $rowCount );
        }
    }
	
	//NYSS add group by so our counts are contact touched specific
/*	function limit( $rowCount = self::ROW_COUNT_LIMIT ) {
        require_once 'CRM/Utils/Pager.php';
        // lets do the pager if in html mode
        $this->_limit = null;
		//CRM_Core_Error::debug($this);
        if ( $this->_outputMode == 'html' || $this->_outputMode == 'group'  ) {
            $this->_select = str_ireplace( 'SELECT ', 'SELECT SQL_CALC_FOUND_ROWS ', $this->_select );
			//$this->_groupBy = 'GROUP BY contact_touched_civireport.id'; //NYSS
			
            $pageId = CRM_Utils_Request::retrieve( 'crmPID', 'Integer', CRM_Core_DAO::$_nullObject );
           
            if ( !$pageId && !empty($_POST) ) {
                if ( isset($_POST['PagerBottomButton']) && isset($_POST['crmPID_B']) ) {
                    $pageId = max( (int) @$_POST['crmPID_B'], 1 );
                } elseif(  isset($_POST['PagerTopButton']) && isset($_POST['crmPID']) ) {
                    $pageId = max( (int) @$_POST['crmPID'], 1 );
                }   
                unset( $_POST['crmPID_B'] , $_POST['crmPID'] );
            } 
            
            $pageId = $pageId ? $pageId : 1;
            $this->set( CRM_Utils_Pager::PAGE_ID, $pageId );
            $offset = ( $pageId - 1 ) * $rowCount;

            $this->_limit  = " LIMIT $offset, " . $rowCount;
        }
    }*/
/*	function setPager( $rowCount = self::ROW_COUNT_LIMIT ) {
        //CRM_Core_Error::debug($this);
		//$this->_select = str_ireplace( 'SELECT SQL_CALC_FOUND_ROWS', 'SELECT', $this->_select );
		$this->_select = 'SELECT count(contact_touched_civireport.id)';
		$this->_groupBy = 'GROUP BY contact_touched_civireport.id';
		$query = $this->_select.' '.$this->_from.' '.$this->_where.' '.$this->_groupBy;
		echo $query;
		
		if ( $this->_limit && ($this->_limit != '') ) {
            require_once 'CRM/Utils/Pager.php';
            $sql    = "SELECT FOUND_ROWS();";
            $this->_rowsFound = CRM_Core_DAO::singleValueQuery( $query );
            $params = array( 'total'        => $this->_rowsFound,
                             'rowCount'     => $rowCount,
                             'status'       => ts( 'Records %%StatusMessage%%' ),
                             'buttonBottom' => 'PagerBottomButton',
                             'buttonTop'    => 'PagerTopButton',
                             'pageID'       => $this->get( CRM_Utils_Pager::PAGE_ID ) );

            $pager = new CRM_Utils_Pager( $params );
            $this->assign_by_ref( 'pager', $pager );
        }
    }*/
	//NYSS end
    
    function alterDisplay( &$rows ) {
        
		//NYSS 3653 remove pdf button
		$elements =& $this->_elements;
		foreach ( $elements as $key=>$element ) {
			if ( $element->_attributes['name'] == '_qf_Log_submit_pdf' ) {
				unset($elements[$key]);
			}
		}
		
		// custom code to alter rows
        $entryFound = false;
		$display_flag = $prev_cid = $cid = 0;
		//CRM_Core_Error::debug($rows);
        foreach ( $rows as $rowNum => $row ) {
            
			//NYSS 3504 don't repeat contact details if its same as the previous row
			$rows[$rowNum]['hideTouched' ] = 0;
			if ( $this->_outputMode != 'csv' ) {
				//CRM_Core_Error::debug('row', $row);
				//CRM_Core_Error::debug('cid', $cid);
				//CRM_Core_Error::debug('prev_cid', $prev_cid);
				//CRM_Core_Error::debug('display_flag', $display_flag);
                if ( array_key_exists('civicrm_contact_touched_id', $row ) && !empty($row['civicrm_contact_touched_id']) ) {
                    if ( $cid = $row['civicrm_contact_touched_id'] ) {
                        if ( $rowNum == 0 ) {
                            $prev_cid = $cid;
                        } else {
                            if( $prev_cid == $cid ) {
                                $display_flag = 1;
                                $prev_cid = $cid;
                            } else {
                                $display_flag = 0;
                                $prev_cid = $cid;
                            }
                        }
                        
                        if ( $display_flag ) {
                            $rows[$rowNum]['hideTouched' ] = 1;
						}
                    }
                }
            }
			
			
			// convert display name to links
            if ( array_key_exists('civicrm_contact_display_name', $row) && 
                 array_key_exists('civicrm_contact_id', $row) ) {
                $url = CRM_Utils_System::url( 'civicrm/contact/view', 
                                              'reset=1&cid=' . $row['civicrm_contact_id'],
                                              $this->_absoluteUrl );
                $rows[$rowNum]['civicrm_contact_display_name_link' ] = $url;
                $rows[$rowNum]['civicrm_contact_display_name_hover'] = ts("View Contact details for this contact.");
                $entryFound = true;
            }
			
			// strip out the activity targets (could be multiple)
			if ( array_key_exists('civicrm_activity_activity_type_id', $row ) &&
                 $row['civicrm_activity_activity_type_id'] != '' &&
				 strpos( $row['civicrm_log_data'], 'target=' ) ) {
				// source, target, assignee are concatenated; we need to strip out the target
				$loc_target = strrpos( $row['civicrm_log_data'], 'target=' );
				$loc_assign = strrpos( $row['civicrm_log_data'], ', assignee=' );
				$str_target = substr( $row['civicrm_log_data'], $loc_target + 7, $loc_assign - $loc_target - 7 );
				//CRM_Core_Error::debug('lc', $loc_target);
				//CRM_Core_Error::debug('la', $loc_assign);
				//CRM_Core_Error::debug('st', $str_target);
				
				$targets = explode( ',', $str_target );
				//CRM_Core_Error::debug('at', $targets);
				
				// build links
				require_once 'api/v2/Contact.php';
				$atlist = array();
				foreach ( $targets as $target ) {
					$turl = CRM_Utils_System::url( 'civicrm/contact/view', 'reset=1&cid='.$target, $this->_absoluteUrl );
                	$tc_params = array( 'contact_id' => $target );
					$tc_contacts = civicrm_contact_get( $tc_params );
					$atlist[] = '<a href="'.$turl.'">'.$tc_contacts[$target]['display_name'].'</a>';
				}
				$stlist = implode( ', ', $atlist );
				//CRM_Core_Error::debug('stlist', $stlist);
				$rows[$rowNum]['civicrm_activity_targets_list'] = $stlist;
				
			}

			// convert touched name to links with details
            if ( array_key_exists('civicrm_contact_touched_display_name_touched', $row) && 
                 array_key_exists('civicrm_contact_touched_id', $row) &&
                 $row['civicrm_contact_touched_display_name_touched'] !== '' ) {
                
				//NYSS add details about touched contact via API
				//Gender, DOB, ALL District Information.
				if ( $row['civicrm_contact_touched_id'] ) {
				
				$cid = $row['civicrm_contact_touched_id'];
				
				//get address, phone, email
				require_once 'api/v2/Location.php';
				require_once 'api/v2/Contact.php';
				require_once 'CRM/Core/BAO/CustomValueTable.php';
				require_once 'CRM/Core/BAO/CustomField.php';
				$c_phone = array();
				$c_email = array();
				$c_address = array();
				$c_distinfo = array();
				$c_demo = array();
				
				$locationTypes = CRM_Core_PseudoConstant::locationType();
				//CRM_Core_Error::debug($locationTypes);
				
				$c_locations = civicrm_location_get( array( 'contact_id' => $cid ) );
				//CRM_Core_Error::debug($c_locations);
				
				foreach ( $c_locations as $c_location ) {
				
					$locType = $locationTypes[$c_location['location_type_id']];
					
					//phone
					if ( $c_location['phone'] ) {
						foreach ( $c_location['phone'] as $phone ) {
							$c_phone[] = $phone['phone']." ($locType)";
						}
					}
					
					//email
					if ( $c_location['email'] ) {
						foreach ( $c_location['email'] as $email ) {
							$c_email[] = $email['email']." ($locType)";
						}
					}
					
					//address and dist info
					if ( $c_location['address'] ) {
						
						$aid = $c_location['address']['id'];
						$di_vals = CRM_Core_BAO_CustomValueTable::getEntityValues( $aid, 'Address' );
						$di_details = '';
						if ( $di_vals ) {
							$di_details = "<ul>\n";
							unset($di_vals[57]);
							foreach ( $di_vals as $di_key => $di_val ) {
								if ( $di_val ) {
									$di_label = CRM_Core_BAO_CustomField::getTitle( $di_key );
									$di_details .= "<li>$di_label: $di_val</li>\n";
								}
							}
							$di_details .= "</ul>\n";
							if ( $di_details == '<ul></ul>' ) $di_details = '';
						}
						$c_address[] = $c_location['address']['display']." ({$locType})<br />".$di_details;
					}
				}

				$c_params = array( 'contact_id' => $cid );
				$c_contacts = civicrm_contact_get( $c_params );
				$di_demo = '<ul>';
				foreach ( $c_contacts as $c_contact ) {
					//CRM_Core_Error::debug($c_contact);
					if ( $c_contact['gender'] )     $di_demo .= '<li>Gender: '.$c_contact['gender'].'</li>';
					if ( $c_contact['birth_date'] ) $di_demo .= '<li>Birthday: '.$c_contact['birth_date'].'</li>';
				}
				$di_demo .= '</ul>';
				if ( $di_demo == '<ul></ul>' ) $di_demo = '';
				
				
				$rows[$rowNum]['civicrm_contact_touched_phone'] = implode( '<br />', $c_phone );
				$rows[$rowNum]['civicrm_contact_touched_email'] = implode( '<br />', $c_email );
				$rows[$rowNum]['civicrm_contact_touched_address'] = implode( '<br />', $c_address );
				$rows[$rowNum]['civicrm_contact_touched_demographics'] = $di_demo;
				
				//CRM_Core_Error::debug('ph', $rows[$rowNum]['civicrm_contact_touched_phone']);
				//CRM_Core_Error::debug('em', $rows[$rowNum]['civicrm_contact_touched_email']);
				//CRM_Core_Error::debug('ad', $rows[$rowNum]['civicrm_contact_touched_address']);
				} //end if
				//NYSS end
				
				$url = CRM_Utils_System::url( 'civicrm/contact/view', 
                                              'reset=1&cid=' . $row['civicrm_contact_touched_id'],
                                              $this->_absoluteUrl );
                $rows[$rowNum]['civicrm_contact_touched_display_name_touched_link' ] = $url;
                $rows[$rowNum]['civicrm_contact_touched_display_name_touched_hover'] = ts("View Contact details for this contact.");
                $entryFound = true;
            }

            if ( array_key_exists('civicrm_activity_subject', $row) && 
                 array_key_exists('civicrm_activity_id', $row) &&
                 $row['civicrm_activity_subject'] !== '' ) {
                $url = CRM_Utils_System::url( 'civicrm/contact/view/activity', 
                                              'reset=1&action=view&id=' . $row['civicrm_activity_id'] . '&cid=' . $row['civicrm_activity_source_contact_id'] . '&atype=' . $row['civicrm_activity_activity_type_id'],
                                              $this->_absoluteUrl );
                $rows[$rowNum]['civicrm_activity_subject_link' ] = $url;
                $rows[$rowNum]['civicrm_activity_subject_hover'] = ts("View Contact details for this contact.");
                $entryFound = true;
            }

            if ( array_key_exists('civicrm_activity_activity_type_id', $row ) ) {
                if ( $value = $row['civicrm_activity_activity_type_id'] ) {
                    $rows[$rowNum]['civicrm_activity_activity_type_id'] = $this->activityTypes[$value];
                }
                $entryFound = true;
            }
			
			//NYSS handle state
			if ( array_key_exists('civicrm_address_state_province_id', $row) ) {
                if ( $value = $row['civicrm_address_state_province_id'] ) {
                    $rows[$rowNum]['civicrm_address_state_province_id'] = CRM_Core_PseudoConstant::stateProvince( $value, false );
                }
                $entryFound = true;
            }
            
            // skip looking further in rows, if first row itself doesn't 
            // have the column we need
            if ( !$entryFound ) {
                break;
            }
        }
    }
    
}
