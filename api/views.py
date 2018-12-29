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
# Shows list of centres (permitted to a superadmin only)
class CentreViewSet(viewsets.ReadOnlyModelViewSet):
    model = Centre
    serializer_class = CentreSerializer
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )

    def get_queryset(self):
        super_admin = get_super_admin(self.request.user)
        queryset = self.model.objects.filter(super_admin=super_admin)
        return queryset

# Adds a centre for the requested superadmin
class AddCentreViewSet(CreateAPIView):
    model = Centre
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )

    def post(self, request, *args, **kwargs):
        super_admin = get_super_admin(self.request.user)
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
        location = request.data['location']
        pk = kwargs['pk']

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
        queryset = self.model.objects.filter(super_admin=super_admin)
        return queryset

# Adds a course for the requested superadmin
class AddCourseViewSet(CreateAPIView):
    model = Course
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )

    def post(self, request, *args, **kwargs):
        super_admin = get_super_admin(self.request.user)
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
        title = request.data['title']
        pk = kwargs['pk']

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
        queryset = self.model.objects.filter(super_admin=super_admin)
        return queryset

# Adds a subject for the requested superadmin
class AddSubjectViewSet(CreateAPIView):
    model = Subject
    permission_classes = (permissions.IsAuthenticated, IsSuperadmin, )

    def post(self, request, *args, **kwargs):
        super_admin = get_super_admin(self.request.user)
        data = request.data

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

class GetStudentUsersView(ListAPIView):
    serializer_class = StudentSerializer
    queryset = Student.objects.select_related('user', 'course', 'centre').all()

class AddBulkStudentsView(APIView):
    def post(self, request, *args, **kwargs):
        n = int(request.data['no_of_students'])
        count = 0
        users = []
        passwords = []
        students = []
        existing = [x['username'] for x in User.objects.values('username')]
        while (count < n):
            username = "GE" + uuid.uuid4().hex[:5].upper()
            password = uuid.uuid4().hex[:8].lower()
            if username not in existing:
                existing.append(username)
                user = User(username=username, type_of_user="student")
                user.set_password(password)
                users.append(user)
                passwords.append(password)
                # create user here
                count += 1
        User.objects.bulk_create(users)
        for user in users:
            students.append(Student(user=user, super_admin=get_super_admin(request.user)))
        Student.objects.bulk_create(students)
        return Response({
            "detail": "successfull",
            "users": [(users[i].username, passwords[i]) for i in range(n)]
        })

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

