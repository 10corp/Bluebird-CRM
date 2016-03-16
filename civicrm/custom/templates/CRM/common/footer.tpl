{*
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
*}
{include file="CRM/common/bbversion.tpl" assign=bbversion}
{include file="CRM/Block/RecentlyViewed.extra.tpl"}{*NYSS*}
{include file="CRM/common/accesskeys.tpl"}
{if !empty($contactId)}
  {include file="CRM/common/contactFooter.tpl"}
{/if}

<div class="footer" id="civicrm-footer">{*NYSS*}
  {include file="CRM/common/version.tpl" assign=version}
Bluebird v{ts 1=$bbversion}%1.{/ts} Powered by <a href='http://civicrm.org/' target="_blank">CiviCRM</a> {ts 1=$version}%1.{/ts}<br />
CiviCRM{ts 1='http://www.gnu.org/licenses/agpl-3.0.html'} is openly available under the <a href='%1' target="_blank">GNU Affero General Public License (GNU AGPL)</a>.{/ts}
</div>
{include file="CRM/common/notifications.tpl"}
