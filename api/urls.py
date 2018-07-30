from django.urls import path
from api.views import *

urlpatterns = [
    path('centres/', CentreListView.as_view()),
    path('complete-profile/<int:pk>/', CompleteProfileView.as_view()),
    path('centre/', CentreViewSet.as_view({'get' : 'list'})),
    path('course/', CourseViewSet.as_view({'get' : 'list'})),
]
