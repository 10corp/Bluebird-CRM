<?php
/*
 +--------------------------------------------------------------------+
 | CiviCRM version 4.7                                                |
 +--------------------------------------------------------------------+
 | Copyright CiviCRM LLC (c) 2004-2015                                |
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
 * @copyright CiviCRM LLC (c) 2004-2015
 */
class CRM_Contact_Form_Search_Custom_Group extends CRM_Contact_Form_Search_Custom_Base implements CRM_Contact_Form_Search_Interface {

  protected $_formValues;

  protected $_tableName = NULL;

  protected $_where = ' (1) ';

  protected $_aclFrom = NULL;
  protected $_aclWhere = NULL;

  /**
   * Class constructor.
   *
   * @param array $formValues
   */
  public function __construct(&$formValues) {
    $this->_formValues = $formValues;
    $this->_columns = array(
      ts('Contact ID') => 'contact_id',
      ts('Contact Type') => 'contact_type',
      ts('Name') => 'sort_name',
      ts('Group Name') => 'gname',
      ts('Tag Name') => 'tname',
      ts('Street Address') => 'street_address',//NYSS
      ts('City') => 'city'//NYSS
    );

    $this->_includeGroups = CRM_Utils_Array::value('includeGroups', $this->_formValues, array());
    $this->_excludeGroups = CRM_Utils_Array::value('excludeGroups', $this->_formValues, array());
    $this->_includeTags = CRM_Utils_Array::value('includeTags', $this->_formValues, array());
    $this->_excludeTags = CRM_Utils_Array::value('excludeTags', $this->_formValues, array());

    //define variables
    $this->_allSearch = FALSE;
    $this->_groups = FALSE;
    $this->_tags = FALSE;
    $this->_andOr = CRM_Utils_Array::value('andOr', $this->_formValues);
    //make easy to check conditions for groups and tags are
    //selected or it is empty search
    if (empty($this->_includeGroups) && empty($this->_excludeGroups) &&
      empty($this->_includeTags) && empty($this->_excludeTags)
    ) {
      //empty search
      $this->_allSearch = TRUE;
    }

    $this->_groups = (!empty($this->_includeGroups) || !empty($this->_excludeGroups));

    $this->_tags = (!empty($this->_includeTags) || !empty($this->_excludeTags));
  }

  public function __destruct() {
    // mysql drops the tables when connection is terminated
    // cannot drop tables here, since the search might be used
    // in other parts after the object is destroyed
  }

