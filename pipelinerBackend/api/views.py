from django.shortcuts import render, redirect, HttpResponseRedirect
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from cvat_sdk import make_client
from cvat_sdk.core.proxies.tasks import ResourceType, Task
from cvat_sdk.core.proxies.projects import Project
from .models import (
    Basemodel,
    Fabric,
    Dataset,
    YoloModel,
    Annotator,
    Imagegallery,
    PredictionData,
)
import json
import zipfile
import os
from datetime import datetime

# import psutil
# import pynvml
import threading
from ultralytics import YOLO
import torch
from .tools import fast_process, format_results, point_prompt
from PIL import ImageDraw, Image
import numpy as np
import matplotlib.pyplot as plt
import cv2
import io
import csv
import random

predictPath = ""
predictModel = None
predictFolder = ""

with make_client(host="app.cvat.ai", credentials=("basappa", "Tipl@123")) as client:
    CVATClient = client


def createProject(name, labels):
    project_spec = {
        "name": name,
        "labels": labels,
        "target_storage": {"location": "local"},
        "source_storage": {"location": "local"},
    }
    newProject = client.projects.create(spec=project_spec)
    return newProject


def createTask(name, subset, projectId, data):
    task_spec = {
        "name": name,
        "assignee_id": 33017,
        "project_id": projectId,
        "subset": subset,
    }
    task = client.tasks.create_from_data(
        spec=task_spec, resource_type=ResourceType.LOCAL, resources=data
    )
    return task


# Disable CSRF protection for the view
@csrf_exempt
def extractFolder(request):
    # Check if the request method is POST and if the "dataset" file was uploaded
    if request.method == "POST":
        if request.FILES.get("dataset", False):
            # Get the uploaded file and the project name from the request
            dataset = request.FILES["dataset"]
            projectName = request.POST["projectName"]
            # Check if a project name was provided
            if projectName != "":
                # Create a folder name based on the current date and time
                extract_folder = str(datetime.now().strftime("%Y-%m-%d-%H-%M-%S"))
                # Set the target folder for the extracted files
                target_folder = "projects/" + projectName + "/datasets/"
                project = Fabric.objects.filter(fabricName=projectName).first()
                # Extract the files from the zip file to the target folder
                with zipfile.ZipFile(dataset, "r") as zip_ref:
                    zip_ref.extractall(os.path.join(target_folder, extract_folder))
                imagesTest = os.listdir(
                    target_folder + extract_folder + "/test/images/"
                )
                imagesTrain = os.listdir(
                    target_folder + extract_folder + "/train/images/"
                )
                imagesValid = os.listdir(
                    target_folder + extract_folder + "/valid/images/"
                )
                images = []
                for i in range(len(imagesTest)):
                    images.append(
                        target_folder + extract_folder + "/test/images/" + imagesTest[i]
                    )
                testTask = createTask(
                    extract_folder + "_test", "Test", project.id, images
                )
                images = []
                for i in range(len(imagesTrain)):
                    images.append(
                        target_folder
                        + extract_folder
                        + "/train/images/"
                        + imagesTrain[i]
                    )
                trainTask = createTask(
                    extract_folder + "_train", "Train", project.id, images
                )
                images = []
                for i in range(len(imagesValid)):
                    images.append(
                        target_folder
                        + extract_folder
                        + "/valid/images/"
                        + imagesValid[i]
                    )
                validTask = createTask(
                    extract_folder + "_valid", "Valid", project.id, images
                )
                newDataset = Dataset()
                newDataset.fabric = newFabric
                newDataset.datasetName = extract_folder
                newDataset.tasks = json.dumps(
                    {
                        "test": testTask.id,
                        "train": trainTask.id,
                        "valid": validTask.id,
                    }
                )
                newDataset.save()
                # Return a success message if the extraction was successful
                return HttpResponse(
                    json.dumps({"success": "File extracted successfully!"}),
                    content_type="application/json",
                )
            else:
                # Return an error message if no project name was provided
                return HttpResponse(
                    json.dumps({"error": "No project name found"}),
                    content_type="application/json",
                )
        else:
            # Return an error message if no file was found in the request
            return HttpResponse(
                json.dumps({"error": "No file found"}), content_type="application/json"
            )


