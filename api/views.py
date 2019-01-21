from django.shortcuts import render, Http404
from api.serializers import *
from rest_framework.generics import UpdateAPIView, ListAPIView, CreateAPIView
from api.models import Student, Centre, Course, User
from rest_framework.views import APIView
from api.models import Student, Centre, Test, Question, Section, Option
from rest_framework import viewsets, permissions
from api.utils import parser
from datetime import datetime
from rest_framework.response import Response
from django.core.mail import send_mail
from .permissions import *
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from rest_framework.status import HTTP_400_BAD_REQUEST
from django.core.validators import validate_email
from django.core.validators import ValidationError
from .paginators import *
import json
import uuid
import os

def get_super_admin(user):
    type_of_user = user.type_of_user
    if type_of_user == 'student':
        super_admin = user.student.super_admin
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
    return (False, Response({
        "status": "error", "message": "Some fields are missing. Please provide \"" + '", "'.join(missing_fields) + "\""}, 
        status=HTTP_400_BAD_REQUEST))

# Helper function to set value as None if field value is not present
def set_optional_fields(fields_arr, data):
    dictV = {}
    for field in fields_arr:
        dictV[field] = None
        if field in data:
            if data[field]:
                dictV[field] = data[field]
    return dictV

class CompleteProfileView(UpdateAPIView):
    serializer_class = StudentSerializer

    def get_queryset(self, *args, **kwargs):
        return Student.objects.filter(user=self.request.user)

    def put(self, request, *args, **kwargs):
        print(request.data)
        response = super(CompleteProfileView, self).put(request,
                                                    *args,
                                                    **kwargs)
        if response.status_code == 200:
            obj = Student.objects.get(id=kwargs['pk'])
            obj.complete = True
            obj.save()
        return response

# -------------------VIEWS FOR CHOICEs-------------------------
# Shows all subjects of superadmin in the format
# subject_name (course_title_1 + course_title_2 + ...)
class SubjectChoiceView(viewsets.ReadOnlyModelViewSet):
    model = Subject
    serializer_class = SubjectChoiceSerializer
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        super_admin = get_super_admin(self.request.user)
        return self.model.objects.filter(super_admin=super_admin).order_by('title')

# -------------------SUPER ADMIN VIEWS-------------------------
# Shows list of students (permitted to a superadmin only)
class StudentUserViewSet(viewsets.ReadOnlyModelViewSet):
    model = Student
    serializer_class = StudentUserSerializer
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        super_admin = get_super_admin(self.request.user)
        centreObjs = Centre.objects.filter(super_admin=super_admin)
        students = self.model.objects.filter(centre__in=centreObjs).order_by('-pk')
        return students

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
            'email', 'centre', 'course'], data)
        if not check_pass:
            return result

        email = data['email']

        # Validate email id
        try:
            validate_email(email)
        except ValidationError:
            return Response({
                "status": "error", "message": "Provided email id is invalid."},
                status=HTTP_400_BAD_REQUEST)

        # Validate contact number
        valid_contact = True
        try:
            contact_number = int(data['contact_number'])
        except ValueError:
            valid_contact = False

        if len(data['contact_number']) != 10 or not valid_contact:
            return Response({
                "status": "error", "message": "Provided contact number is invalid. Only 10 digits are allowed."},
                status=HTTP_400_BAD_REQUEST)

        # Do not form another student with the same email id
        userObjs = User.objects.filter(email=email, type_of_user='student')
        if(len(userObjs) != 0):
            return Response({
                "status": "error", "message": "A student with the same email id already exists."},
                status=HTTP_400_BAD_REQUEST)

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
            return Response({
                "status": "error", "message": "Please provide at least one valid course"},
                status=HTTP_400_BAD_REQUEST)

        # Get unique username
        last_student = Student.objects.all().order_by('-pk')[0]
        new_pk = last_student.pk + 1
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
        
        # Add info to corresponding student obj
        student, _ = self.model.objects.get_or_create(user=user)
        student.first_name=data['first_name']
        student.last_name=data['last_name']
        student.contact_number=contact_number
        student.centre=centre
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
            'email', 'centre', 'course'], data)
        if not check_pass:
            return result

        email = data['email']

        # Validate email id
        try:
            validate_email(email)
        except ValidationError:
            return Response({
                "status": "error", "message": "Provided email id is invalid."},
                status=HTTP_400_BAD_REQUEST)

        # Validate contact number
        valid_contact = True
        try:
            _ = int(data['contact_number'])
        except ValueError:
            valid_contact = False

        if len(data['contact_number']) != 10 or not valid_contact:
            return Response({
                "status": "error", "message": "Provided contact number is invalid. Only 10 digits are allowed."},
                status=HTTP_400_BAD_REQUEST)

        # Do not form another student with the same email id
        if email != studentUserObj.email:
            userObjs = User.objects.filter(email=email, type_of_user='student')
            if len(userObjs) != 0:
                return Response({
                    "status": "error", "message": "A student with the same email id already exists."},
                    status=HTTP_400_BAD_REQUEST)
            studentUserObj.email = email
            studentUserObj.save()

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
            return Response({
                "status": "error", "message": "Please provide at least one valid course"},
                status=HTTP_400_BAD_REQUEST)
        studentObj.course.set(courses_arr)
        studentObj.save()

        # Update centre of the user
        if studentObj.centre != centre:
            studentObj.centre = centre
            studentObj.save()

        # Remove previous image from system
        if studentObj.image:
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

    def get_queryset(self):
        super_admin = get_super_admin(self.request.user)
        centres = Centre.objects.filter(super_admin=super_admin)
        queryset = self.model.objects.filter(centre__in=centres).order_by('-pk')
        return queryset

