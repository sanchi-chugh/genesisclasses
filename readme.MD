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
8. Start npm server
   - npm start
9. Keep both servers running and app will start running on localhost:8000 (not localhost:3000).

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
