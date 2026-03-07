import pytest
from unittest.mock import AsyncMock, MagicMock
from bson import ObjectId
from fastapi import HTTPException
from freezegun import freeze_time

from services.application_service import apply_to_drive, update_application_status

@pytest.mark.asyncio
async def test_apply_to_drive_success():
    mock_db = MagicMock()
    
    # Mock collections
    mock_drives = MagicMock()
    mock_drives.find_one = AsyncMock(return_value={"_id": ObjectId()})
    
    mock_apps = MagicMock()
    mock_apps.find_one = AsyncMock(return_value=None)  # No existing application
    mock_insert_result = MagicMock()
    mock_insert_result.inserted_id = ObjectId()
    mock_apps.insert_one = AsyncMock(return_value=mock_insert_result)
    
    def db_getitem(name):
        if name == "company_drives": return mock_drives
        elif name == "applications": return mock_apps
        return MagicMock()
        
    mock_db.__getitem__.side_effect = db_getitem
    
    result = await apply_to_drive(mock_db, "student123", str(ObjectId()))
    
    assert result["status"] == "Applied"
    assert "application_id" in result
    mock_apps.insert_one.assert_called_once()

@pytest.mark.asyncio
async def test_apply_to_drive_already_applied():
    mock_db = MagicMock()
    
    mock_drives = AsyncMock()
    mock_drives.find_one.return_value = {"_id": ObjectId()}
    
    mock_apps = AsyncMock()
    mock_apps.find_one.return_value = {"_id": ObjectId()}  # Already applied
    
    mock_db.__getitem__.side_effect = lambda n: mock_drives if n == "company_drives" else mock_apps
    
    with pytest.raises(HTTPException) as excinfo:
        await apply_to_drive(mock_db, "student123", str(ObjectId()))
        
    assert excinfo.value.status_code == 409
    assert "already applied" in excinfo.value.detail

@pytest.mark.asyncio
async def test_update_application_status():
    mock_db = MagicMock()
    
    mock_apps = AsyncMock()
    mock_apps.find_one_and_update.return_value = {"_id": ObjectId(), "status": "Shortlisted"}
    
    mock_db.__getitem__.return_value = mock_apps
    
    app_id = str(ObjectId())
    result = await update_application_status(mock_db, app_id, "Shortlisted")
    
    assert result["status"] == "Shortlisted"
    mock_apps.find_one_and_update.assert_called_once()
