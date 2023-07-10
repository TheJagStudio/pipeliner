from django.shortcuts import render


def main(request):
    return render(request, "index.html")


def train(request):
    return render(request, "index.html")


def prediction(request):
    return render(request, "index.html")


def imageAnnotation(request):
    return render(request, "index.html")


def imageGallery(request):
    return render(request, "index.html")


def annotatorAllocation(request):
    return render(request, "index.html")
