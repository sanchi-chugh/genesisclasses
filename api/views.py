from django.shortcuts import render, Http404
from api.serializers import *
from rest_framework.generics import UpdateAPIView, ListAPIView, CreateAPIView
from api.models import Student, Centre, Course, User
from rest_framework.views import APIView
from api.models import Student, Centre, Test, Question, Section, Option
from rest_framework import viewsets, permissions, filters
from api.utils import parser
from rest_framework.response import Response
from django.core.mail import send_mail, EmailMessage
from .permissions import *
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from rest_framework.status import HTTP_400_BAD_REQUEST
from django.core.validators import validate_email, ValidationError
from django.db.models import Q
from test_series.settings import DOMAIN, MEDIA_ROOT
from .paginators import *
from .docparser import *
from pathlib import Path
import datetime
import json
import uuid
import os
import shutil

# Helper func to get super admin of a user
def get_super_admin(user):
    type_of_user = user.type_of_user
    if type_of_user == 'student':
        super_admin = user.student.centre.super_admin
    elif type_of_user == 'staff':
        super_admin = user.staff.super_admin
    else:
        super_admin = user.superadmin
    return super_admin

# Helper func to give error response if compulsory fields are missing
def fields_check(fields_arr, data):
    missing_fields = []
    for field in fields_arr:
        if field not in data:
            missing_fields.append(field)
        elif data[field] == '' or data[field] == None:
            missing_fields.append(field)

    # Return True if check passes
    if len(missing_fields) == 0:
        return (True, '')

    # Form errors dictionary
    errorDict = {}
    for field in missing_fields:
        errorDict[field] = ['This field is required.']
    return (False, Response(errorDict, status=HTTP_400_BAD_REQUEST))

# Helper function to set value as None if field value is not present
def set_optional_fields(fields_arr, data):
    dictV = {}
    for field in fields_arr:
        dictV[field] = None
        if field in data:
            if data[field]:
                dictV[field] = data[field]
    return dictV

# Helper func to check if the field is bool or not
# Converts string of ('true', 'false') into boolean value
def check_for_bool(fields_arr, data):
    bool_dict = {}
    wrong_fields = []
    for field in fields_arr:
        if data[field] == 'false':
            bool_dict[field] = False
        elif data[field] == 'true':
            bool_dict[field] = True
        elif data[field] not in (True, False):
            wrong_fields.append(field)
    if len(wrong_fields) == 0:
        return (bool_dict, True, '')

    # Form errors dictionary
    errorDict = {}
    for field in wrong_fields:
        errorDict[field] = ['Incorrect field type. Please provide boolean value ("true" or "false").']
    return ({}, False, Response(errorDict, status=HTTP_400_BAD_REQUEST))

# Helper function to check whether date field data is correct or not
def check_for_date(fields_arr, data):
    wrong_fields = []
    for field in fields_arr:
        # Error if date is not in string format
        if type(data[field]) != str:
            wrong_fields.append(field)
        else:
            # Error if date format is incorrect
            try:
                datetime.datetime.strptime(data[field], '%Y-%m-%d')
            except ValueError:
                wrong_fields.append(field)
    if len(wrong_fields) == 0:
        return (True, '')
    
    # Form errors dictionary
    errorDict = {}
    for field in wrong_fields:
        errorDict[field] = ['Incorrect date format. Please provide "YYYY-MM-DD" format.']
    return (False, Response(errorDict, status=HTTP_400_BAD_REQUEST))

# Helper function to send email
def send_email(subject, content, recipient_list):
    email_from = settings.EMAIL_HOST_USER
    mail = EmailMessage(subject, content, email_from, recipient_list)
    mail.content_subtype = 'html'
    mail.send()

# Helper function to validate new password
def check_passwd_strength(data):
    # check if passwords match
    if data['password1'] != data['password2']:
        return (False, Response({'password2': ["Provided passwords do NOT match."]},
            status=HTTP_400_BAD_REQUEST))

    errors = []
    password = data['password1']

    # check for length
    if len(password) < 8:
        errors.append("Password must be at least 8 characters long.")

    # check for digit
    if not any(char.isdigit() for char in password):
        errors.append("Password must contain at least 1 digit.")

    # check for letter
    if not any(char.isalpha() for char in password):
        errors.append("Password must contain at least 1 letter.")

    if len(errors) == 0:
        return (True, '')
    return (False, Response({'password1': errors}, status=HTTP_400_BAD_REQUEST))

# Get academic year acc to provided date_str
def get_academic_yr(date_str):
    date_str_arr = date_str.split('-')
    date_month = date_str_arr[1]

    # Academic year is defined from April 1 of 1st yr to March 31 of 2nd yr
    if int(date_month) < 4:
        date_str_arr[0] = str(int(date_str_arr[0]) - 1)

    start_date = date_str_arr[0] + '-04-01'
    end_date = str(int(date_str_arr[0]) + 1) + '-03-31'

    return (start_date, end_date)

# -------------------VIEWS FOR CHOICEs-------------------------
# Shows all subjects of superadmin in the format
# subject_name (course_title_1 + course_title_2 + ...)
class SubjectChoiceView(viewsets.ReadOnlyModelViewSet):
    model = Subject
    serializer_class = SubjectChoiceSerializer
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )
    
    def get_queryset(self):
        super_admin = get_super_admin(self.request.user)
        return self.model.objects.filter(super_admin=super_admin).order_by('title')

# -------------------SUPER ADMIN VIEWS-------------------------
# Shows details for superadmin dashboard home page
class DashboardHomeView(APIView):
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )

    def get(self, request, *args, **kwargs):
        dictV = {}
        super_admin = get_super_admin(self.request.user)
        today_date = datetime.datetime.today().strftime('%Y-%m-%d')

        # Data to be shown on top of dashboard
        dictV['studentsWithAccess'] = Student.objects.filter(centre__super_admin=super_admin, endAccessDate__gte=today_date).count()
        dictV['totalStudentsTillDate'] = Student.objects.filter(centre__super_admin=super_admin).count()
        dictV['activeTests'] = Test.objects.filter(super_admin=super_admin, active=True).count()
        dictV['inactiveTests'] = Test.objects.filter(super_admin=super_admin, active=False).count()
        dictV['courses'] = Course.objects.filter(super_admin=super_admin).count()
        dictV['centres'] = Centre.objects.filter(super_admin=super_admin).count()

        # Course Pie Chart details
        courseObjs = Course.objects.filter(super_admin=super_admin)
        coursesData = CoursePieChartSerializer(courseObjs, many=True).data

        # Get total number of subjects in all courses (may include duplicates)
        totalSubjs = 0
        for course in coursesData:
            totalSubjs += len(course['subjects'])

        # Add area to be covered by this course in the pie chart
        for course in coursesData:
            course['subjects_number'] = len(course['subjects'])
            course['percentage_area'] = round((len(course['subjects'])/totalSubjs)*100, 2)

        dictV['coursePieChartDetails'] = coursesData
        return Response({"status": "successful", "details": dictV})

# Return data for centre pie chart (number of students centre wise)
class CentrePieChartView(APIView):
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )

    def get(self, request, *args, **kwargs):
        params_dict = self.request.GET

        # Get optional parameters
        op_dict = set_optional_fields(['start_date', 'end_date'], params_dict)

        # Get parameters in a list
        params_list = []
        if op_dict['start_date']:
            params_list.append('start_date')
        if op_dict['end_date']:
            params_list.append('end_date')

        # Return if date format is incorrect
        valid_date, result = check_for_date(params_list, params_dict)
        if not valid_date:
            return result

        # Get parameters
        start_date = None
        end_date = None
        if 'start_date' in params_list:
            start_date = op_dict['start_date']
        if 'end_date' in params_list:
            end_date = op_dict['end_date']

        # Get start_date and end_date according to provided data
        if not start_date and not end_date:
            # Get start_date and end_date acc to current date
            curr_date = datetime.datetime.today().strftime('%Y-%m-%d')
            curr_date_yr = curr_date.split('-')[0]
            start_date = curr_date_yr + '-01-01'    # Jan 1 of the ongoing yr
            end_date = curr_date_yr + '-12-31'    # Dec 31 of the ongoing yr
        elif start_date and not end_date:
            # If only start_date given, set end_date one year ahead
            start_date_arr = start_date.split('-')
            start_date_arr[0] = str(int(start_date_arr[0]) + 1)
            end_date = '-'.join(start_date_arr)
        elif not start_date and end_date:
            # If only end_date given, set start_date one year before start_date
            end_date_arr = end_date.split('-')
            end_date_arr[0] = str(int(end_date_arr[0]) - 1)
            start_date = '-'.join(end_date_arr)
        else:
            # If both start date and end date are provided
            if start_date > end_date:
                # Error if start_date is greater than end_date
                return Response({"end_date": ["End date must come after the Start date."]},
                    status=HTTP_400_BAD_REQUEST)
        
        # Get centre pie chart data according to start_date and end_data
        super_admin = get_super_admin(self.request.user)
        centreObjs = Centre.objects.filter(super_admin=super_admin)
        studentCentreData = CentrePieChartSerializer(
            centreObjs, many=True, context={'start_date': start_date, 'end_date': end_date}).data

        # Add start_date and end_date to result
        dictV = {}
        dictV['pieChartData'] = studentCentreData
        dictV['start_date'] = datetime.datetime.strptime(start_date, '%Y-%m-%d').strftime('%b %d, %Y')
        dictV['end_date'] = datetime.datetime.strptime(end_date, '%Y-%m-%d').strftime('%b %d, %Y')
        dictV['total_students'] = Student.objects.filter(
            centre__super_admin=super_admin, joiningDate__gte=start_date, joiningDate__lte=end_date).count()

        return Response({"status": "successful", "detail": dictV})

# Get overall topper details
class TopperDetailsView(APIView):
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )

    def get(self, request, *args, **kwargs):
        params_dict = self.request.GET

        # Get optional parameters
        op_dict = set_optional_fields(['start_date', 'end_date', 'centre', 'course', 'test_type'], params_dict)

        # Get parameters in a list
        params_list = []
        if op_dict['start_date']:
            params_list.append('start_date')
        if op_dict['end_date']:
            params_list.append('end_date')

        # Return if date format is incorrect
        valid_date, result = check_for_date(params_list, params_dict)
        if not valid_date:
            return result

        # Return if test_type is incorrect
        if op_dict['test_type'] not in (None, 'all', 'practice', 'upcoming'):
            return Response({"test_type": ["Test type must be one of (practice, upcoming, all)."]},
                status=HTTP_400_BAD_REQUEST)

        # Get parameters
        start_date = None
        end_date = None
        if 'start_date' in params_list:
            start_date = op_dict['start_date']
        if 'end_date' in params_list:
            end_date = op_dict['end_date']

        centre = op_dict['centre']
        course = op_dict['course']
        test_type = op_dict['test_type']

        if not start_date and not end_date:
            # Get academic yr acc to current date
            curr_date = datetime.datetime.today().strftime('%Y-%m-%d')
            (start_date, end_date) = get_academic_yr(curr_date)
        elif start_date and not end_date:
            # Get academic yr acc to start_date
            (start_date, end_date) = get_academic_yr(start_date)
        elif not start_date and end_date:
            # Get academic yr acc to end_date
            (start_date, end_date) = get_academic_yr(end_date)
        else:
            # If both start date and end date are provided
            if start_date > end_date:
                # Error if start_date is greater than end_date
                return Response({"end_date": ["End date must come after the Start date."]},
                    status=HTTP_400_BAD_REQUEST)

        # Get test result objs acc to provided params
        super_admin = get_super_admin(self.request.user)
        UserTestResultObjs = UserTestResult.objects.filter(
            test__super_admin=super_admin, testAttemptDate__gte=start_date, testAttemptDate__lte=end_date)
        if centre not in ('0', None):
            UserTestResultObjs = UserTestResultObjs.filter(student__centre__id=int(centre))
        if course not in ('0', None):
            UserTestResultObjs = UserTestResultObjs.filter(student__course__id=int(course))
        if test_type not in ('all', None):
            UserTestResultObjs = UserTestResultObjs.filter(test__typeOfTest=test_type)

        # Get students' aggregate percentage and test attempts data
        students_filtered = []
        students_result = []
        for resultObj in UserTestResultObjs:
            student = resultObj.student
            if student not in students_filtered:
                studentResultObjs = UserTestResultObjs.filter(student=student)
                tests_attempted = studentResultObjs.count()

                # Get aggregate percentage of the student
                total_perc = 0
                for obj in studentResultObjs:
                    total_perc += (obj.marksObtained/obj.test.totalMarks)
                total_perc = round((total_perc/tests_attempted)*100, 2)

                students_result.append([student, tests_attempted, total_perc])
                students_filtered.append(student)

        students_result.sort(key=lambda x:x[2], reverse=True)     # Sort according to total percentage
        toppers_result = students_result[:10]       # Get first 10 percentage holders

        # Convert obj data into JSON
        dictV = {}
        topper_data = []
        for result in toppers_result:
            student_details = NestedStudentSerializer(result[0]).data
            topper_data.append({
                'student': student_details, 'tests_attempted': result[1], 'aggregate_percentage': result[2]})
        dictV['toppers'] = topper_data

        # Send params with result
        dictV['start_date'] = datetime.datetime.strptime(start_date, '%Y-%m-%d').strftime('%b %d, %Y')
        dictV['end_date'] = datetime.datetime.strptime(end_date, '%Y-%m-%d').strftime('%b %d, %Y')

        # Use defaults for missing parameters
        dictV['centre'] = 0
        if centre:
            dictV['centre'] = int(centre)

        dictV['course'] = 0
        if course:
            dictV['course'] = int(course)
        
        dictV['test_type'] = 'all'
        if test_type:
            dictV['test_type'] = test_type

        return Response({"status": "successful", "detail": dictV})

