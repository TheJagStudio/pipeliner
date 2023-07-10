from django.urls import path
from . import views

urlpatterns = [
    path("extractFolder/", views.extractFolder, name="extractFolder"),
    path("sysInfo/", views.sysInfo, name="sysInfo"),
    path("projectFecther/", views.projectFecther, name="projectFecther"),
    path("datasetFecther/", views.datasetFecther, name="datasetFecther"),
    path("modelFecther/", views.modelFecther, name="modelFecther"),
    path("basemodelFecther/", views.basemodelFecther, name="basemodelFecther"),
    path("imageGallery/", views.imageGallery, name="imageGallery"),
    path("training/", views.modelTraining, name="modelTraining"),
    path("prediction/", views.modelPrediction, name="modelPrediction"),
    path("modelDetails/", views.modelDetails, name="modelDetails"),
    path("getFebricDetails/", views.getFebricDetails, name="getFebricDetails"),
    path("addNewFebric/", views.addNewFebric, name="addNewFebric"),
    path("taskDetails/", views.taskDetails, name="taskDetails"),
    path("AnnotatorDetails/", views.AnnotatorDetails, name="AnnotatorDetails"),
    path("AnnotatorAllocation/", views.AnnotatorAllocation, name="AnnotatorAllocation"),
]
