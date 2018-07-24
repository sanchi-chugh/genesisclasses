from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView, RedirectView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('<str>/', TemplateView.as_view(template_name="index.html"), name='frontend'),
    path('', RedirectView.as_view(url='/home/')),
]
