define(["jquery", "extend"], function () {

    $.widget("mb.app", {

        options: {

        },

        renders: {
            main: function (o, w) {
                return [
                    ["div@header.header"],
                    ["div.body[ref=body]"],
                    ["div.footer[ref=footer]"]
                ];
            }
        },

        _create: function(){
            this._render(this.element, "main");
            this.header.navbar();
        }

    });

});
