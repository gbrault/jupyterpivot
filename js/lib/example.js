var widgets = require('@jupyter-widgets/base');
var _ = require('lodash');
window.$ = window.jQuery = require('jquery');
require('jquery-ui/Lib/jquery-ui.min.js')
require('style-loader!jquery-ui/Lib/jquery-ui.theme.min.css')
require('pivottable/dist/pivot.js')
require('style-loader!pivottable/dist/pivot.css')
require('jquery-ui-touch-punch/jquery.ui.touch-punch.min.js')

// See example.py for the kernel counterpart to this file.


// Custom Model. Custom widgets models must at least provide default values
// for model attributes, including
//
//  - `_view_name`
//  - `_view_module`
//  - `_view_module_version`
//
//  - `_model_name`
//  - `_model_module`
//  - `_model_module_version`
//
//  when different from the base class.

// When serialiazing the entire widget state for embedding, only values that
// differ from the defaults will be specified.
var HelloModel = widgets.DOMWidgetModel.extend({
    defaults: _.extend(widgets.DOMWidgetModel.prototype.defaults(), {
        _model_name : 'HelloModel',
        _view_name : 'HelloView',
        _model_module : 'jupyterpivot',
        _view_module : 'jupyterpivot',
        _model_module_version : '0.1.0',
        _view_module_version : '0.1.0',
    })
});


// Custom View. Renders the widget model.
var HelloView = widgets.DOMWidgetView.extend({
    // Defines how the widget gets rendered into the DOM
    render: function() {
        // this.value_changed();

        // Observe changes in the value traitlet in Python, and define
        // a custom callback.
        // this.model.on('change:value', this.value_changed, this);
        this.initialize_pivot()
    },
    /*
    value_changed: function() {
        this.el.textContent = this.model.get('value');
    }
    */
    initialize_pivot: function() {
        this.$el.empty();
        this.initialize_pivottable();
    },

    initialize_pivottable() {
        if (!this.pivot_elm){
            this.rdid = Math.floor(Math.random() * Math.floor(1000));
            this.pivot_elm = $("<div id='pivot_"+ this.rdid +"'>").appendTo(this.$el);
        }
        setTimeout(function(){ 
            // create the pivot table
            $.getJSON(this.model.get('url'),
                function(mps){
                    onRefresh = function(config) {
                        var config_copy = JSON.parse(JSON.stringify(config));
                        //delete some values which are functions
                        delete config_copy["aggregators"];
                        delete config_copy["renderers"];
                        //delete some bulky default values
                        delete config_copy["rendererOptions"];
                        delete config_copy["localeStrings"];
                        delete config_copy["onRefresh"];                        
                        this.model.set('pivot_options',config_copy)
                        this.model.save_changes();
                    }.bind(this);                    
                    this.model.get('pivot_options')['onRefresh'] = onRefresh
                    $("#pivot_"+this.rdid).pivotUI(mps,
                        this.model.get('pivot_options'));
                }.bind(this)
            );
        }.bind(this), 1);        

    }

});


module.exports = {
    HelloModel: HelloModel,
    HelloView: HelloView
};