  /**
   * @param CRM_Core_Form $form
   */
  public function buildForm(&$form) {

    $this->setTitle(ts('Include / Exclude Search'));

    $groups = CRM_Core_PseudoConstant::nestedGroup();

    //NYSS 2247 exclude positions when constructing list of tags
    //$tags = CRM_Core_PseudoConstant::tag( );
    $issue_codes = CRM_Core_BAO_Tag::getTags( );
    $keywords = CRM_Core_BAO_Tag::getTagsUsedFor( $usedFor = array( 'civicrm_contact' ),
      $buildSelect = true,
      $all = false,
      $parentId = 296
    );

    //NYSS 7646
    asort($keywords);

    if ( $keywords ) {
      //lets indent keywords
      foreach ( $keywords as $key => $keyword ) {
        $keywords[$key] = '&nbsp;&nbsp;'.$keyword;
      }
      $tags = $issue_codes + array ('296' => 'Keywords') + $keywords;
    }
    else {
      $tags = $issue_codes;
    }
    //NYSS end

    //NYSS 4345 unset empty values
    $tagElements = array( 'includeTags', 'excludeTags' );
    $tagsRemoved = FALSE;
    foreach ( $tagElements as $tagElement ) {
      foreach ( $form->_formValues[$tagElement] as $k=>$tid ) {
        if ( !array_key_exists($tid, $tags) ) {
          unset($form->_formValues[$tagElement][$k]);
          $tagsRemoved = TRUE;
        }
      }
    }
    if ( $tagsRemoved ) {
      CRM_Core_Session::setStatus( ts("One or more tags previously used in this search has since been deleted.") );
    }
    //NYSS end

    if (count($groups) == 0 || count($tags) == 0) {
      CRM_Core_Session::setStatus(ts("At least one Group and Tag must be present for Custom Group / Tag search."), ts('Missing Group/Tag'));
      $url = CRM_Utils_System::url('civicrm/contact/search/custom/list', 'reset=1');
      CRM_Utils_System::redirect($url);
    }

    $select2style = array(
      'multiple' => TRUE,
      'style' => 'width: 100%; max-width: 60em;',
      'class' => 'crm-select2',
      'placeholder' => ts('- select -'),
    );

    $form->add('select', 'includeGroups',
      ts('Include Group(s)'),
      $groups,
      FALSE,
      $select2style
    );

    $form->add('select', 'excludeGroups',
      ts('Exclude Group(s)'),
      $groups,
      FALSE,
      $select2style
    );

    $andOr = array(
      '1' => ts('Show contacts that meet the Groups criteria AND the Tags criteria'),
      '0' => ts('Show contacts that meet the Groups criteria OR  the Tags criteria'),
    );
    $form->addRadio('andOr', ts('AND/OR'), $andOr, NULL, '<br />', TRUE);

    $form->add('select', 'includeTags',
      ts('Include Tag(s)'),
      $tags,
      FALSE,
      $select2style
    );

    $form->add('select', 'excludeTags',
      ts('Exclude Tag(s)'),
      $tags,
      FALSE,
      $select2style
    );

    //NYSS 7748
    $actAction = array(
      '' => '- select -',
      'act_include' => 'Include Activities',
      'act_exclude' => 'Exclude Activities',
    );
    $form->add( 'select',
      'act_action',
      ts( 'Activity Action' ),
      $actAction,
      FALSE
    );

    $activityOptions = CRM_Core_PseudoConstant::activityType(TRUE, TRUE, FALSE, 'label', TRUE);
    asort($activityOptions);
    $form->add('select', 'activity_type_id', ts('Activity Type'),
      array('' => '- select -') + $activityOptions,
      FALSE, array()
    );

    $dataUrl = CRM_Utils_System::url("civicrm/ajax/getsubjectlist",
      "json=1&reset=1",
      FALSE, NULL, FALSE
    );
    $form->assign('dataUrl', $dataUrl);

    $allSubjects = CRM_NYSS_AJAX_Activity::getSubjectList(FALSE);
    $subj = &$form->addElement('advmultiselect', 'act_subject',
      ts('Activity Subject'), $allSubjects,
      array(
        'size' => 5,
        'style' => 'width:270px; height: 200px;',
        'class' => 'advmultiselect',
      )
    );
    $subj->setButtonAttributes('add', array('value' => ts('Add >>')));
    $subj->setButtonAttributes('remove', array('value' => ts('<< Remove')));

    $form->assign('searchName', 'IncludeExclude');

    /**
     * if you are using the standard template, this array tells the template what elements
     * are part of the search criteria
     */
    $form->assign('elements', array('includeGroups', 'excludeGroups', 'andOr', 'includeTags', 'excludeTags'));
  }

  /**
   * @param int $offset
   * @param int $rowcount
   * @param NULL $sort
   * @param bool $includeContactIDs
   * @param bool $justIDs
   *
   * @return string
   */
  public function all(
    $offset = 0, $rowcount = 0, $sort = NULL,
    $includeContactIDs = FALSE, $justIDs = FALSE
  ) {

    if ($justIDs) {
      $selectClause = "contact_a.id as contact_id";
    }
    else {
      $selectClause = "contact_a.id as contact_id,
        contact_a.contact_type as contact_type,
        contact_a.sort_name as sort_name,
        addr.street_address,
        addr.city";//NYSS

      //distinguish column according to user selection
      if (($this->_includeGroups && !$this->_includeTags)) {
        unset($this->_columns['Tag Name']);
        $selectClause .= ", GROUP_CONCAT(DISTINCT group_names ORDER BY group_names ASC ) as gname";
      }
      elseif ($this->_includeTags && (!$this->_includeGroups)) {
        unset($this->_columns['Group Name']);
        $selectClause .= ", GROUP_CONCAT(DISTINCT tag_names  ORDER BY tag_names ASC ) as tname";
      }
      elseif (!empty($this->_includeTags) && !empty($this->_includeGroups)) {
        $selectClause .= ", GROUP_CONCAT(DISTINCT group_names ORDER BY group_names ASC ) as gname , GROUP_CONCAT(DISTINCT tag_names ORDER BY tag_names ASC ) as tname";
      }
      else {
        unset($this->_columns['Tag Name']);
        unset($this->_columns['Group Name']);
      }
    }

    $from = $this->from();

    $where = $this->where($includeContactIDs);

    if (!$justIDs && !$this->_allSearch) {
      $groupBy = " GROUP BY contact_a.id";
    }
    else {
      // CRM-10850
      // we do this since this if stmt is called by the smart group part of the code
      // adding a groupBy clause and saving it as a smart group messes up the query and
      // bad things happen
      // andrew hunt seemed to have rewritten this piece when he worked on this search
      $groupBy = NULL;
    }

    $sql = "SELECT $selectClause $from WHERE  $where $groupBy";

    // Define ORDER BY for query in $sort, with default value
    if (!$justIDs) {
      if (!empty($sort)) {
        if (is_string($sort)) {
          $sort = CRM_Utils_Type::escape($sort, 'String');
          $sql .= " ORDER BY $sort ";
        }
        else {
          $sql .= " ORDER BY " . trim($sort->orderBy());
        }
      }
      else {
        $sql .= " ORDER BY contact_id ASC";
      }
    }
    else {
      $sql .= " ORDER BY contact_a.id ASC";
    }

    if ($offset >= 0 && $rowcount > 0) {
      $sql .= " LIMIT $offset, $rowcount ";
    }

    return $sql;
  }

