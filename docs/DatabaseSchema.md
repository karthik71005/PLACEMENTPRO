# MongoDB Schema (ERD)

## Schema Overview

The central database used for PlacementPro is a NoSQL MongoDB Atlas cluster. Documents are heavily schema-enforced at the application level using `Pydantic` and `bleach` to ensure types, sanity, and anti-XSS protection.

```mermaid
erDiagram
    users {
        ObjectId _id PK
        string firebase_uid UK
        string email UK
        string role "tpo, student, alumni"
        datetime created_at
    }

    students {
        ObjectId _id PK
        ObjectId user_id FK "Unique"
        string full_name
        string branch
        int year_of_passing
        string resume_url
        array skills
    }
    
    company_drives {
        ObjectId _id PK
        ObjectId tpo_id FK
        string company_name
        string role
        boolean published
        datetime drive_date
        string status "Active, Closed"
    }

    applications {
        ObjectId _id PK
        ObjectId student_id FK 
        ObjectId drive_id FK 
        string status "Applied, Under Review, Selected, Rejected"
        datetime applied_on
    }

    alumni_slots {
        ObjectId _id PK
        ObjectId alumni_id FK
        datetime start_time
        datetime end_time
        boolean is_booked
    }

    job_referrals {
        ObjectId _id PK
        ObjectId alumni_id FK
        string company
        string role
        string location
        string job_link "URL"
    }

    interviews {
        ObjectId _id PK
        ObjectId student_id FK
        ObjectId drive_id FK
        string student_name
        string day
        int hour
    }

    users ||--o| students : "1:1 user profile"
    users ||--o{ company_drives : "TPO creates"
    students ||--o{ applications : "Student applies"
    company_drives ||--o{ applications : "Drive receives"
    users ||--o{ alumni_slots : "Alumni creates"
    users ||--o{ job_referrals : "Alumni refers"
    company_drives ||--o{ interviews : "Are scheduled"
```

## Indexes

| Collection | Indexed Fields | Options |
| --- | --- | --- |
| `users` | `firebase_uid` | Unique |
| `users` | `email` | Unique |
| `students` | `user_id` | Unique |
| `applications` | `(student_id, drive_id)` | Compound Unique |
| `applications` | `status` | Single |
| `alumni_slots` | `alumni_id` | Single |
| `alumni_slots` | `is_booked`, `start_time` | Compound Sorting |
| `company_drives` | `status` | Single |
| `job_referrals` | `alumni_id` | Single |
