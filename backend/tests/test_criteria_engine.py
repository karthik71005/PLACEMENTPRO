import pytest
from unittest.mock import AsyncMock, MagicMock
from bson import ObjectId

from services.criteria_engine import filter_eligible_students, get_eligible_drives_for_student
from fastapi import HTTPException

# Fake Async Generator for mocking cursors
class FakeAsyncCursor:
    def __init__(self, data):
        self.data = data
        self.iter = iter(data)

    def __aiter__(self):
        return self

    async def __anext__(self):
        try:
            return next(self.iter)
        except StopIteration:
            raise StopAsyncIteration

@pytest.mark.asyncio
async def test_filter_eligible_students_success():
    # Setup mock db
    mock_db = MagicMock()
    
    # Mock drive
    drive_id = str(ObjectId())
    mock_drive = {
        "_id": ObjectId(drive_id),
        "company_name": "TestCorp",
        "eligibility_criteria": {
            "min_cgpa": 7.0,
            "max_backlogs": 1,
            "branches": ["CSE", "ISE"]
        }
    }
    
    # Setup the collection mocks
    mock_company_drives = MagicMock()
    mock_company_drives.find_one = AsyncMock(return_value=mock_drive)
    
    mock_students = MagicMock()
    mock_student_data = [
        {"_id": ObjectId(), "full_name": "Student A", "branch": "CSE", "cgpa": 8.5, "backlogs": 0},
        {"_id": ObjectId(), "full_name": "Student B", "branch": "ISE", "cgpa": 7.5, "backlogs": 1},
    ]
    mock_students.aggregate.return_value = FakeAsyncCursor(mock_student_data)
    
    # Assign collections to db
    def db_getitem(name):
        if name == "company_drives": return mock_company_drives
        elif name == "students": return mock_students
        return MagicMock()
        
    mock_db.__getitem__.side_effect = db_getitem
    
    # Execute
    result = await filter_eligible_students(mock_db, drive_id)
    
    # Assert
    assert result["eligible_count"] == 2
    assert len(result["students"]) == 2
    assert result["students"][0]["full_name"] == "Student A"
    mock_company_drives.find_one.assert_called_once_with({"_id": ObjectId(drive_id)})
    mock_students.aggregate.assert_called_once()

@pytest.mark.asyncio
async def test_filter_eligible_students_not_found():
    mock_db = MagicMock()
    
    mock_company_drives = MagicMock()
    mock_company_drives.find_one = AsyncMock(return_value=None)
    
    mock_db.__getitem__.return_value = mock_company_drives
    
    with pytest.raises(HTTPException) as excinfo:
        await filter_eligible_students(mock_db, str(ObjectId()))
        
    assert excinfo.value.status_code == 404

@pytest.mark.asyncio
async def test_get_eligible_drives_for_student():
    mock_db = MagicMock()
    
    student_id = "user123"
    mock_student = {
        "user_id": student_id,
        "academics": {"cgpa": 8.0, "backlogs": 0},
        "branch": "CSE"
    }
    
    mock_students = MagicMock()
    mock_students.find_one = AsyncMock(return_value=mock_student)
    
    mock_drives = MagicMock()
    mock_drive_data = [
        {"_id": ObjectId(), "company_name": "Tech Corp", "status": "Active", "published": True},
        {"_id": ObjectId(), "company_name": "Finance Inc", "status": "Active", "published": True}
    ]
    mock_drives.find.return_value = FakeAsyncCursor(mock_drive_data)
    
    def db_getitem(name):
        if name == "students": return mock_students
        elif name == "company_drives": return mock_drives
        raise KeyError
        
    mock_db.__getitem__.side_effect = db_getitem
    
    result = await get_eligible_drives_for_student(mock_db, student_id)
    
    assert len(result) == 2
    assert result[0]["company_name"] == "Tech Corp"
    mock_students.find_one.assert_called_once_with({"user_id": student_id})
    mock_drives.find.assert_called_once_with({
        "status": "Active",
        "published": True,
        "eligibility_criteria.min_cgpa": {"$lte": 8.0},
        "eligibility_criteria.max_backlogs": {"$gte": 0},
        "eligibility_criteria.branches": "CSE",
    })
