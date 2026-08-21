import re
import csv
from pathlib import Path

def clean_csv(file_path: Path):
    print(f"Cleaning CSV file: {file_path}")
    cleaned_rows = []
    
    with open(file_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    for idx, line in enumerate(lines):
        line = line.strip()
        if not line:
            continue
            
        # Skip header rows
        if "complaint,department_id,department_name" in line or "complaint\tdepartment_id\tdepartment_name" in line:
            continue
            
        # Parse based on format
        if "\t" in line:
            # Tab separated (lines 27+)
            parts = line.split("\t")
            if len(parts) == 4:
                # Format: [idx, complaint, dept_id, dept_name]
                complaint = parts[1].strip()
                dept_id = parts[2].strip()
                dept_name = parts[3].strip()
                cleaned_rows.append([complaint, dept_id, dept_name])
            elif len(parts) == 3:
                # Format: [complaint, dept_id, dept_name]
                complaint = parts[0].strip()
                dept_id = parts[1].strip()
                dept_name = parts[2].strip()
                cleaned_rows.append([complaint, dept_id, dept_name])
            else:
                print(f"Skipping line {idx+1} due to unexpected tab format: {line}")
        else:
            # Comma separated (lines 2-26)
            # Use regex to match the last two fields (digits and characters)
            match = re.match(r"^(.*),(\d+),([^,]+)$", line)
            if match:
                complaint = match.group(1).strip()
                dept_id = match.group(2).strip()
                dept_name = match.group(3).strip()
                cleaned_rows.append([complaint, dept_id, dept_name])
            else:
                # Fallback simple comma split if regex doesn't match
                parts = line.split(",")
                if len(parts) >= 3:
                    dept_name = parts[-1].strip()
                    dept_id = parts[-2].strip()
                    complaint = ",".join(parts[:-2]).strip()
                    cleaned_rows.append([complaint, dept_id, dept_name])
                else:
                    print(f"Skipping line {idx+1} due to unexpected comma format: {line}")

    # Write cleaned rows back as a standard RFC 4180 CSV
    with open(file_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f, quoting=csv.QUOTE_MINIMAL)
        writer.writerow(["complaint", "department_id", "department_name"])
        writer.writerows(cleaned_rows)
        
    print(f"Successfully cleaned and wrote {len(cleaned_rows)} rows to {file_path}")

if __name__ == "__main__":
    csv_file = Path(__file__).parent / "dataset" / "complaints.csv"
    clean_csv(csv_file)