  /**
   * @return string
   * @throws Exception
   */
  public function from() {
    //$tFromStart = microtime();
    //CRM_Core_Error::debug_var('start from time', $tFromStart);

    //NYSS check if we've already constructed the result table and use it if so
    if ( !empty($this->_from) ) {
      //CRM_Core_Error::debug_var('this->_from', $this->_from);
      return $this->_from;
    }

    $iGroups = $xGroups = $iTags = $xTags = 0;

    //define table name
    $randomNum = md5(uniqid());
    $this->_tableName = "civicrm_temp_custom_{$randomNum}";

    //block for Group search
    $smartGroup = array();
    if ($this->_groups || $this->_allSearch) {
      $group = new CRM_Contact_DAO_Group();
      $group->is_active = 1;
      $group->find();
      while ($group->fetch()) {
        $allGroups[] = $group->id;
        if ($group->saved_search_id) {
          $smartGroup[$group->saved_search_id] = $group->id;
        }
      }
      $includedGroups = implode(',', $allGroups);

      if (!empty($this->_includeGroups)) {
        $iGroups = implode(',', $this->_includeGroups);
      }
      else {
        //if no group selected search for all groups
        $iGroups = NULL;
      }
      if (is_array($this->_excludeGroups)) {
        $xGroups = implode(',', $this->_excludeGroups);
      }
      else {
        $xGroups = 0;
      }

      $sql = "CREATE TEMPORARY TABLE Xg_{$this->_tableName} ( contact_id int primary key) ENGINE=MyISAM";
      CRM_Core_DAO::executeQuery($sql);

      //used only when exclude group is selected
      if ($xGroups != 0) {
        $excludeGroup = "INSERT INTO  Xg_{$this->_tableName} ( contact_id )
                  SELECT  DISTINCT civicrm_group_contact.contact_id
                  FROM civicrm_group_contact, civicrm_contact
                  WHERE
                     civicrm_contact.id = civicrm_group_contact.contact_id AND
                     civicrm_group_contact.status = 'Added' AND
                     civicrm_group_contact.group_id IN( {$xGroups})";

        CRM_Core_DAO::executeQuery($excludeGroup);

        //search for smart group contacts
        foreach ($this->_excludeGroups as $keys => $values) {
          if (in_array($values, $smartGroup)) {
            $ssGroup = new CRM_Contact_DAO_Group();
            $ssGroup->id = $values;
            if (!$ssGroup->find(TRUE)) {
              CRM_Core_Error::fatal();
            }
            CRM_Contact_BAO_GroupContactCache::load($ssGroup);

            $smartSql = "
SELECT gcc.contact_id
FROM   civicrm_group_contact_cache gcc
WHERE  gcc.group_id = {$ssGroup->id}
";
            $smartGroupQuery = " INSERT IGNORE INTO Xg_{$this->_tableName}(contact_id) $smartSql";
            CRM_Core_DAO::executeQuery($smartGroupQuery);
          }
        }
      }

      $sql = "CREATE TEMPORARY TABLE Ig_{$this->_tableName} ( id int PRIMARY KEY AUTO_INCREMENT,
                                                                   contact_id int,
                                                                   group_names varchar(64)) ENGINE=MyISAM";

      CRM_Core_DAO::executeQuery($sql);

      if ($iGroups) {
        $includeGroup = "INSERT INTO Ig_{$this->_tableName} (contact_id, group_names)
                 SELECT              civicrm_contact.id as contact_id, civicrm_group.title as group_name
                 FROM                civicrm_contact
                    INNER JOIN       civicrm_group_contact
                            ON       civicrm_group_contact.contact_id = civicrm_contact.id
                    LEFT JOIN        civicrm_group
                            ON       civicrm_group_contact.group_id = civicrm_group.id";
      }
      else {
        $includeGroup = "INSERT INTO Ig_{$this->_tableName} (contact_id, group_names)
                 SELECT              civicrm_contact.id as contact_id, ''
                 FROM                civicrm_contact";
      }
      //used only when exclude group is selected
      if ($xGroups != 0) {
        $includeGroup .= " LEFT JOIN        Xg_{$this->_tableName}
                                          ON       civicrm_contact.id = Xg_{$this->_tableName}.contact_id";
      }

      if ($iGroups) {
        $includeGroup .= " WHERE
                                     civicrm_group_contact.status = 'Added'  AND
                                     civicrm_group_contact.group_id IN($iGroups)";
      }
      else {
        $includeGroup .= " WHERE ( 1 ) ";
      }

      //used only when exclude group is selected
      if ($xGroups != 0) {
        $includeGroup .= " AND  Xg_{$this->_tableName}.contact_id IS null";
      }

      CRM_Core_DAO::executeQuery($includeGroup);

      //search for smart group contacts

      foreach ($this->_includeGroups as $keys => $values) {
        if (in_array($values, $smartGroup)) {
          $ssGroup = new CRM_Contact_DAO_Group();
          $ssGroup->id = $values;
          if (!$ssGroup->find(TRUE)) {
            CRM_Core_Error::fatal();
          }
          CRM_Contact_BAO_GroupContactCache::load($ssGroup);

          $smartSql = "
SELECT gcc.contact_id
FROM   civicrm_group_contact_cache gcc
WHERE  gcc.group_id = {$ssGroup->id}
";

          //used only when exclude group is selected
          if ($xGroups != 0) {
            $smartSql .= " AND gcc.contact_id NOT IN (SELECT contact_id FROM  Xg_{$this->_tableName})";
          }

          $smartGroupQuery = " INSERT IGNORE INTO Ig_{$this->_tableName}(contact_id)
                                     $smartSql";

          CRM_Core_DAO::executeQuery($smartGroupQuery);
          $insertGroupNameQuery = "UPDATE IGNORE Ig_{$this->_tableName}
                                         SET group_names = (SELECT title FROM civicrm_group
                                                            WHERE civicrm_group.id = $values)
                                         WHERE Ig_{$this->_tableName}.contact_id IS NOT NULL
                                         AND Ig_{$this->_tableName}.group_names IS NULL";
          CRM_Core_DAO::executeQuery($insertGroupNameQuery);
        }
      }
    }
    //group contact search end here;

