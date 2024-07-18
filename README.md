# Welcome to frontend (FE) part of cd terminal.

## This component is responsible to render a terminal for authenticated users. Also, includes unit tests for important features

### Steps to run app

### Change port of proxy in package.json to match your running backend application. If you run BE first you could probably skip this step. Default to 3000
Default setting: ``` "proxy": "http://localhost:3000" ```

### Install dependencies
```bash npm install ```

### Run app
```bash npm run start ```

### Run unit tests
```bash npm run test ```

### Main features
- Basic register page for user (http://localhost:4000/register) 
- Login page (http://localhost:4000/)
- Terminal screen (http://localhost:4000/ once user is authenticated)

### Terminal features
- cd: Move to a directory using cd command as per described in task. Examples [cd, cd .., cd ../test, cd ./]
- ls: This basically return the last directory from user, does not list all directories yet.
- history: list last commands used. Similar to a history linux command
- clear: clear all things in terminal
- mkdir: comming soon

### TODO LIST
- Improve interface to resemble a real terminal
- Add mkdir feature
- Once mkdir is implemented, adjust ls command to properly handle file hierarchies

![image](https://github.com/user-attachments/assets/b1193019-6b1b-49c0-a71a-18618ce34ed1)