# Shows list of students (permitted to a superadmin only)
class StudentUserViewSet(viewsets.ReadOnlyModelViewSet):
    model = Student
    serializer_class = StudentUserSerializer
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )
    pagination_class = StandardResultsSetPagination
    # Making endpoint searchable
    filter_backends = (filters.SearchFilter, )
    search_fields = ('centre__location', 'course__title', 'first_name', 'last_name', '=contact_number', 'user__email')

    def get_queryset(self):
        super_admin = get_super_admin(self.request.user)
        centreObjs = Centre.objects.filter(super_admin=super_admin)
        students = self.model.objects.filter(centre__in=centreObjs).order_by('-pk')
        return students

# Shows detail of a student
class StudentUserView(APIView):
    model = Student
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )

    def get(self, request, *args, **kwargs):
        super_admin = get_super_admin(self.request.user)
        student_id = kwargs['pk']
        student = get_object_or_404(self.model, centre__super_admin=super_admin, pk=student_id)
        studentData = StudentUserSerializer(student, context={'request': request}).data
        return Response({'status': 'successful', 'detail': studentData})

# Adds a student for the requested superadmin
class AddStudentUserView(CreateAPIView):
    model = Student
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )

    def post(self, request, *args, **kwargs):
        super_admin = get_super_admin(self.request.user)
        data = request.data

        # Search for missing fields
        check_pass, result = fields_check([
            'first_name', 'last_name', 'contact_number', 
            'email', 'centre', 'course', 'endAccessDate', 'joiningDate'], data)
        if not check_pass:
            return result

        # Return if endAccessDate or joiningDate is in incorrect date format
        valid_date, result = check_for_date(['endAccessDate', 'joiningDate'], data)
        if not valid_date:
            return result

        errorDict = {}
        email = data['email']

        # Validate email id
        try:
            validate_email(email)
        except ValidationError:
            errorDict['email'] = ["Provided email id is invalid."]

        # Validate contact number
        valid_contact = True
        try:
            contact_number = int(data['contact_number'])
        except ValueError:
            valid_contact = False

        if len(data['contact_number']) != 10 or not valid_contact:
            errorDict['contact_number'] = ["Provided contact number is invalid. Exact 10 digits are allowed."]

        # Do not form another student with the same email id
        userObjs = User.objects.filter(email=email, type_of_user='student')
        if(len(userObjs) != 0):
            errorDict['email'] = ["A student with the same email id already exists."]

        centre = get_object_or_404(Centre, pk=int(data['centre']), super_admin=super_admin)

        # Make course array for student access
        courses = data['course'].split(',')
        courses_arr = []
        for course_id in courses:
            try:
                course = Course.objects.get(pk=int(course_id))
                courses_arr.append(course)
            except Course.DoesNotExist:
                pass
        # Return if student can't access any course
        if len(courses_arr) == 0:
            errorDict['course'] = ["Please provide at least one valid course."]

        # Return errors
        if len(errorDict) != 0:
            return Response(errorDict, status=HTTP_400_BAD_REQUEST)

        # Get unique username
        try:
            last_student = Student.objects.all().order_by('-pk')[0]
            new_pk = last_student.pk + 1
        except IndexError:
            new_pk = 0
        username = 'Student' + str(new_pk)

        # Change username if another user of the same username already exists
        existing_usernames = [user['username'] for user in User.objects.values('username')]
        while username in existing_usernames:
            username = uuid.uuid4().hex[:8]

        # Make user for authentication
        # (correspoding student is automatically created)
        user = User.objects.create(
            email=email,
            type_of_user='student',
            username=username,
        )
        password = uuid.uuid4().hex[:8].lower()
        user.set_password(password)
        user.save()

        # Add info to corresponding student obj
        student, _ = self.model.objects.get_or_create(user=user)
        student.endAccessDate = data['endAccessDate']
        student.joiningDate = data['joiningDate']
        student.first_name = data['first_name']
        student.last_name = data['last_name']
        student.contact_number = contact_number
        student.centre = centre
        student.course.set(courses_arr)
        student.save()
        
        # Add rest of the values
        op_dict = set_optional_fields(
            ['father_name', 'address', 'city', 'state', 'pinCode', 'gender', 'dateOfBirth', 'image'], data)

        student.father_name = op_dict['father_name']
        student.address = op_dict['address']
        student.city = op_dict['city']
        student.state = op_dict['state']
        student.pinCode = op_dict['pinCode']
        student.gender = op_dict['gender']
        student.dateOfBirth = op_dict['dateOfBirth']
        student.image = op_dict['image']   
        student.save()

        # Send registration email with username and password
        subject = "Genesis Classes Registration"
        content = """
            <p>Hi {}</p>
            <p>Congratulations on your enrollment in Genesis Classes. You can login to {} with the following credentials -</p>
            <p>username: <b>{}</b><br>
            password: <b>{}</b></p>
            <p>Please login to complete your profile and enjoy the amazing learning experience.</p>
            Regards<br>
            Genesis Classes Team
        """.format(data['first_name'], DOMAIN, username, password)
        send_email(subject, content, [email])   # Send mail

        return Response({"status": "successful"})

# Edit a student belonging to a centre of the respective super admin
class EditStudentUserView(UpdateAPIView):
    model = Student
    serializer_class = StudentUserSerializer
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )

    def get_queryset(self):
        super_admin = get_super_admin(self.request.user)
        centreObjs = Centre.objects.filter(super_admin=super_admin)
        students = self.model.objects.filter(centre__in=centreObjs).order_by('-pk')
        return students

    def put(self, request, *args, **kwargs):
        studentID = kwargs['pk']
        studentObj = Student.objects.get(pk=studentID)
        studentUserObj = User.objects.get(pk=studentObj.user.id)
        super_admin = get_super_admin(self.request.user)
        data = request.data

        # Search for missing fields
        check_pass, result = fields_check([
            'first_name', 'last_name', 'contact_number', 
            'email', 'centre', 'course', 'endAccessDate', 'joiningDate'], data)
        if not check_pass:
            return result

        # Return if endAccessDate or joiningDate is in incorrect date format
        valid_date, result = check_for_date(['endAccessDate', 'joiningDate'], data)
        if not valid_date:
            return result

        errorDict = {}
        email = data['email']

        # Validate email id
        try:
            validate_email(email)
        except ValidationError:
            errorDict['email'] = ["Provided email id is invalid."]

        # Validate contact number
        valid_contact = True
        try:
            _ = int(data['contact_number'])
        except ValueError:
            valid_contact = False

        if len(data['contact_number']) != 10 or not valid_contact:
            errorDict['contact_number'] = ["Provided contact number is invalid. Exact 10 digits are allowed."]

        # Do not form another student with the same email id
        if email != studentUserObj.email:
            userObjs = User.objects.filter(email=email, type_of_user='student')
            if len(userObjs) != 0:
                errorDict['email'] = ["A student with the same email id already exists."]

        centre = get_object_or_404(Centre, pk=int(data['centre']), super_admin=super_admin)

        # Make course array for student access
        courses = data['course'].split(',')
        courses_arr = []
        for course_id in courses:
            try:
                course = Course.objects.get(pk=int(course_id))
                courses_arr.append(course)
            except Course.DoesNotExist:
                pass
        # Return if student can't access any course
        if len(courses_arr) == 0:
            errorDict['course'] = ["Please provide at least one valid course."]

        # Return errors
        if len(errorDict) != 0:
            return Response(errorDict, status=HTTP_400_BAD_REQUEST)

        # Update email and courses, if valid
        studentUserObj.email = email
        studentUserObj.save()
        studentObj.course.set(courses_arr)
        studentObj.save()

        # Update centre of the user
        if studentObj.centre != centre:
            studentObj.centre = centre
            studentObj.save()

        # Remove previous image from system
        if studentObj.image and 'image' in data:
            os.remove(studentObj.image.file.name)
            studentObj.image = None
            studentObj.save()

        self.partial_update(request, *args, **kwargs)

        return Response({'status': 'successful'})

# Delete a student
@api_view(['DELETE'])
@permission_classes((permissions.IsAuthenticated, IsSuperadmin, ))
def DeleteStudentUser(request, pk):
    studentObj = get_object_or_404(Student, pk=pk)
    studentObj.delete()
    return Response({'status': 'successful'})

class BulkStudentsViewSet(viewsets.ReadOnlyModelViewSet):
    model = BulkStudentsCSV
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )
    pagination_class = StandardResultsSetPagination
    serializer_class = BulkStudentsSerializer
    # Making endpoint searchable
    filter_backends = (filters.SearchFilter, )
    search_fields = ('centre__location', 'course__title')

    def get_queryset(self):
        super_admin = get_super_admin(self.request.user)
        centres = Centre.objects.filter(super_admin=super_admin)
        queryset = self.model.objects.filter(centre__in=centres).order_by('-pk')
        return queryset

# Add bulk students and save the list in a csv
class AddBulkStudentsView(CreateAPIView):
    model = BulkStudentsCSV
    serializer_class = BulkStudentsSerializer
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )

    def post(self, request, *args, **kwargs):
        data = request.data

        # Search for missing fields
        check_pass, result = fields_check([
            'number', 'endAccessDate', 'joiningDate', 'centre', 'course'], data)
        if not check_pass:
            return result

        # Return if endAccessDate or joiningDate is in incorrect date format
        valid_date, result = check_for_date(['endAccessDate', 'joiningDate'], data)
        if not valid_date:
            return result

        n = int(data['number'])  # Number of students
        centre = Centre.objects.get(pk=int(data['centre']))  # Centre

        # Make courses array
        courses = data['course'].split(',')
        courses_arr = []
        for course_id in courses:
            try:
                course = Course.objects.get(pk=int(course_id))
                courses_arr.append(course)
            except Course.DoesNotExist:
                pass
        # Return if no course access is granted
        if len(courses_arr) == 0:
            return Response({'course': ['Please provide at least one valid course.']},
                status=HTTP_400_BAD_REQUEST)

        # Make studentCSVs directory if it does not exist
        directory = MEDIA_ROOT + '/studentCSVs/'
        if not os.path.exists(directory):
            os.makedirs(directory)

        # Create a unique filename
        filename = str(uuid.uuid4()) + '.csv'
        csvFile = open(directory + filename, 'w')
        csvFile.write('Username,Password\n')

        # Create bulk students
        count = 0
        existing = [user['username'] for user in User.objects.values('username')]

        try:
            last_st = Student.objects.all().order_by('-pk')[0]
            last_pk = last_st.pk
        except IndexError:
            last_pk = -1
        cur_pk = last_pk + 1

        while count < n:
            username = 'Student' + str(cur_pk)
            cur_pk += 1
            password = uuid.uuid4().hex[:8].lower()

            if username in existing:
                # Provide random username if username 
                # of the form Student<pk> already exists
                username = uuid.uuid4().hex[:8]
                while username in existing:
                    username = uuid.uuid4().hex[:8]

            existing.append(username)

            # Create user of type student
            user = User.objects.create(username=username, type_of_user="student")
            user.set_password(password)
            user.save()

            # Set corresponding student courses, centres, endAccessDate and joiningDate
            studentObj = Student.objects.get(user=user)
            studentObj.endAccessDate = data['endAccessDate']
            studentObj.joiningDate = data['joiningDate']
            studentObj.centre = centre
            studentObj.course.set(courses_arr)
            studentObj.save()

            # Add username and password to csv file
            csvFile.write(username + ',' + password + '\n')
            count += 1

        csvFile.close()

        # Make BulkStudentsCSV model object and save csv to it
        bulkCSVObj = self.model.objects.create(
            csv_file='studentCSVs/' + filename,
            centre=centre,
            number=n,
            endAccessDate=data['endAccessDate']
        )
        bulkCSVObj.course.set(courses_arr)
        bulkCSVObj.save()
        return Response({"status": "successful"})

# Generate csv containing all student data
class DownloadStudentDataView(APIView):
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )

    def get(self, request, *args, **kwargs):
        super_admin = get_super_admin(self.request.user)

        # Make directory having all csv of student data of an admin
        directory = MEDIA_ROOT + '/allStudentCSV/'
        if not os.path.exists(directory):
            os.makedirs(directory)

        path = directory + 'student_data.csv'
        csvFile = open(path, 'w')
        csvFile.write('Name,Contact Number,email,Profile Photo,Centre,Courses Enrolled,Student Joining Date,App Access End Date,'
            'Gender,Date of Birth,Father\'s Name,Address,City,State,Pin Code\n')

        centres = Centre.objects.filter(super_admin=super_admin)
        students = Student.objects.filter(centre__in=centres)
        for student in students:
            name = ''
            if student.first_name:
                name += student.first_name
            if student.last_name:
                name +=  ' ' + student.last_name

            contact = ''
            if student.contact_number:
                contact = str(student.contact_number)

            email = student.user.email
            centre = student.centre.location
            
            courses_arr = []
            courses = student.course.all()
            for course in courses:
                courses_arr.append(course.title)
            courses = ' | '.join(courses_arr)

            gender = ''
            if student.gender:
                gender = student.gender
            
            dateOfBirth = ''
            if student.dateOfBirth:
                dateOfBirth = datetime.datetime.strptime(str(student.dateOfBirth), '%Y-%m-%d').strftime('%b %d %Y')
            
            endAccessDate = datetime.datetime.strptime(str(student.endAccessDate), '%Y-%m-%d').strftime('%b %d %Y')

            joiningDate = datetime.datetime.strptime(str(student.joiningDate), '%Y-%m-%d').strftime('%b %d %Y')
            
            father_name = ''
            if student.father_name:
                father_name = student.father_name
            
            address = ''
            if student.address:
                address = student.address
            
            city = ''
            if student.city:
                city = student.city
            
            state = ''
            if student.state:
                state = student.state
            
            pinCode = ''
            if student.pinCode:
                pinCode = str(student.pinCode)

            pic = ''
            if student.image:
                pic = DOMAIN + student.image.url[1:]

            csvFile.write(
                name.replace(',', '|') + ',' + contact.replace(',', '|') + ',' + email.replace(',', '|') + ',' + pic.replace(',', '|') +
                ',' + centre.replace(',', '|')  + ',' + courses.replace(',', '|') + ',' + joiningDate.replace(',', '|') +
                ',' + endAccessDate.replace(',', '|')  + ',' + gender.replace(',', '|') + ',' + dateOfBirth.replace(',', '|')  +
                ',' + father_name.replace(',', '|')  + ',' + address.replace(',', '|') + ',' + city.replace(',', '|')  +
                ',' + state.replace(',', '|')  + ',' + pinCode.replace(',', '|') + '\n'
            )

        csvFile.close()
        absolute_path = DOMAIN + 'media/allStudentCSV/student_data.csv'
        return Response({'status': 'successful', 'csvFile': absolute_path})

