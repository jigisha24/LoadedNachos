from django.urls import path
from .views import upload_dataset, analyze_bias

urlpatterns = [
    path('upload/', upload_dataset),
    path('analyze/', analyze_bias),
]