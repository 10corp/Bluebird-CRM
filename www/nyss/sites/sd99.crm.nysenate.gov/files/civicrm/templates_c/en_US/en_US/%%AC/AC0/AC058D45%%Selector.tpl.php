<?php /* Smarty version 2.6.26, created on 2010-08-20 16:26:04
         compiled from CRM/Case/Form/Selector.tpl */ ?>
<?php require_once(SMARTY_CORE_DIR . 'core.load_plugins.php');
smarty_core_load_plugins(array('plugins' => array(array('block', 'ts', 'CRM/Case/Form/Selector.tpl', 38, false),array('function', 'counter', 'CRM/Case/Form/Selector.tpl', 55, false),array('function', 'cycle', 'CRM/Case/Form/Selector.tpl', 58, false),array('function', 'crmURL', 'CRM/Case/Form/Selector.tpl', 86, false),array('modifier', 'crmDate', 'CRM/Case/Form/Selector.tpl', 94, false),array('modifier', 'replace', 'CRM/Case/Form/Selector.tpl', 97, false),)), $this); ?>
<?php if ($this->_tpl_vars['context'] == 'Search'): ?>
    <?php $_smarty_tpl_vars = $this->_tpl_vars;
$this->_smarty_include(array('smarty_include_tpl_file' => "CRM/common/pager.tpl", 'smarty_include_vars' => array('location' => 'top')));
$this->_tpl_vars = $_smarty_tpl_vars;
unset($_smarty_tpl_vars);
 ?>
<?php endif; ?>
<?php echo '<table class="caseSelector"><tr class="columnheader">'; ?><?php if (! $this->_tpl_vars['single'] && $this->_tpl_vars['context'] == 'Search'): ?><?php echo '<th scope="col" title="Select Rows">'; ?><?php echo $this->_tpl_vars['form']['toggleSelect']['html']; ?><?php echo '</th>'; ?><?php endif; ?><?php echo ''; ?><?php if ($this->_tpl_vars['single']): ?><?php echo '<th scope="col">'; ?><?php $this->_tag_stack[] = array('ts', array()); $_block_repeat=true;smarty_block_ts($this->_tag_stack[count($this->_tag_stack)-1][1], null, $this, $_block_repeat);while ($_block_repeat) { ob_start(); ?><?php echo 'ID'; ?><?php $_block_content = ob_get_contents(); ob_end_clean(); $_block_repeat=false;echo smarty_block_ts($this->_tag_stack[count($this->_tag_stack)-1][1], $_block_content, $this, $_block_repeat); }  array_pop($this->_tag_stack); ?><?php echo '</th>'; ?><?php else: ?><?php echo '<th></th>'; ?><?php endif; ?><?php echo ''; ?><?php $_from = $this->_tpl_vars['columnHeaders']; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array'); }if (count($_from)):
    foreach ($_from as $this->_tpl_vars['header']):
?><?php echo '<th scope="col">'; ?><?php if ($this->_tpl_vars['header']['sort']): ?><?php echo ''; ?><?php $this->assign('key', $this->_tpl_vars['header']['sort']); ?><?php echo ''; ?><?php echo $this->_tpl_vars['sort']->_response[$this->_tpl_vars['key']]['link']; ?><?php echo ''; ?><?php else: ?><?php echo ''; ?><?php echo $this->_tpl_vars['header']['name']; ?><?php echo ''; ?><?php endif; ?><?php echo '</th>'; ?><?php endforeach; endif; unset($_from); ?><?php echo '</tr>'; ?><?php echo smarty_function_counter(array('start' => 0,'skip' => 1,'print' => false), $this);?><?php echo ''; ?><?php $_from = $this->_tpl_vars['rows']; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array'); }if (count($_from)):
    foreach ($_from as $this->_tpl_vars['row']):