# Shows list of centres (permitted to a superadmin only)
class CentreViewSet(viewsets.ReadOnlyModelViewSet):
    model = Centre
    serializer_class = CentreSerializer
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )

    def get_queryset(self):
        super_admin = get_super_admin(self.request.user)
        queryset = self.model.objects.filter(super_admin=super_admin).order_by('-pk')
        return queryset

# Adds a centre for the requested superadmin
class AddCentreView(CreateAPIView):
    model = Centre
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )

    def post(self, request, *args, **kwargs):
        super_admin = get_super_admin(self.request.user)

        # Search for missing fields
        check_pass, result = fields_check(['location'], request.data)
        if not check_pass:
            return result

        location = request.data['location']

        # Do not form another centre obj with already existing location
        centreObjs = Centre.objects.filter(location=location, super_admin=super_admin)
        if(len(centreObjs) != 0):
            return Response({'location': ['Centre with the same location already exists.']},
                status=HTTP_400_BAD_REQUEST)
        Centre.objects.create(location=location, super_admin=super_admin)
        return Response({"status": "successful"})

# Update centre for the required superadmin
class EditCentreView(UpdateAPIView):
    model = Centre
    serializer_class = CentreSerializer
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )

    # This is required so that django knows from where to get the obj
    def get_queryset(self):
        super_admin = get_super_admin(self.request.user)
        queryset = self.model.objects.filter(super_admin=super_admin)
        return queryset

    def put(self, request, *args, **kwargs):
        pk = kwargs['pk']

        # Search for missing fields
        check_pass, result = fields_check(['location'], request.data)
        if not check_pass:
            return result

        location = request.data['location']

        # Do not form another centre obj with already existing location
        centre = get_object_or_404(Centre, pk=int(pk))
        super_admin = get_super_admin(self.request.user)
        centreObjs = self.model.objects.filter(location=location, super_admin=super_admin)
        if len(centreObjs) != 0 and centre not in centreObjs:
            return Response({'location': ['Centre with the same location already exists.']},
                status=HTTP_400_BAD_REQUEST)

        self.partial_update(request, *args, **kwargs)
        return Response({ "status": "successful" })

# Delete centre under a particular admin
@api_view(['DELETE'])
@permission_classes((permissions.IsAuthenticated, IsSuperadmin, ))
def deleteCentre(request, pk):
    centreObj = get_object_or_404(Centre, pk=pk)
    transfer_centre = request.data.get('centre')
    if transfer_centre:
        # If Staff and students have to be shifted to another centre
        # Gives 404 if transfer_centre does not exist
        transfer_centre = get_object_or_404(Centre, pk=int(transfer_centre))
        staffObjs = Staff.objects.filter(centre=centreObj)
        for staffObj in staffObjs:
            staffObj.centre = transfer_centre
            staffObj.save()
        studentObjs = Student.objects.filter(centre=centreObj)
        for studentObj in studentObjs:
            studentObj.centre = transfer_centre
            studentObj.save()

    centreObj.delete()
    return Response({'status': 'successful'})

# Shows list of courses under a superadmin
class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    model = Course
    serializer_class = CourseSerializer
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )

    def get_queryset(self):
        super_admin = get_super_admin(self.request.user)
        queryset = self.model.objects.filter(super_admin=super_admin).order_by('-pk')
        return queryset

# Adds a course for the requested superadmin
class AddCourseView(CreateAPIView):
    model = Course
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )

    def post(self, request, *args, **kwargs):
        super_admin = get_super_admin(self.request.user)

        # Search for missing fields
        check_pass, result = fields_check(['title'], request.data)
        if not check_pass:
            return result
        
        title = request.data['title']

        # Do not form another course obj with already existing title
        courseObjs = self.model.objects.filter(title=title, super_admin=super_admin)
        if(len(courseObjs) != 0):
            return Response({'title': ['Course with the same title already exists.']},
                status=HTTP_400_BAD_REQUEST)
        self.model.objects.create(title=title, super_admin=super_admin)
        return Response({"status": "successful"})

# Update course for the requested superadmin
class EditCourseView(UpdateAPIView):
    model = Course
    serializer_class = CourseSerializer
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )

    def get_queryset(self):
        super_admin = get_super_admin(self.request.user)
        queryset = self.model.objects.filter(super_admin=super_admin)
        return queryset

    def put(self, request, *args, **kwargs):
        pk = kwargs['pk']

        # Search for missing fields
        check_pass, result = fields_check(['title'], request.data)
        if not check_pass:
            return result
        
        title = request.data['title']

        # Do not form another course obj with already existing title
        course = get_object_or_404(Course, pk=int(pk))
        super_admin = get_super_admin(self.request.user)
        courseObjs = self.model.objects.filter(title=title, super_admin=super_admin)
        if len(courseObjs) != 0 and course not in courseObjs:
            return Response({'title': ['Course with the same title already exists.']},
                status=HTTP_400_BAD_REQUEST)

        self.partial_update(request, *args, **kwargs)
        return Response({ "status": "successful" })

# Delete course under a particular admin
@api_view(['DELETE'])
@permission_classes((permissions.IsAuthenticated, IsSuperadmin, ))
def deleteCourse(request, pk):
    courseObj = get_object_or_404(Course, pk=pk)
    courseObj.delete()
    return Response({'status': 'successful'})

# Shows list of subjects under a superadmin
class SubjectViewSet(viewsets.ReadOnlyModelViewSet):
    model = Subject
    serializer_class = SubjectSerializer
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )

    def get_queryset(self):
        super_admin = get_super_admin(self.request.user)
        queryset = self.model.objects.filter(super_admin=super_admin).order_by('-pk')
        return queryset

# Adds a subject for the requested superadmin
class AddSubjectView(CreateAPIView):
    model = Subject
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )

    def post(self, request, *args, **kwargs):
        super_admin = get_super_admin(self.request.user)
        data = request.data

        # Search for missing fields
        check_pass, result = fields_check(['course', 'title'], request.data)
        if not check_pass:
            return result

        # Do not add subject of the same title, in the same course
        courses = data['course'].split(',')
        title = data['title']
        for course in courses:
            subjectObjs = self.model.objects.filter(
                title=title,
                course=course,
                super_admin=super_admin,
                )
            if len(subjectObjs) != 0:
                return Response({'title': ['Subject with the same title in the same course(s) already exists.']},
                    status=HTTP_400_BAD_REQUEST)

        # Image and description are optional
        op_dict = set_optional_fields(['image', 'description'], data)
        subject = self.model.objects.create(
            title=title,
            description=op_dict['description'],
            image=op_dict['image'],
            super_admin=super_admin,
        )

        # Add courses to subject
        courses = data['course'].split(',')
        courses_arr = []
        for course_id in courses:
            try:
                course = Course.objects.get(pk=int(course_id))
                courses_arr.append(course)
            except Course.DoesNotExist:
                pass
        subject.course.set(courses_arr)
        subject.save()

        return Response({"status": "successful"})

# Update subject for the requested superadmin
class EditSubjectView(UpdateAPIView):
    model = Subject
    serializer_class = SubjectSerializer
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )

    def get_queryset(self):
        super_admin = get_super_admin(self.request.user)
        queryset = self.model.objects.filter(super_admin=super_admin)
        return queryset

    def put(self, request, *args, **kwargs):
        subject_id = kwargs['pk']
        subject = get_object_or_404(Subject, pk=subject_id)
        super_admin = get_super_admin(self.request.user)
        data = request.data

        # Search for missing fields
        check_pass, result = fields_check(['course', 'title'], request.data)
        if not check_pass:
            return result

        # Do not add subject of the same title, in the same course
        courses = data['course'].split(',')
        title = data['title']
        for course in courses:
            subjectObjs = self.model.objects.filter(
                title=title,
                course=course,
                super_admin=super_admin,
                )
            if len(subjectObjs) != 0 and subject not in subjectObjs:
                return Response({'title': ['Subject with the same title in the same course(s) already exists.']},
                    status=HTTP_400_BAD_REQUEST)

        # Remove previous image from system
        if subject.image and 'image' in data:
            os.remove(subject.image.file.name)
            subject.image = None
            subject.save()

        # Change courses
        courses = data['course'].split(',')
        courses_arr = []
        for course_id in courses:
            try:
                course = Course.objects.get(pk=int(course_id))
                courses_arr.append(course)
            except Course.DoesNotExist:
                pass
        subject.course.set(courses_arr)
        subject.save()
        
        # Update rest of the data
        self.partial_update(request, *args, **kwargs)

        return Response({ "status": "successful" })

# Delete subject under a particular admin
@api_view(['DELETE'])
@permission_classes((permissions.IsAuthenticated, IsSuperadmin, ))
def deleteSubject(request, pk):
    subjectObj = get_object_or_404(Subject, pk=pk)
    transfer_subj = request.data.get('subject')
    if transfer_subj:
        # If units have to be shifted to another subject
        transfer_subj = get_object_or_404(Subject, pk=int(transfer_subj))
        unitObjs = Unit.objects.filter(subject=subjectObj)
        for unitObj in unitObjs:
            unitObj.subject = transfer_subj
            unitObj.save()
        # Only those tests which are only unit wise and 
        # don't have any category will be shifted to tranfer_subject
        testObjs = Test.objects.filter(subject=subjectObj)
        for testObj in testObjs:
            if len(testObj.category.all()) == 0:
                testObj.subject = transfer_subj
                testObj.save()
            else:
                testObj.subject = None
                testObj.unit = None
                testObj.save()
    subjectObj.delete()
    return Response({'status': 'successful'})

# Shows list of units under a superadmin
class UnitViewSet(viewsets.ReadOnlyModelViewSet):
    model = Unit
    serializer_class = UnitSerializer
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )
    pagination_class = StandardResultsSetPagination
    # Making endpoint searchable
    filter_backends = (filters.SearchFilter, )
    search_fields = ('title', 'subject__title', 'subject__course__title', 'description')

    def get_queryset(self):
        super_admin = get_super_admin(self.request.user)
        subjects = Subject.objects.filter(super_admin=super_admin)
        units = Unit.objects.filter(subject__in=subjects).order_by('-pk')
        return units

# Shows list of units filtered by subjects
class SubjectWiseUnitViewSet(viewsets.ReadOnlyModelViewSet):
    model = Unit
    serializer_class = SubjectWiseUnitSerializer
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        super_admin = get_super_admin(self.request.user)
        subjects = Subject.objects.filter(super_admin=super_admin)
        return subjects

# Shows list of all units belonging to a particular subject
class SubjectSpecificUnitViewSet(viewsets.ReadOnlyModelViewSet):
    model = Unit
    serializer_class = UnitChoiceSerializer
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )
    
    def get_queryset(self):
        subject_id = self.kwargs['pk']
        return self.model.objects.filter(subject=subject_id).order_by('title')

# Shows list of all subjects belonging to any of the comma separated courses
class CoursesFilteredSubjectViewSet(viewsets.ReadOnlyModelViewSet):
    model = Subject
    serializer_class = SubjectChoiceSerializer
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )
    
    def get_queryset(self):
        courses = self.kwargs['courses'].split(',')
        courses_arr = []
        for course_id in courses:
            try:
                course = Course.objects.get(pk=int(course_id))
                courses_arr.append(course)
            except Course.DoesNotExist:
                pass
        subjects = self.model.objects.filter(course__in=courses_arr).distinct()
        return subjects

# Adds a unit for the requested superadmin
class AddUnitView(CreateAPIView):
    model = Unit
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )

    def post(self, request, *args, **kwargs):
        super_admin = get_super_admin(self.request.user)
        data = request.data

        # Search for missing fields
        check_pass, result = fields_check(['subject', 'title'], data)
        if not check_pass:
            return result

        title = data['title']
        subj_id = data['subject']

        # Raise 404 if subject does not exist
        subject = get_object_or_404(Subject, super_admin=super_admin, pk=int(subj_id))

        # Do not form another unit with already existing title in the same subject
        unitObjs = self.model.objects.filter(title=title, subject=subject)
        if len(unitObjs) != 0:
            return Response({'title': ['Unit with the same title in the same subject already exists.']},
                status=HTTP_400_BAD_REQUEST)

        # Image and description are optional
        op_dict = set_optional_fields(['image', 'description'], data)
        self.model.objects.create(
            title=title,
            image=op_dict['image'],
            description=op_dict['description'],
            subject=subject,
            )
        return Response({'status': 'successful'})

