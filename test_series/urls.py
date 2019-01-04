from django.contrib import admin
from django.urls import path, include
from django.conf.urls import url
from django.views.generic import TemplateView, RedirectView
from test_series.views import UserDetailsView, login, logout
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api-auth/user/', UserDetailsView.as_view()),
    path('api-auth/registration/', include('rest_auth.registration.urls')),
    path('api-auth/login/', login),
    path('api-auth/logout/', logout),
    path('api-auth/', include('rest_auth.urls')),
    path('api/', include('api.urls')),
]

# Add browsable static files
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Add template base urls to django port
urlpatterns += [
    url(r'^', TemplateView.as_view(template_name="index.html")),
    path('', RedirectView.as_view(url='/home/')),
]