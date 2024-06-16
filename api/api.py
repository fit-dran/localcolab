import json
import pymysql


#CREATE TABLE Users (
#    email VARCHAR(100) NOT NULL PRIMARY KEY,
#    username VARCHAR(50) NOT NULL,
#    password VARCHAR(255) NOT NULL,
#    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
#    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
#)
#CREATE TABLE Posts (
#    post_id INT AUTO_INCREMENT PRIMARY KEY,
#    email VARCHAR(100) NOT NULL,
#    category_id INT NOT NULL,
#    title VARCHAR(255) NOT NULL,
#    content TEXT NOT NULL,
#    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
#    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
#    FOREIGN KEY (email) REFERENCES Users(email),
#    FOREIGN KEY (category_id) REFERENCES Categories(category_id)
#)
#CREATE TABLE Comments (
#    comment_id INT AUTO_INCREMENT PRIMARY KEY,
#    post_id INT NOT NULL,
#    email VARCHAR(100) NOT NULL,
#    content TEXT NOT NULL,
#    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
#    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
#    FOREIGN KEY (post_id) REFERENCES Posts(post_id),
#    FOREIGN KEY (email) REFERENCES Users(email)
#)
#CREATE TABLE Categories (
#    category_id INT AUTO_INCREMENT PRIMARY KEY,
#    name VARCHAR(50) NOT NULL
#);


# MySQL RDS connection details
endpoint = 'database-1.cbm0a4s46mbs.us-east-1.rds.amazonaws.com'
port = 3306
user = 'admin'
password = '%e9e!QH^6nJ9bK'
database = 'localpulse'

status_check_path = '/status'
user_path = '/user'
users_path = '/users'
post_path = '/post'
posts_path = '/posts'
comment_path = '/comment'
comments_path = '/comments'
category_path = '/category'

def lambda_handler(event, context):
    print('Request event: ', event)
    response = None
    connection = None
    
    try:
        http_method = event.get('httpMethod')
        path = event.get('path')

        connection = pymysql.connect(host=endpoint, user=user, port=port, passwd=password, db=database)
        
        if http_method == 'GET' and path == status_check_path:
            response = build_response(200, 'Service is operational')
        # Add more handlers for other paths and methods as needed
        
        
        # User CRUD operations
        elif http_method == 'GET' and path == user_path:
            response = build_response(400, 'Request body is missing or empty')
            user_id = event['queryStringParameters']['userid']
            response = get_user(connection, user_id)
        elif http_method == 'GET' and path == users_path:
            response = get_users(connection)
        elif http_method == 'POST' and path == user_path:
            if event['body'] is None:
                response = build_response(400, 'Request body is missing or empty')
            else:
                response = save_user(connection, json.loads(event['body']))
        elif http_method == 'PATCH' and path == user_path:
            if event['body'] is None:
                response = build_response(400, 'Request body is missing or empty')
            else:
                body = json.loads(event['body'])
                response = modify_user(connection, body['email'], body['update_key'], body['update_value'])
        elif http_method == 'DELETE' and path == user_path:
            body = json.loads(event['body'])
            response = delete_user(connection, body['email'])

        # Post CRUD operations

        elif http_method == 'GET' and path == post_path:
            response = build_response(400, 'Request body is missing or empty')
            post_id = event['queryStringParameters']['postid']
            response = get_post(connection, post_id)
        elif http_method == 'GET' and path == posts_path:
            response = get_posts(connection)

        # Category CRUD operations


        elif http_method == 'OPTIONS':
            response = build_response(200, 'Options request successful')
        else:
            response = build_response(404, '404 Not Found')

    except Exception as e:
        response = build_response(500, 'Internal Server Error')
    
    # Add CORS headers to the response
    headers = {
        'Access-Control-Allow-Origin': '*',  # Adjust this to specific origins if needed
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE,PATCH'
    }

    return {
        'statusCode': response['statusCode'],
        'headers': headers,
        'body': json.dumps(response['body'])
    }

def build_response(status_code, message):
    return {
        'statusCode': status_code,
        'body': {
            'message': message
        }
    }

