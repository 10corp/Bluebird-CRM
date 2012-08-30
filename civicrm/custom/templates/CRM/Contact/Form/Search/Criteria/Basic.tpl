{*
 +--------------------------------------------------------------------+
 | CiviCRM version 4.2                                                |
 +--------------------------------------------------------------------+
 | Copyright CiviCRM LLC (c) 2004-2012                                |
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
	<table class="form-layout">
		<tr>
            <td><label>{ts}Complete OR Partial Name{/ts}</label>&nbsp;{help id='id-advanced-intro'}<br />
                {$form.sort_name.html|crmReplace:class:big}
            </td>
            <td>
                <label>{ts}Complete OR Partial Email{/ts}</label><br />
                {$form.email.html|crmReplace:class:big}<br />
                {$form.email_primary.html} {$form.email_primary.label}
            </td>
            <td>
                {if $form.component_mode}  
                    {$form.component_mode.label} {help id="id-display-results"}
                    <br />
                    {$form.component_mode.html}
{if $form.display_relationship_type}
            <span id="crm-display_relationship_type">{$form.display_relationship_type.html}</span>
{/if}
                {else}
                    &nbsp;
                {/if}
            </td>
            {*NYSS suppress profile results option
            <td class="advsearch_profile">
                {$form.uf_group_id.label} {help id="id-search-views"}<br />{$form.uf_group_id.html}
            </td>
            *}
            <td>
                {$form.operator.label} {help id="id-search-operator"}<br />{$form.operator.html}
            </td>
            
            <td class="advsearch_buttons_top">
            	<div class="crm-submit-buttons">{$form.buttons.html}</div>
                <a href="/civicrm/contact/search/advanced&reset=1" class="resetbutton">
                	<span>Reset Form</span>
                </a>
    
            </td>       
        </tr>
		<tr>
{if $form.contact_type || $form.group}
            <td id="advSearchContactTypesGroups" colspan="2">
              <div class="crm-section tag-section contact-types">
              	<div class="label">
                <label>{ts}Contact Type(s){/ts}</label>
                </div>
                <div class="content">
                {$form.contact_type.html}
                 {literal}
					<script type="text/javascript">

								cj("select#contact_type").crmasmSelect({
									addItemTarget: 'bottom',
									animate: false,
									highlight: true,
									sortable: true,
									respectParents: true
								});

						</script>
					{/literal}
                </div>
              </div>
              <div class="crm-section tag-section contact-groups">
                <div class="label">
                <label>{ts}Group(s){/ts}</label>
                </div>
                <div class="content">
                {$form.group.html}
                {literal}
                <script type="text/javascript">
                cj("select#group").crmasmSelect({
                    addItemTarget: 'bottom',
                    animate: false,
                    highlight: true,
                    sortable: true,
                    respectParents: true
                });

                </script>
                {/literal}
                </div>
              </div>
            </td>
{/if}

{if $form.contact_tags}
            <td colspan="3" id="advSearchContactTags">
            	<div class="crm-section tag-section contact-issue-codes">
                  <div class="label">
                  	<label>{ts}Issue Code(s){/ts}</label>{*NYSS*}
                  </div>
                  <div class="content">
                  	{$form.contact_tags.html}
                  	{literal}
                  	<script type="text/javascript">
                  	cj("select#contact_tags").crmasmSelect({
                  	  addItemTarget: 'bottom',
                  	  animate: false,
                  	  highlight: true,
                  	  sortable: true,
                  	  respectParents: true
                  	});
                  </script>
                  {/literal}
                  </div>
                </div>
            
            	{include file="CRM/common/Tag.tpl"}{*NYSS*}
                
                {*NYSS tag search*}
                <div class="crm-section tag-section tag-free-search">
                  <div class="label">
                    <label>{$form.tag_search.label}</label>
                  </div>
                  <div class="content">
                    {$form.tag_search.html|crmReplace:class:big}
                  </div>
                </div>
            </td>
{else}
            <td>&nbsp;</td>
{/if}
	    </tr>
        
        <tr>
            <td colspan="2">
                {*NYSS 4407*}
                <table class="form-layout-compressed search-privacy-options">
                <tr>
                    <td colspan="2">
                        {$form.privacy_toggle.html} {help id="id-privacy"}
                    </td>
                </tr>
                <tr>
                    <td>
                        {$form.privacy_options.html}
                    </td>
                    <td>
                        {$form.privacy_operator.html}
                    </td>
                </tr>
                </table>
                {literal}
                  <script type="text/javascript">
                    cj("select#privacy_options").crmasmSelect({
                     addItemTarget: 'bottom',
                     animate: false,
                     highlight: true,
                     sortable: true,
                    });
                  </script>
                {/literal}
            </td>
            <td colspan="2">
                {$form.preferred_communication_method.label}<br />
                {$form.preferred_communication_method.html}<br />
                <div class="spacer"></div>
                {$form.email_on_hold.html} {$form.email_on_hold.label}
            </td>
            
            <td>{$form.preferred_language.label}<br />
                {$form.preferred_language.html|crmReplace:class:medium}
            </td>
        </tr>
        <tr>
            <td>
                {$form.contact_source.label}<br />
                {$form.contact_source.html|crmReplace:class:medium}
            </td>
            <td>
                {$form.job_title.label}<br />
                {$form.job_title.html|crmReplace:class:medium}
            </td>
            <td colspan="3">
                {if $form.deleted_contacts}<br />{$form.deleted_contacts.html} {$form.deleted_contacts.label}{else}&nbsp;{/if}
            </td>
        </tr>
        
    </table>
