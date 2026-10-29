from typing import Dict, Optional, Tuple, List
from app.utils.logging_config import logger

# Canonical 12 Municipal Departments
VALID_DEPARTMENTS: List[str] = [
    "Roads and Highways",
    "Water Supply",
    "Electricity",
    "Sanitation",
    "Drainage and Sewerage",
    "Public Health",
    "Municipal Administration",
    "Transport",
    "Parks and Recreation",
    "Environment",
    "Street Lighting",
    "Animal Control"
]

# Mapping from visual object / issue classes to Department & Human Description
TAXONOMY_MAPPING: Dict[str, Tuple[str, str]] = {
    # Roads and Highways
    "pothole": ("Roads and Highways", "Visible pothole in road surface"),
    "damaged_road": ("Roads and Highways", "Visible road surface damage or erosion"),
    "alligator crack": ("Roads and Highways", "Severe structural road cracking"),
    "transverse crack": ("Roads and Highways", "Perpendicular road fissure"),
    "longitudinal crack": ("Roads and Highways", "Parallel longitudinal road fracture"),
    "other corruption": ("Roads and Highways", "Asphalt deterioration or pavement depression"),
    "road_crack": ("Roads and Highways", "Fractured road asphalt pavement"),

    # Sanitation
    "garbage": ("Sanitation", "Accumulated or dumped roadside refuse"),
    "garbage_pile": ("Sanitation", "Accumulated roadside garbage dump"),
    "overflowing_garbage": ("Sanitation", "Waste overflowing from bin or designated point"),
    "litter": ("Sanitation", "Scattered street debris and refuse"),
    "trash": ("Sanitation", "Uncollected garbage"),
    "waste": ("Sanitation", "Commercial or municipal solid waste accumulation"),
    "plastic": ("Sanitation", "Discarded plastic street waste"),
    "paper": ("Sanitation", "Discarded paper waste"),
    "metal": ("Sanitation", "Discarded scrap metal debris"),
    "biodegradable": ("Sanitation", "Accumulated organic or perishable waste"),

    # Water Supply
    "water_leakage": ("Water Supply", "Visible potable water leakage from pipe or hydrant"),
    "pipe_burst": ("Water Supply", "High-volume water pipeline rupture"),
    "broken_pipe": ("Water Supply", "Fractured municipal distribution line"),

    # Drainage and Sewerage
    "sewage_overflow": ("Drainage and Sewerage", "Untreated sewage overflowing onto public roadway"),
    "open_manhole": ("Drainage and Sewerage", "Uncovered manhole causing imminent safety hazard"),
    "clogged_drain": ("Drainage and Sewerage", "Blockage in stormwater drain causing flooding"),

    # Electricity
    "damaged_electric_pole": ("Electricity", "Leaning or fractured electric utility pole"),
    "damaged_power_line": ("Electricity", "Dangling or fallen electrical transmission cable"),
    "exposed_wiring": ("Electricity", "Hazardous exposed electrical wires"),
    "damaged_transformer": ("Electricity", "Visibly damaged public distribution transformer"),

    # Street Lighting
    "damaged_streetlight": ("Street Lighting", "Broken or non-functioning street luminaire"),
    "broken_lamp": ("Street Lighting", "Damaged municipal sodium or LED street fixture"),

    # Animal Control
    "stray_animal": ("Animal Control", "Stray animal obstructing public thoroughfare"),
    "dog": ("Animal Control", "Stray dog pack in public thoroughfare"),
    "cow": ("Animal Control", "Stray cattle causing road obstruction"),
    "horse": ("Animal Control", "Stray livestock on public road"),

    # Parks and Recreation
    "damaged_park_equipment": ("Parks and Recreation", "Damaged playground equipment or park fixture"),
    "broken_bench": ("Parks and Recreation", "Damaged public bench in recreation ground"),

    # Environment
    "fallen_tree": ("Environment", "Uprooted or fallen tree blocking civic area"),
    "illegal_dumping": ("Environment", "Hazardous environmental chemical or industrial dumping"),

    # Transport
    "damaged_bus_shelter": ("Transport", "Damaged public transit bus stop canopy"),
    "broken_traffic_sign": ("Transport", "Broken or missing street traffic guidance sign")
}

def map_issue_to_department(class_name: str) -> Tuple[str, str]:
    """
    Returns (department_name, visual_issue_description).
    If unknown or ambiguous, defaults to 'Municipal Administration' with an explanatory note.
    """
    normalized_name = class_name.strip().lower()
    
    if normalized_name in TAXONOMY_MAPPING:
        return TAXONOMY_MAPPING[normalized_name]
    
    # Fuzzy matching for common substrings
    if "pothole" in normalized_name or "crack" in normalized_name or "road" in normalized_name:
        return ("Roads and Highways", f"Road damage anomaly ({class_name})")
    if "garbage" in normalized_name or "trash" in normalized_name or "waste" in normalized_name:
        return ("Sanitation", f"Sanitation anomaly ({class_name})")
    if "water" in normalized_name or "leak" in normalized_name:
        return ("Water Supply", f"Water infrastructure issue ({class_name})")
    if "sewage" in normalized_name or "manhole" in normalized_name or "drain" in normalized_name:
        return ("Drainage and Sewerage", f"Drainage or sewerage issue ({class_name})")
    if "wire" in normalized_name or "electric" in normalized_name or "pole" in normalized_name:
        return ("Electricity", f"Electrical infrastructure damage ({class_name})")
    if "light" in normalized_name or "lamp" in normalized_name:
        return ("Street Lighting", f"Street lighting fault ({class_name})")
    if "animal" in normalized_name or "dog" in normalized_name or "cattle" in normalized_name:
        return ("Animal Control", f"Civic animal hazard ({class_name})")

    logger.warning("Unmapped visual detection class '%s'. Using fallback human-review mapping.", class_name)
    return ("Municipal Administration", f"Unclassified civic observation: {class_name} (Requires manual review)")
