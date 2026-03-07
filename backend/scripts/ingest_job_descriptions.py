import os
from pinecone import Pinecone, ServerlessSpec
from langchain_google_genai import GoogleGenerativeAIEmbeddings

def main():
    # Load env vars
    from dotenv import load_dotenv
    load_dotenv(dotenv_path="../.env")

    # 1. Initialize Gemini Embeddings
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if not gemini_api_key:
        print("❌ Error: GEMINI_API_KEY is not set.")
        return

    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-001",
        google_api_key=gemini_api_key
    )

    # 2. Initialize Pinecone
    pc_key = os.getenv("PINECONE_API_KEY")
    pc_env = os.getenv("PINECONE_ENVIRONMENT", "gcp-starter")
    index_name = os.getenv("PINECONE_INDEX_NAME", "placementpro-jd")

    if not pc_key:
        print("❌ Error: PINECONE_API_KEY is not set.")
        return

    pc = Pinecone(api_key=pc_key)

    # 3. Create index if it doesn't exist
    if index_name not in pc.list_indexes().names():
        print(f"Creating Pinecone index '{index_name}'...")
        # Since we use Google's embedding-001 model, the dimension is exactly 768
        pc.create_index(
            name=index_name,
            dimension=3072,
            metric="cosine",
            spec=ServerlessSpec(
                cloud="aws",
                region="us-east-1"
            )
        )
    
    index = pc.Index(index_name)
    print(f"✅ Connected to Pinecone index '{index_name}'")

    # 4. Define our Corpus of 50+ diverse JD chunks
    print("Preparing JD corpus...")
    
    jds = []
    
    # helper to quickly build the payload structure
    def add_jd(role, company_type, skills_str, text_chunk):
        jds.append({
            "id": f"jd_{len(jds)+1}",
            "text": text_chunk,
            "metadata": {
                "role": role,
                "company_type": company_type,
                "skill_keywords": skills_str
            }
        })

    # Software Engineering (SDE)
    add_jd("Software Engineer", "MNC", "java, spring boot, microservices, aws", "We are looking for a Software Engineer to build scalable microservices using Java and Spring Boot. You will deploy to AWS and manage high-traffic distributed systems.")
    add_jd("Frontend Developer", "Startup", "react, typescript, tailwind css, next.js", "Seeking a talented Frontend Developer to craft beautiful UI components using React and TypeScript. Experience with Next.js and Tailwind CSS is highly preferred.")
    add_jd("Backend Engineer", "FinTech", "python, django, postgresql, rest api", "You will design and implement robust REST APIs using Python and Django. Must have strong SQL skills and experience profiling PostgreSQL performance.")
    add_jd("FullStack Developer", "Product Company", "javascript, node.js, react, mongodb", "Join our agile team to build end-to-end features using the MERN stack. Strong JavaScript fundamentals and Node.js experience required.")
    add_jd("Mobile Developer", "Agency", "flutter, dart, ios, android", "Cross-platform mobile developer needed to build sleek apps using Flutter and Dart. Experience publishing to both Apple App Store and Google Play is required.")
    add_jd("SDE I", "Big Tech", "c++, data structures, algorithms, system design", "Entry-level SDE role. Requires exceptional problem-solving skills, mastery of Data Structures and Algorithms in C++, and basic system design intuition.")
    add_jd("SDE II", "Big Tech", "java, distributed systems, kafka, nosql", "Looking for an SDE II to lead architecture decisions. Deep knowledge of distributed systems, event-driven architecture using Kafka, and NoSQL databases like Cassandra.")
    add_jd("Platform Engineer", "Cloud Provider", "golang, kubernetes, docker, linux", "Build the next generation of cloud infrastructure. Must be highly proficient in Go (Golang), Kubernetes orchestration, and Linux internals.")
    add_jd("Game Developer", "Gaming Studio", "c#, unity, 3d math, multiplayer", "Develop immersive 3D experiences. Requires expert-level C# in Unity, strong 3D math skills, and experience with multiplayer networking code.")
    add_jd("Embedded Engineer", "Hardware", "c, rtos, microcontroller, iot", "Write firmware for cutting-edge IoT devices. Deep C programming experience, RTOS knowledge, and understanding of microcontroller architecture required.")

    # Data & Analytics
    add_jd("Data Analyst", "Consulting", "sql, excel, tableau, powerbi", "Analyze large datasets to extract actionable insights. Advanced SQL and Excel skills required. Proficiency in Tableau or PowerBI for dashboard creation is a must.")
    add_jd("Data Scientist", "E-commerce", "python, pandas, scikit-learn, machine learning", "Build predictive models to optimize customer recommendations. Requires strong Python data science stack (Pandas, Numpy) and Machine Learning (scikit-learn) experience.")
    add_jd("Data Engineer", "Streaming Service", "spark, hadoop, airflow, python", "Design and optimize big data pipelines. Must have experience with Apache Spark, Hadoop ecosystems, and workflow orchestration using Apache Airflow.")
    add_jd("BI Developer", "Retail", "sql, dax, powerbi, data warehousing", "Develop robust Business Intelligence solutions. Strong SQL, Data Warehousing concepts, and DAX for complicated PowerBI reports.")
    add_jd("Machine Learning Engineer", "AI Startup", "pytorch, tensorflow, nlp, llm", "Deploy State-of-the-Art Generative AI models. Requires deep expertise in PyTorch, NLP techniques, and prompt-tuning large language models.")
    add_jd("Computer Vision Engineer", "Automotive", "opencv, c++, deep learning, image processing", "Work on object detection algorithms for autonomous driving. Requires OpenCV, Deep Learning expertise, and real-time C++ inference.")
    add_jd("Quantitative Analyst", "Hedge Fund", "python, r, time-series, statistics", "Model financial markets. Requires extremely strong statistical background, time-series analysis, and algorithmic trading experience in Python or R.")
    add_jd("Data Architect", "Enterprise", "snowflake, dbt, aws redshift, etl", "Design enterprise data lakes. Expertise in modern data stack tools like Snowflake, dbt, and AWS Redshift data modeling.")
    add_jd("AI Research Scientist", "Research Lab", "mathematics, pytorch, algorithm formulation", "Push the boundaries of AI research. Ph.D. preferred. Strong mathematical foundation and ability to formulate novel learning algorithms.")
    add_jd("MLOps Engineer", "Tech Unicorn", "mlflow, kubeflow, python, ci/cd", "Bridge the gap between ML and DevOps. Deploy models reliably using MLflow, Kubeflow, and implement robust CI/CD pipelines for ML assets.")

    # Product & Design
    add_jd("Product Manager", "SaaS", "agile, jira, roadmapping, wireframing", "Lead product vision and execution. Requires experience prioritizing backlogs in Jira, drafting product requirement documents (PRDs), and cross-functional agile leadership.")
    add_jd("Associate Product Manager", "Consumer Tech", "a/b testing, sql, user research", "APM role focused on growth metrics. Run A/B tests, query your own data with SQL, and conduct user interviews to find pain points.")
    add_jd("Technical Product Manager", "B2B", "api design, cloud architecture, agile", "Manage highly technical developer-facing products. Ability to evaluate API design and cloud architecture constraints alongside software architects is required.")
    add_jd("UI/UX Designer", "Agency", "figma, adobe xd, prototyping, user-centric design", "Design intuitive and accessible interfaces. Expert Figma skills required, alongside a strong portfolio demonstrating user-centric design thinking.")
    add_jd("UX Researcher", "MNC", "usability testing, interviewing, analytics", "Conduct qualitative and quantitative research. Lead usability testing sessions and translate observations into actionable design recommendations.")
    add_jd("Product Designer", "Startup", "figma, css, visual design, interaction design", "End-to-end product design. Build out comprehensive design systems in Figma and have enough CSS knowledge to collaborate closely with frontend devs.")
    add_jd("Growth Product Manager", "E-commerce", "seo, performance marketing, data analysis", "Drive user acquisition. Expertise in SEO strategy, performance marketing loops, and funnel conversion optimization.")
    add_jd("Scrum Master", "Enterprise", "scrum, kanban, agile coaching", "Facilitate agile ceremonies and unblock engineering teams. Certified Scrum Master (CSM) preferred with deep Kanban experience.")
    add_jd("Director of Product", "FinTech", "strategy, p&l, team building, stakeholder management", "Executive product leadership. Requires P&L responsibility experience, high-level strategic vision, and managing multiple PMs.")
    add_jd("Interaction Designer", "Gaming Studio", "motion graphics, prototyping, unity ix", "Create micro-interactions and smooth UI transitions. Experience with advanced prototyping tools and UI motion graphics.")

    # Cloud, DevOps & Security
    add_jd("DevOps Engineer", "SaaS", "aws, terraform, jenkins, linux", "Automate infrastructure provisioning. Must have hands-on experience writing Terraform modules and managing complex Jenkins CI/CD pipelines.")
    add_jd("Site Reliability Engineer", "MNC", "python, golang, observability, prometheus", "Ensure 99.99% uptime. Configure observability using Prometheus/Grafana, participate in on-call rotations, and write infrastructure code in Go or Python.")
    add_jd("Cloud Architect", "Consulting", "aws, azure, gcp, system design", "Design scalable multi-cloud architectures. Requires AWS Solutions Architect Professional certification and experience migrating monolithic apps.")
    add_jd("Cybersecurity Analyst", "Banking", "siem, network security, penetration testing", "Monitor security events using SIEM tools. Conduct vulnerability assessments, network traffic analysis, and basic penetration testing.")
    add_jd("DevSecOps Engineer", "FinTech", "sast, dast, docker security, ci/cd", "Integrate security scanning into CI/CD. Implement SAST/DAST tools and enforce container security policies and least-privilege IAM.")
    add_jd("Network Engineer", "Telecom", "cisco, bgp, ospf, firewalls", "Configure and maintain enterprise networks. Deep knowledge of routing protocols (BGP, OSPF) and firewall configurations (Palo Alto / Cisco).")
    add_jd("Application Security Engineer", "Internet Company", "owasp, secure coding, web security", "Find and fix web vulnerabilities. Deep understanding of OWASP Top 10, cross-site scripting (XSS), and SQL injection mitigation.")
    add_jd("Database Administrator", "Healthcare", "oracle, sql server, backups, tuning", "Manage critical patient databases. Ensure high availability, test disaster recovery backups, and perform complex query tuning.")
    add_jd("Systems Administrator", "Education", "windows server, active directory, powershell", "Manage campus IT infrastructure. Active Directory administration, Group Policy management, and PowerShell scripting required.")
    add_jd("IT Support Specialist", "Startup", "helpdesk, networking basics, macos, windows", "Provide Tier 1 and 2 technical support to internal employees. Troubleshoot MacOS, Windows, and basic WiFi networking issues.")

    # Business, Marketing & Ops
    add_jd("Business Analyst", "Retail", "sql, process mapping, requirements gathering", "Bridge the gap between business and IT. Document business processes, gather requirements, and query data using SQL to support decisions.")
    add_jd("Digital Marketing Specialist", "Agency", "seo, sem, google analytics, facebook ads", "Run multi-channel digital campaigns. Deep knowledge of Google Ads (SEM), SEO best practices, and campaign tracking in Google Analytics.")
    add_jd("Sales Engineer", "B2B SaaS", "technical sales, presentations, apis", "Pre-sales technical expert. Deliver compelling product demos to enterprise clients and confidently answer deep technical API questions.")
    add_jd("HR Generalist", "MNC", "recruiting, onboarding, employee relations", "Manage the employee lifecycle. Perform full-cycle recruiting, handle onboarding administration, and resolve employee relations issues.")
    add_jd("Account Executive", "Startup", "b2b sales, crm, negotiation, prospecting", "Close new business. Requires relentless prospecting, managing pipelines in Salesforce (CRM), and excellent B2B negotiation skills.")
    add_jd("Customer Success Manager", "SaaS", "churn reduction, onboarding, upselling", "Ensure client retention. Onboard new enterprise accounts, conduct quarterly business reviews (QBRs), and drive platform adoption.")
    add_jd("Content Writer", "Media", "copywriting, seo reporting, wordpress", "Produce engaging blog and web content. Must understand SEO writing principles and have experience publishing through WordPress.")
    add_jd("Financial Analyst", "Banking", "financial modeling, excel, forecasting", "Build complex 3-statement financial models. Requires elite Excel skills and experience forecasting quarterly budgets.")
    add_jd("Operations Manager", "Logistics", "supply chain, process optimization, vendor management", "Oversee daily supply chain operations. Identify process bottlenecks, negotiate with logistics vendors, and optimize routing.")
    add_jd("Legal Counsel", "Tech", "contract drafting, ip law, compliance", "Review software agreements. Provide guidance on Intellectual Property (IP) law, data privacy compliance (GDPR), and draft vendor contracts.")


    # 5. Generate Embeddings (with batching)
    print(f"Generating embeddings for {len(jds)} job descriptions...")
    
    # We will upload in batches of 10 to avoid Gemini rate limits
    BATCH_SIZE = 10
    
    for i in range(0, len(jds), BATCH_SIZE):
        batch = jds[i:i+BATCH_SIZE]
        texts = [item["text"] for item in batch]
        
        print(f"  Embedding batch {i//BATCH_SIZE + 1}...")
        try:
            # Generate vectors
            vectors = embeddings.embed_documents(texts)
            
            # Prepare format for pinecone: List of Tuples (id, vector, metadata)
            upsert_data = []
            for j, item in enumerate(batch):
                upsert_data.append(
                    (item["id"], vectors[j], item["metadata"])
                )
            
            # Upsert
            index.upsert(vectors=upsert_data)
            print(f"  ✅ Upserted {len(upsert_data)} vectors.")
        
        except Exception as e:
            print(f"  ❌ Error embedding/upserting batch {i//BATCH_SIZE + 1}: {e}")

    print("\n🎉 Ingestion Complete!")
    stats = index.describe_index_stats()
    print(f"Index stats: {stats}")

if __name__ == "__main__":
    main()