# Edit a unit for the requested superadmin
class EditUnitView(UpdateAPIView):
    model = Unit
    serializer_class = UnitSerializer
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )

    def get_queryset(self):
        super_admin = get_super_admin(self.request.user)
        subjects = Subject.objects.filter(super_admin=super_admin)
        units = Unit.objects.filter(subject__in=subjects)
        return units

    def put(self, request, *args, **kwargs):
        unit_id = kwargs['pk']
        unit = get_object_or_404(Unit, pk=unit_id)
        super_admin = get_super_admin(self.request.user)
        data = request.data

        # Search for missing fields
        check_pass, result = fields_check(['subject', 'title'], data)
        if not check_pass:
            return result

        title = data['title']
        subj_id = data['subject']

        # Raise 404 if subject does not exist
        subject = get_object_or_404(Subject, super_admin=super_admin, pk=int(subj_id))

        # Do not form another unit with already existing title in the same subject
        unitObjs = self.model.objects.filter(title=title, subject=subject)
        if len(unitObjs) != 0 and unit not in unitObjs:
            return Response({'title': ['Unit with the same title in the same subject already exists.']},
                status=HTTP_400_BAD_REQUEST)

        # Remove previous image from system
        if unit.image and 'image' in data:
            os.remove(unit.image.file.name)
            unit.image = None
            unit.save()

        # Update subject
        unit.subject = subject
        unit.save()

        # Update rest of the data
        self.partial_update(request, *args, **kwargs)

        return Response({'status': 'successful'})

# Delete unit of a particular subject
@api_view(['DELETE'])
@permission_classes((permissions.IsAuthenticated, IsSuperadmin, ))
def deleteUnit(request, pk):
    unitObj = get_object_or_404(Unit, pk=pk)
    transfer_unit = request.data.get('unit')
    if transfer_unit:
        # If tests have to be shifted to another unit
        # **for tests belonging to ONLY unit wise category**
        transfer_unit = get_object_or_404(Unit, pk=int(transfer_unit))
        unit_arr = unitObj.subject.units.all()
        if transfer_unit not in unit_arr:
            return Response({'unit': ['Entered unit must belong to the same subject as the unit being deleted.']},
                status=HTTP_400_BAD_REQUEST)
        testObjs = Test.objects.filter(unit=unitObj)
        for testObj in testObjs:
            if len(testObj.category.all()) == 0:
                testObj.unit = transfer_unit
                testObj.save()
            else:
                testObj.subject = None
                testObj.unit = None
                testObj.save()

    unitObj.delete()
    return Response({'status': 'successful'})

# Shows list of test categories under a superadmin
class TestCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    model = Category
    serializer_class = TestCategorySerializer
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )

    def get_queryset(self):
        super_admin = get_super_admin(self.request.user)
        queryset = self.model.objects.filter(super_admin=super_admin).order_by('-pk')
        return queryset

# Adds a test category for the requested superadmin
class AddTestCategoryView(CreateAPIView):
    model = Category
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )

    def post(self, request, *args, **kwargs):
        super_admin = get_super_admin(self.request.user)
        data = request.data

        # Search for missing fields
        check_pass, result = fields_check(['title'], request.data)
        if not check_pass:
            return result
        
        title = data['title']

        # Do not form another test category with same title
        categoryObjs = self.model.objects.filter(title=title, super_admin=super_admin)
        if(len(categoryObjs) != 0):
            return Response({'title': ['Test Category with the same title already exists.']},
                status=HTTP_400_BAD_REQUEST)
        
        # Image and description are optional
        op_dict = set_optional_fields(['image', 'description'], data)
        self.model.objects.create(
            title=title,
            super_admin=super_admin,
            image=op_dict['image'],
            description=op_dict['description'],
        )

        return Response({"status": "successful"})

# Edits a test category for the requested superadmin
class EditTestCategoryView(UpdateAPIView):
    model = Category
    serializer_class = TestCategorySerializer
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )

    def get_queryset(self):
        super_admin = get_super_admin(self.request.user)
        queryset = self.model.objects.filter(super_admin=super_admin).order_by('-pk')
        return queryset

    def put(self, request, *args, **kwargs):
        category_id = kwargs['pk']
        category = get_object_or_404(Category, pk=category_id)
        super_admin = get_super_admin(self.request.user)
        data = request.data

        # Search for missing fields
        check_pass, result = fields_check(['title'], data)
        if not check_pass:
            return result

        title = data['title']

        # Do not form another test category with same title
        categoryObjs = self.model.objects.filter(title=title, super_admin=super_admin)
        if(len(categoryObjs) != 0 and category not in categoryObjs):
            return Response({'title': ['Test Category with the same title already exists.']},
                status=HTTP_400_BAD_REQUEST)

        # Remove previous image from system
        if category.image and 'image' in data:
            os.remove(category.image.file.name)
            category.image = None
            category.save()

        # Update rest of the data
        self.partial_update(request, *args, **kwargs)

        return Response({'status': 'successful'})

# Delete test category of the requested super admin
@api_view(['DELETE'])
@permission_classes((permissions.IsAuthenticated, IsSuperadmin, ))
def deleteTestCategory(request, pk):
    categoryObj = get_object_or_404(Category, pk=pk)
    categoryObj.delete()
    return Response({'status': 'successful'})

# View list of all tests under a superadmin
class TestInfoViewSet(viewsets.ReadOnlyModelViewSet):
    model = Test
    serializer_class = TestInfoSerializer
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )
    pagination_class = StandardResultsSetPagination
    # Making endpoint searchable
    filter_backends = (filters.SearchFilter, )
    search_fields = ('title', '=typeOfTest', 'category__title', 'subject__title', 'unit__title', 'course__title')

    def get_queryset(self):
        super_admin = get_super_admin(self.request.user)
        tests = self.model.objects.filter(super_admin=super_admin).order_by('-pk')
        return tests

# View detailed info of the test under a superadmin
class TestInfoView(APIView):
    model = Test
    serializer_class = TestInfoSerializer
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )

    def get(self, request, *args, **kwargs):
        super_admin = get_super_admin(self.request.user)
        test_id = kwargs['pk']
        test = get_object_or_404(self.model, super_admin=super_admin, pk=test_id)
        testData = TestInfoSerializer(test).data
        return Response({'status': 'successful', 'detail': testData})

# Helper function for adding and editing test info
def validate_test_info(data, super_admin):
    # Search for missing fields
    check_pass, result = fields_check(
        ['title', 'instructions', 'duration', 'typeOfTest', 'description', 'course', 'category', 'active'], data)
    if not check_pass:
        return {}, False, result

    # Return if active is not a bool field
    bool_dict, check_pass, result = check_for_bool(['active'], data)
    if not check_pass:
        return {}, False, result
    active = bool_dict['active']

    errorDict = {}

    # Make courses array
    courses = data['course'].split(',')
    courses_arr = []
    for course_id in courses:
        try:
            course = Course.objects.get(pk=int(course_id))
            courses_arr.append(course)
        except Course.DoesNotExist:
            pass
    # Return if test does not belong to any course
    if len(courses_arr) == 0:
        errorDict['course'] = ['Please provide at least one valid course.']
    
    # Get optional fields' values
    op_dict = set_optional_fields(['subject', 'unit', 'endtime', 'startTime'], data)

    subjectObj = None
    if op_dict['subject']:
        subjectObj = get_object_or_404(Subject, pk=int(data['subject']))
    unitObj = None
    if op_dict['unit']:
        unitObj = get_object_or_404(Unit, pk=int(data['unit']))

    # Either none or both subject and unit are compulsory for adding test
    if (subjectObj and not unitObj):
        errorDict['unit'] = ["Error in adding test to unit wise test. Please provide both \"unit\" and \"subject\"."]
    if (not subjectObj and unitObj):
        errorDict['subject'] = ["Error in adding test to unit wise test. Please provide both \"unit\" and \"subject\"."]

    # Entered unit must belong to the entered subject
    if subjectObj and unitObj:
        unit_arr = subjectObj.units.all()
        if unitObj not in unit_arr:
            errorDict['unit'] = ["Specified unit does not belong to the specified subject."]
        # Add remaining courses of the subject to courses_arr
        subj_courses = subjectObj.course.all()
        for course in subj_courses:
            if course not in courses_arr:
                courses_arr.append(course)

    # Make categories array
    categories = data['category'].split(',')
    categories_arr = []
    for category_id in categories:
        try:
            category = Category.objects.get(pk=int(category_id))
            categories_arr.append(category)
        except Category.DoesNotExist:
            pass
    # Return if test does not belong to any category (not even unit wise category)
    if len(categories_arr) == 0 and not unitObj and not subjectObj:
        errorDict['category'] = ["Please provide at least one valid category."]

    # Set start time and end time
    endtime = op_dict['endtime']
    startTime = timezone.now()
    if op_dict['startTime']:
        startTime = data['startTime']

    # Return error if end time is less than start time
    if endtime and startTime:
        if endtime <= str(startTime):
            errorDict['endtime'] = ["End Time must be greater than start time (and current time)."]

    # Check if type of test has any value other than practice/upcoming
    typeOfTest = data['typeOfTest']
    if typeOfTest not in ('practice', 'upcoming'):
        errorDict['typeOfTest'] = ['"Type of test" must be one of (practice, upcoming).']

    # Return 400 if errors
    if len(errorDict) != 0:
        return ({}, False, Response(errorDict, status=HTTP_400_BAD_REQUEST))

    dictV = {'endtime': endtime, 'startTime': startTime, 'subject': subjectObj, 'unit': unitObj,
             'courses_arr': courses_arr, 'categories_arr': categories_arr, 'active': active}
    return dictV, True, Response({"status": "successful"})

# Parse questions from doc
def parse_doc_ques(testObj):
    doc_path = MEDIA_ROOT + '/' + testObj.doc.name
    parser = Parser(doc_path)
    result = parser.parse()

    if not result:
        # Return error if pandoc was unable to convert doc to html
        # TODO: Figure out the cause of this unexpected error
        msg = """
            There was some unexpected error while parsing the doc, please try again.
            If the same failure occurs repeatedly, then check your internet connection and try again later.
        """
        return False, msg

    if result['status'] == 'error':
        # Return detailed error messages if doc format is incorrect
        errors = '<br>'.join(result['message'])
        msg = ('<b>Error parsing doc, the following errors are found -<br><br></b>' + errors +
            '<br><br><br><br> <b>In case of question not found error, please check if the following rules are followed -</b><br>' +
            '<br>-> Question is of the format <b>Q21.</b> (i.e. (Q)(ques number)(dot))<br>' +
            '<br>-> Options in the <b>previous question</b> are provided in manner -</b> <br>1. <br>2. <br>3. <br>4. <br>' +
            '<br>-> <b>Previous question</b> has the following keys specified: </b>' +
            '<br>Question Type:<br>Answer:<br>Marks:<br>Negative:<br>Explanation:<br>(Please check that there is colon ":" after every key.)')
        return False, msg

    test = result['test']
    sections = test['sections']
    for section in sections:
        sectionObj = Section.objects.create(
            title=section['section'],
            test=testObj,
        )
        # Make passage objs for this section
        # Indices of passageObjs are same as in original passages array
        passages = section['passages']
        passageObjs = []
        for passageText in passages:
            passageObj = Passage.objects.create(
                paragraph=passageText,
                section=sectionObj,
            )
            passageObjs.append(passageObj)
        # Make question objs for this section
        questions = section['questions']
        for ques in questions:
            questionType = ques['questionType']
            # Make question objs according to questionType
            if questionType == 'integer':
                Question.objects.create(
                    questionType=questionType,
                    section=sectionObj,
                    questionText=ques['question'],
                    intAnswer=int(ques['answer'][0]),
                    explanation=ques['explanation'],
                    marksPositive=ques['marks'],
                    marksNegative=ques['negative'],
                    valid=True,     # Integer ques is valid as it does not require options
                )
            else:
                if questionType in ('mcq', 'scq'):
                    quesObj = Question.objects.create(
                        questionType=questionType,
                        section=sectionObj,
                        questionText=ques['question'],
                        explanation=ques['explanation'],
                        marksPositive=ques['marks'],
                        marksNegative=ques['negative'],
                    )
                elif questionType == 'passage':
                    quesObj = Question.objects.create(
                        questionType=questionType,
                        section=sectionObj,
                        questionText=ques['question'],
                        passage=passageObjs[ques['passage']],   # Get passage obj from index number
                        explanation=ques['explanation'],
                        marksPositive=ques['marks'],
                        marksNegative=ques['negative'],
                    )
                # Make option objs if question type is not integer
                options = ques['options']
                answers = ques['answer']
                optionNumber = 1
                for optionText in options:
                    # See if option is correct or not
                    correct = False
                    if optionNumber in answers:
                        correct = True
                    Option.objects.create(
                        optionText=optionText,
                        correct=correct,
                        question=quesObj,
                    )
                    optionNumber += 1
    return True, ''