# # Define a view that returns system information
# def sysInfo(request):
#     # Get the percentage of used RAM
#     ram = int(psutil.virtual_memory()[2])
#     # Get the average CPU load over the last 1, 5, and 15 minutes
#     load1, load5, load15 = psutil.getloadavg()
#     # Calculate the percentage of CPU usage
#     cpu = int((load5 / os.cpu_count()) * 100)
#     # Initialize the NVML library
#     pynvml.nvmlInit()
#     # Get the handle for the first GPU
#     handle = pynvml.nvmlDeviceGetHandleByIndex(0)
#     # Get the memory information for the GPU
#     info = pynvml.nvmlDeviceGetMemoryInfo(handle)
#     # Shutdown the NVML library
#     pynvml.nvmlShutdown()
#     # Calculate the percentage of used VRAM
#     vram = int(info.used * 100 / info.total)

#     # Create a dictionary containing the system information
#     data = {"ram": ram, "cpu": cpu, "vram": vram}
#     # Return the system information as a JSON object
#     return HttpResponse(json.dumps(data), content_type="application/json")


# Define a view that returns a list of project folders
def projectFecther(request):
    try:
        # Initialize an empty list to store the project folders
        folders = []
        # Loop through all files and folders in the "projects" directory
        for folder in os.listdir("projects"):
            # Check if the current item is a directory
            if os.path.isdir("projects/" + folder):
                # If it is, add it to the list of project folders
                folders.append(folder)
        # Return the list of project folders as a JSON object
        return HttpResponse(
            json.dumps({"data": folders}), content_type="application/json"
        )
    except Exception as e:
        # If an error occurs, return an error message as a JSON object
        return HttpResponse(
            json.dumps({"error": str(e)}), content_type="application/json"
        )


# Define a view that returns a list of dataset folders for a specific project
def datasetFecther(request):
    try:
        # Get the project name from the request
        project = request.GET["project"]
        # Initialize an empty list to store the dataset folders
        folders = []
        # Loop through all files and folders in the "datasets" directory for the specified project
        for folder in os.listdir("projects/" + project + "/datasets"):
            # Check if the current item is a directory
            if os.path.isdir("projects/" + project + "/datasets/" + folder):
                # If it is, add it to the list of dataset folders
                folders.append(folder)
        # Return the list of dataset folders as a JSON object
        return HttpResponse(
            json.dumps({"data": folders}), content_type="application/json"
        )
    except Exception as e:
        # If an error occurs, return an error message as a JSON object
        return HttpResponse(
            json.dumps({"error": str(e)}), content_type="application/json"
        )


# Define a view that returns a list of model folders for a specific project
def modelFecther(request):
    try:
        # Get the project name from the request
        project = request.GET["project"]
        # Initialize an empty list to store the model folders
        folders = []
        # Loop through all files and folders in the "models" directory for the specified project
        for folder in os.listdir("projects/" + project + "/models"):
            # Check if the current item is a directory
            if os.path.isdir("projects/" + project + "/models/" + folder):
                # If it is, add it to the list of model folders
                folders.append(folder)
        # Return the list of model folders as a JSON object
        return HttpResponse(
            json.dumps({"data": folders}), content_type="application/json"
        )
    except Exception as e:
        # If an error occurs, return an error message as a JSON object
        return HttpResponse(
            json.dumps({"error": str(e)}), content_type="application/json"
        )


# Define a view that returns a list of base model folders
def basemodelFecther(request):
    try:
        # Initialize an empty list to store the base model folders
        folders = []
        # Loop through all files and folders in the "baseModels" directory
        for folder in os.listdir("baseModels"):
            # Check if the current item contains "yolo" in its name
            if "yolo" in folder:
                # If it does, add it to the list of base model folders
                folders.append(folder)
        # Return the list of base model folders as a JSON object
        return HttpResponse(
            json.dumps({"data": folders}), content_type="application/json"
        )
    except Exception as e:
        # If an error occurs, return an error message as a JSON object
        return HttpResponse(
            json.dumps({"error": str(e)}), content_type="application/json"
        )


