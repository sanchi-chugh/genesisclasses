## Website for genesis classes.  
  
### Installation
1. Create a virtual environment (python 3).  
2. Activate the virtual env and run requirements file. 
   - source virtualEnvName/bin/activate 
   - pip install -r requirements.txt 
3. Set up local postgresql/mysql database
   - https://www.digitalocean.com/community/tutorials/how-to-use-postgresql-with-your-django-application-on-ubuntu-14-04
4. Migrate database and Start django server  
   - python manage.py migrate
   - python manage.py runserver
5. Open new tab in terminal and install nodejs and npm on system.  
   - sudo apt-get update  
   - sudo apt-get install nodejs  
   - sudo apt-get install npm 
6. Install webpack in genesisclasses/frontend directory
   - cd genesisclasses/frontend
   - npm install webpack
7. Install react-pdf renderer in frontend directory
   - npm install @react-pdf/renderer
8. Install other packages mentioned in package.json
   - npm install
9. Start npm server
   - npm start
10. Keep both servers running and app will start running on localhost:8000 (not localhost:3000).

### Login and Initial setup
1. Create superuser
   - python manage.py createsuperuser
2. Visit localhost:8000/admin/ and fill initial data
   - edit above created user obj and set user type as super admin
   - create a course and centre obj
   - create at least one user with user type student
   - super admin and student objects will be created automatically
3. Visit localhost:8000/home/ on browser
   - Login using super admin credentials (for viewing admin dashboard).
   - Login using student credentials (for viewing student dashboard).


## Deployment of Django + React App

### Initial setup on server
1. Deploy django app
   - Create virtual env and active it
   - Install python packages in venv by running pip install -r requirements
   - Configure apache, follow https://www.digitalocean.com/community/tutorials/how-to-serve-django-applications-with-apache-and-mod_wsgi-on-ubuntu-14-04
2. Check if the django app is running smoothly
   - Open http://PublicIP/admin/ and see if the admin page is loading smoothly
   - If css does not load on page, remove /static settings from wsgi.py file.
3. Turn on production settings
   - sudo nano test_series/settings.py, and turn DEPLOYED = True
4. Deploy React App
   - Install node and npm globally
   - cd frontend
   - Install node_modules by running npm install
   - Make production build by running npm run build (this will create an assets folder having bundles)
   - Restart apache2 service, sudo service apache2 restart
5. Read integration of react with django using django-webpack-loader
   - https://www.techiediaries.com/django-webpack-react/