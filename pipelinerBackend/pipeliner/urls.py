from django.contrib import admin
from django.urls import include, path
from django.conf.urls.static import static
from django.conf import settings
from . import views

urlpatterns = [
    path("api/", include("api.urls")),
    path("admin/", admin.site.urls),
    path("", views.main, name="main"),
    path("train/", views.train, name="train"),
    path("prediction/", views.prediction, name="prediction"),
    path("image-annotation/", views.imageAnnotation, name="imageAnnotation"),
    path("image-gallery/", views.imageGallery, name="imageGallery"),
    path(
        "annotator-allocation/", views.annotatorAllocation, name="annotatorAllocation"
    ),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
