export const ROLE_JDS: Record<string, string> = {

    // ─── SOFTWARE ENGINEER ────────────────────────────────────────────────────
    'software-engineer-fresher': `We are hiring fresher Software Engineers (0–1 years) to join our engineering team.

Responsibilities:
• Write clean, documented code under senior guidance
• Work on bug fixes, feature additions, and unit tests
• Participate in standups and sprint planning
• Learn and apply best practices in software design

Requirements:
• B.E / B.Tech in CS, IT, or related field
• Strong fundamentals in data structures and algorithms
• Knowledge of at least one language: Python, Java, or C++
• Familiarity with Git and basic Linux commands`,

    'software-engineer-mid': `We are hiring a Software Engineer (2–4 years) to design, build, and maintain scalable backend services and APIs.

Responsibilities:
• Design and implement reliable, maintainable code in Python / Go / Java
• Build and optimize RESTful and GraphQL APIs
• Participate in code reviews and architectural discussions
• Improve system observability and reliability

Requirements:
• 2–4 years of software engineering experience
• Strong CS fundamentals (data structures, algorithms, OS concepts)
• Familiarity with cloud platforms (AWS / GCP / Azure)
• Experience with CI/CD and agile workflows`,

    'software-engineer-senior': `We are hiring a Senior Software Engineer (5+ years) to lead technical design and delivery.

Responsibilities:
• Architect and implement complex systems end-to-end
• Set technical direction and mentor junior engineers
• Drive code quality through reviews, standards, and tooling
• Partner with product and infrastructure on roadmap execution

Requirements:
• 5+ years of software engineering experience
• Deep knowledge of distributed systems and system design
• Track record of owning and shipping large-scale features
• Strong communication and cross-functional collaboration skills`,

    'software-engineer-lead': `We are hiring an Engineering Lead (7+ years) to own technical strategy for a product area.

Responsibilities:
• Define technical vision and roadmap for your team
• Lead a squad of 4–8 engineers, running planning and retrospectives
• Make high-impact architectural decisions and trade-off calls
• Hire, grow, and retain engineering talent

Requirements:
• 7+ years engineering experience, 2+ in a lead or staff role
• Proven ability to lead technical projects across teams
• Deep systems thinking with strong communication skills
• Experience influencing org-wide engineering standards`,

    // ─── FRONTEND ENGINEER ────────────────────────────────────────────────────
    'frontend-engineer-fresher': `We are looking for a fresher Frontend Engineer (0–1 years) excited about building web UIs.

Responsibilities:
• Build and maintain web pages using HTML, CSS, and JavaScript
• Learn and contribute to React components
• Fix UI bugs and improve responsiveness
• Collaborate with designers to implement mockups accurately

Requirements:
• B.E / B.Tech or equivalent degree
• Good understanding of HTML, CSS, JavaScript fundamentals
• Exposure to React (projects or internships count)
• Basic understanding of responsive design`,

    'frontend-engineer-mid': `We are looking for a Frontend Engineer (2–4 years) passionate about performant user interfaces.

Responsibilities:
• Build responsive, accessible UIs in React / Next.js
• Collaborate with designers and product managers
• Optimize for Core Web Vitals and page performance
• Write unit and integration tests

Requirements:
• 2–4 years of frontend development experience
• Deep knowledge of React, TypeScript, and CSS
• Experience with state management (Redux, Zustand, or similar)
• Understanding of browser rendering and performance profiling`,

    'frontend-engineer-senior': `We are hiring a Senior Frontend Engineer (5+ years) to own UI architecture and quality.

Responsibilities:
• Define frontend architecture, patterns, and tooling choices
• Lead performance and accessibility initiatives
• Mentor mid and junior engineers in frontend best practices
• Collaborate with design systems team to evolve component libraries

Requirements:
• 5+ years frontend experience
• Expert-level React, TypeScript, and CSS knowledge
• Experience building and maintaining design systems
• Strong grasp of web performance, accessibility (WCAG), and testing`,

    'frontend-engineer-lead': `We are hiring a Frontend Engineering Lead (7+ years) to set direction for our UI platform.

Responsibilities:
• Own frontend architecture across multiple product surfaces
• Lead and grow a team of frontend engineers
• Drive cross-functional alignment on design and engineering standards
• Define the frontend roadmap and technical vision

Requirements:
• 7+ years frontend experience, 2+ in a lead or staff role
• Deep expertise in React ecosystem and modern frontend tooling
• Strong hiring, mentoring, and communication skills
• Experience scaling frontend teams and codebases`,

    // ─── BACKEND ENGINEER ─────────────────────────────────────────────────────
    'backend-engineer-fresher': `We are hiring fresher Backend Engineers (0–1 years) to help build our server-side systems.

Responsibilities:
• Assist in building and maintaining REST APIs
• Write database queries and understand schema design
• Learn to debug and optimise server-side code
• Document APIs and backend logic

Requirements:
• B.E / B.Tech in CS or related field
• Knowledge of at least one backend language: Node.js, Python, or Java
• Basic understanding of SQL databases
• Exposure to REST API concepts`,

    'backend-engineer-mid': `Join our backend team (2–4 years exp) to build highly scalable distributed systems.

Responsibilities:
• Design microservices and event-driven architectures
• Implement high-throughput data pipelines
• Ensure service reliability with monitoring and alerting
• Contribute to technical design discussions

Requirements:
• 2–4 years backend engineering experience
• Proficiency in Node.js, Go, Python, or Java
• Experience with SQL/NoSQL databases and caching (Redis)
• Understanding of distributed systems concepts`,

    'backend-engineer-senior': `We are hiring a Senior Backend Engineer (5+ years) to own critical infrastructure.

Responsibilities:
• Design and implement high-scale distributed systems
• Lead technical decisions on data models, APIs, and service boundaries
• Drive reliability, observability, and on-call excellence
• Mentor backend engineers and raise the bar on code quality

Requirements:
• 5+ years backend engineering experience
• Expert knowledge of distributed systems, databases, and API design
• Experience with large-scale production systems
• Strong communication and cross-team collaboration`,

    'backend-engineer-lead': `We are hiring a Backend Engineering Lead (7+ years) to own platform direction.

Responsibilities:
• Define backend architecture and infrastructure strategy
• Lead a team of backend engineers through complex technical projects
• Set reliability, scalability, and security standards
• Partner with DevOps and data teams on platform evolution

Requirements:
• 7+ years backend experience, 2+ in a technical lead or staff role
• Proven track record leading backend platform initiatives
• Deep expertise in distributed systems and cloud-native architectures
• Strong leadership and stakeholder management skills`,

    // ─── FULL STACK ENGINEER ──────────────────────────────────────────────────
    'fullstack-engineer-fresher': `We are looking for a fresher Full Stack Engineer (0–1 years) eager to work across the entire stack.

Responsibilities:
• Build simple full-stack features with guidance
• Work on both frontend (React) and backend (Node / Python) tasks
• Learn deployment and debugging across the stack
• Write tests for your features

Requirements:
• B.E / B.Tech in CS or related field
• Basic knowledge of React and one backend language
• Familiarity with databases (MySQL or PostgreSQL)
• Strong willingness to learn and take ownership`,

    'fullstack-engineer-mid': `We are seeking a Full Stack Engineer (2–4 years) to own end-to-end features.

Responsibilities:
• Build and ship full-stack features independently
• Design RESTful APIs and React frontends
• Own deployments, monitoring, and incident response for your features
• Mentor junior engineers

Requirements:
• 2–4 years full-stack experience
• Strong proficiency in React/Next.js and a backend language
• Hands-on experience with PostgreSQL or another relational DB
• Experience with containerisation (Docker, Kubernetes)`,

    'fullstack-engineer-senior': `We are hiring a Senior Full Stack Engineer (5+ years) to lead feature delivery end-to-end.

Responsibilities:
• Architect full-stack solutions for complex product requirements
• Own the full delivery lifecycle from design to production
• Establish coding standards and review processes across the stack
• Mentor and support a team of full-stack engineers

Requirements:
• 5+ years full-stack experience
• Expert knowledge of React/Next.js and Node.js or equivalent backend
• Deep understanding of databases, APIs, and deployment pipelines
• Strong product sense and ability to work directly with stakeholders`,

    // ─── DEVOPS ENGINEER ──────────────────────────────────────────────────────
    'devops-engineer-mid': `We need a DevOps / Platform Engineer (2–4 years) to build our infrastructure.

Responsibilities:
• Design and maintain cloud infrastructure (Terraform / CDK)
• Build and optimise CI/CD pipelines
• Implement SRE practices: SLOs, error budgets, post-mortems
• Reduce deployment lead time and increase system reliability

Requirements:
• 2–4 years in a DevOps / Platform / SRE role
• Strong experience with Kubernetes and container orchestration
• Hands-on with AWS or GCP
• Proficiency in scripting (Bash, Python)`,

    'devops-engineer-senior': `We are hiring a Senior DevOps / SRE Engineer (5+ years) to own platform reliability.

Responsibilities:
• Lead infrastructure architecture and migration initiatives
• Own reliability strategy: SLOs, alerting, chaos engineering
• Drive automation across CI/CD, provisioning, and security
• Mentor junior DevOps engineers

Requirements:
• 5+ years DevOps / SRE experience
• Expert Kubernetes, Terraform, and cloud-native tooling
• Experience building developer productivity platforms
• Strong incident management and post-mortem culture`,

    'devops-engineer-lead': `We are hiring a DevOps / Platform Lead (7+ years) to own our engineering platform strategy.

Responsibilities:
• Define the long-term infrastructure and developer experience roadmap
• Lead a platform engineering team of 4–6 engineers
• Partner with security, compliance, and product engineering teams
• Drive org-wide DevOps culture and best practices

Requirements:
• 7+ years DevOps / platform engineering, 2+ in a leadership role
• Deep expertise across cloud, Kubernetes, and CI/CD at scale
• Strong leadership, communication, and organisational skills`,

    // ─── ML ENGINEER ──────────────────────────────────────────────────────────
    'ml-engineer-fresher': `We are hiring a fresher ML Engineer (0–1 years) to support our ML team.

Responsibilities:
• Assist in data preprocessing, feature engineering, and model evaluation
• Help maintain ML pipelines and experiment tracking
• Learn MLOps tools and best practices
• Document experiments and results clearly

Requirements:
• B.E / B.Tech or M.Sc in CS, Statistics, or related field
• Good knowledge of Python and core ML libraries (scikit-learn, pandas)
• Understanding of basic ML algorithms
• Exposure to PyTorch or TensorFlow is a plus`,

    'ml-engineer-mid': `We are hiring an ML Engineer (2–4 years) to take models from research to production.

Responsibilities:
• Build end-to-end ML pipelines (data ingestion → training → serving)
• Optimise model inference for low latency and high throughput
• Collaborate with data scientists to productionise experiments
• Monitor model performance and drift in production

Requirements:
• 2–4 years ML engineering experience
• Proficiency in Python and ML frameworks (PyTorch, TensorFlow, or JAX)
• Experience with MLOps tools (MLflow, Kubeflow, or similar)
• Strong understanding of feature engineering and model evaluation`,

    'ml-engineer-senior': `We are hiring a Senior ML Engineer (5+ years) to lead ML infrastructure at scale.

Responsibilities:
• Design and own the end-to-end ML platform
• Lead model deployment, serving, and monitoring strategy
• Collaborate with research to bring cutting-edge models to production
• Set technical standards for ML engineering across the org

Requirements:
• 5+ years ML engineering experience
• Expert knowledge of model serving, training infrastructure, and MLOps
• Experience with large-scale distributed training
• Strong system design and cross-functional collaboration skills`,

    // ─── DATA ENGINEER ────────────────────────────────────────────────────────
    'data-engineer-mid': `Join our data platform team (2–4 years exp) to build our analytics infrastructure.

Responsibilities:
• Design and maintain data warehouses and ETL/ELT pipelines
• Build reusable data models (dbt / Spark)
• Ensure data quality, lineage, and governance
• Partner with analytics and ML teams

Requirements:
• 2–4 years data engineering experience
• Strong SQL and experience with distributed compute (Spark, Flink, or BigQuery)
• Experience with orchestration tools (Airflow, Prefect)
• Understanding of data modelling principles`,

    'data-engineer-senior': `We are hiring a Senior Data Engineer (5+ years) to own our data platform architecture.

Responsibilities:
• Define data architecture and platform standards
• Lead complex data migration and integration projects
• Drive data quality and governance initiatives
• Mentor data engineers and build team standards

Requirements:
• 5+ years data engineering experience
• Expert knowledge of data warehousing, ETL, and distributed compute
• Experience with real-time streaming (Kafka, Flink)
• Strong communication and cross-functional partnership skills`,

    // ─── DATA ANALYST ─────────────────────────────────────────────────────────
    'data-analyst-fresher': `We are hiring a fresher Data Analyst (0–1 years) to help our team make data-driven decisions.

Responsibilities:
• Write SQL queries to extract and analyse data
• Build basic dashboards and reports
• Assist in cleaning and preparing datasets
• Present findings to the team in clear, simple language

Requirements:
• B.E / B.Tech or B.Sc in CS, Statistics, or related field
• Good SQL skills (SELECT, JOINs, GROUP BY, subqueries)
• Exposure to Excel or any BI tool (Tableau, Power BI, or Metabase)
• Basic Python or R knowledge is a plus`,

    'data-analyst-mid': `We are hiring a Data Analyst (2–4 years) to turn raw data into actionable business insights.

Responsibilities:
• Write complex SQL queries to analyse large datasets
• Build dashboards and reports in Looker / Tableau / Metabase
• Partner with product and business teams on KPI definition
• Identify trends and anomalies in business metrics

Requirements:
• 2–4 years data analysis experience
• Expert-level SQL skills
• Experience with a BI tool (Looker, Tableau, or Power BI)
• Strong communication and storytelling with data`,

    'data-analyst-senior': `We are hiring a Senior Data Analyst (5+ years) to own analytics for a business unit.

Responsibilities:
• Define and own the analytics framework for your domain
• Lead complex multi-source analyses and present to leadership
• Build self-serve reporting infrastructure for business teams
• Mentor junior analysts and establish team best practices

Requirements:
• 5+ years data analysis experience
• Expert SQL, Python or R, and BI tool proficiency
• Proven track record influencing business decisions with data
• Strong stakeholder management and presentation skills`,

    // ─── DATA SCIENTIST ───────────────────────────────────────────────────────
    'data-scientist-fresher': `We are looking for a fresher Data Scientist (0–1 years) to join our analytics and ML team.

Responsibilities:
• Assist in building and evaluating ML models
• Help with data cleaning, feature engineering, and EDA
• Work with senior scientists on experiments and analysis
• Document findings and model results

Requirements:
• B.E / B.Tech or M.Sc in CS, Statistics, or related field
• Knowledge of Python (pandas, numpy, scikit-learn)
• Understanding of basic ML algorithms
• Strong grasp of statistics and probability`,

    'data-scientist-mid': `We are looking for a Data Scientist (2–4 years) to drive decision-making through modelling and analysis.

Responsibilities:
• Design and run A/B experiments and analyse results
• Build predictive models and recommendation systems
• Communicate insights to stakeholders with clear visualisations
• Develop and maintain analytical datasets

Requirements:
• 2–4 years data science experience
• Proficiency in Python (pandas, scikit-learn, statsmodels)
• Strong statistics and probability foundations
• Experience with SQL and BI tools`,

    'data-scientist-senior': `We are hiring a Senior Data Scientist (5+ years) to lead data science for a product area.

Responsibilities:
• Own the data science roadmap for your product domain
• Build advanced models: forecasting, NLP, ranking, or causal inference
• Partner with product and engineering to deploy models at scale
• Mentor junior data scientists and set team standards

Requirements:
• 5+ years data science experience
• Deep expertise in statistical modelling and ML
• Experience taking models to production
• Strong communication with technical and non-technical audiences`,

    // ─── AI RESEARCHER ────────────────────────────────────────────────────────
    'ai-researcher': `Join our AI research team to push the boundaries of large language models and multimodal AI.

Responsibilities:
• Conduct original research in NLP, LLMs, or multimodal learning
• Implement and evaluate state-of-the-art model architectures
• Publish research and represent the company at top-tier venues
• Collaborate with engineering to deploy research into products

Requirements:
• PhD or equivalent research experience in ML / AI
• Deep knowledge of transformer architectures and training dynamics
• Proficiency in PyTorch or JAX
• Publication record at NeurIPS, ICML, ICLR, or ACL preferred`,

    // ─── PRODUCT MANAGER ──────────────────────────────────────────────────────
    'product-manager-fresher': `We are hiring an Associate Product Manager (APM) (0–1 years) to kickstart your PM career.

Responsibilities:
• Assist in writing PRDs and user stories
• Conduct user research and synthesise findings
• Track product metrics and report on feature performance
• Support sprint planning and cross-team coordination

Requirements:
• B.E / B.Tech, MBA, or equivalent
• Strong analytical thinking and communication skills
• Curiosity about user behaviour and product metrics
• Exposure to agile or product development processes is a plus`,

    'product-manager-mid': `We are looking for a Product Manager (2–4 years) to lead the vision and execution of our core product.

Responsibilities:
• Define product strategy and prioritise the roadmap
• Write clear PRDs and work closely with engineering and design
• Conduct user research and synthesise insights into requirements
• Drive cross-functional alignment and communication

Requirements:
• 2–4 years product management experience
• Demonstrated ability to ship successful products
• Strong analytical skills — comfortable with SQL and product metrics
• Excellent written and verbal communication`,

    'product-manager-senior': `We are hiring a Senior Product Manager (5+ years) to own a major product area.

Responsibilities:
• Define multi-quarter strategy and OKRs for your product area
• Lead a cross-functional team (engineering, design, data) through complex launches
• Shape pricing, positioning, and go-to-market strategy with business teams
• Mentor APMs and mid-level PMs

Requirements:
• 5+ years product management experience
• Track record of leading 0-to-1 and scaled product initiatives
• Strong quantitative and qualitative research skills
• Excellent executive communication and influence without authority`,

    'product-manager-lead': `We are hiring a Director / Group PM (8+ years) to lead a portfolio of products.

Responsibilities:
• Own product strategy and roadmap across multiple squads
• Hire, manage, and develop a team of PMs
• Partner with C-suite on company-level strategy and bets
• Define success metrics and drive accountability across teams

Requirements:
• 8+ years product experience, 3+ managing PMs
• Deep understanding of the competitive landscape and user needs
• Proven track record shipping products used by millions
• Exceptional leadership, communication, and organisational skills`,

    // ─── UX DESIGNER ─────────────────────────────────────────────────────────
    'ux-designer-fresher': `We are looking for a fresher UX Designer (0–1 years) passionate about user-centred design.

Responsibilities:
• Assist in creating wireframes, mockups, and prototypes in Figma
• Support user research sessions and help synthesise findings
• Contribute to the design system with guidance from senior designers
• Iterate on designs based on stakeholder and user feedback

Requirements:
• Degree in Design, HCI, or related field (or equivalent portfolio)
• Proficiency in Figma
• Understanding of UX fundamentals and user-centred design principles
• Strong visual communication skills`,

    'ux-designer-mid': `We need a UX Designer (2–4 years) obsessed with creating elegant, user-centred experiences.

Responsibilities:
• Conduct user research, usability testing, and synthesis
• Create wireframes, prototypes, and high-fidelity designs in Figma
• Collaborate with engineers to ensure pixel-perfect implementation
• Define and evolve the design system

Requirements:
• 2–4 years UX/product design experience
• Expert Figma skills with a strong portfolio
• Experience running usability studies
• Understanding of accessibility standards (WCAG 2.1)`,

    'ux-designer-senior': `We are hiring a Senior UX Designer (5+ years) to lead design for a product area.

Responsibilities:
• Own end-to-end design for complex product features
• Lead design sprints, research planning, and concept exploration
• Establish UX standards and review designs across the team
• Mentor junior designers and shape team design culture

Requirements:
• 5+ years UX / product design experience
• Expert research, interaction design, and visual design skills
• Experience driving design strategy aligned with business goals
• Strong cross-functional collaboration with PM and engineering`,

    'ux-designer-lead': `We are hiring a Design Lead / Head of Design (8+ years) to own design vision across the platform.

Responsibilities:
• Define design strategy, principles, and visual language for the product
• Hire, lead, and develop a team of UX and visual designers
• Partner with product and engineering leadership on roadmap and vision
• Champion user advocacy at every level of the organisation

Requirements:
• 8+ years design experience, 3+ managing designers
• Exceptional portfolio demonstrating product impact at scale
• Strong leadership, communication, and stakeholder management
• Experience building and scaling design systems`,
};

