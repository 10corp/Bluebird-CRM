// Generated by CoffeeScript 1.6.3
var View, treeBehavior, _treeVisibility, _viewSettings;

window.jstree.views = {
  createNewView: function(instance) {
    var newView;
    return newView = new View(instance);
  }
};

View = (function() {
  function View(instance) {
    this.instance = instance;
    this.writeContainers();
    this.interval = this.setUpdateInterval(1000);
  }

  View.prototype.getData = function() {
    if (this.instance.get('ready') === true) {
      this.killUpdateInterval(this.interval);
      return this.writeTreeFromSource();
    }
  };

  View.prototype.setUpdateInterval = function(timeSet) {
    var callback,
      _this = this;
    callback = function() {
      return _this.getData();
    };
    return setInterval(callback, timeSet);
  };

  View.prototype.killUpdateInterval = function(clearInt) {
    return clearInterval(clearInt);
  };

  View.prototype.writeContainers = function() {
    this.formatPageElements();
    return this.addClassesToElement();
  };

  View.prototype.addClassesToElement = function() {
    this.cjInitHolderId.html("<div class='" + this.addClassHolderString + "'></div>");
    this.addMenuToElement();
    this.addTokenHolderToElement();
    this.addDataHolderToElement();
    return this.cjInitHolderId.removeClass(this.initHolderId).attr("id", this.addIdWrapperString);
  };

  View.prototype.addMenuToElement = function() {
    var menu;
    menu = "      <div class='" + this.menuName.menu + "'>       <div class='" + this.menuName.top + "'>        <div class='" + this.menuName.tabs + "'></div>        <div class='" + this.menuName.settings + "'></div>       </div>       <div class='" + this.menuName.bottom + "'>        <div class='" + this.menuName.autocomplete + "'>         <input type='text' id='JSTree-ac'>        </div>        <div class='" + this.menuName.settings + "'></div>       </div>      </div>    ";
    return this.cjInitHolderId.prepend(menu);
  };

  View.prototype.addDataHolderToElement = function() {
    var dataHolder;
    dataHolder = "<div id='JSTree-data' style='display:none'></div>";
    return this.cjInitHolderId.append(dataHolder);
  };

  View.prototype.addTokenHolderToElement = function() {
    var tokenHolder;
    tokenHolder = "      <div class='" + this.tokenHolder.tokenHolder + "'>       <div class='" + this.tokenHolder.resize + "'></div>       <div class='" + this.tokenHolder.body + "'>        <div class='" + this.tokenHolder.left + "'></div>        <div class='" + this.tokenHolder.options + "'></div>       </div>      </div>    ";
    return this.cjInitHolderId.append(tokenHolder);
  };

  View.prototype.addSearchBoxToElement = function() {};

  View.prototype.formatPageElements = function() {
    var i, pageElements, selector, _i, _len, _ref, _ref1;
    pageElements = this.instance.get('pageElements');
    _ref = ["", ""], this.tagHolderSelector = _ref[0], this.tagWrapperSelector = _ref[1];
    this.menuName = {
      menu: "",
      top: "",
      tabs: "",
      bottom: "",
      autocomplete: "",
      settings: ""
    };
    this.tokenHolder = {
      tokenHolder: "",
      options: "",
      body: "",
      resize: "",
      left: ""
    };
    this.addIdWrapperString = pageElements.wrapper;
    this.addClassHolderString = pageElements.tagHolder;
    this.initHolderId = pageElements.init;
    this.cjInitHolderId = cj("." + this.initHolderId);
    this.addClassHolderString = this.ifisarrayjoin(this.addClassHolderString);
    _ref1 = pageElements.tagHolder;
    for (i = _i = 0, _len = _ref1.length; _i < _len; i = ++_i) {
      selector = _ref1[i];
      selector = selector.replace(" ", "-");
      this.menuName = this.concatOnObj(this.menuName, selector);
      this.tokenHolder = this.concatOnObj(this.tokenHolder, selector);
      this.tagHolderSelector = this.tagHolderSelector.concat("." + selector);
    }
    return this.tagWrapperSelector = this.tagWrapperSelector.concat("#" + pageElements.wrapper);
  };

  View.prototype.ifisarrayjoin = function(toJoin) {
    if (cj.isArray(toJoin)) {
      return toJoin = toJoin.join(" ");
    }
  };

  View.prototype.concatOnObj = function(obj, selector, classOrId) {
    var k, v;
    if (classOrId == null) {
      classOrId = ".";
    }
    for (k in obj) {
      v = obj[k];
      if (k.substr(0, 3) === "cj_") {
        break;
      }
      if (typeof obj["cj_" + k] === "undefined") {
        obj["cj_" + k] = "";
      }
      obj["cj_" + k] = obj["cj_" + k].concat("" + classOrId + selector + "-" + k);
      obj[k] = obj[k].concat("" + selector + "-" + k + " ");
    }
    return obj;
  };

  View.prototype.getCJQsaves = function() {
    this.cjTagWrapperSelector = cj(this.tagWrapperSelector);
    this.cjTagHolderSelector = cj(this.tagHolderSelector);
    this.cjInstanceSelector = cj(this.tagWrapperSelector.concat(" " + this.tagHolderSelector));
    return this.cjTabs = cj(this.menuName.cj_tabs);
  };

  View.prototype.writeTreeFromSource = function() {
    var k, locals, v, _ref;
    this.getCJQsaves();
    this.displaySettings = this.instance.get('displaySettings');
    this.dataSettings = this.instance.get('dataSettings');
    locals = {
      "menu": this.menuName.cj_tabs,
      "top": this.displaySettings.defaultTree
    };
    treeBehavior.setLocals(locals);
    this.writeTabs();
    this.cjInstanceSelector.html(_treeData.html[this.displaySettings.defaultTree]);
    _ref = this.dataSettings.pullSets;
    for (k in _ref) {
      v = _ref[k];
      if (v !== this.displaySettings.defaultTree) {
        this.cjInstanceSelector.append(_treeData.html[v]);
      }
      treeBehavior.createOpacityFaker(".top-" + v, "dt", "type-" + v);
    }
    this.cjInstanceSelector.find(".top-" + this.displaySettings.defaultTree).addClass("active");
    treeBehavior.setCurrentTab(_treeData.treeTabs[this.displaySettings.defaultTree]);
    cj(this.tagHolderSelector).append("<div class='search tagContainer'></div>");
    treeBehavior.autoCompleteStart(this.instance);
    treeBehavior.readDropdownsFromLocal();
    return treeBehavior.enableDropdowns();
  };

  View.prototype.writeTabs = function() {
    var b, k, output, v, _ref, _results;
    output = "";
    _treeData.treeTabs = {};
    _ref = _treeData.treeNames;
    _results = [];
    for (k in _ref) {
      v = _ref[k];
      b = v.replace(" ", "-");
      b = b.toLowerCase();
      treeBehavior.appendTab(b, v);
      _treeData.treeTabs[k] = "tab-" + b;
      _results.push(treeBehavior.createTabClick("tab-" + b, "top-" + k));
    }
    return _results;
  };

  return View;

})();

