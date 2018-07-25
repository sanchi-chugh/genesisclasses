from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView, RedirectView
from test_series.views import UserDetailsView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api-auth/user/', UserDetailsView.as_view()),
    path('api-auth/', include('rest_auth.urls')),
    path('api-auth/registration/', include('rest_auth.registration.urls')),
    path('api/', include('api.urls')),
    path('<str>/', TemplateView.as_view(template_name="index.html"), name='frontend'),
    path('', RedirectView.as_view(url='/home/')),
]
