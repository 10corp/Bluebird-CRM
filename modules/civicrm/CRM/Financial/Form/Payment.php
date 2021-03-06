<?php
/*
 +--------------------------------------------------------------------+
 | CiviCRM version 4.7                                                |
 +--------------------------------------------------------------------+
 | Copyright CiviCRM LLC (c) 2004-2018                                |
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
 * @copyright CiviCRM LLC (c) 2004-2018
 */
class CRM_Financial_Form_Payment extends CRM_Core_Form {

  /**
   * @var int
   */
  protected $_paymentProcessorID;
  protected $currency;

  public $_values = array();

  /**
   * @var array
   */
  public $_paymentProcessor;

  /**
   * @var bool
   */
  public $isBackOffice = FALSE;

  /**
   * @var String
   */
  public $_formName = '';

  /**
   * Set variables up before form is built.
   */
  public function preProcess() {
    parent::preProcess();

    $this->_formName = CRM_Utils_Request::retrieve('formName', 'String', $this);

    $this->_values['custom_pre_id'] = CRM_Utils_Request::retrieve('pre_profile_id', 'Integer', $this);

    $this->_paymentProcessorID = CRM_Utils_Request::retrieve('processor_id', 'Integer', CRM_Core_DAO::$_nullObject,
      TRUE);
    $this->currency = CRM_Utils_Request::retrieve('currency', 'String', CRM_Core_DAO::$_nullObject,
      TRUE);

    $this->paymentInstrumentID = CRM_Utils_Request::retrieve('payment_instrument_id', 'Integer');
    $this->isBackOffice = CRM_Utils_Request::retrieve('is_back_office', 'Integer');

    $this->assignBillingType();

    $this->_paymentProcessor = CRM_Financial_BAO_PaymentProcessor::getPayment($this->_paymentProcessorID);

    CRM_Core_Payment_ProcessorForm::preProcess($this);

    self::addCreditCardJs($this->_paymentProcessorID);

    $this->assign('paymentProcessorID', $this->_paymentProcessorID);
    $this->assign('currency', $this->currency);

    $this->assign('suppressForm', TRUE);
    $this->controller->_generateQFKey = FALSE;
  }

  /**
   * Get currency
   *
   * @param array $submittedValues
   *   Required for consistency with other form methods.
   *
   * @return string
   */
  public function getCurrency($submittedValues = array()) {
    return $this->currency;
  }

  /**
   * Build quickForm.
   */
  public function buildQuickForm() {
    CRM_Core_Payment_ProcessorForm::buildQuickForm($this);
  }

  /**
   * Set default values for the form.
   */
  public function setDefaultValues() {
    $contactID = $this->getContactID();
    CRM_Core_Payment_Form::setDefaultValues($this, $contactID);
    return $this->_defaults;
  }

  /**
   * Add JS to show icons for the accepted credit cards.
   *
   * @param int $paymentProcessorID
   * @param string $region
   */
  public static function addCreditCardJs($paymentProcessorID = NULL, $region = 'billing-block') {
    $creditCards = CRM_Financial_BAO_PaymentProcessor::getCreditCards($paymentProcessorID);
    $creditCardTypes = CRM_Core_Payment_Form::getCreditCardCSSNames($creditCards);
    CRM_Core_Resources::singleton()
      // CRM-20516: add BillingBlock script on billing-block region
      //  to support this feature in payment form snippet too.
      ->addScriptFile('civicrm', 'templates/CRM/Core/BillingBlock.js', 10, $region, FALSE)
      // workaround for CRM-13634
      // ->addSetting(array('config' => array('creditCardTypes' => $creditCardTypes)));
      ->addScript('CRM.config.creditCardTypes = ' . json_encode($creditCardTypes) . ';', '-9999', $region);
  }

}
