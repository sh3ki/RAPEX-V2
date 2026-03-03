"""
Auto-generated initial migration for apps.products.
Creates: category, merchandise_product, product_image tables.
"""

from django.db import migrations, models
import django.core.validators
import django.db.models.deletion
import apps.products.models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('merchants', '0002_alter_merchant_barangay_permit_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('slug', models.SlugField(max_length=120, unique=True)),
                ('description', models.TextField(blank=True, default='')),
                ('icon', models.CharField(blank=True, default='', help_text='Lucide / React-icon name used in the frontend.', max_length=50)),
                ('is_active', models.BooleanField(default=True)),
                ('sort_order', models.PositiveSmallIntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('parent', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='children', to='products.category')),
            ],
            options={
                'verbose_name': 'Category',
                'verbose_name_plural': 'Categories',
                'db_table': 'category',
                'ordering': ['sort_order', 'name'],
            },
        ),
        migrations.CreateModel(
            name='MerchandiseProduct',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('video', models.FileField(blank=True, help_text='MP4, ≤ 30 MB, ≤ 1280×1280, 10-60 s', null=True, upload_to=apps.products.models._product_video_upload_path)),
                ('name', models.CharField(max_length=100)),
                ('sku', models.CharField(blank=True, default='', max_length=100)),
                ('description_text', models.TextField(blank=True, default='', help_text='Long-text description (max 3 000 chars).', max_length=3000)),
                ('description_image', models.ImageField(blank=True, help_text='Portrait 4:3 JPG/PNG used instead of text description.', null=True, upload_to=apps.products.models._product_desc_image_upload_path)),
                ('price', models.DecimalField(decimal_places=2, max_digits=12, validators=[django.core.validators.MinValueValidator(0)])),
                ('stock', models.PositiveIntegerField(default=0)),
                ('is_verified', models.BooleanField(default=False)),
                ('is_archived', models.BooleanField(default=False)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('merchant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='merchandise_products', to='merchants.merchant')),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='products', to='products.category')),
            ],
            options={
                'verbose_name': 'Merchandise Product',
                'verbose_name_plural': 'Merchandise Products',
                'db_table': 'merchandise_product',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='ProductImage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', models.ImageField(upload_to=apps.products.models._product_image_upload_path)),
                ('sort_order', models.PositiveSmallIntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='images', to='products.merchandiseproduct')),
            ],
            options={
                'db_table': 'product_image',
                'ordering': ['sort_order', 'id'],
            },
        ),
    ]
