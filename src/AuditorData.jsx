// auditorData.js
export const AuditorData = [
    {
        "parentControl": "Organizational controls",
        "controlName": "5.1 Policies for information security",
        "keyPoints": [
            "Define an organization-wide information security policy approved by top management.",
            "Consider requirements derived from:\n  - Business strategy.\n  - Regulations and legislation.\n  - Contracts.\n  - Information security risks and threats.",
            "Include statements on:\n  - Definition of information security.\n  - Information security objectives or framework for setting objectives.\n  - Principles guiding information security activities.\n  - Commitment to meet applicable information security requirements.\n  - Commitment to continual improvement of the information security management system.\n  - Assignment of responsibilities for information security management.\n  - Procedures for handling exemptions and exceptions.",
            "Ensure top management approves changes to the information security policy.",
            "Support the policy with topic-specific policies addressing specific needs or security areas, such as:\n  - Access control.\n  - Physical and environmental security.\n  - Asset management.\n  - Information transfer.\n  - Secure configuration and handling of user endpoint devices.\n  - Networking security.\n  - Information security incident management.\n  - Backup.\n  - Cryptography and key management.\n  - Information classification and handling.\n  - Management of technical vulnerabilities.\n  - Secure development.",
            "Allocate responsibility for development, review, and approval of policies to personnel with appropriate authority and technical competency.",
            "Review policies considering:\n  - Business strategy.\n  - Technical environment.\n  - Regulations.\n  - Risks and threats.\n  - Lessons learned from incidents.",
            "Ensure policies are consistent across the organization and update related policies as needed.",
            "Communicate policies to relevant personnel and interested parties in accessible and understandable formats.",
            "Require recipients to acknowledge understanding and agreement to comply with policies.",
            "Consider combining the information security policy and topic-specific policies in a single document if appropriate.",
            "Ensure external distribution of policies does not disclose confidential information improperly."
        ]
    },


    {
        "parentControl": "Organizational controls",
        "controlName": "5.2 Information security roles and responsibilities",
        "keyPoints": [
            "Allocate information security roles and responsibilities in line with the information security policy and topic-specific policies.",
            "Define and manage responsibilities for:\n  - Protecting information and associated assets.\n  - Executing specific information security processes.\n  - Managing information security risks, including acceptance of residual risks by risk owners.\n  - Ensuring all personnel use the organization's information and assets responsibly.",
            "Supplement responsibilities with detailed guidance for specific sites and processing facilities, as needed.",
            "Individuals with allocated responsibilities can delegate tasks but remain accountable for ensuring delegated tasks are correctly performed.",
            "Clearly define, document, and communicate each security area and responsibilities.",
            "Define and document authorization levels.",
            "Ensure individuals in specific information security roles are competent and supported to stay updated on role-specific developments.",
            "Additional Notes:\n  - Organizations often appoint an information security manager for overall responsibility of information security implementation and risk management.\n  - Responsibility for implementing controls may lie with individual managers.\n  - Asset owners are commonly designated to manage the day-to-day protection of specific assets.\n  - Information security can be managed by dedicated roles or integrated into existing roles, depending on organizational size and resources."
        ]
    }
,
    {
        "parentControl": "Organizational controls",
        "controlName": "5.3 Segregation of duties",
        "keyPoints": [
            "Segregation of duties aims to separate conflicting duties to prevent one individual from executing them independently.",
            "The organization should identify duties and areas of responsibility that require segregation.",
            "Examples of activities requiring segregation include:\n  - Initiating, approving, and executing changes.\n  - Requesting, approving, and implementing access rights.\n  - Designing, implementing, and reviewing code.\n  - Developing software and administering production systems.\n  - Using and administering applications.\n  - Using applications and administering databases.\n  - Designing, auditing, and assuring information security controls.",
            "Consider the possibility of collusion when designing segregation controls.",
            "In small organizations where segregation is challenging, apply alternative controls like:\n  - Monitoring activities.\n  - Maintaining detailed audit trails.\n  - Supervising management activities.",
            "Role-based access control systems should avoid granting conflicting roles.",
            "For large role structures, use automated tools to identify and remove role conflicts.",
            "Define and provision roles carefully to avoid access problems when roles are removed or reassigned."
        ]
    }
,
    {
        "parentControl": "People controls",
        "controlName": "6.1 Screening",
        "keyPoints": [
            "A screening process should be performed for all personnel including full-time, part-time, and temporary staff.",
            "Where individuals are contracted through service suppliers, screening requirements should be included in the contractual agreements between the organization and the suppliers.",
            "Information on all candidates being considered for positions within the organization should be collected and handled taking into consideration any appropriate legislation in the relevant jurisdiction.",
            "In some jurisdictions, the organization may be legally required to inform candidates beforehand about the screening activities.",
            "Verification should take into consideration all relevant privacy, PII protection, and employment-based legislation and should, where permitted, include the following:\n  - Availability of satisfactory references (e.g., business and personal references).\n  - A verification (for completeness and accuracy) of the applicant’s curriculum vitae (CV).\n  - Confirmation of claimed academic and professional qualifications.\n  - Independent identity verification (e.g., passport or other acceptable document issued by appropriate authorities).\n  - More detailed verification, such as credit reviews or reviews of criminal records, if the candidate takes on a critical role.",
            "When an individual is hired for a specific information security role, the organization should ensure the candidate:\n  - Has the necessary competence to perform the security role.\n  - Can be trusted to take on the role, especially if the role is critical for the organization.\n  - Where a job involves access to information processing facilities and handling confidential information, the organization should consider more detailed verifications.",
            "Procedures should define criteria and limitations for verification reviews, including:\n  - Eligibility to screen individuals.\n  - How, when, and why verification reviews are conducted.",
            "If verification cannot be completed in a timely manner, mitigating controls should be implemented until the review is complete, such as:\n  - Delayed onboarding.\n  - Delayed deployment of corporate assets.\n  - Onboarding with reduced access.\n  - Termination of employment.",
            "Verification checks should be repeated periodically to confirm the ongoing suitability of personnel.",
            "Frequency depends on the criticality of the role."
        ]
    }
,
    {
        "parentControl": "People controls",
        "controlName": "6.2 Terms and conditions of employment",
        "keyPoints": [
            "The contractual obligations for personnel should consider the organization's information security policy and relevant topic-specific policies.",
            "Key points to clarify and include in contractual obligations:\n  - Confidentiality or non-disclosure agreements that personnel must sign before being given access to information and assets (see 6.6).\n  - Legal responsibilities and rights, such as those concerning copyright laws or data protection legislation (see 5.32 and 5.34).\n  - Responsibilities for the classification and management of the organization's information, associated assets, information processing facilities, and information services handled by personnel (see 5.9 to 5.13).\n  - Responsibilities for handling information received from interested parties.\n  - Actions to be taken if personnel disregard the organization's security requirements (see 6.4).",
            "Information security roles and responsibilities should be communicated to candidates during the pre-employment process.",
            "The organization should ensure that personnel agree to terms and conditions concerning information security, appropriate to the nature and extent of their access to organizational assets.",
            "Terms and conditions concerning information security should be reviewed when laws, regulations, or organizational policies change.",
            "Where appropriate, the responsibilities contained in the employment terms and conditions should continue for a defined period after employment ends (see 6.5).",
            "Other considerations include:\n  - Using a code of conduct to state personnel responsibilities regarding confidentiality, PII protection, ethics, appropriate use of assets, and reputable practices.\n  - Ensuring external parties, such as suppliers, enter into contractual agreements on behalf of their personnel.\n  - If the organization is not a legal entity, equivalent contractual agreements and terms can be considered in line with this guidance."
        ]
    },
    {
        "parentControl": "People controls",
        "controlName": "6.3 Information security awareness, education and training",
        "keyPoints": [
            "An information security awareness, education, and training programme should align with the organization's information security policy, topic-specific policies, and procedures.",
            "The programme should periodically address the organization's information to be protected and the implemented information security controls.",
            "Initial awareness, education, and training should be provided to new personnel and those transferring to roles with different information security requirements.",
            "Personnel's understanding should be assessed after training to ensure knowledge transfer and programme effectiveness.",
            "Awareness programme objectives:\n  - Make personnel aware of their responsibilities for information security.\n  - Tailor activities to the roles of internal and external personnel (e.g., consultants, suppliers).\n  - Schedule awareness activities regularly, incorporating lessons learned from incidents.\n  - Use diverse channels such as campaigns, newsletters, websites, briefings, and e-learning modules.",
            "Awareness topics should include:\n  - Management's commitment to information security.\n  - Familiarity with and compliance with information security policies, laws, and regulations.\n  - Personal accountability for securing organizational information.\n  - Basic security procedures (e.g., reporting security events, password security).\n  - Contact points and resources for information security advice.",
            "Education and training programme goals:\n  - Develop a training plan for technical teams requiring specific skills.\n  - Ensure technical personnel can configure and maintain security levels for devices, systems, and services.\n  - Address missing skills through training, mentoring, or hiring skilled professionals.\n  - Use diverse delivery methods, such as classroom-based, web-based, or on-the-job training.\n  - Encourage continuous learning through newsletters, conferences, and professional development events.",
            "Important considerations:\n  - Focus on the 'why' behind information security to emphasize its importance.\n  - Integrate information security training with other activities like general ICT or privacy training."
        ]
    }
,
    {
        "parentControl": "Physical controls",
        "controlName": "7.1 Physical security perimeters",
        "keyPoints": [
            "The following guidelines should be considered for physical security perimeters:\n  - Define security perimeters and their strength based on information security requirements related to assets within the perimeter.\n  - Ensure physically sound perimeters for buildings or sites containing information processing facilities, avoiding gaps or weak points.\n  - Exterior roofs, walls, ceilings, and floors should be solidly constructed, and external doors should have suitable control mechanisms (e.g., bars, alarms, locks).\n  - Doors and windows should be locked when unattended, and additional external protection should be considered for ground-level windows and ventilation points.\n  - Fire doors on a security perimeter should be alarmed, monitored, tested, and operate in a failsafe manner, providing the required resistance level per suitable standards.",
            "Physical protection can involve creating one or more physical barriers around the premises and information processing facilities.\n  - Secure areas can range from lockable offices to rooms surrounded by continuous physical security barriers.\n  - Additional barriers and perimeters may be necessary to control access between areas with different security requirements within the perimeter.",
            "Consider strengthening physical security measures during increased threat situations."
        ]
    }

,
    {
        "parentControl": "Physical controls",
        "controlName": "7.2 Physical entry",
        "keyPoints": [
            "General guidelines for controlling access points to avoid unauthorized entry:\n  - Restrict access to sites and buildings to authorized personnel only, managing access rights through provision, periodic review, updates, and revocation.\n  - Maintain and monitor physical or electronic access logs and protect sensitive authentication information.\n  - Implement processes and technical mechanisms, such as access cards, biometrics, or two-factor authentication, for access to areas where information is processed or stored. Double security doors can be considered for sensitive areas.\n  - Set up monitored reception areas to control physical access.\n  - Inspect and examine personal belongings of personnel and visitors upon entry and exit, where permissible by law.\n  - Require personnel and visitors to wear visible identification and report unescorted individuals without identification.\n  - Grant restricted access to supplier personnel for secure areas or information processing facilities only when required, ensuring authorization and monitoring.\n  - Pay special attention to physical security in multi-tenant buildings.\n  - Design physical security measures to be adaptable to increased threat levels.\n  - Secure emergency exits and other entry points against unauthorized access.\n  - Set up a key management process, including logging or annual audits, and controlling access to physical keys or authentication information.",
            "Visitor-specific guidelines:\n  - Authenticate the identity of visitors using appropriate methods.\n  - Record the date and time of visitor entry and departure.\n  - Grant access to visitors only for specific, authorized purposes with security and emergency procedure instructions.\n  - Supervise all visitors unless an explicit exception is granted.",
            "Guidelines for delivery and loading areas and incoming material:\n  - Restrict access to delivery and loading areas to identified and authorized personnel.\n  - Design delivery and loading areas to prevent delivery personnel from accessing other parts of the building.\n  - Secure external doors of delivery and loading areas when doors to restricted areas are opened.\n  - Inspect incoming deliveries for hazardous materials before moving them from delivery and loading areas.\n  - Register incoming deliveries in accordance with asset management procedures.\n  - Physically segregate incoming and outgoing shipments where possible.\n  - Inspect incoming deliveries for tampering and immediately report any incidents to security personnel."
        ]
    },
    {
        "parentControl": "Technological controls",
        "controlName": "8.1 User endpoint devices",
        "keyPoints": [
            "The organization should establish a topic-specific policy on secure configuration and handling of user endpoint devices, considering:\n  - The type and classification of information that devices can handle, process, store, or support.\n  - Registration of user endpoint devices.\n  - Requirements for physical protection.\n  - Restrictions on software installation (e.g., controlled remotely by system administrators).\n  - Requirements for software versions and updates (e.g., active automatic updating).\n  - Rules for network connections, including the use of personal firewalls.\n  - Access controls, storage encryption, and malware protection.\n  - Remote disabling, deletion, or lockout features.\n  - Backup procedures and web application usage guidelines.\n  - End user behavior analytics and the management of removable devices and ports.\n  - Use of device partitioning to securely separate organizational and personal data.",
            "For sensitive information, technical safeguards can be enforced (e.g., disabling downloads for offline working or local storage).",
            "User responsibility:\n  - Log off active sessions and terminate unused services.\n  - Protect devices from unauthorized access with physical and logical controls.\n  - Avoid leaving sensitive devices unattended and use privacy measures in public areas.\n  - Protect devices from theft, especially in public or unprotected spaces.\n  - Establish procedures for reporting theft or loss, considering legal and regulatory requirements.",
            "Use of personal devices (BYOD):\n  - Separate personal and business use of devices using appropriate software.\n  - Provide business access after users acknowledge responsibilities (e.g., physical protection, updates) and allow remote wiping of business data.\n  - Consider intellectual property and access rights when using personal devices.\n  - Address software licensing obligations for personal device usage.",
            "Wireless connections:\n  - Configure wireless connections securely (e.g., disabling vulnerable protocols).\n  - Use appropriate bandwidth for tasks like backups and updates.",
            "Other considerations:\n  - Controls for endpoint devices vary based on their location and exposure to threats.\n  - Address backup challenges caused by limited network bandwidth or timing issues.\n  - Recognize hardware limitations (e.g., USB-C ports used for power or displays) when disabling ports."
        ]
    }
,
    {
        "parentControl": "Technological controls",
        "controlName": "8.2 Privileged access rights",
        "keyPoints": [
            "Control the allocation of privileged access rights through an authorization process aligned with the access control policy.",
            "Identify users who need privileged access rights for specific systems or processes (e.g., operating systems, databases, applications).",
            "Allocate privileged access rights on a need basis, event-by-event, to individuals with the necessary competence and minimum requirements for their functional roles.",
            "Maintain an authorization process to approve privileged access rights and record all allocated privileges.",
            "Define and implement requirements for the expiration of privileged access rights.",
            "Ensure users are aware of their privileged access rights and when they are in privileged access mode (e.g., specific user identities or interface settings).",
            "Set higher authentication requirements for privileged access rights, such as re-authentication or authentication step-up for certain tasks.",
            "Regularly review privileged access rights, especially after organizational changes, to verify if roles and responsibilities still qualify users.",
            "Avoid using generic administration user IDs (e.g., 'root'), and protect authentication information for such identities.",
            "Grant temporary privileged access only for specific time windows required for approved changes or critical activities, using methods like break-glass procedures.",
            "Log all privileged access to systems for audit purposes.",
            "Avoid sharing or linking privileged identities among multiple persons; assign separate identities with specific privileged access rights.",
            "Use privileged identities solely for administrative tasks and maintain separate identities for general day-to-day activities.",
            "Privileged access rights are critical and should be managed securely to prevent misuse or breaches, as they allow overriding of system controls.",
            "Consider using privilege access management technologies to automate the allocation and monitoring of privileged access."
        ]
    }
,
];