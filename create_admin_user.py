import sqlite3

# Conectar a la base de datos
conn = sqlite3.connect('database.sqlite')
c = conn.cursor()

# Crear la tabla users si no existe
c.execute('''CREATE TABLE IF NOT EXISTS users
             (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT, role TEXT)''')

# Solicitar el nombre de usuario y la contraseña
username = input("Ingrese el nombre de usuario: ")
password = input("Ingrese la contraseña: ")

# Insertar el nuevo usuario
c.execute("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", (username, password, "admin"))

# Guardar los cambios y cerrar la conexión
conn.commit()
conn.close()
print("Usuario insertado correctamente.")