{*
 +--------------------------------------------------------------------+
 | CiviCRM version 3.2                                                |
 +--------------------------------------------------------------------+
 | Copyright CiviCRM LLC (c) 2004-2010                                |
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
{* tpl for building Organization related fields *}
<!--<pre>{$form|@print_r}</pre>-->

<table class="form-layout-compressed">
	<tr>
		<td>
       		{$form.organization_name.label}<br/>
        	{if $action == 2}
        	    {include file='CRM/Core/I18n/Dialog.tpl' table='civicrm_contact' field='organization_name' id=$entityID}
        	{/if}
       		{$form.organization_name.html|crmReplace:class:big}
        </td>
		<td>
        	{$form.legal_name.label}<br/>
       		{$form.legal_name.html|crmReplace:class:big}
        </td>
		<td>
        	{$form.nick_name.label}<br/>
       		{$form.nick_name.html|crmReplace:class:big}
        </td>
        <td>
        	{assign var='custom_41' value='custom_41_-1'}
            {$form.$custom_41.label}<br/>
       		{$form.$custom_41.html}
		</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
	</tr>
    <tr>
		<td>
        	{assign var='custom_26' value='custom_26_-1'}
            {$form.$custom_26.label}<br/>
       		{$form.$custom_26.html|crmReplace:class:big}
        </td>
        <td>
        	{assign var='custom_25' value='custom_25_-1'}
            {$form.$custom_25.label}<br/>
       		{$form.$custom_25.html|crmReplace:class:big}
        </td>
		<td>
        	{$form.sic_code.label}<br/>
       		{$form.sic_code.html|crmReplace:class:big}
        </td>
        <td>
       		{$form.contact_source.label}<br />
            {$form.contact_source.html|crmReplace:class:big}
       	</td>
        <td>
        	{$form.external_identifier.label}<br />
            {$form.external_identifier.value}
        </td>
        <td>
        	<label for="internal_identifier">{ts}Internal Id{/ts}</label><br />
            {$contactId}
        </td>
	</tr>
</table>
