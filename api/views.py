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

    # Return True if check passes
    if len(missing_fields) == 0:
        return (True, '')
    return (False, Response({
        "status": "error", "message": "Some fields are missing. Please provide \"" + '", "'.join(missing_fields) + "\""}, 
        status=HTTP_400_BAD_REQUEST))

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
class AddStudentUserViewSet(CreateAPIView):
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

        # Do not form another student with the same email id
        userObjs = User.objects.filter(email=email, type_of_user='student')
        if(len(userObjs) != 0):
            return Response({
                "status": "error", "message": "A student with the same email id already exists."})

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
                "status": "error", "message": "Please provide at least one valid course"})

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
        student.contact_number=int(data['contact_number'])
        student.centre=centre
        student.course.set(courses_arr)
        student.save()
        
        # Add rest of the values
        student.father_name = None
        if 'father_name' in data:
            student.father_name = data['father_name']
        
        student.address = None
        if 'address' in data:
            student.address = data['address']
        
        student.city = None
        if 'city' in data:
            student.city = data['city']

        student.state = None
        if 'state' in data:
            student.state = data['state']

        student.pinCode = None
        if 'pinCode' in data:
            student.pinCode = data['pinCode']

        student.gender = None
        if 'gender' in data:
            student.gender = data['gender']

        student.dateOfBirth = None
        if 'dateOfBirth' in data:
            student.dateOfBirth = data['dateOfBirth']

        student.image = None
        if 'image' in data:
            student.image = data['image']
        
        student.save()

        return Response({"status": "successful"})

# Edit a student belonging to a centre of the respective super admin
class EditStudentUserViewSet(UpdateAPIView):
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

        # Do not form another student with the same email id
        if email != studentUserObj.email:
            userObjs = User.objects.filter(email=email, type_of_user='student')
            if len(userObjs) != 0:
                return Response({
                    "status": "error", "message": "A student with the same email id already exists."})
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
                "status": "error", "message": "Please provide at least one valid course"})
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
class AddBulkStudentsViewSet(CreateAPIView):
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
                "status": "error", "message": "Please provide at least one valid course"})

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
class AddCentreViewSet(CreateAPIView):
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
                "status": "error", "message": "Centre with the same location already exists"})
        Centre.objects.create(location=location, super_admin=super_admin)
        return Response({"status": "successful"})

# Update centre for the required superadmin
class EditCentreViewSet(UpdateAPIView):
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
                "status": "error", "message": "Centre with the same location already exists"})

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
class AddCourseViewSet(CreateAPIView):
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
                "status": "error", "message": "Course with the same title already exists"})
        self.model.objects.create(title=title, super_admin=super_admin)
        return Response({"status": "successful"})

# Update course for the requested superadmin
class EditCourseViewSet(UpdateAPIView):
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
                "status": "error", "message": "Course with the same title already exists"})

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
class AddSubjectViewSet(CreateAPIView):
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
                    "message": "Subject with the same title in the same course(s) already exists"})

        # Image and description are optional
        image = None
        if 'image' in data:
            image = data['image']
        description = None
        if 'description' in data:
            description = data['description']
        subject = self.model.objects.create(
            title=title,
            description=description,
            image=image,
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
class EditSubjectViewSet(UpdateAPIView):
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
                    "message": "Subject with the same title in the same course(s) already exists"})

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
        # If units and tests have to be shifted to another subject
        # **needed in case of unit wise tests only**
        transfer_subj = get_object_or_404(Subject, pk=int(transfer_subj))
        unitObjs = Unit.objects.filter(subject=subjectObj)
        for unitObj in unitObjs:
            unitObj.subject = transfer_subj
            unitObj.save()
        testObjs = Test.objects.filter(subject=subjectObj)
        for testObj in testObjs:
            testObj.subject = transfer_subj
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

# Shows list of units of a particular subject
class SubjectWiseUnitViewSet(viewsets.ReadOnlyModelViewSet):
    model = Unit
    serializer_class = SubjectWiseUnitSerializer
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        super_admin = get_super_admin(self.request.user)
        subjects = Subject.objects.filter(super_admin=super_admin)
        return subjects

# Adds a unit for the requested superadmin
class AddUnitViewSet(CreateAPIView):
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
                "status": "error", "message": "Unit with the same title in the same subject already exists"})

        # Image and description are optional
        image = None
        if 'image' in data:
            image = data['image']
        description = None
        if 'description' in data:
            description = data['description']
        self.model.objects.create(
            title=title,
            description=description,
            image=image,
            subject=subject,
            )
        return Response({'status': 'successful'})

# Edit a unit for the requested superadmin
class EditUnitViewSet(UpdateAPIView):
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
                "status": "error", "message": "Unit with the same title in the same subject already exists"})

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
        # **needed in case of unit wise tests only**
        transfer_unit = get_object_or_404(Unit, pk=int(transfer_unit))
        testObjs = Test.objects.filter(unit=unitObj)
        for testObj in testObjs:
            testObj.unit = transfer_unit
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
class AddTestCategoryViewSet(CreateAPIView):
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
                "status": "error", "message": "Test Category with the same title already exists"})
        
        # Image and description are optional
        image = None
        if 'image' in data:
            image = data['image']
        description = None
        if 'description' in data:
            description = data['description']
        self.model.objects.create(
            title=title,
            super_admin=super_admin,
            image=image,
            description=description,
            )

        return Response({"status": "successful"})

# Edits a test category for the requested superadmin
class EditTestCategoryViewSet(UpdateAPIView):
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
                "status": "error", "message": "Test Category with the same title already exists"})

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
    transfer_category = request.data.get('category')
    if transfer_category:
        # If tests have to be shifted to another category
        # otherwise tests belonging to this category will be deleted
        transfer_category = get_object_or_404(Category, pk=int(transfer_category))
        testObjs = Test.objects.filter(category=transfer_category)
        for testObj in testObjs:
            testObj.category = transfer_category
            testObj.save()

    categoryObj.delete()
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

class AddSectionView(APIView):
    def post(self, request, *args, **kwargs):
        Section.objects.create(test_id=request.data['test'], title=request.data['title'])
        return Response({ "status": "successful" })

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

