# HTTP Uploader
Simple web server to accept file uploading directly to disk from any host

![app window](https://raw.githubusercontent.com/atomicul/http-uploader/refs/heads/main/.github/example.jpg)

## Running with docker compose
1. Clone the repository
```bash
git clone https://github.com/atomicul/http-uploader.git && cd ./http-uploader
```
2. Modify `compose.yaml` as per your needs, if required
  - You can find details regarding environment variables [here](#environment-variables)
3. Run the containers
```bash
docker compose up
```

## Environment variables
### Frontend app:
All of the following variables are used at build time and are replaced in the compiled javascript:
  - `VITE_BACKEND_URL`: The URL the files are POSTed to.
  - `VITE_BACKEND_PORT`: The port of the backend host. \
    In this case, the hostname part of the URL is inferred from the address bar.
    If `VITE_BACKEND_URL` is set, it will take precedence over this variable and `VITE_BACKEND_PORT` is ignored.
If neither of these are set, the requests are made to the same host and port, on the `/api/` prefix.
This is useful when running behind a reverse proxy, such like the one in the example `compose.yaml` file.

### Backend app:
- `PORT`: The port to run on (default: 3001)
- `MAX_FILE_SIZE`: Maximum acceptable size in bytes for a single file (default: 0)\
  If set to 0, then the size is unlimited.
- `SAVE_DIRECTORY`: Directory to write the files to (default: /uploads)
