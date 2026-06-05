from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    secret_key: str = "dev-secret-key-change-in-production"
    database_url: str = "sqlite:///./steganography.db"
    access_token_expire_minutes: int = 1440
    algorithm: str = "HS256"

    class Config:
        env_file = ".env"


settings = Settings()
