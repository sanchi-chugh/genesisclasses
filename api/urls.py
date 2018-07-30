from django.urls import path
from api.views import *

urlpatterns = [
    path('complete-profile/<int:pk>/', CompleteProfileView.as_view()),
    path('centres/', CentreViewSet.as_view({'get' : 'list'})),
    path('courses/', CourseViewSet.as_view({'get' : 'list'})),
]
