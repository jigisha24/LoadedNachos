from django.urls import path
from .views import upload_dataset, analyze_bias, simulate_fair

urlpatterns = [
    path('upload/', upload_dataset),
    path('analyze/', analyze_bias),
    path('simulate/', simulate_fair),
]