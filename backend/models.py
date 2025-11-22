from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    hashed_password: str
    projects: List["Project"] = Relationship(back_populates="owner")

class Project(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int = Field(foreign_key="user.id")
    title: str
    doc_type: str  # 'docx' or 'pptx'
    prompt: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    sections: List["Section"] = Relationship(back_populates="project")
    owner: Optional[User] = Relationship(back_populates="projects")

class Section(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="project.id")
    title: Optional[str] = None
    order: int = 0
    content: Optional[str] = None
    feedback_like: Optional[bool] = None
    revisions: List["Revision"] = Relationship(back_populates="section")
    comments: List["Comment"] = Relationship(back_populates="section")
    project: Optional[Project] = Relationship(back_populates="sections")

class Revision(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    section_id: int = Field(foreign_key="section.id")
    prompt: Optional[str] = None
    new_content: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    section: Optional[Section] = Relationship(back_populates="revisions")

class Comment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    section_id: int = Field(foreign_key="section.id")
    text: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    section: Optional[Section] = Relationship(back_populates="comments")