    //block for Tags search
    if ($this->_tags || $this->_allSearch) {
      //find all tags
      $tag = new CRM_Core_DAO_Tag();
      $tag->is_active = 1;
      $tag->find();
      while ($tag->fetch()) {
        $allTags[] = $tag->id;
      }
      $includedTags = implode(',', $allTags);

      if (!empty($this->_includeTags)) {
        $iTags = implode(',', $this->_includeTags);
      }
      else {
        //if no group selected search for all groups
        $iTags = NULL;
      }
      if (is_array($this->_excludeTags)) {
        $xTags = implode(',', $this->_excludeTags);
      }
      else {
        $xTags = 0;
      }

      $sql = "CREATE TEMPORARY TABLE Xt_{$this->_tableName} ( contact_id int primary key) ENGINE=MyISAM";
      CRM_Core_DAO::executeQuery($sql);

      //used only when exclude tag is selected
      if ($xTags != 0) {
        $excludeTag = "INSERT INTO  Xt_{$this->_tableName} ( contact_id )
                  SELECT  DISTINCT civicrm_entity_tag.entity_id
                  FROM civicrm_entity_tag, civicrm_contact
                  WHERE
                     civicrm_entity_tag.entity_table = 'civicrm_contact' AND
                     civicrm_contact.id = civicrm_entity_tag.entity_id AND
                     civicrm_entity_tag.tag_id IN( {$xTags})";

        CRM_Core_DAO::executeQuery($excludeTag);
      }

      $sql = "CREATE TEMPORARY TABLE It_{$this->_tableName} ( id int PRIMARY KEY AUTO_INCREMENT,
                                                               contact_id int,
                                                               tag_names varchar(64)) ENGINE=MyISAM";