export const ROLE_GROUPS = [
    {
        label: 'Software Engineering',
        options: [
            { value: 'software-engineer-fresher', label: 'Software Engineer — Fresher (0-1 yrs)' },
            { value: 'software-engineer-mid', label: 'Software Engineer — Mid (2-4 yrs)' },
            { value: 'software-engineer-senior', label: 'Software Engineer — Senior (5+ yrs)' },
            { value: 'software-engineer-lead', label: 'Engineering Lead (7+ yrs)' },
        ],
    },
    {
        label: 'Frontend Engineering',
        options: [
            { value: 'frontend-engineer-fresher', label: 'Frontend Engineer — Fresher (0-1 yrs)' },
            { value: 'frontend-engineer-mid', label: 'Frontend Engineer — Mid (2-4 yrs)' },
            { value: 'frontend-engineer-senior', label: 'Frontend Engineer — Senior (5+ yrs)' },
            { value: 'frontend-engineer-lead', label: 'Frontend Lead (7+ yrs)' },
        ],
    },
    {
        label: 'Backend Engineering',
        options: [
            { value: 'backend-engineer-fresher', label: 'Backend Engineer — Fresher (0-1 yrs)' },
            { value: 'backend-engineer-mid', label: 'Backend Engineer — Mid (2-4 yrs)' },
            { value: 'backend-engineer-senior', label: 'Backend Engineer — Senior (5+ yrs)' },
            { value: 'backend-engineer-lead', label: 'Backend Lead (7+ yrs)' },
        ],
    },
    {
        label: 'Full Stack Engineering',
        options: [
            { value: 'fullstack-engineer-fresher', label: 'Full Stack Engineer — Fresher (0-1 yrs)' },
            { value: 'fullstack-engineer-mid', label: 'Full Stack Engineer — Mid (2-4 yrs)' },
            { value: 'fullstack-engineer-senior', label: 'Full Stack Engineer — Senior (5+ yrs)' },
        ],
    },
    {
        label: 'DevOps / Platform',
        options: [
            { value: 'devops-engineer-mid', label: 'DevOps Engineer — Mid (2-4 yrs)' },
            { value: 'devops-engineer-senior', label: 'DevOps Engineer — Senior (5+ yrs)' },
            { value: 'devops-engineer-lead', label: 'Platform / DevOps Lead (7+ yrs)' },
        ],
    },
    {
        label: 'ML Engineering',
        options: [
            { value: 'ml-engineer-fresher', label: 'ML Engineer — Fresher (0-1 yrs)' },
            { value: 'ml-engineer-mid', label: 'ML Engineer — Mid (2-4 yrs)' },
            { value: 'ml-engineer-senior', label: 'ML Engineer — Senior (5+ yrs)' },
        ],
    },
    {
        label: 'Data Engineering',
        options: [
            { value: 'data-engineer-mid', label: 'Data Engineer — Mid (2-4 yrs)' },
            { value: 'data-engineer-senior', label: 'Data Engineer — Senior (5+ yrs)' },
        ],
    },
    {
        label: 'Data & Analytics',
        options: [
            { value: 'data-analyst-fresher', label: 'Data Analyst — Fresher (0-1 yrs)' },
            { value: 'data-analyst-mid', label: 'Data Analyst — Mid (2-4 yrs)' },
            { value: 'data-analyst-senior', label: 'Data Analyst — Senior (5+ yrs)' },
        ],
    },
    {
        label: 'Data Science',
        options: [
            { value: 'data-scientist-fresher', label: 'Data Scientist — Fresher (0-1 yrs)' },
            { value: 'data-scientist-mid', label: 'Data Scientist — Mid (2-4 yrs)' },
            { value: 'data-scientist-senior', label: 'Data Scientist — Senior (5+ yrs)' },
        ],
    },
    {
        label: 'AI Research',
        options: [
            { value: 'ai-researcher', label: 'AI / ML Researcher' },
        ],
    },
    {
        label: 'Product Management',
        options: [
            { value: 'product-manager-fresher', label: 'Associate PM — Fresher (0-1 yrs)' },
            { value: 'product-manager-mid', label: 'Product Manager — Mid (2-4 yrs)' },
            { value: 'product-manager-senior', label: 'Senior PM (5+ yrs)' },
            { value: 'product-manager-lead', label: 'Director / Group PM (8+ yrs)' },
        ],
    },
    {
        label: 'UX Design',
        options: [
            { value: 'ux-designer-fresher', label: 'UX Designer — Fresher (0-1 yrs)' },
            { value: 'ux-designer-mid', label: 'UX Designer — Mid (2-4 yrs)' },
            { value: 'ux-designer-senior', label: 'Senior UX Designer (5+ yrs)' },
            { value: 'ux-designer-lead', label: 'Design Lead / Head of Design (8+ yrs)' },
        ],
    },
];