_treeVisibility = {
  currentTree: "",
  defaultTree: "",
  previousTree: ""
};

treeBehavior = {
  setLocals: function(locals) {
    if (locals.menu != null) {
      this.tabsLoc = locals.menu;
    }
    if (locals.top != null) {
      if (_treeVisibility.currentTree === "") {
        return _treeVisibility.currentTree = "top-" + locals.top;
      }
    }
  },
  autoCompleteStart: function(instance) {
    var cjac, params, searchmonger,
      _this = this;
    this.instance = instance;
    this.pageElements = this.instance.get('pageElements');
    this.dataSettings = this.instance.get('dataSettings');
    this.appendTab("search", "search", true);
    this.createTabClick("tab-search", "search");
    if (this.cjTagBox == null) {
      this.cjTagBox = cj("." + (this.pageElements.tagHolder.join(".")));
    }
    cj("#JSTree-data").data({
      "autocomplete": this.instance.getAutocomplete()
    });
    params = {
      jqDataReference: "#JSTree-data",
      hintText: "Type in a partial or complete name of an tag or keyword.",
      theme: "JSTree"
    };
    cjac = cj("#JSTree-ac");
    searchmonger = cjac.tagACInput("init", params);
    return cjac.on("keydown", bbUtils.throttle(function(event) {
      return searchmonger.exec(event, function(terms) {
        console.log(terms);
        if ((terms != null) && (terms.tags != null)) {
          if (terms.tags.length > 0) {
            console.log("length");
            _this.buildSearchList(terms.tags, terms.term.toLowerCase());
          } else if (terms.tags.length === 0 && terms.term.length >= 3) {
            _this.buildSearchList(null, "No Results Found");
          }
        }
        if (cjac.val().length < 3) {
          if (_treeVisibility.currentTree === "search") {
            _this.showTags(_treeVisibility.previousTree);
            return cj("" + _this.tabsLoc + " .tab-search").hide();
          }
        }
      });
    }, 300));
  },
  grabParents: function(cjParentId) {
    var go, newid, parentid;
    if (this.dataSettings.pullSets.indexOf(cjParentId) !== -1) {
      return [];
    }
    go = true;
    parentid = [cjParentId];
    while (go) {
      newid = this.cjTagBox.find("dt[data-tagid=" + parentid[parentid.length - 1] + "]").data("parentid");
      if (this.dataSettings.pullSets.indexOf(newid) < 0) {
        parentid.push(newid);
      } else {
        go = false;
      }
    }
    return parentid;
  },
  buildParents: function(parentArray) {
    var clonedName, clonedTag, clonedTagLvl, index, output, parentid, _i, _len;
    output = "";
    parentArray.reverse();
    for (index = _i = 0, _len = parentArray.length; _i < _len; index = ++_i) {
      parentid = parentArray[index];
      clonedTag = this.cjTagBox.find("dt[data-tagid=" + parentid + "]").clone();
      clonedTagLvl = this.parseLvl(clonedTag.attr("class"));
      clonedName = clonedTag.data('name');
      if (index === 0) {
        if (this.alreadyPlaced.indexOf(parentid) < 0) {
          clonedTag.appendTo(this.cjSearchBox).addClass("open");
          this.alreadyPlaced.push(parentid);
          this.cjSearchBox.append(this.createDL(clonedTagLvl, parentid, clonedName));
        }
      } else {
        if (this.alreadyPlaced.indexOf(parentid) < 0) {
          clonedTag.appendTo(".search #tagDropdown_" + parentArray[index - 1]);
          cj(".search #tagDropdown_" + parentArray[index - 1]).append(this.createDL(clonedTagLvl, parentid, clonedName));
        }
      }
    }
    return cj(".search #tagDropdown_" + parentArray[index - 1]);
  },
  parseLvl: function(tags) {
    var tag, tagArr, _i, _len;
    tagArr = tags.split(" ");
    for (_i = 0, _len = tagArr.length; _i < _len; _i++) {
      tag = tagArr[_i];
      if (tag.indexOf("lv-") !== -1) {
        return tag.slice(3);
      }
    }
  },
  createDL: function(lvl, id, name) {
    return "<dl class='lv-" + lvl + "' id='tagDropdown_" + id + "' data-name='" + name + "'></dl>";
  },
  createDT: function(lvl, id, name, parent) {},
  buildSearchList: function(tagList, term) {
    var allDropdowns, cjCloneChildren, cjCloneTag, cjParentId, foundId, key, tag, tagListLength, toAppendTo, value, _i, _len, _ref,
      _this = this;
    this.alreadyPlaced = [];
    if (this.cjSearchBox == null) {
      this.cjSearchBox = this.cjTagBox.find(".search");
    }
    this.cjSearchBox.empty();
    if (tagList !== null) {
      tagListLength = tagList.length;
      this.toShade = [];
      foundId = [];
      for (key in tagList) {
        tag = tagList[key];
        foundId.push(parseInt(tag.id));
      }
      for (key in tagList) {
        tag = tagList[key];
        cjCloneTag = this.cjTagBox.find("dt[data-tagid=" + tag.id + "]");
        cjParentId = cjCloneTag.data("parentid");
        if (this.cloneChildren(cjCloneTag, tagList)) {
          if (foundId.indexOf(cjParentId) < 0) {
            if (this.dataSettings.pullSets.indexOf(cjParentId) < 0) {
              toAppendTo = this.buildParents(this.grabParents(cjParentId));
            } else {
              toAppendTo = this.cjSearchBox;
            }
          } else {
            toAppendTo = this.cjSearchBox;
          }
          cjCloneChildren = this.cjTagBox.find("#tagDropdown_" + tag.id);
          this.toShade.push(parseInt(tag.id));
          cjCloneTag.clone().appendTo(toAppendTo).addClass("shaded");
          cjCloneChildren.clone().appendTo(toAppendTo);
        } else {
          this.toShade.push(parseInt(tag.id));
        }
      }
      allDropdowns = cj(".search dt .tag .ddControl.treeButton").parent().parent();
      bbUtils.returnTime("Start Process");
      this.processSearchChildren(this.toShade);
      bbUtils.returnTime("End Shade Dropdowns");
      cj.each(allDropdowns, function(key, value) {
        var tagid;
        tagid = cj(value).data('tagid');
        if (tagid != null) {
          return _this.enableDropdowns(".search dt[data-tagid='" + tagid + "']", true);
        }
      });
      bbUtils.returnTime("End Dropdowns");
    } else {
      tagListLength = 0;
      this.cjSearchBox.append("<div class='noResultsFound'>No Results Found</div>");
    }
    _ref = this.toShade;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      value = _ref[_i];
      this.makeShade(value, term);
    }
    cj("" + this.tabsLoc + " .tab-search").show();
    this.setTabResults(tagListLength, "tab-search");
    return this.showTags("search");
  },
  makeShade: function(tagid, term) {
    var cjItems,
      _this = this;
    cjItems = cj(".search dt[data-tagid='" + tagid + "']");
    cjItems.addClass("shaded");
    return cj.each(cjItems, function(i, arr) {
      var initIndex, strBegin, strEnd, strTerm, tagName, toLc;
      toLc = cj(arr).find(".tag .name").text().toLowerCase();
      initIndex = toLc.indexOf(term.toLowerCase());
      strBegin = cj(arr).text().slice(0, initIndex);
      strEnd = cj(arr).text().slice(term.length + initIndex);
      strTerm = "<span>" + (cj(arr).text().slice(initIndex, term.length + initIndex)) + "</span>";
      tagName = cj(arr).find(".tag .name");
      return tagName.html("" + strBegin + strTerm + strEnd);
    });
  },
  cloneChildren: function(cjTag, tagList) {
    var hasRelevantPs, key, setReturn, tag;
    setReturn = true;
    for (key in tagList) {
      tag = tagList[key];
      hasRelevantPs = cjTag.parents("dl#tagDropdown_" + tag.id);
      if (hasRelevantPs.length > 0) {
        setReturn = false;
      }
    }
    return setReturn;
  },
  setTabResults: function(number, tabName) {
    var result, tab;
    tab = cj("" + this.tabsLoc + " ." + tabName);
    tab.find("span").remove();
    result = tab.html();
    return tab.html("" + result + "<span>(" + number + ")</span>");
  },
  setCurrentTab: function(treeTag) {
    cj("" + this.tabsLoc).find(".active").toggleClass("active");
    return cj("" + this.tabsLoc).find("." + treeTag).toggleClass("active");
  },
  showTags: function(currentTree, noPrev) {
    if (currentTree !== _treeVisibility.currentTree) {
      this.cjTagBox.find("." + _treeVisibility.currentTree).toggle();
      _treeVisibility.previousTree = _treeVisibility.currentTree;
      _treeVisibility.currentTree = currentTree;
      this.cjTagBox.find("." + currentTree).toggle();
      return this.setCurrentTab(this.convertTreeNameToTab(currentTree));
    }
  },
  convertTreeNameToTab: function(treeName) {
    var parsed, splitted;
    splitted = treeName.split("-");
    parsed = parseInt(splitted[splitted.length - 1]);
    if (!isNaN(parsed)) {
      return "" + _treeData.treeTabs[parsed];
    } else {
      if (treeName === "search") {
        return "tab-" + treeName;
      }
    }
  },
  appendTab: function(a, c, hidden) {
    var cjtabloc, output, style;
    if (hidden == null) {
      hidden = false;
    }
    style = "";
    if (hidden) {
      style = "style='display:none'";
    }
    cjtabloc = cj("" + this.tabsLoc);
    output = "<div class='tab-" + a + "' " + style + ">" + c + "</div>";
    return cjtabloc.append(output);
  },
  autoCompleteEnd: function(instance) {
    this.instance = instance;
    return cj("#JSTree-ac").off("keydown");
  },
  processSearchChildren: function(tagArray) {
    var alreadyProcessed, parent, parents, tag, _i, _len, _results;
    alreadyProcessed = [];
    _results = [];
    for (_i = 0, _len = tagArray.length; _i < _len; _i++) {
      tag = tagArray[_i];
      parents = this.grabParents(tag);
      _results.push((function() {
        var _j, _len1, _results1;
        _results1 = [];
        for (_j = 0, _len1 = parents.length; _j < _len1; _j++) {
          parent = parents[_j];
          if (alreadyProcessed.indexOf(parent) < 0 && parent !== tag) {
            cj(".search dt[data-tagid='" + parent + "']").addClass("open");
            cj(".search dl#tagDropdown_" + parent).show();
            _results1.push(alreadyProcessed.push(parent));
          } else {
            _results1.push(void 0);
          }
        }
        return _results1;
      })());
    }
    return _results;
  },
  createTabClick: function(tabName, tabTree) {
    var _this = this;
    cj(".JSTree-tabs ." + tabName).off("click");
    return cj(".JSTree-tabs ." + tabName).on("click", function() {
      return _this.showTags(tabTree);
    });
  },
  enableDropdowns: function(tag, search) {
    if (tag == null) {
      tag = "";
    }
    if (search == null) {
      search = false;
    }
    cj(".JSTree " + tag + " .treeButton").off("click");
    return cj(".JSTree " + tag + " .treeButton").on("click", function() {
      return treeBehavior.dropdownItem(cj(this).parent().parent(), search);
    });
  },
  createOpacityFaker: function(container, parent, cssClass) {
    var cjItems;
    if (cssClass == null) {
      cssClass = "";
    }
    cjItems = cj("" + container + " " + parent);
    return cjItems.append("<div class='transparancyBox " + cssClass + "'></div>");
  },
  dropdownItem: function(tagLabel, search) {
    var tagid,
      _this = this;
    if (search == null) {
      search = false;
    }
    tagid = tagLabel.data('tagid');
    tagLabel.siblings("dl#tagDropdown_" + tagid).slideToggle("200", function() {
      if (tagLabel.is(".open")) {
        _viewSettings["openTags"][tagid] = false;
      } else {
        _viewSettings["openTags"][tagid] = true;
      }
      return tagLabel.toggleClass("open");
    });
    if (!search) {
      return bbUtils.localStorage("tagViewSettings", _viewSettings["openTags"]);
    }
  },
  readDropdownsFromLocal: function() {
    var bool, tag, toPass, _ref;
    if (bbUtils.localStorage("tagViewSettings")) {
      _viewSettings["openTags"] = bbUtils.localStorage("tagViewSettings");
      _ref = bbUtils.localStorage("tagViewSettings");
      for (tag in _ref) {
        bool = _ref[tag];
        if (bool) {
          toPass = cj("dt.tag-" + tag);
          this.dropdownItem(toPass);
        } else {
          delete _viewSettings["openTags"][tag];
        }
      }
    } else {

    }
    return _viewSettings["openTags"];
  },
  loadingGif: function() {
    return cj("." + (this.pageElements.tagHolder.join("."))).toggleClass("loadingGif");
  }
};

_viewSettings = {
  openTags: {}
};

/*
neat
<script>
$("div").attr("id", function (arr) {
  return "div-id" + arr;
})
.each(function () {
  $("span", this).html("(ID = '<b>" + this.id + "</b>')");
});
</script>
*/

