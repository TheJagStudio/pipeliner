# Generated by Django 4.1.4 on 2023-07-08 17:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0004_predictiondata_confidence"),
    ]

    operations = [
        migrations.AlterField(
            model_name="predictiondata",
            name="boundingBox",
            field=models.CharField(blank=True, default="", max_length=100),
        ),
        migrations.AlterField(
            model_name="predictiondata",
            name="centroid",
            field=models.CharField(blank=True, default="", max_length=100),
        ),
    ]
