define(['jquery', 'base', 'validate', 'chosen', 'daterangepicker', 'jquerytinymce'], function ($) {

    //定义部件
    $.widget('ui.multiform', $.ui.base, {

        templates: {

            main: '\
				<div class="container-fluid">\
					<form class="form-horizontal">\
						{{if title}}{{tmpl "title"}}{{/if}}\
						{{tmpl(items) "item"}}\
						{{if btns.length}}{{tmpl "btns"}}{{/if}}\
					</form>\
				</div>',

            title: '\
				<div class="row">\
					<div class="col-md-12">\
						<h5>${title}</h5>\
					</div>\
				</div>',

            btns: '\
				<div class="row">\
					<div class="col-md-12">\
						<div class="btn-group">{{tmpl(btns) "btn"}}</div>\
					</div>\
				</div>',

            btn: '\
				<input type="${type}" class="${clas} action" value="${text}">',

            item: '\
				{{if $data.length}}\
					<div class="row">\
						{{tmpl "aItem"}}\
					</div>\
				{{else}}\
					{{tmpl "oItem"}}\
				{{/if}}',

            aItem: '\
				<div class="${col}">\
					<div class="form-group">\
						<label class="${labelCol} control-label">${label}</label>\
						<div class="${valueCol}">\
							{{tmpl "typeAssign"}}\
						</div>\
					</div>\
				</div>',

            oItem: '\
				{{if group}}\
					<div class="form-group">\
						<label class="${labelCol} control-label">${label}</label>\
						<div class="${valueCol}">\
							<div class="row">\
								{{tmpl(group) "groupItem"}}\
							</div>\
						</div>\
					</div>\
				{{else}}\
					<div class="row">\
						<div class="${col}">\
							<div class="form-group">\
								<label class="${labelCol} control-label">${label}</label>\
								<div class="${valueCol}">\
									{{tmpl "typeAssign"}}\
								</div>\
							</div>\
						</div>\
					</div>\
				{{/if}}',

            groupItem: '\
				<div class="${col}">\
					{{tmpl "typeAssign"}}\
				</div>',

            typeAssign: '\
				{{if tag==="span"}}\
					{{tmpl "span"}}\
				{{else tag==="select"}}\
					{{tmpl "select"}}\
				{{else tag==="textarea"}}\
					{{tmpl "textarea"}}\
				{{else tag==="button"}}\
					{{tmpl "button"}}\
				{{else type==="text"}}\
					{{tmpl "text"}}\
				{{else type==="hidden"}}\
					{{tmpl "hidden"}}\
				{{else type==="radio"}}\
					{{tmpl "radio"}}\
				{{else type==="checkbox"}}\
					{{tmpl "checkbox"}}\
				{{else type==="file"}}\
					{{tmpl "inputFile"}}\
				{{/if}}',

            span: '\
				<span>{{html text}}</span>',

            select: '\
				<select name="${name}" class="form-control {{if _type}}${_type}{{/if}} {{if value}}value{{/if}} {{if chosen}}chosen{{/if}}" {{if disabled}}disabled{{/if}} {{if multiple}}multiple{{/if}}>\
					{{tmpl(options) "option"}}\
				</select>',

            option: '\
				<option value="${value}" {{if selected}}selected{{/if}}>${label}</option>',

            textarea: '\
				<textarea name="${name}" class="form-control {{if tinymce}}tinymce{{/if}}" {{if disabled}}disabled{{/if}} rows="3" placeholder="${placeholder}">${value}</textarea>',

            button: '\
				<button class="${clas} action">{{if icon}}<i class="${icon}"></i> {{/if}}${text}</button>',

            text: '\
				<input type="${type}" name="${name}" class="form-control {{if _type}}${_type}{{/if}}" value="${value}" {{if disabled}}disabled{{/if}} placeholder="${placeholder}">',

            hidden: '\
				<input type="${type}" name="${name}" value="${value}">',

            radio: '\
				{{tmpl(items) "radioItem"}}',

            radioItem: '\
				<input type="radio" name="${$parent.data.name}" value="${value}" {{if checked}}checked{{/if}}> <label>${label}</label>',

            checkbox: '\
				{{tmpl(items) "checkboxItem"}}',

            checkboxItem: '\
				<input type="checkbox" name="${$parent.data.name}" value="${value}" {{if checked}}checked{{/if}}> <label>${label}</label>',

            file: '\
				<input type="${type}" name="${name}" class="form-control" {{if accept}}accept="${accept}"{{/if}}>'

        },

        //配置选项
        options: {

            //表单标题
            title: '',

            //表单项
            items: [],

            //按钮组
            btns: [],

            //验证规则
            validate: null,

            //加载完成事件
            complete: null
        },

        _create: function () {

            this._addClass(this.widgetFullName);
            this.completeDfd = $.Deferred();

            this._on({
                'change select.relate': '_changeSelectRelate',
                'click input.action': '_clickInputAction',
                'click button.action': '_clickButtonAction'
            });
        },

        _init: function (){

            //处理数据
            this._handleItems(function () {

                this.element.html(this._tmpl('main', this.options));
                this.form = this.element.find('form');

                //表单验证
                if (this.options.validate) {
                    this._setValidate();
                }

                //设置input type=date
                this._setDatepicker(this.form.find('input.date'));

                //设置有初始值的select
                this._setSelectsValue();

                //处理有多功能select
                this._setChosen();

                //处理tinymce
                this._setTinymce();

                //延时对象完成
                this.completeDfd.resolve();

                this._trigger('complete');
            });
        },

        _handleItems: function (callback) {
            var that = this;
            this.optDefs = [];
            $.each(this.options.items, function (i, item) {
                if($.isArray(item)){
                    that._handleItemA(item);
                }else{
                    that._handleItemO(item);
                }
            });
            if (!this.optDefs.length) {
                callback.call(this);
            } else {
                $.when.apply($, this.optDefs).done(function () {
                    callback.call(that);
                });
            }
        },

        _handleItemA: function(item){
            var that = this;
            var l = item.length;
            var n;
            $.each(item, function(i, v){
                if(!v.col){
                    n = 12/l;
                    v.col = 'col-md-' + (n == 2.4 ? '2-4' : n);
                }
                that._handleItemO(v);
            });
        },

        _handleItemO: function(item){
            var n;

            if(item.group){
                this._handleItemA(item.group);
            }

            if(!item.labelCol){
                item.labelCol = 'col-md-4';
                item.valueCol = 'col-md-8';
            }else{
                n = item.labelCol.charAt( item.labelCol.length - 1 );
                item.valueCol = 'col-md-' + (12 - parseInt(n));
            }

            if(!item.col){
                item.col = 'col-md-12';
            }

            if ($.isPlainObject(item.options)) {
                item._options = item.options;
                item._options.init = item._options.init || [];

                if (item._options.relate) {
                    this._handleRelate(item);
                } else {
                    this.optDefs.push(this._getOptions(item));
                }
            } else if (item.type && item.type === 'date') {
                item._type = item.type;
                item.type = 'text';
                if(/^\d+$/.test(item.value)){
                    item.value = this._setDate(item.value);
                }
            }
        },

        _handleRelate: function (item) {
            item.options = item._options.init;
            item._options._url = item._options.url;
            $.each(this.options.items, function () {
                if(typeof item._options.relate === 'string'){
                    if(this.name === item._options.relate) {
                        this.subItem = item;
                        this._type = 'relate';
                        return false;
                    }
                }else{
                    if($.inArray(this.name, item._options.relate) > -1){
                        this.subItem = item;
                        this._type = 'relate';
                    }
                }

            });
        },

        _getOptions: function (item, value){
            var that = this;
            if(!item._options.url){
                return $.Deferred(function(dfd){
                    if ($.isFunction(item._options.render)) {
                        item.options = item._options.init.concat(item._options.render.call(that.element[0], value, item));
                    } else {
                        item.options = item._options.init;
                    }
                    dfd.resolve();
                });
            }
            return $.ajax({
                url: item._options.url,
                type: item.type || 'GET',
                data: item.data || {},
                success: function (res) {
                    res = res[item.source] || res.data || res.value || [];
                    if ($.isFunction(item._options.render)) {
                        item.options = item._options.init.concat(item._options.render.call(that.element[0], res, item));
                    } else {
                        item.options = item._options.init.concat(res);
                    }
                }
            });
        },

        //改变选择
        _changeSelectRelate: function (event) {
            var that = this;
            var target = $(event.target);
            var value = target.val();
            var item = this._tmplItem(target).data.subItem;
            var select = this.element.find('select[name="' + item.name + '"]');
            that[item.name + 'Dfd'] = $.Deferred();
            if (!value) {
                item._options.replace ?
                    this._handleSelectReplace(value, item) :
                    select.html(this._tmpl('option', item._options.init));

                select = that.element.find('select[name="' + item.name + '"]');
                if(select && select.hasClass('select2')){
                    that._setSelect2(select);
                }
                that[item.name + 'Dfd'].resolve();
            } else {
                this._handleItemUrl(item, value);
                this._getOptions(item, value).done(function () {
                    item._options.replace ?
                        that._handleSelectReplace(value, item) :
                        select.html(this._tmpl('option', item.options));

                    select = that.element.find('select[name="' + item.name + '"]');
                    if(select && select.hasClass('select2')){
                        that._setSelect2(select);
                    }
                    that[item.name + 'Dfd'].resolve();
                });
            }
        },

        //处理选择项地址
        _handleItemUrl: function (item, relateValue) {
            var relate, search = '', that = this;
            var _relateValue = item._options.relateValue;
            if(!item._options.url){
                return;
            }
            if (_relateValue) {
                if (_relateValue.indexOf('/') > -1) {
                    _relateValue = _relateValue.split('/');
                    for (var i = 0; i < _relateValue.length; i++) {
                        _relateValue[i] = _relateValue[i] ? this.element.find('[name=' + _relateValue[i] + ']').val() : _relateValue[i];
                    }
                    item._options.url = item._options._url + _relateValue.join('/');
                }
            } else {
                relate =  item._options.relate;
                if(typeof relate === 'string'){
                    item._options.url = item._options._url + relateValue;
                }else{
                    $.each(relate, function(i, value){
                        search += i == 0 ? '?' : '&';
                        search += value + '=' + that.element.find('[name=' + value + ']').val();
                    });
                    item._options.url = item._options._url + search;
                }
            }
        },

        //处理select替换
        _handleSelectReplace: function (supValue, item, setValue) {
            var select = this.element.find('[name="' + item.name + '"]');
            var replace;

            if (!supValue || item.options.length < 2) {
                replace = $(this._tmpl('item', item._options.replace)).replaceAll(select.closest('.item'));
                if (setValue) {
                    replace.find('[name="' + item.name + '"]').val(item.value);
                }
            } else {
                select.closest('.item').replaceWith(this._tmpl('item', item));
            }

            if (item.subItem) {
                this._handleSelectReplace('', item.subItem, setValue);
            }
        },

        //点击操作
        _clickInputAction: function (event, tmpl) {
            event.preventDefault();
            var that = this;
            var d = tmpl.data;

            if (d.type === 'submit') {
                this.validate(function (validate, data) {
                    if (validate && $.isFunction(d.click)) {
                        d.click.call(that.element[0], event, data);
                    }
                });
            } else {
                this.getData(function (data) {
                    if (d.type === 'reset') {
                        that.reset();
                    }
                    if ($.isFunction(d.click)) {
                        d.click.call(that.element[0], event, data);
                    }
                });
            }
        },

        _clickButtonAction: function(event, tmpl){
            var that = this;
            var d = tmpl.data;

            if ($.isFunction(d.click)) {
                d.click.call(this.element[0], event, tmpl.parent.parent.parent.data);
            }
        },

        _setValidate: function () {
            this.validator = this.form.validate($.extend(this.options.validate, {
                /*
                 errorPlacement: function(error, element){
                 var select = element.next('span.select2');
                 select.length ? select.after(error) : element.after(error);
                 }
                 */
            }));
        },

        //重置验证规则
        resetValidate: function(options){
            this.validator && this.validator.destroy();
            this.options.validate = options;
            this._setValidate();
        },

        //处理有初始值的select
        _setSelectsValue: function () {
            var that = this;
            this.element.find('select.value').each(function () {
                var data = this._tmplItem(this).data;
                if (data.options.length > 1) {
                    that._setSelectValue(this, data);
                }
            });
        },

        //处理多功能的select
        _setChosen: function(select){
            var that = this;
            if(!select){
                that.form.find('select.chosen').each(function () {
                    that._setChosen($(this));
                });
            }else{
                var data = this._tmplItem(select).data;
                select.chosen(data.chosen);
            }
        },

        //获取上传请求路径
        _getUploadOpts: function(callback){
            var that = this;
            if(this.uploadOpts){
                callback.call(this);
            }else{
                $.ajax({
                    url: '/pickUpDetailConfig/findUploadFileResource',
                    type: 'GET',
                    success: function(res){
                        if(res.code == '0'){
                            that.uploadOpts = {
                                url: res.data.url,
                                bucketName: res.data.bucketName,
                                projectName: res.data.projectName
                            };
                            callback.call(that);
                        }
                    }
                });
            }
        },

        //设置富文本编辑器
        _setTinymce: function(textarea){
            var that = this;
            if(!textarea){
                this.element.find('textarea.tinymce').each(function(){
                    that._setTinymce($(this));
                });
            }else{
                var data = this._tmplItem(textarea).data;
                textarea.tinymce($.extend({
                    language: 'zh_CN',
                    plugins: [
                        'advlist autolink link image lists charmap print preview hr anchor pagebreak spellchecker',
                        'searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking',
                        'save table contextmenu directionality emoticons template paste textcolor'
                    ],
                    menubar: false,
                    toolbar: 'undo redo | styleselect | forecolor backcolor | cut copy paste | bullist numlist outdent indent | link image media table template',
                    images_upload_handler: function (blobInfo, success, failure){

                        that._getUploadOpts(function(){

                            var xhr, formData;
                            xhr = new XMLHttpRequest();
                            xhr.withCredentials = false;
                            xhr.open('POST', that.uploadOpts.url);
                            xhr.onload = function() {
                                var json;
                                if (xhr.status != 200) {
                                    failure('HTTP Error: ' + xhr.status);
                                    return;
                                }
                                json = JSON.parse(xhr.responseText);
                                if(json && json.errCode === '0'){
                                    success(json.url);
                                }else{
                                    failure('Invalid JSON: ' + xhr.responseText);
                                }
                            };
                            formData = new FormData();
                            formData.append('file', blobInfo.blob());
                            formData.append('bucketName', that.uploadOpts.bucketName);
                            formData.append('projectName', that.uploadOpts.projectName);
                            xhr.send(formData);
                        });
                    }
                }, data.tinymce));
            }
        },

        //给单个select赋值
        _setSelectValue: function (select, data) {
            $(select).val(data.value);
            if (data.subItem) {
                this._setRelateSelectValue(data);
            }
        },

        //处理有初始值且有关联的select
        _setRelateSelectValue: function (data) {
            var that = this;
            var value = data.value;
            var item = data.subItem;
            var select = this.form.find('select[name=' + item.name + ']');
            if (value) {
                this._handleItemUrl(item, value);
                this._getOptions(item).done(function () {
                    if (item.options.length < 2 && item._options.replace) {
                        replaceItem();
                    } else {
                        select.html(this._tmpl('option', item.options));
                        that._setSelectValue(select, item);
                    }
                });
            } else {
                replaceItem();
            }

            function replaceItem() {
                $(this._tmpl('item', item._options.replace))
                    .replaceAll(select.closest('.item'))
                    .find('[name=' + item.name + ']').val(item.value);
                item.subItem && that._handleSelectReplace('', item.subItem, true);
            }
        },

        //验证
        validate: function (callback) {
            var that = this;
            this.completeDfd.done(function () {
                var validate = true;
                that.options.formData = that._serializeJson(that.form);
                if (that.validator) {
                    validate = that.validator.form();
                }
                callback.call(that.element[0], validate, that.options.formData);
            });
        },

        //创建搜索数据
        getData: function (callback) {
            var that = this;
            this.completeDfd.done(function () {
                that.options.formData = that._serializeJson(that.form);
                callback.call(that.element[0], that.options.formData);
            });
        },

        //重置
        reset: function () {
            this.form[0].reset();
            this.form.find('select.chosen').val('').trigger('change');
            this.validator && this.validator.resetForm();
        },

        //销毁
        _destroy: function () {
            this.form.find('.daterangepicker').remove();
        }

    });

});