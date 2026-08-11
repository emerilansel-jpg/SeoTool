import paramiko
import os

# Config
hostname = '148.230.103.98'
port = 22
username = 'seotool'
password = '1CBhO9mrTvM4OAJf'
local_path = 'G:/SF Project/JetDigitalSEO'
remote_path = '/home/seotool/JetDigitalSEO'

try:
    t = paramiko.Transport((hostname, port))
    t.connect(username=username, password=password)
    sftp = paramiko.SFTPClient.from_transport(t)

    # Walk local directory
    for root, dirs, files in os.walk(local_path):
        # Skip node_modules and .git to save time
        if 'node_modules' in root or '.git' in root:
            continue

        # Determine relative path
        relpath = os.path.relpath(root, local_path)
        remote_root = os.path.join(remote_path, relpath).replace('\\', '/')

        # Create remote directory
        try:
            sftp.stat(remote_root)
        except FileNotFoundError:
            print(f'Mkdir: {remote_root}')
            try:
                sftp.mkdir(remote_root)
            except Exception as e:
                print(f'Error creating directory {remote_root}: {e}')
                continue

        # Upload files
        for file in files:
            local_file = os.path.join(root, file)
            remote_file = os.path.join(remote_root, file).replace('\\', '/')
            print(f'Upload: {local_file} -> {remote_file}')
            try:
                sftp.put(local_file, remote_file)
            except Exception as e:
                print(f'Error uploading {local_file}: {e}')

    print('File transfer complete!')
    t.close()

except Exception as e:
    print(f'Error: {e}')
