{*
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
*}
{literal}
<script>
//put these in the start instance in the refactor
var BBCID = {/literal}{if isset($entityID) }{$entityID}{else}0{/if}{literal};
var BBActionConst = {/literal}{$action}{literal};
{/literal}{if !$form.tag.value}{literal}
	var BBLoadTaglist = null;
{/literal}{else}{literal}
	var BBLoadTaglist = [{/literal}{foreach key=tagID item=i from=$form.tag.value name=activeTagset}"{$tagID}"{if !$smarty.foreach.activeTagset.last},{/if}{/foreach}{literal}];
{/literal}{/if}{literal}
</script>
<link type="text/css" rel="stylesheet" media="screen,projection" href="/sites/default/themes/Bluebird/nyss_skin/tags/tags.css" />
<script src="/sites/default/themes/Bluebird/scripts/bbtree.js" type="text/javascript"></script>
<script>
BBTree.startInstance({pullSets: [291, 296], buttonType: 'tagging', onSave: true});
</script>
{/literal}
{if $title}
<div id="dialog"></div>{*NYSS*}

<div class="crm-accordion-wrapper crm-tagGroup-accordion collapsed">
  <div class="crm-accordion-header">{$title}</div>
  <div class="crm-accordion-body" id="tagGroup">
{/if}
  <table class="form-layout-compressed{if $context EQ 'profile'} crm-profile-tagsandgroups{/if}" style="width:98%">
    <tr>
      {if $groupElementType eq 'crmasmSelect'}
        <td style="width:45%;"><span class="label">{if $title}{$form.group.label}{/if}</span>
          {$form.group.html}
          {literal}
          <script type="text/javascript">
          cj(function(){
            cj("select#group").crmasmSelect({
              respectParents: true
            });
          });
          </script>
          {/literal}
        </td>
      {/if}
	  {foreach key=key item=item from=$tagGroup}
		{* $type assigned from dynamic.tpl *}
		{if !$type || $type eq $key }
		
			{if $key eq 'tag'}
				<td width="100%" class="crm-tagList"><div class="label" onClick="rollDownGroup('.crm-tagList');"><div class="arrow"></div>{if $title}{$form.$key.label}{/if}</div>
				  <div id="crm-tagListWrap">
						<div class="groupTagsKeywords">{include file="CRM/common/Tag.tpl"}</div>
					</div>
				</td>
			{/if}
			{if $key eq 'group'}
			{*<tr>
				<td width="100%" class="crm-tagGroupsList"><div class="label" onClick="rollDownGroup('.crm-tagGroupsList');"><div class="arrow"></div>{if $title}{$form.$key.label}{/if}</div>
				    <div id="crm-tagListWrap">
					    <table id="crm-tagGroupTable">
						{foreach key=k item=it from=$form.$key}
						    {if $k|is_numeric}
							<tr class={cycle values="'odd-row','even-row'" name=$key} id="crm-tagRow{$k}">
							    <td>
			                   			<strong>{$it.html}</strong><br /> *}{*NYSS retain for groups list*}{*
								{if $item.$k.description}
								    <div class="description">
									{$item.$k.description}
								    </div>
								{/if}
							    </td>
							</tr>
						    {/if}
						{/foreach}
					    </table>
				    </div>
				</td>
			</tr>
			<tr></tr>*}
			{/if}
		{/if}
	  {/foreach}
	  </tr>
  </table>
{if $title}
  </div>
</div><!-- /.crm-accordion-wrapper -->
{/if}
