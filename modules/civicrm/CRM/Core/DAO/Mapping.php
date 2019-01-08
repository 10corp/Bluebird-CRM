<?php

/**
 * @package CRM
 * @copyright CiviCRM LLC (c) 2004-2019
 *
 * Generated from xml/schema/CRM/Core/Mapping.xml
 * DO NOT EDIT.  Generated by CRM_Core_CodeGen
 * (GenCodeChecksum:26d8aa33c9340571c606aa5b8f085c1a)
 */

/**
 * Database access object for the Mapping entity.
 */
class CRM_Core_DAO_Mapping extends CRM_Core_DAO {

  /**
   * Static instance to hold the table name.
   *
   * @var string
   */
  static $_tableName = 'civicrm_mapping';

  /**
   * Should CiviCRM log any modifications to this table in the civicrm_log table.
   *
   * @var bool
   */
  static $_log = FALSE;

  /**
   * Mapping ID
   *
   * @var int unsigned
   */
  public $id;

  /**
   * Name of Mapping
   *
   * @var string
   */
  public $name;

  /**
   * Description of Mapping.
   *
   * @var string
   */
  public $description;

  /**
   * Mapping Type
   *
   * @var int unsigned
   */
  public $mapping_type_id;

  /**
   * Class constructor.
   */
  public function __construct() {
    $this->__table = 'civicrm_mapping';
    parent::__construct();
  }

  /**
   * Returns all the column names of this table
   *
   * @return array
   */
  public static function &fields() {
    if (!isset(Civi::$statics[__CLASS__]['fields'])) {
      Civi::$statics[__CLASS__]['fields'] = [
        'id' => [
          'name' => 'id',
          'type' => CRM_Utils_Type::T_INT,
          'title' => ts('Mapping ID'),
          'description' => ts('Mapping ID'),
          'required' => TRUE,
          'table_name' => 'civicrm_mapping',
          'entity' => 'Mapping',
          'bao' => 'CRM_Core_BAO_Mapping',
          'localizable' => 0,
        ],
        'name' => [
          'name' => 'name',
          'type' => CRM_Utils_Type::T_STRING,
          'title' => ts('Name'),
          'description' => ts('Name of Mapping'),
          'maxlength' => 64,
          'size' => CRM_Utils_Type::BIG,
          'table_name' => 'civicrm_mapping',
          'entity' => 'Mapping',
          'bao' => 'CRM_Core_BAO_Mapping',
          'localizable' => 0,
        ],
        'description' => [
          'name' => 'description',
          'type' => CRM_Utils_Type::T_STRING,
          'title' => ts('Description'),
          'description' => ts('Description of Mapping.'),
          'maxlength' => 255,
          'size' => CRM_Utils_Type::HUGE,
          'table_name' => 'civicrm_mapping',
          'entity' => 'Mapping',
          'bao' => 'CRM_Core_BAO_Mapping',
          'localizable' => 0,
        ],
        'mapping_type_id' => [
          'name' => 'mapping_type_id',
          'type' => CRM_Utils_Type::T_INT,
          'title' => ts('Mapping Type'),
          'description' => ts('Mapping Type'),
          'table_name' => 'civicrm_mapping',
          'entity' => 'Mapping',
          'bao' => 'CRM_Core_BAO_Mapping',
          'localizable' => 0,
          'html' => [
            'type' => 'Select',
          ],
          'pseudoconstant' => [
            'optionGroupName' => 'mapping_type',
            'optionEditPath' => 'civicrm/admin/options/mapping_type',
          ]
        ],
      ];
      CRM_Core_DAO_AllCoreTables::invoke(__CLASS__, 'fields_callback', Civi::$statics[__CLASS__]['fields']);
    }
    return Civi::$statics[__CLASS__]['fields'];
  }

  /**
   * Return a mapping from field-name to the corresponding key (as used in fields()).
   *
   * @return array
   *   Array(string $name => string $uniqueName).
   */
  public static function &fieldKeys() {
    if (!isset(Civi::$statics[__CLASS__]['fieldKeys'])) {
      Civi::$statics[__CLASS__]['fieldKeys'] = array_flip(CRM_Utils_Array::collect('name', self::fields()));
    }
    return Civi::$statics[__CLASS__]['fieldKeys'];
  }

  /**
   * Returns the names of this table
   *
   * @return string
   */
  public static function getTableName() {
    return self::$_tableName;
  }

  /**
   * Returns if this table needs to be logged
   *
   * @return bool
   */
  public function getLog() {
    return self::$_log;
  }

  /**
   * Returns the list of fields that can be imported
   *
   * @param bool $prefix
   *
   * @return array
   */
  public static function &import($prefix = FALSE) {
    $r = CRM_Core_DAO_AllCoreTables::getImports(__CLASS__, 'mapping', $prefix, []);
    return $r;
  }

  /**
   * Returns the list of fields that can be exported
   *
   * @param bool $prefix
   *
   * @return array
   */
  public static function &export($prefix = FALSE) {
    $r = CRM_Core_DAO_AllCoreTables::getExports(__CLASS__, 'mapping', $prefix, []);
    return $r;
  }

  /**
   * Returns the list of indices
   *
   * @param bool $localize
   *
   * @return array
   */
  public static function indices($localize = TRUE) {
    $indices = [
      'UI_name' => [
        'name' => 'UI_name',
        'field' => [
          0 => 'name',
        ],
        'localizable' => FALSE,
        'sig' => 'civicrm_mapping::0::name',
      ],
    ];
    return ($localize && !empty($indices)) ? CRM_Core_DAO_AllCoreTables::multilingualize(__CLASS__, $indices) : $indices;
  }

}
