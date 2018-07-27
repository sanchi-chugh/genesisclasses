from django.shortcuts import render
from api.serializers import StudentSerializer
from rest_framework.generics import UpdateAPIView
from api.models import Student

class CompleteProfileView(UpdateAPIView):
    serializer_class = StudentSerializer

    def get_queryset(self, *args, **kwargs):
        return Student.objects.filter(user=self.request.user)