# Define a view that returns a list of images for a specific dataset and project
def imageGallery(request):
    try:
        # Get the project and dataset names from the request
        project = request.GET["project"]
        dataset = request.GET["dataset"]
        # Initialize an empty dictionary to store the image paths
        data = {}
        # Define the paths to the test, train, and validation image folders
        testPath = "projects/" + project + "/datasets/" + dataset + "/test/images/"
        trainPath = "projects/" + project + "/datasets/" + dataset + "/train/images/"
        validPath = "projects/" + project + "/datasets/" + dataset + "/valid/images/"
        # Initialize empty lists for the test, train, and validation image paths
        data["test"] = []
        data["train"] = []
        data["valid"] = []
        # Add the image paths to the corresponding lists
        for image in os.listdir(testPath):
            data["test"].append(
                project + "/datasets/" + dataset + "/test/images/" + image
            )
        for image in os.listdir(trainPath):
            data["train"].append(
                project + "/datasets/" + dataset + "/train/images/" + image
            )
        for image in os.listdir(validPath):
            data["valid"].append(
                project + "/datasets/" + dataset + "/valid/images/" + image
            )
        # Add the project and dataset names to the dictionary
        data["project"] = project
        data["dataset"] = dataset
        # Return the dictionary as a JSON object
        return HttpResponse(json.dumps(data), content_type="application/json")
    except Exception as e:
        # If an error occurs, return an error message as a JSON object
        return HttpResponse(
            json.dumps({"error": str(e)}), content_type="application/json"
        )


# Define a view that trains a YOLO model
# Disable CSRF protection for the view
@csrf_exempt
def modelTraining(request):
    # If the request method is POST
    if request.method == "POST":
        try:
            # Get the project, dataset, epochs, base model, image size, and name from the request
            project = request.POST["projectName"]
            datasetName = request.POST["datasetName"]
            epochs = request.POST["epochs"]
            baseModel = request.POST["baseModel"]
            imgsz = request.POST["imgsz"]
            name = request.POST["name"]
            device = "0"
            baseDir = os.getcwd()
            # Initialize a YOLO model with the specified base model
            model = YOLO("baseModels/" + baseModel)
            # Train the model using the specified parameters
            model.train(
                data=baseDir
                + "/projects/"
                + project
                + "/datasets/"
                + datasetName
                + "/data.yaml",
                device=device,
                epochs=int(epochs),
                imgsz=int(imgsz),
                project=baseDir + "/projects/" + project + "/models/",
                name=name,
                batch=-1,
                task="segment",
            )
            # Return a success message as a JSON object
            return HttpResponse(
                json.dumps({"success": "Model Trained "}),
                content_type="application/json",
            )
        except Exception as e:
            # If an error occurs, return an error message as a JSON object
            return HttpResponse(
                json.dumps({"error": str(e)}), content_type="application/json"
            )
    else:
        # If the request is not a POST request, return an error message as a JSON object
        return HttpResponse(
            json.dumps({"error": "Invalid Request"}), content_type="application/json"
        )


