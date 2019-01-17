from django.urls import path
from django.conf.urls import include
from api.views import *

urlpatterns = [
    # -------------------SUPER ADMIN ENDPOINTS--------------------
    # Endpoints for centres
    path('centres/', CentreViewSet.as_view({'get': 'list'})),
    path('centres/add/', AddCentreView.as_view()),
    path('centres/edit/<int:pk>/', EditCentreView.as_view()),
    path('centres/delete/<int:pk>/', deleteCentre),

    # Endpoints for courses
    path('courses/', CourseViewSet.as_view({'get': 'list'})),
    path('courses/add/', AddCourseView.as_view()),
    path('courses/edit/<int:pk>/', EditCourseView.as_view()),
    path('courses/delete/<int:pk>/', deleteCourse),

    # Endpoints for subjects
    path('subjects/', SubjectViewSet.as_view({'get': 'list'})),
    path('subjects/add/', AddSubjectView.as_view()),
    path('subjects/edit/<int:pk>/', EditSubjectView.as_view()),
    path('subjects/delete/<int:pk>/', deleteSubject),

    # Endpoints for units
    path('units/', UnitViewSet.as_view({'get': 'list'})),
    path('subjectWiseUnits/', SubjectWiseUnitViewSet.as_view({'get': 'list'})),
    path('units/add/', AddUnitView.as_view()),
    path('units/edit/<int:pk>/', EditUnitView.as_view()),
    path('units/delete/<int:pk>/', deleteUnit),

    # Endpoints for test categories
    path('testCategories/', TestCategoryViewSet.as_view({'get': 'list'})),
    path('testCategories/add/', AddTestCategoryView.as_view()),
    path('testCategories/edit/<int:pk>/', EditTestCategoryView.as_view()),
    path('testCategories/delete/<int:pk>/', deleteTestCategory),

    # Endpoints for tests
    path('tests/', TestInfoViewSet.as_view({'get': 'list'})),
    path('tests/add/', AddTestInfoView.as_view()),
    path('tests/edit/<int:pk>/', EditTestInfoView.as_view()),
    path('tests/delete/<int:pk>/', deleteTest),

    # Endpoints for sections
    # List sections of a partiular test (takes test pk as input)
    path('tests/sections/<int:pk>/', SectionsInfoViewSet.as_view({'get': 'list'})),
    path('tests/sections/add/', AddSectionView.as_view()),    # Add a section
    path('tests/sections/edit/<int:pk>/', EditSectionView.as_view()),   # Edit a section
    path('tests/sections/delete/<int:pk>/', DeleteSectionView),   # Delete a section

    # Endpoints for students
    path('users/students/', StudentUserViewSet.as_view({'get': 'list'})),
    path('users/students/add/', AddStudentUserView.as_view()),
    path('users/students/edit/<int:pk>/', EditStudentUserView.as_view()),
    path('users/students/delete/<int:pk>/', DeleteStudentUser),
    
    # Endpoints for bulk students
    path('users/students/bulk/', BulkStudentsViewSet.as_view({'get': 'list'})),
    path('users/students/bulk/create/', AddBulkStudentsView.as_view()),

    # Endpoint for downloading csv with data of all students 
    # (under a particular superadmin)
    path('getStudentData/', DownloadStudentDataView.as_view()),

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

    # Additional urls for choice fields in UI
    # Lists all subjects - subject_name (course_title_1 + course_title_2 + ...)
    path('subjectChoice/', SubjectChoiceView.as_view({'get': 'list'})),
    # Lists all units belonging to a specific subject
    path('units/<int:pk>/', SubjectSpecificUnitViewSet.as_view({'get': 'list'})),
    # Lists all subjects belonging to comma separated string of courses
    path('subjects/<str:courses>/', CoursesFilteredSubjectViewSet.as_view({'get': 'list'})),

    # This is for browsable api login/logout
    path('api-auth/', include('rest_framework.urls')),
]
