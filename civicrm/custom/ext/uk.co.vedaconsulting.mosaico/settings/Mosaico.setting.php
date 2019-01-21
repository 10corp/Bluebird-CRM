<?php
return array(
  'mosaico_layout' => array(
    'group_name' => 'Mosaico Preferences',
    'group' => 'mosaico',
    'name' => 'mosaico_layout',
    'quick_form_type' => 'Select',
    'type' => 'String',
    'html_type' => 'Select',
    'html_attributes' => array(
      'class' => 'crm-select2',
    ),
    'pseudoconstant' => array(
      'callback' => 'CRM_Mosaico_Utils::getLayoutOptions',
    ),
    'default' => 'auto',
    'add' => '4.7',
    'title' => 'Mosaico editor layout',
    'is_domain' => 1,
    'is_contact' => 0,
    'description' => NULL,
    'help_text' => NULL,
  ),
  'mosaico_custom_templates_dir' => array(
    'group_name' => 'Mosaico Preferences',
    'group' => 'mosaico',
    'name' => 'mosaico_custom_templates_dir',
    'quick_form_type' => 'Element',
    'type' => 'String',
    'html_type' => 'Text',
    'default' => '[civicrm.files]/mosaico_tpl',
    'add' => '4.7',
    'title' => 'Mosaico Custom Templates Directory',
    'is_domain' => 1,
    'is_contact' => 0,
    'description' => NULL,
    'help_text' => NULL,
  ),
  'mosaico_custom_templates_url' => array(
    'group_name' => 'Mosaico Preferences',
    'group' => 'mosaico',
    'name' => 'mosaico_custom_templates_url',
    'quick_form_type' => 'Element',
    'type' => 'String',
    'html_type' => 'Text',
    'default' => '[civicrm.files]/mosaico_tpl',
    'add' => '4.7',
    'title' => 'Mosaico Custom Templates URL',
    'is_domain' => 1,
    'is_contact' => 0,
    'description' => NULL,
    'help_text' => NULL,
  ),
);