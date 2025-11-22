from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from typing import List
import os

from .db import init_db, get_session
from .models import User, Project, Section, Revision, Comment
from .auth import get_password_hash, verify_password, create_access_token, get_current_user
from .llm_adapter import generate_section_text
from .exporter import assemble_docx, assemble_pptx

app = FastAPI(title="AI Document Authoring")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


@app.post("/register")
def register(email: str, password: str, session: Session = Depends(get_session)):
    statement = select(User).where(User.email == email)
    existing = session.exec(statement).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(email=email, hashed_password=get_password_hash(password))
    session.add(user)
    session.commit()
    session.refresh(user)
    return {"id": user.id, "email": user.email}


@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    statement = select(User).where(User.email == form_data.username)
    user = session.exec(statement).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}


@app.get("/projects", response_model=List[Project])
def list_projects(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    statement = select(Project).where(Project.owner_id == current_user.id)
    projects = session.exec(statement).all()
    return projects


@app.post("/projects")
def create_project(title: str, doc_type: str, prompt: str = None, outline: List[str] | None = None, slides: int | None = None, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    if doc_type not in ("docx", "pptx"):
        raise HTTPException(status_code=400, detail="doc_type must be 'docx' or 'pptx'")
    project = Project(title=title, doc_type=doc_type, prompt=prompt, owner_id=current_user.id)
    session.add(project)
    session.commit()
    session.refresh(project)
    # create sections
    sections = []
    if doc_type == "docx":
        if not outline:
            outline = ["Introduction", "Analysis", "Recommendations"]
        for i, h in enumerate(outline):
            s = Section(project_id=project.id, title=h, order=i)
            session.add(s)
            sections.append(s)
    else:
        if not slides:
            slides = 5
        for i in range(slides):
            title_slide = f"Slide {i+1}"
            s = Section(project_id=project.id, title=title_slide, order=i)
            session.add(s)
            sections.append(s)
    session.commit()
    return {"project_id": project.id}


@app.post("/projects/{project_id}/generate")
def generate_project(project_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    project = session.get(Project, project_id)
    if not project or project.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    statement = select(Section).where(Section.project_id == project_id).order_by(Section.order)
    sections = session.exec(statement).all()
    for s in sections:
        generated = generate_section_text(s.title, project.prompt)
        s.content = generated
        session.add(s)
    session.commit()
    return {"status": "ok", "sections": [ {"id": s.id, "title": s.title, "content": s.content} for s in sections ] }


@app.post("/projects/{project_id}/sections/{section_id}/refine")
def refine_section(project_id: int, section_id: int, prompt: str, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    project = session.get(Project, project_id)
    if not project or project.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    section = session.get(Section, section_id)
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    new_text = generate_section_text(section.title, prompt, context=section.content)
    revision = Revision(section_id=section.id, prompt=prompt, new_content=new_text)
    session.add(revision)
    section.content = new_text
    session.add(section)
    session.commit()
    session.refresh(revision)
    return {"revision_id": revision.id, "new_content": new_text}


@app.get("/projects/{project_id}")
def get_project(project_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    project = session.get(Project, project_id)
    if not project or project.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    statement = select(Section).where(Section.project_id == project_id).order_by(Section.order)
    sections = session.exec(statement).all()
    sections_payload = [{"id": s.id, "title": s.title, "content": s.content or "", "order": s.order} for s in sections]
    return {"id": project.id, "title": project.title, "doc_type": project.doc_type, "prompt": project.prompt, "sections": sections_payload}


@app.put("/projects/{project_id}/sections/{section_id}")
def update_section(project_id: int, section_id: int, title: str | None = None, content: str | None = None, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    project = session.get(Project, project_id)
    if not project or project.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    section = session.get(Section, section_id)
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    if title is not None:
        section.title = title
    if content is not None:
        section.content = content
    session.add(section)
    session.commit()
    return {"ok": True, "section": {"id": section.id, "title": section.title, "content": section.content}}


@app.post("/projects/{project_id}/sections/{section_id}/feedback")
def feedback(project_id: int, section_id: int, liked: bool, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    project = session.get(Project, project_id)
    if not project or project.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    section = session.get(Section, section_id)
    section.feedback_like = liked
    session.add(section)
    session.commit()
    return {"ok": True}


@app.post("/projects/{project_id}/sections/{section_id}/comment")
def comment(project_id: int, section_id: int, text: str, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    project = session.get(Project, project_id)
    if not project or project.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    comment = Comment(section_id=section_id, text=text)
    session.add(comment)
    session.commit()
    return {"ok": True}


@app.get("/projects/{project_id}/export")
def export_project(project_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    project = session.get(Project, project_id)
    if not project or project.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    statement = select(Section).where(Section.project_id == project_id).order_by(Section.order)
    sections = session.exec(statement).all()
    sections_payload = [{"title": s.title, "content": s.content or ""} for s in sections]
    if project.doc_type == "docx":
        data = assemble_docx(project.title, sections_payload)
        from fastapi.responses import StreamingResponse
        return StreamingResponse(iter([data]), media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", headers={"Content-Disposition": f"attachment; filename=project_{project.id}.docx"})
    else:
        data = assemble_pptx(project.title, sections_payload)
        from fastapi.responses import StreamingResponse
        return StreamingResponse(iter([data]), media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation", headers={"Content-Disposition": f"attachment; filename=project_{project.id}.pptx"})
