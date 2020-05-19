define(['jquery', 'base', 'paging', 'jqueryui'], function ($) {

    $.widget('ui.table', $.ui.base, {

        templates: {

            main: '\
    			<table class="table table-bordered table-striped table-hover">\
    				<thead>\
    					<tr>{{tmpl(titles) "th"}}</tr>\
    				</thead>\
    				<tbody>\
    					{{if source && source.length}}\
    						{{tmpl(source) "tr"}}\
    					{{else}}\
    						{{tmpl(titles.length) "defaultTr"}}\
    					{{/if}}\
    				</tbody>\
    			</table>\
    			{{if page}}<p class="paging"></p>{{/if}}',

            th: '\
                <th {{if width}}style="width: ${width}"{{/if}}>{{html title}}</th>',

            tr: '\
                <tr>\
                	{{each columns}}\
                		{{if !skip}}\
                            {{if replace}}{{html text}}{{else}}<td>{{html text}}</td>{{/if}}\
                		{{/if}}\
                	{{/each}}\
                </tr>',

            defaultTr: '\
    			<tr><td colspan="${$data}">暂无可用数据</td></tr>',

            placeholder: '\
                <div class="text-center">{{html placeholder}}</div>'

        },

        options: {

            sortable: false,

            list: {},

            columns: [],

            actions: [],

            checkeddata: {},

            placeholder: '',

            complete: null
        },

        _list: {
            url: '',
            type: 'GET',
            data: {},
            keys: {
                base: '',
                source: 'result',
                index: 'id',
                page: 'pageNum',
                pageSize: 'pageSize',
                total: 'total'
            },
            page: 1,
            pageSize: 10,
            source: [],
            enableCheckbox: false,
            enableActions: false
        },

        _create: function () {

            this._addClass(this.widgetFullName);

            this._on({
                'click .check-all': '_clickCheckAll',
                'click a.action': '_clickAction',
                'click input[type=checkbox]': '_clickCheckbox'
            });
        },

        _init: function () {
            this.options.list = $.extend({}, this._list, this.options.list);
            this._getList(this.options.list.page);
        },

        _getList: function (page) {
            var list = this.options.list;

            this._getListData(page, function(res){

                if(list.keys.base){
                    res = res[list.keys.base];
                }

                this._setListData(res);

                if((!list.source || !list.source.length) && this.options.placeholder){
                    this.element.html(this._tmpl('placeholder', this.options));
                    return;
                }

                this.element.html(this._tmpl('main', list));
                this.table = this.element.find('table');
                this.thead = this.table.find('thead');
                this.tbody = this.table.find('tbody');

                this._setPaging();
                this._setChecked();

                if(this.options.sortable){
                    this._setSortable();
                }
                this._trigger('complete');
            });
        },

        _getListData: function (page, callback) {
            var that = this;
            var list = this.options.list;

            if(!list.url || list.source.length){
                callback.call(this);
            }else{
                $.ajax({
                    url: list.url,
                    type: list.type || 'GET',
                    data: this._getAjaxData(page),
                    contentType: list.contentType || 'application/x-www-form-urlencoded; charset=utf-8',
                    cache: false,
                    success: function (res) {
                        that._ajaxSuccess(res, callback);
                    }
                });
            }
        },

        _getAjaxData: function (page) {
            var list = this.options.list;
            var data = {};

            data[list.keys.page] = page || 1;
            data[list.keys.pageSize] = list.pageSize;
            data = $.extend({}, list.data, data);

            if (list.contentType && list.contentType.indexOf('application/json') > -1) {
                data = JSON.stringify(data);
            }

            return data;
        },

        _setPaging: function(){
            var that = this;
            var list = this.options.list;
            this.paging = this.element.find('.paging')
                .paging({
                    page: list.page,
                    pageSize: list.pageSize,
                    total: list.total,
                    selectPage: function(event, page){
                        list.source = [];
                        that._getList(page);
                    }
                });
        },

        _setListData: function (res) {
            var that = this;
            var list = this.options.list;

            if(res){
                list.source = res[list.keys.source];
                list.page = res[list.keys.page];
                list.pageSize = res[list.keys.pageSize];
                list.total = res[list.keys.total];
            }else{
                list.page = false;
            }

            this._extendColumns();
            list.titles = this.options.columns;

            $.each(list.source, function(i){
                this.columns = that._setColumns(this);
            });
        },

        _setColumns: function (row) {
            var columns = $.extend(true, [], this.options.columns);
            $.each(columns, function(i, column){
                var data = column.data ? (row[column.data] == null ? '' : row[column.data]) : '';
                if($.isFunction(column.render)){
                    column.text = column.render(data, row);
                    if(column.text === false){
                        column.skip = true;
                    }else if(column.text && typeof column.text === 'string' && column.text.indexOf('<td') === 0){
                        column.replace = true;
                    }
                }else{
                    column.text = data;
                }
            });
            return columns;
        },

        _extendColumns: function () {
            var that = this;
            var list = this.options.list;
            var index = list.keys.index;
            var columns = this.options.columns;

            if(list.enableCheckbox && columns[0].data !== 'checkbox'){
                columns.unshift({
                    title: '<input type="checkbox" class="check-all">',
                    data: 'checkbox',
                    render: function(data, row){
                        return '<input type="checkbox" value="' + row[index] + '">';
                    }
                });
            }
            if(list.enableActions && columns[columns.length - 1].data !== 'actions'){
                columns.push({
                    title: '操作',
                    data: 'actions',
                    render: function(data, row){
                        var ret = '';
                        var classes = "";
                        $.each(that.options.actions, function(i, item){
                            var hide;
                            if($.isFunction(item.hide)){
                                hide = item.hide(row);
                            }else{
                                hide = item.hide;
                            }

                            if($.isFunction(item.text)){
                                item._text = item.text(row);
                            }else{
                                item._text = item.text;
                            }

                            classes = this.clas ? this.clas + ' action' : 'action';
                            if(hide){
                                classes += " hide";
                            }

                            ret += $('<a>')
                                .attr({
                                    href: this.url ? this.url + '?' + index + '=' + row[index] : 'javascript:;',
                                    target: this.target,
                                    class: classes
                                })
                                .append(item._text)
                                .prop('outerHTML');
                        });
                        return ret;
                    }
                });
            }
        },

        _setChecked: function(){
            var that = this;
            $.each(this.options.checkeddata, function(k, v){
                that.element.find('input[value=' + k + ']').prop('checked', true);
            });
        },

        _clickCheckbox: function(event){
            var target = $(event.currentTarget);
            if (target.prop('disabled') || target.hasClass('check-all')) {
                return;
            }
            var checkeddata = this.options.checkeddata;
            var data = this._tmplItem(target).data;
            var index = data[this.options.list.keys.index];
            if (target.prop('checked')) {
                if(!checkeddata[index]){
                    checkeddata[index] = $.extend(true, {}, data);
                    delete checkeddata[index].columns;
                }
            } else {
                delete checkeddata[index];
            }
        },

        _clickCheckAll: function (event) {
            var target = $(event.currentTarget);
            if (target.prop('disabled')) {
                return;
            }
            var checkbox = this.tbody.find('input[type=checkbox]');
            if (target.prop('checked')) {
                checkbox.prop('checked', false).click();
            } else {
                checkbox.prop('checked', true).click();
            }
        },

        _clickAction: function (event, tmpl) {
            var that = this;
            //var text = $(event.target).text();
            var index = $(event.currentTarget).index();
            $.each(that.options.actions, function(i){
                if(i == index && $.isFunction(this.click)){
                    this.click.call(that.element[0], event, tmpl.data);
                }
            });
        },

        _setSortable: function(){
            var that = this;
            this.tbody.sortable({
                cursor: 'move',
                axis: 'y',
                helper: function(e, ui){
                    ui.children().each(function() {
                        $(this).width($(this).width());
                    });
                    return ui;
                },
                stop: function( event, ui ) {
                    console.log(ui)
                }
            });
        },

        getCheckedData: function(){
            var that = this;
            var rows = [];
            var ids = [];
            $.each(this.options.checkeddata, function(k, v){
                rows.push(v);
                ids.push(k);
            });
            return {
                rows: rows,
                ids: ids
            };
        }

    });

});