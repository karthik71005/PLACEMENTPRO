import pytest
from unittest.mock import AsyncMock, MagicMock
from bson import ObjectId
from fastapi.testclient import TestClient

from main import app
from core.dependencies import get_current_user, get_db

@pytest.fixture
def test_client():
    return TestClient(app)

@pytest.mark.asyncio
async def test_auth_verify_and_register_new_user():
    # We can test the function directly instead of mocking the entire FastAPI client setup
    # to avoid rate limiter complications in tests.
    from routers.auth import verify_and_register
    from models.user import UserCreateSchema
    from fastapi import Request
    
    mock_db = MagicMock()
    mock_users = AsyncMock()
    mock_users.find_one.return_value = None
    
    mock_insert_result = MagicMock()
    mock_insert_result.inserted_id = ObjectId()
    mock_users.insert_one = AsyncMock(return_value=mock_insert_result)
    
    mock_db.__getitem__.return_value = mock_users
    
    request = MagicMock(spec=Request)
    payload = UserCreateSchema(
        firebase_uid="newuid123",
        email="test@sahyadri.edu.in",
        role="student"
    )
    
    result = await verify_and_register(request, payload, mock_db)
    
    assert result["role"] == "student"
    assert result["message"] == "User registered successfully."
    mock_users.insert_one.assert_called_once()


@pytest.mark.asyncio
async def test_auth_verify_and_register_existing_user():
    from routers.auth import verify_and_register
    from models.user import UserCreateSchema
    from fastapi import Request
    
    mock_db = MagicMock()
    mock_users = AsyncMock()
    mock_users.find_one.return_value = {
        "_id": ObjectId(),
        "role": "tpo"
    }
    
    mock_db.__getitem__.return_value = mock_users
    
    request = MagicMock(spec=Request)
    payload = UserCreateSchema(
        firebase_uid="tpo123",
        email="tpo@sahyadri.edu.in",
        role="tpo"
    )
    
    result = await verify_and_register(request, payload, mock_db)
    
    assert result["role"] == "tpo"
    assert result["message"] == "User already registered."
    mock_users.insert_one.assert_not_called()

@pytest.mark.asyncio
async def test_auth_verify_and_register_pending_user():
    from routers.auth import verify_and_register
    from models.user import UserCreateSchema
    from fastapi import Request
    
    mock_db = MagicMock()
    mock_users = AsyncMock()
    user_id = ObjectId()
    mock_users.find_one.return_value = {
        "_id": user_id,
        "role": "pending"
    }
    mock_users.update_one = AsyncMock()
    
    mock_db.__getitem__.return_value = mock_users
    
    request = MagicMock(spec=Request)
    payload = UserCreateSchema(
        firebase_uid="tpo123",
        email="student@sahyadri.edu.in",
        role="student"
    )
    
    result = await verify_and_register(request, payload, mock_db)
    
    assert result["role"] == "student"
    assert "Role updated successfully" in result["message"]
    mock_users.update_one.assert_called_once_with(
        {"_id": user_id},
        {"$set": {"role": "student"}}
    )
