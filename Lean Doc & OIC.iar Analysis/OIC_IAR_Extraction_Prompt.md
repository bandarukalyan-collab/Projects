# OIC IAR Extraction Prompt

Extract a summary table for every `.iar` file in `Downloads\data` with the columns:

| S.No | Name | Version | Style | Status | Connections | Description | Frequency |

For each `.iar`:

1. Open the archive as a ZIP.
2. Read `icspackage/project/<name>/ics_project_attributes.properties` and parse:
   - `project_name` (fallback `project_code` or filename) → **Name**
   - `project_version` → normalize `01.00.0001` to `1.0.1` → **Version**
   - `project_persisted_state` → `ACTIVATED` becomes `Active` → **Status**
   - `smartTags` / `modelType` → **Style**
3. Read `icspackage/project/<name>/PROJECT-INF/project.xml` and extract `<projectDescription>` → **Description**
4. Determine **Style** correctly:
   - If `icspackage/schedule/*.xml` exists → **Scheduled**
   - Else if `smartTags` contains `app driven orchestration` → **Application**
   - Else use `modelType`
5. If scheduled, parse `icspackage/schedule/*.xml`:
   - Read `<frequency>`, `<interval>`, `<start>`, and `<time-zone>`
   - Example mapping: `DAILY` at `18:00 UTC` → `Every Day - 11:30 PM IST` (UTC +5:30)
6. Extract connections from `icspackage/appinstances/*.xml` using `<displayName>`.

Return the result as a markdown table sorted alphabetically by filename.