# Add info of a test from superadmin dashboard
class AddTestInfoView(CreateAPIView):
    model = Test
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )

    def post(self, request, *args, **kwargs):
        super_admin = get_super_admin(self.request.user)
        data = request.data

        # Return if title is missing
        check_pass, result = fields_check(['title'], data)
        if not check_pass:
            return result

        # Do not form another test with the same title
        testObjs = self.model.objects.filter(title=data['title'], super_admin=super_admin)
        if(len(testObjs) != 0):
            return Response({"title": ["Test with the same title already exists."]},
                status=HTTP_400_BAD_REQUEST)

        # Validate and get required values
        dictV, check, response = validate_test_info(data, super_admin)
        if not check:
            return response

        # Get doc value
        op_dict = set_optional_fields(['doc'], data)

        if op_dict['doc']:
            # Only .doc or .docx extensions are allowed
            file_name = str(op_dict['doc'])
            extension = file_name.split(".")[-1].lower()
            if extension not in ('doc', 'docx'):
                return Response({"doc": ["Uploaded doc must be of \".doc\" or \".docx\" format."]},
                    status=HTTP_400_BAD_REQUEST)

            # If docs directory does not exist, then make one
            directory = MEDIA_ROOT + '/docs/'
            if not os.path.exists(directory):
                os.makedirs(directory)

        testObj = self.model.objects.create(
            super_admin=super_admin,
            title=data['title'],
            instructions=data['instructions'],
            duration=data['duration'],
            typeOfTest=data['typeOfTest'],
            description=data['description'],
            endtime=dictV['endtime'],
            startTime=dictV['startTime'],
            subject=dictV['subject'],
            unit=dictV['unit'],
            doc=op_dict['doc'],
            active=dictV['active'],
        )

        # Add courses and categories to the test
        testObj.course.set(dictV['courses_arr'])
        testObj.category.set(dictV['categories_arr'])
        testObj.save()

        # Parse questions from doc
        if op_dict['doc']:
            try:
                # Convert from doc to docx as pandoc can only convert a .docx file
                file_path = MEDIA_ROOT + '/' + testObj.doc.name

                if file_path.endswith('.doc'):
                    # If a docx file with the same name already exists, then rename it
                    if(Path(file_path.replace('.doc', '.docx')).exists()):
                        file_name_path = file_path.replace('.doc', '')
                        new_file_path = file_name_path + '_' + str(uuid.uuid4())[:8]
                        while (Path(new_file_path + '.docx')).exists():
                            new_file_path = file_name_path + '_' + str(uuid.uuid4())[:8]
                        os.rename(file_path, new_file_path + '.doc')    # Rename the file
                        file_path = new_file_path + '.doc'      # Take the renamed file path
                    subprocess.call(['soffice', '--headless', '--convert-to', 'docx', '--outdir', MEDIA_ROOT + '/docs', file_path])
                    os.remove(file_path)    # Remove .doc file
                    testObj.doc = 'docs/' + file_path.split('/')[-1].replace('.doc', '.docx')     # Set testObj doc as new .docx file
                    testObj.save()

                parsed, msg = parse_doc_ques(testObj)
                if not parsed:
                    # Remove doc and its html
                    doc_path = MEDIA_ROOT + '/' + testObj.doc.name
                    html_dir_path = doc_path.replace('.docx', '')
                    shutil.rmtree(html_dir_path)
                    os.remove(doc_path)
                    testObj.delete()
                    return Response({"doc_errors": [msg]}, status=HTTP_400_BAD_REQUEST)

            except Exception:
                msg = ('There was an unexpected error in the doc.' +
                       ' Check if the doc format is correct or contact the developer.')
                # Remove doc and its html
                doc_path = MEDIA_ROOT + '/' + testObj.doc.name
                html_dir_path = doc_path.replace('.docx', '')
                shutil.rmtree(html_dir_path)
                os.remove(doc_path)
                testObj.delete()
                return Response({"doc_errors": [msg.strip()]}, status=HTTP_400_BAD_REQUEST)

        return Response({"status": "successful"})

# Edit test info
class EditTestInfoView(UpdateAPIView):
    model = Test
    serializer_class = TestInfoSerializer
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )

    def get_queryset(self):
        super_admin = get_super_admin(self.request.user)
        tests = self.model.objects.filter(super_admin=super_admin).order_by('-pk')
        return tests

    def put(self, request, *args, **kwargs):
        test_id = kwargs['pk']
        testObj = get_object_or_404(Test, pk=test_id)
        super_admin = get_super_admin(self.request.user)
        data = request.data

        # Return if title is missing
        check_pass, result = fields_check(['title'], data)
        if not check_pass:
            return result

        # Do not form another test with the same title
        testObjs = Test.objects.filter(title=data['title'], super_admin=super_admin)
        if len(testObjs) != 0 and testObj not in testObjs:
            return Response({"title": ["Test with the same title already exists."]},
                status=HTTP_400_BAD_REQUEST)

        # Validate and get required values
        dictV, check, response = validate_test_info(data, super_admin)
        if not check:
            return response

        # Add courses and categories to the test
        testObj.course.set(dictV['courses_arr'])
        testObj.category.set(dictV['categories_arr'])

        # Update rest of the data
        testObj.title = data['title']
        testObj.instructions = data['instructions']
        testObj.duration = data['duration']
        testObj.typeOfTest = data['typeOfTest']
        testObj.description = data['description']
        testObj.endtime = dictV['endtime']
        testObj.startTime = dictV['startTime']
        testObj.subject = dictV['subject']
        testObj.unit = dictV['unit']
        testObj.save()

        # Make sure test is meaningful for the student before making it active
        error_msg = "Therefore, test remains INACTIVE. Rest changes are saved."
        if dictV['active']:
            # Error if the test does not have any sections
            sectionObjs = Section.objects.filter(test=testObj)
            if not sectionObjs.count():
                return Response({"active": ["There are no sections present in this test. " + error_msg]},
                    status=HTTP_400_BAD_REQUEST)

            invalid_ques = []
            quesNumber = 1
            for section in sectionObjs:
                # Error if any section is empty
                questionObjs = Question.objects.filter(section=section)
                if not questionObjs.count():
                    return Response({"active": [("No questions are present in section number " + str(section.sectionNumber) +
                                    " of this test. " + error_msg)]},
                        status=HTTP_400_BAD_REQUEST)

                # Error if there is any invalid question in the test
                for ques in questionObjs:
                    if not ques.valid:
                        invalid_ques.append(quesNumber)
                    quesNumber += 1

            if len(invalid_ques) != 0:
                return Response({"active": [("Question numbers " + ', '.join(str(ques) for ques in invalid_ques) +
                    " of this test is INVALID. Please correct it, then only this test can become active. " + error_msg
                    )]}, status=HTTP_400_BAD_REQUEST)

        testObj.active = dictV['active']
        testObj.save()

        return Response({'status': 'successful'})

# Delete a test
@api_view(['DELETE'])
@permission_classes((permissions.IsAuthenticated, IsSuperadmin, ))
def deleteTest(request, pk):
    testObj = get_object_or_404(Test, pk=pk)
    testObj.delete()
    return Response({'status': 'successful'})

# View sections of a particular test
class SectionsViewSet(viewsets.ReadOnlyModelViewSet):
    model = Section
    serializer_class = TestSectionSerializer
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )

    def get_queryset(self):
        test_id = self.kwargs['pk']
        sections = Section.objects.filter(test__id=test_id).order_by('sectionNumber')
        return sections

# View detail of a particular section
class SectionsView(APIView):
    model = Section
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )

    def get(self, request, *args, **kwargs):
        section_id = kwargs['pk']
        section = get_object_or_404(self.model, pk=section_id)
        sectionData = TestSectionSerializer(section).data
        return Response({'status': 'successful', 'detail': sectionData})

# Add a section
class AddSectionView(CreateAPIView):
    model = Section
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )

    def post(self, request, *args, **kwargs):
        data = request.data

        # Return if title or test id is missing
        check_pass, result = fields_check(['title', 'test'], data)
        if not check_pass:
            return result

        test = get_object_or_404(Test, pk=int(data['test']))

        self.model.objects.create(
            title=data['title'],
            test=test,
        )

        return Response({ "status": "successful" })

# Edit a section
class EditSectionView(UpdateAPIView):
    model = Section
    serializer_class = TestSectionSerializer
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )

    def put(self, request, *args, **kwargs):
        sec_id = kwargs['pk']
        section = get_object_or_404(Section, pk=int(sec_id))
        data = request.data

        # Return if title is missing
        check_pass, result = fields_check(['title'], data)
        if not check_pass:
            return result

        # Ensure that no other section in that test has the same title
        sectionObjs = Section.objects.filter(test__id=section.test.id, title=data['title'])
        if len(sectionObjs) != 0 and section not in sectionObjs:
            return Response({'title': ['Section with the same title and in the same test already exists.']},
                status=HTTP_400_BAD_REQUEST)
        
        section.title = data['title']
        section.save()

        return Response({'status': 'successful'})

# Delete a section
@api_view(['DELETE'])
@permission_classes((permissions.IsAuthenticated, IsSuperadmin, ))
def DeleteSectionView(request, pk):
    section = get_object_or_404(Section, pk=pk)
    section.delete()
    return Response({'status': 'successful'})

# List all questions
class QuestionsViewSet(viewsets.ReadOnlyModelViewSet):
    model = Question
    serializer_class = TestQuestionSerializer
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )
    pagination_class = StandardResultsSetPagination
    # Making endpoint searchable
    filter_backends = (filters.SearchFilter, )
    search_fields = ('questionText', '=questionType', '=quesNumber')

    def get_queryset(self):
        section_id = self.kwargs['pk']
        questions = Question.objects.filter(section__id=int(section_id)).order_by('quesNumber')
        return questions

# Shows details of a particular question
class QuestionDetailsView(APIView):
    model = Question
    serializer_class = TestQuestionDetailsSerializer
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )

    def get(self, request, pk, *args, **kwargs):
        question = get_object_or_404(Question, pk=pk)
        quesData = TestQuestionDetailsSerializer(question).data
        questionType = question.questionType
        if questionType == 'integer':
            quesData.pop('passage', None)
            quesData.pop('options', None)
        elif questionType in ('mcq', 'scq'):
            quesData.pop('passage', None)
            quesData.pop('intAnswer', None)
        elif questionType == 'passage':
            quesData.pop('intAnswer', None)
        return Response({'details': quesData, 'status': 'successful'})

# Check validity of int answer (valid if integer in range 0-9)
def validate_intAnswer(data, questionType):
    error = False
    if questionType == 'integer':
        try:
            intAnswer = int(data['intAnswer'])
            if intAnswer not in range(0, 10):
                error = True
        except ValueError:
            error = True
    if error:
        return (False, Response({'intAnswer': ['Answer must be an integral value ranging from 0 to 9.']},
                status=HTTP_400_BAD_REQUEST))
    return (True, '')

# Edit details of a particular question
class EditQuestionDetailsView(UpdateAPIView):
    model = Question
    serializer_class = TestQuestionDetailsSerializer
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )

    def get_queryset(self):
        ques_id = self.kwargs['pk']
        questions = Question.objects.filter(pk=ques_id)
        return questions

    def put(self, request, pk, *args, **kwargs):
        ques_id = pk
        question = get_object_or_404(Question, pk=int(ques_id))
        data = request.data

        # Fields compulsory for all ques types
        compulsory_list = ['questionText', 'marksPositive', 'marksNegative']

        # Adding additional compulsory fields acc to ques type
        questionType = question.questionType
        if questionType == 'integer':
            compulsory_list.append('intAnswer')
        elif questionType in ('mcq', 'scq'):
            compulsory_list.append('questionType')

        # Return error if question type is changed
        op_dict = set_optional_fields(['questionType'], data)
        if op_dict['questionType']:
            if (questionType not in ('mcq', 'scq') and questionType != data['questionType']) or \
                (data['questionType'] not in ('mcq', 'scq')):
                return Response({'questionType': ['Question type wrongly edited.']},
                    status=HTTP_400_BAD_REQUEST)

        # Return if compulsory fields are missing
        check_pass, result = fields_check(compulsory_list, data)
        if not check_pass:
            return result

        # Return if integer answer is not valid
        valid, result = validate_intAnswer(data, questionType)
        if not valid:
            return result

        # Update values
        self.partial_update(request, *args, **kwargs)

        # Maintain total marks in section and test when ques obj is updated
        prevMarks = question.marksPositive    # Taking positive marks from prev obj
        updatedQues = get_object_or_404(Question, pk=int(ques_id))
        currMarks = updatedQues.marksPositive    # Taking positive marks from updated obj
        marksDiff = currMarks - prevMarks

        testObj = question.section.test
        testObj.totalMarks += marksDiff
        testObj.save()

        sectionObj = question.section
        sectionObj.totalMarks += marksDiff
        sectionObj.save()

        return Response({'status': 'successful'})

# Add a question with it's details
class AddQuestionDetailsView(CreateAPIView):
    model = Question
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )

    def post(self, request, *args, **kwargs):
        data = request.data

        # Return error if question type is missing
        check_pass, result = fields_check(['questionType'], data)
        if not check_pass:
            return result

        # Fields compulsory for all ques types
        compulsory_list = ['questionText', 'marksPositive', 'marksNegative', 'section']

        # Adding additional compulsory fields acc to ques type
        questionType = data['questionType']
        if questionType == 'integer':
            compulsory_list.append('intAnswer')
        elif questionType == 'passage':
            compulsory_list.append('passage')

        # Return if compulsory fields are missing
        check_pass, result = fields_check(compulsory_list, data)
        if not check_pass:
            return result

        # Get optional value - explanation
        op_dict = set_optional_fields(['explanation'], data)

        # Create question according to ques type
        section = get_object_or_404(Section, pk=int(data['section']))
        marksPositive = float(data['marksPositive'])
        marksNegative = float(data['marksNegative'])

        if questionType == 'integer':
            # Return if integer answer is not valid
            valid, result = validate_intAnswer(data)
            if not valid:
                return result

            self.model.objects.create(
                questionType='integer',
                section=section,
                questionText=data['questionText'],
                intAnswer=int(data['intAnswer']),
                explanation=op_dict['explanation'],
                marksPositive=marksPositive,
                marksNegative=marksNegative,
                valid=True,     # Integer ques is valid as it does not require options
            )
        elif questionType == 'passage':
            passage_id = data['passage']
            passageObj = get_object_or_404(Passage, pk=int(passage_id))
            self.model.objects.create(
                questionType='passage',
                section=section,
                questionText=data['questionText'],
                passage=passageObj,
                explanation=op_dict['explanation'],
                marksPositive=marksPositive,
                marksNegative=marksNegative,
            )
        elif questionType in ('mcq', 'scq'):
            self.model.objects.create(
                questionType=questionType,
                section=section,
                questionText=data['questionText'],
                explanation=op_dict['explanation'],
                marksPositive=marksPositive,
                marksNegative=marksNegative,
            )
        else:
            return Response({'questionType': ['Wrong question type provided.']},
                status=HTTP_400_BAD_REQUEST)

        return Response({'status': 'successful'})

# Delete a question
@api_view(['DELETE'])
@permission_classes((permissions.IsAuthenticated, IsSuperadmin, ))
def DeleteQuestionView(request, pk):
    question = get_object_or_404(Question, pk=pk)
    question.delete()
    return Response({'status': 'successful'})

# View details of a passage
class PassageDetailsView(APIView):
    model = Passage
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )

    def get(self, request, pk, *args, **kwargs):
        passage = get_object_or_404(Passage, pk=pk)
        passageData = PassageDetailsSerializer(passage).data
        return Response({'details': passageData, 'status': 'successful'})

