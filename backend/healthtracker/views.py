from django.http import JsonResponse
from django.shortcuts import render

def home(request):
    return JsonResponse({
        "message": "Welcome to Community Health Tracker API",
        "endpoints": {
            "admin": "/admin",
            "api": "/api",
            "token": "/api_token/",
            "documentation": "Add your API docs here"
        }
    })