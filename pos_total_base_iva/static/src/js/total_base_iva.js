//function pos_total_base_iva_widgets(instance, module){
openerp.pos_total_base_iva = function(instance){
 var module   = instance.point_of_sale;
 var QWeb = instance.web.qweb;
 var round_di = instance.web.round_decimals;
 var round_pr = instance.web.round_precision

module.PosModel = module.PosModel.extend({

    models: (function() {
        var base_posmodel_model = module.PosModel.prototype.models;
        base_posmodel_model.push(
            {
                model:  'account.tax',
                fields: ['name','amount', 'price_include', 'include_base_amount', 'type', 'child_ids', 'child_depend',
                        'include_base_amount','is_iva'],
                domain: null,
                loaded: function(self, taxes){
                    self.taxes = taxes;
                    self.taxes_by_id = {};
                    _.each(taxes, function(tax){
                        self.taxes_by_id[tax.id] = tax;
                    });
                    _.each(self.taxes_by_id, function(tax) {
                        tax.child_taxes = {};
                        _.each(tax.child_ids, function(child_tax_id) {
                            tax.child_taxes[child_tax_id] = self.taxes_by_id[child_tax_id];
                        });
                    });
                },
            },
        );

		return base_posmodel_model;
	})(),
});

module.OrderWidget.include({

    update_summary: function() {
        this._super();
        var order = this.pos.get('selectedOrder');
        var baseRateIVA0 = order ? order.getTotalBaseIVA0() : 0;
        var baseRateIVA12 = order ? order.getTotalBaseIVA12() : 0;
        var total = order ? order.getTotalTaxIncluded() : 0;
        var taxes = order ? total - order.getTotalTaxExcluded() : 0;

        this.el.querySelector('.summary .base_iva .baseIVA0 > .value').textContent = this.format_currency(baseRateIVA0);
        this.el.querySelector('.summary .base_iva .baseIVA12 > .value').textContent = this.format_currency(baseRateIVA12);
        this.el.querySelector('.summary .base_iva .subentry .value').textContent = this.format_currency(taxes);
        this.el.querySelector('.summary .base_iva .total .value').textContent = this.format_currency(total);
        },
 });

module.Orderline = module.Orderline.extend({

    get_all_total_base_iva: function(){
        // You get the price of product including the discount
        var price = round_pr(this.get_quantity() * this.get_unit_price() * (1.0 - (this.get_discount() / 100.0)),
                             this.pos.currency.rounding);
        var baseIVA0 = 0;
        var baseIVA12 = 0;

        var product =  this.get_product();
        var taxes_ids = product.taxes_id;
        var taxes =  this.pos.taxes;
        var product_taxes = [];

        if (taxes_ids==0)
        // if the product has no taxes, the price is the baseIVA0 value
            baseIVA0 = price;

        _(taxes_ids).each(function(el){
        // the product taxes are get on product_taxes
            product_taxes.push(_.detect(taxes, function(t){
                return t.id === el;
            }));
        });

        _(product_taxes).each(function(el){
             // if the tax is included in the product price, the price is calculate without tax
            if (el.price_include)
                price = price/(1 + el.amount);

            if(el.is_iva && el.amount==0.12)
            // if the tax is IVA and its value is 0.12, the price is the baseIVA12
                baseIVA12 = price
            else
            // else, the price is the baseIVA0
                baseIVA0 = price;
        });

        return {
            "baseIVA0": baseIVA0,
            "baseIVA12": baseIVA12,
        };
    },
});

module.Order = module.Order.extend({
    getTotalBaseIVA0: function() {
        return round_pr((this.get('orderLines')).reduce((function(sum, orderLine) {
            return sum + orderLine.get_all_total_base_iva().baseIVA0;
        }), 0), this.pos.currency.rounding);
    },

    getTotalBaseIVA12: function() {
        return round_pr((this.get('orderLines')).reduce((function(sum, orderLine) {
            return sum + orderLine.get_all_total_base_iva().baseIVA12;
        }), 0), this.pos.currency.rounding);
    },
});
}