from django.urls import path
from django.conf.urls import include
from api.views import *

urlpatterns = [
    # -------------------SUPER ADMIN ENDPOINTS--------------------
    # Endpoint for dashboard home
    path('dashboard/home/details/', DashboardHomeView.as_view()),   # General details + Course Pie Chart
    path('dashboard/home/centrePieChartDetails/', CentrePieChartView.as_view()),   # Centre wise student pie chart
    path('dashboard/home/topperDetails/', TopperDetailsView.as_view()),     # Overall topper details

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
    path('tests/detail/<int:pk>/', TestInfoView.as_view()),
    path('tests/add/', AddTestInfoView.as_view()),
    path('tests/edit/<int:pk>/', EditTestInfoView.as_view()),
    path('tests/delete/<int:pk>/', deleteTest),

    # Endpoints for sections
    # List sections of a particular test (takes test pk as input)
    path('tests/sections/<int:pk>/', SectionsViewSet.as_view({'get': 'list'})),
    path('tests/sections/detail/<int:pk>/', SectionsView.as_view()),
    path('tests/sections/add/', AddSectionView.as_view()),    # Add a section
    path('tests/sections/edit/<int:pk>/', EditSectionView.as_view()),   # Edit a section
    path('tests/sections/delete/<int:pk>/', DeleteSectionView),   # Delete a section
    # Endpoint for rearranging sections (of a test)
    path('tests/sections/rearrange/<int:pk>/', RearrangeSections.as_view()),

    # Endpoints for questions
    # List ques of a particular section (takes section pk as input)
    path('tests/sections/questions/<int:pk>/', QuestionsViewSet.as_view({'get': 'list'})),
    path('tests/sections/questions/detail/<int:pk>/', QuestionDetailsView.as_view()),
    path('tests/sections/questions/detail/edit/<int:pk>/', EditQuestionDetailsView.as_view()),
    path('tests/sections/questions/detail/add/', AddQuestionDetailsView.as_view()),
    path('tests/sections/questions/delete/<int:pk>/', DeleteQuestionView),
    # Endpoint for rearranging questions (of a section)
    path('tests/sections/questions/rearrange/<int:pk>/', RearrangeQuestions.as_view()),

    # Endpoints for passages
    path('tests/sections/questions/passages/<int:pk>/', PassageDetailsView.as_view()),
    path('tests/sections/questions/passages/add/', AddPassageView.as_view()),
    path('tests/sections/questions/passages/edit/<int:pk>/', EditPassageView.as_view()),

    # Endpoints for options
    path('tests/sections/questions/options/add/', AddOptionView.as_view()),
    path('tests/sections/questions/options/edit/<int:pk>/', EditOptionView.as_view()),
    path('tests/sections/questions/options/delete/<int:pk>/', DeleteOptionView),

    # Endpoints for test results
    path('results/tests/graph/<int:pk>/', TestResultGraphView.as_view()),   # Endpoint for Test Result Graph
    # Endpoint for finding test result of a centre within a particular time frame and link to csv for the same
    path('results/tests/<int:pk>/', CentreSpecificTestResultView.as_view()),    # Returns JSON
    path('results/tests/<int:pk>/csv/', CentreSpecificTestResultCSVView.as_view()),    # Returns link to csv

    # Endpoints for student wise test results
    # Result of all tests of a student
    path('results/students/<int:pk>/', StudentTestResultViewSet.as_view({'get': 'list'})),
    # Result of all sections of a test for a student
    path('results/students/<int:stud_pk>/tests/<int:test_pk>/', StudentSectionResultView.as_view({'get': 'list'})),
    # Result of all questions of a section for a student
    path('results/students/<int:stud_pk>/tests/sections/<int:sec_pk>/', StudentQuestionResponseView.as_view({'get': 'list'})),

    # Endpoints for students
    path('users/students/', StudentUserViewSet.as_view({'get': 'list'})),
    path('users/students/detail/<int:pk>/', StudentUserView.as_view()),
    path('users/students/add/', AddStudentUserView.as_view()),
    path('users/students/edit/<int:pk>/', EditStudentUserView.as_view()),
    path('users/students/delete/<int:pk>/', DeleteStudentUser),
    
    # Endpoints for bulk students
    path('users/students/bulk/', BulkStudentsViewSet.as_view({'get': 'list'})),
    path('users/students/bulk/create/', AddBulkStudentsView.as_view()),

    # Endpoint for downloading csv with data of all students 
    # (under a particular superadmin)
    path('getStudentData/', DownloadStudentDataView.as_view()),

    # Staff user endpoints (not being used yet)
    path('staff/add/', AddStaffView.as_view()),
    path('users/staff/', GetStaffUsersView.as_view()),

    # Additional urls for choice fields in UI
    # Lists all subjects - subject_name (course_title_1 + course_title_2 + ...)
    path('subjectChoice/', SubjectChoiceView.as_view({'get': 'list'})),
    # Lists all units belonging to a specific subject
    path('units/<int:pk>/', SubjectSpecificUnitViewSet.as_view({'get': 'list'})),
    # Lists all subjects belonging to comma separated string of courses
    path('subjects/<str:courses>/', CoursesFilteredSubjectViewSet.as_view({'get': 'list'})),


    # -------------------STUDENT APP ENDPOINTS--------------------
    # Home Screen Endpoints
    path('app/profile/update/', CompleteStudentProfileView.as_view()),  # Student updates profile on first time login
    path('app/tests/upcoming/', UpcomingTestsListViewSet.as_view({'get': 'list'})),    # List all unattempted upcoming tests
    path('app/tests/categories/', TestCategoriesListViewSet.as_view({'get': 'list'})),  # List all categories in the home screen
    path('app/tests/practice/category/<int:pk>/detail/', TestCategoryDetailsView.as_view()),  # List details of a category
    path('app/tests/practice/category/<int:pk>/', TestCategoryDetailsViewSet.as_view({'get': 'list'})),  # List tests in a category

    # Unit Wise Test Endpoints
    path('app/subjects/', SubjectListViewSet.as_view({'get': 'list'})),     # List all subjects
    path('app/subjects/<int:pk>/detail/', SubjectInfoView.as_view()),     # Details of a particular subject
    path('app/units/<int:pk>/', UnitsListViewSet.as_view({'get': 'list'})),     # List all units of a subject
    path('app/tests/practice/category/unitWise/<int:pk>/', UnitWiseTestsListViewSet.as_view({'get': 'list'})),  # List tests of a unit

    # Test Attempt Endpoints (same for upcoming and practice)
    path('app/tests/<int:pk>/detail/', TestDetailView.as_view()),    # Test detail view
    path('app/tests/<int:pk>/submit/', TestSubmitView.as_view()),    # For storing responses of the test

    # Test Result Endpoints
    path('app/tests/<int:pk>/result/', TestResultView.as_view()),    # Test result view

    # Question Wise Test Result Endpoints
    path('app/tests/<int:pk>/result/questionWiseAnalysis/', TestAnalytics.as_view()),    # Show sections of a question
    path('app/tests/<int:test_pk>/result/questionWiseAnalysis/section/<int:sec_pk>/', SectionAnalysis.as_view()),  # Show ques of sec
    # Show question/passage details and question/passage result
    path('app/tests/<int:test_pk>/result/questionWiseAnalysis/section/<int:sec_pk>/question/<int:ques_pk>/', QuestionAnalysis.as_view()),
    path('app/tests/<int:test_pk>/result/questionWiseAnalysis/section/<int:sec_pk>/passage/<int:pass_pk>/', PassageAnalysis.as_view()),

    # For test result tab
    path('app/result/tests/list/', TestResultListViewSet.as_view({'get': 'list'})),  # List all attempted tests of a particular test type
    path('app/result/tests/<int:pk>/rankList/', TestRankList.as_view({'get': 'list'})),  # Rank list of a particular test

    # ---------------------COMMON ENDPOINTS-----------------------
    # This is for browsable api login/logout
    path('api-auth/', include('rest_framework.urls')),
]
