# -*- coding: utf-8 -*-
##############################################################################
#
#    Diana Rojas, 2018
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as
#    published by the Free Software Foundation, either version 3 of the
#    License, or (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Affero General Public License for more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################
{
    'name': "Total Base IVA",

    'summary': """Adds the total consumed of the products with and without IVA""",

    'description': """
        This module adds, in the point of sale session, the total consumed of
        the products with IVA base equal to 0% and 12%.
        
        Configuration
        
        * Indicate that the tax is IVA.
        * Assign the tax to the product.
    """,

    'author': "Diana Rojas",
    'support': "dianacarolinarojas@gmail.com",
    'category': 'Point of Sale',
    'version': '1.0',
    'depends': ['point_of_sale'],
    'data': ['views/pos_total_base_iva_view.xml',
             'templates.xml',
            ],
    'images': ['images/cover_page.jpg'],
    'qweb':['static/src/xml/total_base_iva.xml'],
    'installable': True,
    'auto_install': False,
}