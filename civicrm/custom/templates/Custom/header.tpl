{*
 +--------------------------------------------------------------------+
 | CiviCRM version 3.1                                                |
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

{if not $urlIsPublic}
 <div id="header-access">
 {ts}Access Keys:{/ts}{help id='accesskeys'}
 </div>
{/if}

<div class="civi-search-section">
<div class="civi-contact-search">
	<div class="civi-search-title">Find Contacts</div>
{if call_user_func(array('CRM_Core_Permission','giveMeAllACLs'))}
            <form action="{crmURL p='civicrm/contact/search/basic' h=0 }" name="search_block" id="id_search_block" method="post" onsubmit="getSearchURLValue( );">
            	<div class="input-wrapper">
                <input type="text" class="form-text" id="civi_sort_name" name="sort_name" value="enter name or email"/>
                <input type="hidden" id="sort_contact_id" value="" />
                <input type="submit" value="{ts}Go{/ts}" name="_qf_Basic_refresh" class="form-submit default" style="display: none;"/>
            	</div>
            </form>
	{/if}

</div>

<div class="civi-general-search">
	<div class="civi-search-title">Find Anything!</div>
{if call_user_func(array('CRM_Core_Permission','giveMeAllACLs'))}
  
            
<form id="id_search_block" name="Custom" method="post" action="{crmURL p='civicrm/contact/search/custom' h=0 }">
            	<div class="input-wrapper" id="gen-search-wrapper">

    <input type="text" class="form-text" id="civi_text_search" name="text" value="enter any text">
    <input type="hidden" id="table" name="table" value="">
	<input type="submit" value="Search" name="_qf_Custom_refresh" style="display: none;" class="form-submit default"> 
</div>
</form>
{literal}
<script>
$('.civi-general-search').append('<div id="general-form-hack"></div>');
	$('#general-form-hack').hide()
		.load('{/literal}{crmURL p='civicrm/contact/search/custom&csid=15&reset=1&snippet=1'}{literal}', 
			function(){
				$('#general-form-hack #Custom input[type=hidden]').appendTo('#gen-search-wrapper');
			});
</script>
{/literal}

            
            
            
            
            
	{/if}

</div>
<span class="primary-link create-link">
		<span id="create-link" class="main-menu-item">
			<div class="skin-icon link-icon"></div>
			CREATE
			
		</span>
		<div class="menu-container">
			<ul class="menu-ul innerbox">

	{if call_user_func(array('CRM_Core_Permission','check'), 'view all activities')}
	<li><div class="menu-item">
	<a href="{crmURL p='civicrm/activity&reset=1&action=add&context=standalone'}">New Activity</a></div></li>
    {/if}
	{if call_user_func(array('CRM_Core_Permission','check'), 'access all cases and activities')}
		<li><div class="menu-item">
		<a href="{crmURL p='civicrm/case/add&reset=1&action=add&atype=13&context=standalone'}">New Case</a></div></li>
	{/if}
	{if call_user_func(array('CRM_Core_Permission','check'), 'add contacts')}
		<li><div class="menu-item">
		<a href="{crmURL p='civicrm/activity/add&atype=3&action=add&reset=1&context=standalone'}">New Email</a></div></li>
	{/if}
	{if call_user_func(array('CRM_Core_Permission','check'), 'add contacts')}
		<li style="position: relative;" class="menu-separator"><div class="menu-item"></div></li>	
		<li><div class="menu-item">
		<a href="{crmURL p='civicrm/contact/add&reset=1&ct=Individual'}">New Individual</a></div></li>
		<li><div class="menu-item">
		<a href="{crmURL p='civicrm/contact/add&reset=1&ct=Household'}">New Household</a></div></li>
		<li><div class="menu-item">
		<a href="{crmURL p='civicrm/contact/add&reset=1&ct=Organization'}">New Organization</a></div></li>
	{/if}
	</ul>
		</div>
	</span><!-- /.custom-search-link -->	

</div>
<div id="bluebirds"></div>
<div class="clear"></div>
<div class="civi-navigation-section">
<div class="civi-adv-search-linkwrap">
{if $ssID or $rows or $savedSearch}
	<div class="civi-advanced-search-button">
	<div class="civi-advanced-search-link-inner">
		<span>
		<div class="icon crm-accordion-pointer"></div>
		{if $ssID or $rows}
  {if $savedSearch}
    {ts 1=$savedSearch.name}Edit %1 Smart Group Below{/ts}
  {else}
    {ts}Edit Search Criteria Below{/ts}
  {/if}
  {else}
  {if $savedSearch}
    {ts 1=$savedSearch.name}Edit %1 Smart Group Below{/ts}
  {else}
    {ts}Search Criteria Below{/ts}
  {/if}
  {/if}
		</span>
	</div>
	</div>	
{else}
	<div class="civi-advanced-search-link">
	<div class="civi-advanced-search-link-inner">
		<span>
		<div class="icon crm-accordion-pointer"></div>
		ADVANCED SEARCH
		</span>
	</div>
	</div>	
{/if}

</div>
<div class="civi-menu">
{if isset($browserPrint) and $browserPrint}
{* Javascript window.print link. Used for public pages where we can't do printer-friendly view. *}
<div id="printer-friendly">
<a href="javascript:window.print()" title="{ts}Print this page.{/ts}">
	<div class="ui-icon ui-icon-print"></div>
</a>
</div>
{else}
{* Printer friendly link/icon. *}
<div id="printer-friendly">
<a href="{$printerFriendly}" title="{ts}Printer-friendly view of this page.{/ts}">
	<div class="ui-icon ui-icon-print"></div>
</a>
</div>
{/if}
<ul id="nyss-menu">
{$navigation}
</ul>
{literal}
<script type="text/javascript">
	   cj('div#toolbar-box div.m').html(cj(".civi-menu").html());
	   cj('#nyss-menu').ready( function(){ 
			cj('.outerbox').css({ 'margin-top': '4px'});
			cj('#root-menu-div .menu-ul li').css({ 'padding-bottom' : '2px', 'margin-top' : '2px' });
			cj('img.menu-item-arrow').css({ 'top' : '4px' }); 
		});
		cj('#civicrm-home').parent().hide();
	var resourceBase   = {/literal}"{$config->resourceBase}"{literal};
	cj('#nyss-menu').menu( {arrowSrc: resourceBase + 'packages/jquery/css/images/arrow.png'} );
</script>
{/literal}

</div><!-- /.civi-menu -->

<div class="civi-adv-search-body crm-form-block">
	

	<div id="advanced-search-form"></div>
	
  {if $ssID or $rows or $savedSearch}
    
  {else}
    	
	{literal}
	<script>
	cj(document).ready(function() {
	 if (cj('form#Advanced').length == 0) {
	  cj('#advanced-search-form').load('{/literal}{crmURL p='civicrm/contact/search/advanced?reset=1&snippet=1'}{literal}');
	  } else {
	  cj('.civi-advanced-search-link').removeClass('civi-advanced-search-link').addClass('civi-advanced-search-button');
	  }
	  });
	</script>
	{/literal}

  {/if}

</div>





</div>





{literal}
<script>

    var contactUrl = {/literal}"{crmURL p='civicrm/ajax/rest' q='className=CRM_Contact_Page_AJAX&fnName=getContactList&json=1&context=navigation' h=0 }"{literal};

    cj( '#civi_sort_name' ).autocomplete( contactUrl, {
        width: 200,
        selectFirst: false,
        minChars:3,
        matchContains: true 	 
    }).result(function(event, data, formatted) {
       document.location={/literal}"{crmURL p='civicrm/contact/view' h=0 q='reset=1&cid='}"{literal}+data[1];
       return false;
    });    

</script>

{/literal}

{literal}
<script type="text/javascript">
cj(function() {
   cj().crmaccordions(); 
});
</script>
{/literal}

