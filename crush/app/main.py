from fastapi import FastAPI

from app.routers import regions, places

app = FastAPI()


@app.get("/")
async def root():
  return {"message": "Hello World"}


@app.get("/hello/{name}")
async def say_hello(name: str):
  return {"message": f"Hello {name}"}


app.include_router(regions.router)
app.include_router(places.router)