# Define a view that predicts object detection on an image using a YOLO model
# Disable CSRF protection for the view
@csrf_exempt
def modelPrediction(request):
    if request.method == "POST":
        # Initialize variables for the prediction path, model, and folder
        global predictPath, predictModel, predictFolder
        results = []
        # Get the project name, model name, and input source from the request
        project = request.POST["projectName"]
        modelName = request.POST["modelName"]
        inputSource = request.POST["inputSource"]
        # Check if the input source is an uploaded image
        if request.FILES.get("image", False):
            # If it is, save the image to the project's images directory
            image = request.FILES["image"]
            # save the image to the project's images directory
            with open("projects/" + project + "/images/" + image.name, "wb+") as f:
                f.write(image.read())
            # image.save("projects/" + project + "/images/" + image.filename)
            # Check if the current model is different from the previous prediction model
            if (
                "projects/" + project + "/models/" + modelName + "/weights/best.pt"
                != predictPath
            ):
                # If it is, update the prediction path, model, and folder
                predictPath = (
                    "projects/" + project + "/models/" + modelName + "/weights/best.pt"
                )
                predictModel = YOLO(
                    "projects/" + project + "/models/" + modelName + "/weights/best.pt"
                )
                predictFolder = datetime.now().strftime("%Y-%m-%d-%H%M%S")
            # Predict the objects in the image using the YOLO model
            results = predictModel(
                "projects/" + project + "/images/" + image.name,
                retina_masks=True,
                iou=0.1,
                conf=0.01,
                imgsz=640,
                project="projects/" + project + "/predicts/",
                name=predictFolder,
                save=True,
                show_conf=False,
                show_labels=False,
                boxes=False,
            )
            for result in results:
                orignalPath = result.path
                path = (
                    "projects/"
                    + project
                    + "/predicts/"
                    + predictFolder
                    + "/"
                    + image.name
                )
                imageCv = cv2.imread(path)
                for box in result.boxes:
                    boxCor = box.xyxy.tolist()[0]
                    centerX = boxCor[0] + ((boxCor[2] - boxCor[0]) / 2)
                    centerY = boxCor[1] + ((boxCor[3] - boxCor[1]) / 2)
                    confident = box.conf.tolist()[0]
                    # plot the point on the image
                    imageHeight, imageWidth, _ = imageCv.shape
                    imageCv = cv2.circle(
                        imageCv,
                        (int(centerX), int(centerY)),
                        10,
                        (0, 255, 255),
                        10,
                    )
                    imageCv = cv2.rectangle(
                        imageCv,
                        (int(boxCor[0]), int(boxCor[1])),
                        (int(boxCor[2]), int(boxCor[3])),
                        (0, 255, 255),
                        1,
                    )
                    imageCv = cv2.putText(
                        imageCv,
                        str(confident)[:4],
                        (int(boxCor[0]), int(boxCor[1]) - 5),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        1,
                        (0, 255, 255),
                        2,
                        cv2.LINE_AA,
                    )
                    newPredict = PredictionData()
                    newPredict.fabric = Fabric.objects.filter(
                        fabricName=project
                    ).first()
                    newPredict.centroid = str(centerX)[:4] + "," + str(centerY)[:4]
                    newPredict.boundingBox = (
                        str(boxCor[0])[:4]
                        + ","
                        + str(boxCor[1])[:4]
                        + ","
                        + str(boxCor[2])[:4]
                        + ","
                        + str(boxCor[3])[:4]
                    )
                    newPredict.imageRaw = (
                        "projects/" + project + "/images/" + image.name
                    )
                    newPredict.imageAnnotated = path
                    newPredict.confidence = confident
                    newPredict.save()
                # save the image
                cv2.imwrite(path, imageCv)

            return HttpResponse(
                json.dumps(
                    {
                        "path": project
                        + "/predicts/"
                        + predictFolder
                        + "/"
                        + image.name,
                        "results": str(results),
                    }
                ),
                content_type="application/json",
            )
        else:
            # If no input source is provided, return an error message as a JSON object
            return HttpResponse(
                json.dumps({"error": "No Input Source Provided"}),
                content_type="application/json",
            )
    else:
        # If an invalid request is made, return an error message as a JSON object
        return HttpResponse(
            json.dumps({"error": "Invalid Request"}), content_type="application/json"
        )


# Define a view that returns the details of a trained model
def modelDetails(request):
    try:
        # Get the project and model names from the request
        project = request.GET["project"]
        model = request.GET["model"]
        # Define the path to the results CSV file
        csvFile = "projects/" + project + "/models/" + model + "/results.csv"
        # Initialize an empty list to store the model details
        data = []
        # Open the CSV file and read the rows
        with open(csvFile) as csv_file:
            csv_reader = csv.reader(csv_file, delimiter=",")
            # For each row, extract the relevant data and append it to the list
            for row in csv_reader:
                temp = [
                    row[0].strip().replace(" ", ""),
                    row[5].strip().replace(" ", ""),
                    row[6].strip().replace(" ", ""),
                    row[7].strip().replace(" ", ""),
                    row[8].strip().replace(" ", ""),
                ]
                data.append(temp)
        # Return the model details as a JSON object
        return HttpResponse(
            json.dumps({"data": data[1:]}), content_type="application/json"
        )
    except Exception as e:
        # If an error occurs, return an error message as a JSON object
        return HttpResponse(
            json.dumps({"error": str(e)}), content_type="application/json"
        )


