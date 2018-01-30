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
        var baseRateIVA0 = order ? order.getTotalBaseWithoutIva() : 0;
        var baseRateIVA12 = order ? order.getTotalBaseWithIva() : 0;

        this.el.querySelector('.summary .show_disc .baseIVA0 > .value_s').textContent = this.format_currency(baseRateIVA0);
        this.el.querySelector('.summary .show_disc .baseIVA12 > .value_s').textContent = this.format_currency(baseRateIVA12);
        },
 });

module.Orderline = module.Orderline.extend({

    get_all_total_base_iva: function(){
        var baseWithoutDiscount = round_pr(this.get_quantity() * this.get_unit_price(), this.pos.currency.rounding);
        var baseWithoutIVA = 0;
        var baseWithIVA = 0;

        var product =  this.get_product();
        var taxes_ids = product.taxes_id;
        var taxes =  this.pos.taxes;
        var product_taxes = [];

        if (taxes_ids==0)
            baseWithoutIVA = baseWithoutDiscount;

        _(taxes_ids).each(function(el){
            product_taxes.push(_.detect(taxes, function(t){
                return t.id === el;
            }));
        });

        _(product_taxes).each(function(el){
            if(el.is_iva)
            {
                if(el.amount==0.12)
                {
                    if (el.price_include)
                        baseWithIVA = baseWithoutDiscount -(this.get_unit_price()*el.amount);
                    else
                        baseWithIVA = baseWithoutDiscount;
                }
                else
                {
                    if(el.amount==0.00)
                        baseWithoutIVA = baseWithoutDiscount;
                }
            }
        });

        return {
            "baseWithoutIVA": baseWithoutIVA,
            "baseWithIVA": baseWithIVA,
        };
    },
});

module.Order = module.Order.extend({
    getTotalBaseWithoutIva: function() {
        return round_pr((this.get('orderLines')).reduce((function(sum, orderLine) {
            return sum + orderLine.get_all_total_base_iva().baseWithoutIVA;
        }), 0), this.pos.currency.rounding);
    },

    getTotalBaseWithIva: function() {
        return round_pr((this.get('orderLines')).reduce((function(sum, orderLine) {
            return sum + orderLine.get_all_total_base_iva().baseWithIVA;
        }), 0), this.pos.currency.rounding);
    },
});
}