# Add bulk students and save the list in a csv
class AddBulkStudentsView(CreateAPIView):
    model = BulkStudentsCSV
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )

    def post(self, request, *args, **kwargs):
        data = request.data
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
            return Response({
                "status": "error", "message": "Please provide at least one valid course"},
                status=HTTP_400_BAD_REQUEST)

        # Make studentCSVs directory if it does not exist
        directory = 'media/studentCSVs/'
        if not os.path.exists(directory):
            os.makedirs(directory)

        # Create a unique filename
        filename = str(uuid.uuid4()) + '.csv'
        csvFile = open('media/studentCSVs/' + filename, 'w')
        csvFile.write('Username,Password\n')

        # Create bulk students
        count = 0
        existing = [user['username'] for user in User.objects.values('username')]
        last_st = Student.objects.all().order_by('-pk')[0]
        last_pk = last_st.pk
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

            # Set corresponding student courses and centres
            studentObj = Student.objects.get(user=user)
            studentObj.centre = centre
            studentObj.course.set(courses_arr)
            studentObj.save()

            # Add username and password to csv file
            csvFile.write(username + ',' + password + '\n')
            count += 1

        csvFile.close()

        # Make BulkStudentsCSV model object and save csv to it
        bulkCSVObj = self.model.objects.create(csv_file='studentCSVs/' + filename, centre=centre, number=n)
        bulkCSVObj.course.set(courses_arr)
        bulkCSVObj.save()
        return Response({"status": "successful"})

