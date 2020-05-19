define(['jquery', 'base'], function($){

    $.widget('ui.paging', $.ui.base, {
    	
    	templates: {
    		
            main: [
                '<ul>',
                	'<li>总计 ${total} 条，每页  ${pageSize} 条</li>',
                	'{{if pages.length}}',
		                '<li class="input-group input-group-sm">',
		                	'<input type="text" class="form-control" placeholder="转到...">',
			                '<span class="input-group-btn">',
			                	'<button class="btn btn-default go">GO</button>',
			              	'</span>',
		                '</li>',
	            	'{{/if}}',
                	'<li class="btn-group btn-group-sm">',
                		'{{tmpl(pages) "page"}}',
                	'</li>',                	
                '</ul>'
            ].join(''),
            
            page: [
                '<span class="btn btn-default page {{if $data.active}}${active}{{/if}}">${page}</span>'
            ].join('')
    	},
       
        options: {
            
        	//当前页码
            page: 1,
            
            //每页记录数
            pageSize: 10,
            
            //总记录数
            total: 0,
            
            //需显示的页码数
            showPages: 6,            
            
            //选择页码
            selectPage: null
        },
       
        _create: function() {
        	
        	this._addClass(this.widgetFullName);

            this._on({
                'click .page': '_clickPage', //点击页码
                'click .go': '_clickGo', //点击跳转
                'keydown input[type=text]': '_keydownInput' //输入框回车
            });
        },
      
        _init: function(){
        	
        	//总页数
        	this.options.totalPages = Math.ceil(this.options.total / this.options.pageSize);
        	
        	if(this.options.totalPages > 1){
        		
	        	//构造页分页数据
	            this._createPages();
	            
	            //渲染模板	            
	            this.element.html(this._tmpl('main', this.options));	            
	            this.input = this.element.find('input');            
        	}
        },

        //构造页分页数据
        _createPages: function(){
            var o = this.options;
            var min, max, pages;

            min = o.page - Math.floor(o.showPages / 2);
            min = Math.max(min, 1);

            max = o.page + (o.showPages - (o.page - min + 1));
            max = Math.min(max, o.totalPages);

            pages = max - min;
            if(pages !== o.showPages - 1){
                min = min - (o.showPages - pages) + 1;
                min = Math.max(min, 1);
            }

            o.pages = [];
            for( ; min <= max; min++){
                min === o.page ?
                    o.pages.push({page: min, active: 'active'}) :
                    o.pages.push({page: min});
            }
        },

        //点击页码
        _clickPage: function(event){
            var target = $(event.currentTarget);
            if(target.hasClass('active')){
                return;
            }
            var data = this._tmplItem(target).data;
            //选择页码
            this._selectPage(event, data.page);

        },

        //点击跳转
        _clickGo: function(event){
            var val = parseInt(this.input.val());
            this.input.val('');
            if(!$.isNumeric(val)){
                return;
            }
            if(val < 1){
                val = 1;
            }else if(val > this.options.totalPages){
                val = this.options.totalPages;
            }
            //选择页码
            this._selectPage(event, val);
        },

        //输入框回车
        _keydownInput: function(event){
            if(event.keyCode === 13){
                this._clickGo(event);
            }
        },

        //选择页码
        _selectPage: function(event, page){            
            if ($.isFunction(this.options.selectPage)) {
                this.options.selectPage.call(this, event, page);
            }else{
            	this.options.page = page;
                this._init();
            }
        }

    });

});