?><?php echo '<tr id=\'rowid'; ?><?php echo $this->_tpl_vars['list']; ?><?php echo ''; ?><?php echo $this->_tpl_vars['row']['case_id']; ?><?php echo '\' class="'; ?><?php echo smarty_function_cycle(array('values' => "odd-row,even-row"), $this);?><?php echo ' crm-case crm-case-status_'; ?><?php echo $this->_tpl_vars['row']['case_status_id']; ?><?php echo ' crm-case-type_'; ?><?php echo $this->_tpl_vars['row']['case_type_id']; ?><?php echo '">'; ?><?php if ($this->_tpl_vars['context'] == 'Search' && ! $this->_tpl_vars['single']): ?><?php echo ''; ?><?php $this->assign('cbName', $this->_tpl_vars['row']['checkbox']); ?><?php echo '<td>'; ?><?php echo $this->_tpl_vars['form'][$this->_tpl_vars['cbName']]['html']; ?><?php echo '</td>'; ?><?php endif; ?><?php echo ''; ?><?php if ($this->_tpl_vars['single']): ?><?php echo '<td class="crm-case-id crm-case-id_'; ?><?php echo $this->_tpl_vars['row']['case_id']; ?><?php echo '">'; ?><?php echo $this->_tpl_vars['row']['case_id']; ?><?php echo '</td>'; ?><?php endif; ?><?php echo ''; ?><?php if ($this->_tpl_vars['context'] != 'case'): ?><?php echo '<td class="crm-case-id crm-case-id_'; ?><?php echo $this->_tpl_vars['row']['case_id']; ?><?php echo '"><span id="'; ?><?php echo $this->_tpl_vars['list']; ?><?php echo ''; ?><?php echo $this->_tpl_vars['row']['case_id']; ?><?php echo '_show"><a href="#" onclick="show(\'caseDetails'; ?><?php echo $this->_tpl_vars['list']; ?><?php echo ''; ?><?php echo $this->_tpl_vars['row']['case_id']; ?><?php echo '\', \'table-row\');buildCaseDetails(\''; ?><?php echo $this->_tpl_vars['list']; ?><?php echo ''; ?><?php echo $this->_tpl_vars['row']['case_id']; ?><?php echo '\',\''; ?><?php echo $this->_tpl_vars['row']['contact_id']; ?><?php echo '\');hide(\''; ?><?php echo $this->_tpl_vars['list']; ?><?php echo ''; ?><?php echo $this->_tpl_vars['row']['case_id']; ?><?php echo '_show\');show(\'minus'; ?><?php echo $this->_tpl_vars['list']; ?><?php echo ''; ?><?php echo $this->_tpl_vars['row']['case_id']; ?><?php echo '_hide\');show(\''; ?><?php echo $this->_tpl_vars['list']; ?><?php echo ''; ?><?php echo $this->_tpl_vars['row']['case_id']; ?><?php echo '_hide\',\'table-row\');return false;"><img src="'; ?><?php echo $this->_tpl_vars['config']->resourceBase; ?><?php echo 'i/TreePlus.gif" class="action-icon" alt="'; ?><?php $this->_tag_stack[] = array('ts', array()); $_block_repeat=true;smarty_block_ts($this->_tag_stack[count($this->_tag_stack)-1][1], null, $this, $_block_repeat);while ($_block_repeat) { ob_start(); ?><?php echo 'open section'; ?><?php $_block_content = ob_get_contents(); ob_end_clean(); $_block_repeat=false;echo smarty_block_ts($this->_tag_stack[count($this->_tag_stack)-1][1], $_block_content, $this, $_block_repeat); }  array_pop($this->_tag_stack); ?><?php echo '"/></a></span><span id="minus'; ?><?php echo $this->_tpl_vars['list']; ?><?php echo ''; ?><?php echo $this->_tpl_vars['row']['case_id']; ?><?php echo '_hide"><a href="#" onclick="hide(\'caseDetails'; ?><?php echo $this->_tpl_vars['list']; ?><?php echo ''; ?><?php echo $this->_tpl_vars['row']['case_id']; ?><?php echo '\');show(\''; ?><?php echo $this->_tpl_vars['list']; ?><?php echo ''; ?><?php echo $this->_tpl_vars['row']['case_id']; ?><?php echo '_show\', \'table-row\');hide(\''; ?><?php echo $this->_tpl_vars['list']; ?><?php echo ''; ?><?php echo $this->_tpl_vars['row']['case_id']; ?><?php echo '_hide\');hide(\'minus'; ?><?php echo $this->_tpl_vars['list']; ?><?php echo ''; ?><?php echo $this->_tpl_vars['row']['case_id']; ?><?php echo '_hide\');return false;"><img src="'; ?><?php echo $this->_tpl_vars['config']->resourceBase; ?><?php echo 'i/TreeMinus.gif" class="action-icon" alt="'; ?><?php $this->_tag_stack[] = array('ts', array()); $_block_repeat=true;smarty_block_ts($this->_tag_stack[count($this->_tag_stack)-1][1], null, $this, $_block_repeat);while ($_block_repeat) { ob_start(); ?><?php echo 'open section'; ?><?php $_block_content = ob_get_contents(); ob_end_clean(); $_block_repeat=false;echo smarty_block_ts($this->_tag_stack[count($this->_tag_stack)-1][1], $_block_content, $this, $_block_repeat); }  array_pop($this->_tag_stack); ?><?php echo '"/></a></td>'; ?><?php endif; ?><?php echo ''; ?><?php if (! $this->_tpl_vars['single']): ?><?php echo '<td class="crm-case-id crm-case-id_'; ?><?php echo $this->_tpl_vars['row']['case_id']; ?><?php echo '"><a href="'; ?><?php echo CRM_Utils_System::crmURL(array('p' => 'civicrm/contact/view','q' => "reset=1&cid=".($this->_tpl_vars['row']['contact_id'])), $this);?><?php echo '" title="'; ?><?php $this->_tag_stack[] = array('ts', array()); $_block_repeat=true;smarty_block_ts($this->_tag_stack[count($this->_tag_stack)-1][1], null, $this, $_block_repeat);while ($_block_repeat) { ob_start(); ?><?php echo 'view contact details'; ?><?php $_block_content = ob_get_contents(); ob_end_clean(); $_block_repeat=false;echo smarty_block_ts($this->_tag_stack[count($this->_tag_stack)-1][1], $_block_content, $this, $_block_repeat); }  array_pop($this->_tag_stack); ?><?php echo '">'; ?><?php echo $this->_tpl_vars['row']['sort_name']; ?><?php echo '</a>'; ?><?php if ($this->_tpl_vars['row']['phone']): ?><?php echo '<br /><span class="description">'; ?><?php echo $this->_tpl_vars['row']['phone']; ?><?php echo '</span>'; ?><?php endif; ?><?php echo '<br /><span class="description">'; ?><?php $this->_tag_stack[] = array('ts', array()); $_block_repeat=true;smarty_block_ts($this->_tag_stack[count($this->_tag_stack)-1][1], null, $this, $_block_repeat);while ($_block_repeat) { ob_start(); ?><?php echo 'Case ID'; ?><?php $_block_content = ob_get_contents(); ob_end_clean(); $_block_repeat=false;echo smarty_block_ts($this->_tag_stack[count($this->_tag_stack)-1][1], $_block_content, $this, $_block_repeat); }  array_pop($this->_tag_stack); ?><?php echo ': '; ?><?php echo $this->_tpl_vars['row']['case_id']; ?><?php echo '</span></td>'; ?><?php endif; ?><?php echo '<td class="'; ?><?php echo $this->_tpl_vars['row']['class']; ?><?php echo ' crm-case-status_'; ?><?php echo $this->_tpl_vars['row']['case_status_id']; ?><?php echo '">'; ?><?php echo $this->_tpl_vars['row']['case_status_id']; ?><?php echo '</td><td class="crm-case-case_type_id">'; ?><?php echo $this->_tpl_vars['row']['case_type_id']; ?><?php echo '</td><td class="crm-case-case_role">'; ?><?php if ($this->_tpl_vars['row']['case_role']): ?><?php echo ''; ?><?php echo $this->_tpl_vars['row']['case_role']; ?><?php echo ''; ?><?php else: ?><?php echo '---'; ?><?php endif; ?><?php echo '</td><td class="crm-case-case_manager">'; ?><?php if ($this->_tpl_vars['row']['casemanager_id']): ?><?php echo '<a href="'; ?><?php echo CRM_Utils_System::crmURL(array('p' => 'civicrm/contact/view','q' => "reset=1&cid=".($this->_tpl_vars['row']['casemanager_id'])), $this);?><?php echo '">'; ?><?php echo $this->_tpl_vars['row']['casemanager']; ?><?php echo '</a>'; ?><?php else: ?><?php echo '---'; ?><?php endif; ?><?php echo '</td><td class="crm-case-case_recent_activity_type">'; ?><?php if ($this->_tpl_vars['row']['case_recent_activity_type']): ?><?php echo ''; ?><?php echo $this->_tpl_vars['row']['case_recent_activity_type']; ?><?php echo '<br />'; ?><?php echo ((is_array($_tmp=$this->_tpl_vars['row']['case_recent_activity_date'])) ? $this->_run_mod_handler('crmDate', true, $_tmp) : smarty_modifier_crmDate($_tmp)); ?><?php echo ''; ?><?php else: ?><?php echo '---'; ?><?php endif; ?><?php echo '</td><td class="crm-case-case_scheduled_activity_type">'; ?><?php if ($this->_tpl_vars['row']['case_scheduled_activity_type']): ?><?php echo ''; ?><?php echo $this->_tpl_vars['row']['case_scheduled_activity_type']; ?><?php echo '<br />'; ?><?php echo ((is_array($_tmp=$this->_tpl_vars['row']['case_scheduled_activity_date'])) ? $this->_run_mod_handler('crmDate', true, $_tmp) : smarty_modifier_crmDate($_tmp)); ?><?php echo ''; ?><?php else: ?><?php echo '---'; ?><?php endif; ?><?php echo '</td><td>'; ?><?php echo ((is_array($_tmp=$this->_tpl_vars['row']['action'])) ? $this->_run_mod_handler('replace', true, $_tmp, 'xx', $this->_tpl_vars['row']['case_id']) : smarty_modifier_replace($_tmp, 'xx', $this->_tpl_vars['row']['case_id'])); ?><?php echo '</td></tr>'; ?><?php if ($this->_tpl_vars['context'] != 'case'): ?><?php echo '<tr id="'; ?><?php echo $this->_tpl_vars['list']; ?><?php echo ''; ?><?php echo $this->_tpl_vars['row']['case_id']; ?><?php echo '_hide" class=\''; ?><?php echo $this->_tpl_vars['rowClass']; ?><?php echo '\'><td></td>'; ?><?php if ($this->_tpl_vars['context'] == 'Search'): ?><?php echo '<td colspan="10" class="enclosingNested">'; ?><?php else: ?><?php echo '<td colspan="9" class="enclosingNested">'; ?><?php endif; ?><?php echo '<div id="caseDetails'; ?><?php echo $this->_tpl_vars['list']; ?><?php echo ''; ?><?php echo $this->_tpl_vars['row']['case_id']; ?><?php echo '"></div></td></tr><script type="text/javascript">hide(\''; ?><?php echo $this->_tpl_vars['list']; ?><?php echo ''; ?><?php echo $this->_tpl_vars['row']['case_id']; ?><?php echo '_hide\');hide(\'minus'; ?><?php echo $this->_tpl_vars['list']; ?><?php echo ''; ?><?php echo $this->_tpl_vars['row']['case_id']; ?><?php echo '_hide\');</script>'; ?><?php endif; ?><?php echo ''; ?><?php endforeach; endif; unset($_from); ?><?php echo ''; ?><?php echo ''; ?><?php if ($this->_tpl_vars['context'] == 'dashboard' && $this->_tpl_vars['limit'] && $this->_tpl_vars['pager']->_totalItems > $this->_tpl_vars['limit']): ?><?php echo '<tr class="even-row"><td colspan="10"><a href="'; ?><?php echo CRM_Utils_System::crmURL(array('p' => 'civicrm/case/search','q' => 'reset=1'), $this);?><?php echo '">&raquo; '; ?><?php $this->_tag_stack[] = array('ts', array()); $_block_repeat=true;smarty_block_ts($this->_tag_stack[count($this->_tag_stack)-1][1], null, $this, $_block_repeat);while ($_block_repeat) { ob_start(); ?><?php echo 'Find more cases'; ?><?php $_block_content = ob_get_contents(); ob_end_clean(); $_block_repeat=false;echo smarty_block_ts($this->_tag_stack[count($this->_tag_stack)-1][1], $_block_content, $this, $_block_repeat); }  array_pop($this->_tag_stack); ?><?php echo '... </a></td></tr>'; ?><?php endif; ?><?php echo '</table>'; ?>