# Generate csv containing all student data
class DownloadStudentDataView(APIView):
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )

    def get(self, request, *args, **kwargs):
        super_admin = get_super_admin(self.request.user)

        # Make directory having all csv of student data of an admin
        directory = 'media/allStudentCSV/'
        if not os.path.exists(directory):
            os.makedirs(directory)

        path = directory + 'student_data.csv'
        csvFile = open(path, 'w')
        csvFile.write('Name,Contact Number,email,Centre,Courses Enrolled,Gender,Date of Birth,\
            Father\'s Name,Address,City,State,Pin Code\n')

        centres = Centre.objects.filter(super_admin=super_admin)
        students = Student.objects.filter(centre__in=centres)
        for student in students:
            name = ''
            if student.first_name:
                name += student.first_name
            if student.last_name:
                name +=  ' ' + student.last_name

            contact_number = ''
            if student.contact_number:
                contact_number = str(student.contact_number)

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

            csvFile.write(
                name.replace(',', '|') + ',' + contact_number.replace(',', '|') + ',' + email.replace(',', '|') +
                ',' + centre.replace(',', '|')  + ',' + courses.replace(',', '|')  + ',' + gender.replace(',', '|') +
                ',' + dateOfBirth.replace(',', '|')  + ',' + father_name.replace(',', '|')  + ',' + address.replace(',', '|') +
                ',' + city.replace(',', '|')  + ',' +  state.replace(',', '|')  + ',' + pinCode.replace(',', '|') + '\n'
            )

        csvFile.close()
        absolute_path = 'http://localhost:8000/' + path
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
            return Response({
                "status": "error", "message": "Centre with the same location already exists"},
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
            return Response({
                "status": "error", "message": "Centre with the same location already exists"},
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
            return Response({
                "status": "error", "message": "Course with the same title already exists"},
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
            return Response({
                "status": "error", "message": "Course with the same title already exists"},
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
                return Response({"status": "error",
                    "message": "Subject with the same title in the same course(s) already exists"},
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
                return Response({"status": "error",
                    "message": "Subject with the same title in the same course(s) already exists"},
                    status=HTTP_400_BAD_REQUEST)

        # Remove previous image from system
        if subject.image:
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
            return Response({
                "status": "error", "message": "Unit with the same title in the same subject already exists"},
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
            return Response({
                "status": "error", "message": "Unit with the same title in the same subject already exists"},
                status=HTTP_400_BAD_REQUEST)

        # Remove previous image from system
        if unit.image:
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
            return Response({
                "status": "error",
                "message": "Entered unit must belong to the same subject as the unit being deleted."},
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
            return Response({
                "status": "error", "message": "Test Category with the same title already exists"},
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
            return Response({
                "status": "error", "message": "Test Category with the same title already exists"},
                status=HTTP_400_BAD_REQUEST)

        # Remove previous image from system
        if category.image:
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

    def get_queryset(self):
        super_admin = get_super_admin(self.request.user)
        tests = self.model.objects.filter(super_admin=super_admin).order_by('-pk')
        return tests

# Helper function for adding and editing test info
def validate_test_info(data, super_admin):
    # Search for missing fields
    check_pass, result = fields_check(
        ['title', 'instructions', 'duration', 'typeOfTest', 'description', 'course', 'category'], data)
    if not check_pass:
        return {}, False, result

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
        return ({}, False, Response({
            "status": "error", "message": "Please provide at least one valid course."},
            status=HTTP_400_BAD_REQUEST))
    
    # Get optional fields' values
    op_dict = set_optional_fields(['subject', 'unit', 'endtime', 'startTime'], data)

    subjectObj = None
    if op_dict['subject']:
        subjectObj = get_object_or_404(Subject, pk=int(data['subject']))
    unitObj = None
    if op_dict['unit']:
        unitObj = get_object_or_404(Unit, pk=int(data['unit']))

    # Either none or both subject and unit are compulsory for adding test
    if (subjectObj and not unitObj) or (not subjectObj and unitObj):
        return ({}, False, Response({
            "status": "error",
            "message": "Error in adding test to unit wise test. "
                "Please provide both \"unit\" and \"subject\"."}, status=HTTP_400_BAD_REQUEST))

    # Entered unit must belong to the entered subject
    if subjectObj:
        unit_arr = subjectObj.units.all()
        if unitObj not in unit_arr:
            return ({}, False, Response({
                "status": "error", "message": "Specified unit does not belong to the specified subject."},
                status=HTTP_400_BAD_REQUEST))
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
        return ({}, False, Response({
            "status": "error", "message": "Please provide at least one valid category."},
            status=HTTP_400_BAD_REQUEST))

    # Set start time and end time
    endtime = op_dict['endtime']
    startTime = timezone.now()
    if op_dict['startTime']:
        startTime = data['startTime']

    # Return error if end time is less than start time
    if endtime and startTime:
        if endtime <= str(startTime):
            return ({}, False, Response({
                "status": "error",
                "message": "End Time must be greater than start time (and current time)."},
                status=HTTP_400_BAD_REQUEST))

    # Check if type of test has any value other than practice/upcoming
    typeOfTest = data['typeOfTest']
    if typeOfTest not in ('practice', 'upcoming'):
        return ({}, False, Response({
            "status": "error", "message": "\"Type of test\" must be one of (practice, upcoming)."},
            status=HTTP_400_BAD_REQUEST))

    dictV = {'endtime': endtime, 'startTime': startTime, 'subject': subjectObj, 'unit': unitObj,
             'courses_arr': courses_arr, 'categories_arr': categories_arr}
    return dictV, True, Response({"status": "successful"})

# Parse questions from doc
def parse_doc_ques(testObj):
    pass

# Add info of a test from superadmin dashboard
class AddTestInfoView(CreateAPIView):
    model = Test
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )

    def post(self, request, *args, **kwargs):
        super_admin = get_super_admin(self.request.user)
        data = request.data

        # Do not form another test with the same title
        testObjs = self.model.objects.filter(title=data['title'], super_admin=super_admin)
        if(len(testObjs) != 0):
            return Response({
                "status": "error", "message": "Test with the same title already exists"},
                status=HTTP_400_BAD_REQUEST)

        # Validate and get required values
        dictV, check, response = validate_test_info(data, super_admin)
        if not check:
            return response

        # Get doc value
        op_dict = set_optional_fields(['doc'], data)

        if op_dict['doc']:
            # If docs directory does not exist, then make one
            directory = 'media/docs/'
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
        )

        # Add courses and categories to the test
        testObj.course.set(dictV['courses_arr'])
        testObj.category.set(dictV['categories_arr'])
        testObj.save()

        # Parse questions from doc
        if op_dict['doc']:
            try:
                parse_doc_ques(testObj)
            except Exception:
                testObj.delete()

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

        # Do not form another test with the same title
        testObjs = Test.objects.filter(title=data['title'], super_admin=super_admin)
        if len(testObjs) != 0 and testObj not in testObjs:
            return Response({
                "status": "error", "message": "Test with the same title already exists."},
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
        sections = Section.objects.filter(test__id=test_id).order_by('pk')
        return sections

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
            return Response({
                'status': 'error',
                'message': 'Section with the same title and in the same test already exists.'},
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
def validate_intAnswer(data):
    error = False
    if data['questionType'] == 'integer':
        try:
            intAnswer = int(data['intAnswer'])
            if intAnswer not in range(0, 10):
                error = True
        except ValueError:
            error = True
    if error:
        return (False, Response({
                'status': 'error', 'message': 'Answer must be an integral value ranging from 0 to 9.'},
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
                return Response({
                    'status': 'error', 'message': 'Question type wrongly edited.'},
                    status=HTTP_400_BAD_REQUEST)

        # Return if compulsory fields are missing
        check_pass, result = fields_check(compulsory_list, data)
        if not check_pass:
            return result

        # Return if integer answer is not valid
        valid, result = validate_intAnswer(data)
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
            return Response({
                'status': 'error', 'message': 'Wrong question type provided.'},
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

        self.model.objects.create(
            paragraph=data['paragraph'],
            section=section,
        )

        return Response({ "status": "successful" })

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

class TestFromDocView(APIView):
    def post(self, request, *args, **kwargs):

        test = parser.parse(request.data["doc"])
        testObj = Test.objects.create(title=request.data['title'],
                            course=Course.objects.get(pk=request.data['course']),
                            description=request.data['description'],
                            super_admin=get_super_admin(request.user))
        sections = []
        question_count = [len(test[section]) for section in test]
        questions = []
        options = []
        for section in test:
            sections.append(Section(title=section, test=testObj))
        Section.objects.bulk_create(sections)
        for i in range(len(sections)):
            for question in test[sections[i].title]:
                questions.append(Question(section=sections[i], text=question["question"]))
        Question.objects.bulk_create(questions)

        for i in range(len(sections)):
            for j in range(len(test[sections[i].title])):
                question = test[sections[i].title][j]
                index = j
                if i > 0:
                    index += sum(question_count[:i])
                questionObj = questions[index]
                for option in question["options"]:
                    options.append(Option(text=option[0], correct=option[1], question=questionObj))
        Option.objects.bulk_create(options)
        return Response({ "id" : testObj.pk })

class TestDetailsView(APIView):
    def get(self, request, pk, *args, **kwargs):
        if not request.user or request.user.type_of_user == 'student':
            raise Http404
        testObj = Test.objects.get(pk=pk)
        if testObj.super_admin != get_super_admin(self.request.user):
            raise Http404
        data = TestSerializerFull(testObj).data
        print(data['sections'])
        return Response(data)

class UpdateTestView(UpdateAPIView):
    serializer_class = TestSerializer

    def get_queryset(self):
        super_admin = get_super_admin(self.request.user)
        queryset = Test.objects.filter(super_admin=super_admin)
        return queryset

    def put(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)

class UpdateQuestionView(UpdateAPIView):
    serializer_class = QuestionSerializer
    queryset = Question.objects.all()

    def put(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)

class CreateQuestionView(CreateAPIView):
    serializer_class = QuestionSerializer
    queryset = Question.objects.all()

    def post(self, request, *args, **kwargs):
        response = super(CreateQuestionView, self).post(request, *args, **kwargs)
        qid = response.data['id']
        for _ in range(4):
            Option.objects.create(question_id=qid, text="-"*45)
        return response

class UpdateOptionView(UpdateAPIView):
    serializer_class = OptionSerializer
    queryset = Option.objects.all()

    def put(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)

class GetStaffUsersView(ListAPIView):
    serializer_class = StaffSerializer
    queryset = Staff.objects.all()

class TestListView(ListAPIView):
    serializer_class = TestSerializer

    def get_queryset(self):
        tests = Test.objects.filter(super_admin=get_super_admin(self.request.user)).order_by('-pk')
        return tests

class AddTestManualView(APIView):
    def post(self, request, *args, **kwargs):
        testObj = Test.objects.create(title=request.data['title'],
                            course=Course.objects.get(pk=request.data['course']),
                            description=request.data['description'],
                            super_admin=get_super_admin(request.user))
        Section.objects.create(title="Section 1", test=testObj)
        return Response({ "id" : testObj.pk })

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

