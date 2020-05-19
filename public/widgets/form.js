define(['jquery', 'base', 'validate', 'chosen', 'daterangepicker', 'jquerytinymce','jeDate'], function ($) {

	//定义部件
	$.widget('ui.form', $.ui.base, {

		templates: {

			main: '\
				<div class="container-fluid">\
					<form class="form-horizontal">\
						{{if title}}{{tmpl "title"}}{{/if}}\
						{{tmpl(items) "item"}}\
					</form>\
				</div>',

			title: '\
				<div class="row">\
					<div class="col-md-12">\
						<h5>${title}</h5>\
					</div>\
				</div>',

			item: '\
				{{if $data.length}}\
					<div class="row">\
						{{tmpl "aItem"}}\
					</div>\
				{{else}}\
					{{tmpl "oItem"}}\
				{{/if}}',

			appendItems: '\
				{{tmpl(items) "aItem"}}',

			aItem: '\
				<div class="${col}">\
					{{if label}}\
						<div class="form-group">\
							<label class="${labelcol} control-label">${label}</label>\
							<div class="${valuecol}">\
								{{if items}}\
									<div class="row">\
										{{tmpl(items) "aItem"}}\
									</div>\
								{{else}}\
									{{tmpl "typeAssign"}}\
								{{/if}}\
							</div>\
						</div>\
					{{else}}\
						{{tmpl "typeAssign"}}\
					{{/if}}\
				</div>',

			oItem: '\
				{{if items}}\
					<div class="form-group">\
						<label class="${labelcol} control-label">${label}</label>\
						<div class="${valuecol}">\
							<div class="row">\
								{{tmpl(items) "aItem"}}\
							</div>\
						</div>\
					</div>\
				{{else label}}\
					<div class="form-group">\
						<label class="${labelcol} control-label">${label}</label>\
						<div class="${valuecol}">\
							{{tmpl "typeAssign"}}\
						</div>\
					</div>\
				{{else}}\
					<div class="row">\
						<div class="${col}">\
							{{tmpl "typeAssign"}}\
						</div>\
					</div>\
				{{/if}}',

			typeAssign: '\
				{{if widget}}\
					{{tmpl "widget"}}\
				{{else tag==="span"}}\
					{{tmpl "span"}}\
				{{else tag==="select"}}\
					{{tmpl "select"}}\
				{{else tag==="textarea"}}\
					{{tmpl "textarea"}}\
				{{else tag==="button"}}\
					{{tmpl "button"}}\
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
					{{tmpl "file"}}\
				{{else type==="submit"}}\
					{{tmpl "button"}}\
				{{else type==="reset"}}\
					{{tmpl "button"}}\
				{{else type==="button"}}\
					{{tmpl "button"}}\
				{{/if}}',

			widget: '\
				<div class="widget"></div>',

			span: '\
				<span class="control-span {{if _type}}${_type}{{/if}}">{{html text}}</span>',

			select: '\
				<select name="${name}" class="form-control {{if _type}}${_type}{{/if}} {{if value}}value{{/if}} {{if chosen}}chosen{{/if}}" {{if disabled}}disabled{{/if}} {{if multiple}}multiple{{/if}}>\
					{{tmpl(options) "option"}}\
				</select>',

			option: '\
				<option value="${value}" {{if items}}class="items"{{/if}}>${label}</option>',

			textarea: '\
				<textarea name="${name}" class="form-control {{if tinymce}}tinymce{{/if}}" {{if disabled}}disabled{{/if}} rows="3" placeholder="${placeholder}">${value}</textarea>',

			text: '\
				<input type="${type}" name="${name}" class="form-control {{if _type}}${_type}{{/if}}" value="${value}" {{if disabled}}disabled{{/if}} {{if readonly}}readonly{{/if}} placeholder="${placeholder}">',

			hidden: '\
				<input type="${type}" name="${name}" value="${value}">',

			radio: '\
				<div class="radio-control ">{{tmpl(options) "radioItem"}}</div>',

			radioItem: '\
				<label class="radio-inline"><input type="radio" name="${$parent.data.name}" {{if items}}class="items {{if _type}}${_type}{{/if}}"{{/if}} value="${value}" {{if disabled}}disabled{{/if}}> ${label}</label>',

			checkbox: '\
				<div class="checkbox-control">{{tmpl(options) "checkboxItem"}}</div>',

			checkboxItem: '\
				<label class="checkbox-inline"><input type="checkbox" name="${$parent.data.name}" value="${value}" {{if disabled}}disabled{{/if}}> ${label}</label>',

			file: '\
				<input type="${type}" name="${name}" class="form-control" {{if accept}}accept="${accept}"{{/if}}>',

			button: '\
				<button type="${type}" class="${clas} action">{{if icon}}<i class="${icon}"></i> {{/if}}${text}</button>'

		},

		//配置选项
		options: {

			//数据源
			source: {},

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

			if(this.options.events){
				this._on(this.options.events);
			}

			this._on({
				'change select': '_changeSelect',
				'click button.action': '_clickButton',
				'click button.appenditems': '_clickAppendItems',
				'click button.removeitems': '_clickRemoveItems',
				'click input.items': '_clickInputItems',
				'click input[type="checkbox"]': '_clickCheckbox'
			});
		},

		_init: function (){

			this._handleItems(function () {

				window.tinymce = null;

				this.element.html(this._tmpl('main', this.options));
				this.form = this.element.find('form');

				this._delay(function(){

					//表单验证
					if (this.options.validate) {
						this._setValidate();
					}

					//设置input type=date
					this._setDatepicker(this.element.find('input.date'));

					//设置有初始值的select
					this._setSelectsValue();

					//处理有多功能select
					this._setChosen();

					//处理tinymce
					this._setTinymce();

					this._setWidgets();

					//处理radios
					this._setRadios();

					//处理checkboxs
					this._setCheckboxs();

					//处理appendGroup
					this._setAppendItems();

					//延时对象完成
					this.completeDfd.resolve();

					this._trigger('complete');
				});
			});
		},

		_handleItems: function (callback) {
			var that = this;
			this.optDefs = [];
			$.each(this.options.items, function (i, item) {
				if($.isArray(item)){
					that._handleItemA(item);
				}else{
					that._handleItemO(item, i, that.options.items);
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
				that._handleItemO(v, i, item);
			});
		},

		_handleItemO: function(item, i, parent){
			var that = this;
			var n;

			if(item.items){
				this._handleItemA(item.items);
			}

			if($.isArray(item.options)){
				$.each(item.options, function(i, option){
					if(option.hide){
						delete item.options[i];
						return;
					}

					if(option.items){
						that._handleItemA(option.items);
					}
				});
			}

			if(item.label){
				if(!item.labelcol){
					item.labelcol = 'col-md-4';
					item.valuecol = 'col-md-8';
				}else if(!item.valuecol){
					n = item.labelcol.charAt( item.labelcol.length - 1 );
					item.valuecol = 'col-md-' + (12 - parseInt(n));
				}
			}

			if(!item.col){
				item.col = 'col-md-12';
			}

			if(item.widget){
				return;
			}

			if(item.hide){
				delete parent[i];
				return;
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
			var that = this;
			var result;
			item.options = item._options.init;
			$.each(this.options.items, function (i, value) {
				if($.isArray(value)){
					$.each(value, function(i, v){
						return result = that._handleItemRelate(item, v);
					});
					return result;
				}else if($.isPlainObject(value)){
					return that._handleItemRelate(item, value);
				}
			});
		},

		_handleItemRelate: function(item, relate){
			var that = this;
			var result;
			if(relate.items){
				$.each(relate.items, function(i, v){
					return result = that._handleItemRelate(item, v);
				});
				return result;
			}
			if(relate.options){
				for(var i = 0; i < relate.options.length; i++){
					if(relate.options[i].items){
						$.each(relate.options[i].items, function(i, v){
							return result = that._handleItemRelate(item, v);
						});
						return result;
					}
				}
			}
			if(typeof item._options.relate === 'string'){
				if(relate.name === item._options.relate) {
					relate.subItem = item;
					relate._type = 'relate';
					return false;
				}
			}else{
				if($.inArray(relate.name, item._options.relate) > -1){
					relate.subItem = item;
					relate._type = 'relate';
				}
			}
		},

		_getOptions: function (item){
			var that = this;
			var opts = item._options;
			var ajaxData = this._handleAjaxData(opts);
			if(!opts.url){
				return $.Deferred(function(dfd){
					if ($.isFunction(opts.render)) {
						item.options = opts.init.concat(opts.render.call(that.element[0], ajaxData, item));
					} else {
						item.options = opts.init;
					}
					dfd.resolve();
				});
			}
			return $.ajax({
				url: opts.url,
				type: opts.type || 'GET',
				data: ajaxData,
				contentType: opts.contentType || 'application/x-www-form-urlencoded; charset=utf-8',
				success: function (res) {
					res = res[item.source] || res.data || res.value || [];
					if ($.isFunction(opts.render)) {
						item.options = opts.init.concat(opts.render.call(that.element[0], res, item));
					} else {
						item.options = opts.init.concat(res);
					}
				}
			});
		},

		_handleAjaxData: function(opts){
			var that = this;
			var result = {}, vals = {};
			if(opts.data){
				$.each(opts.data, function(k, v){
					if($.isFunction(v)){
						if(typeof opts.relate === 'string'){
							result[k] = v.call(that.element[0], that.element.find('[name=' + opts.relate + ']').val() || '');
						}else{
							$.each(opts.relate, function(i, n){
								vals[n] = that.element.find('[name=' + n + ']').val();
							});
							result[k] = v.call(that.element[0], vals);
						}
					}else{
						v = v.split('.');
						if(v[0] === 'relate'){
							result[k] = that.element.find('[name=' + v[1] + ']').val();
						}else {
							result[k] = v[0];
						}
					}
				});
			}
			if(opts.contentType && opts.contentType.indexOf('application/json') > -1){
				result = JSON.stringify(result);
			}
			return result;
		},

		_setValidate: function (elem) {
			this.validator = this.form.validate($.extend(this.options.validate, {
				errorPlacement: function(error, element){
					var parent = element.closest('.input-group');
					if(!parent.length){
						parent = element.closest('.radio-control');
					}
					if(!parent.length){
						parent = element.closest('.checkbox-control');
					}

					parent.length ? parent.after(error) : element.after(error);
				}
			}));
		},

		_setRadios: function(elem){
			var that = this;
			elem = elem || this.element;
			elem.find('.radio-control').not('.seted').each(function(){
				var self = $(this);
				var data = that._tmplItem(this).data;

				self.addClass('seted');
				if(data.value){
					self.find('[value="' + data.value + '"]').click();
				}else{
					self.find('input[type=radio]').eq(0).click();
				}
			});
		},

		_setCheckboxs: function(elem){
			var that = this;
			elem = elem || this.element;
			elem.find('.checkbox-control').not('.seted').each(function(){
				var self = $(this);
				var data = that._tmplItem(this).data;
				if(data.value){
					self.addClass('seted');
					$.each(data.value, function(i, v){
						self.find('[value="' + v + '"]').click();
					});
				}
			});

		},

		_setAppendItems: function(elem){
			var that = this;
			var source = this.options.source;
			var data = {};

			$.each(source, function(k, v){
				if(/_\d+$/.test(k)){
					k = k.split('_');
					data[k[1]] = data[k[1]] || {};
					data[k[1]][k[0]] = v;
				}
			});

			if(!$.isEmptyObject(data)){
				elem = elem || this.element;
				elem.find('.appenditems').not('.seted').each(function(){
					var self = this;
					var tmpl = that._tmplItem(this);
					var d = tmpl.data;
					var p = tmpl.parent;

					$(this).addClass('seted');

					while (!p.data.items){
						p = p.parent;
					}
					p = p.data.items;
					var name = p[0].name || p[1].name;
					$.each(data, function(k, v){
						if(v[name]){
							d.gid = k;
							that._appendItems(self, p, k, v);
						}
					});
				});
			}
		},

		_setSelectsValue: function (elem) {
			var that = this;
			elem = elem || this.element;
			elem.find('select.value').not('.seted').each(function () {
				var data = that._tmplItem(this).data;
				$(this).addClass('seted');
				if (data.options.length > 1) {
					that._setSelectValue(this, data);
				}
			});
		},

		_setSelectValue: function (select, data) {
			if($.isArray(data.value)){
				$.each(data.value, function(i, v){
					$(select).find('option[value="' + v + '"]').attr('selected', 'selected');
				});
			}else{
				$(select).val(data.value);
			}

			/*
			$(select).change();

			if (data.subItem) {
				this._setRelateSelectValue(data);
			}
			*/

            if (data.subItem) {
                this._setRelateSelectValue(data);
            }else{
                $(select).change();
			}
		},

		_setRelateSelectValue: function (data) {
			var that = this;
			var item = data.subItem;
			var select = this.element.find('select[name=' + item.name + ']');
			if(data.value){
				this._getOptions(item).done(function(){
					select.html(that._tmpl('option', item.options));
                    that._setSelectValue(select, item);
				});
			}
		},

		_setChosen: function(select){
			var that = this;
			if(!select){
				that.element.find('select.chosen').each(function () {
					that._setChosen($(this));
				});
			}else{
				var data = this._tmplItem(select).data;
				select.chosen(data.chosen);
			}
		},

		_setWidgets: function(){
			var that = this;
			this.element.find('.widget').each(function(){
				var $this = $(this);
				var data = that._tmplItem(this).data;
				$this[data.widget](data.options).data('opts', data);
			});
		},

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

		_changeSelect: function(event, tmpl){
			var target = $(event.currentTarget);
			var data = tmpl.data;
			var option;

			if(target.hasClass('relate')){
				this._changeSelectRelate(event, tmpl);
			}
			else{
				option = target.find('option:selected');
				if(option.hasClass('items')){
					tmpl = this._tmplItem(option);
					this.toggleItems({
						appendTo: $(target).closest('select').parent(),
						items: tmpl.data.items
					});
				}
			}
			if($.isFunction(data.change)){
				data.change.call(this.element[0], event, data);
			}
		},

		_changeSelectRelate: function (event, tmpl) {
			var that = this;
			var item = tmpl.data.subItem;

			this._getOptions(item).done(function(){
				that.form
					.find('[name=' + item.name + ']')
					.html(that._tmpl('option', item.options));
			});
		},

		_clickButton: function (event, tmpl) {
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
			return false;
		},

		_clickAppendItems: function(event, tmpl){
			var d = tmpl.data;
			var p = tmpl.parent;
			while (!p.data.items){
				p = p.parent;
			}
			d.gid = d.gid || 0;
			this._appendItems(event.target, p.data.items, ++d.gid);
		},

		_appendItems: function(target, oriItems, gid, value){
			var items = $.map(oriItems, function(item){
				if(item.tag === 'button'){
					return {
						tag: item.tag,
						type: item.type,
						col: item.col,
						clas: 'btn btn-link btn-block removeitems',
						text: '删除'
					}
				}else{
					item = $.extend(true, {}, item);
					item.value = value ? value[item.name] : '';
					item.name += '_' + gid;
					if(item._options && item._options.relate){
						item._options.relate += '_' + gid;
						item.options = item._options.init;
					}
					if(item.subItem){
						item.subItem.value = value ? value[item.subItem.name] : '';
						item.subItem.name += '_' + gid;
						item.subItem._options.relate += '_' + gid;
					}
					return item;
				}
			});
			this.appendItems({
				appendTo: $(target).closest('.row').parent(),
				items: items
			});
		},

		appendItems: function(opts){
			var row;
			if(opts.appendTo.find('.row.toggle').length){
				row = $('<div class="row toggle">');
			}else{
				row = $('<div class="row">');
			}
			row.html(this._tmpl('appendItems', {items: opts.items}))
				.appendTo(opts.appendTo);

			if(this.options.validate) {
				this._appendItemsValidate(row, opts.items, this.options.validate);
			}

			this._setSelectsValue(row);
			this._setDatepicker(row.find('input.date'));
		},

		_appendItemsValidate: function(elem, items, v){
			$.each(items, function(i, item){
				var key;
				if(item.name){
					key = item.name.replace(/_\d+$/, '');
					if(v.rules[key]){
						elem.find('[name=' + item.name + ']')
							.rules('add', $.extend({}, v.rules[key], {messages: v.messages[key]}));
					}
				}
			});
		},

		_clickRemoveItems: function(event, tmpl){
			$(event.currentTarget).closest('.row').remove();
		},

		_clickInputItems: function(event, tmpl){
			this.toggleItems({
				appendTo: $(event.target).closest('div.radio-control').parent(),
				items: tmpl.data.items
			});
		},

		toggleItems: function(opts){
			var row = $('<div class="row toggle">');
			var widget = opts.items[0]['widget'];
			opts.appendTo.find('.row.toggle').remove();

			if(widget){
				row[widget](opts.items[0]['options'])
					.appendTo(opts.appendTo)
					.addClass('widget')
					.data('opts', opts.items[0]);

			}else{
				row
					.html(this._tmpl('appendItems', {items: opts.items}))
					.appendTo(opts.appendTo);

				this._setDatepicker(row.find('input.date'));
				this._setSelectsValue(row);
				this._setRadios(row);
				this._setCheckboxs(row);
				this._setAppendItems(row);
			}
		},

		itemsToArray: function(sItems, source, tItems){
			var arr = [];
			var data = {};
			var leng = arguments.length;
			if(leng < 2){
				source = this.options.source;
				tItems = sItems;
			}else if($.isArray(source)){
				tItems = source;
				source = this.options.source;
			}
			$.each(source, function(k, v){
				if(/_\d+$/.test(k)){
					k = k.split('_');
					data[k[1]] = data[k[1]] || {};
					data[k[1]][k[0]] = v;
				}
			});

			var d = {};
			$.each(sItems, function(i, v){
				d[tItems[i]] = source[v];
			});
			arr.push(d);

			$.each(data, function(k, v){
				var d, _v;
				if(v[sItems[0]]){
					d = {};
					$.each(sItems, function(i, v){
						_v = v + '_' + k;
						d[tItems[i]] = source[_v];
					});
					arr.push(d);
				}
			});

			return arr;
		},

        _clickCheckbox: function(event, tmpl){
			var data = tmpl.parent && tmpl.parent.data;
			if(data && data.click && $.isFunction(data.click)){
                data.click.call(this.element[0], {
                	target: event.currentTarget,
					options: data
				});
			}
		},

		resetValidate: function(options){
			this.validator && this.validator.destroy();
			this.options.validate = options;					
			this._setValidate();			
		},

		validate: function (cb) {
			var that = this;
			this.completeDfd.done(function () {
				var validate = true;
				var dfds = [];
				that.options.formData = that._serializeJson(that.form);
				if (that.validator) {
					validate = that.validator.form();
				}
				that.element.find('.widget').each(function(){
					var $this = $(this);
					dfds.push($.Deferred(function(dfd){
						var data = $this.data('opts');
						$this[data.widget]('validate', function(v, d, e){
							if(!v){
								validate = v;
							}
							that.options.formData[data.widget] = d;
							if(e && e.name){
                                that.options.formData[e.name] = e.value;
							}
							dfd.resolve();
						});
					}));
				});
				$.when.apply($, dfds).done(function(){
					cb.call(that.element[0], validate, that.options.formData);
				});
			});
		},

		getData: function(callback){
			var that = this;
			this.completeDfd.done(function () {
				that.options.formData = that._serializeJson(that.form);
				callback.call(that.element[0], that.options.formData);
			});
		},

		reset: function () {
			this.form[0].reset();
            this.element.find("input[type='hidden']").val('');
			this.element.find('select.chosen').val('').trigger('change');
			this.validator && this.validator.resetForm();
		},

		_destroy: function () {
			this.element.find('.daterangepicker').remove();
		}

	});

});