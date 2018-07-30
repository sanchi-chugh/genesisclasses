from django.urls import path
from api.views import CompleteProfileView, CentreListView

urlpatterns = [
    path('centres/', CentreListView.as_view()),
    path('complete-profile/<int:pk>/', CompleteProfileView.as_view()),
]