# The rest of your CRUD functions here

def get_user(connection, user_email):
    try:
        with connection.cursor() as cursor:
            cursor.execute('SELECT * FROM Users WHERE email = %s', (user_email,))
            row = cursor.fetchone()
            if row:
                return build_response(200, {'email': row[0], 'username': row[1], 'password': row[2]})
            else:
                return build_response(404, 'User not found')
    except pymysql.MySQLError as e:
        print('Error:', e)
    

def get_users(connection):
    try:
        with connection.cursor() as cursor:
            cursor.execute('SELECT * FROM Users')
            rows = cursor.fetchall()
            result = []
            for row in rows:
                result.append({'email': row[0], 'username': row[1]})
            return build_response(200, result)
    except pymysql.MySQLError as e:
        print('Error:', e)
        return build_response(500, f'Database error: {e}')

def save_user(connection, request_body):
    try:
        with connection.cursor() as cursor:
            cursor.execute('INSERT INTO Users (email, username, password) VALUES (%s, %s, %s)', (request_body['email'], request_body['username'], request_body['password']))
            connection.commit()
            return build_response(200, {'Operation': 'SAVE', 'Message': 'SUCCESS', 'Item': request_body})
    except pymysql.MySQLError as e:
        print('Error:', e)
        return build_response(500, f'Database error: {e}')

def modify_user(connection, email, update_key, update_value):
    try:
        with connection.cursor() as cursor:
            cursor.execute(f'UPDATE Users SET {update_key} = %s WHERE email = %s', (update_value, email))
            connection.commit()
            return build_response(200, {'Operation': 'UPDATE', 'Message': 'SUCCESS'})
    except pymysql.MySQLError as e:
        print('Error:', e)
        return build_response(500, f'Database error: {e}')

def delete_user(connection, email):
    try:
        with connection.cursor() as cursor:
            cursor.execute('DELETE FROM Users WHERE email = %s', (email,))
            connection.commit()
            return build_response(200, {'Operation': 'DELETE', 'Message': 'SUCCESS'})
    except pymysql.MySQLError as e:
        print('Error:', e)
        return build_response(500, f'Database error: {e}')

# Repeat similar CRUD functions for Posts, Comments, Categories, etc.

def get_post(connection, post_id):
    try:
        with connection.cursor() as cursor:
            cursor.execute('SELECT * FROM Posts WHERE post_id = %s', (post_id,))
            row = cursor.fetchone()
            if row:
                return build_response(200, {'post_id': row[0], 'email': row[1], 'category_id': row[2], 'title': row[3], 'content': row[4]})
            else:
                return build_response(404, 'Post not found')
    except pymysql.MySQLError as e:
        print('Error:', e)
        return build_response(500, f'Database error: {e}')
    
def get_posts(connection):
    try:
        with connection.cursor() as cursor:
            cursor.execute('SELECT * FROM Posts')
            rows = cursor.fetchall()
            result = []
            for row in rows:
                cursor.execute('SELECT * FROM Comments WHERE post_id = %s', (row[0],))
                comments = cursor.fetchall()
                comments_list = []
                for comment in comments:
                    comments_list.append({'comment_id': comment[0], 'email': comment[2], 'content': comment[3]})
                result.append({'post_id': row[0], 'email': row[1], 'category_id': row[2], 'title': row[3], 'content': row[4], 'comments': comments_list})
            return build_response(200, result)
        
    except pymysql.MySQLError as e:
        print('Error:', e)
        return build_response(500, f'Database error: {e}')
    

    
# Category CRUD methods

def get_category(connection, category_id):
    try:
        with connection.cursor() as cursor:
            cursor.execute('SELECT * FROM Categories WHERE category_id = %s', (category_id,))
            row = cursor.fetchone()
            if row:
                return build_response(200, {'category_id': row[0], 'name': row[1]})
            else:
                return build_response(404, 'Category not found')
    except pymysql.MySQLError as e:
        print('Error:', e)
        return build_response(500, f'Database error: {e}')
    