      CRM_Core_DAO::executeQuery($sql);

      if ($iTags) {
        $includeTag = "INSERT INTO It_{$this->_tableName} (contact_id, tag_names)
                 SELECT              civicrm_contact.id as contact_id, civicrm_tag.name as tag_name
                 FROM                civicrm_contact
                    INNER JOIN       civicrm_entity_tag
                            ON       ( civicrm_entity_tag.entity_table = 'civicrm_contact' AND
                                       civicrm_entity_tag.entity_id = civicrm_contact.id )
                    LEFT JOIN        civicrm_tag
                            ON       civicrm_entity_tag.tag_id = civicrm_tag.id";
      }
      else {
        //NYSS 7238
        $includeTag = "
          INSERT INTO It_{$this->_tableName} (contact_id, tag_names)
          SELECT civicrm_contact.id as contact_id, ''
          FROM civicrm_contact
          LEFT JOIN civicrm_entity_tag
            ON civicrm_contact.id = civicrm_entity_tag.entity_id
            AND civicrm_entity_tag.entity_table = 'civicrm_contact'
        ";
      }

      //used only when exclude tag is selected
      if ($xTags != 0) {
        $includeTag .= " LEFT JOIN        Xt_{$this->_tableName}
                                       ON       civicrm_contact.id = Xt_{$this->_tableName}.contact_id";
      }
      if ($iTags) {
        //NYSS
        $includeTag .= "
          WHERE civicrm_entity_tag.entity_table = 'civicrm_contact'
            AND civicrm_entity_tag.tag_id IN ($iTags)
        ";
      }
      else {
        $includeTag .= " WHERE ( 1 ) ";
      }

      //used only when exclude tag is selected
      if ($xTags != 0) {
        $includeTag .= " AND  Xt_{$this->_tableName}.contact_id IS null";
      }

