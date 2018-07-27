from django.urls import path
from api.views import CompleteProfileView

urlpatterns = [
    path('complete-profile/<int:pk>/', CompleteProfileView.as_view()),
]
