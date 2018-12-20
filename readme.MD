## Website for genesis classes.  
  
### Installation
1. Create a virtual environment (python 3).  
2. Activate the virtual env and run requirements file. 
   - source virtualEnvName/bin/activate 
   - pip install -r requirements.txt   
3. Install nodejs and npm on system.  
   - sudo apt-get update  
   - sudo apt-get install nodejs  
   - sudo apt-get install npm  
4. Install webpack
   - npm install webpack
5. Install react-pdf renderer
   - npm install @react-pdf/renderer
6. Start npm server in directory frontend
   - cd frontend
   - npm start
7. Start django server on another tab (with virtual env activated)  
   - python manage.py runserver
8. App will start running on localhost:8000 (not localhost:3000).

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