<?php $_smarty_tpl_vars = $this->_tpl_vars;
$this->_smarty_include(array('smarty_include_tpl_file' => "CRM/common/activityView.tpl", 'smarty_include_vars' => array()));
$this->_tpl_vars = $_smarty_tpl_vars;
unset($_smarty_tpl_vars);
 ?>
<div id="view-activity" style="display:none;">
     <div id="activity-content"></div>
</div>
<?php if ($this->_tpl_vars['context'] == 'Search'): ?>
 <script type="text/javascript">
     var fname = "<?php echo $this->_tpl_vars['form']['formName']; ?>
";	
    on_load_init_checkboxes(fname);
 </script>
<?php endif; ?>

<?php if ($this->_tpl_vars['context'] == 'Search'): ?>
    <?php $_smarty_tpl_vars = $this->_tpl_vars;
$this->_smarty_include(array('smarty_include_tpl_file' => "CRM/common/pager.tpl", 'smarty_include_vars' => array('location' => 'bottom')));
$this->_tpl_vars = $_smarty_tpl_vars;
unset($_smarty_tpl_vars);
 ?>
<?php endif; ?>

<?php echo '
<script type="text/javascript">

function buildCaseDetails( caseId, contactId )
{
  var dataUrl = '; ?>
"<?php echo CRM_Utils_System::crmURL(array('p' => 'civicrm/case/details','h' => 0,'q' => 'snippet=4&caseId='), $this);?>
<?php echo '" + caseId +\'&cid=\' + contactId;
  cj.ajax({
            url     : dataUrl,
            dataType: "html",
            timeout : 5000, //Time in milliseconds
            success : function( data ){
                           cj( \'#caseDetails\' + caseId ).html( data );
                      },
            error   : function( XMLHttpRequest, textStatus, errorThrown ) {
                              console.error( \'Error: \'+ textStatus );
                    }
         });
}
</script>

'; ?>
	