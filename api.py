from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
import subprocess

#from src.responsemodel import ResponseModel

app: FastAPI = FastAPI()

API_V1_ENDPOINT = "/api/v1"

# Set up CORS
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def returnNothing():
    return {"data": ""}

@app.get("/{url}")
async def loadURL(url: str):
    url = url.replace("SLASHINGTON", "/")
    print(url)
    if url[-1] == "/":
        url = url[0: -1]
    if ".pdf" in url or ".PDF" in url:
        with open('output.pdf', 'wb') as f:
            response = requests.get("http://" + url)
            f.write(response.content)
        subprocess.call(['sh', './pdf2html']) 
        with open('output.html') as f: 
            s = f.read()
            subprocess.call(['sh', './deleteOutputFiles'])
            return {"data": s}
    else:
        r = requests.get("http://localhost:8080/?http://" + url)
        #r = requests.get("http://" + url)
        return {"data": r.text}
        #return {"url": "http://"+url, "response": r.json()}
