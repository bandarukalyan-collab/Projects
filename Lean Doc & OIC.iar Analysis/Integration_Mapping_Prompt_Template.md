# Prompt: Generate a Clean Integration Mapping Document

## Objective
Create a concise, manager-ready Integration Mapping Document for **[INTERFACE_ID]**: moving data from **[SOURCE_SYSTEM]** to **[TARGET_SYSTEM]** by aligning the **Technical Lean Specification** with the actual **OIC `.iar` implementation**.

## Inputs I will provide
- Technical Lean Specification (DOCX/PDF)
- Extracted OIC `.iar` folder path: `.../[IAR_EXTRACTED_FOLDER]/`
- Architecture diagram image: `[ARCHITECTURE_IMAGE_FILENAME].png`
- Integration pattern / middleware details (e.g., FBDI, SOAP, REST, ATP DB)

## Required deliverables
1. `[INTERFACE_ID]_Summary.md` and `.docx`
2. `[INTERFACE_ID]_Manager_Summary.md` and `.docx`

## Structure for `[INTERFACE_ID]_Summary`
1. **Title** — `[INTERFACE_ID]: [Source] to [Target] — IAR Implementation`
2. **Interface Overview** — table with Interface ID, Source, Target, Pattern, Middleware, Database, Trigger, Business Driver
3. **Lean Specification Requirements** — short numbered list of business steps
4. **High-Level Architecture** — logical data flow, key design points, embedded architecture diagram, sequence flow
5. **End-to-End Process Steps** — table: Step | Spec Intent | .iar Component(s) | Connection / System | SQL / Notes
6. **Key Tables and Stage Files**
7. **Connections Summary**
8. **Important Variables**
9. **Error Handling Matrix**
10. **Notes**
11. **Key Terms** (lightweight glossary)

## SQL formatting rules
- Extract SQL from every `.jca` file.
- Shorten long `SELECT` queries in the E2E table to: `SELECT <<columns>> FROM <table> WHERE ...`
- Do **not** list hundreds of columns inline.
- Keep `UPDATE` / `INSERT` / `COUNT` queries as-is unless they exceed ~120 characters; then shorten similarly.
- Use a consistent SQL case style.

## General formatting rules
- Keep the document concise; avoid verbose column listings, sample file layouts, and appendices unless explicitly asked.
- Use Markdown with clear tables and headings.
- Embed the architecture diagram in the DOCX.
- Generate both `.md` and `.docx` versions.
- Do not modify production systems — this is documentation only.

## Manager Summary format (one page or less)
- **Objective**
- **Activities Completed** (5-6 crisp bullets)
- **Outcome**
- **Next Steps / Actions**