      CRM_Core_DAO::executeQuery($includeTag);
    }

    $from = " FROM civicrm_contact contact_a";

    /*
     * CRM-10850 / CRM-10848
     * If we use include / exclude groups as smart groups for ACL's having the below causes
     * a cycle which messes things up. Hence commenting out for now
     * $this->buildACLClause('contact_a');
     */

    /*
     * check the situation and set booleans
     */
    $Ig = ($iGroups != 0);
    $It = ($iTags != 0);
    $Xg = ($xGroups != 0);
    $Xt = ($xTags != 0);

    //PICK UP FROM HERE
    if (!$this->_groups && !$this->_tags) {
      $this->_andOr = 1;
    }

    /*
     * Set from statement depending on array sel
     */
    $whereitems = array();

    //NYSS try creating/modifying single temp table rather than having large joins
    $sql = "
      CREATE TEMPORARY TABLE result_{$this->_tableName}
      (id int PRIMARY KEY AUTO_INCREMENT, contact_id int, group_names varchar(64), tag_names varchar(64))
      ENGINE=HEAP
    ";
    CRM_Core_DAO::executeQuery($sql);

    //inclusions
    foreach (array('Ig', 'It') as $inc) {
      if ($$inc) {
        /*if ($this->_andOr == 1) {
          $from .= "
            INNER JOIN {$inc}_{$this->_tableName} temptable$inc
              ON (contact_a.id = temptable$inc.contact_id)
          ";
        }
        else {
          $from .= "
            LEFT JOIN {$inc}_{$this->_tableName} temptable$inc
              ON (contact_a.id = temptable$inc.contact_id)
          ";
        }
        $whereitems[] = "temptable$inc.contact_id IS NOT NULL";*/

        $gtName = ( $inc == 'Ig' ) ? 'group_names' : 'tag_names';
        $sql = "
          INSERT INTO result_{$this->_tableName}
          (contact_id, {$gtName})
          SELECT contact_id, {$gtName}
          FROM {$inc}_{$this->_tableName}
        ";
        CRM_Core_DAO::executeQuery($sql);
      }
    }
    //$this->_where = $whereitems ? "(" . implode(' OR ', $whereitems) . ')' : '(1)';

    //remove if andOr == 1
    if ( $this->_andOr == 1 && $this->_groups && $this->_tags ) {
      //$remStart = microtime();
      $sql = "
        DELETE FROM result_{$this->_tableName}
        WHERE contact_id NOT IN
        ( SELECT iG.contact_id
          FROM Ig_{$this->_tableName} iG
          JOIN It_{$this->_tableName} iT
            ON iG.contact_id = iT.contact_id )
      ";
      CRM_Core_DAO::executeQuery($sql);
      //$remEnd = microtime();
      //$remDiff = $remEnd - $remStart;
      //CRM_Core_Error::debug_log_message("time to remove AND inclusions: {$remDiff}");
    }

    //exclusions
    //$exclStart = microtime();
    foreach (array('Xg', 'Xt') as $exc) {
      if ($$exc) {
        /*$from .= "
          LEFT JOIN {$exc}_{$this->_tableName} temptable$exc
            ON (contact_a.id = temptable$exc.contact_id)
        ";
        $this->_where .= "
          AND temptable$exc.contact_id IS NULL
        ";*/

        $sql = "
          DELETE FROM result_{$this->_tableName}
          WHERE contact_id IN
          ( SELECT contact_id
            FROM {$exc}_{$this->_tableName} )
        ";
        CRM_Core_DAO::executeQuery($sql);
      }
    }
    //$exclEnd = microtime();
    //$exclDiff = $exclEnd - $exclStart;
    //CRM_Core_Error::debug_log_message("time to remove exclusions: {$exclDiff}");

    //NYSS 7748
    //CRM_Core_Error::debug_var('this->_formValues', $this->_formValues);
    if ( !empty($this->_formValues['activity_type_id']) || !empty($this->_formValues['act_subject']) ) {
      self::_processActivities("result_{$this->_tableName}", $this->_formValues['act_action'], $this->_formValues['activity_type_id'], $this->_formValues['act_subject']);
    }

    //now construct from
    $from .= "
      JOIN result_{$this->_tableName} temptableResult
        ON contact_a.id = temptableResult.contact_id
    ";

    //append email/address joins
    $from .= "
      LEFT JOIN civicrm_email
        ON ( contact_a.id = civicrm_email.contact_id
        AND ( civicrm_email.is_primary = 1 OR civicrm_email.is_bulkmail = 1 )
        )
      {$this->_aclFrom}
    ";

    //NYSS
    $from .= "
      LEFT JOIN civicrm_address addr
        ON addr.contact_id = contact_a.id
        AND addr.is_primary = 1
    ";

    if ($this->_aclWhere) {
      $this->_where .= " AND {$this->_aclWhere} ";
    }

    // also exclude all contacts that are deleted
    // CRM-11627
    $this->_where .= " AND (contact_a.is_deleted != 1) ";

    //NYSS cache this so we can skip reconstruction
    $this->_from = $from;

    //CRM_Core_Error::debug_var('from built:', $from);
    return $from;
  }

  /**
   * @param bool $includeContactIDs
   *
   * @return string
   */
  public function where($includeContactIDs = FALSE) {
    //CRM_Core_Error::debug_var('$this->_formValues', $this->_formValues);
    //CRM_Core_Error::debug_var('$this->_where', $this->_where);

    if ($includeContactIDs) {
      $contactIDs = array();

      foreach ($this->_formValues as $id => $value) {
        if ($value &&
          substr($id, 0, CRM_Core_Form::CB_PREFIX_LEN) == CRM_Core_Form::CB_PREFIX
        ) {
          $contactIDs[] = substr($id, CRM_Core_Form::CB_PREFIX_LEN);
        }
      }

      if (!empty($contactIDs)) {
        $contactIDs = implode(', ', $contactIDs);
        $clauses[] = "contact_a.id IN ( $contactIDs )";
      }
      $where = "{$this->_where} AND " . implode(' AND ', $clauses);
    }
    else {
      $where = $this->_where;
    }

    return $where;
  }

  /*
   * Functions below generally don't need to be modified
   */

  /**
   * @inheritDoc
   */
  public function count() {
    $sql = $this->all();

    $dao = CRM_Core_DAO::executeQuery($sql);
    return $dao->N;
  }

  /**
   * @param int $offset
   * @param int $rowcount
   * @param NULL $sort
   * @param bool $returnSQL
   *
   * @return string
   */
  public function contactIDs($offset = 0, $rowcount = 0, $sort = NULL, $returnSQL = FALSE) {
    return $this->all($offset, $rowcount, $sort, FALSE, TRUE);
  }

  /**
   * Define columns.
   *
   * @return array
   */
  public function &columns() {
    return $this->_columns;
  }

  /**
   * Get summary.
   *
   * @return NULL
   */
  public function summary() {
    return NULL;
  }

  /**
   * Get template file.
   *
   * @return string
   */
  public function templateFile() {
    return 'CRM/Contact/Form/Search/Custom.tpl';
  }

  /**
   * Set title on search.
   *
   * @param string $title
   */
  public function setTitle($title) {
    if ($title) {
      CRM_Utils_System::setTitle($title);
    }
    else {
      CRM_Utils_System::setTitle(ts('Search'));
    }
  }

  /**
   * Build ACL clause.
   *
   * @param string $tableAlias
   */
  public function buildACLClause($tableAlias = 'contact') {
    list($this->_aclFrom, $this->_aclWhere) = CRM_Contact_BAO_Contact_Permission::cacheClause($tableAlias);
  }

  //NYSS 4899
  function alterRow( &$row ) {
    $row['contact_type' ] =
      CRM_Contact_BAO_Contact_Utils::getImage( $row['contact_type'],
        false,
        $row['contact_id'] );
  }

  //NYSS 7748
  function _processActivities($table, $action = NULL, $actType = NULL, $actSubject = '') {
    //CRM_Core_Error::debug_var('_processActivities $table', $table);
    //CRM_Core_Error::debug_var('_processActivities $action', $action);
    //CRM_Core_Error::debug_var('_processActivities $actType', $actType);
    //CRM_Core_Error::debug_var('_processActivities $actSubject', $actSubject);

    //return if no action is selected
    if ( empty($action) ) {
      return;
    }

    $actSubjects = array();
    foreach ( $actSubject as $actIDs ) {
      foreach ( explode(',', $actIDs) as $actID ) {
        $actSubjects[] = $actID;
      }
    }
    $actSubjectList = implode(',', $actSubject);
    //CRM_Core_Error::debug_var('_processActivities $actSubjects', $actSubjects);
    //CRM_Core_Error::debug_var('_processActivities $actSubjectList', $actSubjectList);

    //construct where clauses
    $whereAT = ($actType) ? "a.activity_type_id = {$actType}" : "(1)";
    $whereAS = ($actSubjectList) ? "a.id IN ({$actSubjectList})" : "(1)";

    $existingIDs = CRM_Core_DAO::singleValueQuery("
      SELECT GROUP_CONCAT(contact_id) FROM {$table}
    ");
    $existingIDs = ($existingIDs) ? $existingIDs : "(0)";

    switch ($action) {
      case 'act_include':
        $sql = "
          INSERT INTO {$table} (contact_id)
          SELECT ac.contact_id
          FROM civicrm_activity_contact ac
          JOIN civicrm_activity a
            ON ac.activity_id = a.id
            AND ac.record_type_id = 3
          WHERE $whereAT
            AND $whereAS
            AND ac.contact_id NOT IN ({$existingIDs})
          GROUP BY ac.contact_id
        ";
        CRM_Core_DAO::executeQuery($sql);
        break;

      case 'act_exclude':
        $sql = "
          DELETE {$table}
          FROM {$table}
          WHERE contact_id IN (
            SELECT ac.contact_id
            FROM civicrm_activity_contact ac
            JOIN civicrm_activity a
              ON ac.activity_id = a.id
              AND ac.record_type_id = 3
            WHERE $whereAT
              AND $whereAS
            GROUP BY ac.contact_id
          )
        ";
        //CRM_Core_Error::debug_var('_processActivities exclude $sql', $sql);
        CRM_Core_DAO::executeQuery($sql);
        break;

      default:
        return;
    }
  }//_processActivities
}

