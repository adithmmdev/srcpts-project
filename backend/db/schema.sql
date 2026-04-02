-- SRCPTS Database Schema

CREATE TABLE IF NOT EXISTS Department (
    dept_id SERIAL PRIMARY KEY,
    dept_name VARCHAR(100) NOT NULL,
    location VARCHAR(100),
    budget NUMERIC(12,2)
);

CREATE TABLE IF NOT EXISTS Faculty (
    faculty_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    specialization VARCHAR(100),
    salary NUMERIC(10,2),
    dept_id INT REFERENCES Department(dept_id)
);

CREATE TABLE IF NOT EXISTS Student (
    student_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    program VARCHAR(100),
    year INT,
    dept_id INT REFERENCES Department(dept_id)
);

CREATE TABLE IF NOT EXISTS Funding_Agency (
    agency_id SERIAL PRIMARY KEY,
    agency_name VARCHAR(100) NOT NULL,
    type VARCHAR(50),
    contact_email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS Research_Project (
    project_id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'Active',
    budget NUMERIC(12,2),
    lead_faculty_id INT REFERENCES Faculty(faculty_id)
);

CREATE TABLE IF NOT EXISTS Publication (
    publication_id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    journal_name VARCHAR(200),
    publication_date DATE,
    doi VARCHAR(100),
    file_url TEXT,
    project_id INT REFERENCES Research_Project(project_id)
);

CREATE TABLE IF NOT EXISTS Resource (
    resource_id SERIAL PRIMARY KEY,
    resource_name VARCHAR(100) NOT NULL,
    type VARCHAR(50),
    cost NUMERIC(10,2),
    availability_status VARCHAR(50) DEFAULT 'Available'
);

CREATE TABLE IF NOT EXISTS Milestone (
    project_id INT REFERENCES Research_Project(project_id),
    milestone_no INT,
    description TEXT NOT NULL,
    due_date DATE,
    status VARCHAR(50) DEFAULT 'Pending',
    PRIMARY KEY (project_id, milestone_no)
);

CREATE TABLE IF NOT EXISTS Progress_Report (
    project_id INT REFERENCES Research_Project(project_id),
    report_no INT,
    submission_date DATE DEFAULT CURRENT_DATE,
    remarks TEXT,
    completion_percentage NUMERIC(5,2),
    PRIMARY KEY (project_id, report_no)
);

CREATE TABLE IF NOT EXISTS Project_Assignment (
    student_id INT REFERENCES Student(student_id),
    project_id INT REFERENCES Research_Project(project_id),
    role VARCHAR(100),
    hours_per_week INT,
    PRIMARY KEY (student_id, project_id)
);

CREATE TABLE IF NOT EXISTS Project_Grant (
    project_id INT REFERENCES Research_Project(project_id),
    agency_id INT REFERENCES Funding_Agency(agency_id),
    amount NUMERIC(12,2),
    grant_date DATE,
    PRIMARY KEY (project_id, agency_id)
);

CREATE TABLE IF NOT EXISTS Project_Resource (
    project_id INT REFERENCES Research_Project(project_id),
    resource_id INT REFERENCES Resource(resource_id),
    usage_hours INT,
    PRIMARY KEY (project_id, resource_id)
);

CREATE TABLE IF NOT EXISTS Task (
    task_id SERIAL PRIMARY KEY,
    project_id INT REFERENCES Research_Project(project_id),
    student_id INT REFERENCES Student(student_id),
    description TEXT NOT NULL,
    deadline DATE,
    status VARCHAR(50) DEFAULT 'Pending'
);

CREATE TABLE IF NOT EXISTS Chat_Message (
    message_id SERIAL PRIMARY KEY,
    project_id INT REFERENCES Research_Project(project_id),
    sender_id INT NOT NULL,
    sender_role VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default department
INSERT INTO Department (dept_name, location, budget) VALUES ('General', 'Main Campus', 500000) ON CONFLICT DO NOTHING;
