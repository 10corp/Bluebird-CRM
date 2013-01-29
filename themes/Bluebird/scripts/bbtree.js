/*
* BBTree JS 0.8.2
* For Bluebird Version 1.4
* Now with infinite looping!
* And modular abilities!
* Last Updated: 1-23-2013
* Coded: Dan Pozzie (dpozzie@gmail.com)
*/

//alias/pathing object
var BBTree = {
	startInstance: function(config)
	{	
		//Check remote timestamp first
		//then check cookie timestamp	
		//if cookies found skip getAjaxData
		//if cookie is found, send json to separate.

		//set settings, 
		//BBTree.startInstance({displaySettings:{pullSets: [291,296], buttonType: 'edit'}}); 
		callTree.setCurrentSettings(config);
		BBTreeModal.makeModalInit();
	    //have to use a queue with ajax data because you do A, and once A is done, then do B.
	    cj({})
	    	.queue(BBTree.getAjaxData)
	    	.queue(BBTree.writeTree);
	},
	initContainer: function(instances, settings, contact)
	{
		//this is called x times, don't use each when none will do (this means you build boxes)
		//format ('className', {treesToWrite: [array], typeOfManip: [edit/manage], tabLocation: 'class'})
		//BBTree.initContainer('one', {write: [291,296], type: 'edit'});
		callTree.treeSetupPage(instances, settings, contact); 
	},
	getAjaxData: function(next)
	{
		 callTree.callTreeAjax(function(){next();});
	},
	writeTree: function(next)
	{
		//for multiple instantiations
		cj.each(callTree.currentSettings.instances, function(k, boxName){
			callTree.currentSettings.displaySettings = {};
			callTree.currentSettings.displaySettings['currentInstance'] = k;
			//copies all settings to a local setting
			cj.extend(callTree.currentSettings.displaySettings, callTree.currentSettings.instances[k].displaySettings);
			cj.extend(callTree.currentSettings.callSettings, callTree.currentSettings.instances[k].callSettings);
			//sets tree location variable which is used EVERYWHERE
			setTreeLoc();
			//puts ALL THE DATA into the BBTree object
			callTree.writeParsedData();
			callTree.writeTabs(); 
			//writes jquery slidedown function (but needs to make sure it writes the CORRECT tree)
			callTree.slideDownTree(); 
			//list of where you're located. I don't think it's actually useful.
			sortWindow(); 
			switch(callTree.currentSettings.displaySettings.buttonType) //useless.
			{
				case 'edit': BBTree.manageTree(); break;
				case 'tagging': BBTree.tagTree(); break;
			}
			//removes gif from each instance once both parts have loaded.
			cj.each(callTree.currentSettings.displaySettings.pullSets, function(i, className){
				cj('.'+k+'.'+addTagLabel(className)).removeClass('loadingGif');
			});
		});
		next();
	},
	manageTree: function()
	{
		BBTreeEdit.setTagInfo();
	},
	tagTree: function(cid, entity_type)
	{
		if(callTree.currentSettings.callSettings.ajaxSettings.entity_id == 0 || cid > 0)
		{
			BBTreeTag.getPageCID(cid, entity_type);
		}
		BBTreeTag.getContactTags(); // if get contact tags becomes an array, don't link together the apply/get.
	},
	addIndicator: function(code){ //makes the dropdown indicator work
		var messageHandler = callTree.currentSettings.pageSettings.messageHandler;
		var currentInstance = callTree.currentSettings.displaySettings.currentInstance;
		var codeName;
		var totMessages = cj(aCSel(currentInstance) + aCSel(messageHandler));
		var totLength = totMessages.length;
		var messageBox;
		if(totLength > 0)
		{
			totMessages.last().after('<div class="'+ messageHandler + ' ' + currentInstance+ '"></div>');
			messageBox = cj(aCSel(currentInstance) + aCSel(messageHandler)).last();
		}
		else if(totLength == 0)
		{
			cj(aIDSel(callTree.currentSettings.pageSettings.wrapper)).prepend('<div class="'+ messageHandler + ' ' + currentInstance+ '"></div>');
			messageBox = cj(aCSel(currentInstance) + aCSel(messageHandler));
			totMessages = messageBox;
		}
		switch(code.errorClass)
		{
			case 'BBSuccess': messageBox.addClass(code.errorClass).addClass('static').animate({'top': '+='+BBTree.messageBoxesHeight(totMessages)});  codeName = 'success';break;
			case 'BBWarning': messageBox.addClass(code.errorClass); codeName = 'warning';break;
			case 'BBError': messageBox.addClass(code.errorClass); codeName = 'error';break;
			default: codeName = 'notice'; BBTree.removeIndicator(messageBox); return true; break; //don't show notices
		}
		messageBox.prepend('<div class="title">'+BBTree.actionInfo.last.name+'</div>');
		messageBox.prepend('<div title="Close Message" class="closeMessage item-'+ totLength +'"></div>');
		cj('.closeMessage.item-'+ totLength, messageBox).click(function() {
			BBTree.removeIndicator(messageBox);
		});
		messageBox.append(BBTree.actionInfo.last.description);
		if(code.more.length > 2)
		{
			messageBox.append('<div title="See More Information" class="seeMore item-'+ totLength +'">More</div><div class="moreHidden item-'+ totLength +'">'+code.more+'</div>');
		}
		cj('.seeMore.item-'+ totLength, messageBox).click(function() {
			if(cj(this).hasClass('open'))
			{
				cj('.moreHidden.item-'+totLength, messageBox).slideUp().removeClass('open');
				cj('.seeMore.item-'+ totLength, messageBox).removeClass('open');
			}
			else
			{
				cj('.moreHidden.item-'+totLength, messageBox).slideDown().addClass('open');
				cj('.seeMore.item-'+ totLength, messageBox).addClass('open');
			}
			
		});
		messageBox.slideDown();
		setTimeout(function(){
			BBTree.removeIndicator(messageBox);
		}, BBTree.actionInfo.timeoutLength[codeName]);
	},
	messageBoxesHeight: function(boxes)
	{
		var totalBoxHeight = 0;
		boxes.each(function(i, k){
			var cBox = cj(k);
			if(!cBox.hasClass('static'))
			{
				totalBoxHeight += parseInt(cBox.css('height'));
				totalBoxHeight += parseInt(cBox.css('padding-top'));
				totalBoxHeight += parseInt(cBox.css('padding-bottom'));
				totalBoxHeight += parseInt(cBox.css('border-top-width'));
				totalBoxHeight += parseInt(cBox.css('border-bottom-width'));
			}
		});
		if(boxes.length == 1 && (totalBoxHeight < 15 || isNaN(totalBoxHeight)))
		{
			totalBoxHeight = 0;
		}
		return totalBoxHeight+'px';
	},
	removeIndicator: function(thisBox){
		thisBox.slideUp(function(){
			thisBox.remove();
		});
	},
	actionInfo: {
		timeoutLength: {
			success: 10000,
			warning: 30000,
			error: 1000000,
			notice: 2000
		},
		last: {
			name: null,
			description: null
		},
		countAction: 0
	},
	setLastAction: function(data){
		BBTree.actionInfo['action_'+BBTree.actionInfo.countAction] = {};
		cj.extend(BBTree.actionInfo['action_'+BBTree.actionInfo.countAction], BBTree.actionInfo.last);
		BBTree.actionInfo.last.name = data.name;
		BBTree.actionInfo.last.description = data.description;
		BBTree.actionInfo.last.more = data.more;
		BBTree.actionInfo.countAction++;
	},
	reportAction: function(data)
	{
		//action, code, to, from, this
		var message = [];
		var obj = {};
		var actionData = {name: '', description:'', more: '',reload:false};
		cj.each(data,function(i,k){
			if(typeof k === 'object'){
				cj.extend(obj, k);
				message[i] = 'object';
			}
			else if(typeof k === 'undefined')
			{
				message[i] = null;	
			} else {
				message[i] = k;
			}
		});
		var passes = true;
		actionData.more = JSON.stringify(obj);
		if(actionData.more.length > 150)
		{
			actionData.more.substring(0, 147);
			actionData.more += '...';
		}
		switch(message[1])
		{
			case 0: actionData.name += 'Error'; actionData['errorClass'] = 'BBError'; passes = false; break;
			case 2: actionData.name += 'Warning'; actionData['errorClass'] = 'BBWarning'; break;
			case 1: actionData.name += 'Success'; actionData['errorClass'] = 'BBSuccess'; break;
			default: actionData.name += 'Notice';
		}

		switch(message[0])
		{
			case 'craa': //["crar", 1, "123d", null] 
				actionData.name += ' - Add Tag';
				if(passes)
				{
					actionData.description += '<span>'+message[2] + '</span> has been added to this entity.';
				}
				else {
					actionData.description += '<span>'+message[2] + '</span> was unable to be added to this entity.';
				}
				break;
			case 'crar': //["crar", 1, "123d", null] 
				actionData.name += ' - Add Tag';
				if(passes)
				{
					actionData.description += '<span>'+ message[2] + '</span> has been removed from this entity.';
				}
				else {
					actionData.description += '<span>'+message[2] + '</span> was unable to be removed from this entity.';
				}
				break;
			case 'cta':
				actionData.name += ' - Get All Tags';
				if(passes)
				{
					actionData.description += 'Keywords and Issue Codes have been loaded successfully.';
				}
				else {
					actionData.description += 'Keywords and Issue Codes have been loaded unsuccessfully. Will attempt to reload again.';
					//if you load 3 times and it fails, throw a different message. 
					actionData.reload = true;
				}
				break;
			case 'gct':
				actionData.name += ' - Retrieve Contact Tags';
				if(passes)
				{
					actionData.description += 'Contact tags for <span>'+message[2]+'</span> have been loaded successfully.';
				}
				else { //would LOVE to be able to get contact name here...
					actionData.description += 'Contact tags for <span>'+message[2]+'</span> have been loaded unsuccessfully.';
					//if you load 3 times and it fails, throw a different message. 
				}
				break;
			case 'convt':
				//BBTree.reportAction(['convt',0,tagMove.currentId,BBTreeModal.radioSelectedTid, data.message]);
				//BBTree.reportAction(['convt',1,tagMove.currentId,BBTreeModal.radioSelectedTid]);
				var tagname = cj(aIDSel(addTagLabel(message[2])) + ' .tag .name').html();
				var tagdest = cj(aIDSel(addTagLabel(message[3])) + ' .tag .name').html();
				actionData.name += ' - Convert Keyword to Issue Code';
				if(passes)
				{
					actionData.description += 'Keyword <span>'+tagname+'</span> has been converted into an Issue Code under <span>'+tagdest+'</span>.';
				}
				else { 
					actionData.description += 'Keyword <span>'+tagname+'</span> failed to be converted into an Issue Code under <span>'+tagdest+'</span>.';
					actionData.more += message[4];
				}	
				break;
			case 'movct':
				//BBTree.reportAction(['movct',0,tagMove.currentId,BBTreeModal.radioSelectedTid, data.message]);
				var tagname = cj(aIDSel(addTagLabel(message[2])) + ' .tag .name').html();
				var tagdest = cj(aIDSel(addTagLabel(message[3])) + ' .tag .name').html();
				actionData.name += ' - Move Tag';
				if(passes)
				{
					actionData.description += 'Tag <span>'+tagname+'</span> has been moved successfully under <span>'+tagdest+'</span>.';
				}
				else { 
					actionData.description += 'Tag <span>'+tagname+'</span> failed to be moved successfully under <span>'+tagdest+'</span>.';
					actionData.more += message[4];
				}	
				break;
			case 'merct':
				//BBTree.reportAction(['merct',0,tagMove.currentId,BBTreeModal.radioSelectedTid, data.message]);
				var tagname = cj(aIDSel(addTagLabel(message[2])) + ' .tag .name').html();
				var tagdest = cj(aIDSel(addTagLabel(message[3])) + ' .tag .name').html();
				actionData.name += ' - Merge Tag';
				if(passes)
				{
					actionData.description += 'Tag <span>'+tagname+'</span> has been merged successfully into <span>'+tagdest+'</span>.';
				}
				else { 
					actionData.description += 'Tag <span>'+tagname+'</span> failed to be merged successfully into <span>'+tagdest+'</span>.';
					actionData.more += message[4];
				}	
				break;
			case 'updat':
				//BBTree.reportAction(['updat',0,tagUpdate, data.message]);
				var parentTagName = cj(aIDSel(addTagLabel(obj.parentId)) + ' .tag .name').html();
				actionData.name += ' - Update Tag';
				if(passes)
				{
					
					actionData.description += 'Tag <span>'+obj.prevName+'</span> has been updated successfully. ';
					if(obj.tagName != null || obj.prevName != obj.tagName)
					{
						actionData.description += 'It\'s new name is <span>'+obj.tagName+'</span>. ';
					}
					if(obj.description != null && obj.description != '' && obj.description != 'null')
					{
						actionData.description += 'It\'s new description is <span>'+obj.description+'</span>. ';
					}
					actionData.description += 'It is <span>';
					if(obj.isReserved == 0)
					{
						actionData.description += 'not ';
					}
					actionData.description += 'reserved</span>.';
				}
				else { //would LOVE to be able to get contact name here...
					actionData.description += 'Tag '+obj.taggedName+' failed to be updated.';
				}	
				break;
			case 'removt':
				//BBTree.reportAction(['removt',0,BBTreeModal.taggedName, tagRemove.parentId, data.message]);
				var parentTagName = cj(aIDSel(addTagLabel(message[3])) + ' .tag .name').html();
				actionData.name += ' - Remove Tag';
				if(passes)
				{
					actionData.description += 'Tag <span>'+message[2]+'</span> has been removed under <span>'+parentTagName+'</span>.';
				}
				else { //would LOVE to be able to get contact name here...
					actionData.description += 'Tag <span>'+message[2]+'</span> failed to be removed.';
					actionData.more += message[4];
				}	
				break;
			case 'addt':
				//BBTree.reportAction(['addt',1,tagUpdate, data.message]);
				var parentTagName = cj(aIDSel(addTagLabel(obj.parentId)) + ' .tag .name').html();
				actionData.name += ' - Add Tags';
				if(passes)
				{
					actionData.description += 'Tag <span>'+obj.tagName+'</span> has been added successfully under <span>'+parentTagName+'</span>. ';
					if(obj.tagName != null)
					{
						actionData.description += 'It\'s name is <span>'+obj.tagName+'</span>. ';
					}
					if(obj.description != null && obj.description != '' && obj.description != 'null')
					{
						actionData.description += 'It\'s description is <span>'+obj.description+'</span>. ';
					}
					actionData.description += 'It is <span>';
					if(obj.isReserved == 0)
					{
						actionData.description += 'not ';
					}
					actionData.description += 'reserved</span>.';
				}
				else { //would LOVE to be able to get contact name here...
					actionData.description += 'Tag <span>'+obj.tagName+'</span> failed to be added.';
				}	
				break;
			default: actionData.description	+= 'No defined message.';
		}
		BBTree.setLastAction(actionData);
		BBTree.addIndicator(actionData);
	}
};
//
var callTree =  {
	defaultSettings: {
		pageSettings:{
			wrapper: 'BBTreeContainer',
			tagHolder: 'BBTree',
 			hiddenTag: 'hidden',
 			messageHandler: 'BBMessages'
		},
		displaySettings: { //Sets the default when the page has to be refreshed internally
			pullSets: [291], //Set [one], or [other] to show only one, use [291,296] for both (when you want to show KW & IC)
			defaultTree: 291, //IssueCodes = 291, KW = 296. Sets default tree to show first.
			currentTree: 291, //what the current tag tree is
			buttonType: 'tagging',//Sets default type to appear: edit, modal or tagging versions... adds 'boxes/checks'
			tabLocation: 'BBTree-Tags' //where tabs, if needed, go.
		},
		callSettings:{
			ajaxUrl: '/civicrm/ajax/tag/tree',
			ajaxSettings:{
				entity_type: 'civicrm_contact',
				entity_id: 0,
				call_uri: window.location.href,
				entity_counts: 0
			}
		},
		instances: {
			//preset: false //says you didn't instantiate instances previously, explicitly
			//in here x copies display settings & call settings go
			//which correlate to each version that's on the page.
		}
	},
	setCurrentSettings: function(config){
		callTree['currentSettings'] = {};
		cj.extend(true,callTree.currentSettings, callTree.defaultSettings); //gives fresh copy to work off of.
		if(config)
		{
			callTree["pulledConfig"] = {};
			cj.each(
				config,function(i, value){
	            	callTree.pulledConfig[i] = value;
	       	});
	    }
	    cj.extend(true, callTree.defaultSettings.displaySettings, callTree.pulledConfig); //sets the inital settings
	},
	treeSetupPage: function(instance, settings, contact){ 
		//BBTree.initContainer('one', {pullSets: [291,296], buttonType: 'tagging',tabLocation: 'crm-tagTabHeader'}, {cid: 216352});
		//first make current settings for the ajax
		cj.extend(true,callTree.currentSettings.callSettings.ajaxSettings, callTree.defaultSettings.callSettings.ajaxSettings);
		cj.extend(callTree.currentSettings.callSettings.ajaxSettings, contact);
		//and now display settings
		cj.extend(true,callTree.currentSettings.displaySettings, callTree.defaultSettings.displaySettings);
		cj.extend(callTree.currentSettings.displaySettings, settings);

		if(instance == null || instance == '')
		{
			instance = 'default';
		}
		instance = 'BB_' + instance;

		callTree.currentSettings.displaySettings['currentInstance'] = instance;
		callTree.currentSettings.instances[instance] = {displaySettings: {}, callSettings: {ajaxSettings:{}}};
		cj.extend(callTree.currentSettings.instances[instance].displaySettings, callTree.currentSettings.displaySettings);
		cj.extend(callTree.currentSettings.instances[instance].callSettings.ajaxSettings, callTree.currentSettings.callSettings.ajaxSettings);

		//Gives BBInit custom class/name
		cj('.BBInit').attr('id', callTree.currentSettings.pageSettings.wrapper).attr('cid', 'cid-'+callTree.currentSettings.callSettings.ajaxSettings.entity_id);
		cj('.BBInit').addClass(instance).removeClass('BBInit');
		//make this a function to build x trees with y attributes, and everyone is hidden but the first
		callTree.buildBoxes(); //sends # of boxes to buildBoxes
	},
	buildBoxes: function() //reads from currentSettings to make the boxes to put lists in
	{
		cj.each(callTree.currentSettings.displaySettings.pullSets, function(i, className){
			var treeBox = '<div class="'+ callTree.currentSettings.pageSettings.tagHolder +' '+ callTree.currentSettings.displaySettings.buttonType.toLowerCase() + ' ' + callTree.currentSettings.displaySettings.currentInstance + ' ';
			if(className != callTree.currentSettings.displaySettings.defaultTree && callTree.currentSettings.displaySettings.pullSets.length > 1) //hide all boxes that aren't 'default' 
			{
				treeBox += 'hidden ';
			}
			else { //or else we give it the 'loading' treatment
				treeBox += 'loadingGif '; 
			}
			treeBox += addTagLabel(className);
			treeBox += '" id="'+addTagLabel(className)+'"></div>';
			cj(aCSel(callTree.currentSettings.displaySettings.currentInstance)+aIDSel(callTree.currentSettings.pageSettings.wrapper)).append(treeBox);
		});
		if(callTree.currentSettings.displaySettings.tabLocation == 'BBTree-Tags' && callTree.currentSettings.displaySettings.pullSets.length > 1 )
		{
			cj(aCSel(callTree.currentSettings.displaySettings.currentInstance)+aIDSel(callTree.currentSettings.pageSettings.wrapper)).prepend('<div class="BBTree-Tags"></div>');	
		}
	},
	//starts building tree data
	callTreeAjax: function(callback){
		cj.ajax({
			url: callTree.currentSettings.callSettings.ajaxUrl,
			data: {
				entity_type: callTree.currentSettings.callSettings.ajaxSettings.entity_type,
				call_uri: callTree.currentSettings.callSettings.ajaxSettings.call_uri,
				entity_counts: callTree.currentSettings.callSettings.ajaxSettings.entity_counts
			},
			dataType: 'json',
			success: function(data, status, XMLHttpRequest) {
				if(data.code != 1) {
					BBTree.reportAction(['cta', 0, callTree.currentSettings.callSettings.ajaxSettings, data.message]);
				}
				else{
					BBTree.reportAction(['cta',, callTree.currentSettings.callSettings.ajaxSettings]);
					callTree.separateTreeAjax(data.message);
					callback();
				}
			} 
		});
	},
	separateTreeAjax: function(data){
		//if cookie is found, send json to here.
		/*
		var dataStore = $.cookie("basket-data", JSON.stringify($("#ArticlesHolder").data()));
		var data=JSON.parse($.cookie("basket-data"))
		*/
		BBTree["rawJsonData"] = {}; //add new data properties
		BBTree["parsedJsonData"] = {};
		cj.each(data, function(i,tID){
			//HAVE TO USE DEFAULT SETTINGS HERE BECAUSE OF AWESOME TIMING ISSUES, it's set early for a reason
			//default is how you pull with, current is how you output
			if(cj.inArray(parseFloat(tID.id), callTree.defaultSettings.displaySettings.pullSets)>-1) //Checks against Allowed Sets
			{
				BBTree.rawJsonData[tID.id] = {'name':tID.name, 'children':tID.children};
				var displayObj = callTree.writeTreeInit(tID);
				callTree.defaultSettings.displaySettings.currentTree = tID.id;
				callTree.parseTreeAjax(tID, displayObj);
			}
		});
		return true;
	},
	writeTreeInit: function(tID){
		var displayObj = {};
		displayObj.tLvl = 0;
		displayObj.treeTop = tID.id;
		var tagLabel = addTagLabel(tID.id); //writes the identifying tag label
		displayObj.output += '<dl class="lv-'+displayObj.tLvl+'" id="'+tagLabel+'" tLvl="'+displayObj.tLvl+'">';
		displayObj.output = '<dt class="lv-'+displayObj.tLvl+' issueCode-'+tID.id;
		if(cj.inArray(parseFloat(tID.id), callTree.currentSettings.displaySettings.pullSets)>-1) //only writes the 
		{
			if(callTree.currentSettings.callSettings.ajaxSettings.entity_id != 0)
			{
				displayObj.output += isItemMarked(tID.is_checked,'checked');
			}
			displayObj.output += ' ' + isItemMarked(tID.is_reserved,'isReserved');
		}
		displayObj.output += '" id="'+tagLabel+'" description="'+tID.description+'" tLvl="'+displayObj.tLvl+'" tID="'+tID.id+'">';
		displayObj.output += '<div class="ddControl '+isItemChildless(tID.children.length)+'"></div><div class="tag"><span class="name">'+tID.name+'</span></div>';
		displayObj.output += addControlBox(tagLabel, displayObj.treeTop, isItemMarked(tID.is_checked,'checked')) + '</dt>';
		displayObj.output += '<dl class="lv-'+displayObj.tLvl+' '+tagLabel+'" id="" tLvl="'+displayObj.tLvl+'">';
		displayObj.tLvl++; //start the tree at lv-1
		return displayObj;
	},
	parseTreeAjax: function(tID, displayObj){
		var treeData = callTree.parseJsonInsides(tID, displayObj);
		BBTree.parsedJsonData[tID.id] = {'name':tID.name, 'data':treeData};
	},
	parseJsonInsides: function(tID, displayObj){
		cj.each(tID.children, function(i, cID){//runs all first level
			callTree.writeTagLabel(cID, displayObj);
			if(cID.children.length > 0)
			{
				callTree.writeJsonTag(cID, displayObj);
			}
		});
		return(displayObj.output);	
	},
	writeJsonTag: function(tID, displayObj){//in second level & beyond
		callTree.openChildJsonTag(tID, displayObj);
		cj.each(tID.children, function(i, cID){
			callTree.writeTagLabel(cID, displayObj, tID.id);
			if(cID.children.length > 0)
			{
				callTree.writeJsonTag(cID, displayObj);
			}
		});
		callTree.closeChildJsonTag(tID, displayObj);
	},
	writeTagLabel: function(cID, displayObj, parentTag){
		if(typeof parentTag === 'undefined')
		{
			parentTag = callTree.currentSettings.displaySettings.currentTree;
		}
		var tagLabel = addTagLabel(cID.id);
		displayObj.output += '<dt class="lv-'+displayObj.tLvl+' '+isItemMarked(cID.is_reserved,'isReserved')+'" id="'+tagLabel+'" description="'+cID.description+'" tLvl="'+displayObj.tLvl+'" tid="'+cID.id+'" parent="'+parentTag+'"><div class="ddControl '+ isItemChildless(cID.children.length) + '"></div><div class="tag"><span class="name">'+cID.name+'</span></div>'+addEntityCount(cID.entity_count) + addControlBox(tagLabel, displayObj.treeTop, isItemMarked(cID.is_checked,'checked'))  + '</dt>';
		//'/*+isItemChildless(cID.children.length)+*/
	},
	writeTagContainer: function(tID,displayObj){
		var tagLabel = addTagLabel(tID.id);
		displayObj.output += '<dl class="lv-'+displayObj.tLvl+'" id="'+tagLabel+'" tLvl="'+displayObj.tLvl+'" >';
	},
	openChildJsonTag: function(tID, displayObj){
		callTree.writeTagContainer(tID, displayObj);
		displayObj.tLvl++;
	},
	closeChildJsonTag: function(tID, displayObj){
		displayObj.tLvl--;
		displayObj.output += '</dl>';
	},
	//writes data to the correct div
	writeParsedData: function()
	{
		cj.each(callTree.currentSettings.displaySettings.pullSets, function(i, className){
			var treeTarget = aIDSel(callTree.currentSettings.pageSettings.wrapper);
			treeTarget += aCSel(callTree.currentSettings.displaySettings.currentInstance) + ' ';
			treeTarget += aCSel(callTree.currentSettings.pageSettings.tagHolder);
			treeTarget += aCSel(callTree.currentSettings.displaySettings.buttonType.toLowerCase());
			treeTarget += aCSel(addTagLabel(className));
			treeTarget += aCSel(callTree.currentSettings.displaySettings.currentInstance);
			cj(treeTarget).append(BBTree.parsedJsonData[className].data);
		});
	},
	//writes the tabs out
	writeTabs: function()
	{
		if(callTree.currentSettings.displaySettings.pullSets.length == 1)
		{
			return true;
		}
		if(callTree.currentSettings.displaySettings.tabLocation != callTree.defaultSettings.displaySettings.tabLocation)
		{ //if the custom location is set, don't add the dispay settings to it.
			var tabLoc = aCSel(callTree.currentSettings.displaySettings.tabLocation)
		}
		else
		{
			var tabLoc = aCSel(callTree.currentSettings.displaySettings.currentInstance) + ' '+ aCSel(callTree.currentSettings.displaySettings.tabLocation);
		}
		cj(tabLoc).html('<ul></ul>');
		cj.each(callTree.currentSettings.displaySettings.pullSets, function(i, className){
			var tabInfo = {
				id: callTree.currentSettings.displaySettings.pullSets[i],
				name: BBTree.parsedJsonData[callTree.currentSettings.displaySettings.pullSets[i]].name,
				position: i,
				length: callTree.currentSettings.displaySettings.pullSets.length, 
				isActive: ''
			};

			if(className == callTree.currentSettings.displaySettings.defaultTree) //hide all boxes that aren't 
			{
				tabInfo.isActive = 'active';
			}
			var tabHTML = '<li class="tab '+ callTree.currentSettings.displaySettings.currentInstance + ' ' + tabInfo.isActive+ '" id="' +addTagLabel(tabInfo.id) + '" onclick="callTree.swapTrees(this);return false;">'+tabInfo.name+'</li>';
			cj(tabLoc+' ul').append(tabHTML);
		});
		cj(tabLoc).attr('assocTree', callTree.currentSettings.displaySettings.currentInstance);
		cj(tabLoc).addClass('BBTree_Tabs_'+callTree.currentSettings.displaySettings.currentInstance);
		
	},
	swapTrees: function(tab)
	{
		var getTabSet = cj(tab).parent().parent().attr('assoctree');
		callTree.swapCurrentSettings(getTabSet);
		var currentTree = addTagLabel(callTree.currentSettings.displaySettings.defaultTree);
		var getTab = cj(tab).attr('id');
		if(currentTree != getTab){
			cj(aCSel(getTabSet) + ' ' + BBTree.treeLoc +'#' + currentTree).addClass('hidden');
			//cj('.BBtree.edit#' + currentTree).children().hide();
			cj(aCSel(callTree.currentSettings.displaySettings.tabLocation)+ ' li.tab#' + getTab).addClass('active');
			cj(aCSel(callTree.currentSettings.displaySettings.tabLocation)+ ' li.tab#' + currentTree).removeClass('active');
			cj(aCSel(getTabSet) + ' ' + BBTree.treeLoc +'#' + getTab).removeClass('hidden');
			callTree.currentSettings.displaySettings.defaultTree = [removeTagLabel(getTab)];
			callTree.currentSettings.displaySettings.currentTree = removeTagLabel(getTab);
		}
		callTree.saveCurrentSettings(getTabSet);
	},
	//slidedown function
	slideDownTree: function()
	{
		cj(BBTree.treeLoc + ' dt .treeButton').unbind('click');
		cj(BBTree.treeLoc + ' dt .treeButton').click(function() {
			var tagLabel = cj(this).parent().attr('id');
			var isOpen = cj(BBTree.treeLoc+ ' dl#'+tagLabel).hasClass('open');
			switch(isOpen)
			{
				case true:
					cj(BBTree.treeLoc + ' dt#'+tagLabel+' div').removeClass('open');
					cj(BBTree.treeLoc + ' dl#'+tagLabel).slideUp('200', function() {
						cj(BBTree.treeLoc + ' dl#'+tagLabel).removeClass('open');
					});
				break;
				case false:
					cj(BBTree.treeLoc + ' dt#'+tagLabel+' div').addClass('open');
					cj(BBTree.treeLoc + ' dl#'+tagLabel).slideDown('200', function() {
						cj(BBTree.treeLoc + ' dl#'+tagLabel).addClass('open');
					});
				break;
			}
		});
	},
	swapCurrentSettings: function(instance)
	{
		cj.extend(true, callTree.currentSettings.displaySettings, callTree.currentSettings.instances[instance].displaySettings);
		cj.extend(true, callTree.currentSettings.callSettings, callTree.currentSettings.instances[instance].callSettings);
		setTreeLoc();
	},
	saveCurrentSettings: function(instance)
	{
		cj.extend(true, callTree.currentSettings.instances[instance].displaySettings, callTree.currentSettings.displaySettings);
		cj.extend(true, callTree.currentSettings.instances[instance].callSettings, callTree.currentSettings.callSettings);
		setTreeLoc();
	}
	//still need a reload tree option.
	//make sure to capture which ones are 'open'
	//write a different addControlBox function that functions based on the parameters sent
};
var BBTreeEdit = {
	setTagInfo: function()
	{
		cj(BBTree.treeLoc+' dt').unbind('mouseenter mouseleave');
		cj(BBTree.treeLoc+' dt').hover(
		function(){
			if(cj(this).attr('id') != 'tagLabel_291' && cj(this).attr('id') != 'tagLabel_296' )
			{ 
				var tagCount = ' ';
				tagCount += cj('span.entityCount', this).html().match(/[0-9]+/);
				if(tagCount == ' ' +null)
				{
					tagCount = cj('span.entityCount', this).html();
				}
			}
			var tagName = cj('div.tag', this).html();
			var tagId = cj(this).attr('tid');
			var isReserved = 'False';
			var tagDescription = cj(this).attr('description');
			if(tagDescription == 'null')
			{
				tagDescription = tagName;
			}
			if(cj(this).hasClass('isReserved') == true)
			{
				isReserved = 'True';
			}
			cj('.crm-tagListInfo .tagInfoBody .tagName span').html(tagName);
			cj('.crm-tagListInfo .tagInfoBody .tagId span').html(tagId);
			cj('.crm-tagListInfo .tagInfoBody .tagDescription span').html(tagDescription);
			cj('.crm-tagListInfo .tagInfoBody .tagReserved span').html(isReserved);
			cj('.crm-tagListInfo .tagInfoBody .tagCount span').html(tagCount);
		}, 
		function() {
			cj('.crm-tagListInfo .tagInfoBody .tagName span').html('');
			cj('.crm-tagListInfo .tagInfoBody .tagID span').html('');
			cj('.crm-tagListInfo .tagInfoBody .tagDescription span').html('');
			cj('.crm-tagListInfo .tagInfoBody .tagReserved span').html('');
			cj('.crm-tagListInfo .tagInfoBody .tagCount span').html('');
		});
	}
}
var BBTreeTag = {
	getPageCID: function(passedCID, passedEntityType){
		var pageCID = {entity_id: 0, entity_type: callTree.currentSettings.callSettings.ajaxSettings.entity_type};
		var cid = 0 ;
		var cidpre = /cid=\d*/.exec(document.location.search);
		var cidsplit = /\d.*/.exec(cidpre);
		if(cidsplit)
		{
			cid = cidsplit[0];
			pageCID.entity_id = cid;
		}
		if(passedCID != null)
		{
			pageCID.entity_id = passedCID;
		}
		if(passedEntityType != null)
		{
			pageCID.entity_type = passedEntityType;
		}
		cj.extend(true, callTree.currentSettings.callSettings.ajaxSettings,pageCID); //overwrites CID if page is different. Check Add Contact?
	},
	getContactTags: function()
	{
		var holdID = callTree.currentSettings.callSettings.ajaxSettings.entity_id;
		var holdLoc = BBTree.treeLoc;
		if(typeof BBTree.contactTagData === 'undefined') 
		{
			BBTree.contactTagData = {};
			BBTree.contactTagData['cid_' + holdID] = {};
		}
		cj.ajax({
			url: '/civicrm/ajax/entity_tag/get',
			data: {
				entity_type: callTree.currentSettings.callSettings.ajaxSettings.entity_type,
				entity_id: callTree.currentSettings.callSettings.ajaxSettings.entity_id,
				call_uri: callTree.currentSettings.callSettings.ajaxSettings.call_uri
			},
			dataType: 'json',
			success: function(data, status, XMLHttpRequest) {
				if(data.code != 1 ) {
					BBTree.reportAction(['gct', 0, callTree.currentSettings.callSettings.ajaxSettings.entity_id, data.message]);
				}
				else{
					BBTree.reportAction(['gct',, callTree.currentSettings.callSettings.ajaxSettings.entity_id, data.message]);
					BBTree.contactTagData['cid_'+ holdID] = data.message;
					BBTreeTag.applyContactTags(holdID, holdLoc);
				}
			}
		});
	},
	applyContactTags: function(holdID, holdLoc)
	{
		cj.each(BBTree.contactTagData['cid_'+holdID], function(i, tag){
			cj(holdLoc + ' dt#'+addTagLabel(tag)+' .checkbox').attr('checked','true').addClass('checked');
			cj(holdLoc + ' dt#'+addTagLabel(tag)).addClass('checked');
			BBTreeTag.tagInheritanceFlag(addTagLabel(tag), 'add');
		});
	},
	removeContactTags: function()
	{
		cj(BBTree.treeLoc + ' .checkbox').removeAttr('checked');
		cj(BBTree.treeLoc).find('*').removeClass('checked');
		cj(BBTree.treeLoc).find('*').removeClass('subChecked');
	},
	checkRemoveAdd: function(obj, tagLabel) { //adds and removes the checkbox data
		callTree.swapCurrentSettings(cj(obj).parents(aIDSel(callTree.currentSettings.pageSettings.wrapper)).attr('class'));
		var v = cj(BBTree.treeLoc + ' dt#'+ tagLabel);
		var n = v.hasClass('checked');
		if(n == false)
		{	
			cj.ajax({
				url: '/civicrm/ajax/entity_tag/create',
				data: {
					entity_type: callTree.currentSettings.callSettings.ajaxSettings.entity_type,
					entity_id: callTree.currentSettings.callSettings.ajaxSettings.entity_id,
					call_uri: callTree.currentSettings.callSettings.ajaxSettings.call_uri,
					tag_id: removeTagLabel(tagLabel)
				},
				dataType: 'json',
				success: function(data, status, XMLHttpRequest) {
					if(data.code != 1) {
						BBTree.reportAction(['craa', 0, v.find('.name').text(),,data.message]);
					}
					else {
						BBTree.reportAction(['craa', 1, v.find('.name').text(),,]);
						cj(BBTree.treeLoc+' dt#'+tagLabel).addClass('checked');
						cj(BBTree.treeLoc+' dt#'+tagLabel+' input').attr('checked', true);
						BBTreeTag.tagInheritanceFlag(tagLabel, 'add');
					}
				}
			});
				
		} else {
			cj.ajax({
				url: '/civicrm/ajax/entity_tag/delete',
				data: {
					entity_type: callTree.currentSettings.callSettings.ajaxSettings.entity_type,
					entity_id: callTree.currentSettings.callSettings.ajaxSettings.entity_id,
					call_uri: callTree.currentSettings.callSettings.ajaxSettings.call_uri,
					tag_id: removeTagLabel(tagLabel)
				},
				dataType: 'json',
				success: function(data, status, XMLHttpRequest) {
					if(data.code != 1) {
						BBTree.reportAction(['crar', 0, v.find('.name').text(),,data.message]);
					}
					else{
						BBTree.reportAction(['crar', 1, v.find('.name').text(),,]);
						cj(BBTree.treeLoc+' dt#'+tagLabel+' input').attr('checked', false);
						BBTreeTag.tagInheritanceFlag(tagLabel, 'remove');
						updateViewContactPage(tagLabel);
					}
				}
			});
		}
	},
	tagInheritanceFlag: function(tagLabel, toggle) //adds or removes inheritance toggle: add/remove/clear
	{
		var jq_tagLabelDT = cj(BBTree.treeLoc + ' dt#' + tagLabel);
		if(toggle == 'add') //adds subchecked in one big jq string
		{ 
			jq_tagLabelDT.parents('dl').not('.lv-0').prev('dt').addClass('subChecked');
		}
		if(toggle == 'remove') //remove subchecked 
		{ 
			jq_tagLabelDT.removeClass('checked');
			var checkChildren = cj(BBTree.treeLoc+' dl#'+tagLabel).children('dt.checked').length + cj(BBTree.treeLoc+' dl#'+tagLabel).children('dt.subChecked').length;
			if(checkChildren > 0) // if children are checked, don't remove anything above
			{
				jq_tagLabelDT.removeClass('checked').addClass('subChecked');
				return false;
			}
			var checkSiblings = jq_tagLabelDT.siblings('.checked').length + jq_tagLabelDT.children('.subChecked').length;
			if(checkSiblings > 0) // if it has checked siblings, you shouldn't remove anything above
			{
				jq_tagLabelDT.removeClass('checked').removeClass('subChecked');
				return false;
			}
			var getParents = jq_tagLabelDT.parents('dl').not('.lv-0');
			cj.each(getParents, function(i, parents) // if everything below and aside is ok, go up!
			{
				var parentID = cj(parents).attr('id');
				var jq_tagLabelParentDT = cj(BBTree.treeLoc + ' dt#'+parentID);
				var jq_tagLabelParentDL = cj(BBTree.treeLoc + ' dl#'+parentID);
				if(jq_tagLabelParentDT.hasClass('checked')){ //if the parent is checked
					jq_tagLabelParentDT.removeClass('subChecked');
					return false;
				}
				var getSibLength = jq_tagLabelParentDT.siblings('.checked').length + jq_tagLabelParentDT.siblings('.subChecked').length;
				if(getSibLength > 0 ){ //if the parent's siblings are checked/subchecked
					var hasSibNoChildren = jq_tagLabelParentDL.children('dt.checked').length + jq_tagLabelParentDL.children('dt.subChecked').length 
					if(hasSibNoChildren == 0)
					{
						jq_tagLabelParentDT.removeClass('subChecked');
					}
					return false;
				}
				jq_tagLabelParentDT.removeClass('subChecked');
			});
		}
	}
	//this is where I add the add tag & remove tag to box & tab number function
	//TODO
}
var BBTreeModal = {
	defaultSettings: {
		closeOnEscape: true,
		draggable: true,
		height: 300,
		width: 300,
		modal: true, 
		bgiframe: true,
		overlay: { 
			opacity: 0.2, 
			background: "black" 
		},
		close: function() {
			callTree.currentSettings.displaySettings.currentTree = removeTagLabel(cj(aIDSel(callTree.currentSettings.pageSettings.wrapper)+aCSel(BBTreeModal.parentInstance)+' '+aCSel(callTree.currentSettings.pageSettings.tagHolder)).not('.hidden').attr('id')) ;
			if(callTree.currentSettings.displaySettings.buttonType == 'modal')
			{
				callTree.currentSettings.displaySettings.buttonType = callTree.currentSettings.displaySettings.previousTree.toLowerCase();
				callTree.currentSettings.displaySettings.previousTree = 'modal';
			}
			if(typeof BBTreeModal.modalParsedData[callTree.currentSettings.displaySettings.currentTree] !== 'undefined') 
			{ //TODO -- Does this actually work? I think it does.
				cj(BBTreeModal.taggedID, BBTreeModal.modalParsedData[callTree.currentSettings.displaySettings.currentTree]).show();
			}
			setTreeLoc();
			cj(this).html('');
		}, 
		buttons: {
			"Cancel": function() { 
				cj(this).dialog("close"); 
				cj(this).dialog("destroy"); 
			}
		} 
	},
	modalParsedData: {

	},
	resetCurrentSettings: function(){
		this['currentSettings'] = {};
		cj.extend(this.currentSettings, this.defaultSettings);
	},
	tagInfo: function(obj, tagLabel){
		var jq_tagLabelDT = cj(BBTree.treeLoc + ' dt#' + tagLabel);
		var jq_tagLabelDL = cj(BBTree.treeLoc + ' dl#' + tagLabel);
		this.taggedObject = obj;
		this.taggedMethod = cj(obj).attr('do');
		this.treeParent = jq_tagLabelDT.parents('.lv-0').siblings('dt').attr('tid');
		this.taggedReserved = jq_tagLabelDT.hasClass('isReserved');
		this.taggedID = tagLabel;
		this.taggedName = jq_tagLabelDT.find('.tag .name').html();
		if(jq_tagLabelDT.attr('description') != 'null')
		{
			this.taggedDescription = jq_tagLabelDT.attr('description');
		}
		else{
			this.taggedDescription = '';
		}
		this.taggedChildren = jq_tagLabelDL.find('dl, dt').length;
		this.tlvl = jq_tagLabelDT.attr('tlvl');
		this.taggedParent = addTagLabel(jq_tagLabelDT.attr('parent'));
		this.taggedDialog = BBTreeModal.addDialogInfo();
		this.applyHtml(this.taggedDialog);
		
		// //make this into a subfunction to find proper greeting name if not reserved
		
		// cj('#dialog input:[name=tagName]').focus();

	},
	setTreeType: function() // sets previous tree
	{
		if(callTree.currentSettings.displaySettings.buttonType != 'modal')
		{
			callTree.currentSettings.displaySettings['previousTree'] = callTree.currentSettings.displaySettings.buttonType;
		}	
		callTree.currentSettings.displaySettings.buttonType = 'modal';
		//Have to set Tree Loc individually, because the function add the instance name, and that'll screw up everything here
		BBTree.treeLoc = '.'+callTree.currentSettings.pageSettings.tagHolder+'.'+callTree.currentSettings.displaySettings.buttonType.toLowerCase();
	},
	addModalTagTree: function() // modal needs to add a tree
	{
		if(this.taggedReserved){
			this.resetCurrentSettings();
		}
		else{
			this.currentSettings.getTree = {};
			this.currentSettings.getTree = true;
			this.currentSettings.height = 500;
			this.currentSettings.width = 600;
			return '<div class="' + callTree.currentSettings.pageSettings.tagHolder + ' modal '+ addTagLabel(callTree.currentSettings.displaySettings.currentTree) + '" id="'+addTagLabel(callTree.currentSettings.displaySettings.currentTree)+'_modal"></div>';
		}
	},
	getModalTagTree: function() //on open, so it all loads asynch
	{
		BBTreeModal.setTreeType();
		//TODO: Make it so that the modal tree doesn't have to be rewritten EVERY TIME.
		// if(typeof this.modalParsedData[callTree.currentSettings.displaySettings.currentTree] === 'undefined')
		// {	
			this.modalParsedData[callTree.currentSettings.displaySettings.currentTree] = cj(BBTree.parsedJsonData[callTree.currentSettings.displaySettings.currentTree].data).clone(true, true);
			cj('span.fCB', this.modalParsedData[callTree.currentSettings.displaySettings.currentTree]).empty().html('<input type="radio" class="selectRadio" name="selectTag"/>');
			cj(aIDSel(this.taggedID), this.modalParsedData[callTree.currentSettings.displaySettings.currentTree]).hide();
			cj('.fCB', BBTreeModal.modalParsedData[callTree.currentSettings.displaySettings.currentTree]).parent('.lv-0').children('span.fCB').html('');
			cj(this.modalParsedData[callTree.currentSettings.displaySettings.currentTree]).html();
			cj(aIDSel(addTagLabel(callTree.currentSettings.displaySettings.currentTree))+'_modal').html(this.modalParsedData[callTree.currentSettings.displaySettings.currentTree]);
			this.radioButtonAction();
		// }
		// else
		// {
		// 	cj(aIDSel(this.taggedID), this.modalParsedData[callTree.currentSettings.displaySettings.currentTree]).hide();
		// 	cj('#'+addTagLabel(callTree.currentSettings.displaySettings.currentTree)+'_modal').html(this.modalParsedData[callTree.currentSettings.displaySettings.currentTree]);
		// 	this.radioButtonAction();
		// }
	},
	radioButtonAction: function(){
		switch(BBTreeModal.taggedMethod){
			case 'convert':
			case 'move':
				cj('.BBTree.modal dt.lv-0 span.fCB').html('<input type="radio" class="selectRadio" name="selectTag"/>');
				break;
		}
		cj(BBTree.treeLoc + ' input.selectRadio, '+ BBTree.treeLoc + ' div.tag').unbind('click');
		cj(BBTree.treeLoc + ' input.selectRadio, '+ BBTree.treeLoc + ' div.tag').click(function(){
			BBTreeModal['radioSelectedTid'] = cj(this).parent('.fCB').parent('dt').attr('tid');
			switch(BBTreeModal.taggedMethod) //sets both open
			{
				case 'convert': BBTreeModal.convertTag.runFunction(); break;
				case 'merge':
				case 'mergeKW': BBTreeModal.mergeTag.runFunction(); break;
				case 'move': BBTreeModal.moveTag.runFunction(); break;
				default: alert('Invalid RBA Modifier'); break;
			}
		});
		callTree.slideDownTree();
	},
	addDialogInfo: function() //writes what's in the modal
	{
		var addDialogText = '';
		switch(this.taggedMethod)
		{
			case 'add':
				addDialogText += '<div class="modalHeader">Add new tag under ' + this.taggedName + '</div>';
				addDialogText += '<div class="modalInputs">';
				addDialogText += '<div><span>Tag Name:</span ><input type="text" name="tagName" /></div>';
				addDialogText += '<div><span>Description:</span ><input type="text" name="tagDescription" /></div>';
				addDialogText += '<div><span>Reserved:</span><input type="checkbox" name="isReserved"/></div>';
				addDialogText += '</div>';
				this.taggedReserved = false;
				this.currentSettings['actionName'] = 'added';
				this.currentSettings['title'] = 'Add New Tag';
				break;
			case 'remove':
				addDialogText += '<div class="modalHeader">Remove Tag: <span class="parentName" id="'+this.taggedID+'">' + this.taggedName + '</span></div>';
				this.currentSettings['actionName'] = 'removed';
				this.currentSettings['title'] = 'Remove Tag';
				break;
			case 'move':
				addDialogText += '<div class="modalHeader">Move <span id="modalNameTid" tID="'+this.taggedID+'">' + this.taggedName + ' under Tag...</span></div>';
				addDialogText += this.addModalTagTree();
				this.currentSettings['actionName'] = 'moved';
				this.currentSettings['title'] = 'Move Tag';
				break;
			case 'merge':
			case 'mergeKW':
				addDialogText += '<div class="modalHeader">Merge <span id="modalNameTid" tID="'+this.taggedID+'">' + this.taggedName + '</span> into Selected Tag... (note: this is a slow process)</div>'; 
				addDialogText += this.addModalTagTree();
				this.currentSettings['actionName'] = 'merged';
				this.currentSettings['title'] = 'Merge Tag';
				break;
			case 'update':
				addDialogText += '<div class="modalHeader">Update Tag <span class="parentName" id="'+this.taggedID+'">' + this.taggedName + '</span></div>';
				addDialogText += '<div class="modalInputs">';
				addDialogText += '<div><span>Tag Name:</span ><input type="text" name="tagName" value="'+this.taggedName+'" /></div>';
				addDialogText += '<div><span>Description:</span ><input type="text" name="tagDescription" value="'+this.taggedDescription+'" /></div>';
				addDialogText += '<div><span>Reserved:</span><input type="checkbox" name="isReserved" '
				if(this.taggedReserved){addDialogText += "checked";}
				addDialogText +='/></div>';
				addDialogText += '</div>'; 
				this.taggedReserved = false;
				this.currentSettings['title'] = 'Update Tag';
				break;
			case 'convert': 
				if(callTree.currentSettings.displaySettings.currentTree == 296)
				{
					callTree.currentSettings.displaySettings.currentTree = 291;
				}
				else{
					callTree.currentSettings.displaySettings.currentTree = 296;
				}
				addDialogText += '<div class="modalHeader">Convert <span id="modalNameTid" tID="'+this.taggedID+'">' + this.taggedName + '</span> into a Issue Code under...</div>'; 
				addDialogText += this.addModalTagTree();
				this.currentSettings['actionName'] = 'converted';
				this.currentSettings['title'] = 'Convert Keyword to Tag';
				break;
		}
		if(this.taggedReserved){
			addDialogText = this.taggedName + ' is reserved and cannot be ' + this.currentSettings.actionName + '. <br /> <br /> Try updating tag first.';			
		}
		return addDialogText;
	},
	makeModalInit: function(){ //creates the dialog box to make and move
		cj('body').append('<div id="BBDialog"></div>');
	},
	makeModal: function(obj, tagLabel){ //sorts and separates & should read settings
		BBTreeModal['parentInstance'] = cj(obj).parents(aIDSel(callTree.currentSettings.pageSettings.wrapper)).attr('class');
		this.resetCurrentSettings();
		BBTreeModal.tagInfo(obj, tagLabel);
		switch(this.taggedMethod) //sets both open
		{
			case 'convert': BBTreeModal.defaultSettings['open'] = BBTreeModal.convertTag.setOpen(); break;
			case 'mergeKW':
			case 'merge': BBTreeModal.defaultSettings['open'] = BBTreeModal.mergeTag.setOpen();break;
			case 'update': BBTreeModal.defaultSettings['open'] = BBTreeModal.updateTag.setOpen(); break;
			case 'move': BBTreeModal.defaultSettings['open'] = BBTreeModal.moveTag.setOpen(); break;
			case 'remove': BBTreeModal.defaultSettings['open'] = BBTreeModal.removeTag.setOpen(); break;
			case 'add': BBTreeModal.defaultSettings['open'] = BBTreeModal.addTag.setOpen(); break;
			default: alert('Invalid Modifier'); break;
		}
		this.makeModalBox();
	},
	applyHtml: function(data){
		cj('#BBDialog').append(data);
	},
	makeModalBox: function(){
		cj("#BBDialog").show();
		cj("#BBDialog").dialog(this.currentSettings);
		switch(this.taggedMethod) //sets both open
		{
			case 'update': BBTreeModal.updateTag.runFunction(); break;
			case 'remove': BBTreeModal.removeTag.runFunction(); break;
			case 'add': BBTreeModal.addTag.runFunction(); break;
			default: break;
		}
	},
	convertTag: {
		setOpen: function(){
			BBTreeModal.getModalTagTree();
		},
		runFunction: function(){
			cj("#BBDialog").dialog( "option", "buttons", [
			{
				text: "Done",
				click: function() {
					modalLoadingGif('add');
					tagMove = new Object();
					tagMove.currentId = removeTagLabel(BBTreeModal.taggedID);
					cj.ajax({
						url: '/civicrm/ajax/tag/update',
						data: {
							id: tagMove.currentId,
							parent_id: BBTreeModal.radioSelectedTid,
							call_uri: window.location.href
						},
						dataType: 'json',
						success: function(data, status, XMLHttpRequest) {
							if(data.code != 1)
							{
								BBTree.reportAction(['convt',0,tagMove.currentId,BBTreeModal.radioSelectedTid, data.message]);
								modalLoadingGif('remove');
							}
							else
							{
								cj('#BBDialog').dialog('close');
								cj('#BBDialog').dialog('destroy');
								BBTree.reportAction(['convt',1,tagMove.currentId,BBTreeModal.radioSelectedTid]);
								BBTreeModal.convertTag.moveKW(data.message);
								callTree.swapTrees(cj('li#tagLabel_'+callTree.currentSettings.displaySettings.currentTree));
							}
						}
					});
				}
			},	
			{
				text: "Cancel",
				click: function() { 
					cj(this).dialog("close"); 
					cj(this).dialog("destroy"); 
				}
			}]);
		},
		moveKW: function(data){ //removes from kw and appends to issue codes
			var parentId = addTagLabel(BBTreeModal.radioSelectedTid);
			var toMove = cj('dt#'+addTagLabel(data.id));
			var aParent = toMove.attr('parent');
			toMove.attr('parent', BBTreeModal.radioSelectedTid);
			var moveFrom = cj('dl#'+BBTreeModal.taggedParent);

			if(cj('dt#'+parentId+' .ddControl').hasClass('treeButton') == false)
			{
				cj('dt#'+parentId+' .ddControl').addClass('treeButton');
			}
			if(cj('dl#'+parentId).length != 0 && BBTreeModal.radioSelectedTid != 291)
			{
				cj('dl#'+parentId).append(toMove);
			}
			else if(BBTreeModal.radioSelectedTid != 291){
				var toAddDL = '<dl class="lv-' + cj('dt#'+parentId).attr('tlvl') + ' ' + parentId+'" id="' + parentId + '" tlvl="'+cj('dt#'+parentId).attr('tlvl')+'"></dl>';
				cj('dt#'+parentId).after(toAddDL);
				cj('dl#'+parentId).append(toMove);
			}
			else if(BBTreeModal.radioSelectedTid == 291){
				cj('dl.'+parentId).prepend(toMove);
			}
			if(moveFrom.children('dt').length == 0)
			{
				cj('dt#'+addTagLabel(aParent)+' .ddControl').removeClass('treeButton');
				cj(moveFrom).remove();
			}
			callTree.slideDownTree();
			BBTreeEdit.setTagInfo();
		}

	},
	mergeTag: {
		setOpen: function(){
			BBTreeModal.getModalTagTree();
		},
		runFunction: function(){
			cj("#BBDialog").dialog( "option", "buttons", [
				{
					text: "Merge ",
					click: function() {
						tagMerge = new Object();
						modalLoadingGif('add');
						tagMerge.currentId = removeTagLabel(BBTreeModal.taggedID);
						tagMerge.destinationId = BBTreeModal.radioSelectedTid;
						var postUrl = '/civicrm/ajax/mergeTags';
		 				var data    = 'fromId='+ tagMerge.currentId + '&toId='+ tagMerge.destinationId;
		 				var tidMatch = false;
						if(BBTreeModal.taggedChildren > 0)
						{
							tidMatch = true;
						}
						if(tidMatch == false)
						{	
							cj.ajax({
								type: "POST",
								url: postUrl,
								data: data,
								dataType: 'json',
								success: function(data, status, XMLHttpRequest) {
									if ( data.status == true ) {
										cj("#BBDialog").dialog("close"); 
										cj("#BBDialog").dialog("destroy"); 
										BBTree.reportAction(['merct',1,tagMerge.currentId,BBTreeModal.radioSelectedTid, data.message]);
										BBTreeModal.removeTag.removeInline(tagMerge.currentId);
									}
									else
									{
										BBTree.reportAction(['merct',0,tagMerge.currentId,BBTreeModal.radioSelectedTid, data.message]);
										modalLoadingGif('remove');
									}
									
								}	
							});
						}
						else {
							alert("Cannot merge a parent tag into another tag. Try moving sub-tags into the parent you want to merge into and then merge the tag into the destination");
							modalLoadingGif('remove');
						}

					}
				},
				{
					text: "Cancel",
					click: function() { 
						cj(this).dialog("close"); 
						cj(this).dialog("destroy"); 
					}
				}
			]);
		}
	},
	updateTag: {
		setOpen: function(){

		},
		runFunction: function(){
			cj("#BBDialog").dialog( "option", "buttons", [
			{
				text: "Done",
				click: function () {
					modalLoadingGif('add');
					tagUpdate = new Object();
					tagUpdate.prevName = BBTreeModal.taggedName;
					tagUpdate.tagName = cj('#BBDialog .modalInputs input:[name=tagName]').val();
					tagUpdate.tagDescription = cj('#BBDialog .modalInputs input:[name=tagDescription]').val();
					tagUpdate.parentId = removeTagLabel(BBTreeModal.taggedID);
					tagUpdate.isReserved = cj('#BBDialog .modalInputs input:checked[name=isReserved]').length;
					cj.ajax({
						url: '/civicrm/ajax/tag/update',
						data: {
							name: tagUpdate.tagName,
							description: tagUpdate.tagDescription,
							id: tagUpdate.parentId,
							is_reserved: tagUpdate.isReserved,
							call_uri: window.location.href	
						},
						dataType: 'json',
						success: function(data, status, XMLHttpRequest) {
							if(data.code != 1)
							{
								BBTree.reportAction(['updat',0,tagUpdate, data.message]);
								modalLoadingGif('remove');
							}
							else
							{
								cj('#BBDialog').dialog('close');
								cj('#BBDialog').dialog('destroy');
								BBTree.reportAction(['updat',1,tagUpdate, data.message]);
								BBTreeModal.updateTag.updateInline(data.message);
							}
						}
					});
				}
			},	
			{
				text: "Cancel",
				click: function() { 
					cj(this).dialog("close"); 
					cj(this).dialog("destroy"); 
				}
			}]);
		},
		updateInline: function(data){ // adds an element inline with all the fixins
			var target = cj('dt#'+addTagLabel(data.id));
			if(data.is_reserved != 0)
			{
				target.addClass('isReserved');
			}
			else{
				target.removeClass('isReserved');
			}
			target.attr('description', data.description);
			cj('.tag .name', target).html(data.name);
			callTree.slideDownTree();
		}
	},
	moveTag:  {
		setOpen: function(){
			BBTreeModal.getModalTagTree();
		},
		runFunction: function(){
			cj("#BBDialog").dialog( "option", "buttons", [
			{
				text: "Done",
				click: function() {
					modalLoadingGif('add');
					tagMove = new Object();
					tagMove.currentId = removeTagLabel(BBTreeModal.taggedID);
					if(BBTreeModal.taggedChildren == 0)
					{
						cj.ajax({
							url: '/civicrm/ajax/tag/update',
							data: {
								id: tagMove.currentId,
								parent_id: BBTreeModal.radioSelectedTid,
								call_uri: window.location.href
							},
							dataType: 'json',
							success: function(data, status, XMLHttpRequest) {
								if(data.code != 1)
								{
									BBTree.reportAction(['movct',0,tagMove.currentId,BBTreeModal.radioSelectedTid, data.message]);
									modalLoadingGif('remove');
								}
								else
								{
									cj('#BBDialog').dialog('close');
									cj('#BBDialog').dialog('destroy');
									BBTree.reportAction(['movct',1,tagMove.currentId,BBTreeModal.radioSelectedTid,data.message]);
									BBTreeModal.convertTag.moveKW(data.message);
									callTree.swapTrees(cj('li#tagLabel_'+callTree.currentSettings.displaySettings.currentTree));
								}
							}
						});
					} else {
						alert("Cannot move a parent tag. Try deleting subtags before deleting parent tag.");
						modalLoadingGif('remove');
					}
				}
			},	
			{
				text: "Cancel",
				click: function() { 
					cj(this).dialog("close"); 
					cj(this).dialog("destroy"); 
				}
			}]);
		}
	},
	removeTag:  {
		setOpen: function(){

		},
		runFunction: function(){
			cj("#BBDialog").dialog( "option", "buttons", [
			{
				text: "Done",
				click: function() {
					tagRemove = new Object();
					tagRemove.parentId = removeTagLabel(BBTreeModal.taggedID);
					modalLoadingGif('add');
					if(BBTreeModal.taggedChildren == 0)
					{
							cj.ajax({
							url: '/civicrm/ajax/tag/delete',
							data: {
								id: tagRemove.parentId,
								call_uri: window.location.href
							},
							dataType: 'json',
							success: function(data, status, XMLHttpRequest) {
								if(data.code != 1)
								{
									BBTree.reportAction(['removt',0,BBTreeModal.taggedName, tagRemove.parentId, data.message]);
									modalLoadingGif('remove');
								}
								else
								{	
									BBTree.reportAction(['removt',1,BBTreeModal.taggedName,removeTagLabel(BBTreeModal.taggedParent)]);
									BBTreeModal.removeTag.removeInline(tagRemove.parentId);
								}
								cj('#BBDialog').dialog('close');
								cj('#BBDialog').dialog('destroy');
							}
						});
					} else {
						alert("Cannot remove a parent tag. Try deleting subtags before deleting parent tag.");
						modalLoadingGif('remove');
					}

				}
			},
			{
				text: "Cancel",
				click: function() { 
					cj(this).dialog("close"); 
					cj(this).dialog("destroy"); 
				}
			}]);
		},
		removeInline: function(parentId){
			cj('dt#'+addTagLabel(parentId)).remove();
			if(cj('dl#'+BBTreeModal.taggedParent).children().length == 0)
			{
				cj('dl#'+BBTreeModal.taggedParent).remove();
				cj('dt#'+BBTreeModal.taggedParent+' .ddControl').removeClass('treeButton').removeClass('open');
			}
			
		}
	},
	addTag:  {
		setOpen: function(){

		},
		runFunction: function(){
			cj('#BBDialog input:[name=tagName]').focus();
			cj("#BBDialog").dialog( "option", "buttons", 
			[
				{
					text: "Done",
					click: function() {
						tagCreate = new Object();
						tagCreate.tagDescription = '';
						modalLoadingGif('add');
						tagCreate.tagName = cj('#BBDialog .modalInputs input:[name=tagName]').val();
						tagCreate.treeParent = BBTreeModal.treeParent;
						tagCreate.tagDescription = cj('#BBDialog .modalInputs input:[name=tagDescription]').val();
						tagCreate.parentId = removeTagLabel(BBTreeModal.taggedID);
						tagCreate.isReserved = cj('#BBDialog .modalInputs input:checked[name=isReserved]').length;
						cj.ajax({
							url: '/civicrm/ajax/tag/create',
							data: {
								name: tagCreate.tagName,
								description: tagCreate.tagDescription,
								parent_id: tagCreate.parentId,
								is_reserved: tagCreate.isReserved,
								call_uri: window.location.href	
							},
							dataType: 'json',
							success: function(data, status, XMLHttpRequest) {
								if(data.code != 1)
								{
									BBTree.reportAction(['addt',0,tagCreate, data.message]);
									modalLoadingGif('remove');
								}
								else
								{
									BBTreeModal.addTag.createAddInline(tagCreate, data.message);
									BBTree.reportAction(['addt',1,tagCreate, data.message]);
								}
								cj('#BBDialog').dialog('close');
								cj('#BBDialog').dialog('destroy');
							}
						});
					}
				},
				{
					text: "Cancel",
					click: function() { 
						cj(this).dialog("close"); 
						cj(this).dialog("destroy"); 
					}
				}
			]);
		},
		createAddInline: function(tdata,data){ // adds an element inline with all the fixins
			if(tdata.treeParent == 291)
			{
				var tlvl = parseFloat(BBTreeModal.tlvl);
				tlvl++;
				if(cj('dt#'+BBTreeModal.taggedID+' .ddControl').hasClass('treeButton') == false)
				{
					cj('dt#'+BBTreeModal.taggedID+' .ddControl').addClass('treeButton');
				}
				var toAddDT = '<dt class="lv-' + tlvl + ' ';
				if(data.is_reserved != null)
				{
					toAddDT += 'isReserved';
				}
				toAddDT += '" id="tagLabel_'+data.id+'" description="'+data.description+'" tlvl="'+tlvl +'" tid="'+data.id+'" parent="'+removeTagLabel(BBTreeModal.taggedID)+'"><div class="ddControl"></div><div class="tag"><span class="name">'+data.name+'</span></div><span class="entityCount" style="display:none">Unknown</span><span class="fCB">'+addControlBox(addTagLabel(data.id), callTree.currentSettings.displaySettings.currentTree )+'</dt>';
				if(cj('dl#'+BBTreeModal.taggedID).length != 0)
				{
					cj('dl#'+BBTreeModal.taggedID).append(toAddDT);
				}
				else{
					var toAddDL = '<dl class="lv-' + tlvl + ' tagLabel_' + removeTagLabel(BBTreeModal.taggedID)+'" id="tagLabel_' + removeTagLabel(BBTreeModal.taggedID) + '" tlvl="'+tlvl+'"></dl>';
					cj('dt#'+BBTreeModal.taggedID).after(toAddDL);
					cj('dl#'+BBTreeModal.taggedID).append(toAddDT);
				}
				callTree.slideDownTree();
				BBTreeEdit.setTagInfo();
			}
			if(tdata.treeParent == 296)
			{
				var tlvl = parseFloat(BBTreeModal.tlvl);
				var toAddDT = '<dt class="lv-1 ';
				if(data.is_reserved != null)
				{
					toAddDT += 'isReserved';
				}
				toAddDT += '" id="tagLabel_'+data.id+'" description="'+data.description+'" tlvl="1" tid="'+data.id+'" parent="'+removeTagLabel(BBTreeModal.taggedID)+'"><div class="ddControl"></div><div class="tag"><span class="name">'+data.name+'</span></div><span class="entityCount" style="display:none">Unknown</span><span class="fCB">'+addControlBox(addTagLabel(data.id), callTree.currentSettings.displaySettings.currentTree )+'</dt>';
				cj('dl.tagLabel_296').prepend(toAddDT);
				callTree.slideDownTree();
				BBTreeEdit.setTagInfo();
			}
		}
	}
}
function addTagLabel(tag)
{
	return 'tagLabel_' + tag;
}
function removeTagLabel(tag)
{
	return tag.replace('tagLabel_', '');
}
//checks to see if the user can add or remove tags
function getUserEditLevel()
{
	cj.ajax({
		url: '/civicrm/ajax/entity_tag/checkUserLevel/',
		data: {
			call_uri: window.location.href
		},
		dataType: 'json',
		success: function(data, status, XMLHttpRequest) {
			return data.code; //true = can use
		}
	});
}
//marks item as checked or reserved
function isItemMarked(value, type)
{
	if(value == true)
	{
		return(type);
	}
	else {
		return '';
	}
}
//if has children, return either arrow or nothing
function isItemChildless(childLength)
{
	if(childLength > 0)
	{
		return('treeButton');
	}
	else
	{
		return '';
	}
}
//add Entity Span
function addEntityCount(count)
{
	if(callTree.currentSettings.callSettings.ajaxSettings.entity_counts != 0)
	{
		var add = '<span class="entityCount">('+count+')</span>';
		return add;
	}
	else{
		var add = '<span class="entityCount" style="display:none">Unknown</span>';
		return add;
	}
}
//adds Control Box
function addControlBox(tagLabel, treeTop, isChecked) { //should break this up 
	var floatControlBox;
	if(callTree.currentSettings.displaySettings.buttonType == 'edit')
	{
		floatControlBox = '<span class="fCB">';
		floatControlBox += '<ul>';
		if(291 == treeTop)
		{
			floatControlBox += '<li class="addTag" title="Add New Tag" do="add" onclick="BBTreeModal.makeModal(this,\''+ tagLabel +'\')"></li>';
			floatControlBox += '<li class="removeTag" title="Remove Tag" do="remove" onclick="BBTreeModal.makeModal(this,\''+ tagLabel +'\')"></li>';
			floatControlBox += '<li class="moveTag" title="Move Tag" do="move" onclick="BBTreeModal.makeModal(this,\''+ tagLabel +'\')"></li>';
			floatControlBox += '<li class="updateTag" title="Update Tag" do="update" onclick="BBTreeModal.makeModal(this,\''+ tagLabel +'\')"></li>';
			floatControlBox += '<li class="mergeTag" title="Merge Tag" do="merge" onclick="BBTreeModal.makeModal(this,\''+ tagLabel +'\')"></li>';
		}
		if(296 == treeTop)
		{
			floatControlBox += '<li class="removeTag" title="Remove Keyword" do="remove" onclick="BBTreeModal.makeModal(this,\''+ tagLabel +'\')"></li>';
			floatControlBox += '<li class="updateTag" title="Update Keyword" do="update"  onclick="BBTreeModal.makeModal(this,\''+ tagLabel +'\')"></li>';
			floatControlBox += '<li class="mergeTag" title="Merge Keyword" do="mergeKW" onclick="BBTreeModal.makeModal(this,\''+ tagLabel +'\')"></li>';
			floatControlBox += '<li class="convertTag" title="Convert Keyword" do="convert" onclick="BBTreeModal.makeModal(this,\''+ tagLabel +'\')"></li>';
		}
		floatControlBox += '</span>';
		
	}
	if(callTree.currentSettings.displaySettings.buttonType == 'tagging')
	{
		var displayChecked = '';
		floatControlBox = '<span class="fCB">';
		floatControlBox += '<ul>';
		floatControlBox += '<li>';
		if(isChecked == ' checked'){
			floatControlBox += '<input type="checkbox" class="checkbox checked"  checked onclick="BBTreeTag.checkRemoveAdd(this, \''+tagLabel+'\')"></input></li></ul>';
		} else {
			floatControlBox += '<input type="checkbox" class="checkbox" onclick="BBTreeTag.checkRemoveAdd(this, \''+tagLabel+'\')"></input></li></ul>';
		}
		floatControlBox += '</span>';
		if(tagLabel != 'tagLabel_291' && tagLabel != 'tagLabel_296')
		{
			return(floatControlBox);
		} else { 
			return ''; 
		}
	}
	if((tagLabel == 'tagLabel_291' || tagLabel == 'tagLabel_296') && callTree.currentSettings.displaySettings.buttonType != 'modal')
	{
		return '<span class="fCB" ><ul><li class="printTag"  onClick="printTags()"> </li><li class="addTag" title="Add New Tag" do="add" onclick="BBTreeModal.makeModal(this,\''+ tagLabel +'\')"></li></ul></span>'; 
	} 
	else 
	{ 
		return(floatControlBox); 
	}
}
function updateViewContactPage(tagLabel)
{
	var tabCounter = cj('li#tab_tag em').html();
	var tagLiteralName = cj(BBTree.treeLoc + ' dt#'+ tagLabel + ' .tag .name').html();
	var headList = cj('.contactTagsList.help span').html();
	if(headList)
	{
		var headSplit = headList.split(" • ");
		var appendAfter = headSplit.length;
		headSplit[appendAfter] = tagLiteralName;
		headSplit.sort();
		headList = headSplit.join(" • ");
		cj('.contactTagsList.help span').html(headList);
	}
	else
	{
		headList = tagLiteralName;
		cj('#TagGroups #dialog').append('<div class="contactTagsList help"><strong>Issue Codes: </strong><span>' + headList + '</span></div>');
	}
	cj('li#tab_tag em').html('').html(parseFloat(tabCounter)+1);
	return true;

}
function modalLoadingGif(path)
{
	switch(path){
		case 'add': cj('.ui-dialog-buttonpane').addClass('loadingGif');cj('.ui-dialog-buttonset').css("visibility", "hidden"); break;
		case 'remove': cj('.ui-dialog-buttonpane').removeClass('loadingGif');cj('.ui-dialog-buttonset').css("visibility", "visible"); break;
		default: break;
	}		
}
function sortWindow()
{
	var path = window.location.pathname;
	switch(path.toLowerCase())
	{
		case '/civicrm/contact/view': callTree.currentSettings['pageLocation'] ='view'; break;
		case '/civicrm/contact/add': callTree.currentSettings['pageLocation'] = 'edit'; break;
		case '/civicrm/admin/tag': callTree.currentSettings['pageLocation'] = 'manage'; break;
		default: callTree.currentSettings['pageLocation'] = 'default'; break;
	}
}
function aCSel(selector) //addClassSelector
{
	return '.'+selector;
}
function aIDSel(selector) //addIDSelector
{
	return '#'+selector;
}
function setTreeLoc()
{
	BBTree["treeLoc"] = {};
	BBTree.treeLoc = '.'+callTree.currentSettings.displaySettings.currentInstance+ '.'+callTree.currentSettings.pageSettings.tagHolder+'.'+callTree.currentSettings.displaySettings.buttonType.toLowerCase();
}
//remove at the end
function returnTime()
{
	var time = new Date();
	var rTime = time.getMinutes() + ':' + time.getSeconds() + ':' + time.getMilliseconds();
	console.log(rTime);
}

function printTags()
{
	var data = cj(BBTree.treeLoc+aIDSel(addTagLabel(callTree.currentSettings.displaySettings.currentTree))).html();
	var mywindow = window.open('', 'PrintTags');
	mywindow.document.body.innerHTML="";
	mywindow.document.write('<!DOCTYPE html><html><head><title>Print Tags</title>');
    mywindow.document.write('<link type="text/css" rel="stylesheet" href="/sites/default/themes/Bluebird/nyss_skin/tags/tags.css" />');
   //mywindow.document.write('<script type="text/javascript" src="/sites/all/modules/civicrm/packages/jquery/jquery.js"></'+'script>');
    mywindow.document.write('</head><body class="popup">');
    mywindow.document.write('<div class="BBTree" style="height:auto;width:auto;overflow-y:hidden;">');
    mywindow.document.write(data);
    mywindow.document.write('</div>');
    mywindow.document.write('</body></html>');
    mywindow.print();
    return true;
}