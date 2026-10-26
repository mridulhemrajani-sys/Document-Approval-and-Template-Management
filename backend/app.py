from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:3000",      # React dev server
    "http://localhost:5173",      # Vite dev server
    "https://document-approval-and-template-mana-five.vercel.app",   # Production frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,     
    allow_origin_regex=r"https://document-approval-and-template-management-.*\.vercel\.app",
    allow_credentials=True,          # Allows cookies/authentication headers
    allow_methods=["*"],             # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],             # Allows all headers
)

from routes.auth import auth_router
from routes.templates import templates_router
from routes.users import user_router
from routes.documents import document_routers
from routes.admin import admin_router
from routes.review import review_routers

app.include_router(auth_router)
app.include_router(templates_router)
app.include_router(user_router)
app.include_router(document_routers)
app.include_router(admin_router)
app.include_router(review_routers)

