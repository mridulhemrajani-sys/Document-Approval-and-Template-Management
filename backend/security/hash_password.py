import bcrypt

def create_hash_password(password):
    try:
        salt = bcrypt.gensalt()
        bytes_password = password.encode('utf-8')
        hashed_password = bcrypt.hashpw(bytes_password, salt)
        return hashed_password.decode('utf-8')
    except Exception as e:
        print(e)