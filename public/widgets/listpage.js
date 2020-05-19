define(['jquery', 'form', 'table'], function($){

    $.widget('ui.listpage', $.ui.base, {

        templates: {

            main: '\
                {{if title}}{{tmpl "layoutTitle"}}{{/if}}\
                <div class="layout-detail">\
                    {{if tabs && tabs.length}}\
                        <ul class="nav nav-tabs">{{tmpl(tabs) "tab"}}</ul>\
                    {{/if}}\
                    {{if searchItems.length}}\
                        <div class="search"></div>\
                    {{/if}}\
                    {{if pageSizes.length}}\
                        {{tmpl "pageSizeSelect"}}\
                    {{/if}}\
                    <div class="list"></div>\
                </div>',

            layoutTitle: '\
                <div class="layout-title">\
                    <span>${title}</span>\
                    {{if headingBtns.length}}\
                        <div class="btn-group pull-right">\
                            {{tmpl(headingBtns) "headingBtn"}}\
                        </div>\
                    {{/if}}\
                </div>',

            headingBtn: '\
                <a href="${url}" class="${clas} heading-action" target="${target}"><i class="${icon}"></i> ${title}</a>',

            tab: '\
                <li {{if active}}class="active"{{/if}}><a href="javascript:;">${title}</a></li>',

            pageSizeSelect: '\
                <p class="page-size">\
                    <span>每页</span>\
                    <select class="form-control">\
                        {{tmpl(pageSizes) "pageSizeOption"}}\
                    </select>\
                    <span>条记录</span>\
                </p>',

            pageSizeOption: '\
                <option value="${value}" {{if selected}}selected="selected"{{/if}}>${label}</option>'

        },

        options: {

            title: '',

    	    headingBtns: [],

    	    tabs: [],

            searchItems: [],

            disableAutoSearch: false,

            searchData: {},

            pageSizes: [],

    	    list: {},

            columns: [],

            actions: [],

            complete: null
        },

        _create: function() {
            this._addClass(this.widgetFullName);

            this._on({
            	'click .nav-tabs>li': '_clickTab',
            	'change .page-size>select': '_changePageSize',
                'click a.heading-action': '_clickHeadingAction'
            });
        },

        _init: function(){

            //this._setUserPri();

            this._handleHeadingBtns();

            this.element.html(this._tmpl('main', this.options));
            this.heading = this.element.find('.heading');           
            this.search = this.element.find('.search');
            this.pageSize = this.element.find('.page-size');
            this.list = this.element.find('.list');

            this._setPageSize();

            if(this.search.length){
            	this._renderSearch();
            }else{
                this._renderList(1);
            }
        },
        
        //权限控制
        _setUserPri: function(){
        	var opts = this.options;
        	var hBtns = opts.headingBtns;
        	var acts = opts.actions;
        	var onlyStats;
        	        	
        	if(G && G.U && G.U[G.page]){
        		//头部按钮
        		for(var i = 0; i < hBtns.length; i++){
        			if(hBtns[i].role && $.inArray(hBtns[i].role, G.U[G.page]) < 0){
        				hBtns.splice(i--, 1);
        			}
        		} 
        		onlyStats = hBtns.length === 1 && hBtns[0].clas.indexOf('stats') > -1;
        		if((!hBtns.length || onlyStats) && !acts.length){
        			opts.list.enableCheckbox = false;
        			return;
        		}
        		//列表按钮
        		for(var i = 0; i < acts.length; i++){
        			if(acts[i].role && $.inArray(acts[i].role, G.U[G.page]) < 0){
        				acts.splice(i--, 1);
        			}
        		}
        		if(!acts.length){
        			opts.list.enableActions = false;
        			if(!hBtns.length){
        				opts.list.enableCheckbox = false;
        			}
        		}
			}
        },

        _handleHeadingBtns: function(){        	
        	$.each(this.options.headingBtns, function(){
                if(!this.url){
                    this.url = 'javascript:;';
                }
                if(!this.target){
                    this.target = '_self';
                }
            });
        },

        _setPageSize: function(){
        	var that = this;
        	var pageSizes = this.options.pageSizes;
            $.each(pageSizes, function(){
                if(this.selected){
                    that.options.pageSize = this.value;
                    return false;
                }
            });
        },

        _renderSearch: function(){
            var that = this;
            var index = this.options.searchItems.length - 1;
            var item = this.options.searchItems[index];

            item = item.items ? item.items : item;
            $.each(item, function(i, v){

                if(v.type && v.type === 'submit'){
                    v.click = function(event, data){
                        var retData = that._trigger('beforeSearch', event, data);
                        if(!retData){
                            return;
                        }
                        if($.isPlainObject(retData)){
                            that.options.searchData = retData;
                        }else{
                            that.options.searchData = data;
                        }
                        that._renderList(1);
                    };
                }
                else if(v.type && v.type === 'button' && v.clas.indexOf('export') > -1){
                    v.click = function(event, data){
                        that._exportData(data, that.options.export);
                    };
                }
            });
            
            /*
            if(this.options.searchData){
            	$.each(this.options.searchItems, function(i, item){
            		var value = that.options.searchData[item.name];
            		if(value){
            			item.value = value;
            		}
            	});
            }
            */

            this.search
	            .form({
	                items: this.options.searchItems
	            });
            if(!this.options.disableAutoSearch){
                this.search.form('getData', function(data){
            		that.options.searchData = data;
                	that._renderList(1);
	            });
            }            	
        },

        _exportData: function(data, options){
        	var url = options.url;
    		var search = $.param(data);		
    		window.location.href = url + '?' + search;
        },

        _renderList: function(page){
            if(this.pageSize.is(':hidden')){
                this.pageSize.show();
            }

            this.options.list.data = this.options.list.data || {};
            $.extend(this.options.list.data, this.options.searchData);

            this.options.list.page = page;
            if(this.options.pageSize){
                this.options.list.pageSize = this.options.pageSize;
            }

            this.list.table({
                list: this.options.list,
                columns: this.options.columns,
                actions: this.options.actions,
                complete: this.options.complete
            });
        },

        _clickTab: function(event){
        	var data = this._tmplItem(event.target).data;
        	window.loadPage && window.loadPage(data.page);
        },

        _changePageSize: function(event){        	
            var target = $(event.target);
        	this.options.pageSize = parseInt(target.val());        	
        	this._renderList(1);
        },

        _clickHeadingAction: function(event, tmpl){
            if($.isFunction(tmpl.data.click)){
                tmpl.data.click.call(this.element[0], event, this.list.table('getCheckedData'));
            }
        },

        getCheckedData: function(){
            return this.list.table('getCheckedData');
        }

    });

});
