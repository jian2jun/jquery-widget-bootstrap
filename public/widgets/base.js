define(['jquery', 'bootstrap', 'widget', 'validate'], function($){

	//validate---------------------------------------

	//价格
	$.validator.addMethod('price', function (value, element) {
		return this.optional(element) || /^((([1-9][0-9]{0,9})(\.[0-9]{1,2})?)|0|(0\.[1-9]([0-9])?)|(0\.0[1-9]))$/.test( value );
	}, '请输入有效的价格');

    $.validator.addMethod('decimal3', function (value, element) {
        return this.optional(element) || /(\.[0-9]{0,3})$/.test( value );
    }, '最多只能输入三位小数');
	//价格
	$.validator.addMethod('prevent', function (value, element) {
		return this.optional(element) || new RegExp('prevent' + new Date().getTime()).test( value );
	}, '验证未通过');



	//bootstrap modal原型重写---------------------------------------

	$.fn.modal.Constructor.prototype.hideModal = function () {
		var that = this;
		this.$element.hide();
		this.backdrop(function () {
			if(!$('.modal-backdrop').length) {
				that.$body.removeClass('modal-open');
				that.resetAdjustments();
				that.resetScrollbar();
			}
			that.$element.trigger('hidden.bs.modal');
		})
	};

	$.fn.serializeJson = function() {
		var rCRLF = /\r?\n/g,
			rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
			rcheckableType = /^(?:checkbox|radio)$/i,
			rsubmittable = /^(?:input|select|textarea|keygen)/i;
		var data = {};

		this.map( function() {
				var elements = jQuery.prop( this, "elements" );
				return elements ? jQuery.makeArray( elements ) : this;
			} )
			.filter( function() {
				var type = this.type;
				return this.name && /*!jQuery( this ).is( ":disabled" ) &&*/
					rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
					( this.checked || !rcheckableType.test( type ) );
			} )
			.map( function( i, elem ) {
				var val = jQuery( this ).val();

				if(val != null){

					if(jQuery.isArray( val )){
						data[elem.name] = jQuery.map( val, function( val ) {
							return val.replace( rCRLF, "\r\n" );
						} );
					}else{
						val = val.replace( rCRLF, "\r\n" );
					}

					if(/^(?:checkbox)$/i.test(elem.type)){
						if(!data[elem.name]){
							data[elem.name] = [val];
						}else{
							data[elem.name].push(val);
						}
					}else{
						data[elem.name] = val;
					}
				}
			} );

		return data;
	};

	//全局字典数据---------------------------------------

	window.getGlobal = function(key){
		return $(document).data(key) || JSON.parse(localStorage.getItem(key));
	};

	window.setGlobal = function(key, value){
		$(document).data(key, value);
		localStorage.setItem(key, JSON.stringify(value));
	};

	//基础数据字典
	var transCode = JSON.parse(localStorage.getItem('transCode'));
	var expire = 1000; //1000 * 60 * 60
	if(transCode && (new Date().getTime() - transCode.time) <= expire){
		window.transCode = transCode.data;
	}else{
		if(transCode && (new Date().getTime() - transCode.time) > expire){
			localStorage.removeItem('transCode');
		}
		$.ajax({
			url: '/dataDictionary/getTypesJsonData',
			type: 'GET',
			async: false,
			success: function(res){
				window.transCode = res.data.zh_cn;
				localStorage.setItem('transCode', JSON.stringify({
					data: res.data.zh_cn,
					time: new Date().getTime()
				}));
			}

		});
	}

	//获取全局数据
	window.dictionary = function(keys, callback){
		var dic = $(document).data('dictionary') || {};
		var dfdA, dfdS;
		$.each(keys, function(i, key){
			if(!dic[key]){
				switch (key){
					case 'active':
						dfdA = $.ajax({
							url: '/dataDictionary/getList',
							type: 'GET',
							success: function (res) {
								var data = {};
								$.each(res.data, function (i, v) {
									data[v.dictionaryCode] = data[v.dictionaryCode] || [];
									data[v.dictionaryCode].push({
										label: v.dictionaryValue,
										value: v.dictionaryKey
									});
								});
								dic.active = data;
							}
						});
						break;
					case 'site':
						dfdS = $.ajax({
							url: '/siteConfig/getList',
							type: 'GET',
							success: function (res) {
								dic.site = $.map(res.data, function (v, i) {
									return {
										label: v.siteName,
										value: v.siteCode
									};
								});
							}
						});
						break;
				}
			}
		});
		$.when(dfdA, dfdS).done(function(){
			$(document).data('dictionary', dic);
			callback(dic);
		});
	};

	//ajax全局设置
	$(document)
		.ajaxError(function(){
			require(['notice'], function(){
				$('<div>').notice({
					type: 'danger',
					message: '服务器返回异常！',
					time: 2000
				});
			});
		})
		.ajaxComplete(function(){

		});


	//base
	$.widget('ui.base', {


		//常用方法部分---------------------------------------

		//outerHtml
		_outerHtml: function($elem){
			var html = '';
			$elem.each(function(){
				html += this.outerHTML || '';
			});
			return html;
		},

		//获取地址参数
		_getUrlParams: function(){
			var search = window.location.search,
				result = {}, i = 0, unit;
			if (search) {
				search = search.substring(1).split('&');
				for (; i < search.length; i++) {
					unit = search[i].split('=');
					result[unit[0]] = unit[1];
				}
			}
			return result;
		},

		//表单部分--------------------------------------------------

		//表单转json
		_serializeJson: function($form){
			return $form.serializeJson();
		},

		_setDatepicker: function(inputs){

			inputs.each(function(i, input){
                var inputNames = input.name.split("_");
                var inputName = inputNames[0];
                $(input).jeDate({
                    inputName: [inputName],
					okfun:function(obj) {
						obj.elem.blur();
					}
				});
			/*	$(input)
					.after('<i class="glyphicon glyphicon-calendar"></i>')
					.daterangepicker({
						singleDatePicker: true,
						timePicker: true,
						timePickerIncrement: 1,
						timePicker24Hour: true,
						timePickerSeconds: true,
						autoUpdateInput: false,
						parentEl: $(input).parent(),
						locale: {
							format: 'YYYY-MM-DD HH:mm:ss',
							applyLabel: '确定',
							cancelLabel: '清除',
							daysOfWeek: ['日', '一', '二', '三', '四', '五', '六'],
							monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
							firstDay: 1
						}
					})
					.on('apply.daterangepicker', function (ev, picker) {
						$(this).val(picker.startDate.format('YYYY-MM-DD HH:mm:ss')).blur();
					})
					.on('cancel.daterangepicker', function (ev, picker) {
						$(this).val('');
					});*/
			});
		},
		
		//获取日期
		_getDate: function(date){			
			date = new Date(date);			
        	return {
        		y: date.getFullYear(),
        		m: date.getMonth() + 1,
        		d: date.getDate(),
        		h: date.getHours(),
        		f: date.getMinutes(),
        		s: date.getSeconds()
        	}
		},
		
		//设置日期
		_setDate: function(date){
			date = this._getDate(date);
			return date.y + '-' + f(date.m) + '-' + f(date.d) + ' ' + f(date.h) + ':' + f(date.f) + ':' + f(date.s);

			function f(v){
				return v = v > 9 ? v : '0' + v;
			}
		},

		//ajax部分-----------------------------------------------------
        
        //以application/json方式向后端发送数据
        _ajaxJson: function(options, callback, disable){        	
        	var that = this;
        	var obj = {               
                data: JSON.stringify(options.data),        
                contentType: 'application/json; charset=utf-8',
                success: function(res){
                	that._ajaxSuccess(res, callback);
                }
            };        	
        	if(disable && disable.target){
        		obj = this._disableTarget(obj, disable.target, disable.time);
        		if(!obj){
        			return;
        		}
        	}
			return $.ajax($.extend(options, obj));
        },
        
        //以application/x-www-form-urlencoded方式向后端发送数据        
        _ajaxForm: function(options, callback, disable){
        	var that = this; 
        	var obj = {
                success: function(res){
                	that._ajaxSuccess(res, callback);
                }
            };        	
        	if(disable && disable.target){
        		obj = this._disableTarget(obj, disable.target, disable.time);
        		if(!obj){
        			return;
        		}
        	}
			return $.ajax($.extend(options, obj));
        },
        
        _disableTarget: function(options, target, time){        		
    		if(target.prop('disabled')){
        		return false;            		
        	}    		
    		target.prop('disabled', true);
    		options.complete = function(){
            	var time = time || 60;
            	var text = target.text();
            	var interval = setInterval(function(){                		
            		if(!target.prop('disabled')){
            			clearInterval(interval);
            		}else if(time < 0){
            			target.text(text);
            			target.prop('disabled', false);
            			clearInterval(interval);
            		}else{
            			target.text(time + ' 秒后重试');
            		}
            		time--;
            	}, 1000);
            };            
            return options;
        },
        
        //ajax成功回调
        _ajaxSuccess: function(res, callback, extra){
        	var that = this; 
        	if(res.code == 0){
        		if($.isFunction(callback)){
        			callback.call(that, res, extra);
        		}
        	}else{
                res = JSON.parse(res);
        		if(res.code=="err100003"){
					return;
				}
                require(['notice'], function(){
                    $('<div>').notice({
                        type: 'danger',
                        message: res.message || '登录超时！',
                        time: 2000
                    });

                });
        	}
        },
        //获取cookie
        _getCookies:function(key) {
        var arr = document.cookie.split('; ');
        for (var i = 0; i < arr.length; i++) {
            var arr2 = arr[i].split('=');
            if (arr2[0] == key) {
                return unescape(arr2[1]);
            };
        };
        return false;
    	},
		_setDefaultTimeZone:function (name,value) {
            var Days = 365;
            var exp = new Date();
            exp.setTime(exp.getTime() + Days*24*60*60*1000);
            document.cookie = name + "="+ value + ";expires=" + exp.toGMTString()+";domain=.i4px.com";
        },


		//全局数据部分---------------------------------------
        
        //全局数据
        _getGlobal: getGlobal,
        
        //设置全局数据
        _setGlobal: setGlobal

    });
        
});