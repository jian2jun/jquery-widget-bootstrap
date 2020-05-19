define(['jquery', 'base'], function($){

    $.widget('ui.group', $.ui.base, {

        templates: {

            main: '\
                {{if title}}{{tmpl "layoutTitle"}}{{/if}}\
                <div class="layout-detail">\
                    <div class="list"></div>\
                    <div class="actions">\
                        {{tmpl(btns) "btn"}}\
                    </div>\
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

            item: '\
                <div class="item">\
                    {{if title}}<h5>${title}</h5>{{/if}}\
                    <div></div>\
                </div>',

            btn: '\
                <span class="${clas} action"><i class="${icon}"></i> ${title}</span>'


        },

        options: {

            title: '',

    	    headingBtns: [],

            init: {
                url: '',
                type: 'GET',
                data: {},
                source: null
            },

            items: [],

            btns: [],

            complete: null
            
        },

        _create: function() {
            this._addClass(this.widgetFullName);
            this._on({
            	'click a.heading-action': '_clickAction',
            	'click span.action': '_clickAction'
            });
        },

        _init: function(){

            this._getInitData(function(res){
            	
            	this._trigger('afterInitData', null, res);
                this._handleHeadingBtns();
            	
            	this.element.html(this._tmpl('main', this.options));
                this.list = this.element.find('.list');

                this._renderItems();
            });        	
        },

        _getInitData: function(callback){
            var that = this;
            var init = this.options.init;
            if(init.source || init.url === ''){
                callback.call(this, init.source);
            }else{
                $.ajax({
                    url: init.url,
                    type: init.type || 'GET',
                    data: init.data || {},
                    cache: false,
                    success: function (res) {
                        if(res.code && res.code === '0'){
                        	init.source = res.value || res.result || res.data || res.datalist || res;
                        	callback.call(that, init.source);
                        	return;
                        }
                        if(res && !res.code){
                        	init.source = res;
                        	callback.call(that, res);
                        }else{
                        	layer.msg(res.message || res.msg || '数据获取错误');
                        }
                    }
                });
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

        _renderItems: function(){
            var that = this;
            this._widgets = {};
            $.each(this.options.items, function(){
                var tmpl = that._tmpl('item', this);
                if($.isFunction(this.options)){
                    this.options = this.options.call(that, that.options.init.source);
                }
                that._widgets[this.key] = $(tmpl).appendTo(that.list).find('div')[this.widget](this.options);
            });
        },

        _clickAction: function(event){
			var that = this;
        	var target = $(event.currentTarget);
			var tData = this._tmplItem(target).data;
			tData.click.call(this, event, {
                data: that.options.init.source,
                widgets: that._widgets
            });
        }
        
    });

});