@csrf_exempt
def addNewFebric(request):
    if request.method == "POST":
        try:
            fabricName = request.POST["fabricName"]
            description = request.POST["fabricDetails"]
            images = request.FILES.getlist("images")
            dataset = request.FILES["dataset"]
            fabricType = request.POST["fabricType"]
            color = request.POST["fabricColor"]
            GSM = request.POST["fabricGSM"]
            material = request.POST["fabricMaterial"]
            fabricLabels = request.POST["fabricLabels"]

            baseDir = os.getcwd()
            folderPath = baseDir + "/projects/" + fabricName
            if not os.path.exists(folderPath):
                labels = [
                    {
                        "name": label[0],
                        "attributes": [],
                        "type": "polygon",
                        "color": label[1],
                    }
                    for label in json.loads(fabricLabels)
                ]
                project = createProject(fabricName, labels)

                os.mkdir(folderPath)
                os.mkdir(folderPath + "/datasets")
                os.mkdir(folderPath + "/images")
                os.mkdir(folderPath + "/models")
                os.mkdir(folderPath + "/predicts")
                os.mkdir(folderPath + "/samples")
                newFabric = Fabric()
                newFabric.id = project.id
                newFabric.fabricName = fabricName
                newFabric.fabricDescription = description
                newFabric.GSM = GSM
                newFabric.color = color
                newFabric.fabricType = fabricType
                newFabric.material = material
                newFabric.sampleImages = images[0]
                newFabric.save()

                for file in images:
                    with open(folderPath + "/samples/" + file.name, "wb+") as f:
                        f.write(file.read())

                des = folderPath + "/description.txt"
                with open(des, "w") as file:
                    file.write(description)

                if fabricName != "":
                    extract_folder = str(datetime.now().strftime("%Y-%m-%d-%H-%M-%S"))

                    newDataset = Dataset()
                    newDataset.fabric = newFabric
                    newDataset.datasetName = extract_folder
                    newDataset.save()

                    target_folder = "./projects/" + fabricName + "/datasets/"
                    with zipfile.ZipFile(dataset, "r") as zip_ref:
                        zip_ref.extractall(os.path.join(target_folder, extract_folder))

                    imagesTest = os.listdir(
                        target_folder + extract_folder + "/test/images/"
                    )
                    imagesTrain = os.listdir(
                        target_folder + extract_folder + "/train/images/"
                    )
                    imagesValid = os.listdir(
                        target_folder + extract_folder + "/valid/images/"
                    )
                    images = []
                    for i in range(len(imagesTest)):
                        images.append(
                            target_folder
                            + extract_folder
                            + "/test/images/"
                            + imagesTest[i]
                        )
                    testTask = createTask(
                        extract_folder + "_test", "Test", project.id, images
                    )
                    images = []
                    for i in range(len(imagesTrain)):
                        images.append(
                            target_folder
                            + extract_folder
                            + "/train/images/"
                            + imagesTrain[i]
                        )
                    trainTask = createTask(
                        extract_folder + "_train", "Train", project.id, images
                    )
                    images = []
                    for i in range(len(imagesValid)):
                        images.append(
                            target_folder
                            + extract_folder
                            + "/valid/images/"
                            + imagesValid[i]
                        )
                    validTask = createTask(
                        extract_folder + "_valid", "Valid", project.id, images
                    )
                    newDataset = Dataset()
                    newDataset.fabric = newFabric
                    newDataset.datasetName = extract_folder
                    newDataset.tasks = json.dumps(
                        {
                            "test": testTask.id,
                            "train": trainTask.id,
                            "valid": validTask.id,
                        }
                    )
                    newDataset.save()

                    # imagesTest = os.listdir(
                    #     folderPath + "/datasets/" + extract_folder + "/test/images/"
                    # )
                    # labelsTest = os.listdir(
                    #     folderPath + "/datasets/" + extract_folder + "/test/labels/"
                    # )
                    # imagesTrain = os.listdir(
                    #     folderPath + "/datasets/" + extract_folder + "/train/images/"
                    # )
                    # labelsTrain = os.listdir(
                    #     folderPath + "/datasets/" + extract_folder + "/train/labels/"
                    # )
                    # imagesValid = os.listdir(
                    #     folderPath + "/datasets/" + extract_folder + "/valid/images/"
                    # )
                    # labelsValid = os.listdir(
                    #     folderPath + "/datasets/" + extract_folder + "/valid/labels/"
                    # )
                    # for image, label in zip(imagesTest, labelsTest):
                    #     newImage = Imagegallery()
                    #     newImage.fabric = newFabric
                    #     newImage.dataset = newDataset
                    #     newImage.imageType = "test"
                    #     # read the image
                    #     tempImage = open(
                    #         folderPath
                    #         + "/datasets/"
                    #         + extract_folder
                    #         + "/test/images/"
                    #         + image,
                    #         "rb",
                    #     ).read()
                    #     tempLabel = open(
                    #         folderPath
                    #         + "/datasets/"
                    #         + extract_folder
                    #         + "/test/labels/"
                    #         + image,
                    #         "rb",
                    #     ).read()
                    #     newImage.image = tempImage
                    #     newImage.imageLabel = tempLabel
                    #     newImage.save()
                    #     print(image)

                return HttpResponse(
                    json.dumps({"success": "Fabric Created successfully"}),
                    content_type="application/json",
                )
            else:
                return HttpResponse(
                    json.dumps({"error": "Fabric Already exists."}),
                    content_type="application/json",
                )
        except Exception as e:
            return HttpResponse(
                json.dumps({"error": str(e)}),
                content_type="application/json",
            )
    else:
        return HttpResponse(
            json.dumps({"erroe": "Invalid Request"}),
            content_type="application/json",
        )


