#!/usr/bin/env python3
import pandas as pd
import sys
import json
import numpy as np
import re

# Load the Parquet dataset
df = pd.read_parquet("./src/data/df_arabica_clean.parquet")

# Define parameters for radar chart
radar_parameters = [
    "Aroma",
    "Flavor",
    "Aftertaste",
    "Acidity",
    "Body",
    "Balance",
    "Uniformity",
    "Clean Cup",
    "Sweetness",
]

# Extract all relevant columns for use in all visualizations
# Include original radar parameters plus other fields needed for quality charts and map
all_columns = radar_parameters + [
    "Country of Origin",
    "Total Cup Points",
    "Overall",
    "Altitude",
    "Number of Bags",
    "Bag Weight",
    "Moisture Percentage",
    "Category One Defects",
    "Quakers",
    "Category Two Defects",
    "Grading Date",
    "Processing Method",
    "Variety",
    "Color",
]

# Keep only columns that exist in the dataframe
columns_to_use = [col for col in all_columns if col in df.columns]

# Process the Bag Weight field to extract numeric values in kg
if "Bag Weight" in df.columns:

    def extract_bag_weight(weight_str):
        if pd.isna(weight_str) or weight_str is None:
            return None

        # Convert to string if it's not already
        weight_str = str(weight_str).strip().lower()

        # Extract numeric value
        match = re.search(r"(\d+\.?\d*)", weight_str)
        if not match:
            return None

        weight = float(match.group(1))

        # Convert to kg if in pounds
        if "lb" in weight_str or "lbs" in weight_str:
            weight = weight * 0.453592  # Convert lbs to kg

        return round(weight, 2)

    df["Bag Weight"] = df["Bag Weight"].apply(extract_bag_weight)

# Make sure all numeric columns are properly parsed
numeric_columns = [
    "Total Cup Points",
    "Aroma",
    "Flavor",
    "Aftertaste",
    "Acidity",
    "Body",
    "Balance",
    "Uniformity",
    "Clean Cup",
    "Sweetness",
    "Overall",
    "Altitude",
    "Number of Bags",
    "Bag Weight",
    "Moisture Percentage",
    "Category One Defects",
    "Quakers",
    "Category Two Defects",
]

for col in numeric_columns:
    if col in df.columns:
        df[col] = pd.to_numeric(df[col], errors="coerce")

# Create radar chart data (country means)
mean_df = df.groupby("Country of Origin")[radar_parameters].mean().reset_index()

# Insert the mean of all countries with country name "Mean"
country_means_avg = mean_df[radar_parameters].mean()
mean_df.loc[-1] = country_means_avg
mean_df.at[-1, "Country of Origin"] = "Mean"
mean_df.index = mean_df.index + 1  # Shift index
mean_df = mean_df.sort_index()  # Sort by index

# Get sample counts per country
counts = df.groupby("Country of Origin").size().reset_index(name="count")

# Add counts to means dataframe
mean_df = mean_df.merge(counts, on="Country of Origin", how="left")

# Replace NaN with 0 for count - Fix for JSON serialization error
mean_df["count"] = mean_df["count"].fillna(0).astype(int)

# Order by counts (with Mean at the top)
mean_row = mean_df[mean_df["Country of Origin"] == "Mean"]
others = mean_df[mean_df["Country of Origin"] != "Mean"]
others = others.sort_values(by="Country of Origin", ascending=True)
radar_df = pd.concat([mean_row, others], ignore_index=True)

# Generate complete dataset with all samples and all fields
all_data = df[columns_to_use].copy()

# Add count info to help with visualization
all_data = all_data.merge(counts, on="Country of Origin", how="left")
all_data["count"] = (
    all_data["count"].fillna(0).astype(int)
)  # Fix for JSON serialization

# Round numeric columns to 2 decimal places for cleaner JSON
numeric_cols = all_data.select_dtypes(include=["float64"]).columns
all_data[numeric_cols] = all_data[numeric_cols].round(2)

# Replace all remaining NaN values with None (which becomes null in JSON)
all_data = all_data.replace({np.nan: None})
radar_df = radar_df.replace({np.nan: None})

# Generate the final data structure
output = {
    "radar_data": radar_df.to_dict(orient="records"),
    "full_data": all_data.to_dict(orient="records"),
}

# Output JSON to stdout
json.dump(output, sys.stdout)