# Add a new passage
class AddPassageView(CreateAPIView):
    model = Passage
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )

    def post(self, request, *args, **kwargs):
        data = request.data

        # Return if section or paragraph (passage text) are missing
        check_pass, result = fields_check(['section', 'paragraph'], data)
        if not check_pass:
            return result

        section = get_object_or_404(Section, pk=int(data['section']))

        passage = self.model.objects.create(
            paragraph=data['paragraph'],
            section=section,
        )

        return Response({ "status": "successful", "passage": passage.id})

# Edit passage details
class EditPassageView(UpdateAPIView):
    model = Passage
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )

    def put(self, request, pk, *args, **kwargs):
        passage = get_object_or_404(Passage, pk=pk)
        data = request.data

        # Return if title is missing
        check_pass, result = fields_check(['paragraph'], data)
        if not check_pass:
            return result

        passage.paragraph = data['paragraph']
        passage.save()

        return Response({'status': 'successful'})

# Return if correct answers for passage, scq type ques > 1
def multi_correct_error(question, data):
    if question.questionType in ('passage', 'scq'):
        quesCorrectOptions = Option.objects.filter(question=question, correct=True)
        if len(quesCorrectOptions) > 0 and data['correct'] in (True, 'true'):
            return (False, Response({'question': [('Multiple correct options are NOT allowed in "' +
                question.questionType + '" type questions.')]}, status=HTTP_400_BAD_REQUEST))
    return (True, '')

# Add an option for a particular question
class AddOptionView(CreateAPIView):
    model = Option
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )

    def post(self, request, *args, **kwargs):
        data = request.data

        # Return if required params are missing
        check_pass, result = fields_check(['optionText', 'correct', 'question'], data)
        if not check_pass:
            return result

        question = get_object_or_404(Question, pk=int(data['question']))

        # Return if option is added in integer type question
        if question.questionType == 'integer':
            return Response({'question': ['Adding options is NOT allowed in integer type questions.']},
                status=HTTP_400_BAD_REQUEST)

        # Return if correct is not a bool field or a string ('true', 'false')
        bool_dict, valid, result = check_for_bool(['correct'], data)
        if not valid:
            return result
        correct = bool_dict['correct']

        # Return if correct answers for passage, scq type ques > 1
        valid, result = multi_correct_error(question, data)
        if not valid:
            return result

        self.model.objects.create(
            optionText=data['optionText'],
            correct=correct,
            question=question,
        )

        return Response({ "status": "successful" })

# Edit an option
class EditOptionView(UpdateAPIView):
    model = Option
    serializer_class = NestedOptionSerializer
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )

    def get_queryset(self):
        option_id = self.kwargs['pk']
        return Option.objects.filter(pk=int(option_id))

    def put(self, request, pk, *args, **kwargs):
        option = get_object_or_404(Option, pk=pk)
        data = request.data

        # Return if required params are missing
        check_pass, result = fields_check(['optionText', 'correct'], data)
        if not check_pass:
            return result

        # Return if correct is not a bool field or a string ('true', 'false')
        bool_dict, valid, result = check_for_bool(['correct'], data)
        if not valid:
            return result
        correct = bool_dict['correct']

        # Return if correct answers for passage, scq type ques > 1
        valid, result = multi_correct_error(option.question, data)
        if not valid:
            return result

        option.optionText = data['optionText']
        option.correct = correct
        option.save()

        return Response({ "status": "successful" })

# Delete an option
@api_view(['DELETE'])
@permission_classes((permissions.IsAuthenticated, IsSuperadmin, ))
def DeleteOptionView(request, pk):
    option = get_object_or_404(Option, pk=pk)
    option.delete()
    return Response({'status': 'successful'})

# View for rearranging questions of a section
class RearrangeQuestions(APIView):
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )

    def put(self, request, pk, *args, **kwargs):
        section = get_object_or_404(Section, pk=pk)
        questions = Question.objects.filter(section=section)
        data = request.data

        # Return if order is missing
        check_pass, result = fields_check(['order'], data)
        if not check_pass:
            return result

        order_arr = data['order'].split(',')
        error_message = ''
        ques_arr = []
        if len(order_arr) < questions.count():
            # Return error if all questions are not provided
            error_message = 'Provided questions are less than the number of questions in this section.'
        elif len(order_arr) > questions.count():
            # Return error if extra questions are provided
            error_message = 'Provided questions are more than the number of questions in this section.'
        elif len(order_arr) != len(set(order_arr)):
            # Return error if duplicate questions are provided
            error_message = 'Error in re-arranging questions. Repeating question id(s) are provided.'
        else:
            # Return error if provided questions are not of the provided section
            for ques_pk in order_arr:
                ques = get_object_or_404(Question, pk=int(ques_pk))
                ques_arr.append(ques)
                if ques.section != section:
                    error_message = 'Some of the questions provided do not exist in provided section.'
                    break
        
        if error_message:
            return Response({'order': [error_message]}, status=HTTP_400_BAD_REQUEST)

        # Return error if questions of any passage are scattered
        ongoing_passage = -1
        prev_passages = []
        error = False
        for ques in ques_arr:
            if ques.questionType == 'passage':
                if ques.passage in prev_passages:
                    error = True
                    break
                elif ongoing_passage == -1:
                    ongoing_passage = ques.passage
                elif ques.passage != ongoing_passage:
                    prev_passages.append(ongoing_passage)
                    ongoing_passage = ques.passage
            elif ongoing_passage != -1:
                prev_passages.append(ongoing_passage)
                ongoing_passage = -1

        if error:
            return Response({'order': ['Error in re-arranging questions. Questions of one passage should remain together.']},
                status=HTTP_400_BAD_REQUEST)

        # Update question number (section wise)
        for i in range(len(ques_arr)):
            ques = ques_arr[i]
            ques.quesNumber = i + 1
            ques.save()
        return Response({'status': 'successful'})

# View for rearranging sections of a test
class RearrangeSections(APIView):
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )

    def put(self, request, pk, *args, **kwargs):
        test = get_object_or_404(Test, pk=pk)
        sections = Section.objects.filter(test=test)
        data = request.data

        # Return if order is missing
        check_pass, result = fields_check(['order'], data)
        if not check_pass:
            return result

        order_arr = data['order'].split(',')
        error_message = ''
        section_arr = []
        if len(order_arr) < sections.count():
            # Return error if all sections are not provided
            error_message = 'Provided sections are less than the number of sections in this test.'
        elif len(order_arr) > sections.count():
            # Return error if extra sections are provided
            error_message = 'Provided sections are more than the number of sections in this test.'
        elif len(order_arr) != len(set(order_arr)):
            # Return error if duplicate sections are provided
            error_message = 'Error in re-arranging sections. Repeating section id(s) are provided.'
        else:
            # Return error if provided sections do not belong to the provided test
            for section_pk in order_arr:
                section = get_object_or_404(Section, pk=int(section_pk))
                section_arr.append(section)
                if section.test != test:
                    error_message = 'Some of the sections provided do not exist in provided test.'
                    break

        if error_message:
            return Response({'order': [error_message]}, status=HTTP_400_BAD_REQUEST)
        
        # Update section number
        for i in range(len(order_arr)):
            section_id = order_arr[i]
            section = get_object_or_404(Section, pk=int(section_id))
            section.sectionNumber = i + 1
            section.save()            

        return Response({'status': 'successful'})

# Viewset for returning result of all tests of a particular student
class StudentTestResultViewSet(viewsets.ReadOnlyModelViewSet):
    model = UserTestResult
    serializer_class = StudentTestResultSerializer
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )
    pagination_class = StandardResultsSetPagination
    # Making endpoint searchable
    filter_backends = (filters.SearchFilter, )
    search_fields = ('test__title')
    
    def get_queryset(self):
        student_id = self.kwargs['pk']
        super_admin = get_super_admin(self.request.user)
        testResultObjs = self.model.objects.filter(
            test__super_admin=super_admin, student__id=student_id).order_by('-pk')
        return testResultObjs

# Viewset for returning result of all sections of a particular test (for a particular student)
class StudentSectionResultView(viewsets.ReadOnlyModelViewSet):
    model = UserSectionWiseResult
    serializer_class = StudentSectionResultSerializer
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )
    
    def get_queryset(self):
        student_id = self.kwargs['stud_pk']
        test_id = self.kwargs['test_pk']
        sectionResultObjs = self.model.objects.filter(
            section__test__id=test_id, student__id=student_id).order_by('section__sectionNumber')
        return sectionResultObjs

# Viewset for returning responses of all questions of a particular section (for a particular student)
class StudentQuestionResponseView(viewsets.ReadOnlyModelViewSet):
    model = UserQuestionWiseResponse
    serializer_class = StudentQuestionResponseSerializer
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )
    pagination_class = StandardResultsSetPagination
    # Making endpoint searchable
    filter_backends = (filters.SearchFilter, )
    search_fields = ('question__questionText', '=question__questionType', '=status')
    
    def get_queryset(self):
        student_id = self.kwargs['stud_pk']
        section_id = self.kwargs['sec_pk']
        questionResponseObjs = self.model.objects.filter(
            question__section__id=section_id, student__id=student_id).order_by('question__quesNumber')
        return questionResponseObjs

# Return JSON for bar graph containing information of past 10 years' test results
class TestResultGraphView(APIView):
    model = UserTestResult
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )

    def get(self, request, pk, *args, **kwargs):
        super_admin = get_super_admin(self.request.user)
        centreObjs = Centre.objects.filter(super_admin=super_admin).order_by('pk')
        yr_dict_arr = []

        # Take current 10 year objects
        curr_date = datetime.datetime.today()
        curr_yr = curr_date.date().year

        # Make latest 10 year objects
        for index in range(0, 5):
            yr = curr_yr - index

            # Get all test results submitted between 1-1-yr and 31-12-yr
            lower_limit_date = datetime.datetime(year=yr, month=1, day=1)
            upper_limit_date = datetime.datetime(year=yr, month=12, day=31)
            testResultObjs = self.model.objects.filter(
                test__super_admin=super_admin,
                test__id=pk,
                testAttemptDate__gte=lower_limit_date,
                testAttemptDate__lte=upper_limit_date,
            )

            # Get result filtered centre wise
            centreWiseResult = CentreWiseResultSerializer(
                centreObjs, many=True, context={'testResultObjs': testResultObjs, 'test_id': pk}).data
            yr_dict_arr.append({'year': curr_yr - index, 'centres': [centreWiseResult]})            

        return Response({'details': yr_dict_arr, 'status': 'successful'})

# Helper function to get testResultObjs, provided start_date, end_date and centre in params
def get_testResultObjs_helper(params_dict, test_id):

    # Return if compulsory parameters are missing
    check_pass, result = fields_check(['start_date', 'end_date', 'centre'], params_dict)
    if not check_pass:
        return (False, result)

    # Return if date format is incorrect
    valid_date, result = check_for_date(['start_date', 'end_date'], params_dict)
    if not valid_date:
        return (False, result)

    # Get parameters
    start_date = params_dict.get('start_date')
    end_date = params_dict.get('end_date')
    centre_id = int(params_dict.get('centre'))

    # Get test result objects
    testResultObjs = UserTestResult.objects.filter(
        test__id=test_id, testAttemptDate__gte=start_date, testAttemptDate__lte=end_date)

    # Filter according to search query
    if 'search' in params_dict:
        query = params_dict.get('search').strip()
        if len(query):
            testResultObjs = testResultObjs.filter(
                Q(student__first_name__icontains=query) | Q(student__last_name__icontains=query))

    # If centre_id is 0 => all centres
    if centre_id != 0:
        testResultObjs = testResultObjs.filter(student__centre__id=centre_id)
        # Sort testResultObjs by rank, show top rankers first
        testResultObjs = sorted(testResultObjs, key=lambda obj: obj.get_rank(start_date, end_date, centre_id))
    else:
        testResultObjs = sorted(testResultObjs, key=lambda obj: obj.get_rank(start_date, end_date))
    return (True, testResultObjs)

# Return test results of a particular centre within a particular time frame (search allowed)
class CentreSpecificTestResultView(APIView):
    model = UserTestResult
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )

    def get(self, request, pk, *args, **kwargs):
        # Get desired testResultObjs
        valid, response = get_testResultObjs_helper(self.request.GET, pk)
        if not valid:
            return response
        else:
            testResultObjs = response

        # Return paginated response
        paginator = StandardResultsSetPagination()
        resultPageObjs = paginator.paginate_queryset(testResultObjs, request)

        testResults = CentreSpecificStudentResultSerializer(
            resultPageObjs, many=True,
            context={
                'centre_id': int(self.request.GET.get('centre')),
                'start_date': self.request.GET.get('start_date'),
                'end_date': self.request.GET.get('end_date'),
            }).data

        return paginator.get_paginated_response(testResults)