# Define a view that returns the details of a fabric
def getFebricDetails(request):
    try:
        # Get the fabric name from the request
        fabricName = request.GET["fabricName"]
        # Define the path to the fabric folder
        folderPath = "./projects/" + fabricName
        description = ""
        # Read the description from the description.txt file in the fabric folder
        with open(folderPath + "/description.txt", "r") as file:
            description = file.read()
        images = []
        # Get the list of images in the samples folder of the fabric
        for image in os.listdir(folderPath + "/samples"):
            images.append(fabricName + "/samples/" + image)
        # Return the fabric description and images as a JSON object
        return HttpResponse(
            json.dumps({"description": description, "images": images}),
            content_type="application/json",
        )
    except Exception as e:
        # If an error occurs, return an empty description and image list as a JSON object
        return HttpResponse(
            json.dumps({"description": "", "images": []}),
            content_type="application/json",
        )


def taskDetails(request):
    try:
        project = request.GET["project"]
        dataset = request.GET["dataset"]
        print(project, dataset)
        task = Dataset.objects.filter(
            fabric=Fabric.objects.filter(fabricName=project).first(),
            datasetName=dataset,
        ).first()
        print(task.tasks)
        return HttpResponse(
            json.dumps({"tasks": json.loads(task.tasks)}),
            content_type="application/json",
        )
    except Exception as e:
        return HttpResponse(
            json.dumps({"error": str(e)}),
            content_type="application/json",
        )


def AnnotatorDetails(request):
    try:
        annotators = Annotator.objects.all()
        annotatorList = []
        for annotator in annotators:
            annotatorList.append([annotator.annotatorId, annotator.annotatorName])
        return HttpResponse(
            json.dumps({"data": annotatorList}),
            content_type="application/json",
        )
    except Exception as e:
        return HttpResponse(
            json.dumps({"error": str(e)}),
            content_type="application/json",
        )


@csrf_exempt
def AnnotatorAllocation(request):
    if request.method == "POST":
        try:
            annotatorId = request.POST.get("annotatorId")
            annotatorRole = request.POST.get("annotatorRole")
            project = request.POST.get("projectName")
            datasetName = request.POST.get("datasetName")
            project = Fabric.objects.filter(fabricName=project).first()
            task = Dataset.objects.filter(
                fabric=project, datasetName=datasetName
            ).first()
            taskCvat = client.tasks.retrieve(json.loads(task.tasks)[annotatorRole])
            taskCvat.update({"assignee_id": int(annotatorId)})
            return HttpResponse(
                json.dumps({"success": "Annotator Assigned successfully"}),
                content_type="application/json",
            )
        except Exception as e:
            return HttpResponse(
                json.dumps({"error": str(e)}), content_type="application/json"
            )
