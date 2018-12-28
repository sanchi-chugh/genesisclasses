## Website for genesis classes.  
  
### Installation
1. Create a virtual environment (python 3).  
2. Activate the virtual env and run requirements file. 
   - source virtualEnvName/bin/activate 
   - pip install -r requirements.txt 
3. Set up local postgresql/mysql database
   - https://www.digitalocean.com/community/tutorials/how-to-use-postgresql-with-your-django-application-on-ubuntu-14-04
4. Migrate database and Start django server on another tab (with virtual env activated)  
   - python manage.py migrate
   - python manage.py runserver
5. Install nodejs and npm on system.  
   - sudo apt-get update  
   - sudo apt-get install nodejs  
   - sudo apt-get install npm 
6. Install webpack in frontend directory
   - cd frontend
   - npm install webpack
7. Install react-pdf renderer in frontend directory
   - npm install @react-pdf/renderer
8. Start npm server
   - npm start
9. App will start running on localhost:8000 (not localhost:3000).

### Login and Initial setup
1. Create superuser
   - python manage.py createsuperuser
2. Visit localhost:8000/admin/ and fill initial data
   - edit above created user obj and set user type as super admin
   - create super admin obj
   - create a course and centre obj
   - create at least one student obj
   - create one more user with usertype student
3. Visit localhost:8000/home/ on browser
   - Login using super admin credentials (for viewing admin dashboard).
   - Login using student credentials (for viewing student dashboard).
