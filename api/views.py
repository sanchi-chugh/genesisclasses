from django.shortcuts import render
from api.serializers import StudentSerializer, CentreSerializer, CourseSerializer
from rest_framework.generics import UpdateAPIView, ListAPIView
from api.models import Student, Centre, Course

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

# To get the centres for the particular superadmin / institute that the student
# belongs to.
class CentreListView(ListAPIView):
    model = Centre
    serializer_class = CentreSerializer
    paginate_by = 100

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

# To get the courses for the particular superadmin / institute that the student
# belongs to
class CentreListView(ListAPIView):
    model = Centre
    serializer_class = CentreSerializer
    paginate_by = 100

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
