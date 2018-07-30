from django.shortcuts import render
from api.serializers import StudentSerializer, CentreSerializer, CourseSerializer
from rest_framework.generics import UpdateAPIView, ListAPIView
from api.models import Student, Centre, Course
from rest_framework.views import APIView
from api.models import Student, Centre
from rest_framework import viewsets


class CompleteProfileView(UpdateAPIView):
    serializer_class = StudentSerializer

    def get_queryset(self, *args, **kwargs):
        return Student.objects.filter(user=self.request.user)

    def put(self, request, *args, **kwargs):
        response = super(CompleteProfileView, self).put(request,
                                                    *args,
                                                    **kwargs)
        if response.status_code == 200:
            obj = Student.objects.get(id=kwargs['pk'])
            obj.complete = True
            obj.save()
        return response

class CentreViewSet(viewsets.ReadOnlyModelViewSet):
    model = Centre
    serializer_class = CentreSerializer

    def get_queryset(self):
        type_of_user = self.request.user.type_of_user
        if type_of_user == 'student':
            super_admin = self.request.user.student.super_admin
        elif type_of_user == 'staff':
            super_admin = self.request.user.staff.super_admin
        else:
            super_admin = self.request.user.superadmin
        queryset = self.model.objects.filter(super_admin=super_admin)
        return queryset

class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    # TODO: override get_queryset