# Return csv link to test results of a particular centre within a particular time frame
class CentreSpecificTestResultCSVView(APIView):
    model = UserTestResult
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )

    def get(self, request, pk, *args, **kwargs):
        testObj = get_object_or_404(Test, pk=pk)

        # Get desired testResultObjs
        valid, response = get_testResultObjs_helper(self.request.GET, pk)
        if not valid:
            return response
        else:
            testResultObjs = response

        testResults = CentreSpecificStudentResultSerializer(
            testResultObjs, many=True,
            context={
                'centre_id': int(self.request.GET.get('centre')),
                'start_date': self.request.GET.get('start_date'),
                'end_date': self.request.GET.get('end_date'),
            }).data
        
        # Make directory having test result csv(s)
        directory = MEDIA_ROOT + '/studentResultCSVs/'
        if not os.path.exists(directory):
            os.makedirs(directory)

        # Make csv and return the link of this csv in response
        csv_name = testObj.title.replace(' ', '_') + '_result_data.csv'
        path = directory + csv_name
        csvFile = open(path, 'w')
        csvFile.write('Student Name,Contact Number,email,Centre,Courses Enrolled,Rank,'
            'Percentile,Percentage,Total Marks,Marks Obtained,Total Questions,Number of correct answers,'
            'Number of incorrect answers, Number of unattempted questions\n')

        
        for testResult in testResults:
            csvFile.write(
                    testResult['student']['name'].replace(',', '|') + ',' +
                    (str(testResult['student']['contact_number']).replace(',', '|')).replace('None', '') + ',' +
                    testResult['student']['email'].replace(',', '|') + ',' +
                    testResult['student']['centre'].replace(',', '|')  + ',' +
                    (' | '.join(testResult['student']['course'])).replace(',', '|') + ',' +
                    str(testResult['rank']).replace(',', '|') + ',' +
                    str(testResult['percentile']).replace(',', '|') + ',' +
                    str(testResult['percentage']).replace(',', '|') + ',' +
                    str(testObj.totalMarks).replace(',', '|') + ',' +
                    str(testResult['marksObtained']).replace(',', '|') + ',' +
                    str(testObj.totalQuestions).replace(',', '|') + ',' +
                    str(testResult['correct']).replace(',', '|') + ',' +
                    str(testResult['incorrect']).replace(',', '|') + ',' +
                    str(testResult['unattempted']).replace(',', '|') + '\n'
                )

        csvFile.close()
        absolute_path = DOMAIN + 'media/studentResultCSVs/' + csv_name
        return Response({'status': 'successful', 'csvFile': absolute_path})

# Staff user views (not being used yet)
class GetStaffUsersView(ListAPIView):
    serializer_class = StaffSerializer
    queryset = Staff.objects.all()

class AddStaffView(APIView):
    def post(self, request, *args, **kwargs):
        name, email, course, centre = request.data['name'], request.data['email'], request.data['course'], request.data['centre']
        existing = [x['username'] for x in User.objects.values('username')]
        user, password = None, ""
        while True:
            username = "ST" + uuid.uuid4().hex[:5].upper()
            password = uuid.uuid4().hex[:8].lower()
            if username not in existing:
                user = User.objects.create(username=username, type_of_user="staff", email=email)
                user.set_password(password)
                user.save()
                break
        user.staff.name = name
        user.staff.course_id = course
        user.staff.centre_id = centre
        user.staff.super_admin = get_super_admin(request.user)
        user.staff.save()
        send_mail(
            'Test Series Staff Account Credentials',
            'username: %s\n pass: %s' %(username, password),
            'gurpreetsinghzomato15@gmail.com',
            [email],
            fail_silently=False,
        )
        return Response({
            "detail": "successfull",
            "username": username,
            "password": password,
        })

# ---------------------STUDENT VIEWS-------------------------
# For filling profile detials on first time student login
class CompleteStudentProfileView(UpdateAPIView):
    model = Student
    serializer_class = StudentSerializer
    permission_classes = (permissions.IsAuthenticated, IsStudent, )

    def get_object(self):
        # Return object (to be used in partial update) if pk not provided in request
        user = self.request.user
        studentObj = get_object_or_404(Student, user=user)
        return studentObj

    def put(self, request, *args, **kwargs):
        studentUserObj = request.user
        studentObj = get_object_or_404(Student, user=studentUserObj)
        complete = studentObj.complete
        data = request.data

        compulsory_fields = ['first_name', 'last_name', 'father_name',
            'address', 'city', 'state', 'pinCode', 'gender', 'dateOfBirth', 'contact_number']

        if not complete:
            # In case of first time update
            compulsory_fields = compulsory_fields + ['password1', 'password2', 'username', 'email']

        # Search for missing fields
        check_pass, result = fields_check(compulsory_fields, data)
        if not check_pass:
            return result

        if not complete:
            errorDict = {}

            # Provide available usernames if username chosen by user is already occupied
            username = data['username']
            existing = [user['username'] for user in User.objects.values('username')]
            existing.remove(studentUserObj.username)

            if username in existing:
                available = [studentUserObj.username]
                while len(available) < 3:
                    tentative = username + uuid.uuid4().hex[:4].lower()
                    if tentative not in existing:
                        available.append(tentative)

                errorDict['username'] = [("This username is already occupied. " +
                    "Available usernames similar to this are " + ', '.join(available) + " etc or try some other username.")]

            email = data['email']

            # Validate email id
            try:
                validate_email(email)
            except ValidationError:
                errorDict['email'] = ["Provided email id is invalid."]

            # Do not form another student with the same email id
            if email != studentUserObj.email:
                userObjs = User.objects.filter(email=email, type_of_user='student')
                if len(userObjs) != 0:
                    errorDict['email'] = [("A student with the same email id already exists. " +
                        "Either log in the user with this registered email id or register yourself with some other email id.")]

            # Return errors, if any
            if len(errorDict) != 0:
                return Response(errorDict, status=HTTP_400_BAD_REQUEST)

            # Return if password strength weak
            check_pass, result = check_passwd_strength(data)
            if not check_pass:
                return result

        # Validate contact number
        valid_contact = True
        try:
            _ = int(data['contact_number'])
        except ValueError:
            valid_contact = False

        if len(data['contact_number']) != 10 or not valid_contact:
            return Response({"contact_number": ["Provided contact number is invalid. Exact 10 digits are allowed."]},
                status=HTTP_400_BAD_REQUEST)

        # Remove previous image from system
        if studentObj.image and 'image' in data:
            os.remove(studentObj.image.file.name)
            studentObj.image = None
            studentObj.save()

        if not complete:
            # Update user obj
            studentUserObj.username = username
            studentUserObj.email = email
            studentUserObj.set_password(data['password1'])
            studentUserObj.save()

        # Update student obj
        self.partial_update(request, *args, **kwargs)

        # Now profile is complete
        studentObj = get_object_or_404(Student, user=studentUserObj)
        studentObj.complete = True
        studentObj.save()

        if not complete:
            # Send email with the updated credentials, for first time login only
            subject = 'Genesis Classes Credentials'
            content = """
                <p>Hi {}</p>
                <p>Thanks for updating your profile at {}. Your login credentials are -</p>
                <p>username: <b>{}</b><br>
                password: <b>{}</b></p>
                <p>We hope you have a good learning experience with us. All the Best for your journey ahead!</p>
                Regards<br>
                Genesis Classes Team
            """.format(data['first_name'], DOMAIN, username, data['password1'])
            send_email(subject, content, [email])

        return Response({'status': 'successful'})

# Show all unattempted upcoming tests
class UpcomingTestsListViewSet(viewsets.ModelViewSet):
    model = Test
    serializer_class = UpcomingTestsListSerializer
    permission_classes = (permissions.IsAuthenticated, IsStudent, )

    def get_queryset(self):
        user = self.request.user
        studentObj = get_object_or_404(Student, user=user)
        super_admin = get_super_admin(user)
        today = timezone.localtime(timezone.now())

        # User can attempt the test anytime between startTime and endtime
        upcomingTests = self.model.objects.filter(typeOfTest='upcoming', super_admin=super_admin,
            active=True, course__in=studentObj.course.all()).distinct().order_by('-pk')
        upcomingTests = upcomingTests.filter(Q(endtime__gt=today) | Q(endtime=None))

        # Show only unattempted tests
        upcomingTestResults = UserTestResult.objects.filter(student=studentObj, test__typeOfTest='upcoming')
        attemptedTests = [testResult.test for testResult in upcomingTestResults]

        unattemptedTests = []
        for test in upcomingTests:
            if test not in attemptedTests:
                unattemptedTests.append(test)

        return unattemptedTests

# List all test categories
class TestCategoriesListViewSet(viewsets.ModelViewSet):
    model = Category
    serializer_class = TestCategoriesListSerializer
    permission_classes = (permissions.IsAuthenticated, IsStudent, )

    def get_queryset(self):
        super_admin = get_super_admin(self.request.user)
        categories = self.model.objects.filter(super_admin=super_admin).order_by('pk')
        return categories

# Get details of a particular category
class TestCategoryDetailsView(APIView):
    permission_classes = (permissions.IsAuthenticated, IsStudent, )

    def get(self, request, *args, **kwargs):
        category_id = kwargs['pk']
        categoryObj = get_object_or_404(Category, pk=category_id)
        categoryData = TestCategoriesListSerializer(categoryObj, context={'request': request}).data
        return Response({'status': 'successful', 'detail': categoryData})

# Get practice tests of a particular test category
class TestCategoryDetailsViewSet(viewsets.ModelViewSet):
    model = Test
    serializer_class = PracticeTestsListSerializer
    permission_classes = (permissions.IsAuthenticated, IsStudent, )
    pagination_class = StandardResultsSetPagination

    def get_serializer_context(self):
        user = self.request.user
        studentObj = get_object_or_404(Student, user=user)
        return {'studentObj': studentObj}

    def get_queryset(self):
        category_id = self.kwargs['pk']
        user = self.request.user
        studentObj = get_object_or_404(Student, user=user)
        super_admin = get_super_admin(user)

        # User can attempt the test anytime between startTime and endtime
        practiceTests = self.model.objects.filter(super_admin=super_admin, category__id=category_id, typeOfTest='practice',
            active=True, course__in=studentObj.course.all()).distinct().order_by('pk')

        # Get optional parameters
        params_dict = self.request.GET
        op_dict = set_optional_fields(['course', 'attempted'], params_dict)

        if op_dict['course']:
            # Filter according to course
            course = get_object_or_404(Course, pk=str(op_dict['course']))
            practiceTests = practiceTests.filter(course=course)

        if op_dict['attempted']:
            # Return if attempted is not a bool field
            bool_dict, check_pass, result = check_for_bool(['attempted'], params_dict)
            if not check_pass:
                return {}, False, result

            # Filter according to if test is attempted or not
            practiceTestResults = UserTestResult.objects.filter(student=studentObj, test__typeOfTest='practice')
            allAttemptedTests = [testResult.test for testResult in practiceTestResults]

            if bool_dict['attempted']:
                attemptedTests = []
                for test in practiceTests:
                    if test in allAttemptedTests:
                        attemptedTests.append(test)
                practiceTests = attemptedTests
            else:
                unattemptedTests = []
                for test in practiceTests:
                    if test not in allAttemptedTests:
                        unattemptedTests.append(test)
                practiceTests = unattemptedTests

        return practiceTests

# Get list of all subjects (to be shown under unit wise tests)
class SubjectListViewSet(viewsets.ModelViewSet):
    model = Subject
    serializer_class = SubjectListSerializer
    permission_classes = (permissions.IsAuthenticated, IsStudent, )

    def get_queryset(self):
        user = self.request.user
        super_admin = get_super_admin(user)
        studentObj = get_object_or_404(Student, user=user)
        subjects = self.model.objects.filter(
            super_admin=super_admin, course__in=studentObj.course.all()).distinct().order_by('pk')

        # Filter according to course
        params_dict = self.request.GET
        op_dict = set_optional_fields(['course'], params_dict)

        if op_dict['course']:
            course = get_object_or_404(Course, pk=str(op_dict['course']))
            subjects = subjects.filter(course=course)

        return subjects

# Return details of a particular subject
class SubjectInfoView(APIView):
    permission_classes = (permissions.IsAuthenticated, IsStudent, )

    def get(self, request, *args, **kwargs):
        user = self.request.user
        super_admin = get_super_admin(user)
        studentObj = get_object_or_404(Student, user=user)

        subject_id = kwargs['pk']
        subjectObj = Subject.objects.filter(pk=subject_id, super_admin=super_admin,
            course__in=studentObj.course.all()).distinct()

        if len(subjectObj) == 0:
            raise Http404

        subjectData = SubjectSerializer(subjectObj[0], context={'request': request}).data
        return Response({'status': 'successful', 'detail': subjectData})

# Get list of all units of a particular subject
class UnitsListViewSet(viewsets.ModelViewSet):
    model = Unit
    serializer_class = UnitListSerializer
    permission_classes = (permissions.IsAuthenticated, IsStudent, )

    def get_queryset(self):
        subject_id = self.kwargs['pk']
        user = self.request.user
        super_admin = get_super_admin(user)
        studentObj = get_object_or_404(Student, user=user)

        # If subject (whose units are required) does not belong 
        # to course in which student is enrolled, show 404
        subjects = Subject.objects.filter(super_admin=super_admin,
            course__in=studentObj.course.all(), pk=subject_id).distinct()
        if len(subjects) == 0:
            raise Http404

        subject = subjects[0]
        units = self.model.objects.filter(subject=subject).order_by('pk')

        return units

# Get list of all tests of a particular unit
class UnitWiseTestsListViewSet(viewsets.ModelViewSet):
    model = Test
    serializer_class = PracticeTestsListSerializer
    permission_classes = (permissions.IsAuthenticated, IsStudent, )
    pagination_class = StandardResultsSetPagination

    def get_serializer_context(self):
        user = self.request.user
        studentObj = get_object_or_404(Student, user=user)
        return {'studentObj': studentObj}

    def get_queryset(self):
        unit_id = self.kwargs['pk']
        unit = get_object_or_404(Unit, pk=unit_id)
        user = self.request.user
        super_admin = get_super_admin(user)
        studentObj = get_object_or_404(Student, user=user)

        # Raise 404 if student does not have access to the subject
        subjects = Subject.objects.filter(super_admin=super_admin,
            course__in=studentObj.course.all(), pk=unit.subject.id).distinct()
        if len(subjects) == 0:
            raise Http404

        # Get list of tests
        subject = subjects[0]
        today = timezone.localtime(timezone.now())
        practiceTests = self.model.objects.filter(super_admin=super_admin, typeOfTest='practice', active=True,
            course__in=studentObj.course.all(), subject=subject, unit=unit, startTime__lte=today).distinct().order_by('pk')
        practiceTests = practiceTests.filter(Q(endtime__gt=today) | Q(endtime=None))

        # Get optional parameter attempted
        params_dict = self.request.GET
        op_dict = set_optional_fields(['attempted'], params_dict)

        if op_dict['attempted']:
            # Return if attempted is not a bool field
            bool_dict, check_pass, result = check_for_bool(['attempted'], params_dict)
            if not check_pass:
                return {}, False, result

            # Filter according to if test is attempted or not
            practiceTestResults = UserTestResult.objects.filter(student=studentObj, test__typeOfTest='practice')
            allAttemptedTests = [testResult.test for testResult in practiceTestResults]

            if bool_dict['attempted']:
                attemptedTests = []
                for test in practiceTests:
                    if test in allAttemptedTests:
                        attemptedTests.append(test)
                practiceTests = attemptedTests
            else:
                unattemptedTests = []
                for test in practiceTests:
                    if test not in allAttemptedTests:
                        unattemptedTests.append(test)
                practiceTests = unattemptedTests

        return practiceTests

