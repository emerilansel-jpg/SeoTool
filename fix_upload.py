import paramiko
import os
import stat

# Config
hostname = '148.230.103.98'
port = 22
username = 'seotool'
password = '1CBhO9mrTvM4OAJf'
local_path = 'G:/SF Project/JetDigitalSEO'
remote_path = '/home/seotool/JetDigitalSEO'

def remove_remote_dir(sftp, path):
    """Recursively remove a remote directory."""
    try:
        for entry in sftp.listdir_attr(path):
            entrypath = f'{path}/{entry.filename}'
            if stat.S_ISDIR(entry.st_mode):
                remove_remote_dir(sftp, entrypath)
            else:
                sftp.remove(entrypath)
        sftp.rmdir(path)
    except Exception as e:
        print(f"Error removing {path}: {e}")

try:
    t = paramiko.Transport((hostname, port))
    t.connect(username=username, password=password)
    sftp = paramiko.SFTPClient.from_transport(t)

    print("Cleaning remote directory...")
    # We only want to clean src and scripts to fix the pathing issue, but to be safe and since it's a fresh deploy, let's just clean the whole root.
    # However, we already have .env.hosted and docker-compose.hosted.yaml configured.
    # Let's selectively clean.
    
    dirs_to_clean = ['src', 'scripts', 'e2e', 'public', 'badseo', 'web', 'dist', '.agents', '.claude']
    
    for d in dirs_to_clean:
        remote_d = f'{remote_path}/{d}'
        print(f"Cleaning {remote_d}...")
        remove_remote_dir(sftp, remote_d)

    print("Re-uploading files...")
    # Walk local directory
    for root, dirs, files in os.walk(local_path):
        # Skip node_modules and .git to save time
        if 'node_modules' in root or '.git' in root or '.wrangler' in root or '.tanstack' in root or '.zcode' in root or 'test-results' in root:
            continue

        # Determine relative path
        relpath = os.path.relpath(root, local_path)
        # CRITICAL FIX: Force forward slashes for remote path
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
            # CRITICAL FIX: Force forward slashes for remote file
            remote_file = os.path.join(remote_root, file).replace('\\', '/')
            
            # If the file path looks like it has a backslash in the filename (from the old bug), skip it or fix it.
            # Actually, os.path.join will use backslash on Windows.
            
            print(f'Upload: {local_file} -> {remote_file}')
            try:
                sftp.put(local_file, remote_file)
            except Exception as e:
                print(f'Error uploading {local_file}: {e}')

    print('File transfer complete!')
    t.close()

except Exception as e:
    print(f'Error: {e}')
