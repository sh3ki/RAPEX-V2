"""
Seed migration: inserts default merchandise product categories.
"""

from django.db import migrations
from django.utils.text import slugify


CATEGORIES = [
    # (name, icon, sort_order, children)
    ('Fresh Produce', 'Leaf', 1, [
        ('Vegetables', 'Carrot', 0),
        ('Fruits', 'Apple', 1),
        ('Herbs & Spices', 'Sprout', 2),
    ]),
    ('Meat & Seafood', 'Fish', 2, [
        ('Pork', 'Ham', 0),
        ('Chicken', 'Drumstick', 1),
        ('Beef', 'Beef', 2),
        ('Seafood', 'Fish', 3),
    ]),
    ('Dairy & Eggs', 'Egg', 3, [
        ('Milk & Cheese', 'Milk', 0),
        ('Eggs', 'Egg', 1),
    ]),
    ('Bread & Bakery', 'Croissant', 4, []),
    ('Beverages', 'Coffee', 5, [
        ('Water & Juice', 'Droplet', 0),
        ('Coffee & Tea', 'Coffee', 1),
        ('Soft Drinks', 'GlassWater', 2),
    ]),
    ('Snacks & Sweets', 'Cookie', 6, []),
    ('Condiments & Sauces', 'FlameKindling', 7, []),
    ('Canned & Packaged Goods', 'Package', 8, []),
    ('Ready-to-Eat', 'UtensilsCrossed', 9, []),
    ('Pre-Loved Items', 'ShoppingBag', 10, [
        ('Clothing', 'Shirt', 0),
        ('Accessories', 'Watch', 1),
        ('Electronics', 'Smartphone', 2),
        ('Books & Media', 'BookOpen', 3),
        ('Home & Furniture', 'Sofa', 4),
    ]),
    ('Merchandise', 'Store', 11, [
        ('Apparel & Fashion', 'Shirt', 0),
        ('Health & Beauty', 'Heart', 1),
        ('Toys & Hobbies', 'Gamepad2', 2),
        ('Sports & Outdoors', 'Bike', 3),
        ('Home & Kitchen', 'Home', 4),
        ('Office Supplies', 'Briefcase', 5),
    ]),
]


def seed_categories(apps, schema_editor):
    Category = apps.get_model('products', 'Category')
    for name, icon, sort_order, children in CATEGORIES:
        slug = slugify(name)
        parent, _ = Category.objects.get_or_create(
            slug=slug,
            defaults={
                'name': name,
                'icon': icon,
                'sort_order': sort_order,
                'is_active': True,
            },
        )
        for child_name, child_icon, child_sort in children:
            child_slug = slugify(f"{name}-{child_name}")
            Category.objects.get_or_create(
                slug=child_slug,
                defaults={
                    'name': child_name,
                    'icon': child_icon,
                    'sort_order': child_sort,
                    'parent': parent,
                    'is_active': True,
                },
            )


def unseed_categories(apps, schema_editor):
    Category = apps.get_model('products', 'Category')
    Category.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_categories, unseed_categories),
    ]
