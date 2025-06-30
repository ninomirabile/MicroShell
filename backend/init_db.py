"""
Database initialization script for MicroShell Backend.
Creates tables, roles, and initial admin user.
"""

from app.database import SessionLocal, engine
from app.models import Base, User, Role
from app.services.auth_service import AuthService
from app.config import settings


def init_database():
    """Initialize database with tables and initial data."""
    print("🔄 Creating database tables...")

    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully")

    # Create initial data
    db = SessionLocal()
    try:
        # Create roles if they don't exist
        admin_role = db.query(Role).filter(Role.name == "admin").first()
        if not admin_role:
            admin_role = Role(
                name="admin",
                description="Administrator role with full access"
            )
            db.add(admin_role)
            print("✅ Admin role created")

        user_role = db.query(Role).filter(Role.name == "user").first()
        if not user_role:
            user_role = Role(
                name="user",
                description="Standard user role"
            )
            db.add(user_role)
            print("✅ User role created")

        db.commit()
        db.refresh(admin_role)
        db.refresh(user_role)

        # Create admin user if it doesn't exist
        admin_user = db.query(User).filter(
            User.email == settings.ADMIN_EMAIL).first()
        if not admin_user:
            hashed_password = AuthService.get_password_hash(
                settings.ADMIN_PASSWORD)
            admin_user = User(
                email=settings.ADMIN_EMAIL,
                username="admin",
                full_name="System Administrator",
                hashed_password=hashed_password,
                role_id=admin_role.id,
                is_active=True,
                is_verified=True
            )
            db.add(admin_user)
            db.commit()
            print(f"✅ Admin user created: {settings.ADMIN_EMAIL}")
            print(f"🔑 Admin password: {settings.ADMIN_PASSWORD}")
        else:
            print(f"ℹ️  Admin user already exists: {settings.ADMIN_EMAIL}")

        # Create some sample users
        sample_users = [
            {
                "email": "user1@microshell.com",
                "username": "user1",
                "full_name": "John Doe",
                "password": "password123"
            },
            {
                "email": "user2@microshell.com",
                "username": "user2",
                "full_name": "Jane Smith",
                "password": "password123"
            }
        ]

        for user_data in sample_users:
            existing_user = db.query(User).filter(
                User.email == user_data["email"]).first()
            if not existing_user:
                hashed_password = AuthService.get_password_hash(
                    user_data["password"])
                new_user = User(
                    email=user_data["email"],
                    username=user_data["username"],
                    full_name=user_data["full_name"],
                    hashed_password=hashed_password,
                    role_id=user_role.id,
                    is_active=True,
                    is_verified=True
                )
                db.add(new_user)
                print(f"✅ Sample user created: {user_data['email']}")

        db.commit()
        print("🎉 Database initialization completed successfully!")

    except Exception as e:
        print(f"❌ Error during database initialization: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("🚀 Starting MicroShell Database Initialization...")
    init_database()
