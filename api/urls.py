from django.urls import path
from django.conf.urls import include
from api.views import *

urlpatterns = [
    path('centres/', CentreViewSet.as_view({'get': 'list'})),
    path('centres/add/', AddCentreViewSet.as_view()),
    path('centres/edit/<int:pk>/', EditCentreViewSet.as_view()),
    path('centres/delete/<int:pk>/', deleteCentre),

    path('sections/add/', AddSectionView.as_view()),
    path('students/add/', AddBulkStudentsView.as_view()),
    path('staff/add/', AddStaffView.as_view()),
    path('users/staff/', GetStaffUsersView.as_view()),
    path('users/students/', GetStudentUsersView.as_view()),
    path('tests/list/', TestListView.as_view()),
    path('tests/<int:pk>/', TestDetailsView.as_view()),
    path('tests/update/<int:pk>/', UpdateTestView.as_view()),
    path('questions/add/', CreateQuestionView.as_view()),
    path('questions/update/<int:pk>/', UpdateQuestionView.as_view()),
    path('options/update/<int:pk>/', UpdateOptionView.as_view()),
    path('tests/add/manual/', AddTestManualView.as_view()),
    path('tests/add/from-doc/', TestFromDocView.as_view()),
    path('complete-profile/<int:pk>/', CompleteProfileView.as_view()),
    path('courses/', CourseViewSet.as_view({'get' : 'list'})),

    # This is for browsable api login/logout
    path('api-auth/', include('rest_framework.urls')),
]
