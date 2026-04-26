from django.urls import path
from . import views

urlpatterns = [
    path('upload/',   views.upload_dataset,  name='upload'),
    path('analyze/',  views.analyze_dataset, name='analyze'),
    path('simulate/', views.simulate_fair,   name='simulate'),
]