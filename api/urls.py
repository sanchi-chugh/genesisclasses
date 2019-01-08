from django.urls import path
from django.conf.urls import include
from api.views import *

urlpatterns = [
    # -------------------SUPER ADMIN ENDPOINTS--------------------
    # Endpoints for centres
    path('centres/', CentreViewSet.as_view({'get': 'list'})),
    path('centres/add/', AddCentreViewSet.as_view()),
    path('centres/edit/<int:pk>/', EditCentreViewSet.as_view()),
    path('centres/delete/<int:pk>/', deleteCentre),

    # Endpoints for courses
    path('courses/', CourseViewSet.as_view({'get': 'list'})),
    path('courses/add/', AddCourseViewSet.as_view()),
    path('courses/edit/<int:pk>/', EditCourseViewSet.as_view()),
    path('courses/delete/<int:pk>/', deleteCourse),

    # Endpoints for subjects
    path('subjects/', SubjectViewSet.as_view({'get': 'list'})),
    path('subjects/add/', AddSubjectViewSet.as_view()),
    path('subjects/edit/<int:pk>/', EditSubjectViewSet.as_view()),
    path('subjects/delete/<int:pk>/', deleteSubject),

    # Endpoints for units
    path('units/', UnitViewSet.as_view({'get': 'list'})),
    path('subjectWiseUnits/', SubjectWiseUnitViewSet.as_view({'get': 'list'})),
    path('units/add/', AddUnitViewSet.as_view()),
    path('units/edit/<int:pk>/', EditUnitViewSet.as_view()),
    path('units/delete/<int:pk>/', deleteUnit),

    # Endpoints for test categories
    path('testCategories/', TestCategoryViewSet.as_view({'get': 'list'})),
    path('testCategories/add/', AddTestCategoryViewSet.as_view()),
    path('testCategories/edit/<int:pk>/', EditTestCategoryViewSet.as_view()),
    path('testCategories/delete/<int:pk>/', deleteTestCategory),

    # Endpoints for students
    path('users/students/', StudentUserViewSet.as_view({'get': 'list'})),
    path('users/students/add/', AddStudentUserViewSet.as_view()),
    path('users/students/edit/<int:pk>/', EditStudentUserViewSet.as_view()),
    path('users/students/delete/<int:pk>/', DeleteStudentUser),
    
    # Endpoints for bulk students
    path('users/students/bulk/', BulkStudentsViewSet.as_view({'get': 'list'})),
    path('users/students/bulk/create/', AddBulkStudentsViewSet.as_view()),

    path('sections/add/', AddSectionView.as_view()),
    path('staff/add/', AddStaffView.as_view()),
    path('users/staff/', GetStaffUsersView.as_view()),
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