# Get test detail along with all it's questions
class TestDetailView(APIView):
    permission_classes = (permissions.IsAuthenticated, IsStudent, )

    def get(self, request, *args, **kwargs):
        test_id = kwargs['pk']
        user = self.request.user
        super_admin = get_super_admin(user)
        studentObj = get_object_or_404(Student, user=user)
        today = timezone.localtime(timezone.now())

        # Raise 404 if student does not have access to the subject
        tests = Test.objects.filter(super_admin=super_admin, active=True,
            course__in=studentObj.course.all(), pk=test_id, startTime__lte=today).distinct()
        tests = tests.filter(Q(endtime__gt=today) | Q(endtime=None))
        if len(tests) == 0:
            raise Http404

        # Get details of the test, along with it's questions
        test = tests[0]
        testData = TestDetailSerializer(test, context={'request': request}).data

        return Response({'status': 'successful', 'detail': testData})

# Store test question responses
class TestSubmitView(CreateAPIView):
    permission_classes = (permissions.IsAuthenticated, IsStudent, )

    def post(self, request, *args, **kwargs):
        data = request.data
        user = self.request.user
        super_admin = get_super_admin(user)
        studentObj = get_object_or_404(Student, user=user)
        test_id = kwargs['pk']
        testObj = get_object_or_404(Test, super_admin=super_admin, pk=test_id)

        for responseObj in data:
            try:
                question = Question.objects.get(pk=responseObj['question'])

                # Do not save question result, if question does not belong to the given test
                if question.section.test != testObj:
                    continue

                # Question Response can be saved only once
                quesResponseObjs  = UserQuestionWiseResponse.objects.filter(question=question, student=studentObj)
                if len(quesResponseObjs) != 0:
                    continue

                # In question responseObjs, an array of selected option pk's is recieved
                if question.questionType == 'mcq':
                    choices = []
                    responses = responseObj['response']
                    for option_id in responses:
                        option = Option.objects.get(pk=option_id)
                        choices.append(option)
                    choices.sort(key=lambda obj: obj.id)

                    # Check status of user's answer
                    if len(choices) == 0:
                        status = 'unattempted'
                    else:
                        status = 'incorrect'
                        # User's answer is correct if all options are correct
                        correctOptionsQuerySet = Option.objects.filter(question=question, correct=True).order_by('pk')
                        correctOptions = [option for option in correctOptionsQuerySet]
                        if choices == correctOptions:
                            status = 'correct'

                    quesResponse = UserQuestionWiseResponse.objects.create(
                        question=question,
                        student=studentObj,
                        isMarkedForReview=responseObj['review'],
                        status=status,
                    )
                    quesResponse.userChoices.set(choices)
                    quesResponse.save()

                elif question.questionType == 'integer':
                    responses = responseObj['response']

                    # Check status of user's answer
                    if len(responses) == 0:
                        status = 'unattempted'
                        intAnswer = None
                    else:
                        status = 'incorrect'
                        # User's answer is correct if intAnswer is user's answer
                        intAnswer = responses[0]
                        if intAnswer == question.intAnswer:
                            status = 'correct'
                    
                    quesResponse = UserQuestionWiseResponse.objects.create(
                        question=question,
                        student=studentObj,
                        isMarkedForReview=responseObj['review'],
                        status=status,
                        userIntAnswer=intAnswer,
                    )

                else:
                    responses = responseObj['response']

                    # Check status of user's answer
                    choices = []
                    if len(responses) == 0:
                        status = 'unattempted'
                    else:
                        choice = Option.objects.get(pk=responses[0])
                        choices.append(choice)
                        status = 'incorrect'
                        # User's answer is correct if option is correct
                        correctOption = Option.objects.get(question=question, correct=True)
                        if choice == correctOption:
                            status = 'correct'

                    quesResponse = UserQuestionWiseResponse.objects.create(
                        question=question,
                        student=studentObj,
                        isMarkedForReview=responseObj['review'],
                        status=status,
                    )
                    quesResponse.userChoices.set(choices)
                    quesResponse.save()


            except Question.DoesNotExist:
                # If question obj does not exist, continue with the next question
                pass

            except Option.DoesNotExist:
                # If option obj does not exist, mark as unattempted,
                # save the response and move on to the next question
                quesResponse.status = 'unattempted'
                quesResponse.save()

        return Response({'status': 'successful'})

# Shows overall result of the test
class TestResultView(APIView):
    permission_classes = (permissions.IsAuthenticated, IsStudent, )

    def get(self, request, *args, **kwargs):
        data = request.data
        user = self.request.user
        super_admin = get_super_admin(user)
        studentObj = get_object_or_404(Student, user=user)

        # Get test data
        test_id = kwargs['pk']
        testObj = get_object_or_404(Test, super_admin=super_admin, pk=test_id)
        testData = TestInfoForResultSerializer(testObj).data
        
        # Get current academic yr
        curr_date = datetime.datetime.today().strftime('%Y-%m-%d')
        (start_date, end_date) = get_academic_yr(curr_date)

        # Get user's result
        testResultObj = get_object_or_404(UserTestResult, test=testObj, student=studentObj)
        testResultData = TestResultSerializer(testResultObj, context={'start_date': start_date, 'end_date': end_date}).data

        # Get user sectional result
        sectionalResultObjs = UserSectionWiseResult.objects.filter(
            section__test=testObj, student=studentObj).order_by('section__sectionNumber')
        sectionalResultData = SectionalResultSerializer(sectionalResultObjs, many=True).data

        # Get topper's result
        topperTestResultObj = UserTestResult.objects.filter(test=testObj,
            testAttemptDate__gte=start_date, testAttemptDate__lte=end_date).order_by('-marksObtained')[0]
        topperTestResultData = TestResultSerializer(topperTestResultObj, context={'start_date': start_date, 'end_date': end_date}).data

        # Get topper's info
        topper = topperTestResultObj.student
        topperInfo = NestedStudentSerializer(topper).data

        dictV = {'test': testData, 'userTestResult': testResultData, 'topperResult': topperTestResultData, 
                 'topperInfo': topperInfo, 'sectionalResult': sectionalResultData}

        return Response({'status': 'successful', 'detail': dictV})

# Test detail and sectional result
class TestAnalytics(APIView):
    permission_classes = (permissions.IsAuthenticated, IsStudent, )

    def get(self, request, *args, **kwargs):
        user = self.request.user
        super_admin = get_super_admin(user)
        studentObj = get_object_or_404(Student, user=user)

        # Get user's result
        test_id = kwargs['pk']
        testObj = get_object_or_404(Test, super_admin=super_admin, pk=test_id)
        testResultObj = get_object_or_404(UserTestResult, test=testObj, student=studentObj)

        # Get details of the test, along with it's sections
        testData = TestAnalysisSerializer(testObj, context={'request': request, 'studentObj': studentObj}).data

        return Response({'status': 'successful', 'detail': testData})

# Section detail and question wise result
class SectionAnalysis(APIView):
    permission_classes = (permissions.IsAuthenticated, IsStudent, )

    def get(self, request, *args, **kwargs):
        user = self.request.user
        super_admin = get_super_admin(user)
        studentObj = get_object_or_404(Student, user=user)

        # Get user's result
        test_id = kwargs['test_pk']
        testObj = get_object_or_404(Test, super_admin=super_admin, pk=test_id)
        testResultObj = get_object_or_404(UserTestResult, test=testObj, student=studentObj)

        # Get sectional result
        sec_id = kwargs['sec_pk']
        secObj = get_object_or_404(Section, test__super_admin=super_admin, pk=sec_id)
        secData = SectionAnalysisSerializer(secObj, context={'request': request, 'student': studentObj}).data

        return Response({'status': 'successful', 'detail': secData})

# Result of a particular question with it's details
class QuestionAnalysis(APIView):
    permission_classes = (permissions.IsAuthenticated, IsStudent, )

    def get(self, request, *args, **kwargs):
        user = self.request.user
        super_admin = get_super_admin(user)
        studentObj = get_object_or_404(Student, user=user)

        # Get user's result
        test_id = kwargs['test_pk']
        testObj = get_object_or_404(Test, super_admin=super_admin, pk=test_id)
        testResultObj = get_object_or_404(UserTestResult, test=testObj, student=studentObj)
        sec_id = kwargs['sec_pk']
        secObj = get_object_or_404(Section, test__super_admin=super_admin, pk=sec_id)

        # Get question detail
        ques_id = kwargs['ques_pk']
        quesObj = get_object_or_404(Question, section__test__super_admin=super_admin, pk=ques_id)
        quesData = QuestionAnalysisSerializer(quesObj, context={'request': request, 'student': studentObj}).data

        if quesObj.questionType == 'integer':
            quesData.pop('options')
        quesData.pop('passage')

        return Response({'status': 'successful', 'detail': quesData})

# Result of questions of a particular passage
class PassageAnalysis(APIView):
    permission_classes = (permissions.IsAuthenticated, IsStudent, )

    def get(self, request, *args, **kwargs):
        user = self.request.user
        super_admin = get_super_admin(user)
        studentObj = get_object_or_404(Student, user=user)

        # Get user's result
        test_id = kwargs['test_pk']
        testObj = get_object_or_404(Test, super_admin=super_admin, pk=test_id)
        testResultObj = get_object_or_404(UserTestResult, test=testObj, student=studentObj)
        sec_id = kwargs['sec_pk']
        secObj = get_object_or_404(Section, test__super_admin=super_admin, pk=sec_id)

        # Get passage detail
        passage_id = kwargs['pass_pk']
        passageObj = get_object_or_404(Passage, section=secObj, pk=passage_id)
        passageData = PassageAnalysisSerializer(passageObj, context={'request': request, 'student': studentObj}).data

        return Response({'status': 'successful', 'detail': passageData})

# List all attempted tests in test result tab
class TestResultListViewSet(viewsets.ModelViewSet):
    model = UserTestResult
    serializer_class = TestResultListSerializer
    permission_classes = (permissions.IsAuthenticated, IsStudent, )
    pagination_class = StandardResultsSetPagination

    def get_serializer_context(self):
        user = self.request.user
        studentObj = get_object_or_404(Student, user=user)

        # Get current academic yr
        curr_date = datetime.datetime.today().strftime('%Y-%m-%d')
        (start_date, end_date) = get_academic_yr(curr_date)

        return {'request': self.request, 'student': studentObj, 'start_date': start_date, 'end_date': end_date}

    def get_queryset(self):
        user = self.request.user
        super_admin = get_super_admin(user)
        studentObj = get_object_or_404(Student, user=user)
        params_dict = self.request.GET

        # Filter out attempted test results
        results = self.model.objects.filter(test__typeOfTest=params_dict['typeOfTest'],
            student=studentObj, test__super_admin=super_admin).order_by('-testAttemptDate')

        # Filter out attempted tests
        tests = []
        for result in results:
            tests.append(result.test)
        return tests

# Display rank list of a particular test
class TestRankList(viewsets.ModelViewSet):
    model = UserTestResult
    serializer_class = StudentResultListSerializer
    permission_classes = (permissions.IsAuthenticated, IsStudent, )
    pagination_class = StandardResultsSetPagination

    def get_serializer_context(self):
        user = self.request.user
        studentObj = get_object_or_404(Student, user=user)
        params_dict = self.request.GET

        # Get start_date and end_date
        op_dict = set_optional_fields(['centre', 'course', 'start_date', 'end_date'], params_dict)

        course = op_dict['course']
        centre = op_dict['centre']

        if course:
            course = int(course)
        if centre:
            centre = int(centre)

        return {'request': self.request, 'start_date': op_dict['start_date'],
            'end_date': op_dict['end_date'], 'course': course, 'centre': centre}

    def get_queryset(self):
        user = self.request.user
        super_admin = get_super_admin(user)
        studentObj = get_object_or_404(Student, user=user)
        params_dict = self.request.GET

        # Get optional parameters
        op_dict = set_optional_fields(['centre', 'course', 'start_date', 'end_date'], params_dict)

        start_date = op_dict['start_date']
        end_date = op_dict['end_date']
        course = op_dict['course']
        centre = op_dict['centre']

        # Get test result objs acc to provided params
        test_id = self.kwargs['pk']
        UserTestResultObjs = self.model.objects.filter(test=test_id, test__super_admin=super_admin)
        if start_date:
            UserTestResultObjs = UserTestResultObjs.filter(testAttemptDate__gte=start_date)
        if end_date:
            UserTestResultObjs = UserTestResultObjs.filter(testAttemptDate__lte=end_date)
        if centre:
            centre = int(centre)
            UserTestResultObjs = UserTestResultObjs.filter(student__centre__id=centre)
        if course:
            course = int(course)
            UserTestResultObjs = UserTestResultObjs.filter(student__course__id=course)

        # Sort results according to rank
        unsorted_results = UserTestResultObjs.all()
        sorted_results = sorted(unsorted_results, key=lambda x: x.get_rank(start_date, end_date, centre, course))
        return sorted_results